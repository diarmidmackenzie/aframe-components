/* global AFRAME */
//
// connecting-line2 — the Line2-based connecting line component.
//
// Renders a wide, antialiased stroke (THREE.Line2 / LineGeometry /
// LineMaterial) between points on two entities, with:
//  - width control in px or world units,
//  - rich dash patterns (single dash/gap, or multi-element dash-dot/-dot-dot
//    via overlay decomposition),
//  - an optional solid tube (cylinder) rendered in addition to the line,
//  - the position-tracking / offset / length-adjustment / updateEvent
//    machinery lifted from the legacy connecting-line component.
//
// `three` is externalized to the page's global THREE by webpack; the deep
// `three/examples/jsm/lines/...` imports are bundled (resolved out of
// super-three). See webpack.config.js.
//
// THREE.js facts grounded against super-three 0.173.5
// (examples/jsm/lines/LineMaterial.js):
//  - dash shader discards where mod(dashScale*lineDistance + dashOffset,
//    dashSize + gapSize) > dashSize  => drawn where the mod < dashSize.
//  - LineSegments2.onBeforeRender(renderer) sets material.resolution from
//    renderer.getViewport().z/.w (device px). We override that hook (see
//    DESIGN-NOTES.md) and use getViewport() as the SINGLE basis for both
//    resolution and worldPerPixel.

import { BufferGeometry, BufferAttribute, Group, Line, LineBasicMaterial, Vector2, Vector3, Vector4 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { sanitiseDash, decomposeDash, getPeriod } from './dash-pattern.js';
import { worldPerPixel } from './line-math.js';

// ---------------------------------------------------------------------------
// Module-scoped scratch vectors (reused across calls to avoid per-frame
// allocation).
// ---------------------------------------------------------------------------
const _startVector = new Vector3();
const _endVector = new Vector3();
const _lineVector = new Vector3();
const _posVector = new Vector3();
const _deltaVector = new Vector3();
const _lineDirectionVector = new Vector3();
const _midpointWorld = new Vector3();
const _up = new Vector3(0, 1, 0);
// getViewport(target) calls target.copy(_viewport) where _viewport is a
// THREE.Vector4 — so the target must be a real Vector4. `three` is
// externalized, so this import costs nothing in the bundle.
const _viewport = new Vector4();

AFRAME.registerComponent('connecting-line2', {

  schema: {
    // Shared machinery (unchanged from the legacy component).
    start: { type: 'selector' },
    startOffset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    end: { type: 'selector' },
    endOffset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    color: { type: 'color', default: '#74BEC1' },
    opacity: { type: 'number', default: 1, min: 0, max: 1 },
    visible: { default: true },
    lengthAdjustment: { default: 'none', oneOf: ['none', 'scale', 'extend', 'absolute'] },
    lengthAdjustmentValue: { type: 'number' },
    updateEvent: { type: 'string', default: '' },

    // New / changed.
    width: { type: 'number', default: 1 },
    units: { default: 'px', oneOf: ['px', 'm'] },
    // A-Frame's stock `array` type splits on commas and yields an array of
    // STRINGS — which our numeric sanitiser rejects as non-finite. Parse to
    // numbers explicitly, and accept whitespace- OR comma-separated values
    // (matching the dat-gui array control) so `dash: 12 8` and `dash: 12, 8`
    // both work. Genuine garbage (e.g. `dash: 12 x`) yields NaN, which
    // sanitiseDash then catches and falls back to solid.
    dash: {
      default: [],
      parse: (value) => {
        if (Array.isArray(value)) return value.map(Number);
        if (typeof value !== 'string') return [];
        return value.split(/[\s,]+/).filter((s) => s.length > 0).map(Number);
      },
      stringify: (value) => (Array.isArray(value) ? value.join(' ') : '')
    },
    dashUnits: { default: 'auto', oneOf: ['auto', 'px', 'm'] },
    dashOffset: { type: 'number', default: 0 },
    tubeRadius: { type: 'number', default: 0 },
    segments: { type: 'number', default: 4 },
    shader: { type: 'string', default: 'flat' }
  },

  multiple: true,

  init() {
    // Group holding all overlay Line2s.
    this.overlayLineGroup = new Group();
    this.el.object3D.add(this.overlayLineGroup);

    // Single shared geometry — all render overlays reference it; never
    // per-overlay.
    this.lineGeometry = new LineGeometry();

    // overlays: [{ line: Line2, material: LineMaterial }]
    this.overlays = [];

    // Dedicated single invisible THREE.Line pick proxy. The visible stroke is N
    // render-only overlay Line2s; raycasting targets exactly ONE invisible
    // THREE.Line whose 2 vertices track the endpoints. THREE.Line.raycast is
    // built-in (no custom code), camera-independent, and uses
    // raycaster.params.Line.threshold (world units) as the pick band. See
    // createPickLine().
    this.pickLine = null;

    // The resolved overlay descriptors currently applied (for in-place mutation
    // when the overlay count is unchanged).
    this.overlayParams = [];

    // Tube cylinder (legacy width path) — created lazily.
    this.cylinder = null;

    // Endpoint guard — stored once on the component, not per-overlay.
    this._prevStart = new Vector3(NaN, NaN, NaN);
    this._prevEnd = new Vector3(NaN, NaN, NaN);
    this._degenerate = false;

    this.listenerData = { event: '', start: null, end: null };

    this.updateLinePosition = this.updateLinePosition.bind(this);
    this.onBeforeRender = this.onBeforeRender.bind(this);

    this.createPickLine();
  },

  // -------------------------------------------------------------------------
  // Pick proxy — the single raycast target: an invisible THREE.Line.
  // -------------------------------------------------------------------------

  // The setObject3D name for this instance's pick proxy. connecting-line2 is
  // `multiple: true`, so two instances on one entity would evict each other if
  // they shared a name — namespace it per instance via attrName.
  pickObjectName() {
    return 'clPick__' + this.attrName;
  },

  // Create the invisible single THREE.Line used for raycasting. Its 2 vertices
  // track the endpoints (kept in lockstep via updateLinePosition). Picking uses
  // the stock THREE.Line.raycast — no override — which needs no camera and no
  // resolution, and tests against raycaster.params.Line.threshold (world units,
  // camera-independent). Set that band via raycaster-thresholds ("line" prop).
  //
  // CRITICAL: the pick proxy is registered via this.el.setObject3D(name, ...),
  // NOT object3D.add(). A-Frame's raycaster builds its target set ONLY from
  // entities' object3DMap (objects registered via setObject3D) — an object
  // merely .add()'d to el.object3D is never tested. setObject3D also sets the
  // object's `.el` back-reference for us (so intersections survive A-Frame's
  // `if (intersection.object.el)` filter); no manual `.el =` needed.
  //
  // NOTE FOR CONSUMERS: registering the pick object makes the line raycastABLE,
  // but the host entity must also MATCH the raycaster's `objects` selector
  // (e.g. give it a `raycast-target` class) for any picking to occur. The
  // library exposes the pick object; the consumer makes the entity raycastable.
  // (Mirrors simple-draw's line-hover pattern.)
  createPickLine() {
    if (this.pickLine) return;
    // A 2-vertex BufferGeometry whose positions track the endpoints. Seeded to
    // the origin; updatePickGeometry() rewrites them on every endpoint move.
    const geometry = new BufferGeometry();
    geometry.setAttribute('position',
      new BufferAttribute(new Float32Array(6), 3));
    // Never rendered (line.visible = false), but THREE.Line requires a material.
    const material = new LineBasicMaterial();
    const pickLine = new Line(geometry, material);
    pickLine.visible = false;          // pick-only; never drawn.
    pickLine.userData.clPickLine = true;

    this.pickLine = pickLine;
    // Register via setObject3D (NOT object3D.add) so A-Frame's raycaster, which
    // builds its target set from object3DMap, actually tests this object.
    if (this.el) this.el.setObject3D(this.pickObjectName(), pickLine);
  },

  // Rewrite the pick proxy's 2 vertices from the current (local-space)
  // endpoints, keeping it in lockstep with the render line. Called wherever the
  // shared render geometry is repositioned.
  updatePickGeometry(start, end) {
    if (!this.pickLine) return;
    const position = this.pickLine.geometry.attributes.position;
    position.setXYZ(0, start.x, start.y, start.z);
    position.setXYZ(1, end.x, end.y, end.z);
    position.needsUpdate = true;
    // THREE.Line.raycast caches geometry.boundingSphere (computes it once, lazily)
    // and uses it as a broad-phase reject — it never re-derives it. Invalidate it
    // so moved endpoints are reflected; otherwise, after the first raycast, a line
    // whose endpoints have since moved is rejected at the sphere stage and goes
    // silently un-pickable. connecting-line tracks moving entities, so this fires
    // routinely, not as an edge case.
    this.pickLine.geometry.boundingSphere = null;
  },

  // Remove + dispose the pick proxy. It owns its own (2-vertex) geometry and
  // material — dispose both. Do NOT touch the shared Line2 lineGeometry (owned
  // and disposed elsewhere).
  disposePickLine() {
    if (!this.pickLine) return;
    // Mirror createPickLine's setObject3D registration. removeObject3D detaches
    // it from object3DMap (so the raycaster stops testing it) and clears `.el`.
    if (this.el) this.el.removeObject3D(this.pickObjectName());
    if (this.pickLine.geometry) this.pickLine.geometry.dispose();
    if (this.pickLine.material) this.pickLine.material.dispose();
    this.pickLine = null;
  },

  update(oldData) {
    const data = this.data;

    // Lazily (re)create geometry / group / overlays if a prior teardown
    // (A-Frame remove(), or an older destructive invalid path) disposed them.
    // This keeps a component that was torn down and re-updated rebuildable.
    this.ensureScaffold();

    if (!data.start || !data.end) {
      // Transient invalid endpoints (e.g. a selector that resolves only after
      // load, or a runtime start/end swap that briefly clears one end). Do NOT
      // dispose geometry/group (that's remove()'s job, the teardown hook) —
      // just hide everything and bail. A later valid update() rebuilds cleanly.
      this.hideAll();
      return;
    }

    // Everything dash-related lives behind this single call, so a reader who
    // doesn't care about dashes can skip straight past it.
    this.resolveDashOverlays();

    // Width / units / color / opacity / visibility on every overlay material.
    this.applyMaterialStyle();

    // Tube (legacy cylinder path), rendered in addition to the line.
    this.updateTube();

    // Re-bind listeners if updateEvent OR start/end entity changed.
    this.updateEventListeners();

    // Force a geometry refresh on the next position update (schema may have
    // changed endpoints/offsets/lengthAdjustment).
    this._prevStart.set(NaN, NaN, NaN);
    this._prevEnd.set(NaN, NaN, NaN);

    // Defer the initial position update until scene load completes.
    setTimeout(this.updateLinePosition);
  },

  // -------------------------------------------------------------------------
  // Dash resolution — the one entry point for all dash-pattern handling.
  // -------------------------------------------------------------------------

  // Resolve the schema `dash`/`dashOffset` into overlay descriptors and apply
  // them. Geometry repositioning happens later in updateLinePosition (deferred
  // from update()); that pass sets positions + computeLineDistances on the
  // shared geometry so every overlay anchors to fresh line distances.
  resolveDashOverlays() {
    const data = this.data;

    const sanitised = sanitiseDash(data.dash, this.attrName);
    const userDashOffset = Number.isFinite(data.dashOffset) ? data.dashOffset : 0;
    const newParams = decomposeDash(sanitised, userDashOffset);

    // Solid => one non-dashed overlay.
    const targetCount = newParams.length === 0 ? 1 : newParams.length;
    if (this.overlays.length !== targetCount) {
      this.rebuildOverlays(targetCount);
    }

    // Apply per-overlay dash params in place (no dispose, no shader recompile).
    this.applyOverlayParams(newParams);
    this.overlayParams = newParams;
  },

  // -------------------------------------------------------------------------
  // Scaffold (re)creation + non-destructive hide.
  // -------------------------------------------------------------------------

  // (Re)create group + shared geometry if a prior remove() disposed them.
  // Idempotent: a no-op on the normal path where init() already built them.
  ensureScaffold() {
    if (!this.overlayLineGroup) {
      this.overlayLineGroup = new Group();
      if (this.el && this.el.object3D) this.el.object3D.add(this.overlayLineGroup);
    }
    if (!this.lineGeometry) {
      this.lineGeometry = new LineGeometry();
      // Geometry was rebuilt — overlays (if any) reference a disposed
      // geometry, so force a clean overlay rebuild + reposition.
      this.overlays = [];
      this.overlayParams = [];
      this._prevStart.set(NaN, NaN, NaN);
      this._prevEnd.set(NaN, NaN, NaN);
    }
    // (Re)create the pick proxy if a prior remove() disposed it. The proxy owns
    // its own geometry (independent of the shared render geometry rebuilt
    // above), so it only needs recreating after a full teardown.
    if (!this.pickLine) {
      this.createPickLine();
    }
  },

  // Non-destructive "transient invalid" path: hide every overlay line and the
  // tube. Disposes nothing — a later valid update() un-hides via
  // applyMaterialStyle / updateTube.
  hideAll() {
    for (let i = 0; i < this.overlays.length; i++) {
      if (this.overlays[i].line) this.overlays[i].line.visible = false;
    }
    if (this.cylinder) {
      this.cylinder.setAttribute('visible', false);
    }
  },

  // -------------------------------------------------------------------------
  // Overlay lifecycle
  // -------------------------------------------------------------------------

  // Build exactly `count` overlay Line2s, disposing the previous set first.
  // Only called when the overlay COUNT changes (param-only changes mutate in
  // place via applyOverlayParams instead).
  rebuildOverlays(count) {
    // Dispose + remove every existing overlay.
    for (let i = 0; i < this.overlays.length; i++) {
      const o = this.overlays[i];
      this.overlayLineGroup.remove(o.line);
      if (o.material) o.material.dispose();
    }
    this.overlays = [];

    for (let i = 0; i < count; i++) {
      const material = new LineMaterial({
        // Always a dashed material — we never toggle the USE_DASH define (that
        // forces a shader recompile). The solid case is driven by params (a
        // single full-length dash), not by `dashed: false`.
        dashed: true,
        // Co-located overlays share one geometry; disable depthWrite so
        // overlapping dash runs don't z-fight.
        depthWrite: false,
        transparent: true
      });

      this.initResolutionUniform(material);

      const line = new Line2(this.lineGeometry, material);
      // Overlays are render-only. They're added via object3D.add (below), not
      // setObject3D, so A-Frame's raycaster — which builds its target set from
      // object3DMap — never tests them; raycasting targets the single pick proxy
      // (see createPickLine). No .raycast override is needed.
      // Override the stock LineSegments2 onBeforeRender so resolution and
      // dashScale share a single getViewport() basis (see DESIGN-NOTES.md).
      line.onBeforeRender = this.onBeforeRender;
      // Stash a back-reference so the shared hook can find this overlay's
      // material + descriptor.
      line.userData.clOverlayIndex = i;
      // Keep frustum culling ON — do not blanket-disable.
      this.overlayLineGroup.add(line);
      this.overlays.push({ line, material });
    }
  },

  // Apply the dash descriptors to the (already-correct-count) overlays in
  // place — no dispose, no shader recompile.
  applyOverlayParams(params) {
    if (params.length === 0) {
      // Solid: a dashed material with a huge dashSize and zero gap never
      // discards (mod(lineDistance) < dashSize always holds), so it draws as a
      // continuous solid line without flipping the USE_DASH define.
      const o = this.overlays[0];
      if (o) {
        o.material.dashSize = 1e9;
        o.material.gapSize = 0;
        o.material.dashOffset = 0;
      }
      return;
    }
    for (let i = 0; i < params.length; i++) {
      const o = this.overlays[i];
      if (!o) continue;
      o.material.dashSize = params[i].dashSize;
      o.material.gapSize = params[i].gapSize;
      o.material.dashOffset = params[i].dashOffset;
    }
  },

  // width/units/color/opacity/visible on every overlay material.
  applyMaterialStyle() {
    const data = this.data;
    const worldUnits = data.units === 'm';
    // width: 0 => hide the stroke entirely. Do NOT set linewidth:0 (that leaves
    // a sub-pixel antialiased sliver).
    const lineVisible = data.visible && data.width > 0;

    // Only a translucent line, or co-located overlays sharing geometry
    // (multi-element dash patterns), need alpha blending + depthWrite off. A
    // solid single line stays opaque + depth-writing, matching the legacy
    // THREE.Line it replaces (avoids sort/transparency artefacts).
    const needsBlend = data.opacity < 1 || this.overlays.length > 1;

    for (let i = 0; i < this.overlays.length; i++) {
      const m = this.overlays[i].material;
      m.color.set(data.color);
      // worldUnits toggles a #define in the LineMaterial shader, so it needs a
      // recompile — but ONLY when it actually changes. Plain uniform writes
      // (color/linewidth/opacity) need no needsUpdate.
      if (m.worldUnits !== worldUnits) {
        m.worldUnits = worldUnits;
        m.needsUpdate = true;
      }
      m.linewidth = data.width;
      m.opacity = data.opacity;
      m.transparent = needsBlend;
      m.depthWrite = !needsBlend;
      // visibility is also gated by the degenerate (zero-length) guard,
      // applied in updateLinePosition.
      this.overlays[i].line.visible = lineVisible && !this._degenerate;
    }
  },

  // -------------------------------------------------------------------------
  // Tube (legacy cylinder path), rendered IN ADDITION to the line.
  // -------------------------------------------------------------------------
  updateTube() {
    const data = this.data;
    if (data.tubeRadius > 0) {
      if (!this.cylinder) {
        this.cylinder = document.createElement('a-cylinder');
        this.el.appendChild(this.cylinder);
      }
      this.cylinder.setAttribute('radius', data.tubeRadius);
      this.cylinder.setAttribute('segments-radial', data.segments);
      this.cylinder.setAttribute('segments-height', 1);
      this.cylinder.setAttribute('material', {
        shader: data.shader,
        color: data.color,
        opacity: data.opacity,
        visible: data.visible
      });
    } else if (this.cylinder) {
      this.el.removeChild(this.cylinder);
      this.cylinder = null;
    }
  },

  // -------------------------------------------------------------------------
  // Per-render sync — OVERRIDES Line2's stock onBeforeRender so resolution and
  // dashScale share a single renderer.getViewport() basis (device px). See
  // DESIGN-NOTES.md for why per-render-pass resolution sync is required.
  // -------------------------------------------------------------------------
  onBeforeRender(renderer, scene, camera, geometry, material /*, group */) {
    if (!material || !material.uniforms || !material.uniforms.resolution) return;

    renderer.getViewport(_viewport);
    const viewportWidthPx = _viewport.z;
    const viewportHeightPx = _viewport.w;

    // resolution sync (always, from the single getViewport basis).
    if (viewportHeightPx > 0 && viewportWidthPx > 0) {
      material.uniforms.resolution.value.set(viewportWidthPx, viewportHeightPx);
    }

    // The solid case (no overlay params) renders via the dashSize:1e9 solid
    // trick — there is no real period to scale, so skip the worldPerPixel /
    // dashScale computation entirely. dashScale:1 keeps the huge dashSize huge
    // (never discards).
    if (!this.overlayParams || this.overlayParams.length === 0) {
      material.dashScale = 1;
      return;
    }

    // Resolve dashUnits -> dashScale, recomputed every frame (no cache: it's a
    // few float ops, and the camera/viewport can change between passes).
    const data = this.data;

    // WebXR ArrayCamera has no meaningful zoom/top/bottom of its own — use a
    // representative sub-camera (per-eye) instead.
    let cam = camera;
    if (cam && cam.isArrayCamera && cam.cameras && cam.cameras.length) {
      cam = cam.cameras[0];
    }
    if (!cam) return;

    const effective = data.dashUnits === 'auto'
      ? ((data.units === 'px' && cam.isOrthographicCamera) ? 'px' : 'm')
      : data.dashUnits;

    if (effective === 'm') {
      material.dashScale = 1;
      return;
    }

    // effective === 'px' — convert the px period to world units via the
    // viewport's world-per-pixel scale at the line midpoint.
    if (cam.isPerspectiveCamera) cam.updateMatrixWorld();
    // _prevStart/_prevEnd are the endpoints in the el's LOCAL space; the
    // midpoint, brought to world space, is the depth the perspective
    // approximation evaluates at.
    _midpointWorld.addVectors(this._prevStart, this._prevEnd).multiplyScalar(0.5);
    this.el.object3D.localToWorld(_midpointWorld);
    const wpp = worldPerPixel(cam, viewportHeightPx, _midpointWorld);

    // Require viewportHeightPx > 0 && wpp > 0 before syncing; otherwise skip
    // and keep the previous value (never write NaN).
    if (!(viewportHeightPx > 0) || !(wpp > 0) || !Number.isFinite(wpp)) {
      return;
    }

    let dashScale = 1 / wpp;

    // Bound the ON-SCREEN period — (period / dashScale) / wpp, in px — to
    // ~[0.5px, viewportHeightPx], so extreme zoom degrades gracefully (toward
    // solid at one rail, a single screen-tall dash at the other) instead of
    // collapsing or overflowing. The bounds MUST include wpp: in the normal
    // range this is then a no-op — a px dash's on-screen period is `period` px
    // by construction, so dashScale stays at 1/wpp and the dashes track the
    // camera (screen-constant) rather than being pinned to a fixed world size.
    const period = getPeriod(this.overlayParams);
    if (period > 0) {
      const minScale = period / (viewportHeightPx * wpp); // on-screen period == viewport height
      const maxScale = period / (0.5 * wpp);              // on-screen period == 0.5px
      if (dashScale < minScale) dashScale = minScale;
      if (dashScale > maxScale) dashScale = maxScale;
    }

    material.dashScale = dashScale;
  },

  // Set the LineMaterial `resolution` uniform to the real drawing-buffer size
  // once, at material creation. WHY: Line2 defaults resolution to (1,1) until
  // its first onBeforeRender runs. A render that happens before that first pass
  // would otherwise use (1,1) — a wrong-width first frame. (Picking is unaffected:
  // it runs against the THREE.Line proxy, not LineMaterial.) This is a one-shot
  // fallback; the per-render getViewport() sync in onBeforeRender takes over.
  initResolutionUniform(material) {
    const renderer = this.el.sceneEl && this.el.sceneEl.renderer;
    if (renderer && material.uniforms && material.uniforms.resolution) {
      const size = renderer.getDrawingBufferSize(new Vector2());
      if (size.x > 0 && size.y > 0) {
        material.uniforms.resolution.value.set(size.x, size.y);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Event-listener machinery (lifted from the legacy component).
  // -------------------------------------------------------------------------
  updateEventListeners() {
    const { data, listenerData } = this;

    const eventChanged = listenerData.event && data.updateEvent !== listenerData.event;
    const entitiesChanged = (listenerData.start && listenerData.start !== data.start) ||
                            (listenerData.end && listenerData.end !== data.end);

    if (!data.updateEvent || eventChanged || entitiesChanged) {
      this.removeEventListeners();
    }

    if (data.updateEvent) {
      this.addAndTrackEventListeners();
    }
  },

  addAndTrackEventListeners() {
    const { data, listenerData } = this;

    if (data.start) {
      data.start.addEventListener(data.updateEvent, this.updateLinePosition);
    }
    if (data.end) {
      data.end.addEventListener(data.updateEvent, this.updateLinePosition);
    }
    this.el.addEventListener(data.updateEvent, this.updateLinePosition);

    listenerData.event = data.updateEvent;
    listenerData.start = data.start;
    listenerData.end = data.end;
  },

  removeEventListeners() {
    const { listenerData } = this;

    if (listenerData.start) {
      listenerData.start.removeEventListener(listenerData.event, this.updateLinePosition);
    }
    if (listenerData.end) {
      listenerData.end.removeEventListener(listenerData.event, this.updateLinePosition);
    }
    if (this.el) {
      this.el.removeEventListener(listenerData.event, this.updateLinePosition);
    }
    listenerData.start = null;
    listenerData.end = null;
  },

  // -------------------------------------------------------------------------
  // Teardown — idempotent, null-guarded.
  // -------------------------------------------------------------------------
  remove() {
    // Dispose all overlay materials + remove the Line2s.
    for (let i = 0; i < this.overlays.length; i++) {
      const o = this.overlays[i];
      if (this.overlayLineGroup) this.overlayLineGroup.remove(o.line);
      if (o.material) o.material.dispose();
    }
    this.overlays = [];

    // Remove the pick line (shares the geometry; disposes only its own material).
    this.disposePickLine();

    // Dispose the single shared geometry exactly once.
    if (this.lineGeometry) {
      this.lineGeometry.dispose();
      this.lineGeometry = null;
    }

    if (this.overlayLineGroup && this.el && this.el.object3D) {
      this.el.object3D.remove(this.overlayLineGroup);
    }
    this.overlayLineGroup = null;

    if (this.cylinder && this.el) {
      // Guard: child may already be gone.
      if (this.cylinder.parentNode === this.el) {
        this.el.removeChild(this.cylinder);
      }
      this.cylinder = null;
    }

    this.removeEventListeners();
  },

  // -------------------------------------------------------------------------
  // Length adjustment (lifted verbatim from legacy).
  // -------------------------------------------------------------------------
  adjustLength(start, end) {
    const { lengthAdjustment } = this.data;
    const delta = _deltaVector;

    switch (lengthAdjustment) {
      case 'none':
        return;

      case 'scale': {
        const lengthFactor = this.data.lengthAdjustmentValue;
        if (!lengthFactor) return;
        delta.subVectors(end, start);
        const scaleExtension = 1 + ((lengthFactor - 1) / 2);
        delta.multiplyScalar(scaleExtension);
        break;
      }

      case 'extend': {
        const extension = this.data.lengthAdjustmentValue;
        if (!extension) return;
        delta.subVectors(end, start);
        delta.normalize();
        delta.multiplyScalar(-extension);
        break;
      }

      case 'absolute': {
        const targetLength = this.data.lengthAdjustmentValue;
        if (!targetLength) return;
        delta.subVectors(end, start);
        const currentLength = delta.length();
        if (currentLength === 0) return;
        const absExtension = ((targetLength / currentLength) - 1) / 2;
        delta.multiplyScalar(-absExtension);
        break;
      }

      default:
        console.error('Unexpected value for lengthAdjustment: ', lengthAdjustment);
        return;
    }

    start.addVectors(start, delta);
    end.subVectors(end, delta);
  },

  tick() {
    if (this.data.updateEvent) return;
    this.updateLinePosition();
  },

  // -------------------------------------------------------------------------
  // Position update — local-space transform + Line2 geometry update.
  // -------------------------------------------------------------------------
  updateLinePosition() {
    // Calls can be deferred; handle the case where the component was removed.
    if (!this.data) return;
    if (!this.data.start || !this.data.end) {
      // Transient invalid — hide, don't dispose. A subsequent valid
      // update()/updateLinePosition rebuilds + re-shows.
      this.hideAll();
      return;
    }
    if (!this.lineGeometry) return;

    const start = _startVector;
    const end = _endVector;

    // Transform start & end to this entity's local space.
    start.copy(this.data.startOffset);
    this.data.start.object3D.updateMatrixWorld();
    this.data.start.object3D.localToWorld(start);
    this.el.object3D.worldToLocal(start);

    end.copy(this.data.endOffset);
    this.data.end.object3D.updateMatrixWorld();
    this.data.end.object3D.localToWorld(end);
    this.el.object3D.worldToLocal(end);

    this.adjustLength(start, end);

    // Cheap endpoint-moved guard — compare against the stored previous values.
    const moved = !start.equals(this._prevStart) || !end.equals(this._prevEnd);

    // Zero-length (degenerate) guard: if start == end, hide all overlays
    // (do NOT just skip the rebuild — stale geometry would otherwise stay
    // visible). Un-hide on separation.
    const degenerate = start.distanceToSquared(end) === 0;

    if (degenerate) {
      if (!this._degenerate) {
        this._degenerate = true;
        for (let i = 0; i < this.overlays.length; i++) {
          this.overlays[i].line.visible = false;
        }
      }
      // Skip the shared render-geometry rewrite while degenerate, but collapse
      // the pick proxy's two vertices to the coincident endpoint so it can't
      // present a stale, grabbable segment (mirrors the prior degenerate guard
      // that suppressed pick hits in this state).
      this.updatePickGeometry(start, end);
      this._prevStart.copy(start);
      this._prevEnd.copy(end);
      this.updateTubeTransform(start, end); // tube also hidden via length 0
      return;
    }

    if (this._degenerate) {
      // Endpoints separated again — un-hide (respecting width/visible gates).
      this._degenerate = false;
      const lineVisible = this.data.visible && this.data.width > 0;
      for (let i = 0; i < this.overlays.length; i++) {
        this.overlays[i].line.visible = lineVisible;
      }
    }

    if (moved) {
      // Shared geometry rewrite: one geometry, all overlays reference it.
      this.lineGeometry.setPositions([start.x, start.y, start.z, end.x, end.y, end.z]);
      // Dashing requires line distances after any endpoint change.
      // computeLineDistances() is a Line2/LineSegments2 (object) method, NOT a
      // geometry method — it reads the geometry's instance positions and writes
      // the instanceDistance attributes back onto that same geometry. Because
      // every overlay shares this one geometry, calling it on a single overlay
      // updates the distances for all of them.
      if (this.overlays.length > 0) this.overlays[0].line.computeLineDistances();
      // Keep the invisible pick proxy in lockstep with the render line so the
      // pick band never drifts from what's drawn.
      this.updatePickGeometry(start, end);
      this._prevStart.copy(start);
      this._prevEnd.copy(end);
    }

    this.updateTubeTransform(start, end);
  },

  updateTubeTransform(start, end) {
    if (!this.cylinder) return;
    _lineVector.subVectors(end, start);
    _posVector.addVectors(start, end).multiplyScalar(0.5);
    _lineDirectionVector.copy(_lineVector).normalize();

    const object = this.cylinder.object3D;
    object.position.copy(_posVector);
    object.quaternion.setFromUnitVectors(_up, _lineDirectionVector);
    this.cylinder.setAttribute('height', _lineVector.length());
  }
});

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
//    renderer.getViewport().z/.w (device px). We OVERRIDE that hook (D15) and
//    use getViewport() as the SINGLE basis for both resolution and
//    worldPerPixel.

import { Group, Vector2, Vector3, Vector4 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

// ---------------------------------------------------------------------------
// Module-scoped scratch vectors (lifted from the legacy IIFE, converted from
// `new THREE.Vector3()` to named imports per D23).
// ---------------------------------------------------------------------------
const _startVector = new Vector3();
const _endVector = new Vector3();
const _lineVector = new Vector3();
const _posVector = new Vector3();
const _deltaVector = new Vector3();
const _lineDirectionVector = new Vector3();
const _up = new Vector3(0, 1, 0);
// getViewport(target) calls target.copy(_viewport) where _viewport is a
// THREE.Vector4 — so the target must be a real Vector4. `three` is
// externalized, so this import costs nothing in the bundle.
const _viewport = new Vector4();

// True mathematical modulo (JS % is sign-of-dividend) — used everywhere dash
// offsets/periods are wrapped (D7).
function mod(x, p) {
  return ((x % p) + p) % p;
}

//!! Now we have a modular structure, put these utility functions into a separate module and import them.
// ---------------------------------------------------------------------------
// Dash decomposition (Decision 3 / spec Worked Examples E1–E8; D7/D26).
//
// Given a sanitised, even-length, finite dash array [d0,g0,d1,g1,...]:
//   period = sum(dash)
//   for each dash run d_k starting at cumulative position `pos`:
//     - if d_k === 0: emit NO overlay (skip; invisible run) — D7.
//     - else emit { dashSize: d_k, gapSize: period - d_k,
//                   dashOffset: mod(period - pos, period) }
// The public dashOffset (wrapped mod period) is added to each overlay's
// offset. Returns [] for the solid case (caller renders one non-dashed line).
// ---------------------------------------------------------------------------
function decomposeDash(dash, publicDashOffset) {
  const overlays = [];
  let period = 0;
  for (let i = 0; i < dash.length; i++) period += dash[i];
  if (period <= 0) return overlays; // solid

  const offsetExtra = mod(publicDashOffset, period);
  let pos = 0;
  for (let k = 0; k < dash.length; k += 2) {
    const dashLen = dash[k];
    if (dashLen > 0) {
      overlays.push({
        dashSize: dashLen,
        gapSize: period - dashLen,
        dashOffset: mod(period - pos, period) + offsetExtra
      });
    }
    pos += dashLen;
    if (k + 1 < dash.length) pos += dash[k + 1]; // advance past the gap
  }
  return overlays;
}

// Sanitise the raw `dash` schema array into either [] (solid) or a clean
// even-length finite array (D7/D18). Order of checks is load-bearing:
// non-finite FIRST (NaN slips past every numeric comparison).
function sanitiseDash(raw, attrName) {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  // D18 — non-finite guard FIRST.
  if (!raw.every(Number.isFinite)) {
    console.warn(`connecting-line2 (${attrName}): dash contains a non-finite value; rendering solid.`);
    return [];
  }

  // Odd-length: drop the trailing element (warn).
  let arr = raw;
  if (arr.length % 2 === 1) {
    console.warn(`connecting-line2 (${attrName}): dash has an odd number of elements; dropping the trailing element.`);
    arr = arr.slice(0, arr.length - 1);
  }
  if (arr.length === 0) return [];

  // Negative entries: reject whole array (do not silently clamp mid-pattern).
  if (arr.some((v) => v < 0)) {
    console.warn(`connecting-line2 (${attrName}): dash contains a negative value; rendering solid.`);
    return [];
  }

  const period = arr.reduce((a, b) => a + b, 0);
  if (period <= 0) return []; // all-zero array => solid (no warn; benign)

  // All dash runs zero-length but period > 0 (e.g. [0,5,0,5]): every run is
  // invisible yet the array is well-formed — warn + solid (D18).
  let anyDash = false;
  for (let k = 0; k < arr.length; k += 2) {
    if (arr[k] > 0) { anyDash = true; break; }
  }
  if (!anyDash) {
    console.warn(`connecting-line2 (${attrName}): dash has only zero-length dash runs; rendering solid.`);
    return [];
  }

  return arr;
}

AFRAME.registerComponent('connecting-line2', {

  schema: {
    // Shared machinery (unchanged from the legacy component).
    start: { type: 'selector' },
    startOffset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    end: { type: 'selector' },
    endOffset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    color: { type: 'color', default: '#74BEC1' },
    opacity: { type: 'number', default: 1 },
    visible: { default: true },
    lengthAdjustment: { default: 'none', oneOf: ['none', 'scale', 'extend', 'absolute'] },
    lengthAdjustmentValue: { type: 'number' },
    updateEvent: { type: 'string', default: '' },

    // New / changed.
    width: { type: 'number', default: 1 },
    units: { default: 'px', oneOf: ['px', 'm'] },
    dash: { type: 'array', default: [] },
    dashUnits: { default: 'auto', oneOf: ['auto', 'px', 'm'] },
    dashOffset: { type: 'number', default: 0 },
    tubeRadius: { type: 'number', default: 0 },
    segments: { type: 'number', default: 4 },
    shader: { type: 'string', default: 'flat' }
  },

  multiple: true,

  init() {
    // Group holding all overlay Line2s.
    //!! Naming.  this.overlayLineGroup would be better - group is very vague.
    this.group = new Group();
    this.el.object3D.add(this.group);

    //!! References to D5 etc. are meaningless in the context of this repo.  Don't rely on them.
    //!! Explain what you mean (but only if extra explanation is really required)
    //!! Could add a DESIGN-NOTES.md to this repo if there is valuable explanation that doesn't fit naturally inline in the code.
    // Single shared geometry (D5) — all overlays reference it; never per-overlay.
    this.lineGeometry = new LineGeometry();

    // overlays: [{ line: Line2, material: LineMaterial }]
    this.overlays = [];

    // The resolved overlay descriptors currently applied (for in-place mutation
    // when the count is unchanged, D22).
    this.overlayParams = [];

    // Tube cylinder (legacy width path) — created lazily.
    this.cylinder = null;

    // Endpoint guard (D5) — stored once on the component, not per-overlay.
    this._prevStart = new Vector3(NaN, NaN, NaN);
    this._prevEnd = new Vector3(NaN, NaN, NaN);
    this._degenerate = false;

    this.listenerData = { event: '', start: null, end: null };

    this.updateLinePosition = this.updateLinePosition.bind(this);
    this.onBeforeRender = this.onBeforeRender.bind(this);
  },

  update(oldData) {
    const data = this.data;

    // Lazily (re)create geometry / group / overlays if a prior teardown
    // (A-Frame remove(), or an older destructive invalid path) disposed them.
    // This keeps a component that was torn down and re-updated rebuildable
    //!! What does HIGH-1 mean?
    // (HIGH-1).
    this.ensureScaffold();

    if (!data.start || !data.end) {
      // Transient invalid endpoints (e.g. a selector that resolves only after
      // load, or a runtime start/end swap that briefly clears one end). Do NOT
      // dispose geometry/group (that's remove()'s job, the teardown hook) —
      // just hide everything and bail. A later valid update() rebuilds cleanly
      // (HIGH-1).
      this.hideAll();
      return;
    }

    //!! From here to the call to this.applyMaterialStyles should be a function
    //!! it exclusively deals with dash patterns, so for code readability by people who don't care about dash patterns,
    //!! a single function that they can see deals with dash patterns is preferable.
    // Resolve dash -> overlay descriptors.
    const sanitised = sanitiseDash(data.dash, this.attrName);
    //!! Needless let here?
    //!! Prefer const pubicOffset = Number.isFinite(data.dashOffset) ? data.dashOffset : 0;
    //!! Variable naming, what does public mean?
    let publicOffset = data.dashOffset;
    if (!Number.isFinite(publicOffset)) publicOffset = 0; // D18
    const newParams = decomposeDash(sanitised, publicOffset);
    // Solid => one non-dashed overlay.
    const targetCount = newParams.length === 0 ? 1 : newParams.length;

    // (D24) Geometry reposition happens in updateLinePosition (deferred below);
    // here we (re)build/mutate overlays. The deferred updateLinePosition then
    // sets positions + computeLineDistances on the shared geometry, so all
    // overlays anchor to fresh line distances.

    if (this.overlays.length !== targetCount) {
      this.rebuildOverlays(targetCount);
    }

    // Apply per-overlay dash params (in place — no dispose, no recompile; D22).
    this.applyOverlayParams(newParams);
    this.overlayParams = newParams;

    // Width / units / color / opacity / visibility on every overlay material.
    this.applyMaterialStyle();

    // Tube (legacy cylinder path), rendered in addition to the line.
    this.updateTube();

    // Re-bind listeners if updateEvent OR start/end entity changed (D11).
    this.updateEventListeners();

    // Force a geometry refresh on the next position update (schema may have
    // changed endpoints/offsets/lengthAdjustment).
    this._prevStart.set(NaN, NaN, NaN);
    this._prevEnd.set(NaN, NaN, NaN);

    // Defer the initial position update until scene load completes.
    setTimeout(this.updateLinePosition);
  },

  // -------------------------------------------------------------------------
  // Scaffold (re)creation + non-destructive hide (HIGH-1).
  // -------------------------------------------------------------------------

  // (Re)create group + shared geometry if a prior remove() disposed them.
  // Idempotent: a no-op on the normal path where init() already built them.
  ensureScaffold() {
    if (!this.group) {
      this.group = new Group();
      if (this.el && this.el.object3D) this.el.object3D.add(this.group);
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
  },

  // Non-destructive "transient invalid" path: hide every overlay line and the
  // tube. Disposes nothing — a later valid update() un-hides via
  // applyMaterialStyle / updateTube (HIGH-1).
  hideAll() {
    for (let i = 0; i < this.overlays.length; i++) {
      if (this.overlays[i].line) this.overlays[i].line.visible = false;
    }
    if (this.cylinder) {
      this.cylinder.setAttribute('visible', false);
    }
  },

  // -------------------------------------------------------------------------
  // Overlay lifecycle (D5/D22)
  // -------------------------------------------------------------------------

  // Build exactly `count` overlay Line2s, disposing the previous set first.
  // Only called when the overlay COUNT changes (D22).
  rebuildOverlays(count) {
    // Dispose + remove every existing overlay.
    for (let i = 0; i < this.overlays.length; i++) {
      const o = this.overlays[i];
      this.group.remove(o.line);
      if (o.material) o.material.dispose();
    }
    this.overlays = [];

    for (let i = 0; i < count; i++) {
      const material = new LineMaterial({
        // Persistent dashed material — never toggle USE_DASH (D22). The solid
        // case is driven by params (single full-length dash), not `dashed:false`.
        dashed: true,
        // Multi-overlay z discipline (D10): disable depthWrite so co-located
        // dashes on the shared geometry don't z-fight.
        depthWrite: false,
        transparent: true
      });

      //!! I have no idea what seedResolution does, either from the name, or from reading the code.
      //!! Function names should be self-explanatory where possible.  Else an explanatory comment that explains WHY
      //!! something is necessary, not just what it's doing.
      //!! OK, now I understand this is related to the onBeforeRender code.  This whole thing needs a better explanation.
      // Seed resolution from the live drawing buffer, NOT the default (1,1) —
      // one-shot fallback overwritten by the first getViewport() sync (D4/D17).
      this.seedResolution(material);

      const line = new Line2(this.lineGeometry, material);
      // Wire the per-render sync override (D15). Line2 inherits a stock
      // onBeforeRender from LineSegments2; we consciously override it.
      line.onBeforeRender = this.onBeforeRender;
      // Stash a back-reference so the shared hook can find this overlay's
      // material + descriptor.
      line.userData.clOverlayIndex = i;
      // Keep frustum culling ON (D21) — do not blanket-disable.
      this.group.add(line);
      this.overlays.push({ line, material });
    }
  },

  // Apply the dash descriptors to the (already-correct-count) overlays in
  // place (D22 — no dispose, no shader recompile).
  applyOverlayParams(params) {
    if (params.length === 0) {
      // Solid: single overlay, single full-length "dash" => effectively solid
      // without flipping USE_DASH. dashSize huge, gapSize 0 => mod(...) is
      // always < dashSize => never discards.
      const o = this.overlays[0];
      if (o) {
        // Solid trick: a dashed material with a huge dashSize and zero gap
        // never discards (mod(lineDistance) < dashSize always holds), so it
        // draws as a continuous solid line without flipping USE_DASH (D22).
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
    // width: 0 => the Line2 stroke is invisible (D9) — NOT linewidth:0 (AA sliver).
    const lineVisible = data.visible && data.width > 0;

    // LOW-a: only a translucent line, or co-located overlays sharing geometry
    // (multi-element dash patterns), need alpha blending + depthWrite off. A
    // solid single line stays opaque + depth-writing, matching the legacy
    // THREE.Line it replaces (avoids sort/transparency artefacts).
    const needsBlend = data.opacity < 1 || this.overlays.length > 1;

    for (let i = 0; i < this.overlays.length; i++) {
      const m = this.overlays[i].material;
      m.color.set(data.color);
      // worldUnits toggles a #define in the LineMaterial shader => recompile
      // required, but ONLY when it actually changes (D22/MED-1). Plain uniform
      // writes (color/linewidth/opacity) need no needsUpdate.
      if (m.worldUnits !== worldUnits) {
        m.worldUnits = worldUnits;
        m.needsUpdate = true;
      }
      m.linewidth = data.width;
      m.opacity = data.opacity;
      m.transparent = needsBlend;
      m.depthWrite = !needsBlend;
      // visibility is also gated by the degenerate (zero-length) guard (D25),
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
  // Per-render sync — OVERRIDES Line2.onBeforeRender (D15).
  // Single resolution basis = renderer.getViewport() (device px).
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

    // LOW-b: the solid case (no overlay params) renders via the dashSize:1e9
    // solid trick — there is no real period to scale, so skip the
    // worldPerPixel / dashScale computation entirely. dashScale:1 keeps the
    // huge dashSize huge (never discards); we don't rely on the 1e9 sentinel
    // surviving the clamp.
    if (!this.overlayParams || this.overlayParams.length === 0) {
      material.dashScale = 1;
      return;
    }

    // dashUnits / dashScale resolution (D8). Recomputed per overlay each frame
    // — no cache (D16). Cheap: a few float ops + getters.
    const data = this.data;

    // WebXR ArrayCamera: never read zoom/top/bottom off it (D8) — use a
    // representative sub-camera.
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

    // effective === 'px' — need worldPerPixel.
    const worldPerPixel = this.computeWorldPerPixel(cam, viewportHeightPx);

    // Guards (D8/D17): require viewportHeightPx > 0 && worldPerPixel > 0 before
    // syncing; otherwise skip and keep the previous value (never write NaN).
    if (!(viewportHeightPx > 0) || !(worldPerPixel > 0) || !Number.isFinite(worldPerPixel)) {
      return;
    }

    let dashScale = 1 / worldPerPixel;

    // Concrete dashScale clamp (D19): keep the on-screen period
    // (dashScale * period, in px) within ~[0.5px, viewportHeightPx].
    const period = this.currentPeriod();
    if (period > 0) {
      const minScale = 0.5 / period;                  // low rail: collapse->solid
      const maxScale = viewportHeightPx / period;     // high rail: single dash
      if (dashScale < minScale) dashScale = minScale;
      if (dashScale > maxScale) dashScale = maxScale;
    }

    material.dashScale = dashScale;
  },

  //!! Could be an imported utility function?
  // worldPerPixel: world units per device pixel of vertical viewport.
  //  - orthographic (exact): ((top - bottom) / zoom) / viewportHeightPx
  //  - perspective forced-px (D8, known limitation): approximate at the line
  //    midpoint depth: (2 * tan(fov/2) * dist) / viewportHeightPx.
  computeWorldPerPixel(cam, viewportHeightPx) {
    if (cam.isOrthographicCamera) {
      const worldHeight = (cam.top - cam.bottom) / (cam.zoom || 1);
      return worldHeight / viewportHeightPx;
    }
    if (cam.isPerspectiveCamera) {
      // Distance from the camera to the line midpoint (world space).
      _posVector.addVectors(this._prevStart, this._prevEnd).multiplyScalar(0.5);
      // _prevStart/_prevEnd are in the el's LOCAL space; bring to world.
      this.el.object3D.localToWorld(_posVector);
      cam.updateMatrixWorld();
      _deltaVector.setFromMatrixPosition(cam.matrixWorld);
      const dist = _posVector.distanceTo(_deltaVector);
      const fovRad = (cam.fov * Math.PI) / 180;
      const worldHeight = 2 * Math.tan(fovRad / 2) * dist;
      return worldHeight / viewportHeightPx;
    }
    return 0;
  },

  // Sum of the currently-applied dash period (for the dashScale clamp). For the
  // solid case the period is 0 (clamp skipped).
  //!! Would it be clearer if this was a utility function getPeriod(this.overlayParams)?
  currentPeriod() {
    const p = this.overlayParams;
    if (!p || p.length === 0) return 0;
    // Each overlay carries dashSize + gapSize == period.
    return p[0].dashSize + p[0].gapSize;
  },

  // Seed material.resolution from the live drawing buffer (one-shot fallback,
  // D4) — overwritten by the first getViewport() sync.
  seedResolution(material) {
    const renderer = this.el.sceneEl && this.el.sceneEl.renderer;
    if (renderer && material.uniforms && material.uniforms.resolution) {
      const size = renderer.getDrawingBufferSize(new Vector2());
      if (size.x > 0 && size.y > 0) {
        material.uniforms.resolution.value.set(size.x, size.y);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Event-listener machinery (lifted from legacy, with D11 fixes).
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
      // D11 fix: was `listenerData.start.removeEventListener` (copy-paste bug)
      // so the end listener was never removed.
      listenerData.end.removeEventListener(listenerData.event, this.updateLinePosition);
    }
    if (this.el) {
      this.el.removeEventListener(listenerData.event, this.updateLinePosition);
    }
    listenerData.start = null;
    listenerData.end = null;
  },

  // -------------------------------------------------------------------------
  // Teardown (D5) — idempotent, null-guarded.
  // -------------------------------------------------------------------------
  remove() {
    // Dispose all overlay materials + remove the Line2s.
    for (let i = 0; i < this.overlays.length; i++) {
      const o = this.overlays[i];
      if (this.group) this.group.remove(o.line);
      if (o.material) o.material.dispose();
    }
    this.overlays = [];

    // Dispose the single shared geometry exactly once.
    if (this.lineGeometry) {
      this.lineGeometry.dispose();
      this.lineGeometry = null;
    }

    if (this.group && this.el && this.el.object3D) {
      this.el.object3D.remove(this.group);
    }
    this.group = null;

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
      // Transient invalid (HIGH-1) — hide, don't dispose. A subsequent valid
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

    // Cheap endpoint-moved guard (D5) — compare against stored previous, NOT
    // per-overlay.
    const moved = !start.equals(this._prevStart) || !end.equals(this._prevEnd);

    // Zero-length (degenerate) guard (D25): if start == end, hide all overlays
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
      // Skip geometry rewrite while degenerate.
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
      // Shared geometry rewrite (D5/D24): one geometry, all overlays reference it.
      this.lineGeometry.setPositions([start.x, start.y, start.z, end.x, end.y, end.z]);
      // Dashing requires computeLineDistances after any endpoint change.
      this.lineGeometry.computeLineDistances();
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

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./connecting-line.js"
/*!****************************!*\
  !*** ./connecting-line.js ***!
  \****************************/
() {

/* global AFRAME */
//
// connecting-line — paper-thin BACKWARD-COMPATIBILITY wrapper.
//
// Keeps the exact 0.3.3 schema. Renders NOTHING itself: it maps its schema
// onto a `connecting-line2__<id>` on the same entity and lets that component
// do all the work.
//
// Wrapper isolation: this component touches ONLY `connecting-line2__<id>` —
// never any geometry or Line2/tube object directly. The
// `connecting-line2__<id>` instance name is RESERVED — consumers must not
// collide on it.
//
// Mapping:
//   shared fields (start/end/offsets/color/opacity/visible/
//     lengthAdjustment/lengthAdjustmentValue/updateEvent) -> passthrough
//   width  -> connecting-line2 { width: 1, units: 'px',
//                                tubeRadius: width > 0 ? width / 2 : 0 }
//            width is ALWAYS 1 — the crisp 1px base Line2 reads as a faint
//            centre-stripe when a tube is present; accepted as a minor AA
//            upgrade (the old THREE.Line was drawn too, just 1px).
//   segments / shader -> passthrough to the tube.

AFRAME.registerComponent('connecting-line', {

  schema: {
    start: { type: 'selector' },
    startOffset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    end: { type: 'selector' },
    endOffset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    color: { type: 'color', default: '#74BEC1' },
    opacity: { type: 'number', default: 1 },
    visible: { default: true },
    lengthAdjustment: { default: 'none', oneOf: ['none', 'scale', 'extend', 'absolute'] },
    lengthAdjustmentValue: { type: 'number' },
    width: { type: 'number' },
    segments: { type: 'number', default: 4 },
    shader: { type: 'string', default: 'flat' },
    updateEvent: { type: 'string', default: '' }
  },

  multiple: true,

  // The reserved child attribute name this wrapper owns.
  childAttr() {
    return `connecting-line2__${this.attrName}`;
  },

  update() {
    const data = this.data;

    if (!data.start || !data.end) {
      this.remove();
      return;
    }

    this.el.setAttribute(this.childAttr(), {
      start: data.start,
      end: data.end,
      startOffset: data.startOffset,
      endOffset: data.endOffset,
      color: data.color,
      opacity: data.opacity,
      visible: data.visible,
      lengthAdjustment: data.lengthAdjustment,
      lengthAdjustmentValue: data.lengthAdjustmentValue,
      updateEvent: data.updateEvent,
      // width is ALWAYS 1; the legacy cylinder becomes the tube.
      width: 1,
      units: 'px',
      tubeRadius: data.width > 0 ? data.width / 2 : 0,
      segments: data.segments,
      shader: data.shader
    });
  },

  remove() {
    // Remove ONLY our reserved child attribute. The child
    // connecting-line2.remove() is idempotent (safe if already gone).
    if (this.el) {
      this.el.removeAttribute(this.childAttr());
    }
  }
});


/***/ },

/***/ "./connecting-line2.js"
/*!*****************************!*\
  !*** ./connecting-line2.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var three_examples_jsm_lines_Line2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three/examples/jsm/lines/Line2.js */ "./node_modules/super-three/examples/jsm/lines/Line2.js");
/* harmony import */ var three_examples_jsm_lines_LineGeometry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three/examples/jsm/lines/LineGeometry.js */ "./node_modules/super-three/examples/jsm/lines/LineGeometry.js");
/* harmony import */ var three_examples_jsm_lines_LineMaterial_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! three/examples/jsm/lines/LineMaterial.js */ "./node_modules/super-three/examples/jsm/lines/LineMaterial.js");
/* harmony import */ var _dash_pattern_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./dash-pattern.js */ "./dash-pattern.js");
/* harmony import */ var _line_math_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./line-math.js */ "./line-math.js");
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








// ---------------------------------------------------------------------------
// Module-scoped scratch vectors (reused across calls to avoid per-frame
// allocation).
// ---------------------------------------------------------------------------
const _startVector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _endVector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _lineVector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _posVector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _deltaVector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _lineDirectionVector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _midpointWorld = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _up = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(0, 1, 0);
// getViewport(target) calls target.copy(_viewport) where _viewport is a
// THREE.Vector4 — so the target must be a real Vector4. `three` is
// externalized, so this import costs nothing in the bundle.
const _viewport = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4();

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
    this.overlayLineGroup = new three__WEBPACK_IMPORTED_MODULE_0__.Group();
    this.el.object3D.add(this.overlayLineGroup);

    // Single shared geometry — all overlays reference it; never per-overlay.
    this.lineGeometry = new three_examples_jsm_lines_LineGeometry_js__WEBPACK_IMPORTED_MODULE_2__.LineGeometry();

    // overlays: [{ line: Line2, material: LineMaterial }]
    this.overlays = [];

    // The resolved overlay descriptors currently applied (for in-place mutation
    // when the overlay count is unchanged).
    this.overlayParams = [];

    // Tube cylinder (legacy width path) — created lazily.
    this.cylinder = null;

    // Endpoint guard — stored once on the component, not per-overlay.
    this._prevStart = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(NaN, NaN, NaN);
    this._prevEnd = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(NaN, NaN, NaN);
    this._degenerate = false;

    this.listenerData = { event: '', start: null, end: null };

    this.updateLinePosition = this.updateLinePosition.bind(this);
    this.onBeforeRender = this.onBeforeRender.bind(this);
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

    const sanitised = (0,_dash_pattern_js__WEBPACK_IMPORTED_MODULE_4__.sanitiseDash)(data.dash, this.attrName);
    const userDashOffset = Number.isFinite(data.dashOffset) ? data.dashOffset : 0;
    const newParams = (0,_dash_pattern_js__WEBPACK_IMPORTED_MODULE_4__.decomposeDash)(sanitised, userDashOffset);

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
      this.overlayLineGroup = new three__WEBPACK_IMPORTED_MODULE_0__.Group();
      if (this.el && this.el.object3D) this.el.object3D.add(this.overlayLineGroup);
    }
    if (!this.lineGeometry) {
      this.lineGeometry = new three_examples_jsm_lines_LineGeometry_js__WEBPACK_IMPORTED_MODULE_2__.LineGeometry();
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
      const material = new three_examples_jsm_lines_LineMaterial_js__WEBPACK_IMPORTED_MODULE_3__.LineMaterial({
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

      const line = new three_examples_jsm_lines_Line2_js__WEBPACK_IMPORTED_MODULE_1__.Line2(this.lineGeometry, material);
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
    const wpp = (0,_line_math_js__WEBPACK_IMPORTED_MODULE_5__.worldPerPixel)(cam, viewportHeightPx, _midpointWorld);

    // Require viewportHeightPx > 0 && wpp > 0 before syncing; otherwise skip
    // and keep the previous value (never write NaN).
    if (!(viewportHeightPx > 0) || !(wpp > 0) || !Number.isFinite(wpp)) {
      return;
    }

    let dashScale = 1 / wpp;

    // Clamp the on-screen period (dashScale * period, in px) to ~[0.5px,
    // viewportHeightPx] so it never collapses below a pixel or blows up beyond
    // a single screen-height dash.
    const period = (0,_dash_pattern_js__WEBPACK_IMPORTED_MODULE_4__.getPeriod)(this.overlayParams);
    if (period > 0) {
      const minScale = 0.5 / period;                  // low rail: collapse->solid
      const maxScale = viewportHeightPx / period;     // high rail: single dash
      if (dashScale < minScale) dashScale = minScale;
      if (dashScale > maxScale) dashScale = maxScale;
    }

    material.dashScale = dashScale;
  },

  // Set the LineMaterial `resolution` uniform to the real drawing-buffer size
  // once, at material creation. WHY: Line2 defaults resolution to (1,1) until
  // its first onBeforeRender runs. A raycast or render that happens before that
  // first pass would otherwise use (1,1) — breaking hit-testing and giving a
  // wrong-width first frame. This is a one-shot fallback; the per-render
  // getViewport() sync in onBeforeRender takes over from the first frame.
  initResolutionUniform(material) {
    const renderer = this.el.sceneEl && this.el.sceneEl.renderer;
    if (renderer && material.uniforms && material.uniforms.resolution) {
      const size = renderer.getDrawingBufferSize(new three__WEBPACK_IMPORTED_MODULE_0__.Vector2());
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
      // Shared geometry rewrite: one geometry, all overlays reference it.
      this.lineGeometry.setPositions([start.x, start.y, start.z, end.x, end.y, end.z]);
      // Dashing requires line distances after any endpoint change.
      // computeLineDistances() is a Line2/LineSegments2 (object) method, NOT a
      // geometry method — it reads the geometry's instance positions and writes
      // the instanceDistance attributes back onto that same geometry. Because
      // every overlay shares this one geometry, calling it on a single overlay
      // updates the distances for all of them.
      if (this.overlays.length > 0) this.overlays[0].line.computeLineDistances();
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


/***/ },

/***/ "./dash-pattern.js"
/*!*************************!*\
  !*** ./dash-pattern.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decomposeDash: () => (/* binding */ decomposeDash),
/* harmony export */   getPeriod: () => (/* binding */ getPeriod),
/* harmony export */   mod: () => (/* binding */ mod),
/* harmony export */   sanitiseDash: () => (/* binding */ sanitiseDash)
/* harmony export */ });
//
// dash-pattern — pure helpers for sanitising and decomposing dash arrays.
//
// A single THREE LineMaterial can express only ONE dash/gap pair. To render
// richer patterns (dash-dot, dash-dot-dot, …) we decompose the pattern into N
// overlaid lines, one per dash "run", all sharing a single geometry. These
// helpers are pure (no THREE, no component state) so they can be unit-tested in
// isolation. See DESIGN-NOTES.md for the full rationale and worked examples.
//

// True mathematical modulo (JS `%` carries the sign of the dividend) — used
// wherever dash offsets / periods are wrapped into [0, p).
function mod(x, p) {
  return ((x % p) + p) % p;
}

// Sanitise a raw `dash` schema array into either [] (render solid) or a clean,
// even-length, finite, non-negative array.
//
// The order of checks is load-bearing: the non-finite guard must run FIRST,
// because NaN slips past every numeric comparison that follows.
function sanitiseDash(raw, attrName) {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  // Non-finite guard FIRST (NaN/Infinity would corrupt every later check).
  if (!raw.every(Number.isFinite)) {
    console.warn(`connecting-line2 (${attrName}): dash contains a non-finite value; rendering solid.`);
    return [];
  }

  // Odd-length: drop the trailing element (a dash with no following gap).
  let arr = raw;
  if (arr.length % 2 === 1) {
    console.warn(`connecting-line2 (${attrName}): dash has an odd number of elements; dropping the trailing element.`);
    arr = arr.slice(0, arr.length - 1);
  }
  if (arr.length === 0) return [];

  // Negative entries: reject the whole array rather than silently clamping
  // mid-pattern (which would produce a confusing partial pattern).
  if (arr.some((v) => v < 0)) {
    console.warn(`connecting-line2 (${attrName}): dash contains a negative value; rendering solid.`);
    return [];
  }

  const period = arr.reduce((a, b) => a + b, 0);
  if (period <= 0) return []; // all-zero array => solid (no warn; benign)

  // All dash runs zero-length but period > 0 (e.g. [0,5,0,5]): every run is
  // invisible yet the array is well-formed — warn and fall back to solid.
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

// Decompose a sanitised dash array [d0,g0,d1,g1,…] into one overlay descriptor
// per (non-zero) dash run.
//
//   period = sum(dash)
//   for each dash run d_k starting at cumulative position `pos`:
//     - if d_k === 0: emit NO overlay (an invisible run is skipped).
//     - else emit { dashSize: d_k, gapSize: period - d_k,
//                   dashOffset: mod(period - pos, period) }
//
// The caller's public dashOffset (wrapped mod period) is added to every
// overlay's offset so the whole pattern shifts in phase together. Returns [] for
// the solid case (the caller renders a single non-dashed line).
function decomposeDash(dash, dashOffset) {
  const overlays = [];
  let period = 0;
  for (let i = 0; i < dash.length; i++) period += dash[i];
  if (period <= 0) return overlays; // solid

  const offsetExtra = mod(dashOffset, period);
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

// Sum of the dash period for a resolved set of overlay descriptors (used by the
// dashScale clamp). Every overlay carries dashSize + gapSize == period, so the
// first overlay suffices. Returns 0 for the solid case (clamp skipped).
function getPeriod(overlayParams) {
  if (!overlayParams || overlayParams.length === 0) return 0;
  return overlayParams[0].dashSize + overlayParams[0].gapSize;
}


/***/ },

/***/ "./line-math.js"
/*!**********************!*\
  !*** ./line-math.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   worldPerPixel: () => (/* binding */ worldPerPixel)
/* harmony export */ });
//
// line-math — pure camera/viewport math helpers for connecting-line2.
//
// Kept free of component state and THREE object construction so they can be
// unit-tested standalone. Callers pass in everything the function needs.
//

// World units per device pixel of vertical viewport, at the given world-space
// point. Used to convert a px-specified dash period into world units so the
// dash renders at a constant on-screen size.
//
//  - orthographic (exact): the world height spanned by the viewport is
//    (top - bottom) / zoom, independent of depth.
//  - perspective (approximation): the world height spanned by the viewport
//    grows with distance from the camera as 2 * tan(fov/2) * dist. We evaluate
//    it at `midpointWorld` (the line's midpoint in world space) — a single
//    representative depth. This is exact only for a line lying in a plane
//    parallel to the image plane; for a line angled in depth the dash spacing
//    drifts slightly along its length. See DESIGN-NOTES.md.
//
// Returns 0 for an unrecognised camera type. `camera` for a perspective camera
// must have an up-to-date matrixWorld (the caller is responsible for calling
// updateMatrixWorld()).
function worldPerPixel(camera, viewportHeightPx, midpointWorld) {
  if (camera.isOrthographicCamera) {
    const worldHeight = (camera.top - camera.bottom) / (camera.zoom || 1);
    return worldHeight / viewportHeightPx;
  }
  if (camera.isPerspectiveCamera) {
    const camWorldX = camera.matrixWorld.elements[12];
    const camWorldY = camera.matrixWorld.elements[13];
    const camWorldZ = camera.matrixWorld.elements[14];
    const dx = midpointWorld.x - camWorldX;
    const dy = midpointWorld.y - camWorldY;
    const dz = midpointWorld.z - camWorldZ;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const fovRad = (camera.fov * Math.PI) / 180;
    const worldHeight = 2 * Math.tan(fovRad / 2) * dist;
    return worldHeight / viewportHeightPx;
  }
  return 0;
}


/***/ },

/***/ "three"
/*!************************!*\
  !*** external "THREE" ***!
  \************************/
(module) {

"use strict";
module.exports = self["THREE"];

/***/ },

/***/ "./node_modules/super-three/examples/jsm/lines/Line2.js"
/*!**************************************************************!*\
  !*** ./node_modules/super-three/examples/jsm/lines/Line2.js ***!
  \**************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Line2: () => (/* binding */ Line2)
/* harmony export */ });
/* harmony import */ var _lines_LineSegments2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lines/LineSegments2.js */ "./node_modules/super-three/examples/jsm/lines/LineSegments2.js");
/* harmony import */ var _lines_LineGeometry_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lines/LineGeometry.js */ "./node_modules/super-three/examples/jsm/lines/LineGeometry.js");
/* harmony import */ var _lines_LineMaterial_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lines/LineMaterial.js */ "./node_modules/super-three/examples/jsm/lines/LineMaterial.js");




class Line2 extends _lines_LineSegments2_js__WEBPACK_IMPORTED_MODULE_0__.LineSegments2 {

	constructor( geometry = new _lines_LineGeometry_js__WEBPACK_IMPORTED_MODULE_1__.LineGeometry(), material = new _lines_LineMaterial_js__WEBPACK_IMPORTED_MODULE_2__.LineMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		this.isLine2 = true;

		this.type = 'Line2';

	}

}




/***/ },

/***/ "./node_modules/super-three/examples/jsm/lines/LineGeometry.js"
/*!*********************************************************************!*\
  !*** ./node_modules/super-three/examples/jsm/lines/LineGeometry.js ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LineGeometry: () => (/* binding */ LineGeometry)
/* harmony export */ });
/* harmony import */ var _lines_LineSegmentsGeometry_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lines/LineSegmentsGeometry.js */ "./node_modules/super-three/examples/jsm/lines/LineSegmentsGeometry.js");


class LineGeometry extends _lines_LineSegmentsGeometry_js__WEBPACK_IMPORTED_MODULE_0__.LineSegmentsGeometry {

	constructor() {

		super();

		this.isLineGeometry = true;

		this.type = 'LineGeometry';

	}

	setPositions( array ) {

		// converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format

		const length = array.length - 3;
		const points = new Float32Array( 2 * length );

		for ( let i = 0; i < length; i += 3 ) {

			points[ 2 * i ] = array[ i ];
			points[ 2 * i + 1 ] = array[ i + 1 ];
			points[ 2 * i + 2 ] = array[ i + 2 ];

			points[ 2 * i + 3 ] = array[ i + 3 ];
			points[ 2 * i + 4 ] = array[ i + 4 ];
			points[ 2 * i + 5 ] = array[ i + 5 ];

		}

		super.setPositions( points );

		return this;

	}

	setColors( array ) {

		// converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format

		const length = array.length - 3;
		const colors = new Float32Array( 2 * length );

		for ( let i = 0; i < length; i += 3 ) {

			colors[ 2 * i ] = array[ i ];
			colors[ 2 * i + 1 ] = array[ i + 1 ];
			colors[ 2 * i + 2 ] = array[ i + 2 ];

			colors[ 2 * i + 3 ] = array[ i + 3 ];
			colors[ 2 * i + 4 ] = array[ i + 4 ];
			colors[ 2 * i + 5 ] = array[ i + 5 ];

		}

		super.setColors( colors );

		return this;

	}

	setFromPoints( points ) {

		// converts a vector3 or vector2 array to pairs format

		const length = points.length - 1;
		const positions = new Float32Array( 6 * length );

		for ( let i = 0; i < length; i ++ ) {

			positions[ 6 * i ] = points[ i ].x;
			positions[ 6 * i + 1 ] = points[ i ].y;
			positions[ 6 * i + 2 ] = points[ i ].z || 0;

			positions[ 6 * i + 3 ] = points[ i + 1 ].x;
			positions[ 6 * i + 4 ] = points[ i + 1 ].y;
			positions[ 6 * i + 5 ] = points[ i + 1 ].z || 0;

		}

		super.setPositions( positions );

		return this;

	}

	fromLine( line ) {

		const geometry = line.geometry;

		this.setPositions( geometry.attributes.position.array ); // assumes non-indexed

		// set colors, maybe

		return this;

	}

}




/***/ },

/***/ "./node_modules/super-three/examples/jsm/lines/LineMaterial.js"
/*!*********************************************************************!*\
  !*** ./node_modules/super-three/examples/jsm/lines/LineMaterial.js ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LineMaterial: () => (/* binding */ LineMaterial)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");


three__WEBPACK_IMPORTED_MODULE_0__.UniformsLib.line = {

	worldUnits: { value: 1 },
	linewidth: { value: 1 },
	resolution: { value: new three__WEBPACK_IMPORTED_MODULE_0__.Vector2( 1, 1 ) },
	dashOffset: { value: 0 },
	dashScale: { value: 1 },
	dashSize: { value: 1 },
	gapSize: { value: 1 } // todo FIX - maybe change to totalSize

};

three__WEBPACK_IMPORTED_MODULE_0__.ShaderLib[ 'line' ] = {

	uniforms: three__WEBPACK_IMPORTED_MODULE_0__.UniformsUtils.merge( [
		three__WEBPACK_IMPORTED_MODULE_0__.UniformsLib.common,
		three__WEBPACK_IMPORTED_MODULE_0__.UniformsLib.fog,
		three__WEBPACK_IMPORTED_MODULE_0__.UniformsLib.line
	] ),

	vertexShader:
	/* glsl */`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	fragmentShader:
	/* glsl */`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`
};

class LineMaterial extends three__WEBPACK_IMPORTED_MODULE_0__.ShaderMaterial {

	constructor( parameters ) {

		super( {

			type: 'LineMaterial',
			uniforms: three__WEBPACK_IMPORTED_MODULE_0__.UniformsUtils.clone( three__WEBPACK_IMPORTED_MODULE_0__.ShaderLib[ 'line' ].uniforms ),

			vertexShader: three__WEBPACK_IMPORTED_MODULE_0__.ShaderLib[ 'line' ].vertexShader,
			fragmentShader: three__WEBPACK_IMPORTED_MODULE_0__.ShaderLib[ 'line' ].fragmentShader,

			clipping: true // required for clipping support

		} );

		this.isLineMaterial = true;

		this.setValues( parameters );

	}

	get color() {

		return this.uniforms.diffuse.value;

	}

	set color( value ) {

		this.uniforms.diffuse.value = value;

	}

	get worldUnits() {

		return 'WORLD_UNITS' in this.defines;

	}

	set worldUnits( value ) {

		if ( value === true ) {

			this.defines.WORLD_UNITS = '';

		} else {

			delete this.defines.WORLD_UNITS;

		}

	}

	get linewidth() {

		return this.uniforms.linewidth.value;

	}

	set linewidth( value ) {

		if ( ! this.uniforms.linewidth ) return;
		this.uniforms.linewidth.value = value;

	}

	get dashed() {

		return 'USE_DASH' in this.defines;

	}

	set dashed( value ) {

		if ( ( value === true ) !== this.dashed ) {

			this.needsUpdate = true;

		}

		if ( value === true ) {

			this.defines.USE_DASH = '';

		} else {

			delete this.defines.USE_DASH;

		}

	}

	get dashScale() {

		return this.uniforms.dashScale.value;

	}

	set dashScale( value ) {

		this.uniforms.dashScale.value = value;

	}

	get dashSize() {

		return this.uniforms.dashSize.value;

	}

	set dashSize( value ) {

		this.uniforms.dashSize.value = value;

	}

	get dashOffset() {

		return this.uniforms.dashOffset.value;

	}

	set dashOffset( value ) {

		this.uniforms.dashOffset.value = value;

	}

	get gapSize() {

		return this.uniforms.gapSize.value;

	}

	set gapSize( value ) {

		this.uniforms.gapSize.value = value;

	}

	get opacity() {

		return this.uniforms.opacity.value;

	}

	set opacity( value ) {

		if ( ! this.uniforms ) return;
		this.uniforms.opacity.value = value;

	}

	get resolution() {

		return this.uniforms.resolution.value;

	}

	set resolution( value ) {

		this.uniforms.resolution.value.copy( value );

	}

	get alphaToCoverage() {

		return 'USE_ALPHA_TO_COVERAGE' in this.defines;

	}

	set alphaToCoverage( value ) {

		if ( ! this.defines ) return;

		if ( ( value === true ) !== this.alphaToCoverage ) {

			this.needsUpdate = true;

		}

		if ( value === true ) {

			this.defines.USE_ALPHA_TO_COVERAGE = '';

		} else {

			delete this.defines.USE_ALPHA_TO_COVERAGE;

		}

	}

}




/***/ },

/***/ "./node_modules/super-three/examples/jsm/lines/LineSegments2.js"
/*!**********************************************************************!*\
  !*** ./node_modules/super-three/examples/jsm/lines/LineSegments2.js ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LineSegments2: () => (/* binding */ LineSegments2)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var _lines_LineSegmentsGeometry_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lines/LineSegmentsGeometry.js */ "./node_modules/super-three/examples/jsm/lines/LineSegmentsGeometry.js");
/* harmony import */ var _lines_LineMaterial_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lines/LineMaterial.js */ "./node_modules/super-three/examples/jsm/lines/LineMaterial.js");




const _viewport = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4();

const _start = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _end = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

const _start4 = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4();
const _end4 = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4();

const _ssOrigin = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4();
const _ssOrigin3 = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
const _mvMatrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
const _line = new three__WEBPACK_IMPORTED_MODULE_0__.Line3();
const _closestPoint = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

const _box = new three__WEBPACK_IMPORTED_MODULE_0__.Box3();
const _sphere = new three__WEBPACK_IMPORTED_MODULE_0__.Sphere();
const _clipToWorldVector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4();

let _ray, _lineWidth;

// Returns the margin required to expand by in world space given the distance from the camera,
// line width, resolution, and camera projection
function getWorldSpaceHalfWidth( camera, distance, resolution ) {

	// transform into clip space, adjust the x and y values by the pixel width offset, then
	// transform back into world space to get world offset. Note clip space is [-1, 1] so full
	// width does not need to be halved.
	_clipToWorldVector.set( 0, 0, - distance, 1.0 ).applyMatrix4( camera.projectionMatrix );
	_clipToWorldVector.multiplyScalar( 1.0 / _clipToWorldVector.w );
	_clipToWorldVector.x = _lineWidth / resolution.width;
	_clipToWorldVector.y = _lineWidth / resolution.height;
	_clipToWorldVector.applyMatrix4( camera.projectionMatrixInverse );
	_clipToWorldVector.multiplyScalar( 1.0 / _clipToWorldVector.w );

	return Math.abs( Math.max( _clipToWorldVector.x, _clipToWorldVector.y ) );

}

function raycastWorldUnits( lineSegments, intersects ) {

	const matrixWorld = lineSegments.matrixWorld;
	const geometry = lineSegments.geometry;
	const instanceStart = geometry.attributes.instanceStart;
	const instanceEnd = geometry.attributes.instanceEnd;
	const segmentCount = Math.min( geometry.instanceCount, instanceStart.count );

	for ( let i = 0, l = segmentCount; i < l; i ++ ) {

		_line.start.fromBufferAttribute( instanceStart, i );
		_line.end.fromBufferAttribute( instanceEnd, i );

		_line.applyMatrix4( matrixWorld );

		const pointOnLine = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
		const point = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

		_ray.distanceSqToSegment( _line.start, _line.end, point, pointOnLine );
		const isInside = point.distanceTo( pointOnLine ) < _lineWidth * 0.5;

		if ( isInside ) {

			intersects.push( {
				point,
				pointOnLine,
				distance: _ray.origin.distanceTo( point ),
				object: lineSegments,
				face: null,
				faceIndex: i,
				uv: null,
				uv1: null,
			} );

		}

	}

}

function raycastScreenSpace( lineSegments, camera, intersects ) {

	const projectionMatrix = camera.projectionMatrix;
	const material = lineSegments.material;
	const resolution = material.resolution;
	const matrixWorld = lineSegments.matrixWorld;

	const geometry = lineSegments.geometry;
	const instanceStart = geometry.attributes.instanceStart;
	const instanceEnd = geometry.attributes.instanceEnd;
	const segmentCount = Math.min( geometry.instanceCount, instanceStart.count );

	const near = - camera.near;

	//

	// pick a point 1 unit out along the ray to avoid the ray origin
	// sitting at the camera origin which will cause "w" to be 0 when
	// applying the projection matrix.
	_ray.at( 1, _ssOrigin );

	// ndc space [ - 1.0, 1.0 ]
	_ssOrigin.w = 1;
	_ssOrigin.applyMatrix4( camera.matrixWorldInverse );
	_ssOrigin.applyMatrix4( projectionMatrix );
	_ssOrigin.multiplyScalar( 1 / _ssOrigin.w );

	// screen space
	_ssOrigin.x *= resolution.x / 2;
	_ssOrigin.y *= resolution.y / 2;
	_ssOrigin.z = 0;

	_ssOrigin3.copy( _ssOrigin );

	_mvMatrix.multiplyMatrices( camera.matrixWorldInverse, matrixWorld );

	for ( let i = 0, l = segmentCount; i < l; i ++ ) {

		_start4.fromBufferAttribute( instanceStart, i );
		_end4.fromBufferAttribute( instanceEnd, i );

		_start4.w = 1;
		_end4.w = 1;

		// camera space
		_start4.applyMatrix4( _mvMatrix );
		_end4.applyMatrix4( _mvMatrix );

		// skip the segment if it's entirely behind the camera
		const isBehindCameraNear = _start4.z > near && _end4.z > near;
		if ( isBehindCameraNear ) {

			continue;

		}

		// trim the segment if it extends behind camera near
		if ( _start4.z > near ) {

			const deltaDist = _start4.z - _end4.z;
			const t = ( _start4.z - near ) / deltaDist;
			_start4.lerp( _end4, t );

		} else if ( _end4.z > near ) {

			const deltaDist = _end4.z - _start4.z;
			const t = ( _end4.z - near ) / deltaDist;
			_end4.lerp( _start4, t );

		}

		// clip space
		_start4.applyMatrix4( projectionMatrix );
		_end4.applyMatrix4( projectionMatrix );

		// ndc space [ - 1.0, 1.0 ]
		_start4.multiplyScalar( 1 / _start4.w );
		_end4.multiplyScalar( 1 / _end4.w );

		// screen space
		_start4.x *= resolution.x / 2;
		_start4.y *= resolution.y / 2;

		_end4.x *= resolution.x / 2;
		_end4.y *= resolution.y / 2;

		// create 2d segment
		_line.start.copy( _start4 );
		_line.start.z = 0;

		_line.end.copy( _end4 );
		_line.end.z = 0;

		// get closest point on ray to segment
		const param = _line.closestPointToPointParameter( _ssOrigin3, true );
		_line.at( param, _closestPoint );

		// check if the intersection point is within clip space
		const zPos = three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.lerp( _start4.z, _end4.z, param );
		const isInClipSpace = zPos >= - 1 && zPos <= 1;

		const isInside = _ssOrigin3.distanceTo( _closestPoint ) < _lineWidth * 0.5;

		if ( isInClipSpace && isInside ) {

			_line.start.fromBufferAttribute( instanceStart, i );
			_line.end.fromBufferAttribute( instanceEnd, i );

			_line.start.applyMatrix4( matrixWorld );
			_line.end.applyMatrix4( matrixWorld );

			const pointOnLine = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
			const point = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

			_ray.distanceSqToSegment( _line.start, _line.end, point, pointOnLine );

			intersects.push( {
				point: point,
				pointOnLine: pointOnLine,
				distance: _ray.origin.distanceTo( point ),
				object: lineSegments,
				face: null,
				faceIndex: i,
				uv: null,
				uv1: null,
			} );

		}

	}

}

class LineSegments2 extends three__WEBPACK_IMPORTED_MODULE_0__.Mesh {

	constructor( geometry = new _lines_LineSegmentsGeometry_js__WEBPACK_IMPORTED_MODULE_1__.LineSegmentsGeometry(), material = new _lines_LineMaterial_js__WEBPACK_IMPORTED_MODULE_2__.LineMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		this.isLineSegments2 = true;

		this.type = 'LineSegments2';

	}

	// for backwards-compatibility, but could be a method of LineSegmentsGeometry...

	computeLineDistances() {

		const geometry = this.geometry;

		const instanceStart = geometry.attributes.instanceStart;
		const instanceEnd = geometry.attributes.instanceEnd;
		const lineDistances = new Float32Array( 2 * instanceStart.count );

		for ( let i = 0, j = 0, l = instanceStart.count; i < l; i ++, j += 2 ) {

			_start.fromBufferAttribute( instanceStart, i );
			_end.fromBufferAttribute( instanceEnd, i );

			lineDistances[ j ] = ( j === 0 ) ? 0 : lineDistances[ j - 1 ];
			lineDistances[ j + 1 ] = lineDistances[ j ] + _start.distanceTo( _end );

		}

		const instanceDistanceBuffer = new three__WEBPACK_IMPORTED_MODULE_0__.InstancedInterleavedBuffer( lineDistances, 2, 1 ); // d0, d1

		geometry.setAttribute( 'instanceDistanceStart', new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 0 ) ); // d0
		geometry.setAttribute( 'instanceDistanceEnd', new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBufferAttribute( instanceDistanceBuffer, 1, 1 ) ); // d1

		return this;

	}

	raycast( raycaster, intersects ) {

		const worldUnits = this.material.worldUnits;
		const camera = raycaster.camera;

		if ( camera === null && ! worldUnits ) {

			console.error( 'LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.' );

		}

		const threshold = ( raycaster.params.Line2 !== undefined ) ? raycaster.params.Line2.threshold || 0 : 0;

		_ray = raycaster.ray;

		const matrixWorld = this.matrixWorld;
		const geometry = this.geometry;
		const material = this.material;

		_lineWidth = material.linewidth + threshold;

		// check if we intersect the sphere bounds
		if ( geometry.boundingSphere === null ) {

			geometry.computeBoundingSphere();

		}

		_sphere.copy( geometry.boundingSphere ).applyMatrix4( matrixWorld );

		// increase the sphere bounds by the worst case line screen space width
		let sphereMargin;
		if ( worldUnits ) {

			sphereMargin = _lineWidth * 0.5;

		} else {

			const distanceToSphere = Math.max( camera.near, _sphere.distanceToPoint( _ray.origin ) );
			sphereMargin = getWorldSpaceHalfWidth( camera, distanceToSphere, material.resolution );

		}

		_sphere.radius += sphereMargin;

		if ( _ray.intersectsSphere( _sphere ) === false ) {

			return;

		}

		// check if we intersect the box bounds
		if ( geometry.boundingBox === null ) {

			geometry.computeBoundingBox();

		}

		_box.copy( geometry.boundingBox ).applyMatrix4( matrixWorld );

		// increase the box bounds by the worst case line width
		let boxMargin;
		if ( worldUnits ) {

			boxMargin = _lineWidth * 0.5;

		} else {

			const distanceToBox = Math.max( camera.near, _box.distanceToPoint( _ray.origin ) );
			boxMargin = getWorldSpaceHalfWidth( camera, distanceToBox, material.resolution );

		}

		_box.expandByScalar( boxMargin );

		if ( _ray.intersectsBox( _box ) === false ) {

			return;

		}

		if ( worldUnits ) {

			raycastWorldUnits( this, intersects );

		} else {

			raycastScreenSpace( this, camera, intersects );

		}

	}

	onBeforeRender( renderer ) {

		const uniforms = this.material.uniforms;

		if ( uniforms && uniforms.resolution ) {

			renderer.getViewport( _viewport );
			this.material.uniforms.resolution.value.set( _viewport.z, _viewport.w );

		}

	}

}




/***/ },

/***/ "./node_modules/super-three/examples/jsm/lines/LineSegmentsGeometry.js"
/*!*****************************************************************************!*\
  !*** ./node_modules/super-three/examples/jsm/lines/LineSegmentsGeometry.js ***!
  \*****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LineSegmentsGeometry: () => (/* binding */ LineSegmentsGeometry)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");


const _box = new three__WEBPACK_IMPORTED_MODULE_0__.Box3();
const _vector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

class LineSegmentsGeometry extends three__WEBPACK_IMPORTED_MODULE_0__.InstancedBufferGeometry {

	constructor() {

		super();

		this.isLineSegmentsGeometry = true;

		this.type = 'LineSegmentsGeometry';

		const positions = [ - 1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0 ];
		const uvs = [ - 1, 2, 1, 2, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 2, 1, - 2 ];
		const index = [ 0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5 ];

		this.setIndex( index );
		this.setAttribute( 'position', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( positions, 3 ) );
		this.setAttribute( 'uv', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( uvs, 2 ) );

	}

	applyMatrix4( matrix ) {

		const start = this.attributes.instanceStart;
		const end = this.attributes.instanceEnd;

		if ( start !== undefined ) {

			start.applyMatrix4( matrix );

			end.applyMatrix4( matrix );

			start.needsUpdate = true;

		}

		if ( this.boundingBox !== null ) {

			this.computeBoundingBox();

		}

		if ( this.boundingSphere !== null ) {

			this.computeBoundingSphere();

		}

		return this;

	}

	setPositions( array ) {

		let lineSegments;

		if ( array instanceof Float32Array ) {

			lineSegments = array;

		} else if ( Array.isArray( array ) ) {

			lineSegments = new Float32Array( array );

		}

		const instanceBuffer = new three__WEBPACK_IMPORTED_MODULE_0__.InstancedInterleavedBuffer( lineSegments, 6, 1 ); // xyz, xyz

		this.setAttribute( 'instanceStart', new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBufferAttribute( instanceBuffer, 3, 0 ) ); // xyz
		this.setAttribute( 'instanceEnd', new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBufferAttribute( instanceBuffer, 3, 3 ) ); // xyz

		this.instanceCount = this.attributes.instanceStart.count;

		//

		this.computeBoundingBox();
		this.computeBoundingSphere();

		return this;

	}

	setColors( array ) {

		let colors;

		if ( array instanceof Float32Array ) {

			colors = array;

		} else if ( Array.isArray( array ) ) {

			colors = new Float32Array( array );

		}

		const instanceColorBuffer = new three__WEBPACK_IMPORTED_MODULE_0__.InstancedInterleavedBuffer( colors, 6, 1 ); // rgb, rgb

		this.setAttribute( 'instanceColorStart', new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBufferAttribute( instanceColorBuffer, 3, 0 ) ); // rgb
		this.setAttribute( 'instanceColorEnd', new three__WEBPACK_IMPORTED_MODULE_0__.InterleavedBufferAttribute( instanceColorBuffer, 3, 3 ) ); // rgb

		return this;

	}

	fromWireframeGeometry( geometry ) {

		this.setPositions( geometry.attributes.position.array );

		return this;

	}

	fromEdgesGeometry( geometry ) {

		this.setPositions( geometry.attributes.position.array );

		return this;

	}

	fromMesh( mesh ) {

		this.fromWireframeGeometry( new three__WEBPACK_IMPORTED_MODULE_0__.WireframeGeometry( mesh.geometry ) );

		// set colors, maybe

		return this;

	}

	fromLineSegments( lineSegments ) {

		const geometry = lineSegments.geometry;

		this.setPositions( geometry.attributes.position.array ); // assumes non-indexed

		// set colors, maybe

		return this;

	}

	computeBoundingBox() {

		if ( this.boundingBox === null ) {

			this.boundingBox = new three__WEBPACK_IMPORTED_MODULE_0__.Box3();

		}

		const start = this.attributes.instanceStart;
		const end = this.attributes.instanceEnd;

		if ( start !== undefined && end !== undefined ) {

			this.boundingBox.setFromBufferAttribute( start );

			_box.setFromBufferAttribute( end );

			this.boundingBox.union( _box );

		}

	}

	computeBoundingSphere() {

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new three__WEBPACK_IMPORTED_MODULE_0__.Sphere();

		}

		if ( this.boundingBox === null ) {

			this.computeBoundingBox();

		}

		const start = this.attributes.instanceStart;
		const end = this.attributes.instanceEnd;

		if ( start !== undefined && end !== undefined ) {

			const center = this.boundingSphere.center;

			this.boundingBox.getCenter( center );

			let maxRadiusSq = 0;

			for ( let i = 0, il = start.count; i < il; i ++ ) {

				_vector.fromBufferAttribute( start, i );
				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

				_vector.fromBufferAttribute( end, i );
				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

			}

			this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

			if ( isNaN( this.boundingSphere.radius ) ) {

				console.error( 'THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this );

			}

		}

	}

	toJSON() {

		// todo

	}

	applyMatrix( matrix ) {

		console.warn( 'THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().' );

		return this.applyMatrix4( matrix );

	}

}




/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _connecting_line2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./connecting-line2.js */ "./connecting-line2.js");
/* harmony import */ var _connecting_line_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connecting-line.js */ "./connecting-line.js");
/* harmony import */ var _connecting_line_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_connecting_line_js__WEBPACK_IMPORTED_MODULE_1__);
// aframe-connecting-line — webpack entry.
//
// Registers BOTH components into the single bundled dist/connecting-line.js:
//  - connecting-line2 : the Line2-based renderer (width + dash + tube).
//  - connecting-line  : the paper-thin backward-compatibility wrapper.
//
// Order matters: connecting-line2 must be registered before the wrapper's
// update() can set a `connecting-line2__<id>` attribute. Importing it first
// guarantees registration order.



})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=connecting-line.js.map
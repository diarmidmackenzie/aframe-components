# Release notes

## 0.5.0

### Fixed

- **World-unit line widths are now correct under an orthographic camera.**
  `THREE.LineMaterial` builds its extrusion basis by facing the camera
  *position*, which assumes viewing rays converge there — true under
  perspective, false under an orthographic projection, whose rays are parallel.
  A `units: m` stroke was therefore narrowed by `|d| / sqrt(d² + r²)`: correct at
  the centre of the image and progressively thinner away from it, with
  axis-aligned hairlines disappearing altogether from captures rendered without
  multisampling.

  **This changes rendered output.** If you draw `units: m` lines under an
  orthographic camera, strokes away from the image centre will now be *heavier*
  than in `0.4.0` — they are rendering at the width you asked for. Nothing
  changes under a perspective camera, in VR, or for `units: px`.

  This is a three.js bug, fixed upstream by
  [mrdoob/three.js#34540](https://github.com/mrdoob/three.js/pull/34540)
  (milestone r187). That one-line patch is applied here per `LineMaterial`
  instance until the bundled three.js carries it, at which point it becomes a
  no-op. If a future three.js changes the shader beyond recognition, the
  component logs an error at load and renders without the correction rather than
  failing.

- Line width and dash sizes are no longer scaled wrongly when rendering into an
  offscreen `WebGLRenderTarget` (screenshot / thumbnail passes). The render
  target's own dimensions are now used as the per-pass basis, except under
  WebXR, where the per-eye viewport remains correct.

### New

- **`layer`** — sets the THREE render layer of the visible stroke. Defaults to
  `0`, so existing configurations are unaffected. Use it to keep a stroke out of
  a render pass that masks layers, e.g. excluding a UI indicator line from a
  screenshot.

- `test/units-ortho-extrusion.html` demonstrates the orthographic extrusion fix,
  with a toggle between the old and new behaviour.

## 0.4.0

### New

- **`connecting-line2`** — a new `THREE.Line2`-based component: line **width** in
  pixels or world units, **dash patterns** (including multi-element dash-dot /
  dash-dot-dot), and an optional solid tube. New work should use this component.
- Raycast hover/click picking, via an invisible `THREE.Line` pick proxy that
  tracks the line endpoints. The pick band is `raycaster.params.Line.threshold`
  (world units, camera-independent); configure it with the
  [`raycaster-thresholds`](../raycaster-thresholds/) component.

### Changed (breaking)

- **`connecting-line` is now a backward-compatibility wrapper** over
  `connecting-line2`. Its `0.3.x` schema is unchanged, so existing configurations
  keep working.
- **The package now ships a built bundle under `dist/`.** Update your include path
  from `connecting-line/index.js` to `dist/connecting-line.js` (or `.min.js`).
  npm / bundler consumers: `main` and `module` already point at the bundle.
- **Minimum A-Frame is now 1.5.0.** The base stroke uses `THREE.Line2`
  (`three/examples/jsm/lines`), which needs the `THREE` that A-Frame 1.5.0+ ships.
  On A-Frame ≤ 1.4.0, stay on a `0.3.x` release.
- **`width: 0` now makes the line invisible** (in `0.3.x` it rendered a 1px line).

### Fixed

- The `updateEvent` end-entity listener is removed on teardown (previously leaked).
- `updateEvent` listeners rebind when the `start` / `end` **entity** is swapped at
  runtime (previously they stayed on the old entity).

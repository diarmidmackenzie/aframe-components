# Release notes

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

# aframe-connecting-line

Draws a line between points on two entities, with control over **width**
(in pixels or world units) and **dash patterns** (including multi-element
patterns like dash-dot), using `THREE.Line2`. The line position updates
automatically whenever the entity at either end moves.

This package registers **two** A-Frame components:

- **`connecting-line2`** — the component you should use. A `THREE.Line2`
  stroke with width control, rich dash patterns, and an optional solid tube.
- **`connecting-line`** — a **backward-compatibility wrapper** that keeps the
  original (`0.3.x`) schema and maps it onto `connecting-line2`. Existing
  consumers keep working unchanged; new consumers should use
  `connecting-line2`. Its schema is documented in
  [`connecting-line-legacy.md`](./connecting-line-legacy.md).

## Requirements

**A-Frame ≥ 1.5.0.** `connecting-line2` renders with `THREE.Line2`
(`three/examples/jsm/lines`), which needs the version of `THREE` that A-Frame
1.5.0+ ships — it does **not** render on A-Frame ≤ 1.4.0. (The `0.3.x` releases
used `THREE.Line` from core and ran on any A-Frame version; this minimum is new
in `0.4.0` — see [Upgrading from 0.3.x](#upgrading-from-03x).)

## Installation

> **⚠ Breaking packaging change in 0.4.0.** This package now ships a built
> bundle under `dist/`. The raw entry point is no longer `index.js`. If you
> were including the source directly with
> `<script src=".../connecting-line/index.js">`, switch to the bundle path
> below. Schema and render behaviour are otherwise backward-compatible (via
> the `connecting-line` wrapper) — only the include path changed.

```html
<!-- via CDN (development build) -->
<script src="https://cdn.jsdelivr.net/npm/aframe-connecting-line@0.4.0/dist/connecting-line.js"></script>

<!-- via CDN (minified build) -->
<script src="https://cdn.jsdelivr.net/npm/aframe-connecting-line@0.4.0/dist/connecting-line.min.js"></script>
```

Or via npm:

```
npm install aframe-connecting-line
```

```js
import 'aframe-connecting-line'; // registers both components
```

## Upgrading from 0.3.x

The `connecting-line` schema is **unchanged**, so existing configurations keep
working without edits. Three things need action on upgrade:

1. **Change the include path.** The package now ships a built bundle, not raw
   source. Update
   `<script src=".../connecting-line/index.js">` →
   `<script src=".../connecting-line/dist/connecting-line.js">` (or `.min.js`).
   npm / bundler consumers: `main` and `module` already point at the bundle —
   just ensure `THREE` is exposed as a global (A-Frame sets `window.THREE`
   automatically).

2. **Check your A-Frame version: 1.5.0 is now the minimum.** The base stroke is
   now `THREE.Line2`, which needs the `THREE` A-Frame 1.5.0+ ships; on A-Frame
   ≤ 1.4.0 the lines will not render. If you can't upgrade A-Frame, stay on a
   `0.3.x` release.

3. **Be aware of two minor behaviour changes** (no config change needed):
   - The base stroke is a `THREE.Line2` instead of a 1px `THREE.Line` — it is
     antialiased, and the too-thin-on-high-resolution-export hairline is fixed.
     Its raycast / hover hit threshold differs slightly from the old thin line.
   - `updateEvent` listeners are now cleaned up / rebound correctly: the
     end-entity listener is removed on teardown (previously leaked), and
     listeners rebind when the `start` / `end` **entity** is swapped at runtime
     (previously they stayed on the old entity).

**New capabilities** — width, units, dash patterns, and the optional tube — are
on the new `connecting-line2` component (schema below). New work should use
`connecting-line2`; the `connecting-line` wrapper exists only for back-compat.

## `connecting-line2` schema

| Property              | Type            | Default   | Description |
| --------------------- | --------------- | --------- | ----------- |
| start                 | selector        |           | Entity to draw the line from. |
| startOffset           | vec3            | 0 0 0     | Offset of the line start, in the start entity's local space. |
| end                   | selector        |           | Entity to draw the line to. |
| endOffset             | vec3            | 0 0 0     | Offset of the line end, in the end entity's local space. |
| color                 | color           | #74BEC1   | Line colour. |
| opacity               | number          | 1         | Line opacity. |
| visible               | bool            | true      | Whether the line is visible. |
| lengthAdjustment      | none/scale/extend/absolute | none | How to adjust the rendered length relative to the start–end distance (see below). |
| lengthAdjustmentValue | number          | 0         | Value used by `lengthAdjustment` (meaning depends on the mode). |
| updateEvent           | string          | ""        | If set, per-`tick()` auto-update is suspended; the line only updates when this event fires on the start entity, end entity, or this entity. Useful for static or rarely-moving lines. |
| **width**             | number          | **1**     | Line **width**, in `units`. Decimals allowed. `0` = invisible (no floor); sub-1px `px` widths render as faint antialiased hairlines. |
| **units**             | px / m          | **px**    | Unit for the **width**. `px` = screen-constant; `m` = world units (scales with zoom). |
| **dash**              | array of number | **[]**    | Dash pattern `[dashA, gapA, dashB, gapB, …]` in `dashUnits`. Empty ⇒ solid. An odd-length array drops its trailing element (`[1,1,1]`→`[1,1]`; `[5]`→solid). Multi-element arrays produce dash-dot / dash-dot-dot patterns (decomposed into overlaid lines internally). |
| **dashUnits**         | auto / px / m   | **auto**  | Unit for the **dash** pattern. `auto` matches `units` — except under a perspective camera, where a `px` width's dash upgrades to world units (avoids disorienting shrink-on-approach in VR). Net: `auto` → `px` only when `units: px` **and** an orthographic camera, else `m`. Resolved per render from the active camera. |
| **raycastUnits**      | px / m / auto   | **auto**  | Unit for **raycast (hover/click) detection** — **independent of render `units`** (see below). `px` = stock screen-space pick (2D mouse). `m` = a custom world-distance pick, exact and depth-correct under perspective (the VR controller-ray case). `auto` mirrors `dashUnits: auto`: `px` under an orthographic camera, `m` under perspective. The threshold (pick band) comes from `raycaster.params.Line2.threshold` — set it via [`raycaster-thresholds`](../raycaster-thresholds/). |
| **dashOffset**        | number          | **0**     | Phase offset into the pattern, in `dashUnits`. |
| **tubeRadius**        | number          | **0**     | Optional solid cylinder radius (world units), rendered **in addition to** the line. `0` = no tube. Always solid; never dashes. |
| **segments**          | int             | **4**     | Tube radial segments (only used when `tubeRadius > 0`). |
| **shader**            | string          | **flat**  | Tube material shader (only used when `tubeRadius > 0`). |

### Width vs dash units

`width` and `dash` have **independent** units. `units` controls the line
width; `dashUnits` controls the dash pattern. The default `dashUnits: auto`
keeps the dash:width ratio constant by matching the width unit, with the one
perspective-camera override noted above.

### Dash patterns and overlay decomposition

A single dashed `LineMaterial` can express only one dash/gap pair. Patterns
with more than one (dash-dot, dash-dot-dot) are decomposed into **N overlaid
`Line2`s**, one per dash run, sharing one geometry. Examples (values in
`dashUnits`):

| `dash`            | Pattern        | Overlays `(dashSize, gapSize, dashOffset)` |
| ----------------- | -------------- | ------------------------------------------ |
| `[]`              | solid          | one solid line                              |
| `[4,4]`           | dashed         | `(4, 4, 0)`                                 |
| `[1,3]`           | dotted*        | `(1, 3, 0)`                                 |
| `[6,2,1,2]`       | dash-dot       | `(6, 5, 0)`, `(1, 10, 3)`                   |
| `[6,2,1,2,1,2]`   | dash-dot-dot   | `(6, 8, 0)`, `(1, 13, 6)`, `(1, 13, 3)`     |

\* Dashes are butt-capped (`LineMaterial` has no cap option), so a "dot"
renders as a small square, not a round dot.

### Raycast detection — independent of render width

`raycastUnits` controls how the line is **picked** (hover / click), and it is
**orthogonal to render `units`**. THREE's stock `Line2` raycast welds the two —
it picks the screen-space (`px`) or world-space (`m`) path off
`material.worldUnits`, a *render* setting — so a `px`-width line is forced into
`px` detection. `connecting-line2` decouples them by raycasting against a single
dedicated pick line with a custom `.raycast`:

- `raycastUnits: m` runs an exact **world-distance** test (`THREE.Line`-style: the
  render width contributes nothing to the pick band). This makes a **1px stroke
  picked by world distance** — a thin ray visible into the far distance but not
  bloated up close, picked by a fixed physical tolerance — a legal, exact
  combination. This is the common VR controller-ray primitive:

  ```html
  <!-- 1px ray, picked by a fixed ~5cm world band, exact at any depth -->
  <a-entity connecting-line2="start:#a; end:#b; width:1; units:px; raycastUnits:m"></a-entity>
  <!-- the cursor's raycaster needs a metres Line2 threshold: -->
  <a-entity cursor="rayOrigin:mouse" raycaster="objects:.line"
            raycaster-thresholds="line:0.05"></a-entity>
  ```

- `raycastUnits: px` delegates to THREE's stock screen-space raycast (2D mouse;
  the threshold is in pixels — set `raycaster-thresholds="line2Mode:set; line2:8"`).
- `raycastUnits: auto` resolves to `px` under an orthographic camera, `m` under
  perspective.

The pick band itself is `raycaster.params.Line2.threshold` — set it with
[`raycaster-thresholds`](../raycaster-thresholds/). **You must set a threshold to
pick:** with none set the band is zero-width — only an *exact* on-line hit
registers, which is effectively unpickable for a thin stroke. (`connecting-line2`
`console.warn`s once if an `m`-detect pick runs with no threshold, so this
dead-zone isn't silent.)

**The host entity must be raycastable.** `connecting-line2` exposes a pick
object, but picking only happens if the **host entity matches the raycaster's
`objects` selector** — e.g. give it a class the cursor targets:

```html
<a-entity class="raycast-target"
  connecting-line2="start:#a; end:#b; raycastUnits:m"></a-entity>
<a-entity cursor="rayOrigin:mouse" raycaster="objects:.raycast-target"
          raycaster-thresholds="line:0.05"></a-entity>
```

The library makes the line raycast-*able*; the consumer makes the entity
raycast-*ed* (mirrors simple-draw's line-hover pattern).

**One raycaster, one detection model.** `params.Line2.threshold` is a single
value per raycaster, so keep a given raycaster's targets homogeneous (a VR
controller's targets should all be `m`-detecting). Dashed lines pick as **one**
hit (the N dash overlays are render-only; raycasting targets a single pick line).
Hits return the standard `{ point, distance, object }` shape (with `object.el`
back-referencing the host entity), just like the stock `Line2` raycast path.

### Length adjustment

`lengthAdjustment` (with `lengthAdjustmentValue`):

- **none** — value ignored; line spans start→end exactly.
- **scale** — value is a scale factor relative to the actual distance.
- **extend** — value is an absolute length to extend by (negative trims short).
- **absolute** — value is an absolute target length, ignoring the actual distance.

## Examples

- [connecting-line2 pattern gallery](https://diarmidmackenzie.github.io/aframe-components/component-usage/connecting-line/connecting-line2-styles.html)
- [connecting-line2 interactive (dat-gui)](https://diarmidmackenzie.github.io/aframe-components/component-usage/connecting-line/connecting-line2-interactive.html)
- [legacy connecting-line usage](https://diarmidmackenzie.github.io/aframe-components/component-usage/connecting-line.html)

Developer test harnesses live in [`test/`](./test/): `width.html`,
`length-factor.html`, `event-updates.html`, `start-end-disappear.html`,
`dashed.html`, `units-ortho.html`, `units-perspective.html`, `legacy-compat.html`,
`raycast-vr-ray.html` (perspective, `raycastUnits:m` 1px ray — grabbable at any
depth), `raycast-screen.html` (orthographic, `raycastUnits:px`/`auto`). The two
raycast harnesses carry a version-floor note: swap the A-Frame `<script>` to
`1.5.0` to confirm `params.Line2.threshold` picking at the supported floor.

## Building

The bundle is built with webpack. `three` is externalized to the page's
global `THREE` (the one A-Frame's renderer uses); only the
`three/examples/jsm/lines/…` sources are bundled (resolved out of the
`super-three` dev-dependency, pinned to the version A-Frame ships —
`super-three@0.173.5`).

> **Consuming from a bundler (Vite / Webpack / Rollup).** The `three`
> external is configured with `externalsType: 'global'`, so the built UMD
> reads `THREE` from the runtime global (`self["THREE"]`) in **every** module
> branch — including the CommonJS branch (it emits `self["THREE"]`, **not**
> `require("THREE")`). This keeps the CDN `<script>` path working and lets a
> bundler consume the dist without a `three` module resolution — **provided
> the host page exposes `THREE` as a global** (A-Frame does this
> automatically by assigning `window.THREE`). A bundler consumer that does
> **not** load A-Frame / does not set a global `THREE` must provide one —
> verify `globalThis.THREE` is populated before this component first renders.

> **Build coupling note.** The deep `three/examples/jsm/lines/…` import relies
> on `super-three`'s `exports["./examples/jsm/*"]` wildcard. If a future
> A-Frame bumps its `super-three`, re-pin the `super-three` dev-dependency to
> match, and re-confirm the bundle still contains the `LineMaterial` shader
> source.

```
npm install
npm run dist        # builds dist/connecting-line.js and dist/connecting-line.min.js
npm run dist:dev    # dev build only
npm run dist:prod   # minified build only
```

## Changelog

### Unreleased

- **New `raycastUnits: px | m | auto`** — controls hover/click **detection**,
  **independent of render `units`**. `m` runs a custom exact world-distance
  raycast (depth-correct under perspective; the 1px VR-ray case), `px` delegates
  to stock screen-space, `auto` mirrors `dashUnits: auto` (px under ortho, m
  under perspective). Raycasting now targets a single dedicated pick line, so a
  dashed line registers one hit, not one per dash overlay. The pick band comes
  from `raycaster.params.Line2.threshold` (set via `raycaster-thresholds`).
- **`raycaster-thresholds`** (sibling component) now drives
  `params.Line2.threshold`: its `line` (m) sets **both** `params.Line` and
  `params.Line2` under the new default `matchLine` mode, plus `line2Mode` /
  `line2` for px targets. THREE's `Raycaster` doesn't define `Line2`, so this is
  what makes `connecting-line2` lines pickable at all. **Bump both components
  together** — pinning an old `raycaster-thresholds` silently loses Line2
  picking.
- Minimum A-Frame unchanged: works on **A-Frame ≥ 1.5.0** (three r158+);
  `params.Line2.threshold` is honoured across the 1.5.0 → 1.7.0 window.

> Versioning note: these entries are written now; the **npm publish** of the
> bundle is a later, post-integration step. simple-draw consumes the
> `aframe-components` branch directly during integration.

### 0.4.0

- **New component `connecting-line2`** — `THREE.Line2` stroke with width
  control (px/world), dash patterns (incl. multi-element dash-dot), and an
  optional solid tube.
- **`connecting-line` is now a backward-compatibility wrapper** over
  `connecting-line2`. Its `0.3.x` schema is preserved.
- **⚠ Breaking packaging change:** the package now ships a built bundle.
  Raw `<script src=".../connecting-line/index.js">` includes must change to
  `.../connecting-line/dist/connecting-line.js`. Schema/render behaviour is
  otherwise backward-compatible.
- **⚠ Minimum A-Frame version is now 1.5.0** (was: any). `connecting-line2`'s
  `THREE.Line2` stroke needs the `THREE` A-Frame 1.5.0+ ships; it does not
  render on A-Frame ≤ 1.4.0.
- **Behaviour changes for legacy `connecting-line` consumers:**
  - The base stroke is now a `THREE.Line2` instead of a 1px `THREE.Line`
    (antialiased; fixes the too-thin hairline on high-resolution export). Its
    raycast / hover hit threshold differs slightly from the old thin line. For
    `width > 0` (cylinder) configs the base line is still drawn in addition to
    the cylinder, exactly as in 0.3.x: up close an opaque cylinder covers it,
    but it keeps the line visible once the cylinder's rendered diameter falls
    below ~1px (far away or zoomed out) — which is its original purpose.
  - The `updateEvent` end-entity listener is now correctly removed on teardown
    (was previously leaked).
  - `updateEvent` listeners now rebind when the `start` / `end` **entity**
    changes at runtime, not only when the event **name** changes (previously
    a swapped target entity left the line listening to the old one).

## Code

- [connecting-line2.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/connecting-line/connecting-line2.js)
- [connecting-line.js (legacy wrapper)](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/connecting-line/connecting-line.js)

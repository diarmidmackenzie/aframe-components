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
`dashed.html`, `units-ortho.html`, `units-perspective.html`, `legacy-compat.html`.

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
- **Behaviour changes for legacy `connecting-line` consumers:**
  - The base stroke is now a `THREE.Line2` instead of a 1px `THREE.Line`
    (antialiased; fixes the too-thin hairline on high-resolution export). For
    `width > 0` configs the crisp 1px base line reads as a faint centre-stripe
    down the cylinder axis.
  - The `updateEvent` end-entity listener is now correctly removed on teardown
    (was previously leaked).
  - `updateEvent` listeners now rebind when the `start` / `end` **entity**
    changes at runtime, not only when the event **name** changes (previously
    a swapped target entity left the line listening to the old one).

## Code

- [connecting-line2.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/connecting-line/connecting-line2.js)
- [connecting-line.js (legacy wrapper)](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/connecting-line/connecting-line.js)

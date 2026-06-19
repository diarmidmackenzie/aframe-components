# aframe-connecting-line

Draws a line between points on two entities, with control over **width**
(in pixels or world units) and **dash patterns** (including multi-element
patterns like dash-dot), using `THREE.Line2`. The line position updates
automatically whenever the entity at either end moves.

This package registers **two** A-Frame components:

- **`connecting-line2`** — the component you should use. A `THREE.Line2`
  stroke with width control, rich dash patterns, and an optional solid tube.
- **`connecting-line`** — a **backward-compatibility wrapper** that offers the
  previous (`0.3.x`) schema and maps it onto `connecting-line2`. Existing
  consumers keep working unchanged; new consumers should use
  `connecting-line2`. Its schema is documented in
  [`connecting-line-legacy.md`](./connecting-line-legacy.md).

## Requirements

**A-Frame ≥ 1.5.0.** both `connecting-line` and`connecting-line2` render with `THREE.Line2`
(`three/examples/jsm/lines`), which needs A-Frame 1.5.0+.

For A-Frame <= 1.4.0, use 0.3.x, which uses `THREE.Line`.

## Installation

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



### Installing v0.3.x and earlier

```
<!-- via CDN (development build) -->
<script src="https://cdn.jsdelivr.net/npm/aframe-connecting-line@0.3.3/connecting-line/index.js"></script>

<!-- via CDN (minified build) -->
<script src="https://cdn.jsdelivr.net/npm/aframe-connecting-line@0.3.3/connecting-line/index.min.js"></script>
```





## Upgrading from 0.3.x to 0.4.x

If you are upgrading from 0.3.x to 0.4.x, you should note the following changes:

### A-Frame Version Compatibility

0.4.X is only compatible with A-Frame 1.5.0+

### Installation path changed

See "Installation" above - you will need to update the path from `connecting-line/index.js` to `dist/connecting-line.js`

### Schema change

v0.4.0 delivers a new component `connecting-line2` with a revised schema, and additional functionality: dash patterns, width configurable in metres or pixels, and different semantics (width = 0 now makes the line invisible; in v0.3.0 it rendered the line at 1px width).

The component `connecting-line` preserves the v0.3.x schema.



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
| width             | number      | 1     | Line width, in `units`. Decimals allowed. `0` = invisible (no floor); sub-1px `px` widths render as faint antialiased hairlines. |
| units             | px / m      | px    | Unit for the width. `px` = screen-constant; `m` = world units (scales with zoom). |
| dash              | array of number | []    | Dash pattern `[dashA, gapA, dashB, gapB, …]` in `dashUnits`. Empty ⇒ solid. An odd-length array drops its trailing element (`[1,1,1]`→`[1,1]`; `[5]`→solid). Multi-element arrays produce dash-dot / dash-dot-dot patterns (decomposed into overlaid lines internally). |
| dashUnits         | auto / px / m | auto  | Unit for the dash pattern. `auto` matches `units` — except under a perspective camera, where a `px` width's dash upgrades to world units (avoids disorienting shrink-on-approach in VR). Net: `auto` → `px` only when `units: px` and an orthographic camera, else `m`. Resolved per render from the active camera. |
| dashOffset        | number      | 0     | Phase offset into the pattern, in `dashUnits`. |
| tubeRadius        | number      | 0     | Optional solid cylinder radius (world units), rendered in addition to the line. `0` = no tube. Always solid; never dashes. |
| segments          | int         | 4     | Tube radial segments (only used when `tubeRadius > 0`). |
| shader            | string      | flat  | Tube material shader (only used when `tubeRadius > 0`). |

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

### Raycasting — world-distance, via an invisible pick proxy

Raycasting against lines uses a configurable threshold distance, so that an exact match is not required for a raycaster to register a hit against a thin line.

This is configured on the THREE raycaster's [`params.Line` property](https://threejs.org/docs/?q=raycaster#Raycaster.params).

When working with A-Frame, we recommend configuring this using the [`raycaster-thresholds`](../raycaster-thresholds/) component to configure this property.  The THREE.js default value of 1m is larger than is typically appropriate for A-Frame applications.

Note that even when a line is rendered wider than this threshold (either via `width` or `tubeRadius`, raycasting occurs based solely on this threshold, not the wider shape of the rendered line.

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



## Building

```
npm install
npm run dist        # builds dist/connecting-line.js and dist/connecting-line.min.js
npm run dist:dev    # dev build only
npm run dist:prod   # minified build only
```



## Code

- [connecting-line2.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/connecting-line/connecting-line2.js)
- [connecting-line.js (legacy wrapper)](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/connecting-line/connecting-line.js)



## Appendix: `connecting-line` schema

The `connecting-line` component provides back compatibility with v0.3.x

| Property              | Description | Default |
| --------------------- | ----------- | ------- |
| start                 | selector for entity to draw line from | |
| startOffset           | offset of the start of the line in the start entity's coordinate space | 0 0 0 |
| end                   | selector for entity to draw line to | |
| endOffset             | offset of the end of the line in the end entity's coordinate space | 0 0 0 |
| color                 | line colour | #74BEC1 |
| opacity               | line opacity | 1 |
| visible               | line visibility | true |
| lengthAdjustment      | one of: none, scale, extend, absolute | none |
| lengthAdjustmentValue | value used in adjusting the line length (meaning depends on `lengthAdjustment`) | 0 |
| width                 | Optional line width. If `> 0`, a cylinder of radius `width/2` is rendered **in addition to** the line, giving a more substantial appearance when inspected closely. | 0 |
| segments              | Only used if `width > 0`. Radial segments for the cylinder. Default 4 (square cross-section). | 4 |
| shader                | Cylinder material shader: "flat", "standard", or a custom registered shader. | flat |
| updateEvent           | If set, auto-update each `tick()` is suspended; the line updates only when this event fires on the start entity, end entity, or this entity. | "" |

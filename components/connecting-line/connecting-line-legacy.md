# connecting-line (legacy / backward-compatibility component)

`connecting-line` is the **original** component, kept for backward
compatibility. As of `0.4.0` it is a paper-thin wrapper that maps its
`0.3.x` schema onto [`connecting-line2`](./README.md) and renders nothing
itself.

**New code should use `connecting-line2`** (see the main
[README](./README.md)). This document exists only so existing
`connecting-line` consumers know their schema is unchanged.

## Schema (unchanged from 0.3.x)

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

## How it maps onto `connecting-line2`

For a `connecting-line__<id>`, the wrapper sets a
`connecting-line2__<id>` on the same entity:

- shared fields (`start`, `end`, offsets, `color`, `opacity`, `visible`,
  `lengthAdjustment`, `lengthAdjustmentValue`, `updateEvent`) — passed through;
- `width` → `connecting-line2 { width: 1, units: px, tubeRadius: width > 0 ? width/2 : 0 }`
  (the line is always a crisp 1px base stroke; the old cylinder becomes the tube);
- `segments` / `shader` — passed through to the tube.

The `connecting-line2__<id>` instance name is **reserved** by the wrapper —
do not set your own `connecting-line2__<id>` with the same `<id>` on an entity
that also has a `connecting-line__<id>`.

## Behaviour changes in 0.4.0

These are improvements / latent-bug fixes; flagged for completeness:

- The base stroke is a `THREE.Line2` (antialiased; export-hairline fixed)
  instead of a 1px `THREE.Line`. For `width > 0`, the crisp base line reads as
  a faint centre-stripe down the cylinder axis.
- The `updateEvent` end-entity listener is now removed on teardown (was leaked).
- `updateEvent` listeners rebind when `start`/`end` **entities** change at
  runtime, not only when the event **name** changes.
- Raycast threshold differs slightly (`Line2`/`LineSegments2` vs `THREE.Line`).

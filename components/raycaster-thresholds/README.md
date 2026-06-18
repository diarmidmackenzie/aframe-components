# raycaster-thresholds

## Overview

A component that enables configuration of the proximity thresholds for raycasting against lines and points.

This is useful because the default thresholds for raycasting against lines and points is 1m, which is far too large for many applications.  See [this A-Frame issue](https://github.com/aframevr/aframe/issues/5072).

It configures three raycaster params:

- `raycaster.params.Line.threshold` — for `THREE.Line` (the classic 1px line).
- `raycaster.params.Line2.threshold` — for `THREE.Line2` / `LineSegments2` (the wide-line family, e.g. [`connecting-line2`](../connecting-line/)). **THREE's `Raycaster` constructor does not define `Line2` at all**, so without this component a `Line2` target falls back to an exact (linewidth-only) pick band — effectively unpickable for a thin line. This component creates the key.
- `raycaster.params.Points.threshold` — for `THREE.Points`.



## Schema

| Property   | Description                                                  | Default     |
| ---------- | ------------------------------------------------------------ | ----------- |
| line       | The accuracy threshold (in **meters**) to use when raycasting against `THREE.Line`. Also drives `Line2` under the default `matchLine` mode (see `line2Mode`). | 0.01        |
| line2Mode  | How `params.Line2.threshold` is driven: `matchLine` \| `none` \| `set`. See below. | `matchLine` |
| line2      | The `Line2` threshold, **in the Line2 detection unit** (see "Units" below). Consulted only when `line2Mode: set`. Must be finite and `> 0`. | 0.01        |
| points     | The accuracy threshold (in meters) to use when raycasting against points | 0.01        |

### `line2Mode`

| Mode        | Effect |
| ----------- | ------ |
| `matchLine` (default) | `params.Line2.threshold` follows `line`. Gives a **zero-touch `THREE.Line` → `Line2` migration**: an existing `line:` config now also makes `Line2` targets pickable. **`matchLine` is metres-only** — see Units. |
| `set`       | `params.Line2.threshold = line2`, in the Line2 detection unit. Use this for px-detecting targets (`line` is metres and would be misread as pixels). A non-finite or `≤ 0` `line2` is rejected with a `console.warn` and treated as `matchLine` (use `none` to disable). |
| `none`      | Leave `params.Line2` untouched; `line` does **not** propagate to it. A composition opt-out — another owner (or THREE's default) keeps control. If a prior `matchLine`/`set` had written the value, it is unwound to the captured baseline. |

### Units — `matchLine` is metres-only

`line` (and therefore `matchLine`) is in **metres**. A `Line2` target whose raycast detects in **pixels** (an orthographic 2D scene, or `connecting-line2`'s `raycastUnits: auto` resolving to `px`) reads `params.Line2.threshold` as **pixels** — so the default `matchLine` value (`0.01`) is ~unpickable there.

> **For px-detecting targets, set `line2Mode: set` with a px `line2`** (e.g. `line2Mode: set; line2: 8` for an 8px grab band). `matchLine`'s zero-touch story holds only for the metre→metre case (a `THREE.Line` → an `m`-detecting `Line2`).

The unit is fundamentally an **input-device** property: a mouse selection wants **pixels**; a VR controller ray wants **metres** (physical slack). Pick the mode/unit to match the device.

### Single-writer assumption

`raycaster-thresholds` is **the** abstraction for these params. Run **one instance per raycaster**, and drive it (including dynamic values via `setAttribute`) rather than writing `raycaster.params.*` directly. A consumer that needs more should remove this component and manage the params itself — not write alongside it. `remove()` uses compare-before-restore (it restores its `Line2` baseline only if nothing has overwritten its value since) as defensive hygiene, but two concurrent writers on one raycaster is unsupported.



## Installation

Via CDN 
```
<script src="https://cdn.jsdelivr.net/npm/aframe-raycaster-thresholds@0.1.0/index.min.js"></script>
```

Or via [npm](https://www.npmjs.com/package/aframe-raycaster-thresholds)

```
npm install aframe-raycaster-thresholds
```

## Usage

To use thresholds of 1cm rather than 1m, just set on a Entity that uses raycasting, like this:

```
<a-entity cursor="rayOrigin:mouse" raycaster="objects:.raycastable" raycaster-thresholds>
```

Or to specify specific non-default thresholds (for example):

```
<a-entity cursor="rayOrigin:mouse" raycaster="objects:.raycastable"
          raycaster-thresholds="line: 0.02; points: 0.03">
```

A px-detecting `Line2` target (a 2D / orthographic scene — e.g. SimpleDraw) needs a **pixel** `Line2` threshold, so use `line2Mode: set`:

```
<a-entity cursor="rayOrigin:mouse" raycaster="objects:.raycastable"
          raycaster-thresholds="line2Mode: set; line2: 8">
```

## Line2 picking — two audiences

**1. `connecting-line2` users.** [`connecting-line2`](../connecting-line/) renders with `THREE.Line2` and exposes a `raycastUnits: px | m | auto` selector. To make its lines pickable, add `raycaster-thresholds` to the **same raycaster** and pick the mode to match the target's detection unit:

- `m`-detecting lines (VR controller ray, `raycastUnits: m`) → `raycaster-thresholds="line: 0.05"` (or any `matchLine` value) — metres.
- `px`-detecting lines (`raycastUnits: px`, or `auto` under an ortho camera) → `raycaster-thresholds="line2Mode: set; line2: 8"` — pixels.

> **Version trap.** If you bump `connecting-line2` (which made its lines `Line2`-backed) but pin an **old** `raycaster-thresholds` that only knows `params.Line.threshold`, `Line2` picking silently breaks (the threshold stays at THREE's `Line2` default of "undefined" → 0). **Bump `raycaster-thresholds` alongside `connecting-line2`.**

**2. Raw THREE.js `Line2` users** (no `connecting-line2`). You can set the param directly — but you must **create the key first** (THREE's `Raycaster` doesn't define `Line2`):

```js
if (!raycaster.params.Line2) raycaster.params.Line2 = {};
raycaster.params.Line2.threshold = 8; // or use the raycaster-thresholds component
```

The unit follows the target's `material.worldUnits`: **pixels** when `worldUnits: false`, **metres** when `worldUnits: true`. (Stock `LineSegments2.raycast` welds the detection space to the render width this way; `connecting-line2`'s custom `m`-detect raycast is the value-add that decouples them.)

## Examples

[raycaster-thresholds.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/raycaster-thresholds.html)



## Code

  [raycaster-thresholds](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/raycaster-thresholds/index.js)
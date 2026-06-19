# connecting-line2 — design notes

Background for maintainers. These are the non-obvious decisions behind
`connecting-line2.js` that don't fit naturally inline. Read alongside the
source.

## Why we override `onBeforeRender` and sync resolution per render pass

`THREE.LineMaterial` (from `three/examples/jsm/lines/`) renders wide,
antialiased strokes in a screen-space shader. To convert its line width and
dash sizes from pixels into clip space, the shader needs a `resolution`
uniform holding the current render target's pixel dimensions.

Three does **not** keep this uniform up to date automatically. The stock
`LineSegments2.onBeforeRender(renderer)` sets `material.resolution` from
`renderer.getViewport()` on each draw — but a single line is drawn into more
than one differently-sized target during a frame's lifetime:

- the live on-screen canvas,
- an offscreen screenshot / thumbnail export pass (arbitrary resolution),
- in WebXR, one pass **per eye**, each with its own viewport.

If resolution were set once (e.g. at material creation) it would be wrong for
every pass that isn't the size it was set from — dashes and line widths would
render at the wrong scale in exports and in VR.

We override `onBeforeRender` rather than relying on the stock hook because we
need **two** values derived from the same per-pass basis:

1. `material.resolution` — the pixel size, as above.
2. `worldPerPixel` — used to convert a pixel-specified dash period into world
   units (`dashScale`), so a `px` dash renders at a constant on-screen size.

Both must come from the **same** viewport, sampled in the same pass. We take a
single `renderer.getViewport()` call as the one source of truth for the pass
and feed both computations from it. Using two different bases (e.g. drawing
buffer size for one, viewport for the other) would desynchronise width and
dash scaling whenever they disagree (split-screen, XR, scissored viewports).

### Perspective `px` dash — known approximation

Under an **orthographic** camera, world-units-per-pixel is exact and constant
across the view: `(top - bottom) / zoom / viewportHeightPx`.

Under a **perspective** camera there is no single answer — apparent size
depends on depth. We approximate by evaluating world-per-pixel at the line's
**midpoint depth** (`2 * tan(fov/2) * dist / viewportHeightPx`). This is exact
only for a line lying in a plane parallel to the image plane; for a line angled
into the screen the dash spacing drifts slightly from near end to far end.
This is an accepted limitation — it keeps dashes stable enough during camera
motion without a per-vertex depth computation. (It's also why the `auto`
dash-unit default resolves a `px` width to **world** units under a perspective
camera: a depth-varying px dash would shrink disorientingly as you approach in
VR.)

### One-shot resolution seed

`initResolutionUniform()` sets the resolution uniform once at material
creation from the renderer's current drawing-buffer size. Without it, a
`LineMaterial` starts with the default `(1, 1)` resolution until its first
`onBeforeRender` fires. A render that happens before that first pass would use
`(1, 1)` — a wrong-width first frame. (Picking is independent: it runs against
the invisible `THREE.Line` pick proxy, not the `LineMaterial`.) The seed is a
fallback; the per-pass sync takes over from the first frame onward.

## Build / THREE setup

A-Frame exposes a global `THREE`, but that global does **not** include the
`examples/jsm/lines/` classes (`Line2`, `LineGeometry`, `LineMaterial`) — those
ship as separate example modules. So the bundle:

- **externalises the bare `three` import** to the page's runtime global
  (`externalsType: 'global'` → `self["THREE"]`). This is load-bearing: bundling
  a second copy of core three would create a distinct class identity, breaking
  `instanceof` checks, raycasting, and rendering against the scene's renderer.
- **bundles the deep `three/examples/jsm/lines/...` imports**, resolved out of
  the `super-three` dev-dependency via a webpack alias.

`super-three` is pinned to the exact version A-Frame ships (so the bundled
example classes match the core three the renderer runs — no duplicate-THREE
mismatch). If a future A-Frame bumps its `super-three`, re-pin the dev
dependency to match and re-confirm the built bundle still contains the
`LineMaterial` shader source.

## Dash overlay decomposition

A single `LineMaterial` can express only **one** dash/gap pair. Patterns with
more than one (dash-dot, dash-dot-dot, …) are rendered as **N overlaid
`Line2`s**, one per dash "run", all sharing a single `LineGeometry`. Each
overlay is a one-dash material phased so its single dash lands where that run
should appear; together they reproduce the full pattern.

For an input pattern `[d0, g0, d1, g1, …]` (in dash units), with
`period = sum(all elements)`:

- each **dash** run `d_k` (the even indices) that is non-zero becomes one
  overlay with `dashSize = d_k`, `gapSize = period - d_k`, and a `dashOffset`
  that positions it at that run's cumulative start;
- zero-length dash runs emit no overlay (nothing to draw);
- the solid case (`[]`, or an all-gap / all-zero pattern) renders as a single
  non-dashed line — implemented as a dashed material with a huge `dashSize` and
  zero gap, so the dash shader never discards.

Worked example — `[6, 2, 1, 2]` (a dash then a dot), `period = 11`:

| run        | start pos | overlay `(dashSize, gapSize, dashOffset)` |
| ---------- | --------- | ----------------------------------------- |
| dash `6`   | 0         | `(6, 5, 0)`                               |
| dot `1`    | 8         | `(1, 10, 3)`                              |

(The `dashOffset` wraps `period - pos` modulo `period`: `11 - 8 = 3`.) The
schema's `dashOffset` is added on top of every overlay's offset so the whole
pattern shifts phase together.

See `dash-pattern.js` for the pure implementation (`sanitiseDash`,
`decomposeDash`, `getPeriod`).

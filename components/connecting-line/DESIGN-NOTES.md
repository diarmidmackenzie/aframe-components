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

## Pick proxy

Picking does not raycast the visible stroke. The visible stroke is N render-only
overlay `Line2`s; picking targets a separate invisible 2-vertex `THREE.Line`
registered via `setObject3D`, raycast by the **stock `THREE.Line.raycast`**.

This is chosen deliberately over a custom point-segment `.raycast` on a render
overlay. A standalone `THREE.Line` keeps raycasting on THREE's built-in,
maintained, camera-independent code path — `raycaster.params.Line.threshold` in
world units, no bespoke intersection math, no dependence on resolution or
camera. The cost is one extra invisible object kept in lockstep with the
endpoints, plus a `boundingSphere = null` on each move: `THREE.Line` caches the
bounding sphere and never re-derives it, so without the reset a moved line is
rejected at the broad-phase stage and goes silently un-pickable.

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

## World-unit extrusion under an orthographic camera

`LineMaterial`'s `WORLD_UNITS` vertex path builds its extrusion basis from the
camera-space segment **midpoint**, which assumes viewing rays converge on the
camera position. True under perspective; false under an orthographic camera,
whose rays are parallel to camera-space `-z`. The stroke is narrowed by
`|d| / length(midpoint)`, so it looks right at the image centre and wrong at the
edges — at depth 2, 8 units off-axis, about 24% of its width, and an
axis-aligned hairline disappears from an un-multisampled capture.

This is a three.js bug, not something specific to this component. It is fixed
upstream by [mrdoob/three.js#34540](https://github.com/mrdoob/three.js/pull/34540)
(milestone r187).

**We carry that exact one-line patch, applied per `LineMaterial` instance** at
construction in `rebuildOverlays()` — a component cannot patch the three.js it
is handed, and mutating the page-global `THREE.ShaderLib['line']` would change
rendering for every other `Line2` consumer on the page.

Two properties make it safe to carry:

- **The line we substitute in is upstream's, verbatim** — a variant would be a
  second fix to reason about, and reviewing it would mean diffing GLSL against
  a PR.
- **What we match on is deliberately not exact.** We do not control when the
  bundled three.js picks the fix up, nor in what form — reformatted, minified,
  or restructured as an `if`/`else` by a reviewer — so the extrusion basis is
  located by the two declarations that bracket it (`worldDir` above,
  `worldUp` below) rather than by the text between them. `tmpFwd` occurs
  exactly twice in the entire shader, so those anchors stay tight.
- **It resolves to three outcomes, never two.** A bracketed region that already
  consults `perspective` is handling the orthographic case in whatever form, so
  it is left alone; a region carrying the stock declaration is patched;
  anything else *throws*, at module evaluation, so an unrecognisable shader
  fails when the bundle loads rather than the first time someone opens a
  drawing containing a world-unit line.

When the fix does land, this block becomes a no-op and can be deleted without
changing a pixel — but nothing forces that to happen on the same bump.

The branch inside the shader is a **GLSL runtime branch** on three's own
`perspective` classification (`projectionMatrix[2][3] == -1.0`), not a
JavaScript branch on the camera. One material outlives camera changes — a
consumer entering and leaving an orthographic export view, or an
orthographic-to-VR transition — so a construction-time decision would be stale
the moment the camera type changed. The split is exhaustive: off-axis and
asymmetric orthographic frusta and `Camera.setViewOffset` tiling all leave
camera-space rays parallel to `-z`, and WebXR's per-eye matrices are
perspective.

Verifying a build: assert on `overlays[0].material.vertexShader`, not on the
contents of `dist/`. `LineMaterial` reads its shader source at construction, so
whether the fix reached the compiled program is a runtime ordering property
rather than a bundling one.

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

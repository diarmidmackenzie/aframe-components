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
export function mod(x, p) {
  return ((x % p) + p) % p;
}

// Sanitise a raw `dash` schema array into either [] (render solid) or a clean,
// even-length, finite, non-negative array.
//
// The order of checks is load-bearing: the non-finite guard must run FIRST,
// because NaN slips past every numeric comparison that follows.
export function sanitiseDash(raw, attrName) {
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
//
// PRECONDITION: `dash` must already be sanitised (even-length, finite,
// non-negative — via sanitiseDash). This function does NOT re-validate.
export function decomposeDash(dash, dashOffset) {
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
export function getPeriod(overlayParams) {
  if (!overlayParams || overlayParams.length === 0) return 0;
  return overlayParams[0].dashSize + overlayParams[0].gapSize;
}

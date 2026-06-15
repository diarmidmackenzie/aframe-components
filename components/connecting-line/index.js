// aframe-connecting-line — webpack entry.
//
// Registers BOTH components into the single bundled dist/connecting-line.js:
//  - connecting-line2 : the Line2-based renderer (width + dash + tube).
//  - connecting-line  : the paper-thin backward-compatibility wrapper.
//
// Order matters: connecting-line2 must be registered before the wrapper's
// update() can set a `connecting-line2__<id>` attribute. Importing it first
// guarantees registration order.
import './connecting-line2.js';
import './connecting-line.js';

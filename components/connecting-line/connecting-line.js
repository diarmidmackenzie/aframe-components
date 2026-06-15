/* global AFRAME */
//
// connecting-line — paper-thin BACKWARD-COMPATIBILITY wrapper (Decision 1).
//
// Keeps the exact 0.3.3 schema. Renders NOTHING itself: it maps its schema
// onto a `connecting-line2__<id>` on the same entity and lets that component
// do all the work.
//
// Wrapper isolation (D6): this component touches ONLY `connecting-line2__<id>`
// — never `line__...`, never any geometry or Line2/tube object directly. The
// `connecting-line2__<id>` instance name is RESERVED — consumers must not
// collide on it.
//
// Mapping (D20):
//   shared fields (start/end/offsets/color/opacity/visible/
//     lengthAdjustment/lengthAdjustmentValue/updateEvent) -> passthrough
//   width  -> connecting-line2 { width: 1, units: 'px',
//                                tubeRadius: width > 0 ? width / 2 : 0 }
//            width: 1 ALWAYS (D20) — the crisp 1px base Line2 reads as a faint
//            centre-stripe when a tube is present; accepted as a minor AA
//            upgrade (the old THREE.Line was drawn too, just 1px).
//   segments / shader -> passthrough to the tube.

AFRAME.registerComponent('connecting-line', {

  schema: {
    start: { type: 'selector' },
    startOffset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    end: { type: 'selector' },
    endOffset: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
    color: { type: 'color', default: '#74BEC1' },
    opacity: { type: 'number', default: 1 },
    visible: { default: true },
    lengthAdjustment: { default: 'none', oneOf: ['none', 'scale', 'extend', 'absolute'] },
    lengthAdjustmentValue: { type: 'number' },
    width: { type: 'number' },
    segments: { type: 'number', default: 4 },
    shader: { type: 'string', default: 'flat' },
    updateEvent: { type: 'string', default: '' }
  },

  multiple: true,

  // The reserved child attribute name this wrapper owns.
  childAttr() {
    return `connecting-line2__${this.attrName}`;
  },

  update() {
    const data = this.data;

    if (!data.start || !data.end) {
      this.remove();
      return;
    }

    this.el.setAttribute(this.childAttr(), {
      start: data.start,
      end: data.end,
      startOffset: data.startOffset,
      endOffset: data.endOffset,
      color: data.color,
      opacity: data.opacity,
      visible: data.visible,
      lengthAdjustment: data.lengthAdjustment,
      lengthAdjustmentValue: data.lengthAdjustmentValue,
      updateEvent: data.updateEvent,
      // width: 1 ALWAYS (D20); the legacy cylinder becomes the tube.
      width: 1,
      units: 'px',
      tubeRadius: data.width > 0 ? data.width / 2 : 0,
      segments: data.segments,
      shader: data.shader
    });
  },

  remove() {
    // Remove ONLY our reserved child attribute (D6). The child
    // connecting-line2.remove() is idempotent (safe if already gone).
    if (this.el) {
      this.el.removeAttribute(this.childAttr());
    }
  }
});

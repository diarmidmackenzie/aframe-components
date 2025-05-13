# connecting-line

Uses the A-Frame "line" component to draw a line between points on two entities.

The position of the line is updated automatically whenever the entity at either end is moved.



## Schema

| Property              | Description                                                  | Default |
| --------------------- | ------------------------------------------------------------ | ------- |
| start                 | selector for entity to draw line from                        |         |
| startOffset           | offset of the start of the line  in the co-ordinate space of the start entity | 0 0 0   |
| end                   | selector for entity to draw line to                          |         |
| endOffset             | offset of the start of the line  in the co-ordinate space of the end entity | 0 0 0   |
| color                 | as per "line" component                                      | #74BEC1 |
| opacity               | as per "line" component                                      | 1       |
| visible               | as per "line" component                                      | true    |
| lengthAdjustment      | one of: none, scale, extend, absolute                        | none    |
| lengthAdjustmentValue | Value used in adjusting the length of the line.  Meaning depends on the lengthAdjustment parameter as follows:<br /><br />none: this parameter is ignored<br />scale: a scale factor to apply to the length of the connecting line, relative to the actual distance between start and end<br />extend: an absolute length to extend the connecting line by (negative values will mean the line is just short of the points)<br />absolute: an absolute length for the connecting line, irrespective of the distance between start and end. | 0       |
| width                 | Optional line width.  If set to a value > 0, the line will be rendered as a cylinder in addition to a "line".  This can be useful to give a line a more substantial appearance when a user inspects it closely: when lines remain a single pixel wide even when inspected very closely, this can feel unrealistic.<br /><br />Even when a cylinder is rendered, the line is also rendered, so that it remains clearly visible even when viewed from distance. | 0       |
| segments              | Only used if width > 0.  The number of radial segments used to render the line width.  Default (for performance reasons) is 4, giving a square cross-section.  Higher values will give a cross-section that is rounder, and therefore has a more consistent width depending on viewing angle. | 4       |
| shader                | "flat", "standard" or a custom value, if a custom shader is registered (as per [the `shader` property](https://aframe.io/docs/1.7.0/components/material.html#properties_shader) on the material component). | "flat"  |
| updateEvent           | If set, auto-update of line position every tick() is suspended, and the line position only updates when the named event is emitted on the start or end entities, or on this entity.  This may be useful for performance reasons for lines that are generally static, or only move at known times. | ""      |



## Installation

```
<script src="https://cdn.jsdelivr.net/npm/aframe-connecting-line@0.2.1/index.min.js"></script>
```


## Examples

[connecting-line.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/connecting-line.html)



## Code

[connecting-line](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/connecting-line/index.js)
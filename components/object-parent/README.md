# object-parent

## Overview

Changes the object3D parent of an A-Frame entity.

By default, the THREE.js scene graph of Object3Ds matches the A-Frame DOM hierarchy.  However there are specific cases where it can be helpful to rearrange the THREE.js scene graph, without modifying the A-Frame DOM hierarchy, for example:

- This provides a convenient way to grab objects with a hand or controller - reparent them to the hand / controller, and then parent them back to the original parent when released.
- It can also be a convenient way to stick objects to other objects, which can be more efficient than using physics-based constraint systems.

This component provides a straightforward way to do this, that is reflected in the DOM.

When the `object-parent`is set on an entity, that entity maintains the same world transform (i.e. position, scale, rotation).  This means that it's local transform is updated to deliver this world transform in the context of the new parent.

Removing the attribute results in the object being returned to it's default position in the scene graph (again, maintaining the same world transform).



## Other Approaches to Re-Parenting

This is just one approach to reparenting entities.  It works well in some cases, but may not be the best solution in all cases.

Another approach is do reparent in the DOM (which naturally also updates the THREE.js scene graph).

There's some fairly extensive discussion (plus code snippets for some other approaches) in the A-Frame repo [here](https://github.com/aframevr/aframe/issues/2425) and on Stack Overflow [here](https://stackoverflow.com/questions/65538916/aframe-reparenting-an-element-keeping-its-world-position-rotation/65554657#65554657).



## Schema

| Property | Description                                                  | Default |
| -------- | ------------------------------------------------------------ | ------- |
| parent   | Selector for entity to make the object a direct child of.<br /><br />This should identify a unique entity (the component will warn if it matches more than one). | none    |



## Installation

Via CDN 
```
<script src="https://cdn.jsdelivr.net/npm/aframe-object-parent@0.1.0/index.min.js"></script>
```

Or via [npm](https://www.npmjs.com/package/aframe-object-parent)

```
npm install aframe-object-parent
```



## Examples

Change an element's parent like this:

```
this.el.setAttribute('object-parent', 'parent:#newparent')
```

Dedicated small-scale example to follow.

For now, see [mouse-manipulation.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/mouse-manipulation/) and [laser-manipulation.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/laser-manipulation/), which both use this component.

## Code

[object-parent](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/object-parent/index.js)
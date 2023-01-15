## Overview

A component to add to a controller that enables the user to move objects around using a laser pointer.

This extends the core [laser-controls](https://aframe.io/docs/1.3.0/components/laser-controls.html) component, allowing objects that are pointed at to be manipulated in space, rather than just selected.

The basic control scheme is:

- Trigger to grab / release an entity
- While an entity is grabbed
  - Wherever the controller is moved / rotated, the entity moves as if it is "on a stick", the laser being the stick
  - Thumbstick forwards and backwards brings the entity away from / towards the controller.
  - Thumbstick left and right rotates the entity horizontally (yaw)
  - Grip + thumbstick forwards and backwards rotates the entity vertically (pitch)
- The axes used for rotation (pitch / yaw) are relative to the orientation of the controller.  When the controller is held at an angle, the axes of rotation are adjusted to align with the controller.
- Note that "roll" can be achieved by rotating the controller. with a twist of the wrist.



## Usage

This component does not implement all of the control scheme described above, but can be combined with the [thumbstick-states](https://diarmidmackenzie.github.io/aframe-components/docs/thumbstick-states.html) component to deliver a full control scheme.

This example shows a configuration for the right controller that delivers the thumbstick controls described above.

```
<a-entity id="rhand"                  
          laser-controls="hand: right"
          raycaster="objects: [raycast-target]; far: Infinity; lineColor: red; lineOpacity: 0.5"
          laser-manipulation
          thumbstick-states__right="controller:#rhand;
                                    tBindings:moving-in,moving-out,rotating-y-plus,rotating-y-minus;
                                    tgBindings:rotating-x-plus,rotating-x-minus,rotating-y-plus,rotating-y-minus"
          oculus-touch-controls="hand: right">
```

Note that this component should also be deployed alongside [laser-controls](https://aframe.io/docs/1.3.0/components/laser-controls.html), [raycaster](https://aframe.io/docs/1.3.0/components/raycaster.html) and an appropriate tracked-controls component such as [oculus-touch-controls](https://aframe.io/docs/1.3.0/components/oculus-touch-controls.html).



## States

The aspects of the control system driven by thumbsticks in the description above are implemented within this component as a set of [A-Frame states](https://aframe.io/docs/1.3.0/core/entity.html#addstate-statename), which drive movement as follows:

| State            | Effect                                                  |
| ---------------- | ------------------------------------------------------- |
| moving-in        | Move the entity towards the controller                  |
| moving-out       | Move the entity away from the controller                |
| rotating-y-plus  | Rotate the entity about the controller's y axis (yaw)   |
| rotating-y-minus | Rotate the entity about the controller's y axis (yaw)   |
| rotating-x-plus  | Rotate the entity about the controller's x axis (pitch) |
| rotating-x-minus | Rotate the entity about the controller's x axis (pitch) |

The configuration shown above for the [thumbstick-states](https://diarmidmackenzie.github.io/aframe-components/docs/thumbstick-states.html) component will give the basic  control scheme described at the top of this page.

However, any mechanism that sets and clears [states](https://aframe.io/docs/1.3.0/core/entity.html#addstate-statename) on an A-Frame entity could be used to drive these controls. 



## Schema

Apart from the ability to customize thumbstick controls described above, there are limited configuration options for these controls.  These may be extended in future.

| Property   | Description                                                  | Default |
| ---------- | ------------------------------------------------------------ | ------- |
| rotateRate | The rate of rotation of the entity (in degrees / second) when it is being rotated. | 45      |
| center     | The center of rotation used when rotating the entity.  This can be the center of the entity, or the point of contact of the raycaster with the entity.  One of: center, contact. | center  |



## Installation

This is a high-level component with a lot of dependencies.  In future I'll set up npm to build a single JS file with all these rolled in.  

For now, install as follows:

```
<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-components@latest/components/object-parent.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-components@latest/components/thumbstick-states.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-components@latest/components/laser-manipulation.min.js"></script>
```


## Examples

See [object-manipulation.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/object-manipulation.html) for an example of how this can be used.

This example also uses [desktop-vr-controller](https://diarmidmackenzie.github.io/aframe-components/docs/desktop-vr-controller.html), so you can test out operations of a VR controller in a desktop (non-VR) environment.



## Proxy Raycasting

`laser-manipulation` supports proxy raycasting via the [raycast-target](https://diarmidmackenzie.github.io/aframe-components/docs/raycast-target.html) component



## Code

  [laser-manipulation.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/laser-manipulation.js)
## Overview

This component can be used to simplify implementation of thumbstick-based controls.

The key functions that it provides are:

- Applying a sensitivity threshold to determine whether a thumbstick is / is not being pushed in each of the x & y directions
- Mapping this a user-defined set of [A-Frame states](https://aframe.io/docs/1.3.0/core/entity.html#addstate-statename) on an entity
- Differential mappings, depending on whether trigger / grip are held down on the controller.

This component should be set on the entity whose states you want to be modified when the thumbstick is operated.

Multiple instances of this component can be added to a single entity, for example to control it with thumbsticks on two different controllers.

## Schema

| Property    | Description                                                  | Default                         |
| ----------- | ------------------------------------------------------------ | ------------------------------- |
| controller  | A selector for the controller that has the thumbstick to be tracked | #lhand                          |
| bindings    | A set of 4 states to be set / cleared when the thumbstick is pushed in a particular direction.<br /><br />Order is: up, down, left, right | "none", "none", "none", "none", |
| tBindings   | As per "bindings", but applies when the trigger is held down (and grip is not held down).  If nothing is specified, values from "bindings" are used. | empty                           |
| gBindings   | As per "bindings", but applies when the grip is held down (and trigger is not held down).  If nothing is specified, values from "bindings" are used. | empty                           |
| tgBindngs   | As per "bindings", but applies when the trigger and grip are both held down.  If nothing is specified, other values are used in this order: gBindings, tBindings, bindings. | empty                           |
| sensitivity | in a range of 0 to 1, how far off-center should be counted as movement. | 0.5                             |



## Installation

<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-examples@latest/components/thumbstick-states.min.js"></script>



## Examples

See [object-manipulation.html](https://diarmidmackenzie.github.io/aframe-examples/component-usage/object-manipulation.html) for an example of how this can be used alongside the [laser-manipulation](https://diarmidmackenzie.github.io/aframe-examples/docs/laser-manipulation.html) component to build a control system using the thumbstick.

The [object-manipulation.html](https://diarmidmackenzie.github.io/aframe-examples/component-usage/object-manipulation.html) example also uses [desktop-vr-controller](https://diarmidmackenzie.github.io/aframe-examples/docs/desktop-vr-controller.html), so you can operate VR controller thumbstick controls even in a desktop (non-VR) environment.



## Code

  [thumbstick-states.js](https://github.com/diarmidmackenzie/aframe-examples/blob/main/components/thumbstick-states.js)
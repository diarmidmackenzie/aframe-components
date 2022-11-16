# aframe-examples
A repository containing a variety of re-usable A-Frame components, and examples of A-Frame component usage.

Content is currently organized into:

- components - Re-usable A-Frame components
- component-usage - Examples illustrating the usage of a specific component (which may be in this repo, or external)
- compositions - More complex examples that involve composition of multiple A-Frame components.

I also have a range of other A-Frame components in other repositories.  Over time, I may move some of that into here, but for now feel free to browse those as well, and take anything you find useful (pretty much everything is MIT license - though please do check individual repository licenses as there could be exceptions)



## Components



### Drawing & Rendering

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [connecting-line](https://diarmidmackenzie.github.io/aframe-examples/docs/connecting-line.html) | Draw a line between two entities.                            |
| [polygon-wireframe](https://diarmidmackenzie.github.io/aframe-examples/docs/polygon-wireframe.html) | Display wireframes composed of polygons, rather than triangles. |
| [label](https://diarmidmackenzie.github.io/aframe-examples/docs/label.html) | Labels always face the camera, at a fixed size               |
| [label-anchor](https://diarmidmackenzie.github.io/aframe-examples/docs/label.html) | Supports labels positioned at a distance from the entity they label |



### Mouse & Controllers

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [cursor-tracker](https://diarmidmackenzie.github.io/aframe-examples/docs/cursor-tracker.html) | Track the direction in 3D space being pointed to be the cursor |
| [desktop-vr-controller](https://diarmidmackenzie.github.io/aframe-examples/docs/desktop-vr-controller.html) | Simulates a VR controller on the desktop, controllable using mouse & keyboard. |
| [laser-manipulation](https://diarmidmackenzie.github.io/aframe-examples/docs/laser-manipulation.html) | Move and rotate entities in a 3D scene using a laser pointer. |
| [mouse-manipulation](https://diarmidmackenzie.github.io/aframe-examples/docs/mouse-manipulation.html) | Move and rotate entities in a 3D scene using a mouse.        |
| [thumbstick-states](https://diarmidmackenzie.github.io/aframe-examples/docs/thumbstick-states.html) | Used to simplify implementation of thumbstick-based controls on VR controllers. |



### Raycasting

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [raycast-target](https://diarmidmackenzie.github.io/aframe-examples/docs/raycast-target.html) | Component that is used to enable proxy raycasting (which can improve raycasting performance) |
| [raycaster-thresholds](https://diarmidmackenzie.github.io/aframe-examples/docs/raycaster-thresholds.html) | Configure proximity thresholds for raycasting against lines and points. |



### Other

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [object-parent](https://diarmidmackenzie.github.io/aframe-examples/docs/object-parent.html) | Change the parent of an object in the THREE.js scene graph   |
| [screen-position](https://diarmidmackenzie.github.io/aframe-examples/docs/screen-position.html) | Report the 2D screen position of an A-Frame entity           |
| [stats-panel](https://diarmidmackenzie.github.io/aframe-examples/docs/stats-panel.html) | Display custom statistics in a style that matches core A-Frame stats |



### Utility Components

Components that exist to support examples.  Not likely to be very useful in their own right.

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [scale-on-hover](https://diarmidmackenzie.github.io/aframe-examples/docs/utility-components.html) | Scale an object up when hovered over by the mouse            |
| [hide-on-hover](https://diarmidmackenzie.github.io/aframe-examples/docs/utility-components.html) | Hide an object when hovered over by the mouse                |
| [output-screen-position](https://diarmidmackenzie.github.io/aframe-examples/docs/screen-position.html) | Track and report the 2D screen position of an A-Frame entity (as reported by `screen-position`) |





Include a component in your project like this (fill in [component-name] with the appropriate component)

```
<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-examples@latest/components/[component-name].min.js"></script>
```

Some high-level components have multiple dependencies, and require multiple components to be included in the project. See individual component documentation pages for details.

I do plan to use npm to simplify some of these dependencies, but haven't got to it yet.  If you'd like to see a particular component on npm, please raise an issue, and I'll try to prioritize it.



## Component Usage

For components in this repository, see component pages linked above for examples

We don't currently have any examples for usage of components from outside this repository.



## Compositions

#### Wrapped Present

Wrap a virtual gift (any PNG image), for desktop or mobile (not VR)

[Example](https://diarmidmackenzie.github.io/aframe-examples/compositions/wrapped-present/)

[Instructions](https://github.com/diarmidmackenzie/aframe-examples/blob/main/compositions/wrapped-present/README.md)





## Acknowledgements

Examples use the following 3D models

| Object            | Title                      | Artist         | License   | Link                                                         | Modifications                                  |
| ----------------- | -------------------------- | -------------- | --------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Animal Cell       | Animal cell - Downloadable | Lauri Purhonen | CC BY 4.0 | https://sketchfab.com/3d-models/animal-cell-downloadable-ddc40bb0900544959f02d3ff83c32615 | Resolution of textures reduced for performance |
| Tyrannosaurus Rex | Tyrannosaurus Rex          | AVINAS         | CC BY 4.0 | https://sketchfab.com/3d-models/tyrannosaurus-rex-9eade2f07a8d4ae1aac8f53e5a3d0a7a | Resolution of textures reduced for performance |
| Eiffel Tower      | (FREE) La tour Eiffel      | SDC            | CC BY 4.0 | https://sketchfab.com/3d-models/free-la-tour-eiffel-8553f94d06e24cb4b0fde1080f281674 | None                                           |



Mouse and arrow icons used in `mouse-manipulation-hints` are based on SVGs from [UXWing](https://uxwing.com/).  They may be re-used without attribution, as described in the UXWing licensing terms [here](https://uxwing.com/license/)


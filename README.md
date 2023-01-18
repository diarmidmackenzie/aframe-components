# aframe-components
A repository containing a variety of re-usable A-Frame components.

There's no particularly strong theme to this repo, other than a selection of things I found I needed (or just wanted) to build, that I thought might be useful for other people too.

I intend to keep all these components up-to-date & working with new versions of A-Frame.  If you find a bug or other problem, please [raise an issue](https://github.com/diarmidmackenzie/aframe-components/issues) and I'll be happy to take a look.



## Components



### Drawing & Rendering

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [connecting-line](https://diarmidmackenzie.github.io/aframe-components/components/connecting-line) | Draw a line between two entities.                            |
| [frame-rate](https://diarmidmackenzie.github.io/aframe-components/components/frame-rate) | Request that the browser targets a particular frame rate (e.g. 60fps, 72fps). |
| [adaptive-frame-rate](https://diarmidmackenzie.github.io/aframe-components/components/adaptive-frame-rate) | Adapts the browser frame rate to best match the performance of the app. |
| [polygon-wireframe](https://diarmidmackenzie.github.io/aframe-components/components/polygon-wireframe) | Display wireframes composed of polygons, rather than triangles. |
| [label](https://diarmidmackenzie.github.io/aframe-components/components/label) | Labels always face the camera, at a fixed size               |
| [label-anchor](https://diarmidmackenzie.github.io/aframe-components/components/label) | Supports labels positioned at a distance from the entity they label |



### Mouse & Controllers

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [cursor-tracker](https://diarmidmackenzie.github.io/aframe-components/components/cursor-tracker) | Track the direction in 3D space being pointed to be the cursor |
| [desktop-vr-controller](https://diarmidmackenzie.github.io/aframe-components/components/desktop-vr-controller) | Simulates a VR controller on the desktop, controllable using mouse & keyboard. |
| [laser-manipulation](https://diarmidmackenzie.github.io/aframe-components/components/laser-manipulation) | Move and rotate entities in a 3D scene using a laser pointer. |
| [mouse-manipulation](https://diarmidmackenzie.github.io/aframe-components/components/mouse-manipulation) | Move and rotate entities in a 3D scene using a mouse.        |
| [thumbstick-states](https://diarmidmackenzie.github.io/aframe-components/components/thumbstick-states) | Used to simplify implementation of thumbstick-based controls on VR controllers. |



### Raycasting

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [raycast-target](https://diarmidmackenzie.github.io/aframe-components/components/raycast-target) | Component that is used to enable proxy raycasting (which can improve raycasting performance) |
| [raycaster-thresholds](https://diarmidmackenzie.github.io/aframe-components/components/raycaster-thresholds) | Configure proximity thresholds for raycasting against lines and points. |



### Other

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [object-parent](https://diarmidmackenzie.github.io/aframe-components/components/object-parent) | Change the parent of an object in the THREE.js scene graph   |
| [screen-position](https://diarmidmackenzie.github.io/aframe-components/components/screen-position) | Report the 2D screen position of an A-Frame entity           |
| [stats-panel](https://diarmidmackenzie.github.io/aframe-components/components/stats-panel) | Display custom statistics in a style that matches core A-Frame stats |



### Utility Components

Components that exist to support examples.  Not likely to be very useful in their own right, and mostly not published on npm.

| **Component**                                                | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [scale-on-hover](https://diarmidmackenzie.github.io/aframe-components/docs/utility-components.html) | Scale an object up when hovered over by the mouse            |
| [hide-on-hover](https://diarmidmackenzie.github.io/aframe-components/docs/utility-components.html) | Hide an object when hovered over by the mouse                |
| [output-screen-position](https://diarmidmackenzie.github.io/aframe-components/components/screen-position) | Track and report the 2D screen position of an A-Frame entity (as reported by `screen-position`) |



## Installation

Most components are published on npm, and can be installed either using npm, or via a CDN such as [JSDELIVR](https://www.jsdelivr.com/)

See individual component pages for specific details.

Components in this repo are versioned individually, so pay attention to npm versions of individual components, rather than the version of this GitHub repo.

For this reason, for CDN links I recommend using npm-style links (https://cdn.jsdelivr.net/npm/package@version/file) rather than GitHub-style links (https://cdn.jsdelivr.net/gh/user/repo@version/file)



## Component Usage

For usage examples for components in this repository, see component pages linked above for examples





## Acknowledgements

Examples use the following 3D models

| Object            | Title                      | Artist         | License   | Link                                                         | Modifications                                  |
| ----------------- | -------------------------- | -------------- | --------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Animal Cell       | Animal cell - Downloadable | Lauri Purhonen | CC BY 4.0 | https://sketchfab.com/3d-models/animal-cell-downloadable-ddc40bb0900544959f02d3ff83c32615 | Resolution of textures reduced for performance |
| Tyrannosaurus Rex | Tyrannosaurus Rex          | AVINAS         | CC BY 4.0 | https://sketchfab.com/3d-models/tyrannosaurus-rex-9eade2f07a8d4ae1aac8f53e5a3d0a7a | Resolution of textures reduced for performance |
| Eiffel Tower      | (FREE) La tour Eiffel      | SDC            | CC BY 4.0 | https://sketchfab.com/3d-models/free-la-tour-eiffel-8553f94d06e24cb4b0fde1080f281674 | None                                           |



Mouse and arrow icons used in `mouse-manipulation-hints` are based on SVGs from [UXWing](https://uxwing.com/).  They may be re-used without attribution, as described in the UXWing licensing terms [here](https://uxwing.com/license/)


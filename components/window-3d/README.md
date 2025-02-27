# window-3d component

## Overview

This component is a refinement of an application of the `head tracker` component that I previously experimented with [here](https://diarmidmackenzie.github.io/aframe-components/components/head-tracking/test/window-camera3.html).

The idea is to create an illusion of 3D depth in an A-Frame scene embedded in a web page by:

- Adjusting the viewing angle of the scene depending on the embedded scene's position on the page

- Further adjusting based on the user's tracked head position.

  


## Schema



| Property       | Description                                                  | Default |
| -------------- | ------------------------------------------------------------ | ------- |
| webCamPosition | vec3 indicating the position of the webcam relative to the center of the screen. | 0 0.1 0 |
| debug          | display some debug info on screen and to console.log         | false   |
| xSensitivity   | How much the x/y pov on the world changes as a result of movements on screen.  This will also be affected by the distance of the scene from the camera and the scale of the scene, but it can be more convenient to adjust directly here.  1 should give "realistic" behaviour. | 1       |
| ySensitivity   | As per xSensitivity.  For realistic adjustment, should be set to same value as xSensitivity, but there may be cases where different effects are desired. | 1       |
| zSensitivity   | This only applies when head tracking is active.  Set to a high value (3 to 5) to get a powerful zoom effect when moving head towards / away from the screen. | 1       |



## Installation

```

<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-components@main/components/window-3d/index.js"></script>
```

Still experimental.  Not yet released to npm.



## Usage

Currently only tested when configured on a `secondary-camera` outputting to a `div` element on the screen (see [aframe-multi-camera](https://diarmidmackenzie.github.io/aframe-multi-camera/)).

Can this work with the default scene camera?  Probably yes, but needs some thought to build a suitable example.

For head tracking, also configure `head-tracker`and `face-dectector` components.  See `configure-example.js` in the example.



## Examples

Example [here](http://diarmidmackenzie.github.io/aframe-components/component-usage/window-3d/)

Use the controls in the top right to adjust settings in the example and toggle between dioramas.


## Code

  [window-3d](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/window-3d/index.js)


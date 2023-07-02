## Overview

A component that supports simple set-up of physics to match the set of XRPlanes reported by WebXR (e.g. as configured in "room setup" on Oculus Quest).

Compatible with:

- [aframe-physics-system](https://github.com/c-frame/aframe-physics-system) (Cannon & Ammo drivers)
- [physx for A-Frame](https://github.com/c-frame/physx) 

## Schema


| Property   | Description                                                  | Default |
| ---------- | ------------------------------------------------------------ | ------- |
| debug      | When enabled, planes are rendered semi-opaque in random colors, to aid in debugging. | false   |
| showPlanes | When debugging, which planes to show: "horizontal", "vertical", or "all" | all     |
| depth      | Depth (i.e. thickness) to use for walls and surfaces (in meters).  When  Continuous Collision Detection (CCD) is not supported, or is not enabled, a significant depth is needed to prevent fast-moving objects from travelling through planes. | 0.5     |

## Usage

Add the `xr-room-physics` component to your scene, along with your physics system setup.  You will also typically need the `plane-detection` and `local-floor` WebXR features.

Examples...

Cannon Physics with full debug:

```
    <a-scene webxr="requiredFeatures: plane-detection,local-floor"
             physics="debug: true"
             xr-room-physics="debug: true">
```

Ammo physics with no debug visualization

```
 <a-scene webxr="requiredFeatures: plane-detection,local-floor"
             physics="driver: ammo"
             xr-room-physics>
```

PhysX with small plane depth (since CCD can be used with PhysX)

```
<a-scene webxr="requiredFeatures: plane-detection,local-floor"
             physx="autoLoad: true; delay: 1000"
             xr-room-physics="">
```





  <a-scene webxr="requiredFeatures: plane-detection,local-floor"

​       background="color:#888"

​       physics="driver: ammo; debug: true"

​       xr-room-physics="debug: true">









## Limitations

TBC



## Installation

Via CDN 
```
<script src="https://cdn.jsdelivr.net/npm/aframe-xr-room-physics@0.0.1/dist/xr-room-physics.min.js"></script>
```

Or via [npm](https://www.npmjs.com/package/aframe-polygon-wireframe)

```
npm install aframe-xr-room-physics
```



## Examples

TBC

## Code

  [xr--room-physics](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/xr=-room-physics/index.js)


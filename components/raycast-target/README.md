# raycast-target

## Overview

A very simple utility component that is used to enable proxy raycasting.

Proxy raycasting is a pattern where the entity used for raycasting is different from the entity that is selected or manipulated by raycasting.  It enables performance improvements when raycasting against entities with complex geometry by allowing raycasting computations to be performed against an entity with simpler geometry, which can be substantially more efficient.

The entity with simpler geometry could be a low-poly mesh that approximates the entity's geometry.  Or in cases where precision  raycasting is not required, it could be as simple as a bounding cube or sphere.



## Schema

`raycast-target` has a single property schema

The property is a selector for the target for which this entity is acting as a raycast proxy.  If no value is specified, the entity will be set up as a raycast proxy for itself (i.e. no proxying takes place).



## Usage

`raycast-target` exposes the target entity on the `target` property

Here's some sample code that extracts a raycast target if available, and defaults to the entity itself if not.

```
getRaycastTarget(el) {
    if (el.components['raycast-target']) {
        return el.components['raycast-target'].target
    }
    else {
        return el
    }
},
```



## Installation

Via CDN 
```
<script src="https://cdn.jsdelivr.net/npm/aframe-raycast-target@0.1.0/index.min.js"></script>
```

Or via [npm](https://www.npmjs.com/package/aframe-raycast-target)

```
npm install aframe-raycast-target
```


## Components supporting Proxy Raycasting

The following high-level components support proxy raycasting using `raycast-target`.

- [laser-manipulation](https://diarmidmackenzie.github.io/aframe-components/docs/laser-manipulation.html)

- [mouse-manipulation](https://diarmidmackenzie.github.io/aframe-components/docs/mouse-manipulation.html)



## Examples

To follow...



## Code

  [raycast-target](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/raycast-target/index.js)
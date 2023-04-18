## Overview

A component to display wireframes composed of polygons, rather than triangles.

![image-20220816094651445](image-20220816094651445.png)



## Schema

| Property      | Description                                                  | Default |
| ------------- | ------------------------------------------------------------ | ------- |
| color         | The color to use for the lines of the wireframe              | grey    |
| opacity       | The opacity with which to render the non-hidden parts of the wireframe.  This should not be set to a lower value than hiddenOpacity (doing so will trigger a warning, and result in the whole wireframe being rendered with the hiddenOpacity opacity setting). | 1       |
| hiddenOpacity | The opacity with which to render any hidden parts of the wireframe.  Setting this to a non-zero value means that parts of the wireframe that would normally be hidden (i.e. that are behind other objects) are still visible.  By setting it to a value lower than `opacity` allows for a visible difference between the hidden and non-hidden parts of the wireframe, even though both are visible. | 0       |
| dashed        | Whether to use dashed lines.  If false, solid lines are used | false   |
| dashSize      | If dashed lines are used, the length of the dashes relative to the gaps | 3       |
| gapSize       | If dashed lines are used, the length of the gaps relative to the dashes | 1       |
| dashScale     | If dashed lines are used, this determines the scale of the dashes / gaps.  Whatever units are used for dashSize & gapSize, this is the number of units that will fit into a 1 unit of length (i.e. 1 meter if the entity has default scaling).<br /><br />Larger values for dashScale result in smaller dashes / gaps. <br /><br />With the default values for dashScale, dashSize and gapSize, and default entity scaling, dashes will be 10cm (3 x 100 / 30), and gaps 3.33cm (1 x 100 / 30). | 30      |

## Installation

Via CDN 
```
<script src="https://cdn.jsdelivr.net/npm/aframe-polygon-wireframe@0.1.0/index.min.js"></script>
```

Or via [npm](https://www.npmjs.com/package/aframe-polygon-wireframe)

```
npm install aframe-polygon-wireframe
```


## Examples

[polygon-wireframe.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/polygon-wireframe.html)



## Code

  [polygon-wireframe](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/polygon-wireframe/index.js)
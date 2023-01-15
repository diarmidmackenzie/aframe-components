## Overview

Components to track and report the 2D screen position of an A-Frame entity.



### screen-position

This component makes the current screen position of an A-Frame entity (as per the active camera) available via a function 

`this.el.components['screen-position'].getScreenPosition(pos)`

The parameter `pos` should contain a pre-allocated [`THREE.Vector2`](https://threejs.org/docs/index.html?q=vector2#api/en/math/Vector2).

The x & y values are populated with the x & y co-ordinates on the current screen of the center of the entity.



### output-screen-position

This is a component primarily intended for demonstration purposes.  It can be added to an entity with the `screen-position` component, and outputs the screen position data in one of two ways:

- As text, by writing to the `innerHTML` of a specified element
- As screen position data, by writing to the `style.top` and `style.left` attributes of an element with absolute position.



## Schema

| Property | Description                                                  | Default |
| -------- | ------------------------------------------------------------ | ------- |
| text     | selector for an HTML element to write the x, y screen co-ordinates of the entity to, once every frame |         |
| tracker  | selector for an HTML element with absolute position, whose 2D position will be updated once every frame to match the 2D position of the entity. |         |



## Installation

```
<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-components@latest/components/screen-position.min.js"></script>
```


## Examples

[screen-position.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/screen-position.html)



## Code

[screen-position.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/screen-position.js)
# cursor-tracker

Set on an entity to track the orientation of the cursor's ray.

Typically set on a entity that is a child of the camera that the cursor uses.  This entity will then always point towards the cursor/mouse pointer.



## Schema

| Property | Description                             | Default |
| -------- | --------------------------------------- | ------- |
| cursor   | selector for the cursor entity to track | #cursor |



## Installation

```
<script src="https://cdn.jsdelivr.net/npm/aframe-cursor-tracker@0.1.0/index.min.js"></script>
```

Or via [npm](https://www.npmjs.com/package/aframe-cursor-tracker)

```
npm install aframe-cursor-tracker
```


## Examples

[cursor-tracker.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/cursor-tracker.html)

Also Used by `mouse-manipulation` component to keep grabbed entities aligned with the mouse pointer.

## Code

  [cursor-tracker](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/cursor-tracker/index.js)
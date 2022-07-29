## Overview

Set on an entity to track the orientation of the cursor's ray.

Typically set on a entity that is a child of the camera that the cursor uses.  This entity will then always point towards the cursor/mouse pointer.



## Schema

| Property | Description                             | Default |
| -------- | --------------------------------------- | ------- |
| cursor   | selector for the cursor entity to track | #cursor |



## Installation

<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-examples@latest/components/cursor-tracker.min.js"></script>



## Examples

[cursor-tracker.html](https://diarmidmackenzie.github.io/aframe-examples/component-usage/cursor-tracker.html)

Also Used by `mouse-manipulation` component to keep grabbed entities aligned with the mouse pointer.

## Code

  [cursor-tracker.js](https://github.com/diarmidmackenzie/aframe-examples/blob/main/components/cursor-tracker.js)
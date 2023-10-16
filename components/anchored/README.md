# anchored

## Overview

A component that supports anchoring of a single container entity in an A-Frame scene.

When a container entity is anchored, it remains in the same place in real-world space, regardless of changes to the scene origin.

If the anchoring is persistent, this position is maintained between sessions (unless browser data is cleared).



## Demo

Open the scene  on a VR headset and enter AR.

On a Meta Quest hold the Meta / Oculus button to reset the scene origin.  The anchored components in the scene (the sphere, cube, cylinder and plane) should stay in a fixed position, even though the scene origin has moved.  The text panel in the background is not anchored, so you should see that move.

Press A to toggle anchoring off & on again.  When anchoring is off, the green plane turns white, and the shapes will not stay in a fixed position when you reset the scene origin.



## Usage

Add the `anchored` component to a container entity within your scene that you want to anchor.

Note that:

- you can't anchor the entire `<a-scene>`
- you can only anchor a single container entity.  That shouldn't be a problem: just make everything that you want to anchor a child of this container.



You will also need to configure some required web XR features on the scene like this:



```
<a-scene webxr="requiredFeatures: anchors,local-floor">
```

And if you want AR mode to be available from A-Frame 1.5 onwards, you also need the following config on your scene:

```
vr-mode-ui="enterAREnabled: true; enterVREnabled: false"
```



### Control of anchored position

An anchored container is anchored in whatever real-world position it first appears in, the first time the user enters AR.

This means that the user does not have control over where it is anchored.  There are two ways to give the user control over the position entities are anchored in.

- The first (most common) is to just anchor a container entity, and give the user the ability to spawn child entities of that container at a position of their choosing.  Because the container remains fixed in real-world space, its children will as well, but the child entities can be placed wherever the user chooses.
- Another alternative is to use the `unAnchor()` and `reAnchor()` API calls to un-anchor the container, re-position it as needed, and then re-anchor it.  The [demo scene](https://diarmidmackenzie.github.io/aframe-components/components/anchored/test/) demonstrates this technique, using the A button on the right controller to un-anchor and re-anchor the container.



## Schema


| Property   | Description                                                  | Default |
| ---------- | ------------------------------------------------------------ | ------- |
| persistent | Persistent anchors are saved when the page is refreshed or closed.  A non-persistent anchor only lasts as long as the current webXR session.  Changing this setting after the entity has been anchored () | true    |
| debug      | Enable console logs for debugging                            | false   |



## API



| Method                    | Description                                                  | Parameters                                                   |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `unAnchor(resetPosition)` | Unanchor the container so it no longer has a fixed real-world position and orientation, but instead moves with the scene origin. | resetPosition - if true, the container position and orientation are reset to the scene origin.  If false, the container is left in its previous position, relative to the scene origin. |
| `reAnchor()`              | Re-anchor the container to a fixed real-world position and orientation. | none                                                         |



## Limitations

- Can't anchor the whole scene

- Only one anchor per scene

  

## Installation

Via CDN 
```
<script src="https://cdn.jsdelivr.net/npm/aframe-anchored@0.0.1/dist/anchored.min.js"></script>
```

Or via [npm](https://www.npmjs.com/package/aframe-anchored)

```
npm install aframe-anchored
```



## Examples

See "Demo" above



## Code

  [anchored](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/anchored/index.js)



## Acknowledgements

Thanks to the team at Meta for the [Reality Accelerator Toolkit (RATK) for THREE.js](https://github.com/meta-quest/reality-accelerator-toolkit), which this component builds upon.


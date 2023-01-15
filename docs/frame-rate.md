## frame-rate

Set on any entity to adjust the WebXR frame rate requested for rendering.

The WebXR specs allow a page to request rendering at a particular frame rate.  Requesting an appropriate frame rate is important to maximize performance.

WebXR rendering occurs at a fixed rate, like a metronome.  This means that if an application attempts to run at 90fps, but takes more than 11msecs to render each frame, the best possible frame rate it can achieve is 45fps (half the target frame rate).

By reducing the target frame rate to 80, 72 or 60 fps, the application may be able to achieve a higher actual frame rate.

This component uses the WebXR API features described here: https://www.w3.org/TR/webxr/#dom-xrsession-updatetargetframerate


## Schema

| Property                 | Description            | Default |
| ------------------------ | ---------------------- | ------- |
| (single property schema) | Frame rate to target72 | 72      |



## Usage

Can be set on any entity, but simplest & clearest to set this on your `<a-scene>` to the desired frame rate.

```
<a-scene frame-rate="72">
  ...
  scene content here
  ...
</a-scene>
```

The frame rate cannot be adjusted on the WebXR API until the user enters VR mode.  However, this component takes care of listening for when that happens, and making the frame rate change at the appropriate time.



## Methods

When this component is configured on an entity (or the scene), the following methods are also available:

#### getFrameRate()

Returns the current actual frame rate (a single number).

Typically this will be the most recently requested frame rate, but it may differ in some failure cases (for example if the most recently requested frame rate is unsupported)

*This function should only be called when a WebXR Session is active (e.g. after entering Immersive Mode).  If no WebXR session is active, it will generate warnings, and return an undefined value.*

#### getAvailableFrameRates()

Returns an array indicating the set of frame rates available on this device.

*This function should only be called when a WebXR Session is active (e.g. after entering Immersive Mode).  If no WebXR session is active, it will generate warnings, and return an undefined value.*



## Installation

```
<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-components@latest/components/frame-rate/index.min.js"></script>
```



## Examples

[frame-rate.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/frame-rate.html)



## Code

  [frame-rate.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/frame-rate/index.js)
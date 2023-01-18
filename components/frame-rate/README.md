# frame-rate & adaptive-frame-rate

## Overview

### frame-rate

Set on any entity to adjust the WebXR frame rate requested for rendering.

The WebXR specs allow a page to request rendering at a particular frame rate.  Requesting an appropriate frame rate is important to maximize performance.

WebXR rendering occurs at a fixed rate, like a metronome.  This means that if an application attempts to run at 90fps, but takes more than 11msecs to render each frame, the best possible frame rate it can achieve is 45fps (half the target frame rate).

By reducing the target frame rate to 80, 72 or 60 fps, the application may be able to achieve a higher actual frame rate.

### adaptive-frame-rate

Set on any entity to adjust the WebXR frame rate to suit the performance of the app.

The WebXR specs allow a page to request rendering at a particular frame rate.  Requesting an appropriate frame rate is important to maximize performance.

WebXR rendering occurs at a fixed rate, like a metronome.  This means that if an application attempts to run at 90fps, but takes more than 11msecs to render each frame, the best possible frame rate it can achieve is 45fps (half the target frame rate).

This component monitors the rendering frequency, and adjusts the requested frame rate up / down based on the performance of the application.

### WebXR API

Both components use the WebXR API features described here: https://www.w3.org/TR/webxr/#dom-xrsession-updatetargetframerate



## Installation

(this imports code for both `frame-rate` and `adaptive-frame-rate` components)

Via CDN 

```
<script src="https://cdn.jsdelivr.net/npm/aframe-frame-rate@0.1.0/index.min.js"></script>
```

Or via [npm](https://www.npmjs.com/package/aframe-frame-rate)

```
npm install aframe-frame-rate
```


## Schemas

### frame-rate

| Property                 | Description            | Default |
| ------------------------ | ---------------------- | ------- |
| (single property schema) | Frame rate to target72 | 72      |

### adaptive-frame-rate

| Property          | Description                                                  | Default |
| ----------------- | ------------------------------------------------------------ | ------- |
| initialRate       | The starting frame rate on initializing the application.  Note that this rate will not be applied until a WebXR session begins (e.g. the user entering VR). | 72      |
| uprateInterval    | The period in seconds over which monitoring for uprating occurs. | 10      |
| uprateThreshold   | The maximum number of frame misses allowed, to qualify for uprating.  If the uprate interval passes, with fewer than this number of missed frames, the app is uprated to the next available frame rate. | 5       |
| downrateInterval  | The period in seconds over which monitoring for downrating occurs. | 5       |
| downrateThreshold | The number of frame misses at which downrating is triggered.  As soon as thing number of frames are missed in a downrate measurement interval, the app is downrated to the next available frame rate. | 10      |
| framerateCap      | This places a cap on the highest frame rate that will be considered for uprating to. | 100     |



## Usage

These components can be set on any entity, but simplest & clearest to set this on your `<a-scene>`.

E.g.

```
<a-scene frame-rate="72">
  ...
  scene content here
  ...
</a-scene>
```

or:

```
<a-scene adaptive-frame-rate>
  ...
  scene content here
  ...
</a-scene>
```

The frame rate cannot be adjusted on the WebXR API until the user enters VR mode.  However, this component takes care of listening for when that happens, and making the frame rate change at the appropriate time.



## Methods & API

### frame-rate

When this component is configured on an entity (or the scene), the following methods are also available:

#### getFrameRate()

Returns the current actual frame rate (a single number).

Typically this will be the most recently requested frame rate, but it may differ in some failure cases (for example if the most recently requested frame rate is unsupported)

*This function should only be called when a WebXR Session is active (e.g. after entering Immersive Mode).  If no WebXR session is active, it will generate warnings, and return an undefined value.*

#### getAvailableFrameRates()

Returns an array indicating the set of frame rates available on this device.

*This function should only be called when a WebXR Session is active (e.g. after entering Immersive Mode).  If no WebXR session is active, it will generate warnings, and return an undefined value.*



### adaptive-frame-rate

This component uses the `frame-rate` component to actually adjust frame rate.

The frame rate currently chosen by this component can be queried on the `frame-rate` component

```
this.el.sceneEl.components['frame-rate'].data
```

The actual frame rate being used by the WebXR Session (should be the same, except in error cases) can be checked using the `getFrameRate()` method on that component:

```
this.el.sceneEl.components['frame-rate'].getFrameRate()
```

The following properties are also accessible on this component:

```
uprateMissedFrames   // The number of missed frames in the current uprate interval
downrateMissedFrames // The number of missed frames in the current downrate interval
```



## Examples

[frame-rate](https://diarmidmackenzie.github.io/aframe-components/component-usage/frame-rate.html)

[adaptive-frame-rate](https://diarmidmackenzie.github.io/aframe-components/component-usage/adaptive-frame-rate.html)



## Code

  [frame-rate](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/frame-rate/index.js)


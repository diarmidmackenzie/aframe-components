## adaptive-frame-rate

Set on any entity to adjust the WebXR frame rate to suit the performance of the app.

The WebXR specs allow a page to request rendering at a particular frame rate.  Requesting an appropriate frame rate is important to maximize performance.

WebXR rendering occurs at a fixed rate, like a metronome.  This means that if an application attempts to run at 90fps, but takes more than 11msecs to render each frame, the best possible frame rate it can achieve is 45fps (half the target frame rate).

This component monitors the rendering frequency, and adjusts the resuested frame rate up / down based on the performance of the application.  It uses the WebXR API features described here: https://www.w3.org/TR/webxr/#dom-xrsession-updatetargetframerate


## Schema

| Property          | Description                                                  | Default |
| ----------------- | ------------------------------------------------------------ | ------- |
| initialRate       | The starting frame rate on initializing the application.  Note that this rate will not be applied until a WebXR session begins (e.g. the user entering VR). | 72      |
| uprateInterval    | The period in seconds over which monitoring for uprating occurs. | 10      |
| uprateThreshold   | The maximum number of frame misses allowed, to qualify for uprating.  If the uprate interval passes, with fewer than this number of missed frames, the app is uprated to the next available frame rate. | 5       |
| downrateInterval  | The period in seconds over which monitoring for downrating occurs. | 5       |
| downrateThreshold | The number of frame misses at which downrating is triggered.  As soon as thing number of frames are missed in a downrate measurement interval, the app is downrated to the next available frame rate. | 10      |
| framerateCap      | This places a cap on the highest frame rate that will be considered for uprating to. | 100     |



## Usage

Can be set on any entity, but simplest & clearest to set this on your `<a-scene>`.

```
<a-scene adaptive-frame-rate>
  ...
  scene content here
  ...
</a-scene>
```

Frame rate adaptation does not begin until the user enters VR mode, and ends on exit from VR mode.



## API

This component uses the [`frame-rate`](https://diarmidmackenzie.github.io/aframe-components/docs/frame-rate.html) component to actually adjust frame rate.

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



## Installation

```
<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-components@latest/components/adaptive-frame-rate/index.min.js"></script>
```



## Examples

[adaptive-frame-rate.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/adaptive-frame-rate.html)



## Code

  [index.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/frame-rate/index.js)
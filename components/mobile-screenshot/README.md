# mobile-screenshot

## Overview

Equivalent to the [A-Frame screenshot component](https://aframe.io/docs/1.4.0/components/screenshot.html), but also captures the camera feed for a Mobile AR experience.

-----------

**Failed attempt to implement this...**

**It is not possible for this component to access the camera in WebXR mode.  Anf if you grab the camera before entering WebXR mode, then WebXR is unable to access the camera...**

**Alternative (spec-aligned) approach would be to make use of the [WebXR raw camera access API](https://immersive-web.github.io/raw-camera-access/)**

**This appears to be supported on Android Chrome.  Won't work on iOS yet...**

---------




## Installation

Via CDN 

```
<script src="https://cdn.jsdelivr.net/npm/aframe-mobile-screenshot@0.0.1/index.min.js"></script>
```

Or via [npm](https://www.npmjs.com/package/aframe-mobile-screenshot)

```
npm install aframe-mobile-screenshot
```


## Schema


| Property | Description                                   | Default |
| -------- | --------------------------------------------- | ------- |
| width    | The width in pixels of the screenshot taken.  | 720     |
| height   | The height in pixels of the screenshot taken. | 1280    |



## Usage

These components can be set on any entity, but simplest & clearest to set this on your `<a-scene>`.

E.g.

```
<a-scene mobile-screenshot>
  ...
  scene content here
  ...
</a-scene>
```



## Methods & API


This component offers (almost) the same API as the [A-Frame screenshot component](https://aframe.io/docs/1.4.0/components/screenshot.html).   

However, while the A-Frame screenshot component's functions take a parameter indicating whether to capture a `perspective` or `equirectangular` screenshot, this function call always captures a perspective screenshot (an equirectangular screenshot would not match the camera feed).

#### getCanvas()

Take a screenshot programatically and get a canvas.

#### capture()

Take a screenshot programmatically and automatically save the file. 



## Examples

[mobile-screenshot](https://diarmidmackenzie.github.io/aframe-components/component-usage/mobile-screenshot.html)



## Code

  [mobile-screenshot](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/mobile-screenshot/index.js)





## How to use WebXR API...

At the console.  `this = document.querySelector('a-scene')`

```
> this.frame
13:42:14.752 XRFrame {session: XRSession, trackedAnchors: XRAnchorSet}
> r = this.systems['tracked-controls-webxr'].referenceSpace
13:42:29.565 XRReferenceSpace {onreset: null}
> pose = this.frame.getViewerPose(r)
13:42:40.069 XRViewerPose {views: Array(1), transform: XRRigidTransform, emulatedPosition: false}
> camera = pose.views[0].camera
13:42:51.872 XRCamera {width: 864, height: 1920}
> session = this.xrSession
13:43:02.790 XRSession {environmentBlendMode: 'alpha-blend', interactionMode: 'screen-space', visibilityState: 'visible', renderState: XRRenderState, inputSources: XRInputSourceArray, …}
> gl = this.renderer.getContext()
13:43:06.456 WebGL2RenderingContext {canvas: canvas.a-canvas.a-grab-cursor, drawingBufferWidth: 721, drawingBufferHeight: 1463, drawingBufferColorSpace: 'srgb', unpackColorSpace: 'srgb'}
> binding = new XRWebGLBinding(session, gl)
13:43:12.228 XRWebGLBinding {}
> binding.getCameraImage(camera)
13:43:27.684 WebGLTexture {}
```


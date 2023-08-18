# mobile-screenshot

## Overview

Equivalent to the [A-Frame screenshot component](https://aframe.io/docs/1.4.0/components/screenshot.html), but also captures the camera feed for a Mobile AR experience.

-----------

**Failed attempt to implement this...**

**It is not possible for this component to access the camera in WebXR mode.  Anf if you grab the camera before entering WebXR mode, then WebXR is unable to access the camera...**

**Only solution I can see would be based on not using WebXR at all, and superimposing the A-Frame scene on the video feed obtained by this component.  However I don't want to pursue that approach at this point in time... prefer to work with the standards rather than ignoring them...**

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


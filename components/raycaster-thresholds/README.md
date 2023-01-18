## Overview

A component that enables configuration of the proximity thresholds for raycasting against lines and points.

This is useful because the default thresholds for raycasting against lines and points is 1m, which is far too large for many applications.  See [this A-Frame issue](https://github.com/aframevr/aframe/issues/5072).



## Schema

| Property | Description                                                  | Default |
| -------- | ------------------------------------------------------------ | ------- |
| line     | The accuracy threshold (in meters) to use when raycasting against lines | 0.01    |
| points   | The accuracy threshold (in meters) to use when raycasting against points | 0.01    |



## Installation

```
<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-components@latest/components/raycaster-thresholds.min.js"></script>
```


## Usage

To use thresholds of 1cm rather than 1m, just set on a Entity that uses raycasting, like this:

```
<a-entity cursor="rayOrigin:mouse" raycaster="objects:.raycastable" raycaster-thresholds>
```

Or to specify specific non-default thresholds (for example):

```
<a-entity cursor="rayOrigin:mouse" raycaster="objects:.raycastable"
          raycaster-thresholds="line: 0.02; points: 0.03">
```



## Examples

[raycaster-thresholds.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/raycaster-thresholds.html)



## Code

  [raycaster-thresholds.js](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/raycaster-thresholds.js)
# aframe-examples
 Examples of usage of A-Frame Components



My plan is to publish a range of small A-Frame things I create, where they don't warrant a repository of their own, here.

My plan is to include:

- components - Re-usable A-Frame components I have created
- component-usage - Examples illustrating the usage of a specific component
- compositions - More complex examples that involve composition of multiple A-Frame components.

I'm just starting out with this, so at the moment there's not a lot of content here.

For now, there's plenty of sample A-Frame code in my other repositories, so feel free to browse those and take anything you find useful (pretty much everything is MIT license - though please do check individual repository licenses as there could be exceptions)



## Components

| **Component**     | Description                                                  | Code                                                         | Example                                                      |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| polygon-wireframe | A component to display wireframes composed of polygons, rather than triangles. | [polygon-wireframe.js](https://github.com/diarmidmackenzie/aframe-examples/blob/main/components/polygon-wireframe.js) | [polygon-wireframe.html](https://diarmidmackenzie.github.io/aframe-examples/component-usage/polygon-wireframe.html) |
| scale-on-hover    | A very simple component that causes objects to scale when hovered over by a cursor or raycaster.  Used in various examples | [scale-on-hover.js](https://github.com/diarmidmackenzie/aframe-examples/blob/main/components/scale-on-hover.js) | [polygon-wireframe.html](https://diarmidmackenzie.github.io/aframe-examples/component-usage/polygon-wireframe.html) |

Include a component in your project like this (fill in [component-name] with the appropriate component)

```
<script src="https://cdn.jsdelivr.net/gh/diarmidmackenzie/aframe-examples@latest/components/[component-name].min.js"></script>
```



If you'd like to see a particular component on npm, please raise an issue.



## Component Usage

[polygon-wireframe.html](https://diarmidmackenzie.github.io/aframe-examples/component-usage/polygon-wireframe.html)



## Compositions

#### Wrapped Present

Wrap a virtual gift (any PNG image), for desktop or mobile (not VR)

https://diarmidmackenzie.github.io/aframe-examples/compositions/wrapped-present/

Instructions:

https://github.com/diarmidmackenzie/aframe-examples/blob/main/compositions/wrapped-present/README.md


# wrapped-present
 3D animation giving someone a picture as a present.


This can be customized with the following options as URL parameters.

| Parameter    | Value                                                        | Example                                                      | Default                   |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------- |
| gift-url     | The URL of an image to include                               | https%3A%2F%2Fcdn.aframe.io%2Fexamples%2Fui%2FkarigurashiPoster.jpg | ./assets/sample-image.png |
| box-color    | The color to use for the gift box, as a hex string           | #00ff00 (for green)                                          | red (#ff0000)             |
| ribbon-color | The color to use for ribbon on the gift box, as a hex string.  Note that metallic & roughness settings are automatically applied to this to make the ribbon shiny. | #0000ff (for blue)                                           | gold (#ffd700)            |
| message      | The message that appears at the top of the screen.  This is displayed as a single line - long messages will be hard to read on mobile devices.  Spaces need to be URL-encoded (%20) | "Congratulations!"                                           | "Happy Birthday!"         |



Example:

https://diarmidmackenzie.github.io/aframe-examples/compositions/wrapped-present/?gift-url=https%3A%2F%2Fcdn.aframe.io%2Fexamples%2Fui%2FkarigurashiPoster.jpg&box-color=00ff00&ribbon-color=0000ff&message=Good%20%20Luck




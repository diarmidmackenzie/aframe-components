## connecting-line

Uses the A-Frame "line" component to draw a line between points on two entities.

The position of the line is updated automatically whenever the entity at either end is moved.



## Schema

| Property    | Description                                                  | Default |
| ----------- | ------------------------------------------------------------ | ------- |
| start       | selector for entity to draw line from                        |         |
| startOffset | offset of the start of the line  in the co-ordinate space of the start entity | 0 0 0   |
| end         | selector for entity to draw line to                          |         |
| endOffset   | offset of the start of the line  in the co-ordinate space of the end entity | 0 0 0   |
| color       | as per "line" component                                      | #74BEC1 |
| opacity     | as per "line" component                                      | 1       |
| visible     | as per "line" component                                      | true    |



## Installation

```
<script src="https://cdn.jsdelivr.net/npm/aframe-connecting-line@0.1.0/index.min.js"></script>
```


## Examples

[connecting-line.html](https://diarmidmackenzie.github.io/aframe-components/component-usage/connecting-line.html)



## Code

[connecting-line](https://github.com/diarmidmackenzie/aframe-components/blob/main/components/connecting-line/index.js)
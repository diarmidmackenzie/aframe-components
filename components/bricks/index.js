// https://www.researchgate.net/figure/Basic-dimensions-of-LEGOR-toy-bricks-20_fig3_330754387
const MATERIAL_WIDTH = 1.2
const UNIT_WIDTH = 8.0
const PLATE_HEIGHT = 3.2
const STUD_HEIGHT = 1.8
const STUD_RADIUS = 2.4

AFRAME.registerGeometry('brick', {
  schema: {
    width: {default: 4},
    depth: {default: 2},
    height: {default: 3}
  },

  init: function (data) {
    
    const geometries = []
    let geometry

    const blockWidth = data.width * UNIT_WIDTH
    const blockDepth = data.depth * UNIT_WIDTH
    const blockHeight = data.height * PLATE_HEIGHT

    const sideOffset = (blockDepth - MATERIAL_WIDTH) / 2
    const endOffset = (blockWidth - MATERIAL_WIDTH) / 2
    const topOffset = (blockHeight - MATERIAL_WIDTH) / 2
    const studOffset = (blockHeight + STUD_HEIGHT) / 2

    // front & back
    geometry = new THREE.BoxGeometry(blockWidth, blockHeight, MATERIAL_WIDTH);
    geometry.translate(0, 0, -sideOffset)
    geometries.push(geometry)

    geometry = new THREE.BoxGeometry(blockWidth, blockHeight, MATERIAL_WIDTH);
    geometry.translate(0, 0, sideOffset)
    geometries.push(geometry)

    // left & right
    geometry = new THREE.BoxGeometry(MATERIAL_WIDTH, blockHeight, blockDepth);
    geometry.translate(endOffset, 0, 0)
    geometries.push(geometry)

    geometry = new THREE.BoxGeometry(MATERIAL_WIDTH, blockHeight, blockDepth);
    geometry.translate(-endOffset, 0, 0)
    geometries.push(geometry)

    // top
    geometry = new THREE.BoxGeometry(blockWidth, MATERIAL_WIDTH, blockDepth);
    geometry.translate(0, topOffset, 0)
    geometries.push(geometry)

    // studs
    let xStart = (UNIT_WIDTH - blockWidth) / 2
    let zStart = (UNIT_WIDTH - blockDepth) / 2
    for (let ii = 0; ii < data.width; ii++) {
      for (let jj = 0; jj < data.depth; jj++) {
        geometry = new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT);
        geometry.translate(xStart + ii * UNIT_WIDTH, studOffset, zStart + jj * UNIT_WIDTH)
        geometries.push(geometry)
      }
    }

    this.geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);

    //recenterGeometry(this.geometry);
  }
});

var extendDeep = AFRAME.utils.extendDeep;

// The mesh mixin provides common material properties for creating mesh-based primitives.
// This makes the material component a default component and maps all the base material properties.
var meshMixin = AFRAME.primitives.getMeshMixin();

AFRAME.registerPrimitive('a-brick', {
  // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
  defaultComponents: {
    brick: {}
  },

  // Defined mappings from HTML attributes to component properties (using dots as delimiters).
  // If we set `depth="5"` in HTML, then the primitive will automatically set `geometry="depth: 5"`.
  mappings: {
    depth: 'brick.depth',
    height: 'brick.height',
    width: 'brick.width',
    movement: 'brick.movement',
    color: 'brick.color'
  }
});

AFRAME.registerComponent('brick', {

  schema: {
    width: {default: 4},
    depth: {default: 2},
    height: {default: 3},
    movement: {default: 'dynamic'},
    color: {default: 'red'}
  },

  init() {

    this.visual = document.createElement('a-entity')
    this.visual.setAttribute('geometry', {primitive: 'brick', 
                                          width: this.data.width,
                                          height: this.data.height,
                                          depth: this.data.depth})
    this.visual.setAttribute("physx-no-collision", "")
    this.visual.setAttribute("material", {color: this.data.color})
    this.el.appendChild(this.visual)

    this.collider = document.createElement('a-entity')
    this.collider.setAttribute("geometry", { primitive: "box", 
                                             width:  this.data.width * UNIT_WIDTH,
                                             height: this.data.height * PLATE_HEIGHT,
                                             depth:  this.data.depth * UNIT_WIDTH})
    this.collider.setAttribute("visible", false)
    this.collider.setAttribute("physx-hidden-collision", "")
    this.el.appendChild(this.collider)

    this.el.setAttribute('physx-body', {type: this.data.movement})
  }
})

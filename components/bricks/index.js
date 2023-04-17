function recenterGeometry(geometry) {
  geometry.computeBoundingBox();
  const center = new THREE.Vector3();

  center.addVectors(geometry.boundingBox.min, geometry.boundingBox.max);
  center.multiplyScalar(0.5);
  geometry.translate(-center.x, -center.y, -center.z)
  geometry.computeBoundingBox();
}

// https://www.researchgate.net/figure/Basic-dimensions-of-LEGOR-toy-bricks-20_fig3_330754387
// http://www.bartneck.de/2019/04/21/lego-brick-dimensions-and-measurements/
const MATERIAL_WIDTH = 1.2
const UNIT_WIDTH = 8.0
const PLATE_HEIGHT = 3.2
const STUD_HEIGHT = 1.8
const STUD_RADIUS = 2.4
const PIN_RADIUS = 1.6
const CYLINDER_RADIUS_INNER = 2.4
const CYLINDER_RADIUS_OUTER = 3.2505

AFRAME.registerGeometry('brick', {
  schema: {
    width: {default: 4},
    depth: {default: 2},
    height: {default: 3},
    cylinderSegments: {default: 8},
  },

  init: function (data) {
    
    const geometries = []
    let geometry

    const blockWidth = data.width * UNIT_WIDTH
    const blockDepth = data.depth * UNIT_WIDTH
    const blockHeight = data.height * PLATE_HEIGHT
    const cylinderSegments = data.cylinderSegments

    const sideOffset = (blockDepth - MATERIAL_WIDTH) / 2
    const endOffset = (blockWidth - MATERIAL_WIDTH) / 2
    const topOffset = (blockHeight - MATERIAL_WIDTH) / 2
    const studOffset = (blockHeight + STUD_HEIGHT) / 2

    // front & back
    geometry = new THREE.BoxGeometry(blockWidth, blockHeight, MATERIAL_WIDTH)
    geometry.translate(0, 0, -sideOffset)
    geometries.push(geometry)

    geometry = new THREE.BoxGeometry(blockWidth, blockHeight, MATERIAL_WIDTH)
    geometry.translate(0, 0, sideOffset)
    geometries.push(geometry)

    // left & right
    geometry = new THREE.BoxGeometry(MATERIAL_WIDTH, blockHeight, blockDepth)
    geometry.translate(endOffset, 0, 0)
    geometries.push(geometry)

    geometry = new THREE.BoxGeometry(MATERIAL_WIDTH, blockHeight, blockDepth)
    geometry.translate(-endOffset, 0, 0)
    geometries.push(geometry)

    // top
    geometry = new THREE.BoxGeometry(blockWidth, MATERIAL_WIDTH, blockDepth)
    geometry.translate(0, topOffset, 0)
    geometries.push(geometry)

    // studs
    let xStart = (UNIT_WIDTH - blockWidth) / 2
    let zStart = (UNIT_WIDTH - blockDepth) / 2
    for (let ii = 0; ii < data.width; ii++) {
      for (let jj = 0; jj < data.depth; jj++) {
        geometry = new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, cylinderSegments)
        geometry.translate(xStart + ii * UNIT_WIDTH, studOffset, zStart + jj * UNIT_WIDTH)
        geometries.push(geometry)
      }
    }

    // base pins (1 x n and n x 1 only)
    if (data.width === 1 && data.depth > 1) {
      for (let ii = 0; ii < data.depth - 1; ii++) {
        geometry = new THREE.CylinderGeometry(PIN_RADIUS, PIN_RADIUS, blockHeight, cylinderSegments)
        geometry.translate(0, 0, zStart + (ii + 0.5) * UNIT_WIDTH)
        geometries.push(geometry)
      }
    }
    if (data.depth === 1 && data.width > 1) {
      for (let ii = 0; ii < data.width - 1; ii++) {
        geometry = new THREE.CylinderGeometry(PIN_RADIUS, PIN_RADIUS, blockHeight, cylinderSegments)
        geometry.translate(xStart + (ii + 0.5) * UNIT_WIDTH, 0, 0)
        geometries.push(geometry)
      }
    }

    // base cylinders (m x n where m, n > 1)
    if (data.depth > 1 && data.width > 1) {
      for (let ii = 0; ii < data.width - 1; ii++) {
        for (let jj = 0; jj < data.depth - 1; jj++) {

          const xpos = xStart + (ii + 0.5) * UNIT_WIDTH
          const zpos = zStart + (jj + 0.5) * UNIT_WIDTH
          geometry = new THREE.CylinderGeometry(CYLINDER_RADIUS_OUTER,
                                                CYLINDER_RADIUS_OUTER,
                                                blockHeight,
                                                cylinderSegments,
                                                1,
                                                true)
          geometry.translate(xpos, 0, zpos)
          geometries.push(geometry)

          geometry = new THREE.CylinderGeometry(CYLINDER_RADIUS_INNER,
                                                CYLINDER_RADIUS_INNER,
                                                blockHeight, 
                                                cylinderSegments, 
                                                1, 
                                                true)
          geometry.translate(xpos, 0, zpos)
          geometry.scale(-1, 1, 1)
          geometries.push(geometry)

          geometry = new THREE.RingGeometry(CYLINDER_RADIUS_INNER,
                                            CYLINDER_RADIUS_OUTER,
                                            cylinderSegments,
                                            1)
          geometry.rotateX(Math.PI / 2)
          geometry.translate(xpos, -blockHeight/2, zpos)
          geometries.push(geometry)
        }
      }
    }

    this.geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);

    recenterGeometry(this.geometry);
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
    cylinderSegments: 'brick.cylinderSegments',
    movement: 'brick.movement',
    color: 'brick.color',
    plugs: 'brick.plugs'
  }
});

AFRAME.registerComponent('brick', {

  schema: {
    width: {default: 4},
    depth: {default: 2},
    height: {default: 3},
    cylinderSegments: {default: 8},
    movement: {default: 'dynamic'},
    color: {default: 'red'},
    plugs: {default: true}
  },

  init() {

    // id needed for raycast-target component
    if (!this.el.id) {
      this.el.id = THREE.MathUtils.generateUUID()
    }
  },

  update() {

    // clean up previous children
    if (this.visual) {
      this.visual.parentEl.removeChild(this.visual)
    }
    if (this.collider) {
      this.collider.parentEl.removeChild(this.collider)
    }

    this.visual = document.createElement('a-entity')
    // !! Hack to get integration with dynamic-snap working...
    // without this is struggles to find the mesh.
    // !! TO DO BETTER... !!
    this.visual.addEventListener('loaded', () => {
      this.el.setObject3D('mesh', this.visual.getObject3D('mesh'))
      this.el.emit('model-loaded')
    })

    this.visual.setAttribute('geometry', {primitive: 'brick', 
                                          width: this.data.width,
                                          height: this.data.height,
                                          depth: this.data.depth,
                                          cylinderSegments: this.data.cylinderSegments})
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
    this.collider.setAttribute("raycast-target", `#${this.el.id}`)
    this.el.appendChild(this.collider)

    this.el.setAttribute('physx-body', {type: this.data.movement,
                                        highPrecision: true})

    if (this.data.plugs) {
      this.createPlugsAndSockets()
    }
  },

  createPlugsAndSockets() {

    const data = this.data
    
    const blockWidth = data.width * UNIT_WIDTH
    const blockDepth = data.depth * UNIT_WIDTH
    const blockHeight = data.height * PLATE_HEIGHT
    const topOffset = blockHeight / 2

    let xStart = (UNIT_WIDTH - blockWidth) / 2
    let zStart = (UNIT_WIDTH - blockDepth) / 2

    this.el.setAttribute('socket-fabric', {snap: 'events'} )

    for (let ii = 0; ii < data.width; ii++) {
      for (let jj = 0; jj < data.depth; jj++) {
        plug = document.createElement('a-entity')
        plug.object3D.position.set(xStart + ii * UNIT_WIDTH, topOffset, zStart + jj * UNIT_WIDTH)
        plug.id = `${this.el.id}-plug-${ii}-${jj}`
        plug.setAttribute('plug', '')
        this.el.appendChild(plug)

        socket = document.createElement('a-entity')
        socket.object3D.position.set(xStart + ii * UNIT_WIDTH, -topOffset, zStart + jj * UNIT_WIDTH)
        socket.id = `${this.el.id}-socket-${ii}-${jj}`
        socket.setAttribute('socket', '')
        this.el.appendChild(socket)
      }
    }
  }
})

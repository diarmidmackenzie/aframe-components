// Import the library
import { RealityAccelerator } from 'ratk';

AFRAME.registerSystem('xr-room-physics', {

  schema: {
    // when enabled, planes are rendered with random colors to aid in debugging.
    debug: {default: false},

    // depth (i.e. thickness) to use for walls and surfaces
    depth: {default: 0.5},
  },

  init() {

    if (this.el.sceneEl.getAttribute('physics')?.driver === "ammo") {
      this.driver = "ammo"
    }
    else if (this.el.sceneEl.getAttribute('physx')) {
      this.driver = "physx"
    }
    else {
      this.driver = "cannon"
    }

    const scene = this.el.sceneEl.object3D
    const renderer = this.el.sceneEl.renderer
    const ratk = new RealityAccelerator(renderer.xr);
    
    ratk.onPlaneAdded = this.planeAdded.bind(this)
    ratk.onPlaneDeleted = this.planeDeleted.bind(this)
    scene.add(ratk.root);

    this.ratk = ratk

    // needed to work around Ammo.js shape generation bug.
    this.adjustmentVector = new THREE.Vector3()
  },

  // Create an ExtrudeGeometry of appropriate depth.
  // similar to:
  // https://github.com/meta-quest/reality-accelerator-toolkit/blob/b1233141301ced3cc797857e2169f5957a913a96/src/Plane.ts#L48
  createPrismGeometryFromPolygon(polygon) {

    const planeShape = new THREE.Shape()
    polygon.forEach((point, i) => {
      if (i == 0) {
        planeShape.moveTo(point.x, point.z);
      } else {
        planeShape.lineTo(point.x, point.z);
      }
    });
    const geometry = new THREE.ExtrudeGeometry(planeShape, {depth: this.data.depth, bevelEnabled: false});
    geometry.rotateX(-Math.PI / 2);

    // center the geometry, as some physics engines assume that geometries are centered.
    geometry.center();

    return geometry;
  },

  planeAdded(plane) {

    const el = document.createElement('a-entity')
    // Can't do this - not an Object3D error
    // this.el.setObject3D('plane', plane)
    plane.el = el

    // convert plane material into a "hider material", so that it can occlude entities in a scene
    // e/g/ when a ball rolls under a table.
    plane.planeMesh.material.colorWrite = false
    plane.planeMesh.material.side = THREE.DoubleSide

    // take position & orientation from the plane
    el.object3D.position.copy(plane.position)
    el.object3D.quaternion.copy(plane.quaternion)

    // Best solution that works across physics engines is an ExtrudeGeometry
    // Box doesn't work, as the plane can be any polygon.
    // 2 x parallel planes worked in Cannon & Ammo, but not in PhysX, which models the two plans & the gap between them.
    const prismGeometry = this.createPrismGeometryFromPolygon(plane.xrPlane.polygon);
    const mesh = new THREE.Mesh(prismGeometry, plane.planeMesh.material)
    el.setObject3D('mesh', mesh)

    if (this.data.debug) {
      var randomColor = Math.floor(Math.random()*16777215)

      const material = new THREE.MeshBasicMaterial( {color: randomColor, side: THREE.DoubleSide} );
      mesh.material = material
    }
    else {
      mesh.visible = false
    }

    this.adjustmentVector.set(0, this.data.depth / 2, 0)
    this.adjustmentVector.applyQuaternion(plane.quaternion)
    el.object3D.position.add(this.adjustmentVector)

    if (this.driver === 'ammo') {      
      el.setAttribute('ammo-body', 'type: static')
      el.setAttribute('ammo-shape', '')
    }
    else if (this.driver === 'physx') {
      el.setAttribute('physx-body', 'type: static')
      // required for invisible meshes to have physics interactions.
      el.setAttribute('physx-hidden-collision', '')
    }
    else {
      el.setAttribute('static-body', '')
    }
    
    this.el.sceneEl.appendChild(el)
  },

  planeDeleted(plane) {

    const el = plane.el
    el.parentNode.removeChild(el)

  },

  tick() {

    this.ratk.update();

    // what if plane position is updated?  How to refresh?
  }
})

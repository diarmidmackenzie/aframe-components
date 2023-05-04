// Import the library
import { RealityAccelerator } from 'ratk';

AFRAME.registerSystem('xr-room-physics', {

  schema: {
    // when enabled, planes are rendered with random colors to aid in debugging.
    debug: {default: false},

    // depth (i.e. thickness) to use for walls and surfaces
    depth: {default: 0.1},
  },

  init() {

    if (this.el.sceneEl.getAttribute('physics').driver === "ammo") {
      this.driver = "ammo"
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

  planeAdded(plane) {

    const el = document.createElement('a-entity')
    // Can't do this - not an Object3D error
    // this.el.setObject3D('plane', plane)
    plane.el = el

    // take position & orientation from the plane
    el.object3D.position.copy(plane.position)
    el.object3D.quaternion.copy(plane.quaternion)

    // create a mesh consisting of 2 copies of the plane, the rear 'depth' m behind.
    const mesh = new THREE.Group()
    el.setObject3D('mesh', mesh)
    const frontPlane = plane.planeMesh.clone()
    const rearPlane = plane.planeMesh.clone()
    mesh.add(frontPlane)
    mesh.add(rearPlane)
    rearPlane.position.y += this.data.depth

    if (this.data.debug) {
      var randomColor = Math.floor(Math.random()*16777215)

      const material = new THREE.MeshBasicMaterial( {color: randomColor, side: THREE.DoubleSide} );
      frontPlane.material = material
      rearPlane.material = material
    }

    if (this.driver === 'ammo') {

      // Adjustment needed due to bug in Ammo shape generation from 2 parallel planes.
      // Adjust mesh so planes are centered, and adjust plane element position to compensate.
      mesh.position.y -= this.data.depth / 2
      this.adjustmentVector.set(0, this.data.depth / 2, 0)
      this.adjustmentVector.applyQuaternion(plane.quaternion)
      el.object3D.position.add(this.adjustmentVector)
      
      el.setAttribute('ammo-body', 'type: static')
      el.setAttribute('ammo-shape', '')
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

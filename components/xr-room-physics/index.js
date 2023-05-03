// Import the library
import { RealityAccelerator } from 'ratk';

AFRAME.registerSystem('xr-room-physics', {

  init() {
    const scene = this.el.sceneEl.object3D
    const renderer = this.el.sceneEl.renderer
    const ratk = new RealityAccelerator(renderer.xr);
    
    ratk.onPlaneAdded = this.planeAdded.bind(this)
    ratk.onPlaneDeleted = this.planeDeleted.bind(this)
    scene.add(ratk.root);

    this.ratk = ratk

    this.material = new THREE.MeshNormalMaterial()
    this.material.side = THREE.DoubleSide
  },

  planeAdded(plane) {

    const el = document.createElement('a-entity')
    // Can't do this - not an Object3D error
    // this.el.setObject3D('plane', plane)
    plane.el = el

    // create a mesh consisting of 2 copies of the plane, the rear 0.1m behind.
    const mesh = new THREE.Group()
    this.el.setObject3D('mesh', mesh)
    mesh.position.copy(plane.position)
    mesh.quaternion.copy(plane.quaternion)
    const frontPlane = plane.planeMesh.clone()
    const rearPlane = plane.planeMesh.clone()
    mesh.add(frontPlane)
    mesh.add(rearPlane)
    rearPlane.position.z += -0.1
    frontPlane.material = this.material
    rearPlane.material = this.material

    this.el.setAttribute('ammo-body', 'type: static')
    this.el.setAttribute('ammo-shape', '')
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

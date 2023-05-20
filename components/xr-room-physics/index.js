// Import the library
import { RealityAccelerator } from 'ratk';

AFRAME.registerSystem('xr-room-physics', {

  schema: {
    // when enabled, planes are rendered with random colors to aid in debugging.
    debug: {default: false},

    // when debugging enabled, which planes to show.
    showPlanes: {default: "all", oneOf: ["all", "horizontal", "vertical"]},

    // depth (i.e. thickness) to use for walls and surfaces.
    // Setting this to a larger value will reduce the likelihood of fast-moving 
    // objects moving through planes, particularly when Continuous Collision Detection (CCD) 
    // is not supported or is not enabled.

    depth: {default: 0.5},

    // There is a further risk of leakage when CCD is unsupported / not enabled
    // at the corners between the wall plans & the floor planes - see point marked "X".
    // ----|
    // wall|
    //     | 
    //     | 
    //-----X-----------
    //     | floor

    // Also (viewed top down) this case...
    // ----|
    // wall|
    //     | 
    //     | 
    //-----X-----------
    //     | wall
    //     |
    // 
    // We could solve this by enlarging planes, but there are some planes (e.g. a table surface) that
    // we would not want to enlarge.
    // 
    // We should also consider non-convex rooms. So e.g.
    //     |-----------|
    //     |   wall    |
    // ----|           |--------
    // So we can't just extend walls horizontally...
    // 
    //
    // Current solution is to define a floor height & ceiling height, and assume that any horizontal 
    // planes above/below these levels should be scaled up horizontally, to reduce the risk of "leakage"
    // at the joints between the walls and floor / ceiling.  !! DOESN'T WORK FOR WALL-WALL JOINTS...
    //
    // These don't need to match the exact floor & ceiling heights - they just need to ensure that
    // furniture items such as tables don't get scaled up inappropriately.
    floorHeight: {default: 0 },
    ceilingHeight: {default: 2 }
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
    // e.g. when a ball rolls under a table.
    // (but don't do this in debug mode, as it interferes with debug mesh rendering)
    if (!this.data.debug) {
      plane.planeMesh.material.colorWrite = false
      plane.planeMesh.material.side = THREE.DoubleSide
    }

    // take position & orientation from the plane
    el.object3D.position.copy(plane.position)
    el.object3D.quaternion.copy(plane.quaternion)

    // Best solution that works across physics engines is an ExtrudeGeometry
    // Box doesn't work, as the plane can be any polygon.
    // 2 x parallel planes worked in Cannon & Ammo, but not in PhysX, which models the two plans & the gap between them.
    const prismGeometry = this.createPrismGeometryFromPolygon(plane.xrPlane.polygon);
    const mesh = new THREE.Mesh(prismGeometry, plane.planeMesh.material)
    el.setObject3D('mesh', mesh)

    // Concept:
    // for each axis of the plane, extend by delta (0.1m?)
    // raycast from camera to this delta.
    // count intersections (front sides & back sides)
    // if front intersections > back intersections, we can extend the plane in that direction...
    // Repeat multiple times to verify this for various deltas...
    // expand to maximum delta that we could safely extend to...

/* Some code c/o ChatGPT that helps with this
    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3(0, 0, 0);
    const direction = new THREE.Vector3(0, 0, -1).normalize();

    raycaster.set(origin, direction);

    const intersections = raycaster.intersectObject(mesh);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      const dot = raycaster.ray.direction.dot(intersection.face.normal);
      if (dot < 0) {
        // hit the back face of the geometry
      } else {
        // hit the front face of the geometry
      }
    }
*/

    if (plane.xrPlane.orientation === "horizontal" &&
        (el.object3D.position.y <= this.data.floorHeight ||
         el.object3D.position.y >= this.data.ceilingHeight)) {
      // scale up floor & ceiling planes horizontally to reduce leakage at joints with walls,
      // where Continuous Collision Detection (CCD) is not implemented.
      //mesh.scale.set(2, 1, 2)
    }

    if (this.data.debug && 
        (this.data.showPlanes === "all" || 
         this.data.showPlanes === plane.xrPlane.orientation)) {

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

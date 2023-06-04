// Import the library
import { RealityAccelerator } from 'ratk'

const targetPoint = new THREE.Vector3()
const sideVector = new THREE.Vector3()
const adjustmentVector = new THREE.Vector3()
const yAxis = new THREE.Vector3(0, 1, 0)
const targetDirection = new THREE.Vector3()
const adjustedPoint = new THREE.Vector3()
const raycaster = new THREE.Raycaster()
const rayOrigin = new THREE.Vector3(0, 1.5, 0)
const rayResults = []

AFRAME.registerComponent('xr-room-physics', {

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
    this.planes = []

    ratk.onPlaneAdded = this.planeAdded.bind(this)
    ratk.onPlaneDeleted = this.planeDeleted.bind(this)
    scene.add(ratk.root);

    this.ratk = ratk

  },

  // Create an ExtrudeGeometry of appropriate depth.
  // similar to:
  // https://github.com/meta-quest/reality-accelerator-toolkit/blob/b1233141301ced3cc797857e2169f5957a913a96/src/Plane.ts#L48
  // sideAdjustments is an array of vectors indicating adjustments to make to each side.
  // this is an array of Vector3s, with y = 0, a and z indicating the adjustments to be made in x and z axes.
  createPrismGeometryFromPolygon(polygon, sideAdjustments) {

    const planeShape = new THREE.Shape()
    polygon.forEach((point, i) => {

      adjustedPoint.set(point.x, 0, point.z)

      if (sideAdjustments) {
        const length = sideAdjustments.length
        const cwSideIndex = (i + length) % length
        const ccwSideIndex = (i + length - 1)  % length
        adjustedPoint.add(sideAdjustments[cwSideIndex])
        adjustedPoint.add(sideAdjustments[ccwSideIndex])
      }

      console.log("Adjusted point: x: ", adjustedPoint.x, "z:", adjustedPoint.z)
      
      if (i == 0) {
        planeShape.moveTo(adjustedPoint.x, adjustedPoint.z);
      } else {
        planeShape.lineTo(adjustedPoint.x, adjustedPoint.z);
      }
    });
    const geometry = new THREE.ExtrudeGeometry(planeShape, {depth: this.data.depth, bevelEnabled: false});
    geometry.rotateX(-Math.PI / 2);

    // center the geometry, as some physics engines assume that geometries are centered.
    geometry.center();

    return geometry;
  },

  planeAdded(plane) {

    this.planes.push(plane)

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
    // Box doesn't work, as the plane can be any polygon
    // (in theory, at least; in practice on Meta Quest in 2023 they are always rectangles)
    // 2 x parallel planes worked in Cannon & Ammo, but not in PhysX, which models the two plans & the gap between them.
    const prismGeometry = this.createPrismGeometryFromPolygon(plane.xrPlane.polygon);
    const mesh = new THREE.Mesh(prismGeometry, plane.planeMesh.material)
    el.setObject3D('mesh', mesh)

    if (this.data.debug && 
        (this.data.showPlanes === "all" || 
         this.data.showPlanes === plane.xrPlane.orientation)) {

      var randomColor = Math.floor(Math.random()*16777215)
      const material = new THREE.MeshBasicMaterial( {color: randomColor,
                                                     side: THREE.DoubleSide,
                                                     transparent: true,
                                                     opacity: 0.5} );
      mesh.material = material

    }
    else {
      mesh.visible = false
    }

    adjustmentVector.set(0, this.data.depth / 2, 0)
    adjustmentVector.applyQuaternion(plane.quaternion)
    el.object3D.position.add(adjustmentVector)

    this.setPhysicsBody(el)
    
    this.el.sceneEl.appendChild(el)

    // World Matrix must be updated for raycasting checks against this to work.
    el.object3D.updateWorldMatrix(true, true)

    // extend plans to protect against leakage when physics engine does not support CCD.
    // NOTE: very inefficient to do this every time a plane is added / removed
    // but hard to do better with current ratk interface, as we don't know how many planes are
    // going to be added, and don't get told when the last plane is added.
    this.implementLeakProtection()
  },

  setPhysicsBody(el) {

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
  },

  removePhysicsBody(el) {

    if (this.driver === 'ammo') {      
      el.removeAttribute('ammo-shape')
      //el.removeAttribute('ammo-body') - hits bug when Ammo not yet initialzied.
      // maybe removing shape is enough to get physics shape updated.
    }
    else if (this.driver === 'physx') {
      el.removeAttribute('physx-body')
      el.removeAttribute('physx-hidden-collision')
    }
    else {
      el.removeAttribute('static-body')
    }
  },

  updatePlaneGeometry(plane) {

    const mesh =  plane.el.getObject3D('mesh')
    const oldGeometry = mesh.geometry

    mesh.geometry = this.createPrismGeometryFromPolygon(plane.xrPlane.polygon, plane.sideAdjustments);

    // geometry may have been lop-sided by extensions.  Correct for this.
    plane.el.object3D.position.copy(plane.position)
    plane.sideAdjustments.forEach((adj) => {
      //console.log("Adjustment: ", adj)
      adjustmentVector.copy(adj)
      adjustmentVector.applyQuaternion(plane.el.object3D.quaternion)
      plane.el.object3D.position.addScaledVector(adjustmentVector, 0.5)
      //console.log("Applied adjustment: ", adjustmentVector)
    })

    // and set plane volume back behind plane in (local) y-axis
    adjustmentVector.set(0, this.data.depth / 2, 0)
    adjustmentVector.applyQuaternion(plane.quaternion)
    plane.el.object3D.position.add(adjustmentVector)

    oldGeometry.dispose()

    // reset physics to reflect new geometry
    // important not to reset until the component has been initialized due to an A-Frame bug:
    // https://github.com/aframevr/aframe/issues/4973
    // using setTimeout() provides an adequate workaround.
    setTimeout(() => {
      this.removePhysicsBody(plane.el)
      this.setPhysicsBody(plane.el)
    })
  },

  // We need to avoid leakage when CCD is unsupported / not enabled.
    // We have issues at the corners between the wall plans & the floor planes - see point marked "X".
    // ----|
    // wall|
    //     | 
    //     | 
    //-----X-----------
    //     | floor
    //
    // And also between walls as in this case (viewed top down) ...
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
    // Solution is as follows:
    // - in each direction that the plane extends in...
    //   - pick a point some delta (e.g. 0.1m) beyond the plane.
    //   - raycast from the camera to this point
    //   - count the number of intersections (front sides & back sides)
    //   - if front intersections > back intersections, we can extend the plane in that direction
    //     (that point is "outside the space bounded by the planes")
    //   - if front intersection <= back intersections, we cannot extend the plane in that direction.
    //   - Repeat multiple times to verify this for various deltas...
    //   - expand to maximum delta that we could safely extend to... (up to the configured depth)
    // 
    // This process can only be completed when the geometry for all planes in place.

  implementLeakProtection() {

    console.log("=== Running leak protection with ", this.planes.length, " planes. ===" )

    // valid shortcut - helps with debugging simple cases.
    if (this.planes.length <= 1) return 

    this.planes.forEach(plane => this.adjustPlaneForLeaks(plane))

  },

  adjustPlaneForLeaks(plane) {

    plane.sideAdjustments = []
    const points = plane.xrPlane.polygon

    for (let ii = 0; ii < points.length - 1; ii++) {
      console.log("===== Assessing side adjustment", ii, "=============")
      const sideAdjustmentVector = new THREE.Vector3() 
      this.getSideAdjustment(plane, points[ii], points[ii + 1], sideAdjustmentVector)
      console.log("side adjustment", ii, "for points: ", points[ii], "and", points[ii + 1], "size:", sideAdjustmentVector.length(), "vector: ", sideAdjustmentVector)
      plane.sideAdjustments.push(sideAdjustmentVector)
    }

    console.log("side adjustments", plane.sideAdjustments)

    this.updatePlaneGeometry(plane)
  },

  getSideAdjustment(plane, v1, v2, vector) {

    const delta = 0.1
    let testAdjustmentVector = new THREE.Vector3()
    let testAdjustment = 0
    let adjust = true

    for (testAdjustment = 0.1; testAdjustment <= this.data.depth; testAdjustment += delta) {
      adjust = this.testAdjustment(plane, v1, v2, testAdjustment, testAdjustmentVector)

      if (adjust) {
        vector.copy(testAdjustmentVector)
      }
      else {
        break
      }
    }

    return vector
  },

  testAdjustment(plane, v1, v2, adjustment, adjustmentVector) {

    targetPoint.set((v1.x + v2.x) / 2, 0, (v1.z + v2.z) / 2)
    //console.log("edge point", targetPoint.x, targetPoint.y, targetPoint.z)

    sideVector.set(v2.x - v1.x, 0, v2.z - v1.z)
    adjustmentVector.crossVectors(yAxis, sideVector)
    adjustmentVector.normalize().multiplyScalar(adjustment)

    
    targetPoint.add(adjustmentVector)
    //console.log("adjusted point", targetPoint.x, targetPoint.y, targetPoint.z)

    plane.localToWorld(targetPoint)
    //console.log("world space adjusted point", targetPoint.x, targetPoint.y, targetPoint.z)

    targetPoint.sub(rayOrigin)
    targetDirection.copy(targetPoint).normalize()
    //console.log("adjusted point relative to ray origin", targetPoint.x, targetPoint.y, targetPoint.z)

    raycaster.set(rayOrigin, targetDirection);

    const distance = targetPoint.length()

    const planeObjects = this.planes.map(p => p.el.getObject3D('mesh'))
    rayResults.length = 0
    raycaster.intersectObjects(planeObjects, false, rayResults);

    console.log("target point", targetPoint.x, targetPoint.y, targetPoint.z)
    console.log("target point length", targetPoint.length())
    console.log("target point distance", distance)
    //console.log("plane Objects", planeObjects)

    let faceCounts = 0
    rayResults.forEach(intersection => {

      // we only care about intersections closer than the target point.
      console.log("Target point distance", distance)
      console.log("Intersection point", intersection.point.x, intersection.point.y, intersection.point.z)
      console.log("Intersection distance", intersection.distance)
      if (intersection.distance < distance) {

        const dot = raycaster.ray.direction.dot(intersection.face.normal);

        if (dot < 0) {
          // back face of geometry
          console.log("back face")
          faceCounts -= 1
        }
        else {
          // front face of geometry
          console.log("front face")
          faceCounts += 1
        }
      }
    })

    // positive face counts = extension is "outside the room" and we can extend
    return (faceCounts > 0)

  },

  planeDeleted(plane) {

    const index = this.planes.findIndex(p => p === plane)
    this.planes.splice(index)

    const el = plane.el
    el.parentNode.removeChild(el)

    this.implementLeakProtection()
  },

  tick() {

    this.ratk.update();

    // what if plane position is updated?  How to refresh?
  }
})

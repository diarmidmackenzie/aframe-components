// Snap to grid component for use with dynamic-snap component.
AFRAME.registerComponent('snap-to-grid', {
  dependencies: ['position', 'rotation'],

  schema: {
    offset: {type: 'vec3', default: {x: 0, y: 0, z: 0}},
    snap: {type: 'vec3', default: {x: 0.5, y: 0.5, z: 0.5}}
  },

  init() {

    this.transform = new THREE.Object3D()
    this.eventData = {worldTransform: this.transform}

    this.axis = new THREE.Vector3()
  },

  tick() {

    const data = this.data;
    const transform = this.transform

    // get world transform of entity
    transform.position.set(0, 0, 0)
    transform.quaternion.identity()
    transform.scale.set(1, 1, 1)
    this.el.object3D.add(transform)
    this.el.sceneEl.object3D.attach(transform)

    // snap to position grid
    const pos = this.transform.position
    pos.x = Math.floor((pos.x + data.snap.x / 2) / data.snap.x) * data.snap.x + data.offset.x;
    pos.y = Math.floor((pos.y + data.snap.y / 2) / data.snap.y) * data.snap.y + data.offset.y;
    pos.z = Math.floor((pos.z + data.snap.z / 2) / data.snap.z) * data.snap.z + data.offset.z;

    // snap to 90 degree rotation
    // do this by converting to axis / angle as described here, then controlling the axis and angle.
    // https://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm
    const quat = transform.quaternion
    quat.normalize()
    const s = Math.sqrt(1-quat.w*quat.w)
    if (s < 0.01) {
      quat.identity()
    }
    else {
      let x = quat.x
      let y = quat.y
      let z = quat.z

      if (Math.abs(x) >= Math.abs(y) && Math.abs(x) >= Math.abs(z)) {
        x = Math.sign(x)
        y = 0
        z = 0
      }
      else if (Math.abs(y) >= Math.abs(x) && Math.abs(y) >= Math.abs(z)) {
        x = 0
        y = Math.sign(y)
        z = 0
      }
      else {
        x = 0
        y = 0
        z = Math.sign(z)
      }

      this.axis.set(x, y, z)

      let angle = 2 * Math.acos(quat.w)
      const rotationSnap = Math.PI / 2
      angle = Math.floor(angle / rotationSnap) * rotationSnap

      quat.setFromAxisAngle(this.axis, angle)
    }

    this.el.emit('snapStart', this.eventData)
  },
});
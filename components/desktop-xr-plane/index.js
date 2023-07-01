AFRAME.registerSystem('desktop-xr-plane', {

  init() {
    
    // If there is an XR session (real or simulated), do nothing.
    const xrSession = this.el.sceneEl.renderer.xr.getSession()
    if (xrSession) {
        console.log("desktop-xr-plane suppressed due to presence of an XR session")
        return;
    }

    const scene = this.el.sceneEl

    const renderer = scene.sceneEl.renderer

    this.planes = {}
    this.planeData = new Set()
    this.planeRotation = new THREE.Quaternion()
    this.planeRotation.setFromAxisAngle({x: 1, y: 0, z: 0}, -Math.PI / 2)
    this.rotatedQuaternion = new THREE.Quaternion()

    this.frame = {
      detectedPlanes: this.planeData,
      getPose: (key) => {

        const plane = this.planes[key]

        const p = plane.object3D.position
        const q = this.rotatedQuaternion
        q.multiplyQuaternions(plane.object3D.quaternion, this.planeRotation)
        // assume scale = 1
        const matrix = new THREE.Matrix4().compose(p, q, {x: 1, y: 1, z: 1})
        return {transform: {matrix: matrix.elements}}
      }
    }

    const xr = {
      getFrame:  () => {
        return(this.frame)
      },
      getReferenceSpace:  () => {},
      setPoseTarget: () => {}
    }
    renderer.xr = xr

    xr.isPresenting = true

  },

  registerPlane(key, planeEl) {

    this.planes[key] = planeEl

    const geometry = planeEl.getObject3D('mesh').geometry

    const x = geometry.parameters.width / 2
    const z = geometry.parameters.height / 2

    const SQUARE = [
      {x: -x, z: -z},
      {x: x, z: -z},
      {x: x, z: z},
      {x: -x, z: z},
      {x: -x, z: -z}
    ]
    
    const isHorizontal = (plane) => {

      const up = new THREE.Vector3(0, 1, 0)
      const normal = new THREE.Vector3(0, 0, 1)
      normal.applyQuaternion(plane.object3D.quaternion) 

      alignment = normal.dot(up)

      return (Math.abs(alignment) > 0.99)
    }

    planeData = { lastChangedTime: 1,
                  polygon: SQUARE,
                  planeSpace: key,
                  orientation: isHorizontal(planeEl) ? "horizontal" : "vertical"
                }

    this.planeData.add(planeData)

  }
})

AFRAME.registerComponent('desktop-xr-plane', {

  init() {

    if (!this.el.id) {
      this.el.id = THREE.MathUtils.generateUUID()
    }

    this.system.registerPlane(this.el.id, this.el)
  }

})

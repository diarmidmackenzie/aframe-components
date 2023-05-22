AFRAME.registerComponent('head-tracker', {

  schema: {
    // fov (width) of the webcam
    cameraFov: { default: 60},

    // assumed width (m) of the head
    headWidth: {default: 0.2},

    // Per-frame factor used for exponential moving average of face position
    // This is the weight given to old data points, rather than the new data point (0.9 = 90%)
    stabilizationFactor: {default: 0.9},

    debug: {default: false}
  },

  events: {
    'face-detected': function(e) { this.faceDetected(e) }
  },

  init() {

    this.headPosition = new THREE.Vector3(0, 0, 0.75)
    this.newHeadPosition = new THREE.Vector3()
  },

  update() {

    if (this.data.debug && !this.debugBox) {
      this.debugBox = document.createElement('a-plane')
      this.debugBox.setAttribute('height', this.data.headWidth)
      this.debugBox.setAttribute('width', this.data.headWidth)
      this.debugBox.setAttribute('color', 'red')
      this.debugBox.setAttribute('opacity', 0.5)
      this.updateDebugBox()
      this.el.camera.el.appendChild(this.debugBox)
    }
  },

  updateDebugBox() {
    const pos = this.headPosition
    this.debugBox.object3D.position.copy(pos)
    this.debugBox.object3D.position.z = -pos.z
    const posText = `x: ${pos.x.toFixed(2)}
                      y: ${pos.y.toFixed(2)}
                      z: ${pos.z.toFixed(2)}`
    this.debugBox.setAttribute('text', `color: white; align: center; value: ${posText} ; wrapCount: 10`)
  },
  
  faceDetected(e) {

    if (e.detail.detections.length < 1) return

    const {headWidth, cameraFov, stabilizationFactor} = this.data
    const {originX, originY, width, height} = e.detail.detections[0].boundingBox
    const {videoHeight, videoWidth} = e.detail.video

    const faceCenterX = originX + width / 2
    const faceCenterY = originY + height / 2

    // estimate face distance from camera.
    const occludedAngle = cameraFov * (width / videoWidth) 
    faceDistance = (headWidth / 2) / Math.tan(THREE.MathUtils.degToRad(occludedAngle / 2))

    // compute head XYZ from face position & distance.
    
    const fustrumWidthAtFaceDistance = 2 * faceDistance * Math.tan(THREE.MathUtils.degToRad(cameraFov / 2))
    const metersPerVideoPixel = fustrumWidthAtFaceDistance / videoWidth
    const headX = metersPerVideoPixel * (videoWidth / 2 - faceCenterX)

    // Report position relative to the webcam (not e.g. the center of the laptop screen)
    const headY = metersPerVideoPixel * (videoHeight / 2 - faceCenterY)
    
    this.newHeadPosition.set(headX, headY, faceDistance)
    this.headPosition.lerp(this.newHeadPosition, 1 - stabilizationFactor)

    if (this.data.debug) {
      this.updateDebugBox()
    }
  }
})
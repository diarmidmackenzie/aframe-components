AFRAME.registerComponent('head-tracker', {

  schema: {
    // fov (width) of the webcam
    cameraFov: { default: 60},

    // assumed inter-pupil distance (m)
    ipd: {default: 0.07},

    // Per-frame factor used for exponential moving average of face position
    // This is the weight given to old data points, rather than the new data point (0.9 = 90%)
    stabilizationFactor: {default: 0.9},

    debug: {default: false},

    defaultPosition: {type: 'vec3', default: {x: 0, y: 0, z: 0.75}},
  },

  events: {
    'face-detected': function(e) { this.faceDetected(e) }
  },

  init() {

    this.headPosition = new THREE.Vector3().copy(this.data.defaultPosition)
    this.newHeadPosition = new THREE.Vector3()

    this.lPupil = new THREE.Vector2()
    this.rPupil = new THREE.Vector2()
  },

  update() {

    if (this.data.debug && !this.debugBox) {
      this.debugBox = document.createElement('a-plane')
      this.debugBox.setAttribute('height', 0.2)
      this.debugBox.setAttribute('width', 0.2)
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

    const {ipd, cameraFov, stabilizationFactor} = this.data
    const {videoHeight, videoWidth} = e.detail.video

    const lPupilKeypoint = e.detail.detections[0].keypoints[0]
    const rPupilKeypoint = e.detail.detections[0].keypoints[1]
    const lPupil = this.lPupil
    const rPupil = this.rPupil

    const getPixelPosition = (keypoint, outputVector) => {

      outputVector.x = videoWidth * keypoint.x //  originX + (width * keypoint.x)
      outputVector.y = videoHeight * keypoint.y //originY + (height * keypoint.y)
    }

    getPixelPosition(lPupilKeypoint, lPupil)
    getPixelPosition(rPupilKeypoint, rPupil)

    const xDiff = lPupil.x - rPupil.x
    const yDiff = lPupil.y - rPupil.y
    const observedIpd = Math.sqrt(xDiff * xDiff + yDiff * yDiff)

    const eyesMidpointX = (lPupil.x + rPupil.x) / 2
    const eyesMidpointY = (lPupil.y + rPupil.y) / 2

    // estimate face distance from camera, based on inter-pupil distance
    const ipdAngle = cameraFov * (observedIpd / videoWidth)
    faceDistance = (ipd / 2) / Math.tan(THREE.MathUtils.degToRad(ipdAngle / 2))

    // compute head XYZ from face position & distance.
    const fustrumWidthAtFaceDistance = 2 * faceDistance * Math.tan(THREE.MathUtils.degToRad(cameraFov / 2))
    const metersPerVideoPixel = fustrumWidthAtFaceDistance / videoWidth
    const headX = metersPerVideoPixel * (videoWidth / 2 - eyesMidpointX)

    // Report position relative to the webcam (not e.g. the center of the laptop screen)
    const headY = metersPerVideoPixel * (videoHeight / 2 - eyesMidpointY)
    
    this.newHeadPosition.set(headX, headY, faceDistance)
    this.headPosition.lerp(this.newHeadPosition, 1 - stabilizationFactor)

    if (this.data.debug) {
      this.updateDebugBox()
    }
  }
})
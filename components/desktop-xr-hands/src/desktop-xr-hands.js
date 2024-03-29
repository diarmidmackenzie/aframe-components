require('aframe-screen-display')

class XRJointPose {

  constructor() {
    this.transform = new XRRigidTransform
    this.radius = 0
  }
}

class MockXRJointPose {

  constructor() {
    this.radius = 0
    this.transform = {
      matrix: new Float32Array(16),
      orientation: {x: 0, y: 0, z: 0, w: 1},
      position: {x: 0, y: 0, z: 0, w: 1}
    }
  }
}

const xrJoints = [
  "wrist",

  "thumb-metacarpal",
  "thumb-phalanx-proximal",
  "thumb-phalanx-distal",
  "thumb-tip",

  "index-finger-metacarpal",
  "index-finger-phalanx-proximal",
  "index-finger-phalanx-intermediate",
  "index-finger-phalanx-distal",
  "index-finger-tip",

  "middle-finger-metacarpal",
  "middle-finger-phalanx-proximal",
  "middle-finger-phalanx-intermediate",
  "middle-finger-phalanx-distal",
  "middle-finger-tip",

  "ring-finger-metacarpal",
  "ring-finger-phalanx-proximal",
  "ring-finger-phalanx-intermediate",
  "ring-finger-phalanx-distal",
  "ring-finger-tip",

  "pinky-finger-metacarpal",
  "pinky-finger-phalanx-proximal",
  "pinky-finger-phalanx-intermediate",
  "pinky-finger-phalanx-distal",
  "pinky-finger-tip"
]

// [position1, position2, weight, orientation start, orientation end, perpendicular vector start, perpendicular vector end]
// See Mediapipe landmarks here:
// https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
// And WebXR hand joints here:
// https://www.w3.org/TR/webxr-hand-input-1/#skeleton-joints-section

const xrJointMPMappings = [
  [0, 0, 1, 0, 9, 17, 5], // "wrist"

  [0, 1, 0.6, 0, 1, 0, 9], // "thumb-metacarpal"
  [2, 2, 1, 1, 2, 1, 9], // "thumb-phalanx-proximal"
  [3, 3, 1, 2, 3, 1, 9], // "thumb-phalanx-distal"
  [4, 4, 1, 3, 4, 1, 9], // "thumb-tip"

  [1, 5, 0.3, 1, 5, 9, 5], // "index-finger-metacarpal"
  [5, 5, 1, 5, 6, 9, 5], // "index-finger-phalanx-proximal"
  [6, 6, 1, 6, 7, 9, 5], // "index-finger-phalanx-intermediate"
  [7, 7, 1, 6, 7, 9, 5], // "index-finger-phalanx-distal"
  [8, 8, 1, 7, 8, 9, 5], // "index-finger-tip"

  [0, 9, 0.3, 0, 9, 13, 5], // "middle-finger-metacarpal"
  [9, 9, 1, 9, 10, 13, 5], // "middle-finger-phalanx-proximal"
  [10, 10, 1, 10, 11, 13, 5], // "middle-finger-phalanx-intermediate"
  [11, 11, 1, 10, 11, 13, 5], // "middle-finger-phalanx-distal"
  [12, 12, 1, 11, 12, 13, 5], // "middle-finger-tip"

  [0, 13, 0.3, 0, 13, 17, 9], // "ring-finger-metacarpal"
  [13, 13, 1, 13, 14, 17, 9], // "ring-finger-phalanx-proximal"
  [14, 14, 1, 14, 15, 17, 9], // "ring-finger-phalanx-intermediate"
  [15, 15, 1, 14, 15, 17, 9], // "ring-finger-phalanx-distal"
  [16, 16, 1, 15, 16, 17, 9], // "ring-finger-tip"

  [0, 17, 0.3, 0, 17, 17, 13], // "pinky-finger-metacarpal"
  [17, 17, 1, 17, 18, 17, 13], // "pinky-finger-phalanx-proximal"
  [18, 18, 1, 18, 19, 17, 13], // "pinky-finger-phalanx-intermediate"
  [19, 19, 1, 18, 19, 17, 13], // "pinky-finger-phalanx-distal"
  [20, 20, 1, 19, 20, 17, 13], // "pinky-finger-tip"
]

// used for temporary working.
const _vector = new THREE.Vector3()
const _direction = new THREE.Vector3()
const _zAxis = new THREE.Vector3(0, 0, -1)
const _xAxis = new THREE.Vector3()
const _perpDirection = new THREE.Vector3()
const _position = new THREE.Vector3()
const _twist = new THREE.Quaternion()
const _orientation = new THREE.Quaternion()
const _scale = new THREE.Vector3(1, 1, 1)
const _matrix = new THREE.Matrix4()

AFRAME.registerSystem('desktop-xr-hands', {

  schema: {
      // fov (width) of the webcam
      // used in computing distance of hands from the camera.
      cameraFov: { default: 60},

      // zOffset at which to render the hands.
      // Hands will be level with the scene camera when they are 
      // approximately this distance from the webcam.
      zOffset: { default: 1}
  },

  init() {
    
    this.handsDetected = this.handsDetected.bind(this)
    this.el.addEventListener('hands-detected', this.handsDetected)
    this.latestHandData = null

    this.simulateHands = this.simulateHands.bind(this)
    this.removeHands = this.removeHands.bind(this)
    this.el.sceneEl.addEventListener('enter-vr', this.simulateHands)
    this.el.sceneEl.addEventListener('exit-vr', this.removeHands)

    this.createHands()

    this.frame = {
      fillPoses: this.fillPoses.bind(this),
      fillJointRadii: this.fillJointRadii.bind(this),
      getJointPose: this.getJointPose.bind(this),
    }

    this.referenceSpace = {
      getOffsetReferenceSpace: () => this.referenceSpace
    }

    this.xr = {
      getFrame:  () => {
        return(this.frame)
      },
      getSession: () => {
        return this.xrSession
      },
      getEnvironmentBlendMode: () => {
        return 'alpha-blend'
      }
      //getReferenceSpace:  () => {},
      //setPoseTarget: () => {}
    }

    this.inputSources = [
      { 
        hand: {
          get: (key) => this.getJoint(this.leftHand, key),
          values: () => xrJoints.map((key) => this.getJoint(this.leftHand, key)),
          size: 25
        },
        handedness: 'left'
      },
      { 
        hand: {
          get: (key) => this.getJoint(this.rightHand, key),
          values: () => xrJoints.map((key) => this.getJoint(this.rightHand, key)),
          size: 25
        },
         handedness: 'right'
      }
    ]

    this.xrSession = {
      requestReferenceSpace:  () => new Promise((resolve) => {resolve(this.referenceSpace)}),
      inputSources: this.inputSources
    }

    // use parent container, so that video scale can be manipulated to flip scale and adjust height.
    this.videoOutputContainer = document.createElement('a-entity')
    this.videoOutputContainer.setAttribute('screen-display', 'xpos: 12; ypos: 12; width: 20')
    document.querySelector('[camera]').appendChild(this.videoOutputContainer)

    this.videoOutput = document.createElement('a-plane')
    this.videoOutput.id = 'desktop-xr-hands-video-output'
    this.videoOutputContainer.appendChild(this.videoOutput)
    this.videoOutput.setAttribute('visible', false)
  },

  getJoint(hand, key) {

    return { hand: hand, jointName: key }

  },

  createHands() {

    this.leftHand = {gotData: false,
                     position: new THREE.Vector3()}
    this.rightHand = {gotData: false,
                      position: new THREE.Vector3()}

    xrJoints.forEach((jointName) => {
      const pose = new MockXRJointPose()
      this.leftHand[jointName] = pose
    })

    xrJoints.forEach((jointName) => {
      const pose = new MockXRJointPose()
      this.rightHand[jointName] = pose
    })
  },

  getJointPose(joint) {

    const {hand, jointName} = joint
    const pose = hand[jointName]
    return pose
  },

  fillPoses(spaces, baseSpace, transforms) {

    if (!spaces[0].hand.gotData) return false

    spaces.forEach((space, index) => {
      const pose = this.getJointPose(space)
      transforms.set(pose.transform.matrix, index * 16)
    })

    return true
  },

  fillJointRadii(jointSpaces, radii) {

    if (!jointSpaces[0].hand.gotData) return false
    
    jointSpaces.forEach((space, index) => {
      const pose = this.getJointPose(space)
      radii[index] = pose.radius
    })

    return true
  },

  simulateHands() {
    // If there is an XR session (real or simulated), do nothing.
    const renderer = this.el.sceneEl.renderer
    const xr = renderer.xr
    const xrSession = xr.getSession ? xr.getSession() : null
    if (xrSession) {
        console.log("desktop-xr-hands suppressed due to presence of an XR session")
        return;
    }

    this.originalXr = xr
    renderer.xr = this.xr
    this.xrSession.isPresenting = true
    this.el.sceneEl.xrSession = this.xr.getSession()

    this.el.setAttribute('hand-landmarker', 'videoOutput: #desktop-xr-hands-video-output')
  
    this.el.sceneEl.emit('controllerconnected')
    this.el.sceneEl.emit('controllersupdated')

    this.videoOutput.setAttribute('visible', true)
  },

  removeHands() {

    this.xrSession.isPresenting = false
    this.el.removeAttribute('hand-landmarker')

    if (this.originalXr) {
      this.el.sceneEl.renderer.xr = this.originalXr
    }

    this.videoOutput.setAttribute('visible', false)
  },

  handsDetected(e) {

    this.latestHandData = e.detail.handData

    this.latestHandData.handednesses.forEach((handedness, index) => {

      let hand

      if (handedness[0].categoryName === "Right") {
        hand = this.rightHand
      }
      else {
        // Left
        hand = this.leftHand
      }

      hand.gotData = true

      const landmarks = this.latestHandData.landmarks[index]
      this.extractWorldPosition(landmarks, hand.position)

      const worldLandmarks = this.latestHandData.worldLandmarks[index]
      this.extractPoseData(hand, worldLandmarks, hand.position)
    })
  },

  extractWorldPosition(landmarks, position) {

    // To estimate the world position of the hand, we calculate the width & height of
    // the palm, and use the angle occluded by the larger of these two measurements
    // to estimate the distance of the hand from the camera.
    const palmPoints = [0, 1, 2, 5, 9, 13, 17]

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    palmPoints.forEach((pointIndex) => {
      const landmark = landmarks[pointIndex]
      const x = landmark.x
      const y = landmark.y
      if (x > maxX) maxX = x
      if (x < minX) minX = x
      if (y > maxY) maxY = y
      if (y < minY) minY = y
    })

    const width = maxX - minX
    const height = maxY - minY
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    const palmSize = Math.max(width, height)

    // estimate palm distance from camera, based on palm size
    const {cameraFov} = this.data
    const palmAngle = cameraFov * palmSize
    const palmActualSize = 0.08 // assumed palm width in m.
    const palmDistance = (palmActualSize / 2) / Math.tan(THREE.MathUtils.degToRad(palmAngle / 2))

    // compute hand XYZ from hand position & distance.
    const fustrumWidthAtPalmDistance = 2 * palmDistance * Math.tan(THREE.MathUtils.degToRad(cameraFov / 2))
    const palmX = fustrumWidthAtPalmDistance * (1 / 2 - centerX)
    const palmY = fustrumWidthAtPalmDistance * (1 / 2 - centerY)

    // add assumed camera position of (0, 1.6, 0)
    // ## TODO adapt to actual camera position so hands move with camera.
    position.set(palmX, palmY + 1.6, palmDistance - this.data.zOffset)
  },

  extractPoseData(hand, worldLandmarks, basePosition) {

    xrJoints.forEach((name, index) => {
      this.extractDataPoint(hand, name, index, worldLandmarks, basePosition)
    })
  },

  extractDataPoint(hand, jointName, jointIndex, worldLandmarks, basePosition) {

    // Needed to map from Mediapipe space to XR scene space.
    // I don't understand exactly why these are needed, but this seems to work...
    // x-flip makes sense due to front webcam mirroring the scene
    // no real understanding why the y-flip is needed.
    const flipVector = (v) => {
      v.x = -v.x
      v.y = -v.y
    }

    const [posIndex,
           pos2Index,
           weight,
           startIndex,
           endIndex,
           perpStartIndex,
           perpEndIndex] = xrJointMPMappings[jointIndex]

    // determine orientation
    const start = worldLandmarks[startIndex]
    const end = worldLandmarks[endIndex]
    _direction.subVectors(end, start).normalize()
    flipVector(_direction)
    _orientation.setFromUnitVectors(_zAxis, _direction)

    // add twist, if perpendicular vector specified.
    if (perpStartIndex !== undefined &&
        perpEndIndex  !== undefined ) {
      const xDirection = (hand === this.leftHand) ? 1 : -1
      _xAxis.set(xDirection, 0, 0)
      _xAxis.applyQuaternion(_orientation)
      
      const perpStart = worldLandmarks[perpStartIndex]
      const perpEnd = worldLandmarks[perpEndIndex]
      _perpDirection.subVectors(perpStart, perpEnd)
      // perpendicular direction must be orthogonal to _direction, so that we only twist around the transformed z axis.
      _perpDirection.projectOnPlane(_direction) 
      _perpDirection.normalize()

      _twist.setFromUnitVectors(_perpDirection, _xAxis)
      _orientation.premultiply(_twist)
    }

    // determine position
    _position.copy(worldLandmarks[posIndex])
    _vector.copy(worldLandmarks[pos2Index])
    _position.lerp(_vector, weight)
    flipVector(_position)
    _position.add(basePosition)

    // fill in XRJointPose object with data
    _matrix.compose(_position, _orientation, _scale)
    
    const pose = hand[jointName]
    pose.radius = 0.01
    const transform = pose.transform
    _matrix.toArray(transform.matrix)
    const position = transform.position
    position.x = _position.x
    position.y = _position.y
    position.z = _position.z
    position.w = 1

    const orientation = transform.orientation
    orientation.x = _orientation.x
    orientation.y = _orientation.y
    orientation.z = _orientation.z
    orientation.w = _orientation.w
  },

  remove() {
    this.removeHands()
  },

  tick() {

    // necessary to keep rendered texture up-to-date.
    // see: https://aframe.io/docs/1.4.0/components/material.html#canvas-textures
    const mesh = this.videoOutput.getObject3D('mesh')
    if(!mesh || !mesh.material.map) return
    mesh.material.map.needsUpdate = true
  }

})

// This component exists solely to ensure that the simulated WebXR Frame is switched in
// in place of the browser.
// This component's tick() must be executed before the tick() of any component that uses
// the WebXR Hand Tracking API.  This can be achieved by configuring this component first,
// on the same that the hand-tracking-controls (or similar) component is configured on.
AFRAME.registerComponent('desktop-xr-hands', {

  tick() {
    this.el.sceneEl.frame = this.system.frame
  }
})

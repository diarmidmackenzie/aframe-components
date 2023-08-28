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

// [position1, position2, weight, orientation start, orientation end]
// See Mediapipe landmarks here:
// https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
// And WebXR hand joints here:
// https://www.w3.org/TR/webxr-hand-input-1/#skeleton-joints-section

const xrJointMPMappings = [
  [0, 0, 1, 0, 9], // "wrist"

  [0, 1, 0.6, 0, 1], // "thumb-metacarpal"
  [2, 2, 1, 1, 2], // "thumb-phalanx-proximal"
  [3, 3, 1, 2, 3], // "thumb-phalanx-distal"
  [4, 4, 1, 3, 4], // "thumb-tip"

  [1, 5, 0.3, 1, 5], // "index-finger-metacarpal"
  [5, 5, 1, 5, 6], // "index-finger-phalanx-proximal"
  [6, 6, 1, 6, 7], // "index-finger-phalanx-intermediate"
  [7, 7, 1, 6, 7], // "index-finger-phalanx-distal"
  [8, 8, 1, 7, 8], // "index-finger-tip"

  [0, 9, 0.3, 0, 9], // "middle-finger-metacarpal"
  [9, 9, 1, 9, 10], // "middle-finger-phalanx-proximal"
  [10, 10, 1, 10, 11], // "middle-finger-phalanx-intermediate"
  [11, 11, 1, 10, 11], // "middle-finger-phalanx-distal"
  [12, 12, 1, 11, 12], // "middle-finger-tip"

  [0, 13, 0.3, 0, 13], // "ring-finger-metacarpal"
  [13, 13, 1, 13, 14], // "ring-finger-phalanx-proximal"
  [14, 14, 1, 14, 15], // "ring-finger-phalanx-intermediate"
  [15, 15, 1, 14, 15], // "ring-finger-phalanx-distal"
  [16, 16, 1, 15, 16], // "ring-finger-tip"

  [0, 17, 0.3, 0, 17], // "pinky-finger-metacarpal"
  [17, 17, 1, 17, 18], // "pinky-finger-phalanx-proximal"
  [18, 18, 1, 18, 19], // "pinky-finger-phalanx-intermediate"
  [19, 19, 1, 18, 19], // "pinky-finger-phalanx-distal"
  [20, 20, 1, 19, 20], // "pinky-finger-tip"
]

// used for temporary working.
const _vector = new THREE.Vector3()
const _worldPosition = new THREE.Vector3()
const _direction = new THREE.Vector3()
const _zAxis = new THREE.Vector3(0, 0, -1)
const _position = new THREE.Vector3()
const _orientation = new THREE.Quaternion()
const _scale = new THREE.Vector3(1, 1, 1)
const _matrix = new THREE.Matrix4()

AFRAME.registerSystem('desktop-xr-hands', {

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
          values: () => xrJoints.map((key) => this.getJoint(this.leftHand, key))
        },
        handedness: 'left'
      },
      { 
        hand: {
          get: (key) => this.getJoint(this.rightHand, key),
          values: () => xrJoints.map((key) => this.getJoint(this.rightHand, key))
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
  },

  getJoint(hand, key) {

    return { hand: hand, jointName: key }

  },

  createHands() {

    this.leftHand = {gotData: false}
    this.rightHand = {gotData: false}

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
  },

  removeHands() {

    this.xrSession.isPresenting = false
    this.el.removeAttribute('hand-landmarker')

    if (this.originalXr) {
      this.el.sceneEl.renderer.xr = this.originalXr
    }
  },

  handsDetected(e) {

    this.latestHandData = e.detail.handData

    this.latestHandData.handednesses.forEach((handedness, index) => {

      let hand
      // flip hand identification, as webcam feed is mirrored.
      if (handedness[0].categoryName === "Left") {
        hand = this.rightHand
        baseX = 0.5
      }
      else {
        // Left
        hand = this.leftHand
        baseX = -0.5
      }

      hand.gotData = true
      const worldLandmarks = this.latestHandData.worldLandmarks[index]
      this.extractPoseData(hand, worldLandmarks, baseX)
    })
  },

  extractPoseData(hand, worldLandmarks, baseX) {

    xrJoints.forEach((name, index) => {
      this.extractDataPoint(hand, name, index, worldLandmarks, baseX)
    })
  },

  extractDataPoint(hand, jointName, jointIndex, worldLandmarks) {

    // Needed to map from Mediapipe space to XR scene space.
    // I don't understand exactly why these are needed, but this seems to work...
    // x-flip makes sense due to front webcam mirroring the scene
    // no real understanding why the y-flip is needed.
    const flipVector = (v) => {
      v.x = -v.x
      v.y = -v.y
    }

    const [posIndex, pos2Index, weight, startIndex, endIndex] = xrJointMPMappings[jointIndex]
    // ## TO DO - weight between 2 x positions.

    // determine orientation
    const start = worldLandmarks[startIndex]
    const end = worldLandmarks[endIndex]
    _direction.subVectors(end, start).normalize()
    flipVector(_direction)
    _orientation.setFromUnitVectors(_zAxis, _direction)

    // determine position
    // ## TO DO - get position from camera feed - hardcoded for now.
    _worldPosition.set(baseX, 0, -0.5)
    _position.copy(worldLandmarks[posIndex])
    _vector.copy(worldLandmarks[pos2Index])
    _position.lerp(_vector, weight)
    flipVector(_position)
    _position.add(_worldPosition)

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
  }

})


AFRAME.registerComponent('desktop-xr-hands', {

  tick() {
    this.el.sceneEl.frame = this.system.frame
  }
})

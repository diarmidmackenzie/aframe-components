require('aframe-screen-display')

class XRJointPose {

  constructor() {
    this.transform = new XRRigidTransform
    this.radius = 0
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
      fillPoses: () => {},
      fillJointRadii: () => {},
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
      }
      //getReferenceSpace:  () => {},
      //setPoseTarget: () => {}
    }

    this.inputSources = [
      { 
        hand: {
          // !! work on simplifying this...
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

    this.leftHand = {}
    this.rightHand = {}

    xrJoints.forEach((jointName) => {
      const pose = new XRJointPose()
      this.leftHand[jointName] = pose
    })

    xrJoints.forEach((jointName) => {
      const pose = new XRJointPose()
      this.rightHand[jointName] = pose
    })
  },

  getJointPose(joint) {

    const {hand, jointName} = joint
    const pose = hand[jointName]
    return pose
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

    this.latestHandData = e.handData

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

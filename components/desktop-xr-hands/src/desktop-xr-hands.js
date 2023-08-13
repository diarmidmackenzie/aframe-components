require('aframe-screen-display')

AFRAME.registerSystem('desktop-xr-hands', {

  init() {
    
    this.handsDetected = this.handsDetected.bind(this)
    this.el.addEventListener('hands-detected', this.handsDetected)
    this.latestHandData = null

    this.simulateHands = this.simulateHands.bind(this)
    this.removeHands = this.removeHands.bind(this)
    this.el.sceneEl.addEventListener('enter-vr', this.simulateHands)
    this.el.sceneEl.addEventListener('exit-vr', this.removeHands)

    this.frame = {
      fillPoses: () => {},
      fillJointRadii: () => {}
    }

    this.xr = {
      requestReferenceSpace:  () => {},
      getFrame:  () => {
        return(this.frame)
      },
      getSession: () => {
        return this.xrSession
      }
      //getReferenceSpace:  () => {},
      //setPoseTarget: () => {}
    }

    this.xrSession = {
    }

    // use parent container, so that video scale can be manipulated to flip scale and adjust height.
    this.videoOutputContainer = document.createElement('a-entity')
    this.videoOutputContainer.setAttribute('screen-display', 'xpos: 12; ypos: 12; width: 20')
    document.querySelector('[camera]').appendChild(this.videoOutputContainer)

    this.videoOutput = document.createElement('a-plane')
    this.videoOutput.id = 'desktop-xr-hands-video-output'
    this.videoOutputContainer.appendChild(this.videoOutput)
  },

  simulateHands() {
    // If there is an XR session (real or simulated), do nothing.
    const renderer = this.el.sceneEl.renderer
    const xr = renderer.xr
    const xrSession = xr.getSesssion ? xr.getSession() : null
    if (xrSession) {
        console.log("desktop-xr-hands suppressed due to presence of an XR session")
        return;
    }

    this.originalXr = xr
    renderer.xr = this.xr
    this.xrSession.isPresenting = true

    this.el.setAttribute('hand-landmarker', 'videoOutput: #desktop-xr-hands-video-output')
  
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
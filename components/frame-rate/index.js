/* Component to update the target frame rate for an XR device, as per the WebXr Space.
   API Reference: https://www.w3.org/TR/webxr/#dom-xrsession-updatetargetframerate
*/

AFRAME.registerComponent('frame-rate', {
  schema: {
    type: 'number', default: 72
  },

  init() {
    this.update = this.update.bind(this)
    this.el.sceneEl.addEventListener('enter-vr', this.update)
  },

  update() {

    const scene = this.el.sceneEl
    if (!scene.is('vr-mode')) {
      // Don't try to set frame rate when not in VR mode.
      // The frame rate will be set on entry to VR.
      return
    }

    const renderer = scene.renderer
    if (!renderer.xr || !renderer.xr.getSession) {
      console.warn(`Unable to request unsupported frame rate of ${this.data}.  No XR Session found.`)
      return
    }

    const session = renderer.xr.getSession()
    if (!session) {
      console.warn(`Unable to request unsupported frame rate of ${this.data}.  No XR Session found.`)
      return
    }

    const rates = session.supportedFrameRates

    if (rates.includes(this.data)) {
      session.updateTargetFrameRate(this.data).catch((e) => {
        console.warn(`Unable to set target frame rate of ${this.data}. Error info: ${e}`)
      })
    }
    else {
      console.warn(`Unable to request unsupported frame rate of ${this.data}.  Supported frame rates: ${rates}`)
    }
  },

  getSupportedFrameRates() {

    const renderer = this.el.sceneEl.renderer
    if (!renderer.xr || !renderer.xr.getSession) {
      console.warn(`Unable to get list of supported Frame Rates.  No XR Session found.`)
      return
    }

    const session = renderer.xr.getSession()
    if (!session) {
      console.warn(`Unable to get list of supported Frame Rates.  No XR Session found.`)
      return
    }

    return session.supportedFrameRates
  },

  getFrameRate() {

    const renderer = this.el.sceneEl.renderer
    if (!renderer.xr || !renderer.xr.getSession) return null

    const session = renderer.xr.getSession()
    if (!session) return null

    return session.frameRate
  }

})

AFRAME.registerComponent('adaptive-frame-rate', {
  schema: {
    initialRate: { type: 'number', default: 72},
    uprateInterval: { type: 'number', default: 10},
    uprateThreshold: { type: 'number', default: 5},
    downrateInterval: { type: 'number', default: 5},
    downrateThreshold: { type: 'number', default: 10},
    framerateCap: { type: 'number', default: 100},
  },

  init() {
    this.el.setAttribute('frame-rate', this.data.initialRate)
    this.frameRateComponent = this.el.components['frame-rate']
    this.frameRate = this.data.initialRate

    this.startTimers = this.startTimers.bind(this)
    this.stopTimers = this.stopTimers.bind(this)
    this.el.sceneEl.addEventListener('enter-vr', this.startTimers)
    this.el.sceneEl.addEventListener('exit-vr', this.stopTimers)

    this.uprateCheck = this.uprateCheck.bind(this)
    this.downrateReset = this.downrateReset.bind(this)

    this.uprateMissedFrames = 0
    this.downrateMissedFrames = 0

    this.availableRates = new Array()
    this.checksActive = false
  },

  startTimers() {
    this.stopTimers()

    this.frameRate = this.frameRateComponent.getFrameRate()

    // Target used to measure whether ticks are slow.
    // The way WebXR scheduling works, if we miss a frame, we'll miss by a lot (typically 2x),
    // so we can be pretty generous with what we consider "on time".
    this.targetTick = (1000 / this.frameRate) * 1.5

    this.uprateTimer = setInterval(this.uprateCheck, this.data.uprateInterval * 1000)
    this.uprateMissedFrames = 0

    this.downrateTimer = setInterval(this.downrateReset, this.data.downrateInterval * 1000)
    this.downrateMissedFrames = 0

    this.checksActive = true
  },

  stopTimers() {
    if (this.uprateTimer) {
      clearInterval(this.uprateTimer)
    }

    if (this.downrateTimer) {
      clearInterval(this.downrateTimer)
    }

    this.checksActive = false
  },

  uprateCheck() {

    if (this.uprateMissedFrames <= this.data.uprateThreshold) {
      // enough frames hit in this time period to uprate
      this.uprateFrameRate()
    }

    // reset counter for next cycle
    this.uprateMissedFrames = 0
  },

  downrateReset() {
    this.downrateMissedFrames = 0
  },

  updateAvailableRates() {
    const rates = this.frameRateComponent.getSupportedFrameRates()
    
    // copy and sort array, without modifying the original array, or
    // creating a new array.
    this.availableRates.length = 0
    for (let i = 0, l = rates.length; i < l; i++) {
      if (rates[i] <= this.data.framerateCap) {
        this.availableRates.push(rates[i])
      }
    }

    this.availableRates.sort((a, b) => a - b)
  },

  uprateFrameRate() {
    this.changeFrameRate(1)
  },
  
  downrateFrameRate() {
    this.changeFrameRate(-1)
  },

  changeFrameRate(step) {
    this.updateAvailableRates()

    const rate = this.frameRateComponent.getFrameRate()
    const index = this.availableRates.indexOf(rate)
    const newRate = this.availableRates[index + step]

    if (newRate) {
      this.el.setAttribute('frame-rate', newRate)
      this.frameRate = newRate
    }
    else {
      console.warn(`Unable to adjust frame rate ${step > 0 ? "above" : "below"} ${rate}`)
    }

    // Restart timers
    this.startTimers()
  },

  tick(t, dt) {

    if (!this.checksActive) return;

    if (dt > this.targetTick) {
      this.uprateMissedFrames++
      this.downrateMissedFrames++
    }

    if (this.downrateMissedFrames >= this.data.downrateThreshold) {
      // enough frames missed in this time period to downrate.
      this.downrateFrameRate()
    }
  }
})

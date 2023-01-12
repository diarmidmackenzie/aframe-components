
AFRAME.registerComponent('frame-rate', {
  schema: {
    type: 'number', default: '72'
  },

  init() {
    this.el.sceneEl.addEventListener('enterVR', this.update)
  },

  update() {

    const renderer = this.el.sceneEl.renderer;
    if (!renderer.xr || !renderer.xr.getSession) {
      console.warn(`Unabled to request unsupported frame rate of ${this.data}.  No XR Session found.`)
      return;
    };

    const session = renderer.xr.getSession()
    if (!session) {
      console.warn(`Unabled to request unsupported frame rate of ${this.data}.  No XR Session found.`)
      return;
    };

    const rates = session.supportedFrameRates

    if (rates.includes(this.data)) {
      session.updateTargetFrameRate(this.data).catch((e) => {
        console.warn(`Unabled to set target frame rate of ${this.data}. Error info: ${e}`)
      })
    }
    else {
      console.warn(`Unabled to request unsupported frame rate of ${this.data}.  Supported frame rates: ${rates}`)
    }
  },

  getFrameRate() {

    const renderer = this.el.sceneEl.renderer;
    if (!renderer.xr || !renderer.xr.getSession) return null;

    const session = renderer.xr.getSession()
    if (!session) return null;

    return session.frameRate
  }

});

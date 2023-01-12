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
      return;
    }

    const renderer = scene.renderer;
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

  getSupportedFrameRates() {

    const renderer = this.el.sceneEl.renderer;
    if (!renderer.xr || !renderer.xr.getSession) {
      console.warn(`Unabled to get list of supported Frame Rates.  No XR Session found.`)
      return;
    };

    const session = renderer.xr.getSession()
    if (!session) {
      console.warn(`Unable to get list of supported Frame Rates.  No XR Session found.`)
      return;
    };

    return session.supportedFrameRates;
  },

  getFrameRate() {

    const renderer = this.el.sceneEl.renderer;
    if (!renderer.xr || !renderer.xr.getSession) return null;

    const session = renderer.xr.getSession()
    if (!session) return null;

    return session.frameRate
  }

});

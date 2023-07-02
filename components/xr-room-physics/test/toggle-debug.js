AFRAME.registerComponent('toggle-debug', {

  init() {
    this.debug = false;
    this.toggleDebug = this.toggleDebug.bind(this)
    this.el.addEventListener('abuttondown', this.toggleDebug)
    this.el.addEventListener('xbuttondown', this.toggleDebug)
  },

  toggleDebug() {

    this.debug = !this.debug
    this.el.sceneEl.setAttribute('xr-room-physics', { debug: this.debug })
  }

});
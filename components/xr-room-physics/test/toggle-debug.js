AFRAME.registerComponent('toggle-debug', {

  init() {
    this.debug = false;
    this.toggleDebug = this.toggleDebug.bind(this)
    this.keyUp = this.keyUp.bind(this)
    this.el.addEventListener('abuttondown', this.toggleDebug)
    this.el.addEventListener('xbuttondown', this.toggleDebug)
    window.addEventListener('keyup', this.keyUp)
  },

  toggleDebug() {

    this.debug = !this.debug
    this.el.sceneEl.setAttribute('xr-room-physics', { debug: this.debug })
  },

  keyUp(e) {
    if (e.code === 'KeyQ') {
      this.toggleDebug()
    }
  }
});
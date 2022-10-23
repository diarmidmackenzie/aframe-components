AFRAME.registerComponent('screen-position', {

  init() {
    this.vec3 = new THREE.Vector3()
    this.getScreenPosition = this.getScreenPosition.bind(this)
  },

  getScreenPosition(pos) {

    this.el.object3D.getWorldPosition(this.vec3)

    const camera = this.el.sceneEl.camera
    this.vec3.project(camera)

    const bounds = document.body.getBoundingClientRect();

    pos.x = bounds.width * (this.vec3.x + 1) / 2 
    pos.y = bounds.height - bounds.height * (this.vec3.y + 1) / 2
    return pos
  }
});

AFRAME.registerComponent('output-screen-position', {

  schema: {
      text: { type: 'selector'},
      tracker: { type: 'selector'}
  },

  init() {
    this.pos = new THREE.Vector2()
    this.getScreenPosition = this.el.components['screen-position'].getScreenPosition
  },

  tick() {

    this.getScreenPosition(this.pos)

    if (this.data.text) {
      this.data.text.innerHTML = `x: ${this.pos.x.toFixed(0)}, y: ${this.pos.y.toFixed(0)}`
    }

    if (this.data.tracker) {

      const tracker = this.data.tracker

      const rect = tracker.getBoundingClientRect()
      tracker.style.top = `${this.pos.y - ( rect.height / 2 )}px`
      tracker.style.left = `${this.pos.x - ( rect.width / 2 )}px`
    }
  }
});

AFRAME.registerComponent('toggle-anchored', {

  schema: {
    anchoredEl: { type: 'selector', default: '[anchored]' }
  },

  init() {
    this.toggleAnchored = this.toggleAnchored.bind(this)
    this.el.addEventListener('abuttondown', this.toggleAnchored)
    this.anchored = true

  },

  toggleAnchored() {

    const el = this.data.anchoredEl
    const anchoredComponent = el.components['anchored']
    this.anchored = !this.anchored

    if (this.anchored) {
      anchoredComponent.reAnchor()
    }
    else {
      anchoredComponent.unAnchor(false)
    }

    const plane = el.querySelector('a-plane')
    const color = this.anchored ? "#7BC8A4" : "white"
    plane.setAttribute('color', color)
  }
})

AFRAME.registerComponent('plug', {

  init() {
    this.el.setAttribute('socket', {type: 'plug'})
  }
})
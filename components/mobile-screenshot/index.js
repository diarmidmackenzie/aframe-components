AFRAME.registerComponent('mobile-screenshot', {
  schema: {
    width: { default: 720},
    height: { default: 1280}
  },

  init() {
 
    const data = this.data
    this.el.setAttribute('screenshot', {width: data.width, height: data.height})

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    

  },

  update() {

    // Resize canvas & pass parameters on to screenshot component.
    data = this.data
    this.canvas.width = data.width
    this.canvas.height = data.height

    this.el.setAttribute('screenshot', {width: data.width, height: data.height})

  },

  getCanvas() {

    const {width, height} = this.canvas
    this.cxt.drawImage(this.video, 0, 0, width, height);

    const screenshotComponent = this.el.components['screenshot']
    const sceneCanvas = screenshotComponent.getCanvas('perspective')

    this.cxt.drawImage(sceneCanvas, 0, 0, width, height);

    return this.canvas

  },

  capture() {

    const screenshotComponent = this.el.components['screenshot']

    this.getCanvas()

    // switch in our canvas, and use the core A-Frame saveCapture() function
    savedCanvas = screenshotComponent.canvas
    screenshotComponent.canvas = this.canvas
    screenshotComponent.saveCapture()
    screenshotComponent.canvas = savedCanvas

  }

})

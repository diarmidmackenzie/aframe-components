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
    const video = this.video = document.createElement('video')
    document.body.appendChild(video)
    // these dettings display the video in the background, similar to what happens on entry to AR with WebXR.
    // not quite full-screen though due to aspect ratio.
    video.style.top = 0
    video.style.left = 0
    video.style.width = "100%"
    video.style.height = "100%"
    video.style.position = "absolute"
    video.style.zIndex = -1

    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn("getUserMedia is unsupported by this browser")
    }

    // Doesn't work - unfortunately, grabbing the camera prevents WebXR from accessing the camera at all.
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" },
                                          audio: false })
      .then((stream) => {
        video.srcObject = stream
        video.play()
      })
      .catch((err) => {
        console.error(`An error occurred: ${err}`)
      });

    video.addEventListener("canplay", () => {
      const width = data.width
      const height = (video.videoHeight / video.videoWidth) * width;
      video.setAttribute("width", width)
      video.setAttribute("height", height)
    }, { once: true})

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

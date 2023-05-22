AFRAME.registerComponent('window-camera', {

  dependencies: ['head-tracker'],

  schema: {
    // screen height in meters
    screenHeight: {default: 0.2},

    // webCam position relative to the screen
    // ghead tracking position is reported relative to the webcam.
    webCamPosition: {default: {x: 0, y: 0.1, z: 0}},

    // scene camera offset, relative to the scene.
    // with an FOV of 50, screen height of 0.2m, 
    // this will be (0.2 / tan(25)) = 0.43m
    cameraOffset: { default: 0.43 },

    debug: {default: true}
  },

  init() {
    this.pov = new THREE.Vector3()
    this.povRelativeToWebCam = this.el.components['head-tracker'].headPosition
  },

  update() {
    if (this.data.debug && !this.debugOutput) {
      this.debugOutput = document.createElement('div')
      const style = this.debugOutput.style
      style.position = 'absolute'
      style.top = '10px'
      style.zIndex = 1000
      style.background = 'black'
      style.width = '200px'
      style.color = 'white'
      style.fontSize = '20px'
      style.fontFamily = 'arial'
      document.body.appendChild(this.debugOutput)
    }
  },
  
  tick() {

    const {screenHeight} = this.data
    const camera = this.el.sceneEl.camera
    const pov = this.pov
    pov.addVectors(this.data.webCamPosition, this.povRelativeToWebCam)

    // virtual screen is what we'll use as a "Full Screen" with setViewOffset
    const virtualScreenHeight = screenHeight * 3 //(+ 2 * (Math.max(Math.abs(pov.y), Math.abs(pov.x))))
    const virtualScreenFactor = virtualScreenHeight / screenHeight
    const fov = THREE.MathUtils.radToDeg(Math.atan(virtualScreenHeight / pov.z)) * 2
    //const fov = THREE.MathUtils.radToDeg(Math.atan(screenHeight / pov.z)) * 2
    
    // fov is determined by distance from screen + virtual Screen height.
    // This is the fov for the virtual Screen, which may be larger than the fov for the part of the screen we'll actually render.
    const height = window.screen.height
    const width = window.screen.width
    const fullWidth = virtualScreenFactor * width
    const fullHeight = virtualScreenFactor * height
    const pixelsPerM = height / screenHeight
    const xOffset = (fullWidth - width) / 2 - pixelsPerM * pov.x
    const yOffset = (fullHeight - height) / 2 + pixelsPerM * pov.y
    camera.fov = fov

    if (this.data.debug) {
      debugText = `
        <p>pov: ${pov.x.toFixed(2)} ${pov.y.toFixed(2)} ${pov.z.toFixed(2)}</p>
        <p>height: ${height.toFixed(0)}</p>
        <p>width: ${width.toFixed(0)}</p>
        <p>virtualScreenFactor: ${virtualScreenFactor.toFixed(2)}</p>
        <p>pixelsPerM: ${pixelsPerM.toFixed(0)}</p>
        <p>xOffset: ${xOffset.toFixed(0)}</p>
        <p>yOffset: ${yOffset.toFixed(0)}</p>
      `
      console.log(debugText)


      this.debugOutput.innerHTML = debugText
    }

    camera.setViewOffset(fullWidth, 
                         fullHeight,
                         xOffset,
                         yOffset,
                         width,
                         height)
    camera.position.set(pov.x, pov.y, pov.z - this.data.cameraOffset)
    camera.updateProjectionMatrix()
  }
})
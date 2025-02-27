const INCHES_PER_M = 39.37
const DEFAULT_HEAD_POSITION = new THREE.Vector3(0, 0.1, 0.75)

AFRAME.registerComponent('window-3d', {

  dependencies: ['secondary-camera'],

  schema: {
    // screen height in meters
    screenHeight: {default: 0.2},

    // webCam position relative to the screen center
    // head tracking position is reported relative to the webcam.
    webCamPosition: {default: {x: 0, y: 0, z: 0}},

    // the offset of the screen, relative to the camera.
    // With an FOV of 50, screen height of 0.2m, 
    // this will be (0.2 / tan(25)) = 0.43m
    screenOffset: { default: 0.43 },

    debug: {default: false},
    
    xSensitivity : {default: 0.5},
    ySensitivity : {default: 0.5},
    zSensitivity : {default: 1},
  },

  init() {
    this.pov = new THREE.Vector3()
    this.povRotation = new THREE.Euler()
    this.referenceForScale = document.createElement('div')
    this.referenceForScale.id="ReferenceForScale"
    this.referenceForScale.setAttribute("style",
                                        `width: 1in;
                                         visibility: hidden`)
    document.body.appendChild(this.referenceForScale)
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

    this.outputElement = this.el.components['secondary-camera'].data.outputElement
  },
  
  tick() {

    const dpm = this.referenceForScale.clientWidth * INCHES_PER_M
    const windowHeight = this.outputElement.clientHeight / dpm
    const windowCenter = new THREE.Vector2()
    
    const rect = this.outputElement.getBoundingClientRect()
    
    
    windowCenter.y = (rect.top + rect.bottom) / 2

    const pageHeight = window.innerHeight
    const pageWidth = window.innerWidth

    windowCenter.x = (((rect.left + rect.right) / 2) - (pageWidth / 2)) / dpm
    windowCenter.y = ((pageHeight / 2) - ((rect.top + rect.bottom) / 2)) / dpm
    //console.log(windowCenter)

    
    const camera = this.el.components['secondary-camera'].camera
    const pov = this.pov

    const povRelativeToWebCam = this.el.components['head-tracker']?.headPosition ||
                               DEFAULT_HEAD_POSITION
    pov.addVectors(this.data.webCamPosition, povRelativeToWebCam)
    
    pov.x += -windowCenter.x
    pov.y += -windowCenter.y
    // hack to amplify z-axis movements...  Nice effect, though not 100% "true".
    const relativeZ = (pov.z - 0.75)
    pov.z = 0.75 + (relativeZ * this.data.zSensitivity)
  
    // virtual screen is what we'll use as a "Full Screen" with setViewOffset
    // For now things seem to work better without using a larger virtualScreen.  This might not actually be necessary
    // More analysis needed to determine whether this is actually necessary
    const virtualScreenHeight = windowHeight //(+ 2 * (Math.max(Math.abs(pov.y), Math.abs(pov.x))))
    const virtualScreenFactor = virtualScreenHeight / windowHeight
    
    // fov is determined by distance from screen + virtual Screen height.
    // This is the fov for the virtual Screen, which may be larger than the fov for the part of the screen we'll actually render.
    const fov = 50;

    const height = rect.bottom - rect.top
    const width = rect.right - rect.left
    const fullWidth = virtualScreenFactor * width
    const fullHeight = virtualScreenFactor * height
    const pixelsPerM = dpm
    
    // These numbers tuned by hand - feel about right, but what's the mathematical justification?
    const X_ADJUST = 1 / this.data.xSensitivity
    const Y_ADJUST = 1 / this.data.ySensitivity

    const xOffset = (fullWidth - width) / 2 - (pixelsPerM * pov.x) / X_ADJUST
    const yOffset = (fullHeight - height) / 2 + (pixelsPerM * pov.y) / Y_ADJUST
    camera.fov = fov

    if (this.data.debug) {
      debugText = `
        <p>pov: ${pov.x.toFixed(2)} ${pov.y.toFixed(2)} ${pov.z.toFixed(2)}</p>
        <p>fov: ${fov.toFixed(2)}</p>
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

    // These numbers tuned by hand - feel about right, but what's the mathematical justification?
    // with height 200px...
    // X_ADJUST = 1 => 21
    // X_ADJUST = 2 => 10.5
    // 
    // This formula works as height varies, and as X/Y_ADJUST vary.
    const X_POV_FACTOR = 4200 / (height * X_ADJUST)
    const Y_POV_FACTOR = 4200 / (height * Y_ADJUST)

    this.el.object3D.position.set(pov.x * X_POV_FACTOR, pov.y * Y_POV_FACTOR, pov.z)
    //this.el.object3D.rotation.set(rotation.x, rotation.y, 0)
    camera.updateProjectionMatrix()
  }
})
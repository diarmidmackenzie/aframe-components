const INCHES_PER_M = 39.37
const DEFAULT_HEAD_POSITION = new THREE.Vector3(0, 0, 0.75)

AFRAME.registerComponent('window-3d', {

  dependencies: ['secondary-camera'],

  schema: {
    // webCam position relative to the screen center
    // head tracking position is reported relative to the webcam.
    webCamPosition: {type: 'vec3', default: {x: 0, y: 0.1, z: 0}},

    debug: {default: false},
    
    // How much the x/y pov on the world changes as a result of movements on screen.
    // This will also be affected by the distance of the scene from the camera
    // and the scale of the scene, but it can be more convenient to adjust directly here.
    // 
    // 1 should give "realistic" behaviour.
    xSensitivity : {default: 1},
    ySensitivity : {default: 1},

    // This one only applies when head tracking is active.
    // This is a different scale from x & y sensitivity.
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

    // "window" in this context refers to the window into the A-Frame scene, not the HTML document window.
    // Maybe could find a better term to use here...
    
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
    // However what seems to work well is a virtual screen that matches the display window.
    const virtualScreenHeight = windowHeight
    const virtualScreenFactor = virtualScreenHeight / windowHeight // (which is 1)
    
    // fov is determined by distance from screen + virtual Screen height.
    // This is the fov for the virtual Screen, which may be larger than the fov for the part of the screen we'll actually render.
    const fov = 50;

    const height = rect.bottom - rect.top
    const width = rect.right - rect.left
    const fullWidth = virtualScreenFactor * width
    const fullHeight = virtualScreenFactor * height
    
    // These numbers tuned by hand - feel about right, but what's the mathematical justification?
    const { xSensitivity, ySensitivity} = this.data
    const X_ADJUST = 1 / this.data.xSensitivity
    const Y_ADJUST = 1 / this.data.ySensitivity

    const xOffset = ((fullWidth - width) - (dpm * pov.x * xSensitivity)) / 2
    const yOffset = ((fullHeight - height) + (dpm * pov.y * ySensitivity)) / 2
    camera.fov = fov

    if (this.data.debug) {
      debugText = `
        <p>pov: ${pov.x.toFixed(2)} ${pov.y.toFixed(2)} ${pov.z.toFixed(2)}</p>
        <p>fov: ${fov.toFixed(2)}</p>
        <p>height: ${height.toFixed(0)}</p>
        <p>width: ${width.toFixed(0)}</p>
        <p>virtualScreenFactor: ${virtualScreenFactor.toFixed(2)}</p>
        <p>pixelsPerM (dpm): ${dpm.toFixed(0)}</p>
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

    // These numbers tuned by hand - seem to be about right, but what's the mathematical justification?
    // Not entirely sure where 2100 comes from...
    // Probably fov should be factored into this - testing with different fovs might reveal insights.
    // Does screen size make a difference?  That may be accounted for already by dpm.  Or maybe not...?
    // Both these are scaled by height (not width) because fov is defined relative to window height.
    const X_POV_FACTOR = (2100 * xSensitivity) / height
    const Y_POV_FACTOR = (2100 * ySensitivity) / height

    this.el.object3D.position.set(pov.x * X_POV_FACTOR, pov.y * Y_POV_FACTOR, pov.z)
    camera.updateProjectionMatrix()
  }
})
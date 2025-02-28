
const DIORAMA_LIST = ["hello-aframe", "by-the-ocean", "starry-night", "milk-delivery"]

AFRAME.registerComponent('configure-example', {

  schema: {
    diorama: {oneOf: DIORAMA_LIST,
              default: "by-the-ocean"},
    width: {default: 600 },
    height: {default: 400 },
    xSensitivity: {default: 1 },
    ySensitivity: {default: 1 },
    headTracking: {default: false},
    zSensitivity: {default: 3 },
    stabilizationFactor: {default: 0.9},
    moveSideToSide: {default: true},
  },

  init() {
    this.dioramas = {}
    DIORAMA_LIST.forEach((id) => {
      this.dioramas[id] = document.getElementById(`${id}-container`)
    })

    this.viewport = document.getElementById('viewport1')

    this.cameraEntity = document.getElementById('camera1')
  },

  update() {

    const { data } = this
    DIORAMA_LIST.forEach((id) => {
      this.dioramas[id].setAttribute("visible", "false")
    })

    this.dioramas[data.diorama].setAttribute("visible", "true")

    this.viewport.style.width = `${data.width}px`
    this.viewport.style.height = `${data.height}px`

    const {xSensitivity, ySensitivity, zSensitivity } = data

    this.cameraEntity.setAttribute("window-3d", { xSensitivity,
                                                  ySensitivity,
                                                  zSensitivity})


    if (this.data.headTracking) {
      const { stabilizationFactor } = data
      this.cameraEntity.setAttribute("face-detector", "")
      this.cameraEntity.setAttribute("head-tracker", { stabilizationFactor })
      this.cameraEntity.setAttribute("head-tracker", "defaultPosition: 0 0 0.75")
    }
    else {
      this.cameraEntity.removeAttribute("face-detector")
      this.cameraEntity.removeAttribute("head-tracker")
    }
  }
})
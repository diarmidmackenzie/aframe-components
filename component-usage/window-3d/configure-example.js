
const DIORAMA_LIST = ["hello-aframe", "by-the-ocean", "starry-night", "milk-delivery"]

AFRAME.registerComponent('configure-example', {

  schema: {
    width: {default: 600, type: 'number'},
    height: {default: 400, type: 'number'},
    xSensitivity: {default: 1, type: 'number'},
    ySensitivity: {default: 1, type: 'number'},
    zSensitivity: {default: 1, type: 'number'},
    headTracking: {default: true, type: 'boolean'},
    diorama: {oneOf: DIORAMA_LIST,
              type: 'string',
              default: "by-the-ocean"}
  },

  init() {

    this.dioramas = {}
    DIORAMA_LIST.forEach((id) => {
      this.dioramas[id] = document.getElementById(`${id}-container`)
    })
  },

  update() {

    const { data } = this
    DIORAMA_LIST.forEach((id) => {
      this.dioramas[id].setAttribute("visible", "false")
    })

    this.dioramas[data.diorama].setAttribute("visible", "true")
  }
})
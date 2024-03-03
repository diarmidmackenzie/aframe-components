const dat = require('dat.gui');

AFRAME.registerComponent('dat-gui', {

  init() {

    this.gui = new dat.GUI();
    this.gui.domElement.classList.add('gui')

    const components = Object.values(this.el.components)
    components.forEach(component => this.addFolder(component))
  },

  addFolder(component) {

    // don't include this component itself.
    if (component.attrName === 'dat-gui') return

    const componentName = component.attrName
    const folder = this.gui.addFolder(componentName)

    const data = component.data
    const properties = Object.keys(data)

    properties.forEach((prop) => {
      const el = this.el
      const propController = folder.add(data, prop)

      propController.onChange(() => {
        this.el.setAttribute(componentName, data)
      })
    })
  }
});

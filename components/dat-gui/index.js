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
    const componentData = AFRAME.components[componentName]
    const schema = componentData.schema

    if (componentData.isSingleProperty) {
      this.addProperty(folder, componentName, schema, data, componentName)
    }
    else {
      const schemaEntries = Object.entries(schema)

      schemaEntries.forEach(([prop, schemaData]) => {
        this.addProperty(folder, componentName, schemaData, data, prop)
      })
    }
  },

  addProperty(folder, componentName, schemaData, data, prop) {

    const type = schemaData.type

    let propController

    if (schemaData.oneOf) {
      propController = folder.add(data, prop, schemaData.oneOf)
      propController.onChange(() => {
        this.el.setAttribute(componentName, data)
      })
      return
    }

    switch (type) {
      case 'int':
        propController = folder.add(data, prop, NaN, NaN, 1)
        break;

      case 'number':
        propController = folder.add(data, prop, NaN, NaN, 0.1)
        break;

      case 'string':
        propController = folder.add(data, prop)
        break;

      default:
        console.warn(`Type: ${type} is not yet supported`)
        propController = folder.add(data, prop)
    }

    propController.onChange(() => {
      this.el.setAttribute(componentName, data)
    })
  }
});

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

    const addProp = (prop, ...args) => {
      const propController = folder.add(data, prop, ...args)
      propController.onChange(() => {
        this.el.setAttribute(componentName, data)
      })
    }

    if (schemaData.oneOf) {
      addProp(prop, schemaData.oneOf)
      return
    }

    switch (type) {
      case 'int':
        addProp(prop, NaN, NaN, 1)
        break;

      case 'number':
        addProp(prop, NaN, NaN, 0.1)
        break;

      case 'string':
      case 'boolean':
        addProp(prop)
        break;

      case 'vec2':
      case 'vec3':
      case 'vec4':

        let dataRef, subFolder
        if (data[prop]) {
          // not part of a single prop schema
          subFolder = folder.addFolder(prop)
          dataRef = data[prop]
        }
        else {
          // part of a single prop schema
          subFolder = folder
          dataRef = data
        }
        
        addProp('x', NaN, NaN, 0.1)
        addProp('y', NaN, NaN, 0.1)
        if (type !== 'vec2') {
          addProp('z', NaN, NaN, 0.1)
        }
        if (type === 'vec4') {
          addProp('w', NaN, NaN, 0.1)
        }
        break;

      default:
        console.warn(`Type: ${type} is not yet supported`)
        addProp(prop)
    }
  }
});

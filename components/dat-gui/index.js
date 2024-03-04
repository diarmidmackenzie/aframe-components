const dat = require('dat.gui');

AFRAME.registerSystem('dat-gui', {

  init() {
    this.gui = new dat.GUI();
    this.gui.domElement.classList.add('gui')

    this.folderNames = []
  },

  addEntityFolder(el) {

    let name = this.chooseUniqueName(el)
    this.folderNames.push(name)
    const folder = this.gui.addFolder(name)

    return folder
  },

  chooseUniqueName(el, n = 1) {

    let name = el.tagName.toLowerCase()
    if (el.id) {
      if (el.id.length > 12) {
        name += ` ${el.id.substr(0, 10)}...`
      }
      else {
        name += ` ${el.id}`
      }
    }
    if (n > 1) {
      name += ` (${n})`
    }

    if (this.folderNames.includes(name)) 
    {
      return this.chooseUniqueName(el, n + 1)
    }
    else {
      return name
    }
  }
})

AFRAME.registerComponent('dat-gui', {

  init() {

    this.entityFolder = this.system.addEntityFolder(this.el)

    const components = Object.values(this.el.components)

    components.forEach(component => this.addFolder(component))
  },

  addFolder(component) {

    // don't include this component itself.
    if (component.attrName === 'dat-gui') return

    const componentName = component.attrName
    const folder = this.entityFolder.addFolder(componentName)

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

    if (component.attrName === 'geometry') {
      this.addGeometryProperties(component, folder)
    }
  },

  addGeometryProperties(component, folder) {

    const data = component.data
    const geometry = AFRAME.geometries[data.primitive]
    if (!geometry) return

    const schema = geometry.schema
    const schemaEntries = Object.entries(schema)

    schemaEntries.forEach(([prop, schemaData]) => {
      this.addProperty(folder, component.attrName, schemaData, data, prop)
    })
  },

  addProperty(folder, componentName, schemaData, componentData, prop) {

    const type = schemaData.type

    const addProp = (parentData, prop, ...args) => {
      const propController = folder.add(parentData, prop, ...args)
      propController.onChange(() => {
        this.el.setAttribute(componentName, componentData)
      })
    }

    if (schemaData.oneOf) {
      addProp(componentData, prop, schemaData.oneOf)
      return
    }

    switch (type) {
      case 'int':
        addProp(componentData, prop, NaN, NaN, 1)
        break;

      case 'number':
        addProp(componentData, prop, NaN, NaN, 0.1)
        break;

      case 'string':
      case 'boolean':
        addProp(componentData, prop)
        break;

      case 'vec2':
      case 'vec3':
      case 'vec4':
        let parentData, subFolder
        if (componentData[prop]) {
          // not part of a single prop schema
          subFolder = folder.addFolder(prop)
          parentData = componentData[prop]
        }
        else {
          // part of a single prop schema
          subFolder = folder
          parentData = componentData
        }
        
        addProp(parentData, 'x', NaN, NaN, 0.1)
        addProp(parentData, 'y', NaN, NaN, 0.1)
        if (type !== 'vec2') {
          addProp(parentData, 'z', NaN, NaN, 0.1)
        }
        if (type === 'vec4') {
          addProp(parentData, 'w', NaN, NaN, 0.1)
        }
        break;

      default:
        console.warn(`Type: ${type} is not yet supported`)
        addProp(componentData, prop)
    }
  }
});

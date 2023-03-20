if (!AFRAME.components['object-parent']) require('aframe-object-parent')
if (!AFRAME.components['raycast-target']) require('aframe-raycast-target')
if (!AFRAME.components['graph-node']) require('aframe-graph')

const _box = new THREE.Box3()
const _tempParent = new THREE.Object3D()

AFRAME.registerSystem('fusable-body', {

  init() {

    this.nodeMap = {}
    
    this.componentsJoined = this.componentsJoined.bind(this)
    this.componentsSplit = this.componentsSplit.bind(this)

    this.el.addEventListener('graph-components-joined', this.componentsJoined)
    this.el.addEventListener('graph-components-split', this.componentsSplit)

    this.containers = {}

  },

  getNodePhysicsType(el) {
    return el.components['fusable-body'].data.type
  },

  addNode(el) {

    this.nodeMap[el.object3D.uuid] = el

    // create a container by default for each node
    const physicsType = this.getNodePhysicsType(el)
    const container = this.createContainer(el, physicsType)
    
    // reparent the object to that container node,
    // and redirect raycasting.
    const containerselector = `#${container.id}`
    el.setAttribute('object-parent', {parent: containerselector})
    el.setAttribute('raycast-target', containerselector)
  },

  createContainer(el, physicsType) {

    const container = document.createElement('a-entity')
    container.id = THREE.MathUtils.generateUUID()

    // extract the transform of the reference element to use for this container
    el.object3D.add(container.object3D)
    this.el.object3D.attach(container.object3D)
    
    container.setAttribute('physx-body', {type: physicsType})
    this.el.appendChild(container)

    return container
  },

  destroyContainer(container) {

    container.parentEl.removeChild(container)
  },

  removeNode(el) {

    // remove reparenting of the object
    el.removeAttribute('object-parent')
    el.parentContainer = null

    // delete nodeMap record
    delete nodeMap[el.object3D.uuid]
  },

  componentsJoined(evt) {

    component1 = evt.detail.thisComponent
    component2 = evt.detail.otherComponent

    let fromComponent, toComponent

    if (component1.length >= component2.length) {
      fromComponent = component2
      toComponent = component1
    }
    else {
      fromComponent = component1
      toComponent = component2
    }

    // source & target containers can be determined from 1st nodes of component'
    const sourceContainer = this.nodeMap[fromComponent[0]].object3D.parent.el
    const targetContainer = this.nodeMap[toComponent[0]].object3D.parent.el

    fromComponent.forEach((uuid) => {
      const node = this.nodeMap[uuid]
      const targetContainerSelector = `#${targetContainer.id}`
      node.setAttribute('object-parent', {parent: targetContainerSelector})
      
      // !! raycast-target doesn't support updates - TO FIX !!
      node.removeAttribute('raycast-target')
      node.setAttribute('raycast-target', targetContainerSelector)
    })

    // sourceContainer is empty & no longer needed.
    this.destroyContainer(sourceContainer)

    // recenter target container to reflect new content
    this.recenterContainer(targetContainer)
  },

  componentsSplit(evt) {

    component1 = evt.detail.thisComponent
    component2 = evt.detail.otherComponent

    let componentToMove, componentToLeave

    if (component1.length >= component2.length) {
      componentToMove = component2
      componentToLeave = component1
    }
    else {
      componentToMove = component1
      componentToLeave = component2
    }

    // where to position containers?
    const newContainer = this.createContainer(evt.target, "kinematic") 
    const targetContainerSelector = `#${newContainer.id}`
    
    componentToMove.forEach((uuid) => {
      const node = this.nodeMap[uuid]
      node.setAttribute('object-parent', {parent: targetContainerSelector})

      // !! raycast-target doesn't support updates - TO FIX !!
      node.removeAttribute('raycast-target')
      node.setAttribute('raycast-target', targetContainerSelector)
    })

    const unmovedContainer = this.nodeMap[componentToLeave[0]].object3D.parent.el
    this.recenterContainer(newContainer)
    this.recenterContainer(unmovedContainer)
  },

  // recenters the container based on the bounding box of its current contents.
  // should be called whenever component conta
  recenterContainer(containerEl) {

    const container = containerEl.object3D
    _box.setFromObject(containerEl.object3D)
    const scene = this.el.sceneEl.object3D
    scene.add(_tempParent)

    // store off all children.  Work backwards as children are removed as we go.
    const children = container.children
    for (let ii = children.length - 1; ii >= 0; ii--) {
      _tempParent.attach(children[ii])
    }

    // reposition container
    _box.getCenter(container.position)
    container.parent.worldToLocal(container.position)

    // restore children.  Work backwards as children are removed as we go.
    const tempChildren = _tempParent.children
    for (let ii = tempChildren.length - 1; ii >= 0; ii--) {
      container.attach(tempChildren[ii])
    }
  }
})

AFRAME.registerComponent('fusable-body', {

  schema: {
    type: {type: 'string', default: 'dynamic'}
  },

  init() {
    this.el.setAttribute('graph-node', '')
    this.system.addNode(this.el)
  },

  remove() {
    this.el.removeAttribute('graph-node')
    this.system.removeNode(this.el)
  },
})

AFRAME.registerComponent('fused-joint', {

  multiple: true,

  schema: {
    target: {type: 'selector'}
  },

  init() {
    this.el.setAttribute(`graph-edge__${this.attrName}`, {target: `#${this.data.target.id}`})
  },

  remove() {
    this.el.removeAttribute(`graph-edge__${this.attrName}`)
  }
});

/* global AFRAME THREE */
const PS_STATE_FREE = 0
const PS_STATE_BINDING = 1
const PS_STATE_BOUND = 2
const PS_STATE_TARGET = 3
const PS_STATE_FAILED = 3

AFRAME.registerComponent('socket', {

  schema: {
    type: { type: 'string', default: 'socket', oneOf: ['socket', 'plug']}
  },

  init() {
    this.bindingState = PS_STATE_FREE
    this.adjustmentTransform = new THREE.Object3D()
    this.fabricAdjustmentTransform = new THREE.Object3D()
    
    this.fabric = this.findFabric()
    this.peer = null
    this.isSocket = (this.data.type === 'socket')

    // worldSpaceObject is a world-space representation of the transform
    // of this socket.  Used for matching sockets in space.
    this.worldSpaceObject = new THREE.Object3D()
    this.worldSpaceObject.el = this.el
    this.updateWorldSpaceObject()
    this.el.sceneEl.object3D.add(this.worldSpaceObject)
    
    this.addToSystem()

    this.bindingFailed = this.bindingFailed.bind(this)
    this.bindingSuccess = this.bindingSuccess.bind(this)
    this.el.addEventListener('binding-failed', this.bindingFailed)
    this.el.addEventListener('binding-success', this.bindingSuccess)

    if (this.system.data.debug) {
      this.debugVisual = document.createElement('a-cylinder')
      this.updateDebugVisual()
      this.el.appendChild(this.debugVisual)
    }

    this.debugDistanceVector = new THREE.Vector3()
  },

  remove() {
    this.el.removeEventListener('binding-failed', this.bindingFailed)
    this.el.removeEventListener('binding-success', this.bindingSuccess)
    this.removeFromSystem()
    this.worldSpaceObject.el = undefined
  },

  findFabric() {
    
    function findFabricAbove(el, sceneEl) {
      if (!el.parentEl === sceneEl) return null
      if (el.parentEl?.getAttribute('socket-fabric') !== null) return el.parentEl
      return findFabricAbove(el.parentEl, sceneEl)
    }

    return findFabricAbove(this.el, this.el.sceneEl)
  },

  updateDebugVisual() {

    if (!this.debugVisual) return

    let color

    switch (this.bindingState) {
      case PS_STATE_FREE:
        color = (this.data.type === 'socket') ? '#55f' : '#f55'
        break
      
      case PS_STATE_BINDING:
      case PS_STATE_BOUND:
      case PS_STATE_TARGET:
        color = (this.data.type === 'socket') ? '#5ff' : '#ff5'
        break

      default:
        console.error('unexpected state', this.bindingState)
        break
    }
    
    const radius = (this.data.type === 'socket') ? 0.1 : 0.08
    
    const sides = 360 / this.system.data.rotationIncrement

    this.debugVisual.setAttribute('radius', radius)
    this.debugVisual.setAttribute('height', 0.05)
    this.debugVisual.setAttribute('segments-height', 1)
    this.debugVisual.setAttribute('segments-radial', sides)
    this.debugVisual.setAttribute('polygon-wireframe', {color: color, onTop: true})

  },

  updateWorldSpaceObject() {

    // don't just use Object3D.attach for performance reasons.
    // however we can improve performance further by making this update in onBeforeRender()
    // when world matrices are computed anyway...
    // Also consider replacing worldSpaceObject with just a Matrix4 ( to avoid cost of decompose)
    const wso = this.worldSpaceObject
    this.el.object3D.updateWorldMatrix( true, false );
    wso.matrix.copy(this.el.object3D.matrixWorld)
    wso.matrix.decompose(wso.position,
                         wso.quaternion,
                         wso.scale)
  },

  addToSystem() {

    if (this.isSocket) {
      this.system.addFreeSocket(this.worldSpaceObject)
    }
    else {
      this.system.addFreePlug(this.worldSpaceObject)
    }
  },

  removeFromSystem() {

    if (this.isSocket) {
      this.system.removeFreeSocket(this.worldSpaceObject)
    }
    else {
      this.system.removeFreePlug(this.worldSpaceObject)
    }
  },

  getInertia() {

    // Temporary hack to promote snapping of entities that are being manipulated.
    // !! Needs to be made more generic & less hacky!
    const dynamicSnap = this.el.parentEl.components['dynamic-snap']
    if (dynamicSnap?.diverged) {
      return 0.1
    }
    else {
      return 1
    }
  },

  suggestPeer(peer) {

    this.bindingState = PS_STATE_BINDING
    this.peer = peer
    const peerComponent = peer.el.components.socket
    peerComponent.trackPeer(this.el.object3D)

    // adjustment transform already set up when matching sockets.

    this.el.emit('binding-request')
  },

  trackPeer(peer) {

    this.bindingState = PS_STATE_TARGET
    this.peer = peer

  },

  untrackPeer(peer) {

    this.bindingState = PS_STATE_FREE
    this.peer = null

  },

  cancelPeer() {
    if (this.peer) {

      if ((this.bindingState === PS_STATE_BINDING) || 
          (this.bindingState === PS_STATE_BOUND)) {

        this.el.emit('binding-cancel')
      }
      else if (this.bindingState === PS_STATE_TARGET) {
        this.peer.el.emit('binding-cancel')
      }
      const peerComponent = this.peer.el.components.socket
      peerComponent.untrackPeer()
      this.untrackPeer()
    }

    this.bindingState = PS_STATE_FREE
  },
  
  bindingFailed() {
    this.bindingState = PS_STATE_FAILED
    this.cancelPeer()
  },

  bindingSuccess() {

    if (!this.peer) return

    this.bindingState = PS_STATE_BOUND
    this.removeFromSystem()
    const peerComponent = this.peer.el.components.socket
    peerComponent.removeFromSystem()

    if (this.system.data.debug) {
      this.updateWorldSpaceObject()
      peerComponent.updateWorldSpaceObject()
      this.debugDistanceVector.subVectors(this.worldSpaceObject.position, this.peer.el.components.socket.worldSpaceObject.position)
      console.log("Binding Success: socket distance:", this.debugDistanceVector.length().toFixed(10))

      if (Math.abs(this.debugDistanceVector.length()) > 0.001) {
        console.error("Inaccurate binding")
        console.log("This position:", this.worldSpaceObject.position)
        console.log("Peer position:", this.peer.el.components.socket.worldSpaceObject.position)
        
      }
    }
  },

  bindingBroken() {

    if (!this.peer) return

    this.addToSystem()
    const peerComponent = this.peer.el.components.socket
    peerComponent.addToSystem()
    this.cancelPeer()
  },

  tick() {

    this.updateWorldSpaceObject()
    this.updateDebugVisual()

    // Unclear this is needed... moe thought needed about case where sockets don't bind to plug immediately
    // best to work this out when integrating with physics / manipulation controls...
    /// !! WORKING ON THIS
    // !! WRONG place to do this - can't factor in e.g. rotation preference.
    // need to continue socket bdingin process while in state "binding..."
    /*
    if (this.bindingState === PS_STATE_BINDING) {
      // update target position.
      const node = this.el.object3D
      const peer = this.peer

      this.adjustmentTransform.matrix.identity()
      this.adjustmentTransform.matrix.decompose(this.adjustmentTransform.position,
                                             this.adjustmentTransform.quaternion,
                                             this.adjustmentTransform.scale)
      peer.add(this.adjustmentTransform)
      node.attach(this.adjustmentTransform)

      this.el.emit('binding-request')
    }
    */
  }

})

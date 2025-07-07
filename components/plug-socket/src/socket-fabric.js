/* global AFRAME THREE */
AFRAME.registerComponent('socket-fabric', {

  schema: {
    snap: {type: 'string', oneOf: ['auto', 'events'], default: 'auto'}
  },

  init() {

    this.bindingRequest = this.bindingRequest.bind(this)
    this.el.addEventListener('binding-request', this.bindingRequest)

    this.bindingCancel = this.bindingCancel.bind(this)
    this.el.addEventListener('binding-cancel', this.bindingCancel)

    this.handleSnappedTo = this.handleSnappedTo.bind(this)
    // used when snap === 'events' with dynamic-snap component
    this.el.addEventListener('snappedTo', this.handleSnappedTo)

    // Temporary solution to break bonds when brick is selected.
    // !! Need to figure out correct mechanism to use here.
    this.breakBonds = this.breakBonds.bind(this)
    this.el.addEventListener('mouseGrab', this.breakBonds)
    this.bondBroken = false

    this.requests = []
    this.prevRequestsLength = 0

    this.transform = new THREE.Object3D()
    this.identityTransform = new THREE.Object3D()
    this.eventData = {worldTransform: this.transform}
  },

  handleSnappedTo() {
    this.allRequestsCompleted()
  },

  remove() {
    this.el.removeEventListener('binding-request', this.bindingRequest)
    this.el.removeEventListener('binding-cancel', this.bindingCancel)
    this.el.removeEventListener('snappedTo', this.handleSnappedTo)
  },

  bindingRequest(evt) {

    const source = evt.target
    const sourceNode = source.components['socket']
    const target = sourceNode.peer

    if (!this.requests.includes(sourceNode)) {
      this.requests.push(sourceNode)
    }

    // processing of requests is done on tick().  We don't want to act yet - if entities are in motion
    // give all entities a chance to catch up with each other before analysing, else the first to move would be 
    // designated as inconsistent with the others & discarded.
  },

  bindingCancel(evt) {

    const source = evt.target
    const sourceNode = source.components['socket']
    this.disposeOfRequest(sourceNode, false)
  },

  computeFabricAdjustmentTransforms() {

    const worldSpaceSocketPosition = new THREE.Vector3()
    const worldSpaceFabricPosition = new THREE.Vector3()
    const socketOffset = new THREE.Vector3()
    const adjustmentVector = new THREE.Vector3()

    return (() => {

      // adjustmentTransform is the transform that would move one plug or socket to the correct position in world space.
      // we need to compute fabric Adjustment Transform, which would move the entire fabric to the correct position.

      this.requests.forEach((request) => {
        
        const fabricAdjustmentTransform = request.fabricAdjustmentTransform
        const socketAdjustmentTransform = request.adjustmentTransform
        fabricAdjustmentTransform.scale.set(1, 1, 1)

        //console.log("Socket adjustment transform: position: ", socketAdjustmentTransform.position)
        //console.log("Socket adjustment transform: quaternion: ", socketAdjustmentTransform.quaternion)
        
        const quaternion = fabricAdjustmentTransform.quaternion
        quaternion.copy(socketAdjustmentTransform.quaternion)


        worldSpaceSocketPosition.copy(request.el.object3D.position)
        request.el.object3D.parent.localToWorld(worldSpaceSocketPosition)
        
        worldSpaceFabricPosition.copy(this.el.object3D.position)
        this.el.object3D.parent.localToWorld(worldSpaceFabricPosition)

        socketOffset.subVectors(worldSpaceSocketPosition, worldSpaceFabricPosition)

        const position = fabricAdjustmentTransform.position
        // translation required for socket to reach socket
        position.copy(socketAdjustmentTransform.position)

        // minus socket->fabric translation post-quaternion
        adjustmentVector.copy(socketOffset)
        adjustmentVector.applyQuaternion(fabricAdjustmentTransform.quaternion)
        position.sub(adjustmentVector)

        // plus socket->fabric translation pre-quaternion
        position.add(socketOffset)

        //console.log("World Space Fabric adjustment transform: position: ", fabricAdjustmentTransform.position)
        //console.log("World Space Fabric adjustment transform: quaternion: ", fabricAdjustmentTransform.quaternion)

      })
    })()
  },

  buildConsensus() {

    const countMatchingRequests = (request) => 
      (this.requests.filter((item) => this.compareTransforms(request.fabricAdjustmentTransform,
                                                             item.fabricAdjustmentTransform)).length)

    const matchCounts = this.requests.map((request) => countMatchingRequests(request))
    
    const maxMatches = Math.max(...matchCounts)
    const maxMatchesIndex = matchCounts.indexOf(maxMatches)

    const usableRequest = this.requests[maxMatchesIndex]

    const disposableRequests = this.requests.filter((item) => !this.compareTransforms(usableRequest.fabricAdjustmentTransform,
                                                                                      item.fabricAdjustmentTransform))
    disposableRequests.forEach((request) => {
      this.disposeOfRequest(request, true)
    })

    if (!this.requests.length) {
      console.error("All requests disposed of:", disposableRequests)
    }

    // this.requests now contains only usable requests, that are consistent with each other.

    //console.log("Requests", this.requests)
  },

  disposeOfRequest(request, failureFlag) {

    if (failureFlag) {
      request.el.emit('binding-failed')
    }
    
    const index = this.requests.indexOf(request)
    this.requests.splice(index, 1)
  
  },

  compareTransforms(a, b, precision = 6) {

    if (a === b) return true

    const compare = (x, y) => (Math.abs(x - y) < Math.pow(10, -precision))

    const ap = a.position
    const bp = b.position
    if (!compare(ap.x, bp.x)) return false
    if (!compare(ap.y, bp.y)) return false
    if (!compare(ap.z, bp.z)) return false

    const aq = a.quaternion
    const bq = b.quaternion
    if (!compare(aq.x, bq.x)) return false
    if (!compare(aq.y, bq.y)) return false
    if (!compare(aq.z, bq.z)) return false
    if (!compare(aq.w, bq.w)) return false
  
    return true
  },

  tick() {

    if (this.requests.length) {
      
      this.computeFabricAdjustmentTransforms()

      // dispose of any requests that are inconsistent with other requests.
      this.buildConsensus()

      // Now all requests are consistent, so fine to pick any of them to apply.
      // !! SHOULD RENAME THIS FUNCTION - DOESN'T ALWAYS RESULT IN MOVEMENT
      this.moveTowards(this.requests[0].fabricAdjustmentTransform)
    }
    else {
      if (this.prevRequestsLength) {
        // just moved from having some requests, to having none.
        this.el.emit('snapEnd')
      }
    }

    // Record number of requests, for review next tick.
    this.prevRequestsLength = this.requests.length
  },

  // !! SHOULD RENAME THIS FUNCTION - DOESN'T ALWAYS RESULT IN MOVEMENT
  moveTowards(object) {

    if (this.data.snap === 'auto') {
      // for now, just snap to position 
      // - in future, will be option to do this asynchronously via physics system.

      const scene = this.el.sceneEl.object3D
      const parent = this.el.object3D.parent

      // transform is specified in world space, so switch to world space to apply it.
      scene.attach(this.el.object3D)
      this.el.object3D.position.add(object.position)
      this.el.object3D.quaternion.premultiply(object.quaternion)
      parent.attach(this.el.object3D)

      this.requests.forEach((request) => {
        this.requestCompleted(request)
      })

      // !! Will need to do better when objects are moving - need to mediate between
      // whatever is controlling movement (animation etc.) and this change to position.
      // An additional Objet3D needed to track the offset transform?
      // Details to be worked out...
    }
    else {

      let alreadyInPosition = false
      if (!this.bondsBroken && this.compareTransforms(this.identityTransform, object)) {
        // requested transform is the identity (no movement)
        alreadyInPosition = true
      }

      // signal events, to allow snap to be controlled externally.
      const transform = this.transform
      transform.position.copy(this.el.object3D.position)
      transform.quaternion.copy(this.el.object3D.quaternion)
      transform.scale.copy(this.el.object3D.scale)

      this.el.object3D.parent.add(transform)
      this.el.sceneEl.object3D.attach(transform)

      transform.quaternion.premultiply(object.quaternion)
      transform.position.add(object.position)

      //console.log("World transform: position: ", transform.position)
      //console.log("World transform: quaternion: ", transform.quaternion)

      this.el.emit('snapStart', this.eventData)

      if (alreadyInPosition) {
        this.allRequestsCompleted()
      }
      else {
        // dynamic-snap will emit snappedTo that will call allRequestsCompleted()
      }
    }
  },

  allRequestsCompleted() {
    this.requests.forEach((request) => {
      this.requestCompleted(request)
    })
  },
  
  requestCompleted(request) {

    request.el.emit('binding-success')

    this.disposeOfRequest(request, false)
    this.bondsBroken = false
  },

  breakBonds() {
    this.bondsBroken = true

    const sockets = this.el.querySelectorAll('[socket]')

    sockets.forEach((socket) => {
      const socketComponent = socket.components.socket
      socketComponent.bindingBroken()
    })
  }
})

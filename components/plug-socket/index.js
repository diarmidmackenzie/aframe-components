require('aframe-polygon-wireframe')

const PS_STATE_FREE = 0
const PS_STATE_BINDING = 1
const PS_STATE_BOUND = 2

AFRAME.registerSystem('socket', {

  schema: {
    snapDistance: {default: 0.1},

    // rotation in degrees by which a plug can snap to this socket.
    snapRotation: {default: 30},

    // degrees between positions at which the socket & plug can be fixed (y-axis only)
    rotationIncrement: { default: 90 },

    // debug visualization
    debug: { default: false }
  },

  init() {

    this.freeSocketObjects = []
    this.freePlugObjects = []
    this.freeSocketsSortedByX = []
    this.freeSocketsSortedByY = []
    this.freeSocketsSortedByZ = []

    this.upVector = new THREE.Vector3(0, 1, 0)
    this.identityQuaternion = new THREE.Quaternion()
    this.bestQuaternion = new THREE.Quaternion()

    this.testPlug = new THREE.Object3D()
  },

  update() {

    // build an array of quaternions representing angles to test for socket/plug matches,
    // based on the supplied config.
    // old code, can probably delete...
    /* this.anglesToTest = []
    for (angle = 0; angle < 360; angle += this.data.rotationIncrement) {
      const quaternion = new THREE.Quaternion()
      quaternion.setFromAxisAngle(this.upVector, THREE.MathUtils.degToRad(angle))
      this.anglesToTest.push(quaternion)
    }*/
    this.angleIncrementQuaternion = new THREE.Quaternion()
    this.angleIncrementQuaternion.setFromAxisAngle(this.upVector, THREE.MathUtils.degToRad(this.data.rotationIncrement))
  },

  addFreePlug(plug) {
    this.freePlugObjects.push(plug)
  },

  removeFreePlug(plug) {
    const index = this.freePlugObjects.indexOf(plug)

    if (index > 0) {
      this.freePlugObjects.splice(index, 1)
    }
  },

  addFreeSocket(socket) {
    this.freeSocketObjects.push(socket)
  },

  removeFreeSocket(socket) {
    const index = this.freeSocketObjects.indexOf(socket)

    if (index > 0) {
      this.freeSocketObjects.splice(index, 1)
    }
  },

  prepareSocketsForSearch() {
    const sortByX = (o1, o2) => o1.position.x - o2.position.x
    const sortByY = (o1, o2) => o1.position.y - o2.position.y
    const sortByZ = (o1, o2) => o1.position.z - o2.position.z

    // copy & sort arrays - would be nice to rework to create less GC, but elsewhere we also use
    // slice & filter which generate new arrays.
    this.freeSocketsSortedByX = [...this.freeSocketObjects].sort(sortByX)
    this.freeSocketsSortedByY = [...this.freeSocketObjects].sort(sortByY)
    this.freeSocketsSortedByZ = [...this.freeSocketObjects].sort(sortByZ)
  },

  findNearbySockets(plug) {

    const tolerance = this.data.snapDistance
    const plugPosition = plug.position

    const xCandidates = this.findCandidates(this.freeSocketsSortedByX, 'x', plugPosition.x, tolerance);
    const yCandidates = this.findCandidates(this.freeSocketsSortedByY, 'y', plugPosition.y, tolerance);
    const zCandidates = this.findCandidates(this.freeSocketsSortedByZ, 'z', plugPosition.z, tolerance);

    const intersectArrays = (a1, a2) => {
      const intersect = a1.filter((c1) => a2.find((c2) => c1 === c2));
      return intersect;
    };
  
    const xyCandidates = intersectArrays(xCandidates, yCandidates);
    const candidates = intersectArrays(xyCandidates, zCandidates);

    const toleranceSq = tolerance * tolerance
    
    const checkDistance = (o) => {
      if (o.position.distanceToSquared(plugPosition) >= toleranceSq) return false
      return true
    }
    return candidates.filter(checkDistance)
  },

  findCandidates(array, property, value, tolerance) {

    if (array.length === 0) return array

    const firstIndex = this.findInArraySegment(array, property, value - tolerance, 0, array.length - 1, true);
    const lastIndex = this.findInArraySegment(array, property, value + tolerance, 0, array.length - 1, false);

    return array.slice(firstIndex, lastIndex + 1);
  },

  // Binary Search utility function.
  // array: the array to search.  An array of Object3Ds.
  // property: one of "x", "y" or "z" - indicates which part of the Object3D's position to check.
  // value: the value to search for
  // start: the start position to search from
  // end: the end position to search to
  // forward: true to search from beginning (lowest matching value),
  // false to search from the end (highest matching value_)
  findInArraySegment(array, property, value, start, end, forward) {
    //console.log(`Searching for ${value} in array, between indices ${start} and ${end}`);
    //console.log(`Array segment is: ${array.slice(start, end)}`);

    // Final match
    if (start === end || start > end) {
      //console.log(`found at ${start}`)
      if (array[start].position[property] > value && forward) {
        return start - 1;
      } else {
        return start;
      }
    }

    // Find the middle index
    const mid = Math.floor((start + end) / 2);

    // If element at mid is greater than x
    // (or it matches & we are searching forwards).
    // search in the left half of mid
    const midValue = array[mid].position[property]
    if (midValue > value || (midValue === value && forward)) {
      return this.findInArraySegment(array, property, value, start, mid - 1);
    }
    // If element at mid is smaller than x,
    // search in the right half of mid
    else {
      return this.findInArraySegment(array, property, value, mid + 1, end);
    }
  },

  tick() {
    // search for free plugs near to free sockets
    this.prepareSocketsForSearch()

    const plugs = this.freePlugObjects
    const length = plugs.length

    for (let ii = 0; ii < length; ii++) {
      const plug = plugs[ii]
      const plugComponent = plug.el.components.socket
      
      adjustmentTransform = plugComponent.adjustmentTransform
      const socket = this.matchPlugToSocket(plug, adjustmentTransform)

      if (!socket) continue

      const socketComponent = socket.el.components.socket

      if (this.data.debug) {

        console.log("Matched plug: ", ii, plug.uuid, "to socket", socket.uuid)
        console.log("Plug WP:", plugComponent.worldSpaceObject.position)
        console.log("Plug WQ:", plugComponent.worldSpaceObject.quaternion)
        
      
        console.log("Socket WP:", socketComponent.worldSpaceObject.position)
        console.log("Socket WQ:", socketComponent.worldSpaceObject.quaternion)

        console.log("Adjustment Transform P:", adjustmentTransform.quaternion)
        console.log("Adjustment Transform Q:", adjustmentTransform.quaternion)
      }

      const socketInertia = socketComponent.getIntertia()
      const plugInertia = plugComponent.getIntertia()

      if (plugInertia <= socketInertia) {
        
        plugComponent.suggestPeer(socket)
      }
      else {
        socketComponent.suggestPeer(plug)
      }
    }
  },

  // params:
  // plug to match to a socket
  // adjustmentTransform - an object3D, child of the plug, whose transform will be set to the 
  //                adjustment required from the plug transform to the chosen socket's transform.
  matchPlugToSocket(plug, adjustmentTransform) {

    let bestSocket = null
    let bestDistanceSq = Infinity
    const sockets = this.findNearbySockets(plug)

    if (sockets.length < 1) return

    sockets.forEach((socket) => {

      // set testPlug position to match position of socket,
      // but as a child of the plug.
      this.testPlug.matrix.identity()
      this.testPlug.matrix.decompose(this.testPlug.position,
                                     this.testPlug.quaternion,
                                     this.testPlug.scale)
      socket.add(this.testPlug)
      plug.attach(this.testPlug)

      let bestAngle = Infinity

      for (let ii = 0; ii < 360; ii += this.data.rotationIncrement) {

        // standardize an angle to range -PI to +PI
        const standardizeAngle = (angle) => angle - (2 * Math.PI * Math.floor((angle + Math.PI) / (2 * Math.PI)))

        const rawAngle = this.testPlug.quaternion.angleTo(this.identityQuaternion)
        const absAngle = Math.abs(standardizeAngle(rawAngle))

        if (absAngle < bestAngle) {
          bestAngle = absAngle
          this.bestQuaternion.copy(this.testPlug.quaternion)
        }

        this.testPlug.quaternion.multiply(this.angleIncrementQuaternion)
      }

      if (bestAngle < this.data.snapRotation) {
        // angle small enough to qualify

        const distanceSq = this.testPlug.position.lengthSq()
        
        if (distanceSq < bestDistanceSq) {
          bestDistanceSq = distanceSq
          bestSocket = socket

          adjustmentTransform.position.copy(this.testPlug.position)
          adjustmentTransform.quaternion.copy(this.bestQuaternion)
        }
      }
    })

    return bestSocket
  }
})

AFRAME.registerComponent('socket', {

  schema: {
    type: { type: 'string', default: 'socket', oneOf: ['socket', 'plug']}
  },

  init() {
    this.bindingState = PS_STATE_FREE
    this.adjustmentTransform = new THREE.Object3D()
    this.fabricAdjustmentTransform = new THREE.Object3D()
    
    this.peer = null
    this.isSocket = (this.data.type === 'socket')

    // worldSpaceObject is a world-space representation of the transform
    // of this socket.  USed for matching sockets in space.
    this.worldSpaceObject = new THREE.Object3D
    this.worldSpaceObject.el = this.el
    this.updateWorldSpaceObject()
    
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

  updateDebugVisual() {

    if (!this.debugVisual) return

    let color, radius

    switch (this.bindingState) {
      case PS_STATE_FREE:
        color = (this.data.type === 'socket') ? '#55f' : '#f55'
        break
      
      case PS_STATE_BINDING:
      case PS_STATE_BOUND:
        color = (this.data.type === 'socket') ? '#5ff' : '#ff5'
        break

      default:
        console.error('unexpected state', this.bindingState)
        break
    }
    
    radius = (this.data.type === 'socket') ? 0.1 : 0.08
    
    const sides = 360 / this.system.data.rotationIncrement

    this.debugVisual.setAttribute('radius', radius)
    this.debugVisual.setAttribute('height', 0.05)
    this.debugVisual.setAttribute('segments-height', 1)
    this.debugVisual.setAttribute('segments-radial', sides)
    this.debugVisual.setAttribute('polygon-wireframe', {color: color, onTop: true})

  },

  updateWorldSpaceObject() {

    const wso = this.worldSpaceObject
    wso.matrix.identity()
    wso.matrix.decompose(wso.position,
                         wso.quaternion,
                         wso.scale)
    this.el.object3D.add(wso)
    this.el.sceneEl.object3D.attach(wso)

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

  getIntertia() {

    return 1
  },

  suggestPeer(peer) {

    this.bindingState = PS_STATE_BINDING
    this.peer = peer

    // adjustment transform already set up when matching sockets.

    this.el.emit('binding-request')
  },
  
  bindingFailed() {
    this.peer.el.components.socket.addToSystem()
    this.connectedSocket = null
  },

  bindingSuccess() {
    this.bindingState = PS_STATE_BOUND
    this.removeFromSystem()
    const peerComponent = this.peer.el.components.socket
    peerComponent.removeFromSystem()

    if (this.system.data.debug) {
      this.updateWorldSpaceObject()
      peerComponent.updateWorldSpaceObject()
      this.debugDistanceVector.subVectors(this.worldSpaceObject.position, this.peer.el.components.socket.worldSpaceObject.position)
      console.log("Binding Success: socket distance:", this.debugDistanceVector.length().toFixed(10))
    }
  },

  tick() {

    this.updateWorldSpaceObject()
    this.updateDebugVisual()

    // Unclear this is needed... moe thought needed about case where sockets don't bind to plug immediately
    // best to work this out when integrating with physics / manipulation controls...
    /*if (this.bindingState === PS_STATE_BINDING) {
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
    }*/
  }

})

AFRAME.registerComponent('socket-fabric', {

  init() {

    this.bindingRequest = this.bindingRequest.bind(this)
    this.el.addEventListener('binding-request', this.bindingRequest)

    this.requests = []
    this.adjustmentVector = new THREE.Vector3()
  },

  bindingRequest(evt) {

    source = evt.target
    sourceNode = source.components['socket']
    target = sourceNode.peer

    this.requests.push(sourceNode)

    // processing of requests is done on tick().  We don't want to act yet - if entities are in motion
    // give all entities a chance to catch up with each other before analysing, else the first to move would be 
    // designated as inconsistent with the others & discarded.
  },

  computeFabricAdjustmentTransforms() {

    // adjustmentTransform is the transform that would move one plug or socket to the correct position.
    // we need to compute fabric Adjustment Transform, which would move the entire fabric to the correct position.

    this.requests.forEach((request) => {
      
      const fabricAdjustmentTransform = request.fabricAdjustmentTransform
      const socketAdjustmentTransform = request.adjustmentTransform
      fabricAdjustmentTransform.scale.set(1, 1, 1)
      
      const quaternion = fabricAdjustmentTransform.quaternion
      quaternion.copy(socketAdjustmentTransform.quaternion)

      const socketPosition = request.el.object3D.position
      const position = fabricAdjustmentTransform.position
      // translation required for socket to reach socket
      position.copy(socketAdjustmentTransform.position)

      // minus socket->fabric translation post-quaternion
      this.adjustmentVector.copy(socketPosition)
      this.adjustmentVector.applyQuaternion(fabricAdjustmentTransform.quaternion)
      position.sub(this.adjustmentVector)

      // minus socket->fabric translation pre-quaternion
      position.add(socketPosition)
    })
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

    if (!this.requests.length) return

    this.computeFabricAdjustmentTransforms()

    // dispose of any requests that are inconsistent with other requests.
    this.buildConsensus()

    // Now all requests are consistent, so fine to pick any of them to apply.
    this.moveTowards(this.requests[0].fabricAdjustmentTransform)
  },

  moveTowards(object) {

    // for now, just snap to position 
    // - in future, will be option to do this asynchronously via physics system.
    this.el.object3D.position.add(object.position)
    this.el.object3D.quaternion.premultiply(object.quaternion)

    this.requests.forEach((request) => {
      this.requestCompleted(request)
    })

    // !! Will need to do better when objects are moving - need to mediate between
    // whatever is controlling movement (animation etc.) and this change to position.
    // An additional Objet3D needed to track the offset transform?
    // Details to be worked out...
  },

  requestCompleted(request) {

    request.el.emit('binding-success')

    this.disposeOfRequest(request, false)
  }
})

AFRAME.registerComponent('plug', {

  init() {
    this.el.setAttribute('socket', {type: 'plug'})
  }
})

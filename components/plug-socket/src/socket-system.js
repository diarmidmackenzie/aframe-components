AFRAME.registerSystem('socket', {

  schema: {
    snapDistance: {default: 0.1},

    // rotation in degrees by which a plug can snap to this socket.
    snapRotation: {default: 50},

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
    this.tempQuaternion = new THREE.Quaternion()

    this.testPlug = new THREE.Object3D()
    
  },

  update() {

    this.snapRotation = THREE.MathUtils.degToRad(this.data.snapRotation)

    // build an array of quaternions representing angles to test for socket/plug matches,
    // based on the supplied config.
    this.angleIncrementQuaternion = new THREE.Quaternion()
    this.angleIncrementQuaternion.setFromAxisAngle(this.upVector, THREE.MathUtils.degToRad(this.data.rotationIncrement))
  },

  addFreePlug(plug) {
    if (!this.freePlugObjects.includes(plug)) {
      this.freePlugObjects.push(plug)
    }
  },

  removeFreePlug(plug) {
    const index = this.freePlugObjects.indexOf(plug)

    if (index > -1) {
      this.freePlugObjects.splice(index, 1)
    }
  },

  addFreeSocket(socket) {
    if (!this.freeSocketObjects.includes(socket)) {
      this.freeSocketObjects.push(socket)
    }
  },

  removeFreeSocket(socket) {
    const index = this.freeSocketObjects.indexOf(socket)

    if (index > -1) {
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

      if (socket) {
        
        const socketComponent = socket.el.components.socket

        if (this.data.debug) {

          console.log("Matched plug: ", ii, plug.uuid, "to socket", socket.uuid)
          console.log("Plug WP:", plugComponent.worldSpaceObject.position)
          console.log("Plug WQ:", plugComponent.worldSpaceObject.quaternion)
          
        
          console.log("Socket WP:", socketComponent.worldSpaceObject.position)
          console.log("Socket WQ:", socketComponent.worldSpaceObject.quaternion)

          console.log("Adjustment Transform P:", adjustmentTransform.position)
          console.log("Adjustment Transform Q:", adjustmentTransform.quaternion)
        }

        const socketInertia = socketComponent.getInertia()
        const plugInertia = plugComponent.getInertia()

        if (plugInertia <= socketInertia) {
          
          plugComponent.suggestPeer(socket)
        }
        else {
          socketComponent.adjustmentTransform.position.copy(adjustmentTransform.position).multiplyScalar(-1)
          socketComponent.adjustmentTransform.quaternion.copy(adjustmentTransform.quaternion).invert()
          socketComponent.suggestPeer(plug)
        }
      }
      else {
        // plug no longer connects to any socket.
        plugComponent.cancelPeer()
      }
    }
  },

  // params:
  // plug to match to a socket
  // adjustmentTransform - an object3D, whose transform will be set to the 
  //                adjustment required from the plug transform to the chosen socket's transform.
  //                all in world space.
  matchPlugToSocket(plug, adjustmentTransform) {

    let bestSocket = null
    let bestDistanceSq = Infinity
    const sockets = this.findNearbySockets(plug)

    if (sockets.length < 1) return null

    sockets.forEach((socket) => {

      // don't consider sockets in the same fabric as the plug.
      if (socket.el.components.socket.fabric === plug.el.components.socket.fabric) return null

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

      if (bestAngle < this.snapRotation) {
        // angle small enough to qualify

        const distanceSq = this.testPlug.position.lengthSq()
        
        if (distanceSq < bestDistanceSq) {
          bestDistanceSq = distanceSq
          bestSocket = socket

          plugInverseQuaternion = this.tempQuaternion
          plugInverseQuaternion.copy(plug.quaternion).invert()

          adjustmentTransform.position.subVectors(socket.position, plug.position)
          adjustmentTransform.quaternion.copy(this.bestQuaternion)
                              .premultiply(plug.quaternion)
                             .multiply(plugInverseQuaternion)

          //console.log("adjustmentTransform position: ", adjustmentTransform.position)
          //console.log("adjustmentTransform quaternion: ", adjustmentTransform.quaternion)
        }
      }
    })

    return bestSocket
  }
})

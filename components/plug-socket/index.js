
AFRAME.registerSystem('socket', {

  schema: {
    snapDistance: {default: 0.1},
    // rotation in degrees by which a plug can snap to this socket.
    snapRotation: {default: 30},
  },

  init() {

    this.freeSocketObjects = []
    this.freePlugObjects = []
    this.freeSocketsSortedByX = []
    this.freeSocketsSortedByY = []
    this.freeSocketsSortedByZ = []

  },

  prepareSocketsForSearch() {
    const sortByX = (o1, o2) => o1.position.x - o2.position.x
    const sortByY = (o1, o2) => o1.position.y - o2.position.y
    const sortByZ = (o1, o2) => o1.position.z - o2.position.z

    // copy & sort arrays - intention is to avoid allocation of new arrays, which would lead
    // to Garbage Collection.

    // Maybe futile as elsewhere we use slice & filter which generate new arrays.  Maybe we can
    // do better there?
    this.freeSocketsSortedByX.length = 0
    this.freeSocketsSortedByY.length = 0
    this.freeSocketsSortedByZ.length = 0
    this.freeSocketsSortedByX.concat(this.freeSocketObjects).sort(sortByX)
    this.freeSocketsSortedByY.concat(this.freeSocketObjects).sort(sortByY)
    this.freeSocketsSortedByZ.concat(this.freeSocketObjects).sort(sortByZ)
  },

  findMatchingSockets(plug) {

    const tolerance = this.data.snapDistance
    const plugPosition = plug.position

    const xCandidates = this.findCandidates(this.freeSocketsSortedByX, plugPosition.x, tolerance);
    const yCandidates = this.findCandidates(this.freeSocketsSortedByY, plugPosition.y, tolerance);
    const zCandidates = this.findCandidates(this.freeSocketsSortedByZ, plugPosition.z, tolerance);

    const intersectArrays = (a1, a2) => {
      const intersect = a1.filter((c1) => a2.find((c2) => c1 === c2));
      return intersect;
    };
  
    const xyCandidates = intersectArrays(xCandidates, yCandidates);
    const candidates = intersectArrays(xyCandidates, zCandidates);

    const toleranceSq = tolerance * tolerance
    
    const checkDistance = (o) => {
      if (o.position.distanceToSquared(plugPosition) >= toleranceSq) return false
    }
    return candidates.filter(checkDistance)
  },

  findCandidates(array, property, value, tolerance) {
    const firstIndex = this.findInArraySegment(array, property, value - tolerance, 0, array.length, true);
    const lastIndex = this.findInArraySegment(array, property, value + tolerance, 0, array.length, false);

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
  findInArraySegment(array, value, start, end, forward) {
    //console.log(`Searching for ${x} in array, between indices ${start} and ${end}`);
    //console.log(`Array segment is: ${array.slice(start, end)}`);

    // Final match
    if (start === end || start > end) {
      //console.log(`found at ${start}`)
      if (array[start].object3D.position[property] > value && forward) {
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
    const midValue = array[mid].object3D.position[property]
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

    for (ii = 0; ii < length; ii++) {
      this.matchPlugToSocket(plugs[ii])
    }
  }

})

AFRAME.registerComponent('socket', {

  schema: {
    // degrees between positions at which the socket & plug can be fixed
    rotationIncrement: { default: 90 }
  }
})

AFRAME.registerComponent('plug', {

  init() {
    this.connected = false
  },

  tick() {


  }
})
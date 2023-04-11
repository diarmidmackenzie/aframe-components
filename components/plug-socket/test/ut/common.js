QUnit.assert.approxEqual = function (actual, expected, options = {}, message) {

  const dps = options.dps || 10
  const result = (Math.abs(expected - actual) < (Math.pow(10, -dps)))
  this.pushResult({
    result: result,
    actual: actual,
    expected: `approximately equal to ${expected} (within ${dps} dps)`,
    message: message
  });
};

QUnit.assert.isSquareAngle = function (actual, options = {}, message) {
  const dps = options.dps || 10
  const remainder = actual - ((Math.PI / 2) * Math.floor(actual / (Math.PI / 2)))
  const result = (Math.abs(remainder) < (Math.pow(10, -dps)))
  this.pushResult({
    result: result,
    actual: actual,
    expected: `to be a multiple of PI / 2 radians`,
    message: message
  });
};

QUnit.assert.vectorsEqual = function (actual, expected, options = {}, message) {

  const dps = options.dps || 10
  const tolerance = (Math.pow(10, -dps))

  let expectedArray, actualArray
  if (expected.x !== undefined) {
    expectedArray = [expected.x, expected.y, expected.z]
  }
  else {
    expectedArray = expected.split(' ')
  }

  if (actual.x !== undefined) {
    actualArray = [actual.x, actual.y, actual.z]
  }
  else {
    actualArray = actual.split(' ')
  }

  let result = true

  if (expectedArray.length !== actualArray.length) {
    result = false
  }
  else {
    for (let ii = 0; ii < actualArray.length; ii++) {
      const diff = Math.abs(actualArray[ii] - expectedArray[ii])
      if (diff > tolerance) {
        result = false
        break
      }
    }
  }
    
  //const result = (Math.abs(expected - actual) < (Math.pow(10, -dps)));
  this.pushResult({
    result: result,
    actual: actual,
    expected: `approximately equal to ${expected} (within ${dps} dps)`,
    message: message
  });
};

QUnit.assert.rotationsEqual = function (actual, expected, options = {}, message) {

  const dps = options.dps || 10
  const tolerance = (Math.pow(10, -dps))

  const r2d = THREE.MathUtils.radToDeg
  let expectedArray, actualArray
  if (expected.x !== undefined) {
    expectedArray = [r2d(expected.x), r2d(expected.y), r2d(expected.z)]
  }
  else {
    expectedArray = expected.split(' ')
  }

  if (actual.x !== undefined) {
    actualArray = [r2d(actual.x), r2d(actual.y), r2d(actual.z)]
  }
  else {
    actualArray = actual.split(' ')
  }

  let result = true

  if (expectedArray.length !== actualArray.length) {
    result = false
  }
  else {
    for (let ii = 0; ii < actualArray.length; ii++) {
      const diff = Math.abs(actualArray[ii] - expectedArray[ii])
      if (diff > tolerance) {
        result = false
        break
      }
    }
  }
    
  //const result = (Math.abs(expected - actual) < (Math.pow(10, -dps)));
  this.pushResult({
    result: result,
    actual: actual,
    expected: `approximately equal to ${expected} (within ${dps} dps)`,
    message: message
  });
};

// Destroy scene at the end of every test.  This has the important side-benefit of clearing
// up all event listeners that were registered on the scene or its children.
QUnit.testDone(function() {
  const scene = document.querySelector('a-scene')
  if (scene) {
    scene.parentElement.removeChild(scene)
  }
});

const createScene = () => {
  const scene = document.createElement('a-scene')
  document.body.appendChild(scene)

  return scene
}

const createFabric = (pos = "0 0 0", rot = "0 0 0", parent = document.querySelector('a-scene')) => {
  const el = document.createElement('a-entity')
  el.setAttribute('socket-fabric', '')
  el.setAttribute('position', pos)
  el.setAttribute('rotation', rot)
  parent.appendChild(el)
  return el
}

const createSocket = (fabric, pos = '0 0 0', rot = '0 0 0') => {
  const el = document.createElement('a-entity')
  el.setAttribute('socket' , '')
  el.setAttribute('position', pos)
  el.setAttribute('rotation', rot)
  fabric.appendChild(el)
  return el
}

const createPlug = (fabric, pos = '0 0 0', rot = '0 0 0') => {
  const el = document.createElement('a-entity')
  el.setAttribute('plug', '')
  el.setAttribute('position', pos)
  el.setAttribute('rotation', rot)
  fabric.appendChild(el)
  return el
}

const simplePlugSocketTest = (assert, options = {}) => {
  const scene = document.querySelector('a-scene') || createScene() 
  const pos1  = options.pos1 || "0 0 0"
  const pos2  = options.pos2 || "0 0 0"
  const parent1  = options.parent1 || document.querySelector('a-scene')
  const rot1  = options.rot1 || "0 0 0"
  const rot2  = options.rot2 || "0 0 0"
  const parent2  = options.parent2 || document.querySelector('a-scene')
  const finalPos1  = options.finalPos1 || "0 0 0"
  const finalPos2  = options.finalPos2 || "0 0 0"
  const finalRot1  = options.finalRot1 || "0 0 0"
  const finalRot2  = options.finalRot2 || "0 0 0"
  const plugPos  = options.plugPos || "0 0 0"
  const plugRot  = options.plugRot || "0 0 0"
  const sockPos  = options.sockPos || "0 0 0"
  const sockRot  = options.sockRot || "0 0 0"
  const snapDistance = (options.snapDistance !== undefined) ? options.snapDistance : 0.2
  const snapRotation = (options.snapRotation !== undefined) ? options.snapRotation : 30
  const snapExpected = (options.snapExpected !== undefined) ? options.snapExpected : true
  
  scene.setAttribute('socket', {snapDistance: snapDistance, snapRotation: snapRotation, debug: true})
  const fabricTop = createFabric(pos1, rot1, parent1)
  const socket = createSocket(fabricTop, sockPos, sockRot)
  const fabricBottom = createFabric(pos2, rot2, parent2)
  const plug = createPlug(fabricBottom, plugPos, plugRot)
  const done = assert.async();
      
  // Plug (bottom) moves to connect to socket.

  if (snapExpected) {
    fabricBottom.addEventListener('binding-success', () => {
      const posTop = fabricTop.object3D.position
      const posBottom = fabricBottom.object3D.position
      assert.vectorsEqual(posTop, finalPos1);
      assert.vectorsEqual(posBottom, finalPos2);
      const rotTop = fabricTop.object3D.rotation
      const rotBottom = fabricBottom.object3D.rotation
      assert.rotationsEqual(rotTop, finalRot1);
      assert.rotationsEqual(rotBottom, finalRot2);

      // plug and socket positions should match exactly.
      const plugWorldPosition = new THREE.Vector3()
      plug.object3D.getWorldPosition(plugWorldPosition)
      const socketWorldPosition = new THREE.Vector3()
      socket.object3D.getWorldPosition(socketWorldPosition)
      assert.vectorsEqual(plugWorldPosition, socketWorldPosition);

      // plug and socket quaternions should differ by some multiple of ninety degrees
      const plugWorldQuaternion = new THREE.Quaternion()
      plug.object3D.updateWorldMatrix()
      plugWorldQuaternion.setFromRotationMatrix(plug.object3D.matrixWorld)
      const socketWorldQuaternion = new THREE.Quaternion()
      socket.object3D.updateWorldMatrix()
      socketWorldQuaternion.setFromRotationMatrix(socket.object3D.matrixWorld)
      const angle = plugWorldQuaternion.angleTo(socketWorldQuaternion)
      assert.isSquareAngle(angle)
      done()
    })
  }
  else {
    fabricBottom.addEventListener('binding-success', (evt) => {
      assert.false('unexpected binding')
      done()
    })
    scene.tick()
    assert.timeout(1000);
    assert.expect(0)
    done()
  }
}

const multiPlugSocketTest = (assert, options = {}) => {
  const pos1  = options.pos1 || "0 0 0"
  const pos2  = options.pos2 || "0 0 0"
  const rot1  = options.rot1 || "0 0 0"
  const rot2  = options.rot2 || "0 0 0"
  const finalPos1  = options.finalPos1 || "0 0 0"
  const finalPos2  = options.finalPos2 || "0 0 0"
  const finalRot1  = options.finalRot1 || "0 0 0"
  const finalRot2  = options.finalRot2 || "0 0 0"
  const plugPos  = options.plugPos || ["0 0 0"]
  const plugRot  = options.plugRot || ["0 0 0"]
  const sockPos  = options.sockPos || ["0 0 0"]
  const sockRot  = options.sockRot || ["0 0 0"]
  const snapDistance = (options.snapDistance !== undefined) ? options.snapDistance : 0.2
  const snapRotation = (options.snapRotation !== undefined) ? options.snapRotation : 30
  // index of the socket expected to snap to.
  const snapExpected = (options.snapExpected !== undefined) ? options.snapExpected : [{socket: 0}]

  const scene = createScene()
  scene.setAttribute('socket', {snapDistance: snapDistance, snapRotation: snapRotation, debug: true})
  const fabricTop = createFabric(pos1, rot1)
  const sockets = []
  for (let ii = 0; ii < sockPos.length; ii++) {
    const socket = createSocket(fabricTop, sockPos[ii], sockRot[ii])
    sockets.push(socket)
  }

  const fabricBottom = createFabric(pos2, rot2)
  let bindsCompleted = 0
  const plugs = []
  for (let ii = 0; ii < plugPos.length; ii++) {
    const plug = createPlug(fabricBottom, plugPos[ii], plugRot[ii])
    plugs.push(plug)
  }

  const done = assert.async();

  const onceBindsCompleted = () => {

    const posTop = fabricTop.object3D.position
    const posBottom = fabricBottom.object3D.position
    assert.vectorsEqual(posTop, finalPos1);
    assert.vectorsEqual(posBottom, finalPos2);
    const rotTop = fabricTop.object3D.rotation
    const rotBottom = fabricBottom.object3D.rotation
    assert.rotationsEqual(rotTop, finalRot1);
    assert.rotationsEqual(rotBottom, finalRot2);

    for (let ii = 0; ii < plugs.length; ii++) {

      if (!snapExpected[ii]) continue

      const plug = plugs[ii]
      const socket = sockets[snapExpected[ii].socket]
      
      // plug and socket positions should match exactly.
      const plugWorldPosition = new THREE.Vector3()
      plug.object3D.getWorldPosition(plugWorldPosition)
      const socketWorldPosition = new THREE.Vector3()
      socket.object3D.getWorldPosition(socketWorldPosition)
      assert.vectorsEqual(plugWorldPosition, socketWorldPosition);
      
    }
    done()
  }

  fabricBottom.addEventListener('binding-success', () => {
    bindsCompleted++
    const bindsExpected = snapExpected.length
    if (bindsCompleted >= bindsExpected) {
      assert.equal(bindsCompleted, bindsExpected)
      onceBindsCompleted()
    }
  })
}

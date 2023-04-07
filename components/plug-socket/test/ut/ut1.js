QUnit.assert.approxEqual = function (actual, expected, options = {}, message) {

  const dps = options.dps || 10
  const result = (Math.abs(expected - actual) < (Math.pow(10, -dps)));
  this.pushResult({
    result: result,
    actual: actual,
    expected: `approximately equal to ${expected} (within ${dps} dps)`,
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


const createScene = () => {
  const scene = document.createElement('a-scene')
  document.body.appendChild(scene)

  return scene
}

const createFabric = (pos = "0 0 0", rot = "0 0 0") => {
  const scene = document.querySelector('a-scene')
  const el = document.createElement('a-entity')
  el.setAttribute('socket-fabric', '')
  el.setAttribute('position', pos)
  el.setAttribute('rotation', rot)
  scene.appendChild(el)
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
  const pos1  = options.pos1 || "0 0 0"
  const pos2  = options.pos2 || "0 0 0"
  const rot1  = options.rot1 || "0 0 0"
  const rot2  = options.rot2 || "0 0 0"
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

  const scene = createScene()
  scene.setAttribute('socket', {snapDistance: snapDistance, snapRotation: snapRotation, debug: true})
  const fabricTop = createFabric(pos1, rot1)
  const socket = createSocket(fabricTop, sockPos, sockRot)
  const fabricBottom = createFabric(pos2, rot2)
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

QUnit.module('basic tests', function() {

  QUnit.test('plug connects to nearby socket', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      pos2: '0 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalPos2: '0 0.1 0'
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('plug can be rotated by 90 degrees Y axis', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      rot1: '0 90 0',
      pos2: '0 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalRot1: '0 90 0',
      finalPos2: '0 0.1 0'
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('Plug does not connect if more than snapDistance apart', function(assert) {

    const options = {
      snapDistance: 0.05,
      snapExpected: false,
      pos1: '0 1.1 0',
      pos2: '0 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalPos2: '0 0 0'
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('plug rotated 45 degrees Y axis does not connect', function(assert) {

    const options = {
      snapDistance: 0.2,
      snapExpected: false,
      pos1: '0 1.1 0',
      rot1: '0 45 0',
      pos2: '0 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalRot1: '0 45 0',
      finalPos2: '0 0 0'
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('plug rotated 10 degrees Y axis connects & aligns', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      pos2: '0 0 0',
      rot2: '0 10 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalPos2: '0 0.1 0',
      finalRot2: '0 0 0',
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('socket rotated 10 degrees Y axis: plug connects & aligns', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      rot1: '0 10 0',
      pos2: '0 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalRot1: '0 10 0',
      finalPos2: '0 0.1 0',
      finalRot2: '0 10 0'
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('plug rotated 10 degrees Z axis connects & aligns', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      pos2: '0 0 0',
      rot2: '0 0 10',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalPos2: '0 0.1 0',
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('plug rotated 10 degrees X axis connects & aligns', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      pos2: '0 0 0',
      rot2: '10 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalPos2: '0 0.1 0',
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('socket rotated 10 degrees Y axis.  Plug connects & aligns', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      rot1: '0 10 0',
      pos2: '0 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalRot1: '0 10 0',
      finalPos2: '0 0.1 0',
      finalRot2: '0 10 0',
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('socket rotated 10 degrees Z axis.  Plug connects & aligns', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      rot1: '0 0 10',
      pos2: '0 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalRot1: '0 0 10',
      // hardcoded based on observed values.  We also check the plug & socket positions match
      finalPos2: '0.1736481776669 0.1151922469877 0',
      finalRot2: '0 0 10',
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('socket rotated 10 degrees X axis.  Plug connects & aligns', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      rot1: '10 0 0',
      pos2: '0 0 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalRot1: '10 0 0',
      // hardcoded based on observed values.  We also check the plug & socket positions match
      finalPos2: '0 0.1151922469877 -0.1736481776669',
      finalRot2: '10 0 0',
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('2 plug connects to nearby sockets', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      pos2: '0 0 0',
      sockPos: ['-1 -0.5 0','1 -0.5 0'],
      plugPos: ['-1 0.5 0','1 0.5 0'],
      finalPos1: '0 1.1 0',
      finalPos2: '0 0.1 0',
      snapExpected: [{socket: 0}, {socket: 1}]
     }
    multiPlugSocketTest(assert, options)
  });


});

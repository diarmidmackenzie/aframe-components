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

QUnit.module('multi-plug tests', function() {

  QUnit.test('2-plug fabric connects to nearby sockets', function(assert) {

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

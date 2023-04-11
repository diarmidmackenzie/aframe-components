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

  QUnit.test('socket rotated 10 degrees X axis.  90 degree rotation on plug', function(assert) {

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      rot1: '10 0 0',
      pos2: '0 0 0',
      rot2: '0 90 0',
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalRot1: '10 0 0',
      // hardcoded based on observed values.  We also check the plug & socket positions match
      // and that angle between them is a multiple of 90 degrees.
      finalPos2: '0 0.11519224698779196 -0.17364817766693033',
      finalRot2: '0 90 10',
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('plug connects to nearby socket (90 degree wrapper container)', function(assert) {

    const scene = createScene()
    const container = document.createElement('a-entity')
    container.setAttribute('rotation', '0 0 90')
    scene.appendChild(container)

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      parent1: container,
      pos2: '0 0 0',
      parent2: container,
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalPos2: '0 0.1 0'
     }
    simplePlugSocketTest(assert, options)
  });

  QUnit.test('plug connects to nearby socket (different parents)', function(assert) {

    const scene = createScene()

    const container1 = document.createElement('a-entity')
    container1.setAttribute('position', '0 10 0')
    scene.appendChild(container1)

    const container2 = document.createElement('a-entity')
    container2.setAttribute('position', '0 -10 0')
    scene.appendChild(container2)

    const options = {
      snapDistance: 0.2,
      pos1: '0 1.1 0',
      parent1: container1,
      pos2: '0 20 0',
      parent2: container2,
      sockPos: '0 -0.5 0',
      plugPos: '0 0.5 0',
      finalPos1: '0 1.1 0',
      finalPos2: '0 20.1 0'
     }
    simplePlugSocketTest(assert, options)
  });

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

  QUnit.test('plugs and sockets on the same fabric dont interact', function(assert) {

    const scene = document.querySelector('a-scene') || createScene() 
    scene.setAttribute('socket', {snapDistance: 0.2, debug: true})
    const fabric = createFabric()
    const plug = createPlug(fabric, '0 0.5 0')
    const socket = createSocket(fabric, '0 0.6 0')
    const done = assert.async();

    fabric.addEventListener('binding-request', (evt) => {
      assert.false('unexpected binding request')
      done()
    })
    scene.addEventListener('loaded', () => {
      scene.tick()
      assert.expect(0)
      done()
    })
  });

});

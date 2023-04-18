const createFabricEvents = (pos = '0 0 0', rot = '0 0 0', parent = document.querySelector('a-scene')) => {
  const el = document.createElement('a-entity')
  el.setAttribute('socket-fabric', 'snap: events')
  el.setAttribute('position', pos)
  el.setAttribute('rotation', rot)
  parent.appendChild(el)
  return el
}

QUnit.module('events mode tests', function() {

  QUnit.test('plug in range of socket generates snapStart event', function(assert) {

    const scene = document.querySelector('a-scene') || createScene() 
    scene.setAttribute('socket', {snapDistance: 0.2, debug: true})
    const fabricTop = createFabricEvents('0 1.1 0')
    const socket = createSocket(fabricTop, '0 -0.5 0')
    const fabricBottom = createFabricEvents('0 0 0')
    const plug = createPlug(fabricBottom, '0 0.5 0')
    const done = assert.async();

    fabricBottom.addEventListener('snapStart', (evt) => {
      const transform = evt.detail.worldTransform
      assert.vectorsEqual(transform.position, '0 0.1 0')
      assert.rotationsEqual(transform.rotation, '0 0 0')
      done()
    })
  });

  QUnit.test('plug generates snapEnd event when moving out of range', function(assert) {

    const scene = document.querySelector('a-scene') || createScene() 
    scene.setAttribute('socket', {snapDistance: 0.2, debug: true})
    const fabricTop = createFabricEvents('0 1.1 0')
    const socket = createSocket(fabricTop, '0 -0.5 0')
    const fabricBottom = createFabricEvents('0 0 0')
    const plug = createPlug(fabricBottom, '0 0.5 0')
    const done = assert.async();

    fabricBottom.addEventListener('snapStart', (evt) => {
      const transform = evt.detail.worldTransform
      fabricBottom.setAttribute('position', '0 -0.2 0')

      fabricBottom.addEventListener('snapEnd', (evt) => {
        assert.expect(0)
        done()
      })
    })
  });

  QUnit.test('binding-success emitted only when plug is allowed to snap to position', function(assert) {

    const scene = document.querySelector('a-scene') || createScene() 
    scene.setAttribute('socket', {snapDistance: 0.2, debug: true})
    const fabricTop = createFabricEvents('0 1.1 0')
    const socket = createSocket(fabricTop, '0 -0.5 0')
    const fabricBottom = createFabricEvents('0 0 0')
    const plug = createPlug(fabricBottom, '0 0.5 0')
    const done = assert.async();

    let snappedTo = false
    fabricBottom.addEventListener('binding-success', (evt) => {

      assert.true(snappedTo)
      done()
    })

    fabricBottom.addEventListener('snapStart', (evt) => {
      const transform = evt.detail.worldTransform
      assert.vectorsEqual(transform.position, '0 0.1 0')
      assert.rotationsEqual(transform.rotation, '0 0 0')
      
      setTimeout(() => {
        snappedTo = true
        evt.target.emit('snappedTo')
      }, 100)
    })
  });

  QUnit.test('binding-success emitted immediately when plug is already in position', function(assert) {

    const scene = document.querySelector('a-scene') || createScene() 
    scene.setAttribute('socket', {snapDistance: 0.2, debug: true})
    const fabricTop = createFabricEvents('0 1.1 0')
    const socket = createSocket(fabricTop, '0 -0.5 0')
    const fabricBottom = createFabricEvents('0 0.1 0')
    const plug = createPlug(fabricBottom, '0 0.5 0')
    const done = assert.async();

    fabricBottom.addEventListener('binding-success', (evt) => {
      assert.expect(0)
      done()
    })
  });  
});

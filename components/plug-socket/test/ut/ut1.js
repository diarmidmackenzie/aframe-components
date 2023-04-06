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
}

const createPlug = (fabric, pos = '0 0 0', rot = '0 0 0') => {
  const el = document.createElement('a-entity')
  el.setAttribute('plug', '')
  el.setAttribute('position', pos)
  el.setAttribute('rotation', rot)
  fabric.appendChild(el)
}

QUnit.module('add', function() {
  QUnit.test('plug connects to nearby socket', function(assert) {

    const scene = createScene()
    scene.setAttribute('socket', 'snapDistance: 0.2')
    fabricTop = createFabric('0 1.1 0')
    createSocket(fabricTop, '0 -0.5 0')
    fabricBottom = createFabric('0 0 0')
    createPlug(fabricBottom, '0 0.5 0')
    const done = assert.async();
        
    // Plug (bottom) moves to connect to socket.

    fabricBottom.addEventListener('binding-success', () => {
      const posTop = fabricTop.object3D.position
      const posBottom = fabricBottom.object3D.position
      assert.equal(posTop.x, 0);
      assert.equal(posTop.y, 1.1);
      assert.equal(posTop.z, 0);
      assert.equal(posBottom.x, 0);
      assert.equal(posBottom.y, 0.1);
      assert.equal(posBottom.z, 0);

      done()
    })
  });

  QUnit.test('create box 2', function(assert) {
    const scene = createScene()
    const box = document.createElement('a-box')
    scene.appendChild(box)
    
    assert.equal(box.object3D.position.x, 0);
  });

});

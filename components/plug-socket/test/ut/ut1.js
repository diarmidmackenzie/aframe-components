QUnit.module('add', function() {
  QUnit.test('create box', function(assert) {
    const scene = document.querySelector('a-scene')
    const box = document.createElement('a-box')
    scene.appendChild(box)
    
    assert.equal(box.object3D.position.x, 0);
  });

  QUnit.test('create box 2', function(assert) {
    const scene = document.querySelector('a-scene')
    const box = document.createElement('a-box')
    scene.appendChild(box)
    
    assert.equal(box.object3D.position.x, 0);
  });

});

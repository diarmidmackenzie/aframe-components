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

const createScene = () => {
  const scene = document.createElement('a-scene')
  scene.style.position = "absolute"
  scene.style.zIndex = -1
  document.body.appendChild(scene)

  return scene
}

QUnit.module('basic tests', function() {

  QUnit.test('room with 4 walls', function(assert) {

    const done = assert.async()

    const scene = document.querySelector('a-scene') || createScene() 
    const renderer = scene.sceneEl.renderer

    const SQUARE = [
      {x: -1, z: -1},
      {x: 1, z: -1},
      {x: 1, z: 1},
      {x: -1, z: 1},
      {x: -1, z: -1}
    ]
    
    const POSITIONS = [{x: 0, y: 1, z: -1},
                       {x: 1, y: 1, z: 0},
                       {x: 0, y: 1, z: 1},
                       {x: -1, y: 1, z: 0},
                       {x: 0, y: 0, z: 0},
                       {x: 0, y: 2, z: 0}]
    const ORIENTATIONS = ["vertical", 
                          "vertical", 
                          "vertical", 
                          "vertical", 
                          "horizontal",
                          "horizontal"]

    const PLANES = new Set(POSITIONS.map((p, index) => ({ lastChangedTime: 1,
                                                          polygon: SQUARE,
                                                          planeSpace: index,
                                                          orientation: ORIENTATIONS[index]
                                                         })))
    const FRAME = {
      detectedPlanes: PLANES,
      getPose: (planeSpace) => {
        const p = POSITIONS[planeSpace]
        const q = ORIENTATIONS[planeSpace] === "horizontal" ? new THREE.Quaternion() :
                                                              new THREE.Quaternion().setFromAxisAngle({x: 1, y: 0, z: 0}, Math.PI / 2)
        const matrix = new THREE.Matrix4().compose(p, q, {x: 1, y: 1, z: 1})
        return {transform: {matrix: matrix.elements}}
      }
    }

    const xr = {
      getFrame:  () => {
        return(FRAME)
      },
      getReferenceSpace:  () => {},
      setPoseTarget: () => {}
    }
    renderer.xr = xr

    scene.setAttribute('physics', 'driver')
    scene.setAttribute('xr-room-physics', 'debug: true')
    // turn on XR presenting isPresenting
    xr.isPresenting = true

    setTimeout(() => {
      const bodies = document.querySelectorAll('[static-body]')
      assert.equal(bodies.length, 6)
      assert.vectorsEqual(bodies[0].object3D.position, '0 1 -1')
      assert.vectorsEqual(bodies[1].object3D.position, '1 1 0')
      assert.vectorsEqual(bodies[2].object3D.position, '0 1 1')
      assert.vectorsEqual(bodies[3].object3D.position, '-1 1 0')
      assert.vectorsEqual(bodies[4].object3D.position, '0 0 0')
      assert.vectorsEqual(bodies[5].object3D.position, '0 2 0')
      done()
    }, 1000)
  });

});

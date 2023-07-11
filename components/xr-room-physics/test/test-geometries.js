AFRAME.registerComponent('two-planes', {

  schema: {
    engine: { type: 'string'}
  }
  ,
  init() {
    const mesh = new THREE.Group()
    this.el.setObject3D('mesh', mesh)
    const planeGeometry = new THREE.PlaneGeometry()
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    const frontPlane = new THREE.Mesh(planeGeometry, material)
    const rearPlane = new THREE.Mesh(planeGeometry, material)
    mesh.add(frontPlane)
    mesh.add(rearPlane)
    rearPlane.position.z -= 0.5

    if (this.data.engine === 'ammo') {
      mesh.position.z += 0.25
    }
    
  }
})

AFRAME.registerComponent('prism', {

  schema: {
    engine: { type: 'string'}
  },

  init() {

    const polygon = [
      {x: -1, z: -1},
      {x: -1, z: 1},
      {x: 1, z: 1},
      {x: 1, z: -1}
    ]

    const planeShape = new THREE.Shape()
    polygon.forEach((point, i) => {
      if (i == 0) {
        planeShape.moveTo(point.x, point.z);
      } else {
        planeShape.lineTo(point.x, point.z);
      }
    });
    const geometry = new THREE.ExtrudeGeometry(planeShape, {depth: 0.3, bevelEnabled: false});
    geometry.rotateX(-Math.PI / 2);
    geometry.center();

    const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    const mesh = new THREE.Mesh(geometry, material)
    this.el.setObject3D('mesh', mesh)
  }
})
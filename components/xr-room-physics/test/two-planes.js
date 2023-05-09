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
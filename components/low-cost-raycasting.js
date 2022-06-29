const _sphere = new THREE.Sphere();
const _vector = new THREE.Vector3();

/*AFRAME.registerComponent('exhibit', {

    schema: {    
      gltfModel : {type : 'selector'},
      trueDimension: {type: 'number'}
    },
  
    init() {
      this.bSphere = new THREE.Sphere();
      this.modelDimension = 0;
      
      this.el.addEventListener('model-loaded', () => this.onModelLoaded())
  
      this.el.setAttribute('gltf-model', `#${this.data.gltfModel.id}`)
    },
  
    onModelLoaded() {
  
      this.getModelBSphere()
      
      const modelScaleFactor = this.data.trueDimension / this.modelDimension
  
      this.el.setAttribute('scale', `${modelScaleFactor}
                                     ${modelScaleFactor}
                                     ${modelScaleFactor}`)
  
  
      this.sphere = document.createElement('a-sphere')
      // match box to model, and it will be scaled together with it.
      const sphereDim = this.modelDimension
      this.sphere.object3D.scale.set(sphereDim, sphereDim, sphereDim)
      this.sphere.object3D.position.copy(this.bSphere.center)
      this.el.object3D.worldToLocal(this.sphere.object3D.position)
  
      this.sphere.setAttribute('material', {wireframe: true})
      
      this.sphere.setAttribute('clickable-object')
      this.el.appendChild(this.sphere)
    },
    
    // get a bounding sphere for the model.
    getModelBSphere() {
      const object = this.el.object3D
  
      this.expandSphereByObject(this.bSphere, this.el.object3D, true)
  
      this.modelDimension = this.bSphere.radius * 2
    },
  
    // code derrived from Box3.expandByObject.
    // Equivalent function does not exist in in THREE.js for a sphere.
    expandSphereByObject(sphere, object, precise) {
      
      object.updateWorldMatrix( false, false );
    
      const geometry = object.geometry;
  
      if ( geometry !== undefined ) {
  
        if (precise && geometry.attributes != undefined && geometry.attributes.position !== undefined ) {
  
          const position = geometry.attributes.position;
          for ( let i = 0, l = position.count; i < l; i ++ ) {
  
            _vector.fromBufferAttribute( position, i ).applyMatrix4( object.matrixWorld );
            sphere.expandByPoint( _vector );
  
          }
  
        } else {
  
          if ( geometry.boundingSphere === null ) {
  
            geometry.computeBoundingSphere();
  
          }
  
          _sphere.copy( geometry.boundingSphere );
          _sphere.applyMatrix4( object.matrixWorld );
  
          sphere.union( _sphere );
  
        }
  
      }
  
      const children = object.children;
  
      for ( let i = 0, l = children.length; i < l; i ++ ) {
  
        this.expandSphereByObject(sphere, children[ i ], precise );
  
      }
  
      return this;
  
    }
  }) */

  AFRAME.registerComponent('exhibit', {

    schema: {    
      gltfModel : {type : 'selector'},
      trueDimension: {type: 'number'}
    },
  
    init() {
      this.bbox = new THREE.Box3();
      this.modelDimension = 0;
      
      this.el.addEventListener('model-loaded', () => this.onModelLoaded())
  
      this.el.setAttribute('gltf-model', `#${this.data.gltfModel.id}`)
    },
  
    onModelLoaded() {
  
      this.getModelBBox()
      
      const modelScaleFactor = this.data.trueDimension / this.modelDimension
  
      this.el.setAttribute('scale', `${modelScaleFactor}
                                     ${modelScaleFactor}
                                     ${modelScaleFactor}`)
  
  
      this.box = document.createElement('a-box')
      // match box to model, and it will be scaled together with it.
      const boxDim = this.modelDimension
      this.box.object3D.scale.set(boxDim, boxDim, boxDim)
      this.bbox.getCenter(this.box.object3D.position)
      this.el.object3D.worldToLocal(this.box.object3D.position)
  
      this.box.setAttribute('material', {wireframe: true})
      
      //this.box.setAttribute('clickable-object', `#${this.el.id}`)
      this.el.appendChild(this.box)
    },
    
    // get the largest dimension of the model.  
    getModelBBox() {
  
      // compute a precise bounding box for this object.  This will handle the case where the
      // GLTF model includes multiple meshes.
      this.bbox.setFromObject(this.el.object3D, true)
      const boxSize = new THREE.Vector3()
  
      boxSize.subVectors(this.bbox.max, this.bbox.min)
  
      // expand the box to be a cube, while maintaining its center.
      const maxDim = Math.max(boxSize.x,
                              boxSize.y,
                              boxSize.z)
      const expandVector = new THREE.Vector3(maxDim - boxSize.x,
                                             maxDim - boxSize.y,
                                             maxDim - boxSize.z)
      expandVector.multiplyScalar(0.5)
      this.bbox.expandByVector(expandVector)
  
      // also record the max dimension of the box (to save recomputing it from the BBox)
      this.modelDimension = maxDim;
    }
  })
  
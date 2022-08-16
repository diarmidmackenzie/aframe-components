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
      
      this.sphere.setAttribute('raycast-target', `#${this.el.id}`)
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

  AFRAME.registerComponent('adjusted-model', {

    schema: {    
      gltfModel : {type : 'selector'},
      basis: {type: 'string', oneOf: 'box, sphere', default: 'box'}, // sphere not yet implemented
      dimension: {type: 'number'},
      center: {type: 'boolean', default: true},
      showBounds: {type: 'string', oneOf: 'none, box, cube, sphere', default: 'none'} // sphere not yet implemented
    },
  
    init() {
      this.bbox = new THREE.Box3();
      this.boxSize = new THREE.Vector3()
      this.modelDimension = 0;

      // Entity structure looks like:
      // -- this.el - has scale of 1, 1, 1.  Scale, position and rotation can be set directly without breakign adjustment
      //    |--this.adjuster  - has scale & position to adjust the model as required
      //       |--this.model  - the model loaded up with position & center as encoded in the GLTF
      //       |--this.box    - the geometry of the bounding box    (if desired)
      //       (not yet implemented)
      //       |--this.sphere - the geometry of the bounding sphere (if desired)
      //       |--this.ring   - the geometry of the ring used to render an outline of the bounding sphere (if desired)
      this.adjuster = document.createElement('a-entity')
      this.adjuster.setAttribute("id", `${this.el.id}-adjuster`)
      this.el.appendChild(this.adjuster)

      this.model = document.createElement('a-entity')
      this.model.addEventListener('model-loaded', () => this.onModelLoaded())
  
      this.model.setAttribute('gltf-model', `#${this.data.gltfModel.id}`)
      this.model.setAttribute('raycast-target', `#${this.el.id}`)
      this.adjuster.appendChild(this.model)
    },
  
    onModelLoaded() {
  
      this.getModelBBox()

      // Adjust the scale & position of the adjuster to scale and center the model as desired
      const modelScaleFactor = this.data.dimension / this.modelDimension
      this.adjuster.object3D.scale.set(modelScaleFactor,
                                       modelScaleFactor,
                                       modelScaleFactor)

      if (this.data.center) {
        this.bbox.getCenter(this.adjuster.object3D.position)
        this.adjuster.object3D.worldToLocal(this.adjuster.object3D.position)
        this.adjuster.object3D.position.multiplyScalar(-this.adjuster.object3D.scale.x)
      }
      
      if ((this.data.showBounds === 'box') ||
          (this.data.showBounds === 'cube')) {
        this.box = document.createElement('a-box')

        // Just match box to model - adjuster handles scale and position
        this.bbox.getCenter(this.box.object3D.position)
        this.adjuster.object3D.worldToLocal(this.box.object3D.position)

        if (this.data.showBounds === 'cube') {
            const boxDim = this.modelDimension
            this.box.object3D.scale.set(boxDim, boxDim, boxDim)
        }
        else {
            this.box.object3D.scale.set(this.boxSize.x, this.boxSize.y, this.boxSize.z)
        }
        
        this.box.setAttribute('polygon-wireframe', "")
        
        this.adjuster.appendChild(this.box)
      }
    },
    
    // get the largest dimension of the model.  
    getModelBBox() {
  
      // compute a precise bounding box for this object.  This will handle the case where the
      // GLTF model includes multiple meshes.
      this.bbox.setFromObject(this.model.object3D, true)
  
      this.boxSize.subVectors(this.bbox.max, this.bbox.min)
  
      // Record the max dimension of the box (to save recomputing it from the BBox)
      this.modelDimension = Math.max(this.boxSize.x,
                                     this.boxSize.y,
                                     this.boxSize.z)
    }
  })
  
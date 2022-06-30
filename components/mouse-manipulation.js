const GLOBAL_DATA = {
    tempMatrix: new THREE.Matrix4(),
    tempQuaternion: new THREE.Quaternion(),
}

// Change the parent of an object without changing its transform.
AFRAME.registerComponent('object-parent', {

    schema: {
        parent:     {type: 'selector'},    
    },
  
    update() {
        const object = this.el.object3D
        const oldParent = object.parent
        const newParent = this.data.parent.object3D
    
        if (object.parent === newParent) {
            return;
        }
    
        console.log(`Reparenting ${object.el.id} from ${oldParent.el ? oldParent.el.id : "unknown"} to ${newParent.el ? newParent.el.id : "unknown"}`);
        
        // make sure all matrices are up to date before we do anything.
        // this may be overkill, but ooptimizing for reliability over performance.
        oldParent.updateMatrixWorld();
        oldParent.updateMatrix();
        object.updateMatrix();
        newParent.updateMatrixWorld();
        newParent.updateMatrix();
        
        // Now update the object's matrix to the new frame of reference.
        GLOBAL_DATA.tempMatrix.copy(newParent.matrixWorld).invert();
        object.matrix.premultiply(oldParent.matrixWorld);
        object.matrix.premultiply(GLOBAL_DATA.tempMatrix);
        object.matrix.decompose(object.position, object.quaternion, object.scale);
        object.matrixWorldNeedsUpdate = true;
    
        // finally, change the object's parent.
        newParent.add(object);
    }
});

// Set on an entity to track the orientation of the cursor's ray.
// Typically set on a enitity that is a child of the camera that the cursor uses.
AFRAME.registerComponent('cursor-tracker', {

    schema: {
        cursor: {type: 'selector', default: "#cursor"},
        sphericalLocalBoundary: {type: 'number', default: 45}

    },

    init() {
        this.cursor = this.data.cursor
        this.raycaster = this.cursor.components['raycaster'].raycaster
        this.forward = new THREE.Vector3(0, 0, -1)
        this.cameraForward = new THREE.Vector3(0, 0, -1)
        this.cameraQuaternion = new THREE.Quaternion()
        
        
        this.rayQuaternionLocal = new THREE.Quaternion()
        this.rayQuaternionLocal.identity()
        this.rayQuaternionSpherical = new THREE.Quaternion()
        this.rayQuaternion = new THREE.Quaternion()
        this.rayQuaternion.identity()
        this.deltaWorldQuaternion = new THREE.Quaternion()
        this.lastRayForward = new THREE.Vector3(0, 0, -1)
        this.spherical = new THREE.Spherical()
        this.yAxis = new THREE.Vector3(0, 1, 0)
        this.xAxis = new THREE.Vector3(1, 0, 0)        
        this.yQuaternion = new THREE.Quaternion()
        this.xQuaternion = new THREE.Quaternion()
    },

    update() {
        this.slbRad = THREE.MathUtils.degToRad(this.data.sphericalLocalBoundary)
    },

    tick() {

        function setWorldQuaternion(object, quaternion) {

            const parentQuaternion = new THREE.Quaternion()
            object.parent.getWorldQuaternion(parentQuaternion)
            parentQuaternion.invert()
            object.quaternion.multiplyQuaternions(parentQuaternion, quaternion)
        }

        this.spherical.setFromVector3(this.raycaster.ray.direction)

        const localWeight = Math.abs(this.spherical.phi - Math.PI/2) / (Math.PI/2);

        console.log("localWeight", localWeight)

        // Compute spherical-based     
        this.xQuaternion.setFromAxisAngle(this.xAxis, this.spherical.phi - Math.PI/2)
        this.yQuaternion.setFromAxisAngle(this.yAxis, this.spherical.theta)
        this.rayQuaternionSpherical.multiplyQuaternions(this.yQuaternion, this.xQuaternion)
        this.rayQuaternionSpherical.normalize()
        
        // Compute delta-based
        this.deltaWorldQuaternion.setFromUnitVectors(this.lastRayForward, this.raycaster.ray.direction)
        //this.rayQuaternionLocal.copy(this.rayQuaternion)
        
        /* Only needed if averaging... 
        if (this.rayQuaternionLocal.angleTo(this.rayQuaternionSpherical) > (Math.PI / 2)) {
            this.rayQuaternionLocal.copy(this.rayQuaternionSpherical)
        } */
        // On reflection ,averaging is kind of worst of both worlds...
            
        this.rayQuaternionLocal.premultiply(this.deltaWorldQuaternion)
        this.rayQuaternionLocal.normalize()

        
        //this.rayQuaternion.copy(this.rayQuaternionSpherical)
        this.rayQuaternion.slerpQuaternions(this.rayQuaternionLocal, this.rayQuaternionSpherical, 0)
        //this.rayQuaternion.slerpQuaternions(this.rayQuaternionLocal, this.rayQuaternionSpherical, localWeight)

        setWorldQuaternion(this.el.object3D, this.rayQuaternion)
        this.lastRayForward.copy(this.raycaster.ray.direction)

        /* ... almost working...
        this.cameraForward.copy(this.forward)
        this.el.sceneEl.camera.updateMatrix()
        this.el.sceneEl.camera.getWorldQuaternion(this.cameraQuaternion)
        this.cameraForward.applyQuaternion(this.cameraQuaternion)
        this.el.object3D.quaternion.setFromUnitVectors(this.cameraForward, this.raycaster.ray.direction)*/
    }
});

// Add this to the same entity as the cursor component.
AFRAME.registerComponent('mouse-manipulation', {

    schema: {
        defaultParent: {type: 'selector'},
        rotateRate: {type: 'number', default: 45},
    },

    events: {
        mousedown: function(evt) { this.mouseDown(evt) }, 
        mouseup:  function(evt) { this.mouseUp(evt) }
    },
  
    update: function() {
  
        // internally store rotation rate as radians per event
        this.rotateRate = this.data.rotateRate * Math.PI / 180;
    },
  
    init() {
        // cursor must have an ID so that we can refence it when ataching an object-parent
        console.assert(this.el.id)
    
        // This is a rate per second.  We scale distance by this factor per second.
        // Take a root of this to get a scaling factor.
        this.moveSpeed = 3;
    
        // variable to track any grabbed element
        this.grabbedEl = null;
    
        // Object used as container for any entity that can be grabbed.
        // For mouse controls, this is a child of the camera.
        // (this helps with scaling, rotation etc. of grabbed entity)
        this.contactPoint = document.createElement('a-entity')
        this.contactPoint.setAttribute('id', `${this.el.id}-contact-point`)
        this.camera = document.querySelector('[cursor-tracker]')
        this.camera.appendChild(this.contactPoint)

        // for working
        this.vector1 = new THREE.Vector3()
        this.vector2 = new THREE.Vector3()
    },

    mouseDown(evt) {
  
        console.assert(!this.grabbedEl)
    
        const intersections = this.getIntersections(evt.target);
    
        if (intersections.length === 0)  return;
    
        const element = intersections[0]
    
        const intersectionData = this.el.components.raycaster.getIntersection(element)
    
        // reparent element to the camera.
        this.grabbedEl = element
        const grabbedPoint = this.el.object3D.worldToLocal(intersectionData.point)
        this.contactPoint.object3D.position.copy(grabbedPoint)
        element.setAttribute('object-parent', 'parent', `#${this.el.id}-contact-point`)
    },

    mouseUp() {
  
        if (!this.grabbedEl) return
    
        this.grabbedEl.setAttribute('object-parent', 'parent', `#${this.data.defaultParent.id}`)
        this.grabbedEl = null
    },

    getIntersections(cursorEl) {
  
        const els = cursorEl.components.raycaster.intersectedEls
        return els
    },
  /*
    // Implements moving out or in (in = -ve)
    moveOut(timeDelta) {
      const scalar = Math.pow(this.moveSpeed, timeDelta/1000);
      this.contactPoint.object3D.position.multiplyScalar(scalar)
    },*/
  
      /*
    tick: function(time, timeDelta) {
      
      
      if (this.el.is("moving-in")) {
        this.moveOut(-timeDelta);
      }
      else if (this.el.is("moving-out")) {
        this.moveOut(timeDelta);
      }
  
      if (this.el.is("rotating-y-plus")) {
        this.contactPoint.object3D.rotation.y += timeDelta * this.rotateRate / 1000;
      }
      else if (this.el.is("rotating-y-minus")) {
        this.contactPoint.object3D.rotation.y -= timeDelta * this.rotateRate / 1000;
      }
    }*/
});
  
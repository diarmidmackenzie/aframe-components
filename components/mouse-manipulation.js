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
  
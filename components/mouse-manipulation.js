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
// To fix:
// - Must drop object on *all* mouseup events (not just when hitting object)
// - Move in is moving child in wrong direction (too low)
// - New control schemme: middle button, right button.
AFRAME.registerComponent('mouse-manipulation', {

    schema: {
        defaultParent: {type: 'selector'},
        rotateRate: {type: 'number', default: 45},
        debug: {type: 'boolean', default: true}
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
        this.grabbedElWorldPosition = new THREE.Vector3();

        // We create 2 children beneath the camera
        // - cursorTracker.  This is set up to match the orientation of the cursor
        //                   (which does not match the camera, when using rayOrigin: mouse)
        this.camera = document.querySelector('[camera]')
        this.cursorTracker = document.createElement('a-entity')
        this.cursorTracker.setAttribute('cursor-tracker', "")
        this.camera.appendChild(this.cursorTracker)

        // A container for any entity that can be grabbed.
        // For mouse controls, this is a child of the cursor tracker.
        // (this helps with move in/out, rotation etc. of grabbed entity)
        this.cursorContactPoint = document.createElement('a-entity')
        this.cursorContactPoint.setAttribute('id', `${this.el.id}-cursor-contact-point`)
        if (this.data.debug) {
            this.cursorContactPoint.setAttribute('geometry', "primitive:box; height:0.1; width: 0.1; depth:0.1")
            this.cursorContactPoint.setAttribute('material', "color: blue")
        }
        
        this.cursorTracker.appendChild(this.cursorContactPoint)

        // A container for any entity that can be grabbed.
        // This is a child of the camera, for controls where the object
        // shouldn't follow the mouse pointer, e.g. rotation.
        // (this helps with move in/out, rotation etc. of grabbed entity)
        this.cameraContactPoint = document.createElement('a-entity')
        this.cameraContactPoint.setAttribute('id', `${this.el.id}-camera-contact-point`)
        if (this.data.debug) {
            this.cameraContactPoint.setAttribute('geometry', "primitive:box; height:0.1; width: 0.1; depth:0.1")
            this.cameraContactPoint.setAttribute('material', "color: red")
        }
        this.camera.appendChild(this.cameraContactPoint)

        // for working
        this.vector1 = new THREE.Vector3()
        this.vector2 = new THREE.Vector3()

        this.mouseWheel = this.mouseWheel.bind(this)
        this.windowMouseUp = this.windowMouseUp.bind(this)
        this.windowMouseDown = this.windowMouseDown.bind(this)
        this.windowMouseMove = this.windowMouseMove.bind(this)
        window.addEventListener('wheel', this.mouseWheel);
        window.addEventListener('mouseup', this.windowMouseUp);
        window.addEventListener('mousedown', this.windowMouseDown);
        window.addEventListener('mousemove', this.windowMouseMove);
        window.addEventListener('contextmenu', event => event.preventDefault());

        // Quaternions & axes used to manage rotation
        this.xAxis = new THREE.Vector3(0, 0, 0)
        this.yAxis = new THREE.Vector3(0, 1, 1)
        this.zAxis = new THREE.Vector3(0, 0, 1)
        this.yawQuaternion = new THREE.Quaternion();
        this.pitchQuaternion = new THREE.Quaternion();
        this.rollQuaternion = new THREE.Quaternion();
        this.yawStartQuaternion = new THREE.Quaternion();
        this.pitchStartQuaternion = new THREE.Quaternion();
        this.rollStartQuaternion = new THREE.Quaternion();
        this.deltaQuaternion = new THREE.Quaternion();

        // state of mouse buttons
        this.lbDown = false
        this.mbDown = false
        this.rbDown = false

        // adjustments to control ratio of mouse pixels to radians for otations.
        this.radiansPerMousePixel = 0.01
    },

    windowMouseDown(evt) {

        // we are looking for the original mouseEvent, which has details of buttons pressed
        // And we need to have registered an element to be grabbed.
        if (evt.buttons === undefined) return;
        if (!this.grabbedEl) return;

        this.recordMouseButtonsState(evt)

        if (this.lbDown) {
            // left button is pressed (either just pressed or already down) 
            // - grab to cursor contact point
            this.grabElToContactPoint(this.cursorContactPoint,
                                          `#${this.el.id}-cursor-contact-point`)

        }
        else {
            // right or middle button - grab to camera contact point
            this.grabElToContactPoint(this.cameraContactPoint,
                                      `#${this.el.id}-camera-contact-point`)
        }

        // Mouse movements
        if (evt.button === 2) {
            // right button
            this.startYaw(evt.clientX)
        }
    },

    windowMouseUp(evt) {
        // we are looking for the original mouseEvent, which has details of buttons pressed
        // And we need to have a grabbed element.
        if (evt.buttons === undefined) return;
        if (!this.grabbedEl) return;

        this.recordMouseButtonsState(evt)

        // Reparenting
        if (this.lbDown) {
            // left button is still down
            // leave attached to cursor contact point.
        }
        else if (evt.buttons === 0){
            // no button now pressed.
            this.releaseEl()
        }
        else if (evt.button === 0) {
            // left button released, but right or middle button still down 
            // - grab to camera contact point
            this.grabElToContactPoint(this.cameraContactPoint,
                                      `#${this.el.id}-camera-contact-point`)
        }

        // Mouse movements
        if (evt.button === 2) {
            // right button
            this.endYaw(evt.clientX)
        }
    },

    recordMouseButtonsState(evt) {
        this.lbDown = (evt.buttons & 1)
        this.mbDown = (evt.buttons & 4)
        this.rbDown = (evt.buttons & 2)
    },

    windowMouseMove(evt) {

        let updateRotation = false

        if (this.rbDown) {
            this.updateYaw(evt.clientX)
            updateRotation = true
        }

        if (updateRotation) this.updateRotation()
    },

    remove() {
        window.removeEventListener('wheel', this.mouseWheel);
    },

    // records details of grabbed ovject, but actual grabbing is deferred to be handled on MouseEvent
    // based on detail about which button is pressed (not avalable on this event)
    mouseDown(evt) {
  
        const intersections = this.getIntersections(evt.target);
    
        if (intersections.length === 0)  return;
    
        const element = intersections[0]
        const newGrabbedEl = element.components['clickable'].target

        if (this.grabbedEl && 
            this.grabbedEl !== newGrabbedEl) {
            console.warn("Grabbed 2nd element without releasing the first:", newGrabbedEl.id, this.grabbedEl.id)
        }

        this.grabbedEl = newGrabbedEl
        this.grabbedEl.object3D.getWorldPosition(this.grabbedElWorldPosition)
    },

    grabElToContactPoint(contactPoint, contactPointSelector) {

        // set up a contact point at the position of the grabbed entity
        const pos = contactPoint.object3D.position
        pos.copy(this.grabbedElWorldPosition)
        contactPoint.object3D.parent.worldToLocal(pos)
        this.grabbedEl.setAttribute('object-parent', 'parent', contactPointSelector)
    },

    releaseEl() {
        const contactPoint = this.grabbedEl.object3D.parent
        this.grabbedEl.setAttribute('object-parent', 'parent', `#${this.data.defaultParent.id}`)
        this.grabbedEl = null
        contactPoint.position.set(0, 0, 0)
        
    },

    mouseUp() {
        // all work done on MouseEvent, where we have detail as to *which* button is pressed.
    },

    getIntersections(cursorEl) {
  
        const els = cursorEl.components.raycaster.intersectedEls
        return els
    },

    mouseWheel(evt) {

        if (!this.grabbedEl) return
        this.moveOut(-evt.deltaY)
    },
  
    // Implements moving out or in (in = -ve)
    moveOut(timeDelta) {
      const scalar = Math.pow(this.moveSpeed, timeDelta/1000);
      this.cursorContactPoint.object3D.position.multiplyScalar(scalar)
    },

    startYaw(xPos) {
        this.yawStart = xPos
        this.yawStartQuaternion.copy(this.cameraContactPoint.object3D.quaternion)
    },

    updateYaw(xPos) {
        console.assert(this.yawStart !== null)        
        const delta = (xPos - this.yawStart) * this.radiansPerMousePixel
        this.deltaQuaternion.setFromAxisAngle(this.yAxis, delta)
        if (this.data.debug) logQuaternion("deltaQuaternion", this.deltaQuaternion)

        this.yawQuaternion.copy(this.deltaQuaternion)
        this.yawQuaternion.multiplyQuaternions(this.yawStartQuaternion, this.deltaQuaternion)
        if (this.data.debug) logQuaternion("yawQuaternion", this.deltaQuaternion)
    },

    endYaw(xPos) {
        this.updateYaw(xPos)
        this.yawStart = null
        this.yawStartQuaternion.identity()
    },

    // update the rotation of the camera contact point, to reflect latest yaw, pitch and roll.
    updateRotation() {

        const ccpQuaternion = this.cameraContactPoint.object3D.quaternion
        ccpQuaternion.copy(this.yawQuaternion)
        ccpQuaternion.multiply(this.pitchQuaternion)
        ccpQuaternion.multiply(this.rollQuaternion)

        if (this.data.debug) {
            logQuaternion("yawQuaternion", this.yawQuaternion)
            logQuaternion("pitchQuaternion", this.pitchQuaternion)
            logQuaternion("rollQuaternion", this.rollQuaternion)
            logQuaternion("ccpQuaternion", this.ccpQuaternion)
        }
    },

    logQuaternion(text, quat) {
        
        const logtext = `${text} w: ${quat.w.toFixed(dp)}, x: ${quat.x.toFixed(dp)}, y: ${quat.y.toFixed(dp)}, z: ${quat.z.toFixed(dp)}\n`
        const euler = new THREE.Euler(0,0,0)
        euler.setFromQuaternion(quat);
        logtext += `Equivalent Euler: x: ${euler.x.toFixed(dp)}, y: ${euler.y.toFixed(dp)}, z: ${euler.z.toFixed(dp)}\n`;
        console.log(logtext);
    }
  
      /*
    tick: function(time, timeDelta) {
      
      
      if (this.el.is("moving-in")) {
        this.moveOut(-timeDelta);
      }
      else if (this.el.is("moving-out")) {
        this.moveOut(timeDelta);
      }
  
      if (this.el.is("rotating-y-plus")) {
        this.cursorContactPoint.object3D.rotation.y += timeDelta * this.rotateRate / 1000;
      }
      else if (this.el.is("rotating-y-minus")) {
        this.cursorContactPoint.object3D.rotation.y -= timeDelta * this.rotateRate / 1000;
      }
    }*/
});
  

AFRAME.registerComponent('mouse-pitch-yaw', {

    init: function () {
  
        this.xQuaternion = new THREE.Quaternion();
        this.yQuaternion = new THREE.Quaternion();
        this.yAxis = new THREE.Vector3();
        this.xAxis = new THREE.Vector3(1, 0, 0);
        this.unusedVector = new THREE.Vector3();
    
        // Mouse 2D controls.
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mousedown', this.onMouseDown);
    },
  
    onMouseDown: function (evt) {
        this.oldClientX = evt.clientX;
        this.oldClientY = evt.clientY;
    },
  
    onMouseUp: function (evt) {
        if (evt.buttons === undefined || evt.buttons !== 0) { return; }
        this.oldClientX = undefined;
        this.oldClientY = undefined;
    },
  
    onMouseMove: function (evt) {
        this.rotateModel(evt);
    },
  
    rotateModel: function (evt) {
        var dX;
        var dY;
    
        if (!this.oldClientX) { return; }
        dX = this.oldClientX - evt.clientX;
        dY = this.oldClientY - evt.clientY;
    
        // xAxis for rotation is fixed.
        // yAxis comes from target object.
        this.el.object3D.matrix.extractBasis(this.unusedVector, this.yAxis, this.unusedVector);
        this.xQuaternion.setFromAxisAngle(this.yAxis, -dX / 400)
        this.yQuaternion.setFromAxisAngle(this.xAxis, -dY / 400)
    
        this.el.object3D.quaternion.premultiply(this.xQuaternion);
        this.el.object3D.quaternion.premultiply(this.yQuaternion);
    
        this.oldClientX = evt.clientX;
        this.oldClientY = evt.clientY;
    }
});
  
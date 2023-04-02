require('aframe-object-parent')
require('aframe-thumbstick-states')

AFRAME.registerComponent('laser-manipulation', {

    schema: {
      rotateRate: {type: 'number', default: 45},
      center: {type: 'string', default: 'center', oneOf: ['center','contact']},
      grabEvents: {type: 'boolean', default: false},
      grabEvent: {type: 'string', default: 'laserGrab'},
      releaseEvent: {type: 'string', default: 'laserRelease'}
    },
  
    update: function() {
  
      // internally store rotation rate as radians per event
      this.rotateRate = this.data.rotateRate * Math.PI / 180;
    },
  
    init() {
      // controller must have an ID so that
      console.assert(this.el.id)
  
      // This is a rate per second.  We scale distance by this factor per second.
      // Take a root of this to get a scaling factor.
      this.moveSpeed = 3;
  
      // set up listeners
      this.triggerUp = this.triggerUp.bind(this)
      this.triggerDown = this.triggerDown.bind(this)
      this.el.addEventListener('triggerup', this.triggerUp)
      this.el.addEventListener('triggerdown', this.triggerDown)
  
      // variable to track any grabbed element
      this.grabbedEl = null;
  
      // child object used as container for any entity that can be grabbed.
      // (this helps with scaling, rotation etc. of grabbed entity)
      this.contactPoint = document.createElement('a-entity')
      this.contactPoint.setAttribute('id', `${this.el.id}-contact-point`)
      this.el.appendChild(this.contactPoint)

    },

    /* Code below is duplicated from mouse-manipulation - should be commonized */

    // Ensure an element has a usable ID.
    // If it has no ID, add one.
    // If it has an ID but it's not usable to identify the element...
    // ...log an error (preferable to creating confusion by modifying existing IDs)
    assureUsableId(el) {

        if (!el.id) {
            // No ID, just set one
            el.setAttribute("id", Math.random().toString(36).slice(10))
        }
        else {
            const reference = document.getElementById(el.id)
            if (reference !== el) {
                console.error(`Element ID for ${el.id} does not unambiguously identify it.  Check for duplicate IDs.`)
            }
        }
    },

    // Get scene graph parent element of an element.
    // Includes the case where the parent is the a-scene.
    getParentEl(el) {

        const parentObject = el.object3D.parent

        if (parentObject.type === 'Scene') {
            return(this.el.sceneEl)
        }
        else {
            return parentObject.el
        }
    },

    /* Code above is duplicated from mouse-manipulation - should be commonized */

    triggerDown(evt) {
  
      console.assert(!this.grabbedEl)
  
      const intersections = this.getIntersections(evt.target);
  
      if (intersections.length === 0)  return;
  
      const element = intersections[0]
  
      const intersectionData = this.el.components.raycaster.getIntersection(element)
  
      // Save record of original parent, and make sure it has a usable ID.
      if (!this.originalParentEl) {
        this.originalParentEl = this.getParentEl(element)
      }
      this.assureUsableId(this.originalParentEl)

      // set up a contact point at the position of the grabbed entity
      if (this.data.center === "center") {
        // attach to entity center
        const pos = this.contactPoint.object3D.position
        element.object3D.getWorldPosition(pos)
        this.contactPoint.object3D.parent.worldToLocal(pos)
      }
      else {
        // attach to ray's contact point with entity
        const contactPoint = this.el.object3D.worldToLocal(intersectionData.point)
        this.contactPoint.object3D.position.copy(contactPoint)
      }

      // reparent element to this controller.
      element.setAttribute('object-parent', 'parent', `#${this.el.id}-contact-point`)

      // store reference to grabbed element
      this.grabbedEl = element

      if (this.data.grabEvents) {
        this.grabbedEl.emit(this.data.grabEvent)
      }
    },
  
    triggerUp() {
  
      if (!this.grabbedEl) return
  
      this.grabbedEl.setAttribute('object-parent', 'parent', `#${this.originalParentEl.id}`)
      this.grabbedEl = null

      if (this.data.grabEvents) {
        this.grabbedEl.emit(this.data.releaseEvent)
      }
    },
  
    getIntersections(controllerEl) {
  
      const els = controllerEl.components.raycaster.intersectedEls
      return els
    },
  
    // Implements moving out or in (in = -ve)
    moveOut(timeDelta) {
      const scalar = Math.pow(this.moveSpeed, timeDelta/1000);
      this.contactPoint.object3D.position.multiplyScalar(scalar)
    },
  
    
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

      if (this.el.is("rotating-x-plus")) {
        this.contactPoint.object3D.rotation.x += timeDelta * this.rotateRate / 1000;
      }
      else if (this.el.is("rotating-x-minus")) {
        this.contactPoint.object3D.rotation.x -= timeDelta * this.rotateRate / 1000;
      }
    }
  });
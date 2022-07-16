
AFRAME.registerComponent('laser-manipulation', {

    schema: {
  
      defaultParent: {type: 'selector'},
      rotateRate: {type: 'number', default: 45},
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
  
    triggerDown(evt) {
  
      console.assert(!this.grabbedEl)
  
      const intersections = this.getIntersections(evt.target);
  
      if (intersections.length === 0)  return;
  
      const element = intersections[0]
  
      const intersectionData = this.el.components.raycaster.getIntersection(element)
  
      // reparent element to this controller.
      this.grabbedEl = element
      const grabbedPoint = this.el.object3D.worldToLocal(intersectionData.point)
      this.contactPoint.object3D.position.copy(grabbedPoint)
      element.setAttribute('object-parent', 'parent', `#${this.el.id}-contact-point`)
    },
  
    triggerUp() {
  
      if (!this.grabbedEl) return
  
      this.grabbedEl.setAttribute('object-parent', 'parent', `#${this.data.defaultParent.id}`)
      this.grabbedEl = null
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
    }
  });
if (!AFRAME.components['object-parent']) require('aframe-object-parent')
if (!AFRAME.components['thumbstick-states']) require('aframe-thumbstick-states')

const _xTargetAxis = new THREE.Vector3()
const _yTargetAxis = new THREE.Vector3()
const _zTargetAxis = new THREE.Vector3()
const _unused = new THREE.Vector3()
const _matrix = new THREE.Matrix4()

const _quaternion = new THREE.Quaternion()
const _worldQuaternion = new THREE.Quaternion()


AFRAME.registerComponent('laser-manipulation', {

    schema: {
      rotateRate: {type: 'number', default: 45},
      center: {type: 'string', default: 'center', oneOf: ['center','contact']},
      grabEvents: {type: 'boolean', default: false},
      grabEvent: {type: 'string', default: 'laserGrab'},
      releaseEvent: {type: 'string', default: 'laserRelease'},
      controlMethod: {type: 'string', default: 'parent', oneOf: ['parent', 'transform']}
    },
  
    update() {
  
      // internally store rotation rate as radians per event
      this.rotateRate = this.data.rotateRate * Math.PI / 180;

      if (this.data.debug) {
        this.contactPoint.setAttribute('debug-axes', '')
      }
      else {
        this.contactPoint.removeAttribute('debug-axes')
      }
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

      this.lastContactPointTransform = new THREE.Object3D()
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
  
      const intersections = this.getIntersections(evt.target)
  
      if (intersections.length === 0)  return;
  
      const element = this.getRaycastTarget(intersections[0])
  
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
      
      _zTargetAxis.copy(this.el.components.raycaster.raycaster.ray.direction)   
      this.el.object3D.matrixWorld.extractBasis(_unused, _yTargetAxis, _unused)
      _yTargetAxis.projectOnPlane(_zTargetAxis).normalize()
      _xTargetAxis.crossVectors(_yTargetAxis, _zTargetAxis)
      _matrix.makeBasis(_xTargetAxis, _yTargetAxis, _zTargetAxis)
      _worldQuaternion.setFromRotationMatrix(_matrix)
      
      this.setWorldQuaternion(this.contactPoint.object3D, _worldQuaternion)

      // reparent element to this controller.
      if (this.data.controlMethod === 'parent') {
        this.activeControlMethod = 'parent'
        element.setAttribute('object-parent', 'parent', `#${this.el.id}-contact-point`)
      }
      else {
        this.activeControlMethod = 'transform'
        this.saveContactPointTransform()
      }

      // store reference to grabbed element
      this.grabbedEl = element

      if (this.data.grabEvents) {
        this.grabbedEl.emit(this.data.grabEvent)
      }
    },
  
    triggerUp() {
  
      if (!this.grabbedEl) return
  
      if (this.activeControlMethod === 'parent') {
        this.grabbedEl.setAttribute('object-parent', 'parent', `#${this.originalParentEl.id}`)
      }
      
      if (this.data.grabEvents) {
        // defer event to next schedule, to allow reparenting to have completed.
        const releasedEl = this.grabbedEl
        setTimeout(() => {
          releasedEl.emit(this.data.releaseEvent)
        })
      }
      this.grabbedEl = null
      this.activeControlMethod = ''
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

    getRaycastTarget(el) {
      if (el.components['raycast-target']) {
          return el.components['raycast-target'].target
      }
      else {
          return el
      }
    },

    setWorldQuaternion(object, quaternion) {
      
      object.parent.getWorldQuaternion(_quaternion);
      _quaternion.invert();
      quaternion.premultiply(_quaternion);
      object.quaternion.copy(quaternion);
    },

    saveContactPointTransform() {
      const transform = this.lastContactPointTransform
      transform.quaternion.identity()
      transform.position.set(0, 0, 0)
      transform.scale.set(1, 1, 1)
      this.contactPoint.object3D.add(transform)
      this.el.sceneEl.object3D.attach(transform)
    },

    followContactPoint() {
      const object = this.grabbedEl.object3D
      this.lastContactPointTransform.attach(object)
      this.saveContactPointTransform()
      this.originalParentEl.object3D.attach(object)
    },
    
    tick: function(time, timeDelta) {

      if (this.activeControlMethod === 'transform') {
        this.followContactPoint()
      }
      
      if (this.el.is("moving-in")) {
        this.moveOut(-timeDelta);
      }
      else if (this.el.is("moving-out")) {
        this.moveOut(timeDelta);
      }
  
      const angle = timeDelta * this.rotateRate / 1000
      const contactPoint = this.contactPoint.object3D
      if (this.el.is("rotating-y-plus")) {
        contactPoint.rotateY(angle)
      }
      else if (this.el.is("rotating-y-minus")) {
        contactPoint.rotateY(-angle)
      }

      if (this.el.is("rotating-x-plus")) {
        contactPoint.rotateX(angle)
        /*
        _quaternion.setFromAxisAngle(_xAxis, angle)
        contactQuaternion.premultiply(_quaternion)*/
      }
      else if (this.el.is("rotating-x-minus")) {
        contactPoint.rotateX(-angle)
        /*_quaternion.setFromAxisAngle(_xAxis, -angle)
        contactQuaternion.premultiply(_quaternion)*/
      }
    }
  });

  AFRAME.registerComponent("debug-axes", {

    init() {
  
      this.addAxis('red', '0 0 0')
      this.addAxis('green', '0 0 90')
      this.addAxis('blue', '0 -90 0')
    },
  
    addAxis(color, rotation) {
  
      const axisHtml = `
      <a-entity rotation="${rotation}"
      line__adjustment-axis="start: -0.1 0 0;
                              end: 0.1 0 0;
                              color: ${color}">
        <a-cone radius-bottom=0.01;
                radius-top=0;
                height=0.02;
                color="${color}";
                position="0.1 0 0";
                rotation="0 0 -90">
        </a-cone>
      </a-entity>`
  
      this.el.insertAdjacentHTML('beforeend', axisHtml)
    }
  })
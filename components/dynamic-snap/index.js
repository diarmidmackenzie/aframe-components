require('aframe-polygon-wireframe')

AFRAME.registerComponent("dynamic-snap", {

    schema: {
      grabEvent: {type: 'string', default: 'mouseGrab'},
      releaseEvent: {type: 'string', default: 'mouseRelease'}
    },

    init() {

      this.snapStart = this.snapStart.bind(this)
      this.snapEnd = this.snapEnd.bind(this)
      this.grabbed = this.grabbed.bind(this)
      this.released = this.released.bind(this)
      
      this.projectedEl = document.createElement('a-entity')
      const geometry = this.el.getAttribute('geometry')
      this.projectedEl.setAttribute('geometry', geometry)
      this.projectedEl.setAttribute('polygon-wireframe', {color: 'yellow', onTop: true})
      this.projectedEl.object3D.visible = false
      this.el.sceneEl.appendChild(this.projectedEl)
      this.snappable = false
      this.elGrabbed = false

    },

    addEventListeners() {
      this.el.addEventListener('snapStart', this.snapStart)
      this.el.addEventListener('snapEnd', this.snapEnd)
      this.el.addEventListener(this.data.grabEvent, this.grabbed)
      this.el.addEventListener(this.data.releaseEvent, this.released)
    },

    removeEventListeners() {
      this.el.removeEventListener('snapStart', this.snapStart)
      this.el.removeEventListener('snapEnd', this.snapEnd)
      this.el.removeEventListener(this.data.grabEvent, this.grabbed)
      this.el.removeEventListener(this.data.releaseEvent, this.released)
    },

    pause() {
      this.removeEventListeners()
    },

    play() {
      this.addEventListeners()
    },

    snapStart(evt) {

      this.snappable = true

      if (this.elGrabbed) {
        this.showProjectedObject(evt.detail.worldTransform)
      }
    },

    snapEnd(evt) {

      const transform = evt.detail.transform
      this.snappable = false
    },

    showProjectedObject(worldTransform) {
      
      const projectedObject = this.projectedEl.object3D

      projectedObject.position.copy(worldTransform.position)
      projectedObject.quaternion.copy(worldTransform.quaternion)
      projectedObject.scale.copy(worldTransform.scale)
      projectedObject.visible = true

    },

    hideProjectedObject() {

      this.projectedEl.object3D.visible = false
    },

    grabbed() {

      this.elGrabbed = true
      if (this.snappable) {
        this.showProjectedObject(this.projectedEl.object3D) 
      }
    },

    released() {

      this.elGrabbed = false

      if (this.snappable) {

        // this object takes transform of projected object, while keeping current parent.
        const object = this.el.object3D
        const parent = object.parent
        const projectedObject = this.projectedEl.object3D

        object.matrix.identity()
        object.matrix.decompose(object.position, object.quaternion, object.scale)
        projectedObject.add(object)
        parent.attach(object)

        this.hideProjectedObject()
      }
    }
})
require('aframe-polygon-wireframe')

AFRAME.registerComponent("dynamic-snap", {

    schema: {

    },

    events: {
      snapStart(e) { this.snapStart(e) },
      snapEnd(e) { this.snapEnd(e) },
      snapGrabbed(e) { this.grabbed(e) },
      snapReleased(e) { this.released(e) },
    },

    init() {

      this.projectedEl = document.createElement('a-entity')
      const geometry = this.el.getAttribute('geometry')
      this.projectedEl.setAttribute('geometry', geometry)
      this.projectedEl.setAttribute('polygon-wireframe', {color: 'yellow', onTop: true})
      this.projectedEl.object3D.visible = false
      this.el.sceneEl.appendChild(this.projectedEl)
      this.snappable = false

    },

    snapStart(evt) {

      this.showProjectedObject(evt.detail.worldTransform)
      this.snappable = true
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

      if (this.snappable) {
        this.showProjectedObject(this.projectedEl.object3D) 
      }
    },

    released() {
      if (this.snappable) {

        // this object takes transform of projected object, while keeping current parent.
        const object = this.el.object3D
        const parent = object.parent
        const projectedObject = this.projectedEl.object3D

        object.matrix.identity()
        object.matrix.decompose(object.position, object.quaternion, object.scale)
        projectedObject.add(object)
        parent.attach(object)

        hideProjectedObject()
      }
    }
})
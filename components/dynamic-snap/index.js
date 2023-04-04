if (!AFRAME.components['polygon-wireframe']) require('aframe-polygon-wireframe')

AFRAME.registerComponent("dynamic-snap", {

    schema: {
      divergeEvent: {type: 'string', default: 'mouseGrab'},
      convergeEvent: {type: 'string', default: 'mouseRelease'},
      renderSnap: {type: 'string', oneOf: ['object', 'wireframe', 'transparent', 'none'], default: 'transparent'},
      renderPrecise: {type: 'string', oneOf: ['object', 'wireframe', 'transparent', 'none'], default: 'object'},
      wireframeColor: { default: 'yellow' },
      opacity: { default: 0.5 },
    },

    init() {

      this.snapStart = this.snapStart.bind(this)
      this.snapEnd = this.snapEnd.bind(this)
      this.diverge = this.diverge.bind(this)
      this.converge = this.converge.bind(this)
      this.configureThisEl('object')
      this.projectedEl = document.createElement('a-entity')
      this.configureProjectedEl()
      this.el.sceneEl.appendChild(this.projectedEl)
      this.snappable = false
      this.diverged = false

      this.hideProjectedObject()
    },

    configureProjectedEl() {

      const mesh = this.el.getObject3D('mesh')

      if (mesh) {

        const projectedMesh = mesh.clone(true)
        this.projectedEl.setObject3D('mesh', projectedMesh)

        this.setMaterials(this.projectedEl, projectedMesh, this.data.renderSnap)
      }
      else {
        this.el.addEventListener('model-loaded', () => this.configureProjectedEl())
      }
    },

    configureThisEl(renderString) {

      const mesh = this.el.getObject3D('mesh')

      if (mesh) {

        this.setMaterials(this.el, mesh, renderString)
      }
      else {
        this.el.addEventListener('model-loaded', () => {
          this.configureThisEl(renderString)
        })
      }
    },

    setMaterials(el, mesh, renderString) {

      const switchMaterials = (object, transparent) => {

        const material = object.material
        if (!material) return
        const type = material.userData.type

        if (!type) {
          // uncloned material
          material.userData.type = 'original'
          const transparentClone = material.clone()
          transparentClone.opacity = this.data.opacity
          transparentClone.transparent = true
          transparentClone.userData.type = 'transparentClone'
          transparentClone.userData.original = material
          material.userData.transparentClone = transparentClone
        }
        else if (type === 'original') {
          if (transparent) {
            object.material = material.userData.transparentClone
          }
        }
        else if (type === 'transparentClone') {
          if (!transparent) {
            object.material = material.userData.original
          }
        }
      }

      if (renderString === 'wireframe') {
        el.setAttribute('polygon-wireframe', {color: this.data.wireframeColor, onTop: true})
      }
      else {
        el.removeAttribute('polygon-wireframe')
      }

      if (renderString === 'transparent') {
        mesh.traverse((o) => {
          switchMaterials(o, true)
        })
      }
      else {
        mesh.traverse((o) => {
          switchMaterials(o, false)
        })
      }

      if (renderString === 'none' || renderString === 'wireframe') {
        // polygon-wireframe sets original mesh visibility to false.  Don't mess with this.
        mesh.visible = false
      }
      else {
        mesh.visible = true
      }
    },

    addEventListeners() {
      this.el.addEventListener('snapStart', this.snapStart)
      this.el.addEventListener('snapEnd', this.snapEnd)
      this.el.addEventListener(this.data.divergeEvent, this.diverge)
      this.el.addEventListener(this.data.convergeEvent, this.converge)
    },

    removeEventListeners() {
      this.el.removeEventListener('snapStart', this.snapStart)
      this.el.removeEventListener('snapEnd', this.snapEnd)
      this.el.removeEventListener(this.data.divergeEvent, this.diverge)
      this.el.removeEventListener(this.data.convergeEvent, this.converge)
    },

    pause() {
      this.removeEventListeners()
    },

    play() {
      this.addEventListeners()
    },

    snapStart(evt) {

      //console.log("Snap Start: ", evt.detail.worldTransform.position)
      this.snappable = true

      if (this.diverged) {
        this.showProjectedObject(evt.detail.worldTransform)
      }
    },

    snapEnd(evt) {

      this.snappable = false

      if (this.diverged) {
        this.hideProjectedObject()
      }
    },

    showProjectedObject(worldTransform) {
      
      const projectedObject = this.projectedEl.object3D

      projectedObject.position.copy(worldTransform.position)
      projectedObject.quaternion.copy(worldTransform.quaternion)
      projectedObject.scale.copy(worldTransform.scale)
      projectedObject.visible = true

      // switch precise object to configured view.
      this.configureThisEl(this.data.renderPrecise)
    },

    hideProjectedObject() {

      this.projectedEl.object3D.visible = false

      // switch precise object to standard visibility.
      this.configureThisEl('object')
    },

    diverge() {

      this.diverged = true
      if (this.snappable) {
        this.showProjectedObject(this.projectedEl.object3D) 
      }
    },

    converge() {

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

        this.el.emit('snapped-to-position')
      }

      this.diverged = false
    }
})
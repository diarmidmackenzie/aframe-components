/* global AFRAME THREE */
(() => {

  const _startVector = new THREE.Vector3()
  const _endVector = new THREE.Vector3()
  const _lineVector = new THREE.Vector3()
  const _posVector = new THREE.Vector3()
  const _deltaVector = new THREE.Vector3()
  const _lineDirectionVector = new THREE.Vector3()
  const _up = new THREE.Vector3(0, 1, 0)

  AFRAME.registerComponent('connecting-line', {

    schema: {
        start: {type: 'selector'},
        startOffset: {type: 'vec3', default:  {x: 0, y: 0, z: 0}},
        end: {type: 'selector'},
        endOffset: {type: 'vec3', default:  {x: 0, y: 0, z: 0}},
        color: {type: 'color', default: '#74BEC1'},
        opacity: {type: 'number', default: 1},
        visible: {default: true},
        lengthAdjustment: {default: "none", oneOf: ["none", "scale", "extend", "absolute"]},
        lengthAdjustmentValue: {type: 'number'},
        width: {type: 'number'},
        segments: {type: 'number', default: 4},
        shader: {type: 'string', default: 'flat'},
        updateEvent: {type: 'string', default: ''}
    },

    multiple: true,

    init() {
      this.cylinder = null
      this.listenerData = {
        event: '',
        start: null,
        end: null
      }

      this.updateLinePosition = this.updateLinePosition.bind(this)
    },
    update() {

      if (!this.data.start || !this.data.end) {
        this.remove()
        return
      }

      this.el.setAttribute(`line__${this.attrName}`,
                            {
                              color: this.data.color,
                              opacity: this.data.opacity,
                              visible: this.data.visible
                            })

      if (this.data.width > 0) {

        if (!this.cylinder) {
          this.cylinder = document.createElement('a-cylinder')
          this.el.appendChild(this.cylinder)
        }
        this.cylinder.setAttribute('radius', this.data.width / 2)
        this.cylinder.setAttribute('segments-radial', this.data.segments)
        this.cylinder.setAttribute('segments-height', 1)
        this.cylinder.setAttribute('material',
                                   {
                                      shader: this.data.shader,
                                      color: this.data.color,
                                      opacity: this.data.opacity,
                                      visible: this.data.visible
                                   })
      }
      else if (this.cylinder) {
        this.el.removeChild(this.cylinder)
        this.cylinder = null
      }

      this.updateEventListeners()

      // initial update should be deferred until scene load has completed.
      setTimeout(this.updateLinePosition)
    },


    updateEventListeners() {

      if (!this.data.updateEvent ||
          (this.listenerData.event && 
           this.data.updateEvent !== this.listenerData.event)) {
        this.removeEventListeners()
      }

      if (this.data.updateEvent) {
        this.addAndTrackEventListeners()
      }
    },

    addAndTrackEventListeners() {
      const { data, listenerData } = this
      
      if (data.start) {
        data.start.addEventListener(data.updateEvent, this.updateLinePosition)
      }
      
      if (data.end) {
        data.end.addEventListener(data.updateEvent, this.updateLinePosition)
      }
      
      this.el.addEventListener(data.updateEvent, this.updateLinePosition)

      listenerData.event = data.updateEvent
      listenerData.start = data.start
      listenerData.end = data.end
    },

    removeEventListeners() {
      const { listenerData } = this
      
      if (listenerData.start) {
        listenerData.start.removeEventListener(listenerData.event, this.updateLinePosition)
      }
      if (listenerData.end) {
        listenerData.start.removeEventListener(listenerData.event, this.updateLinePosition)
      }
      this.el.removeEventListener(listenerData.event, this.updateLinePosition)
    },

    remove() {
      this.el.removeAttribute(`line__${this.attrName}`)
      if(this.cylinder) {
        this.el.removeChild(this.cylinder)
        this.cylinder = null
      }
      this.removeEventListeners()
    },

    // Position is updated on a tick() to accommodate movement of entities, which may
    // not be in the object hierarchy above the entity that the line is configured on.
    
    adjustLength(start, end) {
      const { lengthAdjustment } = this.data
      const delta = _deltaVector
      
      switch (lengthAdjustment) {
        case "none":
          return

        case "scale": {
          const lengthFactor = this.data.lengthAdjustmentValue
          if (!lengthFactor) return
          delta.subVectors(end, start)
          const scaleExtension = 1 + ((lengthFactor - 1) / 2)
          delta.multiplyScalar(scaleExtension)
          break
        }

        case "extend": {
          const extension = this.data.lengthAdjustmentValue
          if (!extension) return
          delta.subVectors(end, start)
          delta.normalize()
          delta.multiplyScalar(-extension)
          break
        }

        case "absolute": {
          const targetLength = this.data.lengthAdjustmentValue
          if (!targetLength) return
          delta.subVectors(end, start)
          const currentLength = delta.length()
          if (currentLength === 0) return
          const absExtension = ((targetLength / currentLength) - 1) / 2
          delta.multiplyScalar(-absExtension)
          break
        }

        default:
          console.error("Unexpected value for lengthAdjustment: ", lengthAdjustment)
          return
      }

      start.addVectors(start, delta)
      end.subVectors(end, delta)
    },
    
    tick() {
      if (this.data.updateEvent) return
      this.updateLinePosition()
    },

    updateLinePosition() {
      // Because calls to this function can be deferred, handle race condition where component has
      // already been removed.
      if (!this.data) return
      if (!this.data.start || !this.data.end) {
        this.remove()
        return
      }

      const start = _startVector
      const end = _endVector

      // transform start & end vectors to local space.
      start.copy(this.data.startOffset)
      this.data.start.object3D.updateMatrixWorld()
      this.data.start.object3D.localToWorld(start)
      this.el.object3D.worldToLocal(start)

      end.copy(this.data.endOffset)
      this.data.end.object3D.updateMatrixWorld()
      this.data.end.object3D.localToWorld(end)
      this.el.object3D.worldToLocal(end)

      this.adjustLength(start, end)

      this.el.setAttribute(`line__${this.attrName}`,
                           `start: ${start.x} ${start.y} ${start.z};
                            end: ${end.x} ${end.y} ${end.z}`)

      if (this.cylinder) {
        _lineVector.subVectors(end, start)
        _posVector.addVectors(start, end).multiplyScalar(0.5)
        _lineDirectionVector.copy(_lineVector).normalize()

        const object = this.cylinder.object3D
        object.position.copy(_posVector)
        object.quaternion.setFromUnitVectors(_up, _lineDirectionVector)
        this.cylinder.setAttribute('height', _lineVector.length())
      }
    }
  })
})()

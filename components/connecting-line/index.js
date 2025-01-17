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
        lengthAdjustmentValue: {type: 'number'}
    },

    multiple: true,

    init() {
        this.startVector = new THREE.Vector3()
        this.endVector = new THREE.Vector3()
        this.lineVector = new THREE.Vector3()
    },

    update() {

        this.el.setAttribute(`line__${this.attrName}`,
                             {
                                color: this.data.color,
                                opacity: this.data.opacity,
                                visible: this.data.visible
                             })
    },

    remove() {
        this.el.removeAttribute(`line__${this.attrName}`)
    },

    // Position is updated on a tick() to accommodate movement of entities, which may
    // not be in the object hierarchy above the entity that the line is configured on.
    
    adjustLength(start, end) {
      const { lengthAdjustment } = this.data
      const line = this.lineVector
      
      switch (lengthAdjustment) {
        case "none":
          return

        case "scale":
          const lengthFactor = this.data.lengthAdjustmentValue
          if (!lengthFactor) return
          line.subVectors(end, start)
          const scaleExtension = 1 + ((lengthFactor - 1) / 2)
          line.multiplyScalar(scaleExtension)
          break

        case "extend":
          const extension = this.data.lengthAdjustmentValue
          if (!extension) return
          line.subVectors(end, start)
          line.normalize()
          line.multiplyScalar(-extension)
          break

        case "absolute":
          const targetLength = this.data.lengthAdjustmentValue
          if (!targetLength) return
          line.subVectors(end, start)
          const currentLength = line.length()
          if (currentLength === 0) return
          const absExtension = ((targetLength / currentLength) - 1) / 2
          line.multiplyScalar(-absExtension)
          break

        default:
          console.error("Unexpected value for lengthAdjustment: ", lengthAdjustment)
          return
      }

      start.addVectors(start, line)
      end.subVectors(end, line)
    },
    
    tick() {

        const start = this.startVector
        const end = this.endVector
        const line = this.lineVector

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
    }
})
AFRAME.registerComponent('connecting-line', {

    schema: {
        start: {type: 'selector'},
        startOffset: {type: 'vec3', default:  {x: 0, y: 0, z: 0}},
        end: {type: 'selector'},
        endOffset: {type: 'vec3', default:  {x: 0, y: 0, z: 0}},
        color: {type: 'color', default: '#74BEC1'},
        opacity: {type: 'number', default: 1},
        visible: {default: true}
    },

    multiple: true,

    init() {
        this.startVector = new THREE.Vector3()
        this.endVector = new THREE.Vector3()
    },

    update() {

        this.el.setAttribute(`line__${this.attrName}`,
                             {
                                color: this.data.color,
                                opacity: this.data.opacity,
                                visible: this.data.visible
                             })
    },

    // Position is updated on a tick() to accommodate movement of entities, which may
    // not be in the object hierarchy above the entity that the line is configured on.
    tick() {

        const start = this.startVector
        const end = this.endVector

        // transform start & end vectors to local space.
        start.copy(this.data.startOffset)
        this.data.start.object3D.localToWorld(start)
        this.el.object3D.worldToLocal(start)
        
        end.copy(this.data.endOffset)
        this.data.end.object3D.localToWorld(end)
        this.el.object3D.worldToLocal(end)

        this.el.setAttribute(`line__${this.attrName}`, 
                             `start: ${start.x} ${start.y} ${start.z};
                              end: ${end.x} ${end.y} ${end.z}`)
    }
})
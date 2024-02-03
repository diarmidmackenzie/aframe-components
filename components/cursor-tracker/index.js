// Set on an entity to track the orientation of the cursor's ray.
// Typically set on a entity that is a child of the camera that the cursor uses.
AFRAME.registerComponent('cursor-tracker', {

    schema: {
        cursor: {type: 'selector', default: "#cursor"},
    },

    init() {
        this.cursor = this.data.cursor
        this.raycaster = this.cursor.components['raycaster'].raycaster
        this.forward = new THREE.Vector3(0, 0, -1)
        this.localRayVector = new THREE.Vector3();
    },

    tick() {

        // Get ray direction vector in the space of this object.
        this.el.object3D.getWorldPosition(this.localRayVector)
        this.localRayVector.add(this.raycaster.ray.direction)
        this.el.object3D.parent.worldToLocal(this.localRayVector)
        this.localRayVector.normalize()        
        this.el.object3D.quaternion.setFromUnitVectors(this.forward, this.localRayVector)
    }
});

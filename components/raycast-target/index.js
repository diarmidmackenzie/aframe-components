
// Component used to mark an entity for raycasting, and optionally provide 
// another entity as a target (e.g. useful when raycasting against a low-poly mesh, rather than the target itself)
//
// Note that setting a target here doesn't change which entity will generate raycast / cursor events.
// Applications written using cursor/raycaster need to be written to check for this configurattion and act on it.

AFRAME.registerComponent('raycast-target', {
    schema: {type: 'selector'},

    init() {
        this.target = this.data ? this.data : this.el
    }
})

AFRAME.registerComponent("ngon-wireframe", {

    schema: {
        color: { type: 'color', default: 'white'}
    },

    init() {

        const baseGeometry = this.el.getObject3D('mesh').geometry
        if (!baseGeometry) {
            console.warn("ngon-wireframe: no base geometry found")
        };

        const edges = new THREE.EdgesGeometry( baseGeometry );
        const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: this.data.color } ) );
        this.el.object3D.add( line );

        this.el.getObject3D('mesh').visible = false;
    }
})
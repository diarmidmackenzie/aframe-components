AFRAME.registerComponent("ngon-wireframe", {

    schema: {
        color: { type: 'color', default: 'grey' },
        dashed: { type: 'boolean', default: false },
        dashSize: { type: 'number', default: 3 },
        gapSize: { type: 'number', default: 1 },
        dashScale: { type: 'number', default: 30 }
    },

    init() {

        const baseGeometry = this.el.getObject3D('mesh').geometry
        if (!baseGeometry) {
            console.warn("ngon-wireframe: no base geometry found")
        };

        const edges = new THREE.EdgesGeometry( baseGeometry );
        var material;
        if (!this.data.dashed) {
            material = new THREE.LineBasicMaterial( { color: this.data.color } )
        }
        else {
            material = new THREE.LineDashedMaterial( { color: this.data.color,
                                                       dashSize: this.data.dashSize,
                                                       gapSize: this.data.gapSize,
                                                       scale: this.data.dashScale } )
        }
        
        const line = new THREE.LineSegments( edges, material );        
        line.computeLineDistances();

        this.el.object3D.add( line );

        this.el.getObject3D('mesh').visible = false;
    }
})
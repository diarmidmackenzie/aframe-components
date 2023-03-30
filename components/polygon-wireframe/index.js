AFRAME.registerComponent("polygon-wireframe", {

    schema: {
        color: { type: 'color', default: 'grey' },
        dashed: { type: 'boolean', default: false },
        dashSize: { type: 'number', default: 3 },
        gapSize: { type: 'number', default: 1 },
        dashScale: { type: 'number', default: 30 },
        onTop: {type: 'boolean', default: false}
    },

    init() {
      const baseGeometry = this.el.getObject3D('mesh').geometry
      if (!baseGeometry) {
          console.warn("polygon-wireframe: no base geometry found")
      };

      this.edges = new THREE.EdgesGeometry( baseGeometry );
    },

    update() {

        const oldMaterial = this.material
        const oldLine = this.line

        if (!this.data.dashed) {
            this.material = new THREE.LineBasicMaterial( { color: this.data.color } )
        }
        else {
            this.material = new THREE.LineDashedMaterial( { color: this.data.color,
                                                            dashSize: this.data.dashSize,
                                                            gapSize: this.data.gapSize,
                                                            scale: this.data.dashScale } )
        }

        if (this.data.onTop) {
          const material = this.material
          material.depthWrite = false
          material.depthTest = false
          material.toneMapped = false
          material.transparent = true
        }
        
        this.line = new THREE.LineSegments( this.edges, this.material );
        this.line.computeLineDistances();

        this.el.object3D.add( this.line );

        this.el.getObject3D('mesh').visible = false;

        // dispose of old material & line
        if (oldMaterial) {
          oldMaterial.dispose()
        }
        if (oldLine) {
          oldLine.removeFromParent()
        }
    }
})
AFRAME.registerComponent("polygon-wireframe", {

    schema: {
        color: { type: 'color', default: 'grey' },
        opacity: { type: 'number', default: 1 },
        hiddenOpacity: { type: 'number', default: 0 },
        dashed: { type: 'boolean', default: false },
        dashSize: { type: 'number', default: 3 },
        gapSize: { type: 'number', default: 1 },
        dashScale: { type: 'number', default: 30 },
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
      const oldHiddenMaterial = this.hiddenMaterial
      const oldHiddenLine = this.hiddenLine

      const data = this.data

      this.material = this.createLineMaterial(data.color, data.opacity)

      if (data.hiddenOpacity !== 0 && 
          data.hiddenOpacity !== data.opacity) {
        // separate material needed for hidden parts
        this.hiddenMaterial = this.createLineMaterial(data.color, data.hiddenOpacity)

        if (data.hiddenOpacity > data.opacity) {
          console.warn("Opacity of hidden parts cannot be higher than the opacity of non-hidden parts")
          console.warn("Wireframe will be rendered with opacity ", data.hiddenOpacity, " as set on hiddenOpacity property.")
        }
      }
      else {
        this.hiddenMaterial = null
      }

      if (data.hiddenOpacity !== 0) {
        const material = this.hiddenMaterial || this.material
        material.depthWrite = false
        material.depthTest = false
        material.toneMapped = false
      }
      
      this.line = new THREE.LineSegments( this.edges, this.material );
      this.line.computeLineDistances();
      this.el.object3D.add( this.line );

      if (this.hiddenMaterial) {
        this.hiddenLine = new THREE.LineSegments( this.edges, this.hiddenMaterial );
        this.hiddenLine.computeLineDistances();
        this.el.object3D.add( this.hiddenLine );
      }

      this.el.getObject3D('mesh').visible = false;

      // dispose of any old materials & lines
      function removeLineAndMaterial(line, material) {
        if (line) {
          line.removeFromParent()
        }
        if (material) {
          material.dispose()
        }
      }
      removeLineAndMaterial(oldLine, oldMaterial)
      removeLineAndMaterial(oldHiddenLine, oldHiddenMaterial)
    },

    createLineMaterial(color, opacity) {

      const data = this.data
      let material
      if (!data.dashed) {
          material = new THREE.LineBasicMaterial( { color: color } )
      }
      else {
          material = new THREE.LineDashedMaterial( { color: color,
                                                     dashSize: data.dashSize,
                                                     gapSize: data.gapSize,
                                                     scale: data.dashScale } )
      }
      material.opacity = opacity
      if (opacity !== 1) {
        material.transparent = true
      }

      return material
    },

    remove() {
      this.el.getObject3D('mesh').visible = true;
      this.material.dispose()
      this.line.removeFromParent()
    }
})
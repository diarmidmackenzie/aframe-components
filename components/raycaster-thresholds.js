
AFRAME.registerComponent('raycaster-thresholds', {

    dependencies: ['raycaster'],

    schema: {
        line: {type: 'number', default: 0.01},
        points: {type: 'number', default: 0.01},
    },

    init() {
        this.oldLine = this.el.components.raycaster.raycaster.params.Line.threshold
        this.oldPoints = this.el.components.raycaster.raycaster.params.Points.threshold

        this.el.components.raycaster.raycaster.params.Line.threshold = this.data.line
        this.el.components.raycaster.raycaster.params.Points.threshold = this.data.points
    },

    remove() {
        this.el.components.raycaster.raycaster.params.Line.threshold = this.oldLine
        this.el.components.raycaster.raycaster.params.Points.threshold = this.oldPoints
    }
})
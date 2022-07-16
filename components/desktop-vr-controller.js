
AFRAME.registerComponent('desktop-vr-controller', {

    dependencies: ['oculus-touch-controls'],

    init() {
        this.simulateController = this.simulateController.bind(this)
        this.removeController = this.removeController.bind(this)

        this.el.sceneEl.addEventListener('enter-vr', this.simulateController)
        this.el.sceneEl.addEventListener('exit-vr', this.removeController)
    },

    simulateController() {

        const scene = this.el.sceneEl
        this.trackedControlsSystem = scene && scene.systems['tracked-controls-webxr']
        if (!this.trackedControlsSystem) { 
            console.warn("No tracked-controls-webxr system found for desktop-vr-controller")
            return false;
        }

        // determine which hand based on oculus-touch-controls config.
        oculusData = this.el.components['oculus-touch-controls'].data

        if (!oculusData) {
            console.warn("No oculus-touch-controls component found for desktop-vr-controller")
            return;
        }

        this.controllerData = {hand: oculusData.hand, handedness: oculusData.hand, profiles: ['oculus-touch-controls', 'oculus-touch-v3']}

        this.trackedControlsSystem.controllers.push(this.controllerData)

        scene.emit('controllersupdated');

        this.el.setAttribute('clickable', `#${this.el.id}`)
    },

    removeController() {

        console.log("Removing controller:", this.controllerData)
        console.log("Current Controllers:", this.trackedControlsSystem.controllers)

        const index = this.trackedControlsSystem.controllers.findIndex(x => (x === this.controllerData))

        console.log("Find index: ", index)
        if (index >= 0) {
            this.trackedControlsSystem.controllers.splice(index)
        }
        
        this.el.sceneEl.emit('controllersupdated');
    }
})


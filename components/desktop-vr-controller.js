
AFRAME.registerComponent('desktop-vr-controller', {

    dependencies: ['oculus-touch-controls'],

    init() {
        this.simulateController = this.simulateController.bind(this)
        this.removeController = this.removeController.bind(this)
        this.keyUp = this.keyUp.bind(this)
        this.keyDown = this.keyDown.bind(this)

        this.el.sceneEl.addEventListener('enter-vr', this.simulateController)
        this.el.sceneEl.addEventListener('exit-vr', this.removeController)

        this.labels = {}
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

        if (this.controllerData.hand == 'left') {
            this.keyBindings = {'ShiftLeft' : 'trigger',
                                 'ControlLeft': 'grip',
                                 'KeyX': 'xbutton',
                                 'KeyY': 'ybutton'}
            this.labels['trigger'] = this.createLabel("L-Shift", "trigger")
            this.labels['grip'] = this.createLabel("L-Ctrl", "grip")
            this.labels['xbutton'] = this.createLabel("X", "xbutton")
            this.labels['ybutton'] = this.createLabel("Y", "ybutton")

        }
        else {
            this.keyBindings = {'ShiftRight' : 'trigger',
                                'ControlRight': 'grip',
                                'KeyA': 'abutton',
                                'KeyB': 'bbutton'}

            this.labels['trigger'] = this.createLabel("R-Shift", "trigger")
            this.labels['grip'] = this.createLabel("R-Ctrl", "grip")
            this.labels['abutton'] = this.createLabel("A", "abutton")
            this.labels['bbutton'] = this.createLabel("B", "bbutton")
        }

        window.addEventListener('keyup', this.keyUp)
        window.addEventListener('keydown', this.keyDown)
    },

    createLabel(text, positionIdentifier) {

        var pos;
        var offset;

        if (this.controllerData.hand == 'left') {

            switch (positionIdentifier) {
                case "trigger":
    
                    pos = "0.015 -0.02 0.01"
                    offset = "0.1 0 -0.2"
                    break;
    
                case "grip":
                    pos = "0.015 -0.02 0.06"
                    offset = "0.25 0 0"
                    break;
    
                case "xbutton":
                    pos = "0.017 0.005 0.045"
                    offset = "-0.2 0.2 0"
                    break;
    
                case "ybutton":
                    pos = "0.022 0.005 0.03"
                    offset = "-0.15 0.2 -0.1"
                    break;

                default:
                    console.error(`unexpected position identifier: ${positionIdentifier}`)
                    break;
            }
        }
        else {
            switch (positionIdentifier) {
                case "trigger":
    
                    pos = "-0.015 -0.02 0.01"
                    offset = "-0.1 0 -0.2"
                    break;
    
                case "grip":
                    pos = "-0.015 -0.02 0.06"
                    offset = "-0.25 0 0"
                    break;
    
                case "abutton":
                    pos = "-0.017 0.005 0.045"
                    offset = "0.2 0.2 0"
                    break;
    
                case "bbutton":
                    pos = "-0.022 0.005 0.03"
                    offset = "0.15 0.2 -0.1"
                    break;

                default:
                    console.error(`unexpected position identifier: ${positionIdentifier}`)
                    break;
            }
        }

        const anchor = document.createElement("a-entity")
        anchor.setAttribute("position", pos)
        anchor.setAttribute("label-anchor", `offsetVector: ${offset}; lineColor: green`)
        
        const label = document.createElement("a-entity")
        label.setAttribute("label", {overwrite: true, forceDesktopMode: true});
        anchor.appendChild(label)

        // add all in one go so that label reference can be resolved by anchor
        this.el.appendChild(anchor)

        const button = document.createElement('a-plane')
        button.setAttribute("width", text.length > 2 ? 0.2 : 0.1)
        button.setAttribute("height", 0.1)
        button.setAttribute("color", "black")
        button.setAttribute("text", `value:${text};
                                     color: white;
                                     wrapCount: ${text.length + 2};
                                     align: center;
                                     anchor: center`)
        label.appendChild(button)

        return(anchor)
    },

    removeLabels() {

        Object.entries(this.labels).forEach(([key, label]) => {
            label.parentNode.removeChild(label);
        })

        this.labels = {}
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

        window.removeEventListener('keyup', this.keyUp)
        window.removeEventListener('keydown', this.keyDown)

        this.removeLabels()
    },

    keyUp(evt) {

        const binding = this.keyBindings[evt.code]

        if (binding) {
            this.el.emit(`${binding}up`)
            this.el.emit(`${binding}changed`)

            this.labels[binding].setAttribute("label-anchor", "lineColor: green")
            this.labels[binding].querySelector("a-plane").setAttribute("color", "black")
        }
    },

    keyDown(evt) {

        const binding = this.keyBindings[evt.code]

        if (binding) {
            this.el.emit(`${binding}down`)
            this.el.emit(`${binding}changed`)

            this.labels[binding].setAttribute("label-anchor", "lineColor: yellow")
            this.labels[binding].querySelector("a-plane").setAttribute("color", "grey")
        }
    }
})



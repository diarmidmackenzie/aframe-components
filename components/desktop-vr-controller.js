
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

        // If there is an XR session (real or simulated), do nothing.
        const xrSession = this.el.sceneEl.renderer.xr.getSession()
        if (xrSession) {
            console.log("desktop-vr-controller suppressed due to presence of an XR session")
            return;
        }

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
                                 'KeyY': 'ybutton',
                                 'Digit1': 'thumbstick'}
            this.labels['trigger'] = this.createLabel("L-Shift", "trigger")
            this.labels['grip'] = this.createLabel("L-Ctrl", "grip")
            this.labels['xbutton'] = this.createLabel("X", "xbutton")
            this.labels['ybutton'] = this.createLabel("Y", "ybutton")
            this.labels['thumbstick'] = this.createLabel("1", "thumbstick")

        }
        else {
            this.keyBindings = {'ShiftRight' : 'trigger',
                                'ControlRight': 'grip',
                                'KeyV': 'abutton',
                                'KeyB': 'bbutton',
                                'Digit2': 'thumbstick'}

            this.labels['trigger'] = this.createLabel("R-Shift", "trigger")
            this.labels['grip'] = this.createLabel("R-Ctrl", "grip")
            this.labels['abutton'] = this.createLabel("V", "abutton")
            this.labels['bbutton'] = this.createLabel("B", "bbutton")
            this.labels['thumbstick'] = this.createLabel("2", "thumbstick")
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
                    offset = "0.0 0.1 0.1"
                    break;
    
                case "ybutton":
                    pos = "0.022 0.005 0.03"
                    offset = "0.0 0.2 -0.1"
                    break;

                case "thumbstick":
                    pos = "0.001 0.015 0.03"
                    offset = "-0.1 0.2 -0.1"
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
                    offset = "0.0 0.1 0.1"
                    break;
    
                case "bbutton":
                    pos = "-0.022 0.005 0.03"
                    offset = "0.0 0.2 -0.1"
                    break;

                case "thumbstick":
                    pos = "-0.001 0.015 0.03"
                    offset = "0.1 0.2 -0.1"
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
        if (positionIdentifier ==="thumbstick") {
            button.setAttribute("desktop-vr-thumbstick", "")
        }

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

            if (binding !== "thumbstick") {
                this.el.emit(`${binding}up`)
                this.el.emit(`${binding}changed`)

            }
            else {
                this.labels[binding].querySelector("[desktop-vr-thumbstick]").setAttribute("desktop-vr-thumbstick", "active: false")
            }

            this.labels[binding].setAttribute("label-anchor", "lineColor: green")
            this.labels[binding].querySelector("a-plane").setAttribute("color", "black")
        }
    },

    keyDown(evt) {

        if (evt.repeat) return;

        const binding = this.keyBindings[evt.code]

        if (binding) {

            if (binding !== "thumbstick") {

                this.el.emit(`${binding}down`)
                this.el.emit(`${binding}changed`)
            }
            else {
                this.labels[binding].querySelector("[desktop-vr-thumbstick]").setAttribute("desktop-vr-thumbstick",
                                                                                           `active: true;
                                                                                            controller: #${this.el.id}`)
            }

            this.labels[binding].setAttribute("label-anchor", "lineColor: yellow")
            this.labels[binding].querySelector("a-plane").setAttribute("color", "grey")
        }
    }
})

AFRAME.registerComponent('desktop-vr-thumbstick', {

    schema: {
        active: {type: 'boolean', default: false},
        controller: {type: 'selector'}
    },

    init() {

        this.dimension = 100;
        this.radius = 0.5;
        
        const camera = this.el.sceneEl.camera;

        this.mouseMove = this.mouseMove.bind(this)
        this.mouseDown = this.mouseDown.bind(this)
        this.mouseUp = this.mouseUp.bind(this)
        this.startMouseX = undefined
        this.startMouseY = undefined
        this.thumbstickVector = new THREE.Vector2()

        this.base =  document.createElement("a-circle")
        this.base.setAttribute("radius", this.radius)
        this.base.setAttribute("id", Math.random().toString(36).slice(2))
        this.base.setAttribute("material", "color:black; shader: flat")
        this.base.object3D.visible = false;
        
        camera.el.appendChild(this.base)

        this.stick = document.createElement("a-circle")
        this.stick.setAttribute("material", "color:#bbb; shader: flat")
        this.stick.setAttribute("radius", this.radius * 0.6)
        this.stick.object3D.position.set(0, 0, 0.00001)
        this.base.appendChild(this.stick)

        this.line = document.createElement("a-entity")
        this.line.object3D.visible = false
        this.el.sceneEl.appendChild(this.line)

        window.addEventListener("mousemove", this.mouseMove)
        window.addEventListener("mouseup", this.mouseUp)
        window.addEventListener("mousedown", this.mouseDown)
    },

    update() {

        if (this.data.active) {
            
            this.base.setAttribute("screen-display", {position: "pixels",
                                                      scale: "pixels",
                                                      width:this.dimension,
                                                      xpos: this.startMouseX,
                                                      ypos: this.startMouseY})
            this.base.object3D.visible = true;

            this.line.setAttribute("connecting-line",
                                    `start: #${this.data.controller.id};
                                    startOffset: 0 0.015 0.03;
                                    end: #${this.base.id};
                                    endOffset: 0 0 0;
                                    color: yellow`)
            this.line.object3D.visible = true
        }
        else {
            this.base.object3D.visible = false;
            this.startMouseX = undefined
            this.startMouseY = undefined
            this.line.removeAttribute("connecting-line")
            this.line.object3D.visible = false
        }
    },

    remove() {
        window.removeEventListener("mousemove", this.mouseMove)
    },

    mouseMove(evt) {

        if (this.data.active) {
            // Thumbstick control active - handle movement.
            xDiff = (evt.clientX - this.startMouseX) / (this.dimension * 0.375)
            yDiff = (evt.clientY - this.startMouseY) / (this.dimension * 0.375)

            this.thumbstickVector.set(xDiff, yDiff)
            this.thumbstickVector.clampLength(0, 1)

            this.updateDisplay()
            this.generateEvents()
        }
        else {
            // Not yet active - just track latest start position.
            this.startMouseX = evt.clientX
            this.startMouseY = evt.clientY
        }
    },

    updateDisplay() {
        this.stick.object3D.position.x = this.thumbstickVector.x * this.radius * 0.75
        this.stick.object3D.position.y = -this.thumbstickVector.y * this.radius * 0.75
    },

    generateEvents() {
        this.data.controller.emit("thumbstickmoved", this.thumbstickVector)
    },

    mouseDown() {
        if (this.data.active) {
            this.stick.setAttribute("material", "color:#888; shader: flat")
            this.data.controller.emit("thumbstickdown")
            this.data.controller.emit("thumbstickchanged")
        }
    },

    mouseUp() {
        if (this.data.active) {
            this.stick.setAttribute("material", "color:#bbb; shader: flat")
            this.data.controller.emit("thumbstickup")
            this.data.controller.emit("thumbstickchanged")
        }
    }
});


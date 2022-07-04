
AFRAME.registerComponent('label', {

    schema: {
        // Should the label overwrite objects that are in front of it in space?
        overwrite: {type: 'boolean', default: false}
    },

    init() {
        this.enterVR = this.enterVR.bind(this)
        this.exitVR = this.exitVR.bind(this)

        this.el.addEventListener('enter-vr', this.enterVR);
        this.el.addEventListener('exit-vr', this.exitVR);
    },

    update() {
        if (this.el.sceneEl.is('vr-mode')) {
            this.enterVR()
        }
        else {
            this.exitVR()
        }
    },

    enterVR: function() {
        this.el.setAttribute("face-camera", {fixedSize: false,
                                             spriteMode: false,
                                             overwrite: this.data.overwrite});
    },

    exitVR: function() {
        this.el.setAttribute("face-camera", {fixedSize: true,
                                             spriteMode: true,
                                             overwrite: this.data.overwrite});
    }
});

// Makes an element always face directly to the camera.
// Like a THREE.js sprite, but usable with any geometry, not just a PNG.
AFRAME.registerComponent('face-camera', {

    schema: {
        // Keep the element a fixed size on camera regardless of distance.
        // This works well on desktop, but is disorienting in VR.
        // fixedSize assumes the entity is scaled at 1, 1, 1.
        fixedSize: {type: 'boolean', default: false},
        
        // If using a perspecive camera, face back with a normal that exactly reverses the gaze
        // direction of the camera.
        // If this is false, the label simply faces directly at the camera
        // (this looks good in VR, but gives a distorting effect on a 2D screen).
        // For an orthographic camera, we always use sprite Mode
        spriteMode: {type: 'boolean', default: false},

        // Should the label overwrite objects that are in front of it in space?
        overwrite: {type: 'boolean', default: false}
    },

    init: function() {
        this.cameraWorldPosition = new THREE.Vector3();
        this.objectWorldPosition = new THREE.Vector3();
        this.cameraQuaternion = new THREE.Quaternion();
        this.spriteDistanceVector = new THREE.Vector3();
        this.cameraDirectionVector = new THREE.Vector3();
        this.spriteWorldQuaternion = new THREE.Quaternion();


        this.object3DSet = this.object3DSet.bind(this)

        if (this.data.overwrite) {
            this.el.addEventListener('object3dset', this.object3DSet)
        }
    },

    object3DSet(evt) {

        const mesh = this.el.getObject3D(evt.detail.type)
        mesh.material.depthTest=false;
        mesh.material.depthWrite=false;
    },

    tick: function() {
        const camera = this.el.sceneEl.camera;

        if (this.data.spriteMode ||
            camera.isOrthographicCamera) {

            // On an Orthographic camera, we always use Sprite mode, as this matches how other geometry
            // is rendered.
            this.cameraQuaternion.setFromRotationMatrix(camera.matrixWorld);

            this.el.object3D.updateMatrixWorld();
            this.el.object3D.parent.getWorldQuaternion(this.spriteWorldQuaternion);
            this.spriteWorldQuaternion.invert();
            this.el.object3D.quaternion.copy(this.spriteWorldQuaternion);
            this.el.object3D.quaternion.multiply(this.cameraQuaternion);
        }
        else {
            // Can't use getWorldPosition on camera, as it doesn't work in VR mode.
            // See: https://github.com/mrdoob/three.js/issues/18448
            this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
            this.el.object3D.lookAt(this.cameraWorldPosition);
        }

        if (this.data.fixedSize) {
            if (camera.isPerspectiveCamera)
            {
                if (this.data.spriteMode) {
                    // in sprite mode, we just take the distance along the main camera axis.
                    this.cameraDirectionVector.set(0, 0, -1);
                    this.cameraDirectionVector.transformDirection(camera.matrixWorld);

                    this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
                    this.el.object3D.getWorldPosition(this.objectWorldPosition)
                    this.spriteDistanceVector.subVectors(this.objectWorldPosition,
                                                         this.cameraWorldPosition)

                    this.spriteDistanceVector.projectOnVector(this.cameraDirectionVector)
                    const distance = this.spriteDistanceVector.length();

                    this.el.object3D.scale.set(distance, distance, distance);
                }
                else {
                    this.el.object3D.getWorldPosition(this.objectWorldPosition)
                    const distance = this.objectWorldPosition.distanceTo(this.cameraWorldPosition)
                    this.el.object3D.scale.set(distance, distance, distance);
                }
            }
            else {
                this.el.object3D.scale.set(1, 1, 1);
            }
        }
    }
});

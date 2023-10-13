import { RealityAccelerator } from 'ratk';

AFRAME.registerComponent('anchored', {

  schema: {
    persistent: {default: true}, 
    debug: {default: false}
  },

  init() {

    components = document.querySelectorAll('[anchored]')

    if (components.length > 1) {
      console.warn("Only one 'anchored' component is permitted per scene.  Nothing will be anchored")
      console.warn(`The following ${components.lengt} entities have the 'anchored' component configured:`, components)
      return
    }

    const renderer = this.el.sceneEl.renderer
    const scene = this.el.sceneEl.object3D
    this.ratk = new RealityAccelerator(renderer.xr);
    scene.add(this.ratk.root);

    this.onEnterVR = this.onEnterVR.bind(this)
    this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR)

    this.createAnchor = false
  },

  update(oldData) {

    if (this.data.pesrsistent != oldData.persistent) {

      if (this.data.debug) console.log(`re-creating anchor to change persistence`) 

      this.unAnchor(false)
      this.reAnchor()
    }
  },

  onEnterVR() {

    const {ratk} = this
    const scene = this.el.sceneEl.object3D

    if (!this.anchorsSupported()) {
      console.warn("Anchors not supported in this browser.")
      return
    }
    ratk.restorePersistentAnchors().then(() => {

      if (ratk.anchors.size > 1) {
        console.warn(`Multiple anchors recorded for this scene (${ratk.anchors.size} in total): Unexpected`)
        ratk.anchors.forEach((anchor) => {
          console.warn("Unexpected anchor", anchor)
        })
        this.deleteAllAnchors()
        if (this.data.debug) console.log("Anchors now all deleted")
        return
      }

      if (ratk.anchors.size === 1) {
        // one existing anchor.  Modify rig transform to reflect this.
        const anchoredObject = this.el.object3D
        
        ratk.anchors.forEach((anchor) => {
          // position the rig correctly, by attaching it to the anchor
          // (modifies transform)
          // and then adding it to the scene (no modification to transform)
          if (this.data.debug) {
            console.log("Anchor restored at...")
            console.log("Position:", anchor.position)
            console.log("Quaternion:", anchor.quaternion)
          }

          anchor.add(this.el.object3D)
        })
      }
      else {
        // no existing anchor - create one at next opportunity
        // (creation needs access to XRFrame, so happens on next tick)
        this.createAnchor = true
      }
    })
  },

  deleteAllAnchors() {
    const {ratk} = this
    if (this.data.debug) console.log(`deleting ${ratk.anchors.size} anchors`)
    
    ratk.anchors.forEach((anchor) => {
      console.log(anchor.anchorID);
      ratk.deleteAnchor(anchor);
    });
  },

  unAnchor(resetPosition) {

    if (this.data.debug) console.log("un-anchoring")
    const scene = this.el.sceneEl.object3D

    if (resetPosition) {
      scene.add(this.el.object3D)
    }
    else {
      scene.attach(this.el.object3D)
    }
    
    this.deleteAllAnchors()
  },

  reAnchor() {

    if (this.data.debug) console.log("re-anchoring")
    this.onEnterVR()
  },

  anchorsSupported() {
    const sceneEl = this.el.sceneEl
    const xr = sceneEl.renderer.xr
    const session = xr.getSession()

    return (session && 
            session.restorePersistentAnchor)
  },

  tick() {

    const {ratk} = this
    const scene = this.el.sceneEl.object3D

    if (this.createAnchor) {
    

      ratk.createAnchor(scene.position,
                        scene.quaternion,
                        this.data.persistent).then((anchor) => {
        if (this.data.debug) {
          console.log("Anchor created at...")
          console.log("Position:", anchor.position)
          console.log("Quaternion:", anchor.quaternion)
        }

        anchor.attach(this.el.object3D)
      })

      this.createAnchor = false
    }

    ratk.update();
  }
})
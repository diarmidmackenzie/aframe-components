(function () {

  impulseVector = new THREE.Vector3()
  zeroVector = new THREE.Vector3(0, 0, 0)
  vel = new THREE.Vector3()

  AFRAME.registerComponent('ball-blaster', {

    schema: {
      // velocity of balls in m/s
      velocity: {default: 20},
  
      // radius of balls in m
      radius: {default: 0.05},
  
      ballColor: {default: 'yellow'},
  
      blasterColor: {default: '#333'},

      debug: {default: false}
    },
  
    init() {
  
      if (this.el.sceneEl.getAttribute('physics')?.driver === "ammo") {
        this.driver = "ammo"
        this.kinematicBodyHTML = `ammo-body='type: kinematic'; ammo-shape`
        // Ammo requires manual fit of shape when working with 'a-sphere'
        // (?? due to component initialization order).
        this.ballPhysicsHTML = `ammo-body='type: dynamic';
                                ammo-shape='type: sphere; fit: manual; sphereRadius: ${this.data.radius}'`
      }
      else if (this.el.sceneEl.getAttribute('physx')) {
        this.driver = "physx"
        this.kinematicBodyHTML = `physx-body='type: kinematic'`
        // highPrecision enables CCD.  Ammo & Cannon don't support CCD yet.
        this.ballPhysicsHTML = `physx-body='type: dynamic; highPrecision: true'`
      }
      else {
        this.driver = "cannon"
        this.kinematicBodyHTML = 'static-body'
        this.ballPhysicsHTML = `dynamic-body`
      }
  
      const handleHTML = `
      <a-cylinder
        id = 'ball-blaster-handle'
        color=${this.data.blasterColor}
        height=0.15
        radius=0.02
        ${this.kinematicBodyHTML}>
      </a-cylinder>
      `

      const barrelHTML = `
      <a-cylinder
        id = 'ball-blaster-barrel'
        rotation='90 0 0'
        position='0 0.07 -0.2'
        color=${this.data.blasterColor}
        radius=${this.data.radius}
        ${this.kinematicBodyHTML}>
      </a-cylinder>
      `
      this.el.insertAdjacentHTML('beforeend', handleHTML + barrelHTML)
  
      this.keyUp = this.keyUp.bind(this)
      this.shootBall = this.shootBall.bind(this)
      this.refreshControllers = this.refreshControllers.bind(this)

      this.listenForKeys = true

      this.refreshControllers()
    },

    update() {
      if (this.data.debug) {
        this.tick = this.debugTick
      }
      else {
        this.tick = null
      }
    },

    refreshControllers() {
      this.parentController = this.el.closest('[tracked-controls]')
      if (this.parentController) {
        this.listenForTrigger = true
        this.listenForKeys = false
        this.updateListeners()
      }
      else {
        this.listenForTrigger = false
        this.listenForKeys = true
      }
      this.updateListeners()
    },

    play() {
      this.updateListeners()
    },

    pause() {
      this.updateListeners()
    },

    remove() {
      this.removeListeners()

      const barrel = this.el.querySelector('#ball-blaster-barrel')
      this.el.removeChild(barrel)

      const handle = this.el.querySelector('#ball-blaster-handle')
      this.el.removeChild(handle)
    },

    removeListeners() {
      window.removeEventListener('keyup', this.keyUp)
      if (this.parentController) {
        this.parentController.removeEventListener('triggerdown', this.shootBall)
      }
    },

    updateListeners() {

      // start by clearing out previous event listeners...
      this.removeListeners()

      if (!this.el.isPlaying) return

      if (this.listenForTrigger && this.parentController) {
        this.parentController.addEventListener('triggerdown', this.shootBall)
      }

      if (this.listenForKeys) {
        window.addEventListener('keyup', this.keyUp)
      }
    },

    keyUp(evt) {

      if (evt.key === ' ') {
        this.shootBall()
      }
    },
  
    shootBall() {
  
      const id = THREE.MathUtils.generateUUID()
  
      const ballHTML = `
      <a-sphere
        id = ${id}
        radius = ${this.data.radius}
        color = ${this.data.ballColor}
        position = '0 0.05 -0.7'
        shadow = 'cast: true'
        ${this.ballPhysicsHTML}>
      </a-sphere>
      `
      this.el.insertAdjacentHTML('beforeend', ballHTML)
  
      const ball = document.getElementById(id)
  
      ball.addEventListener('loaded', () => {
  
        const i = impulseVector
        ball.object3D.getWorldDirection(i)
        i.multiplyScalar(-this.data.velocity)
  
        if (this.driver === "ammo") {
          const impulse = new Ammo.btVector3(i.x, i.y, i.z);
          ball.body.applyCentralImpulse(impulse);
          Ammo.destroy(impulse);
        }
        else if (this.driver === "physx") {

          // Reparent Ball Object3D to scene.  This works around a PhysX engine bug where movement of the gun
          // seems to influence ball movement after they have been fired.
          // (notceable when balls are rolling slowly and you shake the gun)
          const scene = this.el.sceneEl.object3D
          scene.attach(ball.object3D)
          
          ball.addEventListener('rigidBodyReady', () => {
            const body = ball.components['physx-body'].rigidBody
            body.addImpulseAtLocalPos(i, zeroVector);
          })
        }
        else {
          const body = ball.components['dynamic-body'].body

          // for Cannon, impulse has to be multiplied by 5 to give target velocity.
          // (API docs weren't clear on units for impulse, determined by testign with debug: true)
          i.multiplyScalar(5)
          body.applyImpulse(i, zeroVector)
        }
      })
    },

    debugTick() {

      const balls = document.querySelectorAll('a-sphere')
      balls.forEach((ball) => {
        if (!ball.velocityLogged) {

          if (this.driver === "ammo") {
            const velocity = new Ammo.btVector3();
            ball.body.getLinearVelocity(velocity)
            vel.x = velocity.x()
            vel.y = velocity.y()
            vel.z = velocity.z()
            console.log("Speed:", vel.length())
            Ammo.destroy(velocity);
            ball.velocityLogged = true
          }
          else if (this.driver === "physx") {

            const body = ball.components['physx-body'].rigidBody
            if (body) {
              v = body.getLinearVelocity()
              vel.set(v.x, v.y, v.z)
              const speed = vel.length()
              // tick may occur before impulse has been applied.
              // don't log speed until 
              if (speed > 0) {
                console.log("Speed:", speed)
                ball.velocityLogged = true
              }
            }
          }
          else {
            // cannon
            console.log("Speed:", ball.body.velocity.length())
            ball.velocityLogged = true
          }
        }
      })
    }
  })
})()


AFRAME.registerComponent('controller-ball-blaster', {

  // matches schema of ball-blaster
  schema: {
    velocity: {default: 20},  
    radius: {default: 0.05}, 
    ballColor: {default: 'yellow'},
    blasterColor: {default: '#333'},
    debug: {default: false}
  },
  
  init() {

    this.refresh = this.refresh.bind(this)
    this.el.sceneEl.addEventListener('controllerconnected', this.refresh)
    this.el.sceneEl.addEventListener('controllerdisconnected', this.refresh)

  },

  update() {

    if (this.el.hasAttribute('ball-blaster')) {
      this.el.setAttribute('ball-blaster', this.data)
    }
  },

  refresh() {

    const parentController = this.el.closest('[tracked-controls]')

    // On exit from VR, hand-controls doesn't remove the tracked-controls component.
    // Arguably that's a bug, but we can work around it.
    // It does set the controller object to not be visible, so we
    // can use that to determine that the controller has gone away and 
    // we should remove the ball-blaster component.
    if (parentController && parentController.object3D.visible) {
      this.el.setAttribute('ball-blaster', this.data)
    }
    else {
      this.el.removeAttribute('ball-blaster')
    }
  }
})
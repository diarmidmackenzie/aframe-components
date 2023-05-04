AFRAME.registerComponent('ball-blaster', {

  schema: {
    // velocity of balls in m/s
    velocity: {default: 5},

    // radius of balls in m
    radius: {default: 0.05},

    ballColor: {default: 'yellow'},

    blasterColor: {default: '#333'},
  },

  init() {

    if (this.el.sceneEl.getAttribute('physics').driver === "ammo") {
      this.driver = "ammo"
      this.kinematicBodyHTML = `ammo-body='type: kinematic'; ammo-shape`
      this.ballPhysicsHTML = `ammo-body='type: dynamic'; ammo-shape'`
    }
    else {
      this.driver = "cannon"
      this.kinematicBodyHTML = 'static-body'
      this.ballPhysicsHTML = `dynamic-body`
    }

    const handleHTML = `
    <a-cylinder
      color=${this.data.blasterColor}
      height=0.15
      radius=0.02
      ${this.kinematicBodyHTML}>
    </a-cylinder>
    `
    this.el.insertAdjacentHTML('beforeend', handleHTML)
    const barrelHTML = `
    <a-cylinder
      rotation='90 0 0'
      position='0 0.07 -0.2'
      color=${this.data.blasterColor}
      radius=${this.data.radius}
      ${this.kinematicBodyHTML}>
    </a-cylinder>
    `
    this.el.insertAdjacentHTML('beforeend', barrelHTML)

    window.addEventListener('keyup', this.shootBall.bind(this))
    this.el.parentEl.addEventListener('triggerdown', this.shootBall.bind(this))

    this.impulseVector = new THREE.Vector3()
    this.zeroVector = new THREE.Vector3(0, 0, 0)
    this.quat = new THREE.Quaternion()
  },

  shootBall() {

    const id = THREE.MathUtils.generateUUID()

    const ballHTML = `
    <a-sphere
      id = ${id}
      radius = ${this.data.radius}
      color = ${this.data.ballColor}
      position = '0 0.05 -0.7'
      ${this.ballPhysicsHTML}>
    </a-sphere>
    `
    this.el.insertAdjacentHTML('beforeend', ballHTML)

    const ball = document.getElementById(id)

    ball.addEventListener('loaded', () => {

      const i = this.impulseVector
      i.set(0, 0, -this.data.velocity * 10)
      const quat = this.quat
      ball.object3D.getWorldQuaternion(quat)
      i.applyQuaternion(quat)

      if (this.driver === "ammo") {
          const impulse = new Ammo.btVector3(i.x, i.y, i.z);
          ball.body.applyCentralImpulse(impulse);
          Ammo.destroy(impulse);
        } else {
          const body = ball.components['dynamic-body'].body
          body.applyImpulse(this.impulseVector, this.zeroVector)
        }
      })
    }
})

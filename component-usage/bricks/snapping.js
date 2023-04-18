// Simple components used in snapping demo
const BRICK_WIDTH = 4
const BRICK_DEPTH = 2
const BRICK_HEIGHT = 3
AFRAME.registerComponent('brick-wall', {
  schema: {
    width: {default: 4},
    height: {default: 4},
  },  
  init() {

    let delay = 0;

    for (let ii = 0; ii < this.data.height; ii++) {

      for (let jj = 0; jj < this.data.width; jj++) {

        setTimeout(() => this.createAndBindBrick(ii, jj), delay)
        delay += 0
      }
    }
  },

  createAndBindBrick(ii, jj) {

    const y = (ii + 1) * BRICK_HEIGHT * PLATE_HEIGHT

    const offset = (ii % 2) /2
    const x = (jj + offset - (this.data.width / 2)) * UNIT_WIDTH * BRICK_WIDTH

    const id = `brick-${ii}-${jj}`
    const brick = this.createBrick(x, y, 0, id)

  },

  createBrick(x, y, z, id) {

    const randomMember = (array) => {
      const index = Math.floor(Math.random() * array.length)
      return array[index]
    }

    const color = randomMember(COLORS)

    const brick = document.createElement('a-entity')
    brick.setAttribute("id", id)
    brick.object3D.position.set(x, y, z)
    brick.setAttribute("brick", {width: BRICK_WIDTH,
                                 height: BRICK_HEIGHT,
                                 depth: BRICK_DEPTH,
                                 color: color})

    brick.setAttribute('dynamic-snap', { renderPrecise: 'transparent',
                                         renderSnap: 'wireframe' })
    this.el.appendChild(brick)

    return brick
  }
})

AFRAME.registerComponent('scale-up-down', {
  schema: {
    container: { type: 'selector', default: '#container'}
  },

  init() {
    this.aButton = this.aButton.bind(this)
    this.el.addEventListener('abuttonup', this.aButton)
    this.scale = 10
  },

  aButton() {
    if (this.scale === 1) {
      this.scaleUp()
      this.scale = 10
    }
    else {
      this.scaleDown()
      this.scale = 1
    }
  },

  scaleUp() {
    this.data.container.removeAttribute('animation__scale')
    this.data.container.removeAttribute('animation__pos')
    this.data.container.removeAttribute('animation__rot')
    this.el.sceneEl.setAttribute('socket', 'snapDistance: 0.06')
    this.data.container.setAttribute('animation__scale', {
      property: 'scale',
      to: '10 10 10',
      easing: 'easeInOutQuad',
      dur: 1000
    })
    this.data.container.setAttribute('animation__pos', {
      property: 'position',
      to: '0 1 -1',
      easing: 'easeInOutQuad',
      dur: 1000
    })
    this.data.container.setAttribute('animation__rot', {
      property: 'rotation',
      to: '0 0 0',
      easing: 'easeInOutQuad',
      dur: 1000
    })
  },

  scaleDown() {
    this.data.container.removeAttribute('animation__scale')
    this.data.container.removeAttribute('animation__pos')
    this.data.container.removeAttribute('animation__rot')
    this.el.sceneEl.setAttribute('socket', 'snapDistance: 0.006')
    this.data.container.setAttribute('animation__scale', {
      property: 'scale',
      to: '1 1 1',
      easing: 'easeInOutQuad',
      dur: 1000,
    })
    this.data.container.setAttribute('animation__pos', {
      property: 'position',
      to: '0 1.2 -0.3',
      easing: 'easeInOutQuad',
      dur: 1000
    })
    this.data.container.setAttribute('animation__rot', {
      property: 'rotation',
      to: '0 0 0',
      easing: 'easeInOutQuad',
      dur: 1000
    })
  }
})

AFRAME.registerComponent('show-in-vr', {
  init() {
    this.el.object3D.visible = false

    this.el.sceneEl.addEventListener('enter-vr', () => {
      this.el.object3D.visible = true
    })
    this.el.sceneEl.addEventListener('exit-vr', () => {
      this.el.object3D.visible = false
    })
  }
})

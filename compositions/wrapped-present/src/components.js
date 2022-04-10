const CONFIG = {    
    boxColor: 'red',
    ribbonColor: 'gold',
    giftUrl: './assets/sample-image.png',
    message: 'Happy Birthday!'
}

AFRAME.registerComponent('box-material', {
    init() {
        this.el.setAttribute("material", `color: ${CONFIG.boxColor}; side: double`)
    }
})

AFRAME.registerComponent('ribbon', {
    init() {
        this.el.setAttribute("ribbon-material", "")
        this.el.setAttribute("width", "0.2")
        this.el.setAttribute("height", "1.002")
        this.el.setAttribute("position", "0 0 0.001")
    }
})

AFRAME.registerComponent('ribbon-material', {
    init() {
        this.el.setAttribute("material", `color: ${CONFIG.ribbonColor}; side: double; metalness: 0.5; roughness:0.2`)        
    }
})

AFRAME.registerComponent('click-listener', {
    init() {

        this.step = 0;
        lastClickTime = 0;

        window.addEventListener('click', () => {

            if (Date.now() < this.lastClickTime + 1000) return;

            // even longer for step 3.
            if ((this.step === 3) && (Date.now() < this.lastClickTime + 3000)) return;
            
            this.lastClickTime = Date.now();

            this.step++;

            switch (this.step) {
                case 1:
                    document.getElementById('top-pivot').emit('open-top')
                    break;

                case 2:
                    document.getElementById('back-pivot').emit('open-box')
                    document.getElementById('front-pivot').emit('open-box')
                    document.getElementById('left-pivot').emit('open-box')
                    document.getElementById('right-pivot').emit('open-box')
                    break;

                case 3:
                    document.getElementById('picture').emit('picture-to-screen')
                    document.getElementById('start-position').emit('picture-to-screen')
                    break;
                
                case 4:
                    document.getElementById('picture').emit('back-to-box')
                    document.getElementById('start-position').emit('back-to-box')
                    break;

                case 5:
                    document.getElementById('picture').emit('close-box')
                    document.getElementById('picture').setAttribute('blend-transforms', 'percentage: 0')                    
                    document.getElementById('back-pivot').emit('close-box')
                    document.getElementById('front-pivot').emit('close-box')
                    document.getElementById('left-pivot').emit('close-box')
                    document.getElementById('right-pivot').emit('close-box')
                    break;

                case 6:
                    document.getElementById('top-pivot').emit('close-top')
                    this.step = 0;
                    break;

                default:
                    bbreak;
            }
        });
    }
})

AFRAME.registerGeometry('rosette', {
    schema: {
      width: {default: 1},
      height: {default: 1},
      depth: {default: 1},
      ribbon: {default: 0.2},
    },
  
    init: function (data) {
    
      // rosette
      this.geometry = new THREE.TorusKnotGeometry(data.ribbon, data.ribbon/4, 30, 3, 7, 11);
      //this.geometry.rotateX(Math.PI/2);
        
      const vertices = this.geometry.getAttribute('position')

      for (var ii = 0; ii < vertices.count; ii++) {
          const index = ii * 3 + 2;
          if (vertices.array[index] < 0) {
              vertices.array[index] = -vertices.array[index];
          }
      }      

      this.geometry.setAttribute('position', vertices)
    }

  });

AFRAME.registerComponent('adaptive-screen-display', {
    init() {

        if (window.innerHeight > window.innerWidth) {
            this.el.setAttribute("screen-display", "xpos:50; ypos:50;width:180")
        }
        else {
            this.el.setAttribute("screen-display", "xpos:50; ypos:50;width:70")
        }        
    }
});

AFRAME.registerComponent('custom-src', {
    init() {
        this.el.setAttribute("src", CONFIG.giftUrl)        
    }
})

AFRAME.registerComponent('custom-text-geometry', {
    init() {
        this.el.setAttribute("text-geometry", `value: ${message}; font: #optimerBoldFont; size: 0.8`)

        // factor of 3.9 seems to give decent alignment with the chosen font.
        const leftPos = -message.length / 3.9;
        this.el.setAttribute('position', `${leftPos} 6.25 -9`)
    }
})
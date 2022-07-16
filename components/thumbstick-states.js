// Set states based on thumbstick positions.
// controller: selector for the controller with the thumbstick
// bindings: stats to set for each of up/down/left/right.
// sensitivity: 0 to 1- how far off center thumbstick must be to count as movement.
// Note the default settings, which give standard left thumbstick movement
// don't actually work very well because the X & Z directions are fixed
// in space.  Could make this work using a nested set of "gimbals", but you get
// a better movement experience by allowing for the position of the controller
// itself, using thumbstick-object-control.
AFRAME.registerComponent('thumbstick-states', {
    schema: {
       controller:   {type: 'selector', default: "#lhand"},
       bindings:     {type: 'array', default: ["none", "none", "none", "none"]},
       tBindings:    {type: 'array', default: []},
       gBindings:    {type: 'array', default: []},
       tgBindings:   {type: 'array', default: []},
       sensitivity:  {type: 'number', default: 0.5}
    },
  
    multiple: true,
  
    init() {
      this.controller = this.data.controller;
  
      this.listeners = {
        thumbstickMoved: this.thumbstickMoved.bind(this),
        triggerUp: this.triggerUp.bind(this),
        triggerDown: this.triggerDown.bind(this),
        gripUp: this.gripUp.bind(this),
        gripDown: this.gripDown.bind(this),
      }
  
      this.states = {
        gripDown: false,
        triggerDown: false,
      }
  
    },
  
    update() {
  
      this.controller.addEventListener('thumbstickmoved',
                                       this.listeners.thumbstickMoved);
      this.controller.addEventListener('triggerup',
                                       this.listeners.triggerUp);
      this.controller.addEventListener('triggerdown',
                                       this.listeners.triggerDown);
      this.controller.addEventListener('gripup',
                                       this.listeners.gripUp);
      this.controller.addEventListener('gripdown',
                                       this.listeners.gripDown);
  
      this.updateBindings()
  
    },
  
    updateBindings() {
  
      // clear all pre-existing state
      const removeStates = (set) => set.forEach((item) => this.el.removeState(item) )
      removeStates(this.data.bindings)
      removeStates(this.data.tBindings)
      removeStates(this.data.gBindings)
      removeStates(this.data.tgBindings)
  
      // now update bindings
      var binding;
  
      if (!this.states.triggerDown && !this.states.gripDown) {
        binding = (x) => this.data.bindings[x]      
      }
      else if (this.states.triggerDown && !this.states.gripDown) {
        // trigger down.  If tBinding not specified, fall back to regular bindings
        binding = (x) => this.data.tBindings[x] ||
                         this.data.bindings[x]
      }
      else if (!this.states.triggerDown && this.states.gripDown) {
        // grip down.  If gBinding not specified, fall back to regular bindings
        binding = (x) => this.data.gBindings[x] ||
                         this.data.bindings[x]
      }
      else {
        // trigger and grip down.  If tgBinding not specified, fall back to t, g, or regular bindings
        binding = (x) => this.data.tgBindings[x] ||
                         this.data.gBindings[x] ||
                         this.data.tBindings[x] ||
                         this.data.bindings[x]
      }
  
      this.yplus = binding(0)
      this.yminus = binding(1)
      this.xplus = binding(2)
      this.xminus = binding(3)
  
      console.log(this)
    },
  
    gripDown(event) {
  
      this.states.gripDown = true;
      this.updateBindings()
    },
  
    gripUp(event) {
      this.states.gripDown = false;
      this.updateBindings()
    },
  
    triggerDown(event) {
      this.states.triggerDown = true;
      this.updateBindings()
    },
  
    triggerUp(event) {
      this.states.triggerDown = false;
      this.updateBindings()
    },
  
    thumbstickMoved(event) {
  
      const x = event.detail.x
      const y = event.detail.y
  
      if (Math.abs(x) > this.data.sensitivity) {
        if (x > 0) {
          this.el.addState(this.xplus)
          this.el.removeState(this.xminus)
        }
        else {
          this.el.addState(this.xminus)
          this.el.removeState(this.xplus)
        }
      }
      else
      {
        this.el.removeState(this.xplus)
        this.el.removeState(this.xminus)
      }
  
      if (Math.abs(y) > this.data.sensitivity) {
        if (y > 0) {
          this.el.addState(this.yplus)
          this.el.removeState(this.yminus)
        }
        else {
          this.el.addState(this.yminus)
          this.el.removeState(this.yplus)
        }
      }
      else
      {
        this.el.removeState(this.yplus)
        this.el.removeState(this.yminus)
      }
    }
  });
  
AFRAME.registerComponent('stats-panel', {
  schema: {
    merge: {type: 'boolean', default: true}
  },

  init() {

    const container = document.querySelector('.rs-container')

    if (container && this.data.merge) {
      //stats panel exists, just merge into it.
      this.container = container
      return;
    }

    // if stats panel doesn't exist, add one to support our custom stats.
    this.base = document.createElement('div')
    this.base.classList.add('rs-base')
    const body = document.body || document.getElementsByTagName('body')[0]

    if (container && !this.data.merge) {
      this.base.style.top = "auto"
      this.base.style.bottom = "20px"
    }

    body.appendChild(this.base)

    this.container = document.createElement('div')
    this.container.classList.add('rs-container')
    this.base.appendChild(this.container)
  }
});

AFRAME.registerComponent('stats-group', {
  multiple: true,
  schema: {
    label: {type: 'string'}
  },

  init() {

    let container
    const baseComponent = this.el.components['stats-panel']
    if (baseComponent) {
      container = baseComponent.container
    }
    else {
      container = document.querySelector('.rs-container')
    }

    if (!container) {
      console.warn(`Couldn't find stats container to add stats to.
                    Add either stats or stats-panel component to a-scene`)
      return;
    }
    
    this.groupHeader = document.createElement('h1')
    this.groupHeader.innerHTML = this.data.label
    container.appendChild(this.groupHeader)

    this.group = document.createElement('div')
    this.group.classList.add('rs-group')
    // rs-group hs style flex-direction of 'column-reverse'
    // No idea why it's like that, but it's not what we want for our stats.
    // We prefer them rendered in the order speified.
    // So override this style.
    this.group.style.flexDirection = 'column'
    this.group.style.webKitFlexDirection = 'column'
    container.appendChild(this.group)
  }
});

AFRAME.registerComponent('stats-row', {
  multiple: true,
  schema: {
    // name of the group to add the stats row to.
    group: {type: 'string'},

    // name of an event to listen for
    event: {type: 'string'},

    // property from event to output in stats panel
    property: {type: 'string'},

    // label for the row in the stats panel
    label: {type: 'string'}
  },

  init () {

    const groupComponentName = "stats-group__" + this.data.group
    const groupComponent = this.el.components[groupComponentName] ||
                           this.el.sceneEl.components[groupComponentName] ||
                           this.el.components["stats-group"] ||
                           this.el.sceneEl.components["stats-group"]

    if (!groupComponent) {
      console.warn(`Couldn't find stats group ${groupComponentName}`)
      return;
    }
  
    this.counter = document.createElement('div')
    this.counter.classList.add('rs-counter-base')
    groupComponent.group.appendChild(this.counter)

    this.counterId = document.createElement('div')
    this.counterId.classList.add('rs-counter-id')
    this.counterId.innerHTML = this.data.label
    this.counter.appendChild(this.counterId)

    this.counterValue = document.createElement('div')
    this.counterValue.classList.add('rs-counter-value')
    this.counterValue.innerHTML = "..."
    this.counter.appendChild(this.counterValue)

    this.updateData = this.updateData.bind(this)
    this.el.addEventListener(this.data.event, this.updateData)

    this.splitCache = {}
  },

  updateData(e) {
    
    const split = this.splitDot(this.data.property);
    let value = e.detail;
    for (i = 0; i < split.length; i++) {
      value = value[split[i]];
    }
    this.counterValue.innerHTML = value

  },

  splitDot (path) {
    if (path in this.splitCache) { return this.splitCache[path]; }
    this.splitCache[path] = path.split('.');
    return this.splitCache[path];
  }

});

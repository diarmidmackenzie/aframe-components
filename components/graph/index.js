import 'aframe-connecting-line'
import Graph from 'graphology';
import {connectedComponents} from 'graphology-components';

const GRAPH_ROOT = new Graph({multi: true})

AFRAME.registerComponent('graph', {

  schema: {
    debug: {default: false}
  }
})

AFRAME.registerComponent('graph-node', {

  init() {
    this.id = this.el.object3D.uuid
    GRAPH_ROOT.addNode(this.id)
  },

  remove() {
    GRAPH_ROOT.dropNode(this.id)
  }
})

AFRAME.registerComponent('graph-edge', {
  dependencies: ['graph-node'],
  multiple: true,

  schema: {
    target: {type: 'selector'}
  },

  init() {
    
    const target = this.data.target

    if (!target.hasLoaded) {
      this.data.target.addEventListener('loaded', () => this.addEdge())
    }
    else {
      this.addEdge()
    }
  },

  addEdge() {

    const nodeComponent = (el) => {
      return el.components['graph-node']
    }
    

    const targetNode = nodeComponent(this.data.target)

    if (!targetNode) {
      console.warn("graph-edge: No node found for target element:", this.data.target.id)
      return
    }

    const node = nodeComponent(this.el)

    if (!node) {
      console.warn("graph-edge: No node found for this element:", this.el.id)
      return
    }

    this.edge = GRAPH_ROOT.addEdge(node.id, targetNode.id)

    if (this.el.sceneEl.hasLoaded) {
      this.onSceneLoaded()
    }
    else {
      this.el.sceneEl.addEventListener('loaded', () => this.onSceneLoaded())
    }
    
    const components = connectedComponents(GRAPH_ROOT);
    console.log(components)

  },

  onSceneLoaded() {

    const debug = this.el.sceneEl.components.graph?.data.debug

    if (debug) {
      this.el.setAttribute(`connecting-line__${this.attrName}`,
                         { start: `#${this.el.id}`,
                           end: `#${this.data.target.id}`,
                           color: 'red'})
    }
  },

  remove() {
    GRAPH_ROOT.dropEdge(this.edge)
    this.edge = null
  }
})


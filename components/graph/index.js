import Graph from 'graphology';

const GRAPH_ROOT = new Graph()

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
    }

    const node = nodeComponent(this.el)
    this.edge = GRAPH_ROOT.addEdge(node.id, targetNode.id)

    console.log(GRAPH_ROOT.neighbors(node.id))
    console.log(GRAPH_ROOT.neighbors(targetNode.id))

  },

  remove() {
    GRAPH_ROOT.dropEdge(this.edge)
    this.edge = null
  }
})


import 'aframe-connecting-line'
import Graph from 'graphology';
import {bidirectional} from 'graphology-shortest-path/unweighted';
import {getConnectedComponent} from './src/utils.js'

const GRAPH_ROOT = new Graph({multi: true, type: 'undirected'})

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
    this.eventData = {
      target: this.data.target
    }

    if (!target.hasLoaded) {
      this.data.target.addEventListener('loaded', () => this.addEdge())
    }
    else {
      this.addEdge()
    }
  },

  getNodes() {

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

    return [node, targetNode]
  },

  addEdge() {

    const [node, targetNode] = this.getNodes()

    let componentsJoined
    if (this.nodesConnected(node, targetNode)) {
      // already connected.
      componentsJoined = false
    }
    else {
      componentsJoined = true
    }

    this.edge = GRAPH_ROOT.addEdge(node.id, targetNode.id)

    if (this.el.sceneEl.hasLoaded) {
      this.onSceneLoaded()
    }
    else {
      this.el.sceneEl.addEventListener('loaded', () => this.onSceneLoaded())
    }
    
    if (componentsJoined) {

      this.eventData.component = getConnectedComponent(GRAPH_ROOT, node.id)
      this.eventData.otherComponent = null
      this.el.emit("graph-components-joined", this.eventData)
      console.log("COMPONENTS JOINED")

    }
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

    const debug = this.el.sceneEl.components.graph?.data.debug

    if (debug) {
      this.el.removeAttribute(`connecting-line__${this.attrName}`)
    }

    GRAPH_ROOT.dropEdge(this.edge)
    this.edge = null

    const [node, targetNode] = this.getNodes()
    if (!this.nodesConnected(node, targetNode)) {
      // no longer connected.
      this.eventData.component = getConnectedComponent(GRAPH_ROOT, node.id)
      this.eventData.otherComponent = getConnectedComponent(GRAPH_ROOT, targetNode.id)

      this.el.emit("graph-components-split", this.eventData)
      console.log("COMPONENTS SPLIT")
    }
  },

  // are two nodes connected by the graph?
  nodesConnected(a, b) {

    const path = bidirectional(GRAPH_ROOT, a.id, b.id);

    return !!path
  }
})



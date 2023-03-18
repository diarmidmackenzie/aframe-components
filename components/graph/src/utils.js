const DFSStack = require('graphology-indices/dfs-stack');

/**
 * Return the set of nodes connected to a given node.
 *
 * @param {Graph}    graph    - Target graph.
 * @param {string}   node     - The ID of the node.
 * 
 * Code based on forEachConnectedComponent() from graphology/components
 */
function getConnectedComponent(graph, node) {

  const stack = new DFSStack(graph);
  const push = stack.push.bind(stack);
  const component = []

  stack.push(node);

  var source;

  while (stack.size !== 0) {
    source = stack.pop();

    component.push(source);

    graph.forEachNeighbor(source, push);
  }

  return component
}

exports.getConnectedComponent = getConnectedComponent
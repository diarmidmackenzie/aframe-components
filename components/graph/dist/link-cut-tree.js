/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const createVertex = __webpack_require__(/*! dynamic-forest */ \"./node_modules/dynamic-forest/dgraph.js\")\r\n// Add this to the same entity as the cursor component.\r\n\r\nAFRAME.registerComponent('lct-node', {\r\n\r\n  init() {\r\n    this.node = createVertex(this.el.object3D.id)\r\n  },\r\n\r\n  remove() {\r\n    this.node.cut()\r\n    this.node = null\r\n  }\r\n})\r\n\r\nAFRAME.registerComponent('lct-link', {\r\n  dependencies: ['lct-node'],\r\n  multiple: true,\r\n\r\n  schema: {\r\n    target: {type: 'selector'}\r\n  },\r\n\r\n  init() {\r\n    \r\n    const target = this.data.target\r\n\r\n    if (!target.hasLoaded) {\r\n      this.data.target.addEventListener('loaded', () => this.addEdge())\r\n    }\r\n    else {\r\n      this.addEdge()\r\n    }\r\n  },\r\n\r\n  addEdge() {\r\n    const targetNode = this.data.target.components['lct-node'].node\r\n    if (!targetNode) {\r\n      console.warn(\"lct-link: No node found for target element:\", this.data.target.id)\r\n    }\r\n\r\n    const node = this.el.components['lct-node'].node\r\n    this.edge = node.link(targetNode)\r\n\r\n    console.log(node.componentSize())\r\n    console.log(targetNode.componentSize())\r\n  },\r\n\r\n  remove() {\r\n    this.edge.cut()\r\n  }\r\n})\r\n\r\n\n\n//# sourceURL=webpack://graph/./index.js?");

/***/ }),

/***/ "./node_modules/binary-search-bounds/search-bounds.js":
/*!************************************************************!*\
  !*** ./node_modules/binary-search-bounds/search-bounds.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nfunction compileSearch(funcName, predicate, reversed, extraArgs, useNdarray, earlyOut) {\n  var code = [\n    \"function \", funcName, \"(a,l,h,\", extraArgs.join(\",\"),  \"){\",\nearlyOut ? \"\" : \"var i=\", (reversed ? \"l-1\" : \"h+1\"),\n\";while(l<=h){\\\nvar m=(l+h)>>>1,x=a\", useNdarray ? \".get(m)\" : \"[m]\"]\n  if(earlyOut) {\n    if(predicate.indexOf(\"c\") < 0) {\n      code.push(\";if(x===y){return m}else if(x<=y){\")\n    } else {\n      code.push(\";var p=c(x,y);if(p===0){return m}else if(p<=0){\")\n    }\n  } else {\n    code.push(\";if(\", predicate, \"){i=m;\")\n  }\n  if(reversed) {\n    code.push(\"l=m+1}else{h=m-1}\")\n  } else {\n    code.push(\"h=m-1}else{l=m+1}\")\n  }\n  code.push(\"}\")\n  if(earlyOut) {\n    code.push(\"return -1};\")\n  } else {\n    code.push(\"return i};\")\n  }\n  return code.join(\"\")\n}\n\nfunction compileBoundsSearch(predicate, reversed, suffix, earlyOut) {\n  var result = new Function([\n  compileSearch(\"A\", \"x\" + predicate + \"y\", reversed, [\"y\"], false, earlyOut),\n  compileSearch(\"B\", \"x\" + predicate + \"y\", reversed, [\"y\"], true, earlyOut),\n  compileSearch(\"P\", \"c(x,y)\" + predicate + \"0\", reversed, [\"y\", \"c\"], false, earlyOut),\n  compileSearch(\"Q\", \"c(x,y)\" + predicate + \"0\", reversed, [\"y\", \"c\"], true, earlyOut),\n\"function dispatchBsearch\", suffix, \"(a,y,c,l,h){\\\nif(a.shape){\\\nif(typeof(c)==='function'){\\\nreturn Q(a,(l===undefined)?0:l|0,(h===undefined)?a.shape[0]-1:h|0,y,c)\\\n}else{\\\nreturn B(a,(c===undefined)?0:c|0,(l===undefined)?a.shape[0]-1:l|0,y)\\\n}}else{\\\nif(typeof(c)==='function'){\\\nreturn P(a,(l===undefined)?0:l|0,(h===undefined)?a.length-1:h|0,y,c)\\\n}else{\\\nreturn A(a,(c===undefined)?0:c|0,(l===undefined)?a.length-1:l|0,y)\\\n}}}\\\nreturn dispatchBsearch\", suffix].join(\"\"))\n  return result()\n}\n\nmodule.exports = {\n  ge: compileBoundsSearch(\">=\", false, \"GE\"),\n  gt: compileBoundsSearch(\">\", false, \"GT\"),\n  lt: compileBoundsSearch(\"<\", true, \"LT\"),\n  le: compileBoundsSearch(\"<=\", true, \"LE\"),\n  eq: compileBoundsSearch(\"-\", true, \"EQ\", true)\n}\n\n\n//# sourceURL=webpack://graph/./node_modules/binary-search-bounds/search-bounds.js?");

/***/ }),

/***/ "./node_modules/dynamic-forest/dgraph.js":
/*!***********************************************!*\
  !*** ./node_modules/dynamic-forest/dgraph.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nmodule.exports = createVertex\n\n\nvar createEulerVertex = __webpack_require__(/*! ./lib/euler.js */ \"./node_modules/dynamic-forest/lib/euler.js\")\nvar elist = __webpack_require__(/*! ./lib/edge-list.js */ \"./node_modules/dynamic-forest/lib/edge-list.js\")\nvar ComponentIterator = __webpack_require__(/*! ./lib/component-iterator.js */ \"./node_modules/dynamic-forest/lib/component-iterator.js\")\n\nvar KEY_COUNTER = 0\n\n//Raise the level of an edge, optionally inserting into higher level trees\nfunction raiseLevel(edge) {\n  var s = edge.s\n  var t = edge.t\n\n  //Update position in edge lists\n  removeEdge(s, edge)\n  removeEdge(t, edge)\n  edge.level += 1\n  elist.insert(s.adjacent, edge)\n  elist.insert(t.adjacent, edge)\n  \n  //Update flags for s\n  if(s.euler.length <= edge.level) {\n    s.euler.push(createEulerVertex(s))\n  }\n  var es = s.euler[edge.level]\n  es.setFlag(true)\n\n  //Update flags for t\n  if(t.euler.length <= edge.level) {\n    t.euler.push(createEulerVertex(t))\n  }\n  var et = t.euler[edge.level]\n  et.setFlag(true)\n\n  //Relink if necessary\n  if(edge.euler) {\n    edge.euler.push(es.link(et, edge))\n  }\n}\n\n//Remove edge from list and update flags\nfunction removeEdge(vertex, edge) {\n  var adj = vertex.adjacent\n  var idx = elist.index(adj, edge)\n  adj.splice(idx, 1)\n  //Check if flag needs to be updated\n  if(!((idx < adj.length && adj[idx].level === edge.level) ||\n       (idx > 0 && adj[idx-1].level === edge.level))) {\n    vertex.euler[edge.level].setFlag(false)\n  }\n}\n\n//Add an edge to all spanning forests with level <= edge.level\nfunction link(edge) {\n  var es = edge.s.euler\n  var et = edge.t.euler\n  var euler = new Array(edge.level+1)\n  for(var i=0; i<euler.length; ++i) {\n    if(es.length <= i) {\n      es.push(createEulerVertex(edge.s))\n    }\n    if(et.length <= i) {\n      et.push(createEulerVertex(edge.t))\n    }\n    euler[i] = es[i].link(et[i], edge)\n  }\n  edge.euler = euler\n}\n\nfunction DynamicEdge(value, key, s, t, level, euler) {\n  this.value = value\n  this.key = key  //Used to sort edges in list\n  this.s = s\n  this.t = t\n  this.level = level\n  this.euler = euler\n}\n\nvar eproto = DynamicEdge.prototype\n\neproto.valueOf = function() {\n  return this.value\n}\n\neproto.cut = function() {\n  var level\n\n  //Don't double cut an edge\n  if(!this.s) {\n    return\n  }\n\n  //Search over tv for edge connecting to tw\n  function visit(node) {\n    if(node.flag) {\n      var v = node.value.value\n      var adj = v.adjacent\n      for(var ptr=elist.level(adj, level); ptr<adj.length && adj[ptr].level === level; ++ptr) {\n        var e = adj[ptr]\n        var es = e.s\n        var et = e.t\n        if(es.euler[level].path(et.euler[level])) {\n          raiseLevel(e)\n          ptr -= 1\n        } else {\n          //Found the edge, relink components\n          link(e)\n          return true\n        }\n      }\n    }\n    if(node.left && node.left.flagAggregate) {\n      if(visit(node.left)) {\n        return true\n      }\n    }\n    if(node.right && node.right.flagAggregate) {\n      if(visit(node.right)) {\n        return true\n      }\n    }\n    return false\n  }\n\n  removeEdge(this.s, this)\n  removeEdge(this.t, this)\n  if(this.euler) {\n    //Cut edge from tree\n    for(var i=0; i<this.euler.length; ++i) {\n      this.euler[i].cut()\n    }\n\n    //Find replacement, looping over levels\n    for(var i=this.level; i>=0; --i) {\n      var tv = this.s.euler[i].node.root()\n      var tw = this.t.euler[i].node.root()\n      level = i\n      if(tv.count > tw.count) {\n        visit(tw)\n      } else {\n        visit(tv)\n      }\n    }\n  }\n  this.s = this.t = this.euler = null\n  this.level = 32\n}\n\nfunction DynamicVertex(value, euler, adjacent) {\n  this.value = value\n  this.euler = euler\n  this.adjacent = adjacent\n}\n\nvar vproto = DynamicVertex.prototype\n\nvproto.connected = function(other) {\n  return this.euler[0].path(other.euler[0])\n}\n\nvproto.link = function(other, value) {\n  var e = new DynamicEdge(value, (KEY_COUNTER++), this, other, 0, null)\n  if(!this.euler[0].path(other.euler[0])) {\n    link(e)\n  }\n  this.euler[0].setFlag(true)\n  other.euler[0].setFlag(true)\n  elist.insert(this.adjacent, e)\n  elist.insert(other.adjacent, e)\n  return e\n}\n\nvproto.valueOf = function() {\n  return this.value\n}\n\n//Returns the number of vertices in this connected component\nvproto.componentSize = function() {\n  return this.euler[0].count()\n}\n\n//Removes the vertex from the graph\nvproto.cut = function() {\n  while(this.adjacent.length > 0) {\n    this.adjacent[this.adjacent.length-1].cut()\n  }\n}\n\nvproto.component = function() {\n  return new ComponentIterator(this.euler[0].node)\n}\n\nfunction createVertex(value) {\n  var euler = [null]\n  var v = new DynamicVertex(value, euler, [])\n  euler[0] = createEulerVertex(v)\n  return v\n}\n\n//# sourceURL=webpack://graph/./node_modules/dynamic-forest/dgraph.js?");

/***/ }),

/***/ "./node_modules/dynamic-forest/lib/component-iterator.js":
/*!***************************************************************!*\
  !*** ./node_modules/dynamic-forest/lib/component-iterator.js ***!
  \***************************************************************/
/***/ (() => {

"use strict";
eval("\n\nfunction DynamicComponentIterator(node) {\n  this.node = node\n}\n\nvar proto = DynamicComponentIterator.prototype\n\nproto.vertex = function() {\n  return this.node.value.value\n}\n\nproto.size = function() {\n  return this.node.root().count\n}\n\nproto.valid = function() {\n  return !!this.node\n}\n\nproto.valueOf = function() {\n  if(this.node) {\n    return this.vertex().value\n  }\n}\n\nproto.next = function() {\n  var n = this.node\n  if(n) {\n    n = n.next\n  }\n  while(n) {\n    if(n.value.type === \"vertex\") {\n      break\n    }\n\n    n = n.next\n  }\n  this.node = n\n  return !!n\n}\n\nproto.hasNext = function() {\n  var n = this.node\n  if(n) {\n    n = n.next\n  }\n  while(n) {\n    if(n.value.type === \"vertex\") {\n      break\n    }\n\n    n = n.next\n  }\n  return !!n\n}\n\nproto.prev = function() {\n  var n = this.node\n  if(n) {\n    n = n.prev\n  }\n  while(n) {\n    if(n.value.type === \"vertex\") {\n      break\n    }\n\n    n = n.prev\n  }\n  this.node = n\n  return !!n\n}\n\nproto.hasPrev = function() {\n  var n = this.node\n  if(n) {\n    n = n.prev\n  }\n  while(n) {\n    if(n.value.type === \"vertex\") {\n      break\n    }\n\n    n = n.prev\n  }\n  return !!n\n}\n\nproto.first = function() {\n  if(this.node) {\n    this.node = this.node.first()\n    if(this.node.value.type !== \"vertex\") {\n      this.next()\n    }\n  }\n}\n\nproto.last = function() {\n  if(this.node) {\n    this.node = this.node.last()\n    if(this.node.value.type !== \"vertex\") {\n      this.prev()\n    }\n  }\n}\n\n//# sourceURL=webpack://graph/./node_modules/dynamic-forest/lib/component-iterator.js?");

/***/ }),

/***/ "./node_modules/dynamic-forest/lib/edge-list.js":
/*!******************************************************!*\
  !*** ./node_modules/dynamic-forest/lib/edge-list.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval("\n\nexports.insert = insertEdge\nexports.remove = removeEdge\nexports.level = levelIndex\nexports.index = index\n\nvar bounds = __webpack_require__(/*! binary-search-bounds */ \"./node_modules/binary-search-bounds/search-bounds.js\")\n\nfunction compareEdges(a, b) {\n  var d = a.level - b.level\n  if(d) {\n    return d\n  }\n  return a.key - b.key\n}\n\nfunction compareLevel(a, i) {\n  return a.level - i\n}\n\nfunction insertEdge(list, e) {\n  list.splice(bounds.gt(list, e, compareEdges), 0, e)\n}\n\nfunction index(list, e) {\n  return bounds.eq(list, e, compareEdges)\n}\n\nfunction removeEdge(list, e) {\n  var idx = index(list, e)\n  if(idx >= 0) {\n    list.splice(idx, 1)\n  }\n}\n\nfunction levelIndex(list, i) {\n  return bounds.ge(list, i, compareLevel)\n}\n\n//# sourceURL=webpack://graph/./node_modules/dynamic-forest/lib/edge-list.js?");

/***/ }),

/***/ "./node_modules/dynamic-forest/lib/euler.js":
/*!**************************************************!*\
  !*** ./node_modules/dynamic-forest/lib/euler.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nmodule.exports = createVertex\n\nvar treap = __webpack_require__(/*! ./treap.js */ \"./node_modules/dynamic-forest/lib/treap.js\")\n\nfunction EulerHalfEdge(value, s, t, node, opposite) {\n  this.value = value\n  this.s = s\n  this.t = t\n  this.node = node\n  this.opposite = opposite\n}\n\nvar eproto = EulerHalfEdge.prototype\n\neproto.type = \"edge\"\n\neproto.cleanup = function() {\n  var v = this.node\n  v.remove()\n  v.value = null\n  this.node = null\n  this.opposite = null\n  this.s = null\n  this.t = null\n}\n\neproto.cut = function() {\n\n  var other = this.opposite\n  \n  //Split into parts\n  var a = this.node\n  var b = a.split()\n  var c = other.node\n  var d = c.split()\n\n  //Pull out the roots\n  if(d !== null && a.root() !== d.root()) {\n    //a comes before c:\n    // [a, bc, d]\n    a.concat(d)\n  } else if(b !== null && c.root() !== b.root()) {\n    //c comes before a:\n    // [c, da, b]\n    c.concat(b)\n  }\n\n  //Clean up mess\n  this.cleanup()\n  other.cleanup()\n}\n\nfunction EulerVertex(value, node) {\n  this.value = value\n  this.node = node\n}\n\nvar vproto = EulerVertex.prototype\n\nvproto.type = \"vertex\"\n\n//If flag is set, then this vertex has incident edges of at least level v\nvproto.setFlag = function(f) {\n  this.node.setFlag(f)\n}\n\nvproto.path = function(other) {\n  return this.node.root() === other.node.root()\n}\n\nvproto.makeRoot = function() {\n  var a = this.node\n  var b = a.split()\n  if(b) {\n    b.concat(a)\n  }\n}\n\nvproto.link = function(other, value) {\n  //Move both vertices to root\n  this.makeRoot()\n  other.makeRoot()\n\n  //Create half edges and link them to each other\n  var st = new EulerHalfEdge(value, this, other, null, null)\n  var ts = new EulerHalfEdge(value, other, this, null, st)\n  st.opposite = ts\n\n  //Insert entries in Euler tours\n  st.node = this.node.insert(st)\n  ts.node = other.node.insert(ts)\n\n  //Link tours together\n  this.node.concat(other.node)\n\n  //Return half edge\n  return st\n}\n\nvproto.count = function() {\n  return this.node.root().count\n}\n\nvproto.cleanup = function() {\n  this.node.remove()\n  this.node.value = null\n  this.node = null\n}\n\nfunction createVertex(value) {\n  var v = new EulerVertex(value, null)\n  v.node = treap(v)\n  return v\n}\n\n//# sourceURL=webpack://graph/./node_modules/dynamic-forest/lib/euler.js?");

/***/ }),

/***/ "./node_modules/dynamic-forest/lib/treap.js":
/*!**************************************************!*\
  !*** ./node_modules/dynamic-forest/lib/treap.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n//This is a custom binary tree data structure\n//The reason for using this instead of an array or some generic search tree is that:\n//\n//    * Nodes are ordered by position not sorted by key\n//    * On average tree height is O(log(number of nodes))\n//    * Concatenation and splitting both take O(log(N))\n//    * Has augmentations for size and edge level incidence flag\n//    * Node references are not invalidated during updates\n//    * Has threaded pointers for fast sequential traversal\n//\n\nmodule.exports = createTreap\n\nfunction countOfValue(v) {\n  var t = v && v.type\n  if(t) {\n    return (t === \"vertex\" ? 1 : 0)\n  }\n  return 1\n}\n\nfunction TreapNode(value, flag, flagAggregate, count, priority, parent, left, right, next, prev) {\n  this.value = value\n  this.flag = flag\n  this.flagAggregate = flagAggregate\n  this.count = count\n  this.priority = priority\n  this.parent = parent\n  this.left = left\n  this.right = right\n  this.next = next\n  this.prev = prev\n}\n\nvar proto = TreapNode.prototype\n\nproto.bubbleUp = function() {\n  while(true) {\n    var p = this.parent\n    if(!p || p.priority < this.priority) {\n      break\n    }\n    if(this === p.left) {\n      var b = this.right\n      p.left = b\n      if(b) {\n        b.parent = p\n      }\n      this.right = p\n    } else {\n      var b = this.left\n      p.right = b\n      if(b) {\n        b.parent = p\n      }\n      this.left = p\n    }\n    p.update()\n    this.update()\n    var gp = p.parent\n    p.parent = this\n    this.parent = gp\n    if(gp) {\n      if(gp.left === p) {\n        gp.left = this\n      } else {\n        gp.right = this\n      }\n    }\n  }\n  var p = this.parent\n  while(p) {\n    p.update()\n    p = p.parent\n  }\n}\n\nproto.root = function() {\n  var n = this\n  while(n.parent) {\n    n = n.parent\n  }\n  return n\n}\n\nproto.first = function() {\n  var l = this.root()\n  while(l.left) {\n    l = l.left\n  }\n  return l\n}\n\nproto.last = function() {\n  var r = this.root()\n  while(r.right) {\n    r = r.right\n  }\n  return r\n}\n\nproto.insert = function(value) {\n  if(!this.right) {\n    var nn = this.right = new TreapNode(value, false, false, countOfValue(value), Math.random(), this, null, null, this.next, this)\n    if(this.next) {\n      this.next.prev = nn\n    }\n    this.next = nn\n    nn.bubbleUp()\n    return nn\n  }\n  var v = this.next\n  var nn = v.left = new TreapNode(value, false, false, countOfValue(value), Math.random(), v, null, null, v, this)\n  v.prev = nn\n  this.next = nn\n  nn.bubbleUp()\n  return nn\n}\n\nfunction swapNodes(a, b) {\n  var p = a.priority\n  a.priority = b.priority\n  b.priority = p\n  var t = a.parent\n  a.parent = b.parent\n  if(b.parent) {\n    if(b.parent.left === b) {\n      b.parent.left = a\n    } else {\n      b.parent.right = a\n    }\n  }\n  b.parent = t\n  if(t) {\n    if(t.left === a) {\n      t.left = b\n    } else {\n      t.right = b\n    }\n  }\n  t = a.left\n  a.left = b.left\n  if(b.left) {\n    b.left.parent = a\n  }\n  b.left = t\n  if(t) {\n    t.parent = b\n  }\n  t = a.right\n  a.right = b.right\n  if(b.right) {\n    b.right.parent = a\n  }\n  b.right = t\n  if(t) {\n    t.parent = b\n  }\n  t = a.next\n  a.next = b.next\n  if(b.next) {\n    b.next.prev = a\n  }\n  b.next = t\n  if(t) {\n    t.prev = b\n  }\n  t = a.prev\n  a.prev = b.prev\n  if(b.prev) {\n    b.prev.next = a\n  }\n  b.prev = t\n  if(t) {\n    t.next = b\n  }\n  var c = a.count\n  a.count = b.count\n  b.count = c\n  var f = a.flag\n  a.flag = b.flag\n  b.flag = f\n  f = a.flagAggregate\n  a.flagAggregate = b.flagAggregate\n  b.flagAggregate = f\n}\n\nproto.update = function() {\n  var c = countOfValue(this.value)\n  var f = this.flag\n  if(this.left) {\n    c += this.left.count\n    f = f || this.left.flagAggregate\n  }\n  if(this.right) {\n    c += this.right.count\n    f = f || this.right.flagAggregate\n  }\n  this.count = c\n  this.flagAggregate = f\n}\n\n//Set new flag state and propagate up tree\nproto.setFlag = function(f) {\n  this.flag = f\n  for(var v=this; v; v=v.parent) {\n    var pstate = v.flagAggregate\n    v.update()\n    if(pstate === v.flagAggregate) {\n      break\n    }\n  }\n}\n\nproto.remove = function() {\n  var node = this\n  if(node.left && node.right) {\n    var other = node.next\n    swapNodes(other, node)\n  }\n  if(node.next) {\n    node.next.prev = node.prev\n  }\n  if(node.prev) {\n    node.prev.next = node.next\n  }\n  var r = null\n  if(node.left) {\n    r = node.left\n  } else {\n    r = node.right\n  }\n  if(r) {\n    r.parent = node.parent\n  }\n  if(node.parent) {\n    if(node.parent.left === node) {\n      node.parent.left = r\n    } else {\n      node.parent.right = r\n    }\n    //Update all ancestor counts\n    var p = node.parent\n    while(p) {\n      p.update()\n      p = p.parent\n    }\n  }\n  //Remove all pointers from detached node\n  node.parent = node.left = node.right = node.prev = node.next = null\n  node.count = 1\n}\n\nproto.split = function() {\n  var node = this\n  var s = node.insert()\n  s.priority = -Infinity\n  s.bubbleUp()\n  var l = s.left\n  var r = s.right\n  if(l) {\n    l.parent = null\n  }\n  if(r) {\n    r.parent = null\n  }\n  if(s.prev) {\n    s.prev.next = null\n  }\n  if(s.next) {\n    s.next.prev = null\n  }\n  return r\n}\n\nfunction concatRecurse(a, b) {\n  if(a === null) {\n    return b\n  } else if(b === null) {\n    return a\n  } else if(a.priority < b.priority) {\n    a.right = concatRecurse(a.right, b)\n    a.right.parent = a\n    a.update()\n    return a\n  } else {\n    b.left = concatRecurse(a, b.left)\n    b.left.parent = b\n    b.update()\n    return b\n  }\n}\n\nproto.concat = function(other) {\n  if(!other) {\n    return\n  }\n  var ra = this.root()\n  var ta = ra\n  while(ta.right) {\n    ta = ta.right\n  }\n  var rb = other.root()\n  var sb = rb\n  while(sb.left) {\n    sb = sb.left\n  }\n  ta.next = sb\n  sb.prev = ta\n  var r = concatRecurse(ra, rb)\n  r.parent = null\n  return r\n}\n\nfunction createTreap(value) {\n  return new TreapNode(value, false, false, countOfValue(value), Math.random(), null, null, null, null, null)\n}\n\n//# sourceURL=webpack://graph/./node_modules/dynamic-forest/lib/treap.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./index.js");
/******/ 	
/******/ })()
;
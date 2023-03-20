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

eval("if (!AFRAME.components['object-parent']) __webpack_require__(/*! aframe-object-parent */ \"./node_modules/aframe-object-parent/index.js\")\r\nif (!AFRAME.components['raycast-target']) __webpack_require__(/*! aframe-raycast-target */ \"./node_modules/aframe-raycast-target/index.js\")\r\n\r\nAFRAME.registerSystem('fusable-body', {\r\n\r\n  init() {\r\n\r\n    this.nodeMap = {}\r\n    \r\n    this.componentsJoined = this.componentsJoined.bind(this)\r\n    this.componentsSplit = this.componentsSplit.bind(this)\r\n\r\n    this.el.addEventListener('graph-components-joined', this.componentsJoined)\r\n    this.el.addEventListener('graph-components-split', this.componentsSplit)\r\n\r\n    this.containers = {}\r\n\r\n  },\r\n\r\n  getNodePhysicsType(el) {\r\n    return el.components['fusable-body'].data.type\r\n  },\r\n\r\n  addNode(el) {\r\n\r\n    this.nodeMap[el.object3D.uuid] = el\r\n\r\n    // create a container by default for each node\r\n    const physicsType = this.getNodePhysicsType(el)\r\n    const container = this.createContainer(el, physicsType)\r\n    \r\n    // reparent the object to that container node,\r\n    // and redirect raycasting.\r\n    const containerselector = `#${container.id}`\r\n    el.setAttribute('object-parent', {parent: containerselector})\r\n    el.setAttribute('raycast-target', containerselector)\r\n  },\r\n\r\n  createContainer(el, physicsType) {\r\n\r\n    const container = document.createElement('a-entity')\r\n    container.id = THREE.MathUtils.generateUUID()\r\n\r\n    // extract the transform of the reference element to use for this container\r\n    el.object3D.add(container.object3D)\r\n    this.el.object3D.attach(container.object3D)\r\n    \r\n    container.setAttribute('physx-body', {type: physicsType})\r\n    this.el.appendChild(container)\r\n\r\n    return container\r\n  },\r\n\r\n  destroyContainer(container) {\r\n\r\n    container.parentEl.removeNode(container)\r\n  },\r\n\r\n  removeNode(el) {\r\n\r\n    // remove reparenting of the object\r\n    el.removeAttribute('object-parent')\r\n    el.parentContainer = null\r\n\r\n    // delete nodeMap record\r\n    delete nodeMap[el.object3D.uuid]\r\n  },\r\n\r\n  componentsJoined(evt) {\r\n\r\n    component1 = evt.detail.thisComponent\r\n    component2 = evt.detail.otherComponent\r\n\r\n    let fromComponent, toComponent\r\n\r\n    if (component1.length >= component2.length) {\r\n      fromComponent = component2\r\n      toComponent = component1\r\n    }\r\n    else {\r\n      fromComponent = component1\r\n      toComponent = component2\r\n    }\r\n\r\n    // source & target containers can be determined from 1st nodes of component'\r\n    const sourceContainer = this.nodeMap[fromComponent[0]].object3D.parent.el\r\n    const targetContainerId = this.nodeMap[toComponent[0]].object3D.parent.el.id\r\n\r\n    fromComponent.forEach((uuid) => {\r\n      const node = this.nodeMap[uuid]\r\n      const targetContainerSelector = `#${targetContainerId}`\r\n      node.setAttribute('object-parent', {parent: targetContainerSelector})\r\n      node.setAttribute('raycast-target', targetContainerSelector)\r\n    })\r\n\r\n    // sourceContainer is empty & no longer needed.\r\n    this.destroyContainer(sourceContainer)\r\n  },\r\n\r\n  componentsSplit(evt) {\r\n\r\n    component1 = evt.detail.thisComponent\r\n    component2 = evt.detail.otherComponent\r\n\r\n    let componentToMove\r\n\r\n    if (component1.length >= component2.length) {\r\n      componentToMove = component2\r\n    }\r\n    else {\r\n      componentToMove = component1\r\n    }\r\n\r\n    const container = this.createContainer(\"kinematic\")\r\n    const targetContainerSelector = `#${container.id}`\r\n    \r\n    componentToMove.forEach((uuid) => {\r\n      const node = this.nodeMap[uuid]\r\n      node.setAttribute('object-parent', {parent: targetContainerSelector})\r\n      node.setAttribute('raycast-target', targetContainerSelector)\r\n    })\r\n  }\r\n})\r\n\r\nAFRAME.registerComponent('fusable-body', {\r\n\r\n  schema: {\r\n    type: {type: 'string', default: 'dynamic'}\r\n  },\r\n\r\n  init() {\r\n    this.el.setAttribute('graph-node')\r\n    this.system.addNode(this.el)\r\n  },\r\n\r\n  remove() {\r\n    this.el.removeAttribute('graph-node')\r\n    this.system.removeNode(this.el)\r\n  },\r\n})\r\n\r\nAFRAME.registerComponent('fused-joint', {\r\n\r\n  multiple: true,\r\n\r\n  schema() {\r\n    target: {type: 'selector'}\r\n  },\r\n\r\n  init() {\r\n    this.el.setAttibute(`graph-edge__${this.attrName}`)\r\n  },\r\n\r\n  remove() {\r\n    this.el.removeAttibute(`graph-edge__${this.attrName}`)\r\n  }\r\n});\r\n\n\n//# sourceURL=webpack://fusable-body/./index.js?");

/***/ }),

/***/ "./node_modules/aframe-object-parent/index.js":
/*!****************************************************!*\
  !*** ./node_modules/aframe-object-parent/index.js ***!
  \****************************************************/
/***/ (() => {

eval("// Change the parent of an object without changing its transform.\r\nAFRAME.registerComponent('object-parent', {\r\n\r\n  schema: {\r\n      parent:     {type: 'selector'},    \r\n  },\r\n\r\n  update() {\r\n\r\n      const matches = document.querySelectorAll(`#${parent.id}`)\r\n      if (matches.length > 1) {\r\n          console.warn(`object-parent matches duplicate entities for new parent ${parent.id}`)\r\n      }\r\n\r\n      const newParent = this.data.parent.object3D\r\n      this.reparent(newParent)\r\n      \r\n  },\r\n\r\n  remove() {\r\n\r\n    const originalParentEl = this.el.parentEl\r\n    this.reparent(originalParentEl.object3D)\r\n\r\n  },\r\n\r\n  reparent(newParent) {\r\n\r\n    const object = this.el.object3D\r\n    const oldParent = object.parent\r\n\r\n    if (object.parent === newParent) {\r\n        return;\r\n    }\r\n\r\n    objectEl = (o) => {\r\n        if (o.type === 'Scene') {\r\n            return (this.el.sceneEl)\r\n        }\r\n        else {\r\n            return o.el\r\n        }\r\n    }\r\n\r\n    console.log(`Reparenting ${object.el.id} from ${objectEl(oldParent).id} to ${objectEl(newParent).id}`);\r\n    \r\n    newParent.attach(object);\r\n  },\r\n});\r\n\n\n//# sourceURL=webpack://fusable-body/./node_modules/aframe-object-parent/index.js?");

/***/ }),

/***/ "./node_modules/aframe-raycast-target/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/aframe-raycast-target/index.js ***!
  \*****************************************************/
/***/ (() => {

eval("\r\n// Component used to mark an entity for raycasting, and optionally provide \r\n// another entity as a target (e.g. useful when raycasting against a low-poly mesh, rather than the target itself)\r\n//\r\n// Note that setting a target here doesn't change which entity will generate raycast / cursor events.\r\n// Applications written using cursor/raycaster need to be written to check for this configurattion and act on it.\r\n\r\nAFRAME.registerComponent('raycast-target', {\r\n    schema: {type: 'selector'},\r\n\r\n    init() {\r\n        this.target = this.data ? this.data : this.el\r\n    }\r\n})\r\n\n\n//# sourceURL=webpack://fusable-body/./node_modules/aframe-raycast-target/index.js?");

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
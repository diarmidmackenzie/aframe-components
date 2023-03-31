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

eval("__webpack_require__(/*! aframe-polygon-wireframe */ \"./node_modules/aframe-polygon-wireframe/index.js\")\r\n\r\nAFRAME.registerComponent(\"dynamic-snap\", {\r\n\r\n    schema: {\r\n\r\n    },\r\n\r\n    events: {\r\n      snapStart(e) { this.snapStart(e) },\r\n      snapEnd(e) { this.snapEnd(e) },\r\n      snapGrabbed(e) { this.grabbed(e) },\r\n      snapReleased(e) { this.released(e) },\r\n    },\r\n\r\n    init() {\r\n\r\n      this.projectedEl = document.createElement('a-entity')\r\n      const geometry = this.el.getAttribute('geometry')\r\n      this.projectedEl.setAttribute('geometry', geometry)\r\n      this.projectedEl.setAttribute('polygon-wireframe', {color: 'yellow', onTop: true})\r\n      this.projectedEl.object3D.visible = false\r\n      this.el.sceneEl.appendChild(this.projectedEl)\r\n      this.snappable = false\r\n\r\n    },\r\n\r\n    snapStart(evt) {\r\n\r\n      this.showProjectedObject(evt.detail.worldTransform)\r\n      this.snappable = true\r\n    },\r\n\r\n    snapEnd(evt) {\r\n\r\n      const transform = evt.detail.transform\r\n      this.snappable = false\r\n    },\r\n\r\n    showProjectedObject(worldTransform) {\r\n      \r\n      const projectedObject = this.projectedEl.object3D\r\n\r\n      projectedObject.position.copy(worldTransform.position)\r\n      projectedObject.quaternion.copy(worldTransform.quaternion)\r\n      projectedObject.scale.copy(worldTransform.scale)\r\n      projectedObject.visible = true\r\n\r\n    },\r\n\r\n    hideProjectedObject() {\r\n      this.projectedEl.object3D.visible = false\r\n    },\r\n\r\n    grabbed() {\r\n\r\n      if (this.snappable) {\r\n        this.showProjectedObject(this.projectedEl.object3D) \r\n      }\r\n    },\r\n\r\n    released() {\r\n      if (this.snappable) {\r\n\r\n        // this object takes transform of projected object, while keeping current parent.\r\n        const object = this.el.object3D\r\n        const parent = object.parent\r\n        const projectedObject = this.projectedEl.object3D\r\n\r\n        object.matrix.identity()\r\n        object.matrix.decompose(object.position, object.quaternion, object.scale)\r\n        projectedObject.add(object)\r\n        parent.attach(object)\r\n\r\n        hideProjectedObject()\r\n      }\r\n    }\r\n})\n\n//# sourceURL=webpack://aframe-dynamic-snap/./index.js?");

/***/ }),

/***/ "./node_modules/aframe-polygon-wireframe/index.js":
/*!********************************************************!*\
  !*** ./node_modules/aframe-polygon-wireframe/index.js ***!
  \********************************************************/
/***/ (() => {

eval("AFRAME.registerComponent(\"polygon-wireframe\", {\r\n\r\n    schema: {\r\n        color: { type: 'color', default: 'grey' },\r\n        dashed: { type: 'boolean', default: false },\r\n        dashSize: { type: 'number', default: 3 },\r\n        gapSize: { type: 'number', default: 1 },\r\n        dashScale: { type: 'number', default: 30 },\r\n        onTop: {type: 'boolean', default: false}\r\n    },\r\n\r\n    init() {\r\n      const baseGeometry = this.el.getObject3D('mesh').geometry\r\n      if (!baseGeometry) {\r\n          console.warn(\"polygon-wireframe: no base geometry found\")\r\n      };\r\n\r\n      this.edges = new THREE.EdgesGeometry( baseGeometry );\r\n    },\r\n\r\n    update() {\r\n\r\n        const oldMaterial = this.material\r\n        const oldLine = this.line\r\n\r\n        if (!this.data.dashed) {\r\n            this.material = new THREE.LineBasicMaterial( { color: this.data.color } )\r\n        }\r\n        else {\r\n            this.material = new THREE.LineDashedMaterial( { color: this.data.color,\r\n                                                            dashSize: this.data.dashSize,\r\n                                                            gapSize: this.data.gapSize,\r\n                                                            scale: this.data.dashScale } )\r\n        }\r\n\r\n        if (this.data.onTop) {\r\n          const material = this.material\r\n          material.depthWrite = false\r\n          material.depthTest = false\r\n          material.toneMapped = false\r\n          material.transparent = true\r\n        }\r\n        \r\n        this.line = new THREE.LineSegments( this.edges, this.material );\r\n        this.line.computeLineDistances();\r\n\r\n        this.el.object3D.add( this.line );\r\n\r\n        this.el.getObject3D('mesh').visible = false;\r\n\r\n        // dispose of old material & line\r\n        if (oldMaterial) {\r\n          oldMaterial.dispose()\r\n        }\r\n        if (oldLine) {\r\n          oldLine.removeFromParent()\r\n        }\r\n    }\r\n})\n\n//# sourceURL=webpack://aframe-dynamic-snap/./node_modules/aframe-polygon-wireframe/index.js?");

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
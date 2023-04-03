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

eval("if (!AFRAME.components['polygon-wireframe']) __webpack_require__(/*! aframe-polygon-wireframe */ \"./node_modules/aframe-polygon-wireframe/index.js\")\r\n\r\nAFRAME.registerComponent(\"dynamic-snap\", {\r\n\r\n    schema: {\r\n      divergeEvent: {type: 'string', default: 'mouseGrab'},\r\n      convergeEvent: {type: 'string', default: 'mouseRelease'},\r\n      renderSnap: {type: 'string', oneOf: ['object', 'wireframe', 'transparent', 'none'], default: 'transparent'},\r\n      renderPrecise: {type: 'string', oneOf: ['object', 'wireframe', 'transparent', 'none'], default: 'object'},\r\n      wireframeColor: { default: 'yellow' },\r\n      opacity: { default: 0.5 },\r\n    },\r\n\r\n    init() {\r\n\r\n      this.snapStart = this.snapStart.bind(this)\r\n      this.snapEnd = this.snapEnd.bind(this)\r\n      this.diverge = this.diverge.bind(this)\r\n      this.converge = this.converge.bind(this)\r\n      this.configureThisEl('object')\r\n      this.projectedEl = document.createElement('a-entity')\r\n      this.configureProjectedEl()\r\n      this.el.sceneEl.appendChild(this.projectedEl)\r\n      this.snappable = false\r\n      this.diverged = false\r\n\r\n      this.hideProjectedObject()\r\n    },\r\n\r\n    configureProjectedEl() {\r\n\r\n      const mesh = this.el.getObject3D('mesh')\r\n\r\n      if (mesh) {\r\n\r\n        const projectedMesh = mesh.clone(true)\r\n        this.projectedEl.setObject3D('mesh', projectedMesh)\r\n\r\n        this.setMaterials(this.projectedEl, projectedMesh, this.data.renderSnap)\r\n      }\r\n      else {\r\n        this.el.addEventListener('model-loaded', () => this.configureProjectedEl())\r\n      }\r\n    },\r\n\r\n    configureThisEl(renderString) {\r\n\r\n      const mesh = this.el.getObject3D('mesh')\r\n\r\n      if (mesh) {\r\n\r\n        this.setMaterials(this.el, mesh, renderString)\r\n      }\r\n      else {\r\n        this.el.addEventListener('model-loaded', () => {\r\n          this.configureThisEl(renderString)\r\n        })\r\n      }\r\n    },\r\n\r\n    setMaterials(el, mesh, renderString) {\r\n\r\n      const switchMaterials = (object, transparent) => {\r\n\r\n        const material = object.material\r\n        if (!material) return\r\n        const type = material.userData.type\r\n\r\n        if (!type) {\r\n          // uncloned material\r\n          material.userData.type = 'original'\r\n          const transparentClone = material.clone()\r\n          transparentClone.opacity = this.data.opacity\r\n          transparentClone.transparent = true\r\n          transparentClone.userData.type = 'transparentClone'\r\n          transparentClone.userData.original = material\r\n          material.userData.transparentClone = transparentClone\r\n        }\r\n        else if (type === 'original') {\r\n          if (transparent) {\r\n            object.material = material.userData.transparentClone\r\n          }\r\n        }\r\n        else if (type === 'transparentClone') {\r\n          if (!transparent) {\r\n            object.material = material.userData.original\r\n          }\r\n        }\r\n      }\r\n\r\n      if (renderString === 'wireframe') {\r\n        el.setAttribute('polygon-wireframe', {color: this.data.wireframeColor, onTop: true})\r\n      }\r\n      else {\r\n        el.removeAttribute('polygon-wireframe')\r\n      }\r\n\r\n      if (renderString === 'transparent') {\r\n        mesh.traverse((o) => {\r\n          switchMaterials(o, true)\r\n        })\r\n      }\r\n      else {\r\n        mesh.traverse((o) => {\r\n          switchMaterials(o, false)\r\n        })\r\n      }\r\n\r\n      if (renderString === 'none' || renderString === 'wireframe') {\r\n        // polygon-wireframe sets original mesh visibility to false.  Don't mess with this.\r\n        mesh.visible = false\r\n      }\r\n      else {\r\n        mesh.visible = true\r\n      }\r\n    },\r\n\r\n    addEventListeners() {\r\n      this.el.addEventListener('snapStart', this.snapStart)\r\n      this.el.addEventListener('snapEnd', this.snapEnd)\r\n      this.el.addEventListener(this.data.divergeEvent, this.diverge)\r\n      this.el.addEventListener(this.data.convergeEvent, this.converge)\r\n    },\r\n\r\n    removeEventListeners() {\r\n      this.el.removeEventListener('snapStart', this.snapStart)\r\n      this.el.removeEventListener('snapEnd', this.snapEnd)\r\n      this.el.removeEventListener(this.data.divergeEvent, this.diverge)\r\n      this.el.removeEventListener(this.data.convergeEvent, this.converge)\r\n    },\r\n\r\n    pause() {\r\n      this.removeEventListeners()\r\n    },\r\n\r\n    play() {\r\n      this.addEventListeners()\r\n    },\r\n\r\n    snapStart(evt) {\r\n\r\n      console.log(\"Snap Start: \", evt.detail.worldTransform)\r\n      this.snappable = true\r\n\r\n      if (this.diverged) {\r\n        this.showProjectedObject(evt.detail.worldTransform)\r\n      }\r\n    },\r\n\r\n    snapEnd(evt) {\r\n\r\n      console.log(\"Snap End: \", evt.detail.worldTransform)\r\n\r\n      const transform = evt.detail.transform\r\n      this.snappable = false\r\n    },\r\n\r\n    showProjectedObject(worldTransform) {\r\n      \r\n      const projectedObject = this.projectedEl.object3D\r\n\r\n      projectedObject.position.copy(worldTransform.position)\r\n      projectedObject.quaternion.copy(worldTransform.quaternion)\r\n      projectedObject.scale.copy(worldTransform.scale)\r\n      projectedObject.visible = true\r\n\r\n      // switch precise object to configured view.\r\n      this.configureThisEl(this.data.renderPrecise)\r\n    },\r\n\r\n    hideProjectedObject() {\r\n\r\n      this.projectedEl.object3D.visible = false\r\n\r\n      // switch precise object to standard visibility.\r\n      this.configureThisEl('object')\r\n    },\r\n\r\n    diverge() {\r\n\r\n      this.diverged = true\r\n      if (this.snappable) {\r\n        this.showProjectedObject(this.projectedEl.object3D) \r\n      }\r\n    },\r\n\r\n    converge() {\r\n\r\n      if (this.snappable) {\r\n\r\n        // this object takes transform of projected object, while keeping current parent.\r\n        const object = this.el.object3D\r\n        const parent = object.parent\r\n        const projectedObject = this.projectedEl.object3D\r\n\r\n        object.matrix.identity()\r\n        object.matrix.decompose(object.position, object.quaternion, object.scale)\r\n        projectedObject.add(object)\r\n        parent.attach(object)\r\n\r\n        this.hideProjectedObject()\r\n\r\n        this.el.emit('snapped-to-position')\r\n      }\r\n\r\n      this.diverged = false\r\n    }\r\n})\n\n//# sourceURL=webpack://aframe-dynamic-snap/./index.js?");

/***/ }),

/***/ "./node_modules/aframe-polygon-wireframe/index.js":
/*!********************************************************!*\
  !*** ./node_modules/aframe-polygon-wireframe/index.js ***!
  \********************************************************/
/***/ (() => {

eval("AFRAME.registerComponent(\"polygon-wireframe\", {\r\n\r\n    schema: {\r\n        color: { type: 'color', default: 'grey' },\r\n        dashed: { type: 'boolean', default: false },\r\n        dashSize: { type: 'number', default: 3 },\r\n        gapSize: { type: 'number', default: 1 },\r\n        dashScale: { type: 'number', default: 30 },\r\n        onTop: {type: 'boolean', default: false}\r\n    },\r\n\r\n    init() {\r\n      const baseGeometry = this.el.getObject3D('mesh').geometry\r\n      if (!baseGeometry) {\r\n          console.warn(\"polygon-wireframe: no base geometry found\")\r\n      };\r\n\r\n      this.edges = new THREE.EdgesGeometry( baseGeometry );\r\n    },\r\n\r\n    update() {\r\n\r\n        const oldMaterial = this.material\r\n        const oldLine = this.line\r\n\r\n        if (!this.data.dashed) {\r\n            this.material = new THREE.LineBasicMaterial( { color: this.data.color } )\r\n        }\r\n        else {\r\n            this.material = new THREE.LineDashedMaterial( { color: this.data.color,\r\n                                                            dashSize: this.data.dashSize,\r\n                                                            gapSize: this.data.gapSize,\r\n                                                            scale: this.data.dashScale } )\r\n        }\r\n\r\n        if (this.data.onTop) {\r\n          const material = this.material\r\n          material.depthWrite = false\r\n          material.depthTest = false\r\n          material.toneMapped = false\r\n          material.transparent = true\r\n        }\r\n        \r\n        this.line = new THREE.LineSegments( this.edges, this.material );\r\n        this.line.computeLineDistances();\r\n\r\n        this.el.object3D.add( this.line );\r\n\r\n        this.el.getObject3D('mesh').visible = false;\r\n\r\n        // dispose of old material & line\r\n        if (oldLine) {\r\n          oldLine.removeFromParent()\r\n        }\r\n        if (oldMaterial) {\r\n          oldMaterial.dispose()\r\n        }\r\n    },\r\n\r\n    remove() {\r\n      this.el.getObject3D('mesh').visible = true;\r\n      this.material.dispose()\r\n      this.line.removeFromParent()\r\n    }\r\n})\n\n//# sourceURL=webpack://aframe-dynamic-snap/./node_modules/aframe-polygon-wireframe/index.js?");

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
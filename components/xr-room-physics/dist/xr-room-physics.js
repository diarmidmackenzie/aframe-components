/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var ratk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ratk */ \"./node_modules/ratk/dist/index.js\");\n// Import the library\r\n\r\n\r\nAFRAME.registerSystem('xr-room-physics', {\r\n\r\n  schema: {\r\n    // when enabled, planes are rendered with random colors to aid in debugging.\r\n    debug: {default: false},\r\n\r\n    // depth (i.e. thickness) to use for walls and surfaces\r\n    depth: {default: 0.5},\r\n  },\r\n\r\n  init() {\r\n\r\n    if (this.el.sceneEl.getAttribute('physics')?.driver === \"ammo\") {\r\n      this.driver = \"ammo\"\r\n    }\r\n    else if (this.el.sceneEl.getAttribute('physx')) {\r\n      this.driver = \"physx\"\r\n    }\r\n    else {\r\n      this.driver = \"cannon\"\r\n    }\r\n\r\n    const scene = this.el.sceneEl.object3D\r\n    const renderer = this.el.sceneEl.renderer\r\n    const ratk = new ratk__WEBPACK_IMPORTED_MODULE_0__.RealityAccelerator(renderer.xr);\r\n    \r\n    ratk.onPlaneAdded = this.planeAdded.bind(this)\r\n    ratk.onPlaneDeleted = this.planeDeleted.bind(this)\r\n    scene.add(ratk.root);\r\n\r\n    this.ratk = ratk\r\n\r\n    // needed to work around Ammo.js shape generation bug.\r\n    this.adjustmentVector = new THREE.Vector3()\r\n  },\r\n\r\n  // Create an ExtrudeGeometry of appropriate depth.\r\n  // similar to:\r\n  // https://github.com/meta-quest/reality-accelerator-toolkit/blob/b1233141301ced3cc797857e2169f5957a913a96/src/Plane.ts#L48\r\n  createPrismGeometryFromPolygon(polygon) {\r\n\r\n    const planeShape = new THREE.Shape()\r\n    polygon.forEach((point, i) => {\r\n      if (i == 0) {\r\n        planeShape.moveTo(point.x, point.z);\r\n      } else {\r\n        planeShape.lineTo(point.x, point.z);\r\n      }\r\n    });\r\n    const geometry = new THREE.ExtrudeGeometry(planeShape, {depth: this.data.depth, bevelEnabled: false});\r\n    geometry.rotateX(-Math.PI / 2);\r\n\r\n    // center the geometry, as some physics engines assume that geometries are centered.\r\n    geometry.center();\r\n\r\n    return geometry;\r\n  },\r\n\r\n  planeAdded(plane) {\r\n\r\n    const el = document.createElement('a-entity')\r\n    // Can't do this - not an Object3D error\r\n    // this.el.setObject3D('plane', plane)\r\n    plane.el = el\r\n\r\n    // take position & orientation from the plane\r\n    el.object3D.position.copy(plane.position)\r\n    el.object3D.quaternion.copy(plane.quaternion)\r\n\r\n    // Best solution that works across physics engines is an ExtrudeGeometry\r\n    // Box doesn't work, as the plane can be any polygon.\r\n    // 2 x parallel planes worked in Cannon & Ammo, but not in PhysX, which models the two plans & the gap between them.\r\n    const prismGeometry = this.createPrismGeometryFromPolygon(plane.xrPlane.polygon);\r\n    const mesh = new THREE.Mesh(prismGeometry, plane.planeMesh.material)\r\n    el.setObject3D('mesh', mesh)\r\n\r\n    if (this.data.debug) {\r\n      var randomColor = Math.floor(Math.random()*16777215)\r\n\r\n      const material = new THREE.MeshBasicMaterial( {color: randomColor, side: THREE.DoubleSide} );\r\n      mesh.material = material\r\n    }\r\n\r\n    this.adjustmentVector.set(0, this.data.depth / 2, 0)\r\n    this.adjustmentVector.applyQuaternion(plane.quaternion)\r\n    el.object3D.position.add(this.adjustmentVector)\r\n\r\n    if (this.driver === 'ammo') {      \r\n      el.setAttribute('ammo-body', 'type: static')\r\n      el.setAttribute('ammo-shape', '')\r\n    }\r\n    else if (this.driver === 'physx') {\r\n      el.setAttribute('physx-body', 'type: static')\r\n    }\r\n    else {\r\n      el.setAttribute('static-body', '')\r\n    }\r\n    \r\n    this.el.sceneEl.appendChild(el)\r\n  },\r\n\r\n  planeDeleted(plane) {\r\n\r\n    const el = plane.el\r\n    el.parentNode.removeChild(el)\r\n\r\n  },\r\n\r\n  tick() {\r\n\r\n    this.ratk.update();\r\n\r\n    // what if plane position is updated?  How to refresh?\r\n  }\r\n})\r\n\n\n//# sourceURL=webpack://aframe-xr-room-physics/./index.js?");

/***/ }),

/***/ "./node_modules/ratk/dist/Anchor.js":
/*!******************************************!*\
  !*** ./node_modules/ratk/dist/Anchor.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\n/**\n * Copyright (c) Meta Platforms, Inc. and affiliates.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.deleteAnchorPersistence = exports.restoreAnchorFromUUID = exports.createAnchorFromTransform = exports.Anchor = void 0;\nconst TransformObject_1 = __webpack_require__(/*! ./TransformObject */ \"./node_modules/ratk/dist/TransformObject.js\");\nclass Anchor extends TransformObject_1.TransformObject {\n    _xrAnchor;\n    persistenceDeletionPending = false;\n    anchorID;\n    constructor(xrAnchor, uuid = null) {\n        super(xrAnchor.anchorSpace);\n        this._xrAnchor = xrAnchor;\n        this.anchorID = uuid;\n    }\n    get xrAnchor() {\n        return this._xrAnchor;\n    }\n    get isPersistent() {\n        return this.anchorID != null;\n    }\n    async makePersistent() {\n        // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n        // @ts-ignore\n        if (!this._xrAnchor.requestPersistentHandle) {\n            throw new DOMException('feature not supported by browser', 'NotSupportedError');\n        }\n        else if (this.isPersistent) {\n            throw new DOMException('anchor is already persistent', 'InvalidStateError');\n        }\n        // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n        // @ts-ignore\n        this.anchorID = await this._xrAnchor.requestPersistentHandle();\n    }\n    async makeNonPersistent() {\n        this.persistenceDeletionPending = true;\n    }\n}\nexports.Anchor = Anchor;\nconst createAnchorFromTransform = async (xrManager, position, quaternion) => {\n    const frame = xrManager.getFrame();\n    const refSpace = xrManager.getReferenceSpace();\n    const anchorPose = new XRRigidTransform({\n        x: position.x,\n        y: position.y,\n        z: position.z,\n    }, {\n        x: quaternion.x,\n        y: quaternion.y,\n        z: quaternion.z,\n        w: quaternion.w,\n    });\n    const xrAnchor = await frame.createAnchor(anchorPose, refSpace);\n    const anchor = new Anchor(xrAnchor);\n    return anchor;\n};\nexports.createAnchorFromTransform = createAnchorFromTransform;\nconst restoreAnchorFromUUID = async (xrManager, uuid) => {\n    const session = xrManager.getSession();\n    // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n    // @ts-ignore\n    if (!session.restorePersistentAnchor) {\n        throw new DOMException('feature not supported by browser', 'NotSupportedError');\n    }\n    // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n    // @ts-ignore\n    const xrAnchor = await session.restorePersistentAnchor(uuid);\n    const anchor = new Anchor(xrAnchor, uuid);\n    return anchor;\n};\nexports.restoreAnchorFromUUID = restoreAnchorFromUUID;\nconst deleteAnchorPersistence = async (anchor, xrManager) => {\n    if (anchor.isPersistent) {\n        const session = xrManager.getSession();\n        // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n        // @ts-ignore\n        if (!session.deletePersistentAnchor) {\n            throw new DOMException('feature not supported by browser', 'NotSupportedError');\n        }\n        // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n        // @ts-ignore\n        await session.deletePersistentAnchor(anchor.anchorID);\n        anchor.anchorID = null;\n    }\n};\nexports.deleteAnchorPersistence = deleteAnchorPersistence;\n//# sourceMappingURL=Anchor.js.map\n\n//# sourceURL=webpack://aframe-xr-room-physics/./node_modules/ratk/dist/Anchor.js?");

/***/ }),

/***/ "./node_modules/ratk/dist/HitTestTarget.js":
/*!*************************************************!*\
  !*** ./node_modules/ratk/dist/HitTestTarget.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\n/**\n * Copyright (c) Meta Platforms, Inc. and affiliates.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.createHitTestTargetFromSpace = exports.updateHitTestTarget = exports.HitTestTarget = void 0;\nconst three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.cjs\");\nclass HitTestTarget extends three_1.Group {\n    _xrHitTestSource;\n    hitTestResultValid = false;\n    hitTestResults;\n    constructor(xrHitTestSource) {\n        super();\n        this._xrHitTestSource = xrHitTestSource;\n    }\n    get xrHitTestSource() {\n        return this._xrHitTestSource;\n    }\n}\nexports.HitTestTarget = HitTestTarget;\nconst updateHitTestTarget = (hitTestTarget, xrManager) => {\n    const frame = xrManager.getFrame();\n    const refSpace = xrManager.getReferenceSpace();\n    hitTestTarget.hitTestResults = frame.getHitTestResults(hitTestTarget.xrHitTestSource);\n    hitTestTarget.hitTestResultValid = false;\n    if (hitTestTarget.hitTestResults.length > 0) {\n        const hitPose = hitTestTarget.hitTestResults[0].getPose(refSpace);\n        hitTestTarget.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);\n        hitTestTarget.quaternion.set(hitPose.transform.orientation.x, hitPose.transform.orientation.y, hitPose.transform.orientation.z, hitPose.transform.orientation.w);\n        hitTestTarget.hitTestResultValid = true;\n    }\n};\nexports.updateHitTestTarget = updateHitTestTarget;\nconst createHitTestTargetFromSpace = async (xrManager, space, offsetOrigin, offsetDirection) => {\n    const xrHitTestSource = await xrManager.getSession().requestHitTestSource({\n        space: space,\n        offsetRay: new XRRay({\n            x: offsetOrigin.x,\n            y: offsetOrigin.y,\n            z: offsetOrigin.z,\n            w: 1,\n        }, {\n            x: offsetDirection.x,\n            y: offsetDirection.y,\n            z: offsetDirection.z,\n            w: 0,\n        }),\n    });\n    const hitTestTarget = new HitTestTarget(xrHitTestSource);\n    return hitTestTarget;\n};\nexports.createHitTestTargetFromSpace = createHitTestTargetFromSpace;\n//# sourceMappingURL=HitTestTarget.js.map\n\n//# sourceURL=webpack://aframe-xr-room-physics/./node_modules/ratk/dist/HitTestTarget.js?");

/***/ }),

/***/ "./node_modules/ratk/dist/Plane.js":
/*!*****************************************!*\
  !*** ./node_modules/ratk/dist/Plane.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\n/**\n * Copyright (c) Meta Platforms, Inc. and affiliates.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.updatePlane = exports.Plane = void 0;\nconst three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.cjs\");\nconst TransformObject_1 = __webpack_require__(/*! ./TransformObject */ \"./node_modules/ratk/dist/TransformObject.js\");\nclass Plane extends TransformObject_1.TransformObject {\n    _xrPlane;\n    needsUpdate = true;\n    lastUpdatedByRATK = -Infinity;\n    planeMesh;\n    boundingRectangleWidth;\n    boundingRectangleHeight;\n    constructor(xrPlane) {\n        super(xrPlane.planeSpace);\n        this._xrPlane = xrPlane;\n    }\n    get xrPlane() {\n        return this._xrPlane;\n    }\n    get lastUpdated() {\n        return this._xrPlane.lastChangedTime;\n    }\n}\nexports.Plane = Plane;\nconst createGeometryFromPolygon = (polygon) => {\n    const planeShape = new three_1.Shape();\n    polygon.forEach((point, i) => {\n        if (i == 0) {\n            planeShape.moveTo(point.x, point.z);\n        }\n        else {\n            planeShape.lineTo(point.x, point.z);\n        }\n    });\n    const geometry = new three_1.ShapeGeometry(planeShape);\n    geometry.rotateX(-Math.PI / 2);\n    return geometry;\n};\nconst calculateBoundingRectangleDimension = (polygon) => {\n    let minx = Infinity;\n    let minz = Infinity;\n    let maxx = -Infinity;\n    let maxz = -Infinity;\n    polygon.forEach((point) => {\n        minx = Math.min(minx, point.x);\n        minz = Math.min(minz, point.z);\n        maxx = Math.max(maxx, point.x);\n        maxz = Math.max(maxz, point.z);\n    });\n    return [maxx - minx, maxz - minz];\n};\nconst updatePlane = (plane, xrManager) => {\n    if (plane.xrPlane.lastChangedTime <= plane.lastUpdatedByRATK)\n        return;\n    (0, TransformObject_1.updateTransformObject)(plane, xrManager);\n    const planeGeometry = createGeometryFromPolygon(plane.xrPlane.polygon);\n    if (plane.planeMesh) {\n        plane.planeMesh.geometry.dispose();\n        plane.planeMesh.geometry = planeGeometry;\n    }\n    else {\n        plane.planeMesh = new three_1.Mesh(planeGeometry, new three_1.MeshBasicMaterial());\n        plane.add(plane.planeMesh);\n    }\n    [plane.boundingRectangleWidth, plane.boundingRectangleHeight] =\n        calculateBoundingRectangleDimension(plane.xrPlane.polygon);\n    plane.lastUpdatedByRATK = plane.xrPlane.lastChangedTime;\n};\nexports.updatePlane = updatePlane;\n//# sourceMappingURL=Plane.js.map\n\n//# sourceURL=webpack://aframe-xr-room-physics/./node_modules/ratk/dist/Plane.js?");

/***/ }),

/***/ "./node_modules/ratk/dist/RealityAccelerator.js":
/*!******************************************************!*\
  !*** ./node_modules/ratk/dist/RealityAccelerator.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\n/**\n * Copyright (c) Meta Platforms, Inc. and affiliates.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.RealityAccelerator = void 0;\nconst Anchor_1 = __webpack_require__(/*! ./Anchor */ \"./node_modules/ratk/dist/Anchor.js\");\nconst three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.cjs\");\nconst HitTestTarget_1 = __webpack_require__(/*! ./HitTestTarget */ \"./node_modules/ratk/dist/HitTestTarget.js\");\nconst Plane_1 = __webpack_require__(/*! ./Plane */ \"./node_modules/ratk/dist/Plane.js\");\nconst TransformObject_1 = __webpack_require__(/*! ./TransformObject */ \"./node_modules/ratk/dist/TransformObject.js\");\nclass RealityAccelerator {\n    _xrManager;\n    _planes;\n    _anchors;\n    _hitTestTargets;\n    _root;\n    constructor(xrManager) {\n        this._xrManager = xrManager;\n        this._planes = new Set();\n        this._anchors = new Set();\n        this._hitTestTargets = new Set();\n        this._root = new three_1.Group();\n    }\n    get root() {\n        return this._root;\n    }\n    get planes() {\n        return this._planes;\n    }\n    get anchors() {\n        return this._anchors;\n    }\n    get hitTestTargets() {\n        return this._hitTestTargets;\n    }\n    get persistentAnchors() {\n        return new Set(Array.from(this._anchors).filter((anchor) => anchor.isPersistent));\n    }\n    onPlaneAdded;\n    onPlaneDeleted;\n    update() {\n        if (!this._xrManager.isPresenting)\n            return;\n        const frame = this._xrManager.getFrame();\n        this._checkPlaneDiff(frame);\n        this.planes.forEach((plane) => {\n            (0, Plane_1.updatePlane)(plane, this._xrManager);\n        });\n        this.anchors.forEach((anchor) => {\n            (0, TransformObject_1.updateTransformObject)(anchor, this._xrManager);\n        });\n        this._hitTestTargets.forEach((hitTestTarget) => {\n            (0, HitTestTarget_1.updateHitTestTarget)(hitTestTarget, this._xrManager);\n        });\n    }\n    _checkPlaneDiff(frame) {\n        // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n        // @ts-ignore\n        const detectedPlanes = frame.detectedPlanes;\n        const newXrPlanes = [];\n        detectedPlanes.forEach((xrPlane) => {\n            let match = false;\n            this._planes.forEach((plane) => {\n                if (plane.xrPlane === xrPlane)\n                    match = true;\n            });\n            if (!match)\n                newXrPlanes.push(xrPlane);\n        });\n        const deletedPlanes = [];\n        this._planes.forEach((plane) => {\n            if (!detectedPlanes.has(plane.xrPlane)) {\n                deletedPlanes.push(plane);\n            }\n        });\n        newXrPlanes.forEach((xrPlane) => {\n            const plane = new Plane_1.Plane(xrPlane);\n            (0, Plane_1.updatePlane)(plane, this._xrManager);\n            this._root.add(plane);\n            if (this.onPlaneAdded) {\n                this.onPlaneAdded(plane);\n            }\n            this._planes.add(plane);\n        });\n        deletedPlanes.forEach((plane) => {\n            if (this.onPlaneDeleted) {\n                this.onPlaneDeleted(plane);\n            }\n            this._root.remove(plane);\n            this._planes.delete(plane);\n        });\n    }\n    async createAnchor(position, quaternion, persistent = false) {\n        const anchor = await (0, Anchor_1.createAnchorFromTransform)(this._xrManager, position, quaternion);\n        this._root.add(anchor);\n        this._anchors.add(anchor);\n        if (persistent) {\n            await anchor.makePersistent();\n        }\n        return anchor;\n    }\n    async deleteAnchor(anchor) {\n        if (anchor.isPersistent) {\n            await (0, Anchor_1.deleteAnchorPersistence)(anchor, this._xrManager);\n        }\n        this._anchors.delete(anchor);\n        this._root.remove(anchor);\n        anchor.xrAnchor.delete();\n    }\n    async restorePersistentAnchors() {\n        const session = this._xrManager.getSession();\n        // eslint-disable-next-line @typescript-eslint/ban-ts-comment\n        // @ts-ignore\n        const persistentAnchors = session.persistentAnchors;\n        if (!persistentAnchors) {\n            throw new DOMException('feature not supported by browser', 'NotSupportedError');\n        }\n        for (const anchorId of persistentAnchors) {\n            const anchor = await (0, Anchor_1.restoreAnchorFromUUID)(this._xrManager, anchorId);\n            this._root.add(anchor);\n            this._anchors.add(anchor);\n        }\n    }\n    async createHitTestTargetFromSpace(space, offsetOrigin = new three_1.Vector3(0, 0, 0), offsetDirection = new three_1.Vector3(0, 0, -1)) {\n        const hitTestTarget = await (0, HitTestTarget_1.createHitTestTargetFromSpace)(this._xrManager, space, offsetOrigin, offsetDirection);\n        this._root.add(hitTestTarget);\n        this._hitTestTargets.add(hitTestTarget);\n        return hitTestTarget;\n    }\n    async createHitTestTargetFromViewerSpace(offsetOrigin = new three_1.Vector3(0, 0, 0), offsetDirection = new three_1.Vector3(0, 0, -1)) {\n        const viewerSpace = await this._xrManager\n            .getSession()\n            .requestReferenceSpace('viewer');\n        return await this.createHitTestTargetFromSpace(viewerSpace, offsetOrigin, offsetDirection);\n    }\n    async createHitTestTargetFromControllerSpace(handedness, offsetOrigin = new three_1.Vector3(0, 0, 0), offsetDirection = new three_1.Vector3(0, 0, -1)) {\n        let xrInputSource = null;\n        this._xrManager.getSession().inputSources.forEach((source) => {\n            if (source.handedness === handedness) {\n                xrInputSource = source;\n            }\n        });\n        if (!xrInputSource)\n            throw new DOMException('requested XRInputSource cannot be found', 'NotFoundError');\n        return await this.createHitTestTargetFromSpace(xrInputSource.targetRaySpace, offsetOrigin, offsetDirection);\n    }\n    deleteHitTestTarget(hitTestTarget) {\n        hitTestTarget.xrHitTestSource.cancel();\n        this._root.remove(hitTestTarget);\n        this._hitTestTargets.delete(hitTestTarget);\n    }\n}\nexports.RealityAccelerator = RealityAccelerator;\n//# sourceMappingURL=RealityAccelerator.js.map\n\n//# sourceURL=webpack://aframe-xr-room-physics/./node_modules/ratk/dist/RealityAccelerator.js?");

/***/ }),

/***/ "./node_modules/ratk/dist/TransformObject.js":
/*!***************************************************!*\
  !*** ./node_modules/ratk/dist/TransformObject.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\n/**\n * Copyright (c) Meta Platforms, Inc. and affiliates.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.updateTransformObject = exports.TransformObject = void 0;\nconst three_1 = __webpack_require__(/*! three */ \"./node_modules/three/build/three.cjs\");\nclass TransformObject extends three_1.Group {\n    _xrSpace;\n    needsUpdate = true;\n    constructor(xrSpace) {\n        super();\n        this._xrSpace = xrSpace;\n    }\n    get xrSpace() {\n        return this._xrSpace;\n    }\n}\nexports.TransformObject = TransformObject;\nconst tempVec3 = new three_1.Vector3();\nconst updateTransformObject = (transformObject, xrManager) => {\n    const frame = xrManager.getFrame();\n    const refSpace = xrManager.getReferenceSpace();\n    const pose = frame.getPose(transformObject.xrSpace, refSpace);\n    new three_1.Matrix4()\n        .fromArray(pose.transform.matrix)\n        .decompose(transformObject.position, transformObject.quaternion, tempVec3);\n};\nexports.updateTransformObject = updateTransformObject;\n//# sourceMappingURL=TransformObject.js.map\n\n//# sourceURL=webpack://aframe-xr-room-physics/./node_modules/ratk/dist/TransformObject.js?");

/***/ }),

/***/ "./node_modules/ratk/dist/index.js":
/*!*****************************************!*\
  !*** ./node_modules/ratk/dist/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\n/**\n * Copyright (c) Meta Platforms, Inc. and affiliates.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.RealityAccelerator = exports.HitTestTarget = exports.Plane = exports.Anchor = exports.TransformObject = void 0;\nvar TransformObject_1 = __webpack_require__(/*! ./TransformObject */ \"./node_modules/ratk/dist/TransformObject.js\");\nObject.defineProperty(exports, \"TransformObject\", ({ enumerable: true, get: function () { return TransformObject_1.TransformObject; } }));\nvar Anchor_1 = __webpack_require__(/*! ./Anchor */ \"./node_modules/ratk/dist/Anchor.js\");\nObject.defineProperty(exports, \"Anchor\", ({ enumerable: true, get: function () { return Anchor_1.Anchor; } }));\nvar Plane_1 = __webpack_require__(/*! ./Plane */ \"./node_modules/ratk/dist/Plane.js\");\nObject.defineProperty(exports, \"Plane\", ({ enumerable: true, get: function () { return Plane_1.Plane; } }));\nvar HitTestTarget_1 = __webpack_require__(/*! ./HitTestTarget */ \"./node_modules/ratk/dist/HitTestTarget.js\");\nObject.defineProperty(exports, \"HitTestTarget\", ({ enumerable: true, get: function () { return HitTestTarget_1.HitTestTarget; } }));\nvar RealityAccelerator_1 = __webpack_require__(/*! ./RealityAccelerator */ \"./node_modules/ratk/dist/RealityAccelerator.js\");\nObject.defineProperty(exports, \"RealityAccelerator\", ({ enumerable: true, get: function () { return RealityAccelerator_1.RealityAccelerator; } }));\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack://aframe-xr-room-physics/./node_modules/ratk/dist/index.js?");

/***/ }),

/***/ "./node_modules/three/build/three.cjs":
/*!********************************************!*\
  !*** ./node_modules/three/build/three.cjs ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {


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
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
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
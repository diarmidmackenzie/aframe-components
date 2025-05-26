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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles.css */ \"./styles.css\");\n\r\n\r\nAFRAME.registerComponent('stats-panel', {\r\n  schema: {\r\n    merge: {type: 'boolean', default: true}\r\n  },\r\n\r\n  init() {\r\n\r\n    const container = document.querySelector('.rs-container')\r\n\r\n    if (container && this.data.merge) {\r\n      //stats panel exists, just merge into it.\r\n      this.container = container\r\n      return;\r\n    }\r\n\r\n    // if stats panel doesn't exist, add one to support our custom stats.\r\n    this.base = document.createElement('div')\r\n    this.base.classList.add('rs-base')\r\n    const body = document.body || document.getElementsByTagName('body')[0]\r\n\r\n    if (container && !this.data.merge) {\r\n      this.base.style.top = \"auto\"\r\n      this.base.style.bottom = \"20px\"\r\n    }\r\n\r\n    body.appendChild(this.base)\r\n\r\n    this.container = document.createElement('div')\r\n    this.container.classList.add('rs-container')\r\n    this.base.appendChild(this.container)\r\n  }\r\n});\r\n\r\nAFRAME.registerComponent('stats-group', {\r\n  multiple: true,\r\n  schema: {\r\n    label: {type: 'string'}\r\n  },\r\n\r\n  init() {\r\n\r\n    let container\r\n    const baseComponent = this.el.components['stats-panel']\r\n    if (baseComponent) {\r\n      container = baseComponent.container\r\n    }\r\n    else {\r\n      container = document.querySelector('.rs-container')\r\n    }\r\n\r\n    if (!container) {\r\n      console.warn(`Couldn't find stats container to add stats to.\r\n                    Add either stats or stats-panel component to a-scene`)\r\n      return;\r\n    }\r\n    \r\n    this.groupHeader = document.createElement('h1')\r\n    this.groupHeader.innerHTML = this.data.label\r\n    container.appendChild(this.groupHeader)\r\n\r\n    this.group = document.createElement('div')\r\n    this.group.classList.add('rs-group')\r\n    // rs-group hs style flex-direction of 'column-reverse'\r\n    // No idea why it's like that, but it's not what we want for our stats.\r\n    // We prefer them rendered in the order speified.\r\n    // So override this style.\r\n    this.group.style.flexDirection = 'column'\r\n    this.group.style.webKitFlexDirection = 'column'\r\n    container.appendChild(this.group)\r\n  }\r\n});\r\n\r\nAFRAME.registerComponent('stats-row', {\r\n  multiple: true,\r\n  schema: {\r\n    // name of the group to add the stats row to.\r\n    group: {type: 'string'},\r\n\r\n    // name of an event to listen for\r\n    event: {type: 'string'},\r\n\r\n    // property from event to output in stats panel\r\n    properties: {type: 'array'},\r\n\r\n    // label for the row in the stats panel\r\n    label: {type: 'string'}\r\n  },\r\n\r\n  init () {\r\n\r\n    const groupComponentName = \"stats-group__\" + this.data.group\r\n    const groupComponent = this.el.components[groupComponentName] ||\r\n                           this.el.sceneEl.components[groupComponentName] ||\r\n                           this.el.components[\"stats-group\"] ||\r\n                           this.el.sceneEl.components[\"stats-group\"]\r\n\r\n    if (!groupComponent) {\r\n      console.warn(`Couldn't find stats group ${groupComponentName}`)\r\n      return;\r\n    }\r\n  \r\n    this.counter = document.createElement('div')\r\n    this.counter.classList.add('rs-counter-base')\r\n    groupComponent.group.appendChild(this.counter)\r\n\r\n    this.counterId = document.createElement('div')\r\n    this.counterId.classList.add('rs-counter-id')\r\n    this.counterId.innerHTML = this.data.label\r\n    this.counter.appendChild(this.counterId)\r\n\r\n    this.counterValues = {}\r\n    this.data.properties.forEach((property) => {\r\n      const counterValue = document.createElement('div')\r\n      counterValue.classList.add('rs-counter-value')\r\n      counterValue.innerHTML = \"...\"\r\n      this.counter.appendChild(counterValue)\r\n      this.counterValues[property] = counterValue\r\n    })\r\n\r\n    this.updateStatsData = this.updateStatsData.bind(this)\r\n    this.el.addEventListener(this.data.event, this.updateStatsData)\r\n\r\n    this.splitCache = {}\r\n  },\r\n\r\n  updateStatsData(e) {\r\n\r\n    if (!this.data.properties) return\r\n    \r\n    this.data.properties.forEach((property) => {\r\n      const split = this.splitDot(property);\r\n      let value = e.detail;\r\n      for (let i = 0; i < split.length; i++) {\r\n        value = value[split[i]];\r\n      }\r\n      this.counterValues[property].innerHTML = value\r\n    })\r\n  },\r\n\r\n  splitDot (path) {\r\n    if (path in this.splitCache) { return this.splitCache[path]; }\r\n    this.splitCache[path] = path.split('.');\r\n    return this.splitCache[path];\r\n  }\r\n\r\n});\r\n\r\nAFRAME.registerComponent('stats-collector', {\r\n  multiple: true,\r\n\r\n  schema: {\r\n    // name of an event to listen for\r\n    inEvent: {type: 'string'},\r\n\r\n    // property from event to output in stats panel\r\n    properties: {type: 'array'},\r\n\r\n    // frequency of output in terms of events received.\r\n    outputFrequency: {type: 'number', default: 100},\r\n\r\n    // name of event to emit\r\n    outEvent: {type: 'string'},\r\n    \r\n    // outputs (generated for each property)\r\n    // Combination of: mean, max, percentile__XX.X (where XX.X is a number)\r\n    outputs: {type: 'array'},\r\n\r\n    // Whether to output to console as well as generating events\r\n    // If a string is specified, this is output to console, together with the event data\r\n    // If no string is specified, nothing is output to console.\r\n    outputToConsole: {type: 'string'}\r\n  },\r\n\r\n  init() {\r\n    \r\n    this.statsData = {}\r\n    this.resetData()\r\n    this.outputDetail = {}\r\n    this.data.properties.forEach((property) => {\r\n      this.outputDetail[property] = {}\r\n    })\r\n\r\n    this.statsReceived = this.statsReceived.bind(this)\r\n    this.el.addEventListener(this.data.inEvent, this.statsReceived)\r\n  },\r\n  \r\n  resetData() {\r\n\r\n    this.counter = 0\r\n    this.data.properties.forEach((property) => {\r\n      \r\n      // For calculating percentiles like 0.01 and 99.9% we'll want to store\r\n      // additional data - something like this...\r\n      // Store off outliers, and discard data.\r\n      // const min = Math.min(...this.statsData[property])\r\n      // this.lowOutliers[property].push(min)\r\n      // const max = Math.max(...this.statsData[property])\r\n      // this.highOutliers[property].push(max)\r\n\r\n      this.statsData[property] = []\r\n    })\r\n  },\r\n\r\n  statsReceived(e) {\r\n\r\n    this.updateStatsData(e.detail)\r\n\r\n    this.counter++ \r\n    if (this.counter === this.data.outputFrequency) {\r\n      this.outputData()\r\n      this.resetData()\r\n    }\r\n  },\r\n\r\n  updateStatsData(detail) {\r\n\r\n    this.data.properties.forEach((property) => {\r\n      let value = detail;\r\n      value = value[property];\r\n      this.statsData[property].push(value)\r\n    })\r\n  },\r\n\r\n  outputData() {\r\n    this.data.properties.forEach((property) => {\r\n      this.data.outputs.forEach((output) => {\r\n        this.outputDetail[property][output] = this.computeOutput(output, this.statsData[property])\r\n      })\r\n    })\r\n\r\n    if (this.data.outEvent) {\r\n      this.el.emit(this.data.outEvent, this.outputDetail)\r\n    }\r\n\r\n    if (this.data.outputToConsole) {\r\n      console.log(this.data.outputToConsole, this.outputDetail)\r\n    }\r\n  },\r\n\r\n  computeOutput(outputInstruction, data) {\r\n\r\n    const outputInstructions = outputInstruction.split(\"__\")\r\n    const outputType = outputInstructions[0]\r\n    let output\r\n\r\n    switch (outputType) {\r\n      case \"mean\":\r\n        output = data.reduce((a, b) => a + b, 0) / data.length;\r\n        break;\r\n      \r\n      case \"max\":\r\n        output = Math.max(...data)\r\n        break;\r\n\r\n      case \"min\":\r\n        output = Math.min(...data)\r\n        break;\r\n\r\n      case \"percentile\":\r\n        const sorted = data.sort((a, b) => a - b)\r\n        // decimal percentiles encoded like 99+9 rather than 99.9 due to \".\" being used as a \r\n        // separator for nested properties.\r\n        const percentileString = outputInstructions[1].replace(\"_\", \".\")\r\n        const proportion = +percentileString / 100\r\n\r\n        // Note that this calculation of the percentile is inaccurate when there is insufficient data\r\n        // e.g. for 0.1th or 99.9th percentile when only 100 data points.\r\n        // Greater accuracy would require storing off more data (specifically outliers) and folding these\r\n        // into the computation.\r\n        const position = (data.length - 1) * proportion\r\n        const base = Math.floor(position)\r\n        const delta = position - base;\r\n        if (sorted[base + 1] !== undefined) {\r\n            output = sorted[base] + delta * (sorted[base + 1] - sorted[base]);\r\n        } else {\r\n            output = sorted[base];\r\n        }\r\n        break;\r\n    }\r\n    return output.toFixed(2)\r\n  }\r\n});\r\n\n\n//# sourceURL=webpack://aframe-stats-panel/./index.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./styles.css":
/*!**********************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./styles.css ***!
  \**********************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/noSourceMaps.js */ \"./node_modules/css-loader/dist/runtime/noSourceMaps.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);\n// Imports\n\n\nvar ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, `.rs-base {\r\n  background-color: #333;\r\n  color: #fafafa;\r\n  border-radius: 0;\r\n  font: 10px monospace;\r\n  left: 5px;\r\n  line-height: 1em;\r\n  opacity: 0.85;\r\n  overflow: hidden;\r\n  padding: 10px;\r\n  position: fixed;\r\n  top: 53px;\r\n  width: 300px;\r\n  z-index: 10000;\r\n}\r\n\r\n.rs-base div.hidden {\r\n  display: none;\r\n}\r\n\r\n.rs-base h1 {\r\n  color: #fff;\r\n  cursor: pointer;\r\n  font-size: 1.4em;\r\n  font-weight: 300;\r\n  margin: 0 0 5px;\r\n  padding: 0;\r\n}\r\n\r\n.rs-group {\r\n  display: -webkit-box;\r\n  display: -webkit-flex;\r\n  display: flex;\r\n  -webkit-flex-direction: column-reverse;\r\n  flex-direction: column-reverse;\r\n  margin-bottom: 5px;\r\n}\r\n\r\n.rs-group:last-child {\r\n  margin-bottom: 0;\r\n}\r\n\r\n.rs-counter-base {\r\n  align-items: center;\r\n  display: -webkit-box;\r\n  display: -webkit-flex;\r\n  display: flex;\r\n  height: 10px;\r\n  -webkit-justify-content: space-between;\r\n  justify-content: space-between;\r\n  margin: 2px 0;\r\n}\r\n\r\n.rs-counter-base.alarm {\r\n  color: #b70000;\r\n  text-shadow: 0 0 0 #b70000,\r\n               0 0 1px #fff,\r\n               0 0 1px #fff,\r\n               0 0 2px #fff,\r\n               0 0 2px #fff,\r\n               0 0 3px #fff,\r\n               0 0 3px #fff,\r\n               0 0 4px #fff,\r\n               0 0 4px #fff;\r\n}\r\n\r\n.rs-counter-id {\r\n  font-weight: 300;\r\n  -webkit-box-ordinal-group: 0;\r\n  -webkit-order: 0;\r\n  order: 0;\r\n  width: 54px;\r\n}\r\n\r\n.rs-counter-value {\r\n  font-weight: 300;\r\n  -webkit-box-ordinal-group: 1;\r\n  -webkit-order: 1;\r\n  order: 1;\r\n  text-align: right;\r\n  width: 35px;\r\n}\r\n\r\n.rs-canvas {\r\n  -webkit-box-ordinal-group: 2;\r\n  -webkit-order: 2;\r\n  order: 2;\r\n}\r\n\r\n@media (min-width: 480px) {\r\n  .rs-base {\r\n    left: 20px;\r\n    top: 68px;\r\n  }\r\n}\r\n`, \"\"]);\n// Exports\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);\n\n\n//# sourceURL=webpack://aframe-stats-panel/./styles.css?./node_modules/css-loader/dist/cjs.js");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\nmodule.exports = function (cssWithMappingToString) {\n  var list = [];\n\n  // return the list of modules as css string\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = \"\";\n      var needLayer = typeof item[5] !== \"undefined\";\n      if (item[4]) {\n        content += \"@supports (\".concat(item[4], \") {\");\n      }\n      if (item[2]) {\n        content += \"@media \".concat(item[2], \" {\");\n      }\n      if (needLayer) {\n        content += \"@layer\".concat(item[5].length > 0 ? \" \".concat(item[5]) : \"\", \" {\");\n      }\n      content += cssWithMappingToString(item);\n      if (needLayer) {\n        content += \"}\";\n      }\n      if (item[2]) {\n        content += \"}\";\n      }\n      if (item[4]) {\n        content += \"}\";\n      }\n      return content;\n    }).join(\"\");\n  };\n\n  // import a list of modules into the list\n  list.i = function i(modules, media, dedupe, supports, layer) {\n    if (typeof modules === \"string\") {\n      modules = [[null, modules, undefined]];\n    }\n    var alreadyImportedModules = {};\n    if (dedupe) {\n      for (var k = 0; k < this.length; k++) {\n        var id = this[k][0];\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n    for (var _k = 0; _k < modules.length; _k++) {\n      var item = [].concat(modules[_k]);\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        continue;\n      }\n      if (typeof layer !== \"undefined\") {\n        if (typeof item[5] === \"undefined\") {\n          item[5] = layer;\n        } else {\n          item[1] = \"@layer\".concat(item[5].length > 0 ? \" \".concat(item[5]) : \"\", \" {\").concat(item[1], \"}\");\n          item[5] = layer;\n        }\n      }\n      if (media) {\n        if (!item[2]) {\n          item[2] = media;\n        } else {\n          item[1] = \"@media \".concat(item[2], \" {\").concat(item[1], \"}\");\n          item[2] = media;\n        }\n      }\n      if (supports) {\n        if (!item[4]) {\n          item[4] = \"\".concat(supports);\n        } else {\n          item[1] = \"@supports (\".concat(item[4], \") {\").concat(item[1], \"}\");\n          item[4] = supports;\n        }\n      }\n      list.push(item);\n    }\n  };\n  return list;\n};\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/noSourceMaps.js":
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/noSourceMaps.js ***!
  \**************************************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = function (i) {\n  return i[1];\n};\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/css-loader/dist/runtime/noSourceMaps.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

eval("\n\nvar stylesInDOM = [];\nfunction getIndexByIdentifier(identifier) {\n  var result = -1;\n  for (var i = 0; i < stylesInDOM.length; i++) {\n    if (stylesInDOM[i].identifier === identifier) {\n      result = i;\n      break;\n    }\n  }\n  return result;\n}\nfunction modulesToDom(list, options) {\n  var idCountMap = {};\n  var identifiers = [];\n  for (var i = 0; i < list.length; i++) {\n    var item = list[i];\n    var id = options.base ? item[0] + options.base : item[0];\n    var count = idCountMap[id] || 0;\n    var identifier = \"\".concat(id, \" \").concat(count);\n    idCountMap[id] = count + 1;\n    var indexByIdentifier = getIndexByIdentifier(identifier);\n    var obj = {\n      css: item[1],\n      media: item[2],\n      sourceMap: item[3],\n      supports: item[4],\n      layer: item[5]\n    };\n    if (indexByIdentifier !== -1) {\n      stylesInDOM[indexByIdentifier].references++;\n      stylesInDOM[indexByIdentifier].updater(obj);\n    } else {\n      var updater = addElementStyle(obj, options);\n      options.byIndex = i;\n      stylesInDOM.splice(i, 0, {\n        identifier: identifier,\n        updater: updater,\n        references: 1\n      });\n    }\n    identifiers.push(identifier);\n  }\n  return identifiers;\n}\nfunction addElementStyle(obj, options) {\n  var api = options.domAPI(options);\n  api.update(obj);\n  var updater = function updater(newObj) {\n    if (newObj) {\n      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {\n        return;\n      }\n      api.update(obj = newObj);\n    } else {\n      api.remove();\n    }\n  };\n  return updater;\n}\nmodule.exports = function (list, options) {\n  options = options || {};\n  list = list || [];\n  var lastIdentifiers = modulesToDom(list, options);\n  return function update(newList) {\n    newList = newList || [];\n    for (var i = 0; i < lastIdentifiers.length; i++) {\n      var identifier = lastIdentifiers[i];\n      var index = getIndexByIdentifier(identifier);\n      stylesInDOM[index].references--;\n    }\n    var newLastIdentifiers = modulesToDom(newList, options);\n    for (var _i = 0; _i < lastIdentifiers.length; _i++) {\n      var _identifier = lastIdentifiers[_i];\n      var _index = getIndexByIdentifier(_identifier);\n      if (stylesInDOM[_index].references === 0) {\n        stylesInDOM[_index].updater();\n        stylesInDOM.splice(_index, 1);\n      }\n    }\n    lastIdentifiers = newLastIdentifiers;\n  };\n};\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

eval("\n\nvar memo = {};\n\n/* istanbul ignore next  */\nfunction getTarget(target) {\n  if (typeof memo[target] === \"undefined\") {\n    var styleTarget = document.querySelector(target);\n\n    // Special case to return head of iframe instead of iframe itself\n    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {\n      try {\n        // This will throw an exception if access to iframe is blocked\n        // due to cross-origin restrictions\n        styleTarget = styleTarget.contentDocument.head;\n      } catch (e) {\n        // istanbul ignore next\n        styleTarget = null;\n      }\n    }\n    memo[target] = styleTarget;\n  }\n  return memo[target];\n}\n\n/* istanbul ignore next  */\nfunction insertBySelector(insert, style) {\n  var target = getTarget(insert);\n  if (!target) {\n    throw new Error(\"Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.\");\n  }\n  target.appendChild(style);\n}\nmodule.exports = insertBySelector;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/insertBySelector.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

eval("\n\n/* istanbul ignore next  */\nfunction insertStyleElement(options) {\n  var element = document.createElement(\"style\");\n  options.setAttributes(element, options.attributes);\n  options.insert(element, options.options);\n  return element;\n}\nmodule.exports = insertStyleElement;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/insertStyleElement.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\n/* istanbul ignore next  */\nfunction setAttributesWithoutAttributes(styleElement) {\n  var nonce =  true ? __webpack_require__.nc : 0;\n  if (nonce) {\n    styleElement.setAttribute(\"nonce\", nonce);\n  }\n}\nmodule.exports = setAttributesWithoutAttributes;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

eval("\n\n/* istanbul ignore next  */\nfunction apply(styleElement, options, obj) {\n  var css = \"\";\n  if (obj.supports) {\n    css += \"@supports (\".concat(obj.supports, \") {\");\n  }\n  if (obj.media) {\n    css += \"@media \".concat(obj.media, \" {\");\n  }\n  var needLayer = typeof obj.layer !== \"undefined\";\n  if (needLayer) {\n    css += \"@layer\".concat(obj.layer.length > 0 ? \" \".concat(obj.layer) : \"\", \" {\");\n  }\n  css += obj.css;\n  if (needLayer) {\n    css += \"}\";\n  }\n  if (obj.media) {\n    css += \"}\";\n  }\n  if (obj.supports) {\n    css += \"}\";\n  }\n  var sourceMap = obj.sourceMap;\n  if (sourceMap && typeof btoa !== \"undefined\") {\n    css += \"\\n/*# sourceMappingURL=data:application/json;base64,\".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), \" */\");\n  }\n\n  // For old IE\n  /* istanbul ignore if  */\n  options.styleTagTransform(css, styleElement, options.options);\n}\nfunction removeStyleElement(styleElement) {\n  // istanbul ignore if\n  if (styleElement.parentNode === null) {\n    return false;\n  }\n  styleElement.parentNode.removeChild(styleElement);\n}\n\n/* istanbul ignore next  */\nfunction domAPI(options) {\n  if (typeof document === \"undefined\") {\n    return {\n      update: function update() {},\n      remove: function remove() {}\n    };\n  }\n  var styleElement = options.insertStyleElement(options);\n  return {\n    update: function update(obj) {\n      apply(styleElement, options, obj);\n    },\n    remove: function remove() {\n      removeStyleElement(styleElement);\n    }\n  };\n}\nmodule.exports = domAPI;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/styleDomAPI.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

eval("\n\n/* istanbul ignore next  */\nfunction styleTagTransform(css, styleElement) {\n  if (styleElement.styleSheet) {\n    styleElement.styleSheet.cssText = css;\n  } else {\n    while (styleElement.firstChild) {\n      styleElement.removeChild(styleElement.firstChild);\n    }\n    styleElement.appendChild(document.createTextNode(css));\n  }\n}\nmodule.exports = styleTagTransform;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/styleTagTransform.js?");

/***/ }),

/***/ "./styles.css":
/*!********************!*\
  !*** ./styles.css ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !./node_modules/style-loader/dist/runtime/styleDomAPI.js */ \"./node_modules/style-loader/dist/runtime/styleDomAPI.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !./node_modules/style-loader/dist/runtime/insertBySelector.js */ \"./node_modules/style-loader/dist/runtime/insertBySelector.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ \"./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !./node_modules/style-loader/dist/runtime/insertStyleElement.js */ \"./node_modules/style-loader/dist/runtime/insertStyleElement.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !./node_modules/style-loader/dist/runtime/styleTagTransform.js */ \"./node_modules/style-loader/dist/runtime/styleTagTransform.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!./node_modules/css-loader/dist/cjs.js!./styles.css */ \"./node_modules/css-loader/dist/cjs.js!./styles.css\");\n\n      \n      \n      \n      \n      \n      \n      \n      \n      \n\nvar options = {};\n\noptions.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());\noptions.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());\noptions.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, \"head\");\noptions.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());\noptions.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());\n\nvar update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"], options);\n\n\n\n\n       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"] && _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"].locals ? _node_modules_css_loader_dist_cjs_js_styles_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"].locals : undefined);\n\n\n//# sourceURL=webpack://aframe-stats-panel/./styles.css?");

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
/******/ 			id: moduleId,
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
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
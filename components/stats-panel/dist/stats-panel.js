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

eval("const semver = __webpack_require__(/*! semver */ \"./node_modules/semver/index.js\");\r\nfunction isAFrameVersionAtLeast(minVersion) {\r\n  if (!AFRAME || !AFRAME.version) {\r\n    console.warn('A-Frame not found or version not available');\r\n    return false;\r\n  }\r\n\r\n  return semver.gte(AFRAME.version, minVersion);\r\n}\r\n\r\nif (isAFrameVersionAtLeast('1.8.0')) {\r\n  __webpack_require__(/*! ./styles.css */ \"./styles.css\")\r\n}\r\n\r\n\r\nAFRAME.registerComponent('stats-panel', {\r\n  schema: {\r\n    merge: {type: 'boolean', default: true}\r\n  },\r\n\r\n  init() {\r\n\r\n    const container = document.querySelector('.rs-container')\r\n\r\n    if (container && this.data.merge) {\r\n      //stats panel exists, just merge into it.\r\n      this.container = container\r\n      return;\r\n    }\r\n\r\n    // if stats panel doesn't exist, add one to support our custom stats.\r\n    this.base = document.createElement('div')\r\n    this.base.classList.add('rs-base')\r\n    const body = document.body || document.getElementsByTagName('body')[0]\r\n\r\n    if (container && !this.data.merge) {\r\n      this.base.style.top = \"auto\"\r\n      this.base.style.bottom = \"20px\"\r\n    }\r\n\r\n    body.appendChild(this.base)\r\n\r\n    this.container = document.createElement('div')\r\n    this.container.classList.add('rs-container')\r\n    this.base.appendChild(this.container)\r\n  }\r\n});\r\n\r\nAFRAME.registerComponent('stats-group', {\r\n  multiple: true,\r\n  schema: {\r\n    label: {type: 'string'}\r\n  },\r\n\r\n  init() {\r\n\r\n    let container\r\n    const baseComponent = this.el.components['stats-panel']\r\n    if (baseComponent) {\r\n      container = baseComponent.container\r\n    }\r\n    else {\r\n      container = document.querySelector('.rs-container')\r\n    }\r\n\r\n    if (!container) {\r\n      console.warn(`Couldn't find stats container to add stats to.\r\n                    Add either stats or stats-panel component to a-scene`)\r\n      return;\r\n    }\r\n    \r\n    this.groupHeader = document.createElement('h1')\r\n    this.groupHeader.innerHTML = this.data.label\r\n    container.appendChild(this.groupHeader)\r\n\r\n    this.group = document.createElement('div')\r\n    this.group.classList.add('rs-group')\r\n    // rs-group hs style flex-direction of 'column-reverse'\r\n    // No idea why it's like that, but it's not what we want for our stats.\r\n    // We prefer them rendered in the order speified.\r\n    // So override this style.\r\n    this.group.style.flexDirection = 'column'\r\n    this.group.style.webKitFlexDirection = 'column'\r\n    container.appendChild(this.group)\r\n  }\r\n});\r\n\r\nAFRAME.registerComponent('stats-row', {\r\n  multiple: true,\r\n  schema: {\r\n    // name of the group to add the stats row to.\r\n    group: {type: 'string'},\r\n\r\n    // name of an event to listen for\r\n    event: {type: 'string'},\r\n\r\n    // property from event to output in stats panel\r\n    properties: {type: 'array'},\r\n\r\n    // label for the row in the stats panel\r\n    label: {type: 'string'}\r\n  },\r\n\r\n  init () {\r\n\r\n    const groupComponentName = \"stats-group__\" + this.data.group\r\n    const groupComponent = this.el.components[groupComponentName] ||\r\n                           this.el.sceneEl.components[groupComponentName] ||\r\n                           this.el.components[\"stats-group\"] ||\r\n                           this.el.sceneEl.components[\"stats-group\"]\r\n\r\n    if (!groupComponent) {\r\n      console.warn(`Couldn't find stats group ${groupComponentName}`)\r\n      return;\r\n    }\r\n  \r\n    this.counter = document.createElement('div')\r\n    this.counter.classList.add('rs-counter-base')\r\n    groupComponent.group.appendChild(this.counter)\r\n\r\n    this.counterId = document.createElement('div')\r\n    this.counterId.classList.add('rs-counter-id')\r\n    this.counterId.innerHTML = this.data.label\r\n    this.counter.appendChild(this.counterId)\r\n\r\n    this.counterValues = {}\r\n    this.data.properties.forEach((property) => {\r\n      const counterValue = document.createElement('div')\r\n      counterValue.classList.add('rs-counter-value')\r\n      counterValue.innerHTML = \"...\"\r\n      this.counter.appendChild(counterValue)\r\n      this.counterValues[property] = counterValue\r\n    })\r\n\r\n    this.updateStatsData = this.updateStatsData.bind(this)\r\n    this.el.addEventListener(this.data.event, this.updateStatsData)\r\n\r\n    this.splitCache = {}\r\n  },\r\n\r\n  updateStatsData(e) {\r\n\r\n    if (!this.data.properties) return\r\n    \r\n    this.data.properties.forEach((property) => {\r\n      const split = this.splitDot(property);\r\n      let value = e.detail;\r\n      for (let i = 0; i < split.length; i++) {\r\n        value = value[split[i]];\r\n      }\r\n      this.counterValues[property].innerHTML = value\r\n    })\r\n  },\r\n\r\n  splitDot (path) {\r\n    if (path in this.splitCache) { return this.splitCache[path]; }\r\n    this.splitCache[path] = path.split('.');\r\n    return this.splitCache[path];\r\n  }\r\n\r\n});\r\n\r\nAFRAME.registerComponent('stats-collector', {\r\n  multiple: true,\r\n\r\n  schema: {\r\n    // name of an event to listen for\r\n    inEvent: {type: 'string'},\r\n\r\n    // property from event to output in stats panel\r\n    properties: {type: 'array'},\r\n\r\n    // frequency of output in terms of events received.\r\n    outputFrequency: {type: 'number', default: 100},\r\n\r\n    // name of event to emit\r\n    outEvent: {type: 'string'},\r\n    \r\n    // outputs (generated for each property)\r\n    // Combination of: mean, max, percentile__XX.X (where XX.X is a number)\r\n    outputs: {type: 'array'},\r\n\r\n    // Whether to output to console as well as generating events\r\n    // If a string is specified, this is output to console, together with the event data\r\n    // If no string is specified, nothing is output to console.\r\n    outputToConsole: {type: 'string'}\r\n  },\r\n\r\n  init() {\r\n    \r\n    this.statsData = {}\r\n    this.resetData()\r\n    this.outputDetail = {}\r\n    this.data.properties.forEach((property) => {\r\n      this.outputDetail[property] = {}\r\n    })\r\n\r\n    this.statsReceived = this.statsReceived.bind(this)\r\n    this.el.addEventListener(this.data.inEvent, this.statsReceived)\r\n  },\r\n  \r\n  resetData() {\r\n\r\n    this.counter = 0\r\n    this.data.properties.forEach((property) => {\r\n      \r\n      // For calculating percentiles like 0.01 and 99.9% we'll want to store\r\n      // additional data - something like this...\r\n      // Store off outliers, and discard data.\r\n      // const min = Math.min(...this.statsData[property])\r\n      // this.lowOutliers[property].push(min)\r\n      // const max = Math.max(...this.statsData[property])\r\n      // this.highOutliers[property].push(max)\r\n\r\n      this.statsData[property] = []\r\n    })\r\n  },\r\n\r\n  statsReceived(e) {\r\n\r\n    this.updateStatsData(e.detail)\r\n\r\n    this.counter++ \r\n    if (this.counter === this.data.outputFrequency) {\r\n      this.outputData()\r\n      this.resetData()\r\n    }\r\n  },\r\n\r\n  updateStatsData(detail) {\r\n\r\n    this.data.properties.forEach((property) => {\r\n      let value = detail;\r\n      value = value[property];\r\n      this.statsData[property].push(value)\r\n    })\r\n  },\r\n\r\n  outputData() {\r\n    this.data.properties.forEach((property) => {\r\n      this.data.outputs.forEach((output) => {\r\n        this.outputDetail[property][output] = this.computeOutput(output, this.statsData[property])\r\n      })\r\n    })\r\n\r\n    if (this.data.outEvent) {\r\n      this.el.emit(this.data.outEvent, this.outputDetail)\r\n    }\r\n\r\n    if (this.data.outputToConsole) {\r\n      console.log(this.data.outputToConsole, this.outputDetail)\r\n    }\r\n  },\r\n\r\n  computeOutput(outputInstruction, data) {\r\n\r\n    const outputInstructions = outputInstruction.split(\"__\")\r\n    const outputType = outputInstructions[0]\r\n    let output\r\n\r\n    switch (outputType) {\r\n      case \"mean\":\r\n        output = data.reduce((a, b) => a + b, 0) / data.length;\r\n        break;\r\n      \r\n      case \"max\":\r\n        output = Math.max(...data)\r\n        break;\r\n\r\n      case \"min\":\r\n        output = Math.min(...data)\r\n        break;\r\n\r\n      case \"percentile\":\r\n        const sorted = data.sort((a, b) => a - b)\r\n        // decimal percentiles encoded like 99+9 rather than 99.9 due to \".\" being used as a \r\n        // separator for nested properties.\r\n        const percentileString = outputInstructions[1].replace(\"_\", \".\")\r\n        const proportion = +percentileString / 100\r\n\r\n        // Note that this calculation of the percentile is inaccurate when there is insufficient data\r\n        // e.g. for 0.1th or 99.9th percentile when only 100 data points.\r\n        // Greater accuracy would require storing off more data (specifically outliers) and folding these\r\n        // into the computation.\r\n        const position = (data.length - 1) * proportion\r\n        const base = Math.floor(position)\r\n        const delta = position - base;\r\n        if (sorted[base + 1] !== undefined) {\r\n            output = sorted[base] + delta * (sorted[base + 1] - sorted[base]);\r\n        } else {\r\n            output = sorted[base];\r\n        }\r\n        break;\r\n    }\r\n    return output.toFixed(2)\r\n  }\r\n});\r\n\n\n//# sourceURL=webpack://aframe-stats-panel/./index.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./styles.css":
/*!**********************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./styles.css ***!
  \**********************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/noSourceMaps.js */ \"./node_modules/css-loader/dist/runtime/noSourceMaps.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);\n// Imports\n\n\nvar ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, `.rs-base {\r\n  background-color: #333;\r\n  color: #fafafa;\r\n  border-radius: 0;\r\n  font: 10px monospace;\r\n  left: 5px;\r\n  line-height: 1em;\r\n  opacity: 0.85;\r\n  overflow: hidden;\r\n  padding: 10px;\r\n  position: fixed;\r\n  top: 53px;\r\n  width: 300px;\r\n  z-index: 10000;\r\n}\r\n\r\n.rs-base div.hidden {\r\n  display: none;\r\n}\r\n\r\n.rs-base h1 {\r\n  color: #fff;\r\n  cursor: pointer;\r\n  font-size: 1.4em;\r\n  font-weight: 300;\r\n  margin: 0 0 5px;\r\n  padding: 0;\r\n}\r\n\r\n.rs-group {\r\n  display: -webkit-box;\r\n  display: -webkit-flex;\r\n  display: flex;\r\n  -webkit-flex-direction: column-reverse;\r\n  flex-direction: column-reverse;\r\n  margin-bottom: 5px;\r\n}\r\n\r\n.rs-group:last-child {\r\n  margin-bottom: 0;\r\n}\r\n\r\n.rs-counter-base {\r\n  align-items: center;\r\n  display: -webkit-box;\r\n  display: -webkit-flex;\r\n  display: flex;\r\n  height: 10px;\r\n  -webkit-justify-content: space-between;\r\n  justify-content: space-between;\r\n  margin: 2px 0;\r\n}\r\n\r\n.rs-counter-base.alarm {\r\n  color: #b70000;\r\n  text-shadow: 0 0 0 #b70000,\r\n               0 0 1px #fff,\r\n               0 0 1px #fff,\r\n               0 0 2px #fff,\r\n               0 0 2px #fff,\r\n               0 0 3px #fff,\r\n               0 0 3px #fff,\r\n               0 0 4px #fff,\r\n               0 0 4px #fff;\r\n}\r\n\r\n.rs-counter-id {\r\n  font-weight: 300;\r\n  -webkit-box-ordinal-group: 0;\r\n  -webkit-order: 0;\r\n  order: 0;\r\n  width: 54px;\r\n}\r\n\r\n.rs-counter-value {\r\n  font-weight: 300;\r\n  -webkit-box-ordinal-group: 1;\r\n  -webkit-order: 1;\r\n  order: 1;\r\n  text-align: right;\r\n  width: 35px;\r\n}\r\n\r\n.rs-canvas {\r\n  -webkit-box-ordinal-group: 2;\r\n  -webkit-order: 2;\r\n  order: 2;\r\n}\r\n\r\n@media (min-width: 480px) {\r\n  .rs-base {\r\n    left: 20px;\r\n    top: 68px;\r\n  }\r\n}\r\n`, \"\"]);\n// Exports\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);\n\n\n//# sourceURL=webpack://aframe-stats-panel/./styles.css?./node_modules/css-loader/dist/cjs.js");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\nmodule.exports = function (cssWithMappingToString) {\n  var list = [];\n\n  // return the list of modules as css string\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = \"\";\n      var needLayer = typeof item[5] !== \"undefined\";\n      if (item[4]) {\n        content += \"@supports (\".concat(item[4], \") {\");\n      }\n      if (item[2]) {\n        content += \"@media \".concat(item[2], \" {\");\n      }\n      if (needLayer) {\n        content += \"@layer\".concat(item[5].length > 0 ? \" \".concat(item[5]) : \"\", \" {\");\n      }\n      content += cssWithMappingToString(item);\n      if (needLayer) {\n        content += \"}\";\n      }\n      if (item[2]) {\n        content += \"}\";\n      }\n      if (item[4]) {\n        content += \"}\";\n      }\n      return content;\n    }).join(\"\");\n  };\n\n  // import a list of modules into the list\n  list.i = function i(modules, media, dedupe, supports, layer) {\n    if (typeof modules === \"string\") {\n      modules = [[null, modules, undefined]];\n    }\n    var alreadyImportedModules = {};\n    if (dedupe) {\n      for (var k = 0; k < this.length; k++) {\n        var id = this[k][0];\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n    for (var _k = 0; _k < modules.length; _k++) {\n      var item = [].concat(modules[_k]);\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        continue;\n      }\n      if (typeof layer !== \"undefined\") {\n        if (typeof item[5] === \"undefined\") {\n          item[5] = layer;\n        } else {\n          item[1] = \"@layer\".concat(item[5].length > 0 ? \" \".concat(item[5]) : \"\", \" {\").concat(item[1], \"}\");\n          item[5] = layer;\n        }\n      }\n      if (media) {\n        if (!item[2]) {\n          item[2] = media;\n        } else {\n          item[1] = \"@media \".concat(item[2], \" {\").concat(item[1], \"}\");\n          item[2] = media;\n        }\n      }\n      if (supports) {\n        if (!item[4]) {\n          item[4] = \"\".concat(supports);\n        } else {\n          item[1] = \"@supports (\".concat(item[4], \") {\").concat(item[1], \"}\");\n          item[4] = supports;\n        }\n      }\n      list.push(item);\n    }\n  };\n  return list;\n};\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/noSourceMaps.js":
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/noSourceMaps.js ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nmodule.exports = function (i) {\n  return i[1];\n};\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/css-loader/dist/runtime/noSourceMaps.js?");

/***/ }),

/***/ "./node_modules/semver/classes/comparator.js":
/*!***************************************************!*\
  !*** ./node_modules/semver/classes/comparator.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst ANY = Symbol('SemVer ANY')\n// hoisted class for cyclic dependency\nclass Comparator {\n  static get ANY () {\n    return ANY\n  }\n\n  constructor (comp, options) {\n    options = parseOptions(options)\n\n    if (comp instanceof Comparator) {\n      if (comp.loose === !!options.loose) {\n        return comp\n      } else {\n        comp = comp.value\n      }\n    }\n\n    comp = comp.trim().split(/\\s+/).join(' ')\n    debug('comparator', comp, options)\n    this.options = options\n    this.loose = !!options.loose\n    this.parse(comp)\n\n    if (this.semver === ANY) {\n      this.value = ''\n    } else {\n      this.value = this.operator + this.semver.version\n    }\n\n    debug('comp', this)\n  }\n\n  parse (comp) {\n    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]\n    const m = comp.match(r)\n\n    if (!m) {\n      throw new TypeError(`Invalid comparator: ${comp}`)\n    }\n\n    this.operator = m[1] !== undefined ? m[1] : ''\n    if (this.operator === '=') {\n      this.operator = ''\n    }\n\n    // if it literally is just '>' or '' then allow anything.\n    if (!m[2]) {\n      this.semver = ANY\n    } else {\n      this.semver = new SemVer(m[2], this.options.loose)\n    }\n  }\n\n  toString () {\n    return this.value\n  }\n\n  test (version) {\n    debug('Comparator.test', version, this.options.loose)\n\n    if (this.semver === ANY || version === ANY) {\n      return true\n    }\n\n    if (typeof version === 'string') {\n      try {\n        version = new SemVer(version, this.options)\n      } catch (er) {\n        return false\n      }\n    }\n\n    return cmp(version, this.operator, this.semver, this.options)\n  }\n\n  intersects (comp, options) {\n    if (!(comp instanceof Comparator)) {\n      throw new TypeError('a Comparator is required')\n    }\n\n    if (this.operator === '') {\n      if (this.value === '') {\n        return true\n      }\n      return new Range(comp.value, options).test(this.value)\n    } else if (comp.operator === '') {\n      if (comp.value === '') {\n        return true\n      }\n      return new Range(this.value, options).test(comp.semver)\n    }\n\n    options = parseOptions(options)\n\n    // Special cases where nothing can possibly be lower\n    if (options.includePrerelease &&\n      (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {\n      return false\n    }\n    if (!options.includePrerelease &&\n      (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {\n      return false\n    }\n\n    // Same direction increasing (> or >=)\n    if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {\n      return true\n    }\n    // Same direction decreasing (< or <=)\n    if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {\n      return true\n    }\n    // same SemVer and both sides are inclusive (<= or >=)\n    if (\n      (this.semver.version === comp.semver.version) &&\n      this.operator.includes('=') && comp.operator.includes('=')) {\n      return true\n    }\n    // opposite directions less than\n    if (cmp(this.semver, '<', comp.semver, options) &&\n      this.operator.startsWith('>') && comp.operator.startsWith('<')) {\n      return true\n    }\n    // opposite directions greater than\n    if (cmp(this.semver, '>', comp.semver, options) &&\n      this.operator.startsWith('<') && comp.operator.startsWith('>')) {\n      return true\n    }\n    return false\n  }\n}\n\nmodule.exports = Comparator\n\nconst parseOptions = __webpack_require__(/*! ../internal/parse-options */ \"./node_modules/semver/internal/parse-options.js\")\nconst { safeRe: re, t } = __webpack_require__(/*! ../internal/re */ \"./node_modules/semver/internal/re.js\")\nconst cmp = __webpack_require__(/*! ../functions/cmp */ \"./node_modules/semver/functions/cmp.js\")\nconst debug = __webpack_require__(/*! ../internal/debug */ \"./node_modules/semver/internal/debug.js\")\nconst SemVer = __webpack_require__(/*! ./semver */ \"./node_modules/semver/classes/semver.js\")\nconst Range = __webpack_require__(/*! ./range */ \"./node_modules/semver/classes/range.js\")\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/classes/comparator.js?");

/***/ }),

/***/ "./node_modules/semver/classes/range.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/classes/range.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SPACE_CHARACTERS = /\\s+/g\n\n// hoisted class for cyclic dependency\nclass Range {\n  constructor (range, options) {\n    options = parseOptions(options)\n\n    if (range instanceof Range) {\n      if (\n        range.loose === !!options.loose &&\n        range.includePrerelease === !!options.includePrerelease\n      ) {\n        return range\n      } else {\n        return new Range(range.raw, options)\n      }\n    }\n\n    if (range instanceof Comparator) {\n      // just put it in the set and return\n      this.raw = range.value\n      this.set = [[range]]\n      this.formatted = undefined\n      return this\n    }\n\n    this.options = options\n    this.loose = !!options.loose\n    this.includePrerelease = !!options.includePrerelease\n\n    // First reduce all whitespace as much as possible so we do not have to rely\n    // on potentially slow regexes like \\s*. This is then stored and used for\n    // future error messages as well.\n    this.raw = range.trim().replace(SPACE_CHARACTERS, ' ')\n\n    // First, split on ||\n    this.set = this.raw\n      .split('||')\n      // map the range to a 2d array of comparators\n      .map(r => this.parseRange(r.trim()))\n      // throw out any comparator lists that are empty\n      // this generally means that it was not a valid range, which is allowed\n      // in loose mode, but will still throw if the WHOLE range is invalid.\n      .filter(c => c.length)\n\n    if (!this.set.length) {\n      throw new TypeError(`Invalid SemVer Range: ${this.raw}`)\n    }\n\n    // if we have any that are not the null set, throw out null sets.\n    if (this.set.length > 1) {\n      // keep the first one, in case they're all null sets\n      const first = this.set[0]\n      this.set = this.set.filter(c => !isNullSet(c[0]))\n      if (this.set.length === 0) {\n        this.set = [first]\n      } else if (this.set.length > 1) {\n        // if we have any that are *, then the range is just *\n        for (const c of this.set) {\n          if (c.length === 1 && isAny(c[0])) {\n            this.set = [c]\n            break\n          }\n        }\n      }\n    }\n\n    this.formatted = undefined\n  }\n\n  get range () {\n    if (this.formatted === undefined) {\n      this.formatted = ''\n      for (let i = 0; i < this.set.length; i++) {\n        if (i > 0) {\n          this.formatted += '||'\n        }\n        const comps = this.set[i]\n        for (let k = 0; k < comps.length; k++) {\n          if (k > 0) {\n            this.formatted += ' '\n          }\n          this.formatted += comps[k].toString().trim()\n        }\n      }\n    }\n    return this.formatted\n  }\n\n  format () {\n    return this.range\n  }\n\n  toString () {\n    return this.range\n  }\n\n  parseRange (range) {\n    // memoize range parsing for performance.\n    // this is a very hot path, and fully deterministic.\n    const memoOpts =\n      (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |\n      (this.options.loose && FLAG_LOOSE)\n    const memoKey = memoOpts + ':' + range\n    const cached = cache.get(memoKey)\n    if (cached) {\n      return cached\n    }\n\n    const loose = this.options.loose\n    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`\n    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE]\n    range = range.replace(hr, hyphenReplace(this.options.includePrerelease))\n    debug('hyphen replace', range)\n\n    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`\n    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace)\n    debug('comparator trim', range)\n\n    // `~ 1.2.3` => `~1.2.3`\n    range = range.replace(re[t.TILDETRIM], tildeTrimReplace)\n    debug('tilde trim', range)\n\n    // `^ 1.2.3` => `^1.2.3`\n    range = range.replace(re[t.CARETTRIM], caretTrimReplace)\n    debug('caret trim', range)\n\n    // At this point, the range is completely trimmed and\n    // ready to be split into comparators.\n\n    let rangeList = range\n      .split(' ')\n      .map(comp => parseComparator(comp, this.options))\n      .join(' ')\n      .split(/\\s+/)\n      // >=0.0.0 is equivalent to *\n      .map(comp => replaceGTE0(comp, this.options))\n\n    if (loose) {\n      // in loose mode, throw out any that are not valid comparators\n      rangeList = rangeList.filter(comp => {\n        debug('loose invalid filter', comp, this.options)\n        return !!comp.match(re[t.COMPARATORLOOSE])\n      })\n    }\n    debug('range list', rangeList)\n\n    // if any comparators are the null set, then replace with JUST null set\n    // if more than one comparator, remove any * comparators\n    // also, don't include the same comparator more than once\n    const rangeMap = new Map()\n    const comparators = rangeList.map(comp => new Comparator(comp, this.options))\n    for (const comp of comparators) {\n      if (isNullSet(comp)) {\n        return [comp]\n      }\n      rangeMap.set(comp.value, comp)\n    }\n    if (rangeMap.size > 1 && rangeMap.has('')) {\n      rangeMap.delete('')\n    }\n\n    const result = [...rangeMap.values()]\n    cache.set(memoKey, result)\n    return result\n  }\n\n  intersects (range, options) {\n    if (!(range instanceof Range)) {\n      throw new TypeError('a Range is required')\n    }\n\n    return this.set.some((thisComparators) => {\n      return (\n        isSatisfiable(thisComparators, options) &&\n        range.set.some((rangeComparators) => {\n          return (\n            isSatisfiable(rangeComparators, options) &&\n            thisComparators.every((thisComparator) => {\n              return rangeComparators.every((rangeComparator) => {\n                return thisComparator.intersects(rangeComparator, options)\n              })\n            })\n          )\n        })\n      )\n    })\n  }\n\n  // if ANY of the sets match ALL of its comparators, then pass\n  test (version) {\n    if (!version) {\n      return false\n    }\n\n    if (typeof version === 'string') {\n      try {\n        version = new SemVer(version, this.options)\n      } catch (er) {\n        return false\n      }\n    }\n\n    for (let i = 0; i < this.set.length; i++) {\n      if (testSet(this.set[i], version, this.options)) {\n        return true\n      }\n    }\n    return false\n  }\n}\n\nmodule.exports = Range\n\nconst LRU = __webpack_require__(/*! ../internal/lrucache */ \"./node_modules/semver/internal/lrucache.js\")\nconst cache = new LRU()\n\nconst parseOptions = __webpack_require__(/*! ../internal/parse-options */ \"./node_modules/semver/internal/parse-options.js\")\nconst Comparator = __webpack_require__(/*! ./comparator */ \"./node_modules/semver/classes/comparator.js\")\nconst debug = __webpack_require__(/*! ../internal/debug */ \"./node_modules/semver/internal/debug.js\")\nconst SemVer = __webpack_require__(/*! ./semver */ \"./node_modules/semver/classes/semver.js\")\nconst {\n  safeRe: re,\n  t,\n  comparatorTrimReplace,\n  tildeTrimReplace,\n  caretTrimReplace,\n} = __webpack_require__(/*! ../internal/re */ \"./node_modules/semver/internal/re.js\")\nconst { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = __webpack_require__(/*! ../internal/constants */ \"./node_modules/semver/internal/constants.js\")\n\nconst isNullSet = c => c.value === '<0.0.0-0'\nconst isAny = c => c.value === ''\n\n// take a set of comparators and determine whether there\n// exists a version which can satisfy it\nconst isSatisfiable = (comparators, options) => {\n  let result = true\n  const remainingComparators = comparators.slice()\n  let testComparator = remainingComparators.pop()\n\n  while (result && remainingComparators.length) {\n    result = remainingComparators.every((otherComparator) => {\n      return testComparator.intersects(otherComparator, options)\n    })\n\n    testComparator = remainingComparators.pop()\n  }\n\n  return result\n}\n\n// comprised of xranges, tildes, stars, and gtlt's at this point.\n// already replaced the hyphen ranges\n// turn into a set of JUST comparators.\nconst parseComparator = (comp, options) => {\n  debug('comp', comp, options)\n  comp = replaceCarets(comp, options)\n  debug('caret', comp)\n  comp = replaceTildes(comp, options)\n  debug('tildes', comp)\n  comp = replaceXRanges(comp, options)\n  debug('xrange', comp)\n  comp = replaceStars(comp, options)\n  debug('stars', comp)\n  return comp\n}\n\nconst isX = id => !id || id.toLowerCase() === 'x' || id === '*'\n\n// ~, ~> --> * (any, kinda silly)\n// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0\n// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0\n// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0\n// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0\n// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0\n// ~0.0.1 --> >=0.0.1 <0.1.0-0\nconst replaceTildes = (comp, options) => {\n  return comp\n    .trim()\n    .split(/\\s+/)\n    .map((c) => replaceTilde(c, options))\n    .join(' ')\n}\n\nconst replaceTilde = (comp, options) => {\n  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE]\n  return comp.replace(r, (_, M, m, p, pr) => {\n    debug('tilde', comp, _, M, m, p, pr)\n    let ret\n\n    if (isX(M)) {\n      ret = ''\n    } else if (isX(m)) {\n      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`\n    } else if (isX(p)) {\n      // ~1.2 == >=1.2.0 <1.3.0-0\n      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`\n    } else if (pr) {\n      debug('replaceTilde pr', pr)\n      ret = `>=${M}.${m}.${p}-${pr\n      } <${M}.${+m + 1}.0-0`\n    } else {\n      // ~1.2.3 == >=1.2.3 <1.3.0-0\n      ret = `>=${M}.${m}.${p\n      } <${M}.${+m + 1}.0-0`\n    }\n\n    debug('tilde return', ret)\n    return ret\n  })\n}\n\n// ^ --> * (any, kinda silly)\n// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0\n// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0\n// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0\n// ^1.2.3 --> >=1.2.3 <2.0.0-0\n// ^1.2.0 --> >=1.2.0 <2.0.0-0\n// ^0.0.1 --> >=0.0.1 <0.0.2-0\n// ^0.1.0 --> >=0.1.0 <0.2.0-0\nconst replaceCarets = (comp, options) => {\n  return comp\n    .trim()\n    .split(/\\s+/)\n    .map((c) => replaceCaret(c, options))\n    .join(' ')\n}\n\nconst replaceCaret = (comp, options) => {\n  debug('caret', comp, options)\n  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET]\n  const z = options.includePrerelease ? '-0' : ''\n  return comp.replace(r, (_, M, m, p, pr) => {\n    debug('caret', comp, _, M, m, p, pr)\n    let ret\n\n    if (isX(M)) {\n      ret = ''\n    } else if (isX(m)) {\n      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`\n    } else if (isX(p)) {\n      if (M === '0') {\n        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`\n      } else {\n        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`\n      }\n    } else if (pr) {\n      debug('replaceCaret pr', pr)\n      if (M === '0') {\n        if (m === '0') {\n          ret = `>=${M}.${m}.${p}-${pr\n          } <${M}.${m}.${+p + 1}-0`\n        } else {\n          ret = `>=${M}.${m}.${p}-${pr\n          } <${M}.${+m + 1}.0-0`\n        }\n      } else {\n        ret = `>=${M}.${m}.${p}-${pr\n        } <${+M + 1}.0.0-0`\n      }\n    } else {\n      debug('no pr')\n      if (M === '0') {\n        if (m === '0') {\n          ret = `>=${M}.${m}.${p\n          }${z} <${M}.${m}.${+p + 1}-0`\n        } else {\n          ret = `>=${M}.${m}.${p\n          }${z} <${M}.${+m + 1}.0-0`\n        }\n      } else {\n        ret = `>=${M}.${m}.${p\n        } <${+M + 1}.0.0-0`\n      }\n    }\n\n    debug('caret return', ret)\n    return ret\n  })\n}\n\nconst replaceXRanges = (comp, options) => {\n  debug('replaceXRanges', comp, options)\n  return comp\n    .split(/\\s+/)\n    .map((c) => replaceXRange(c, options))\n    .join(' ')\n}\n\nconst replaceXRange = (comp, options) => {\n  comp = comp.trim()\n  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE]\n  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {\n    debug('xRange', comp, ret, gtlt, M, m, p, pr)\n    const xM = isX(M)\n    const xm = xM || isX(m)\n    const xp = xm || isX(p)\n    const anyX = xp\n\n    if (gtlt === '=' && anyX) {\n      gtlt = ''\n    }\n\n    // if we're including prereleases in the match, then we need\n    // to fix this to -0, the lowest possible prerelease value\n    pr = options.includePrerelease ? '-0' : ''\n\n    if (xM) {\n      if (gtlt === '>' || gtlt === '<') {\n        // nothing is allowed\n        ret = '<0.0.0-0'\n      } else {\n        // nothing is forbidden\n        ret = '*'\n      }\n    } else if (gtlt && anyX) {\n      // we know patch is an x, because we have any x at all.\n      // replace X with 0\n      if (xm) {\n        m = 0\n      }\n      p = 0\n\n      if (gtlt === '>') {\n        // >1 => >=2.0.0\n        // >1.2 => >=1.3.0\n        gtlt = '>='\n        if (xm) {\n          M = +M + 1\n          m = 0\n          p = 0\n        } else {\n          m = +m + 1\n          p = 0\n        }\n      } else if (gtlt === '<=') {\n        // <=0.7.x is actually <0.8.0, since any 0.7.x should\n        // pass.  Similarly, <=7.x is actually <8.0.0, etc.\n        gtlt = '<'\n        if (xm) {\n          M = +M + 1\n        } else {\n          m = +m + 1\n        }\n      }\n\n      if (gtlt === '<') {\n        pr = '-0'\n      }\n\n      ret = `${gtlt + M}.${m}.${p}${pr}`\n    } else if (xm) {\n      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`\n    } else if (xp) {\n      ret = `>=${M}.${m}.0${pr\n      } <${M}.${+m + 1}.0-0`\n    }\n\n    debug('xRange return', ret)\n\n    return ret\n  })\n}\n\n// Because * is AND-ed with everything else in the comparator,\n// and '' means \"any version\", just remove the *s entirely.\nconst replaceStars = (comp, options) => {\n  debug('replaceStars', comp, options)\n  // Looseness is ignored here.  star is always as loose as it gets!\n  return comp\n    .trim()\n    .replace(re[t.STAR], '')\n}\n\nconst replaceGTE0 = (comp, options) => {\n  debug('replaceGTE0', comp, options)\n  return comp\n    .trim()\n    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')\n}\n\n// This function is passed to string.replace(re[t.HYPHENRANGE])\n// M, m, patch, prerelease, build\n// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5\n// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do\n// 1.2 - 3.4 => >=1.2.0 <3.5.0-0\n// TODO build?\nconst hyphenReplace = incPr => ($0,\n  from, fM, fm, fp, fpr, fb,\n  to, tM, tm, tp, tpr) => {\n  if (isX(fM)) {\n    from = ''\n  } else if (isX(fm)) {\n    from = `>=${fM}.0.0${incPr ? '-0' : ''}`\n  } else if (isX(fp)) {\n    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`\n  } else if (fpr) {\n    from = `>=${from}`\n  } else {\n    from = `>=${from}${incPr ? '-0' : ''}`\n  }\n\n  if (isX(tM)) {\n    to = ''\n  } else if (isX(tm)) {\n    to = `<${+tM + 1}.0.0-0`\n  } else if (isX(tp)) {\n    to = `<${tM}.${+tm + 1}.0-0`\n  } else if (tpr) {\n    to = `<=${tM}.${tm}.${tp}-${tpr}`\n  } else if (incPr) {\n    to = `<${tM}.${tm}.${+tp + 1}-0`\n  } else {\n    to = `<=${to}`\n  }\n\n  return `${from} ${to}`.trim()\n}\n\nconst testSet = (set, version, options) => {\n  for (let i = 0; i < set.length; i++) {\n    if (!set[i].test(version)) {\n      return false\n    }\n  }\n\n  if (version.prerelease.length && !options.includePrerelease) {\n    // Find the set of versions that are allowed to have prereleases\n    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0\n    // That should allow `1.2.3-pr.2` to pass.\n    // However, `1.2.4-alpha.notready` should NOT be allowed,\n    // even though it's within the range set by the comparators.\n    for (let i = 0; i < set.length; i++) {\n      debug(set[i].semver)\n      if (set[i].semver === Comparator.ANY) {\n        continue\n      }\n\n      if (set[i].semver.prerelease.length > 0) {\n        const allowed = set[i].semver\n        if (allowed.major === version.major &&\n            allowed.minor === version.minor &&\n            allowed.patch === version.patch) {\n          return true\n        }\n      }\n    }\n\n    // Version has a -pre, but it's not one of the ones we like.\n    return false\n  }\n\n  return true\n}\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/classes/range.js?");

/***/ }),

/***/ "./node_modules/semver/classes/semver.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/classes/semver.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst debug = __webpack_require__(/*! ../internal/debug */ \"./node_modules/semver/internal/debug.js\")\nconst { MAX_LENGTH, MAX_SAFE_INTEGER } = __webpack_require__(/*! ../internal/constants */ \"./node_modules/semver/internal/constants.js\")\nconst { safeRe: re, t } = __webpack_require__(/*! ../internal/re */ \"./node_modules/semver/internal/re.js\")\n\nconst parseOptions = __webpack_require__(/*! ../internal/parse-options */ \"./node_modules/semver/internal/parse-options.js\")\nconst { compareIdentifiers } = __webpack_require__(/*! ../internal/identifiers */ \"./node_modules/semver/internal/identifiers.js\")\nclass SemVer {\n  constructor (version, options) {\n    options = parseOptions(options)\n\n    if (version instanceof SemVer) {\n      if (version.loose === !!options.loose &&\n        version.includePrerelease === !!options.includePrerelease) {\n        return version\n      } else {\n        version = version.version\n      }\n    } else if (typeof version !== 'string') {\n      throw new TypeError(`Invalid version. Must be a string. Got type \"${typeof version}\".`)\n    }\n\n    if (version.length > MAX_LENGTH) {\n      throw new TypeError(\n        `version is longer than ${MAX_LENGTH} characters`\n      )\n    }\n\n    debug('SemVer', version, options)\n    this.options = options\n    this.loose = !!options.loose\n    // this isn't actually relevant for versions, but keep it so that we\n    // don't run into trouble passing this.options around.\n    this.includePrerelease = !!options.includePrerelease\n\n    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])\n\n    if (!m) {\n      throw new TypeError(`Invalid Version: ${version}`)\n    }\n\n    this.raw = version\n\n    // these are actually numbers\n    this.major = +m[1]\n    this.minor = +m[2]\n    this.patch = +m[3]\n\n    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {\n      throw new TypeError('Invalid major version')\n    }\n\n    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {\n      throw new TypeError('Invalid minor version')\n    }\n\n    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {\n      throw new TypeError('Invalid patch version')\n    }\n\n    // numberify any prerelease numeric ids\n    if (!m[4]) {\n      this.prerelease = []\n    } else {\n      this.prerelease = m[4].split('.').map((id) => {\n        if (/^[0-9]+$/.test(id)) {\n          const num = +id\n          if (num >= 0 && num < MAX_SAFE_INTEGER) {\n            return num\n          }\n        }\n        return id\n      })\n    }\n\n    this.build = m[5] ? m[5].split('.') : []\n    this.format()\n  }\n\n  format () {\n    this.version = `${this.major}.${this.minor}.${this.patch}`\n    if (this.prerelease.length) {\n      this.version += `-${this.prerelease.join('.')}`\n    }\n    return this.version\n  }\n\n  toString () {\n    return this.version\n  }\n\n  compare (other) {\n    debug('SemVer.compare', this.version, this.options, other)\n    if (!(other instanceof SemVer)) {\n      if (typeof other === 'string' && other === this.version) {\n        return 0\n      }\n      other = new SemVer(other, this.options)\n    }\n\n    if (other.version === this.version) {\n      return 0\n    }\n\n    return this.compareMain(other) || this.comparePre(other)\n  }\n\n  compareMain (other) {\n    if (!(other instanceof SemVer)) {\n      other = new SemVer(other, this.options)\n    }\n\n    return (\n      compareIdentifiers(this.major, other.major) ||\n      compareIdentifiers(this.minor, other.minor) ||\n      compareIdentifiers(this.patch, other.patch)\n    )\n  }\n\n  comparePre (other) {\n    if (!(other instanceof SemVer)) {\n      other = new SemVer(other, this.options)\n    }\n\n    // NOT having a prerelease is > having one\n    if (this.prerelease.length && !other.prerelease.length) {\n      return -1\n    } else if (!this.prerelease.length && other.prerelease.length) {\n      return 1\n    } else if (!this.prerelease.length && !other.prerelease.length) {\n      return 0\n    }\n\n    let i = 0\n    do {\n      const a = this.prerelease[i]\n      const b = other.prerelease[i]\n      debug('prerelease compare', i, a, b)\n      if (a === undefined && b === undefined) {\n        return 0\n      } else if (b === undefined) {\n        return 1\n      } else if (a === undefined) {\n        return -1\n      } else if (a === b) {\n        continue\n      } else {\n        return compareIdentifiers(a, b)\n      }\n    } while (++i)\n  }\n\n  compareBuild (other) {\n    if (!(other instanceof SemVer)) {\n      other = new SemVer(other, this.options)\n    }\n\n    let i = 0\n    do {\n      const a = this.build[i]\n      const b = other.build[i]\n      debug('build compare', i, a, b)\n      if (a === undefined && b === undefined) {\n        return 0\n      } else if (b === undefined) {\n        return 1\n      } else if (a === undefined) {\n        return -1\n      } else if (a === b) {\n        continue\n      } else {\n        return compareIdentifiers(a, b)\n      }\n    } while (++i)\n  }\n\n  // preminor will bump the version up to the next minor release, and immediately\n  // down to pre-release. premajor and prepatch work the same way.\n  inc (release, identifier, identifierBase) {\n    if (release.startsWith('pre')) {\n      if (!identifier && identifierBase === false) {\n        throw new Error('invalid increment argument: identifier is empty')\n      }\n      // Avoid an invalid semver results\n      if (identifier) {\n        const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE])\n        if (!match || match[1] !== identifier) {\n          throw new Error(`invalid identifier: ${identifier}`)\n        }\n      }\n    }\n\n    switch (release) {\n      case 'premajor':\n        this.prerelease.length = 0\n        this.patch = 0\n        this.minor = 0\n        this.major++\n        this.inc('pre', identifier, identifierBase)\n        break\n      case 'preminor':\n        this.prerelease.length = 0\n        this.patch = 0\n        this.minor++\n        this.inc('pre', identifier, identifierBase)\n        break\n      case 'prepatch':\n        // If this is already a prerelease, it will bump to the next version\n        // drop any prereleases that might already exist, since they are not\n        // relevant at this point.\n        this.prerelease.length = 0\n        this.inc('patch', identifier, identifierBase)\n        this.inc('pre', identifier, identifierBase)\n        break\n      // If the input is a non-prerelease version, this acts the same as\n      // prepatch.\n      case 'prerelease':\n        if (this.prerelease.length === 0) {\n          this.inc('patch', identifier, identifierBase)\n        }\n        this.inc('pre', identifier, identifierBase)\n        break\n      case 'release':\n        if (this.prerelease.length === 0) {\n          throw new Error(`version ${this.raw} is not a prerelease`)\n        }\n        this.prerelease.length = 0\n        break\n\n      case 'major':\n        // If this is a pre-major version, bump up to the same major version.\n        // Otherwise increment major.\n        // 1.0.0-5 bumps to 1.0.0\n        // 1.1.0 bumps to 2.0.0\n        if (\n          this.minor !== 0 ||\n          this.patch !== 0 ||\n          this.prerelease.length === 0\n        ) {\n          this.major++\n        }\n        this.minor = 0\n        this.patch = 0\n        this.prerelease = []\n        break\n      case 'minor':\n        // If this is a pre-minor version, bump up to the same minor version.\n        // Otherwise increment minor.\n        // 1.2.0-5 bumps to 1.2.0\n        // 1.2.1 bumps to 1.3.0\n        if (this.patch !== 0 || this.prerelease.length === 0) {\n          this.minor++\n        }\n        this.patch = 0\n        this.prerelease = []\n        break\n      case 'patch':\n        // If this is not a pre-release version, it will increment the patch.\n        // If it is a pre-release it will bump up to the same patch version.\n        // 1.2.0-5 patches to 1.2.0\n        // 1.2.0 patches to 1.2.1\n        if (this.prerelease.length === 0) {\n          this.patch++\n        }\n        this.prerelease = []\n        break\n      // This probably shouldn't be used publicly.\n      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.\n      case 'pre': {\n        const base = Number(identifierBase) ? 1 : 0\n\n        if (this.prerelease.length === 0) {\n          this.prerelease = [base]\n        } else {\n          let i = this.prerelease.length\n          while (--i >= 0) {\n            if (typeof this.prerelease[i] === 'number') {\n              this.prerelease[i]++\n              i = -2\n            }\n          }\n          if (i === -1) {\n            // didn't increment anything\n            if (identifier === this.prerelease.join('.') && identifierBase === false) {\n              throw new Error('invalid increment argument: identifier already exists')\n            }\n            this.prerelease.push(base)\n          }\n        }\n        if (identifier) {\n          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,\n          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0\n          let prerelease = [identifier, base]\n          if (identifierBase === false) {\n            prerelease = [identifier]\n          }\n          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {\n            if (isNaN(this.prerelease[1])) {\n              this.prerelease = prerelease\n            }\n          } else {\n            this.prerelease = prerelease\n          }\n        }\n        break\n      }\n      default:\n        throw new Error(`invalid increment argument: ${release}`)\n    }\n    this.raw = this.format()\n    if (this.build.length) {\n      this.raw += `+${this.build.join('.')}`\n    }\n    return this\n  }\n}\n\nmodule.exports = SemVer\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/classes/semver.js?");

/***/ }),

/***/ "./node_modules/semver/functions/clean.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/clean.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst parse = __webpack_require__(/*! ./parse */ \"./node_modules/semver/functions/parse.js\")\nconst clean = (version, options) => {\n  const s = parse(version.trim().replace(/^[=v]+/, ''), options)\n  return s ? s.version : null\n}\nmodule.exports = clean\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/clean.js?");

/***/ }),

/***/ "./node_modules/semver/functions/cmp.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/cmp.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst eq = __webpack_require__(/*! ./eq */ \"./node_modules/semver/functions/eq.js\")\nconst neq = __webpack_require__(/*! ./neq */ \"./node_modules/semver/functions/neq.js\")\nconst gt = __webpack_require__(/*! ./gt */ \"./node_modules/semver/functions/gt.js\")\nconst gte = __webpack_require__(/*! ./gte */ \"./node_modules/semver/functions/gte.js\")\nconst lt = __webpack_require__(/*! ./lt */ \"./node_modules/semver/functions/lt.js\")\nconst lte = __webpack_require__(/*! ./lte */ \"./node_modules/semver/functions/lte.js\")\n\nconst cmp = (a, op, b, loose) => {\n  switch (op) {\n    case '===':\n      if (typeof a === 'object') {\n        a = a.version\n      }\n      if (typeof b === 'object') {\n        b = b.version\n      }\n      return a === b\n\n    case '!==':\n      if (typeof a === 'object') {\n        a = a.version\n      }\n      if (typeof b === 'object') {\n        b = b.version\n      }\n      return a !== b\n\n    case '':\n    case '=':\n    case '==':\n      return eq(a, b, loose)\n\n    case '!=':\n      return neq(a, b, loose)\n\n    case '>':\n      return gt(a, b, loose)\n\n    case '>=':\n      return gte(a, b, loose)\n\n    case '<':\n      return lt(a, b, loose)\n\n    case '<=':\n      return lte(a, b, loose)\n\n    default:\n      throw new TypeError(`Invalid operator: ${op}`)\n  }\n}\nmodule.exports = cmp\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/cmp.js?");

/***/ }),

/***/ "./node_modules/semver/functions/coerce.js":
/*!*************************************************!*\
  !*** ./node_modules/semver/functions/coerce.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst parse = __webpack_require__(/*! ./parse */ \"./node_modules/semver/functions/parse.js\")\nconst { safeRe: re, t } = __webpack_require__(/*! ../internal/re */ \"./node_modules/semver/internal/re.js\")\n\nconst coerce = (version, options) => {\n  if (version instanceof SemVer) {\n    return version\n  }\n\n  if (typeof version === 'number') {\n    version = String(version)\n  }\n\n  if (typeof version !== 'string') {\n    return null\n  }\n\n  options = options || {}\n\n  let match = null\n  if (!options.rtl) {\n    match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE])\n  } else {\n    // Find the right-most coercible string that does not share\n    // a terminus with a more left-ward coercible string.\n    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'\n    // With includePrerelease option set, '1.2.3.4-rc' wants to coerce '2.3.4-rc', not '2.3.4'\n    //\n    // Walk through the string checking with a /g regexp\n    // Manually set the index so as to pick up overlapping matches.\n    // Stop when we get a match that ends at the string end, since no\n    // coercible string can be more right-ward without the same terminus.\n    const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL]\n    let next\n    while ((next = coerceRtlRegex.exec(version)) &&\n        (!match || match.index + match[0].length !== version.length)\n    ) {\n      if (!match ||\n            next.index + next[0].length !== match.index + match[0].length) {\n        match = next\n      }\n      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length\n    }\n    // leave it in a clean state\n    coerceRtlRegex.lastIndex = -1\n  }\n\n  if (match === null) {\n    return null\n  }\n\n  const major = match[2]\n  const minor = match[3] || '0'\n  const patch = match[4] || '0'\n  const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : ''\n  const build = options.includePrerelease && match[6] ? `+${match[6]}` : ''\n\n  return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options)\n}\nmodule.exports = coerce\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/coerce.js?");

/***/ }),

/***/ "./node_modules/semver/functions/compare-build.js":
/*!********************************************************!*\
  !*** ./node_modules/semver/functions/compare-build.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst compareBuild = (a, b, loose) => {\n  const versionA = new SemVer(a, loose)\n  const versionB = new SemVer(b, loose)\n  return versionA.compare(versionB) || versionA.compareBuild(versionB)\n}\nmodule.exports = compareBuild\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/compare-build.js?");

/***/ }),

/***/ "./node_modules/semver/functions/compare-loose.js":
/*!********************************************************!*\
  !*** ./node_modules/semver/functions/compare-loose.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compare = __webpack_require__(/*! ./compare */ \"./node_modules/semver/functions/compare.js\")\nconst compareLoose = (a, b) => compare(a, b, true)\nmodule.exports = compareLoose\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/compare-loose.js?");

/***/ }),

/***/ "./node_modules/semver/functions/compare.js":
/*!**************************************************!*\
  !*** ./node_modules/semver/functions/compare.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst compare = (a, b, loose) =>\n  new SemVer(a, loose).compare(new SemVer(b, loose))\n\nmodule.exports = compare\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/compare.js?");

/***/ }),

/***/ "./node_modules/semver/functions/diff.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/functions/diff.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst parse = __webpack_require__(/*! ./parse.js */ \"./node_modules/semver/functions/parse.js\")\n\nconst diff = (version1, version2) => {\n  const v1 = parse(version1, null, true)\n  const v2 = parse(version2, null, true)\n  const comparison = v1.compare(v2)\n\n  if (comparison === 0) {\n    return null\n  }\n\n  const v1Higher = comparison > 0\n  const highVersion = v1Higher ? v1 : v2\n  const lowVersion = v1Higher ? v2 : v1\n  const highHasPre = !!highVersion.prerelease.length\n  const lowHasPre = !!lowVersion.prerelease.length\n\n  if (lowHasPre && !highHasPre) {\n    // Going from prerelease -> no prerelease requires some special casing\n\n    // If the low version has only a major, then it will always be a major\n    // Some examples:\n    // 1.0.0-1 -> 1.0.0\n    // 1.0.0-1 -> 1.1.1\n    // 1.0.0-1 -> 2.0.0\n    if (!lowVersion.patch && !lowVersion.minor) {\n      return 'major'\n    }\n\n    // If the main part has no difference\n    if (lowVersion.compareMain(highVersion) === 0) {\n      if (lowVersion.minor && !lowVersion.patch) {\n        return 'minor'\n      }\n      return 'patch'\n    }\n  }\n\n  // add the `pre` prefix if we are going to a prerelease version\n  const prefix = highHasPre ? 'pre' : ''\n\n  if (v1.major !== v2.major) {\n    return prefix + 'major'\n  }\n\n  if (v1.minor !== v2.minor) {\n    return prefix + 'minor'\n  }\n\n  if (v1.patch !== v2.patch) {\n    return prefix + 'patch'\n  }\n\n  // high and low are preleases\n  return 'prerelease'\n}\n\nmodule.exports = diff\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/diff.js?");

/***/ }),

/***/ "./node_modules/semver/functions/eq.js":
/*!*********************************************!*\
  !*** ./node_modules/semver/functions/eq.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compare = __webpack_require__(/*! ./compare */ \"./node_modules/semver/functions/compare.js\")\nconst eq = (a, b, loose) => compare(a, b, loose) === 0\nmodule.exports = eq\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/eq.js?");

/***/ }),

/***/ "./node_modules/semver/functions/gt.js":
/*!*********************************************!*\
  !*** ./node_modules/semver/functions/gt.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compare = __webpack_require__(/*! ./compare */ \"./node_modules/semver/functions/compare.js\")\nconst gt = (a, b, loose) => compare(a, b, loose) > 0\nmodule.exports = gt\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/gt.js?");

/***/ }),

/***/ "./node_modules/semver/functions/gte.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/gte.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compare = __webpack_require__(/*! ./compare */ \"./node_modules/semver/functions/compare.js\")\nconst gte = (a, b, loose) => compare(a, b, loose) >= 0\nmodule.exports = gte\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/gte.js?");

/***/ }),

/***/ "./node_modules/semver/functions/inc.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/inc.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\n\nconst inc = (version, release, options, identifier, identifierBase) => {\n  if (typeof (options) === 'string') {\n    identifierBase = identifier\n    identifier = options\n    options = undefined\n  }\n\n  try {\n    return new SemVer(\n      version instanceof SemVer ? version.version : version,\n      options\n    ).inc(release, identifier, identifierBase).version\n  } catch (er) {\n    return null\n  }\n}\nmodule.exports = inc\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/inc.js?");

/***/ }),

/***/ "./node_modules/semver/functions/lt.js":
/*!*********************************************!*\
  !*** ./node_modules/semver/functions/lt.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compare = __webpack_require__(/*! ./compare */ \"./node_modules/semver/functions/compare.js\")\nconst lt = (a, b, loose) => compare(a, b, loose) < 0\nmodule.exports = lt\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/lt.js?");

/***/ }),

/***/ "./node_modules/semver/functions/lte.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/lte.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compare = __webpack_require__(/*! ./compare */ \"./node_modules/semver/functions/compare.js\")\nconst lte = (a, b, loose) => compare(a, b, loose) <= 0\nmodule.exports = lte\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/lte.js?");

/***/ }),

/***/ "./node_modules/semver/functions/major.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/major.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst major = (a, loose) => new SemVer(a, loose).major\nmodule.exports = major\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/major.js?");

/***/ }),

/***/ "./node_modules/semver/functions/minor.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/minor.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst minor = (a, loose) => new SemVer(a, loose).minor\nmodule.exports = minor\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/minor.js?");

/***/ }),

/***/ "./node_modules/semver/functions/neq.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/neq.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compare = __webpack_require__(/*! ./compare */ \"./node_modules/semver/functions/compare.js\")\nconst neq = (a, b, loose) => compare(a, b, loose) !== 0\nmodule.exports = neq\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/neq.js?");

/***/ }),

/***/ "./node_modules/semver/functions/parse.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/parse.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst parse = (version, options, throwErrors = false) => {\n  if (version instanceof SemVer) {\n    return version\n  }\n  try {\n    return new SemVer(version, options)\n  } catch (er) {\n    if (!throwErrors) {\n      return null\n    }\n    throw er\n  }\n}\n\nmodule.exports = parse\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/parse.js?");

/***/ }),

/***/ "./node_modules/semver/functions/patch.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/patch.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst patch = (a, loose) => new SemVer(a, loose).patch\nmodule.exports = patch\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/patch.js?");

/***/ }),

/***/ "./node_modules/semver/functions/prerelease.js":
/*!*****************************************************!*\
  !*** ./node_modules/semver/functions/prerelease.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst parse = __webpack_require__(/*! ./parse */ \"./node_modules/semver/functions/parse.js\")\nconst prerelease = (version, options) => {\n  const parsed = parse(version, options)\n  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null\n}\nmodule.exports = prerelease\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/prerelease.js?");

/***/ }),

/***/ "./node_modules/semver/functions/rcompare.js":
/*!***************************************************!*\
  !*** ./node_modules/semver/functions/rcompare.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compare = __webpack_require__(/*! ./compare */ \"./node_modules/semver/functions/compare.js\")\nconst rcompare = (a, b, loose) => compare(b, a, loose)\nmodule.exports = rcompare\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/rcompare.js?");

/***/ }),

/***/ "./node_modules/semver/functions/rsort.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/rsort.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compareBuild = __webpack_require__(/*! ./compare-build */ \"./node_modules/semver/functions/compare-build.js\")\nconst rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose))\nmodule.exports = rsort\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/rsort.js?");

/***/ }),

/***/ "./node_modules/semver/functions/satisfies.js":
/*!****************************************************!*\
  !*** ./node_modules/semver/functions/satisfies.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst Range = __webpack_require__(/*! ../classes/range */ \"./node_modules/semver/classes/range.js\")\nconst satisfies = (version, range, options) => {\n  try {\n    range = new Range(range, options)\n  } catch (er) {\n    return false\n  }\n  return range.test(version)\n}\nmodule.exports = satisfies\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/satisfies.js?");

/***/ }),

/***/ "./node_modules/semver/functions/sort.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/functions/sort.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst compareBuild = __webpack_require__(/*! ./compare-build */ \"./node_modules/semver/functions/compare-build.js\")\nconst sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose))\nmodule.exports = sort\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/sort.js?");

/***/ }),

/***/ "./node_modules/semver/functions/valid.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/valid.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst parse = __webpack_require__(/*! ./parse */ \"./node_modules/semver/functions/parse.js\")\nconst valid = (version, options) => {\n  const v = parse(version, options)\n  return v ? v.version : null\n}\nmodule.exports = valid\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/functions/valid.js?");

/***/ }),

/***/ "./node_modules/semver/index.js":
/*!**************************************!*\
  !*** ./node_modules/semver/index.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\n// just pre-load all the stuff that index.js lazily exports\nconst internalRe = __webpack_require__(/*! ./internal/re */ \"./node_modules/semver/internal/re.js\")\nconst constants = __webpack_require__(/*! ./internal/constants */ \"./node_modules/semver/internal/constants.js\")\nconst SemVer = __webpack_require__(/*! ./classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst identifiers = __webpack_require__(/*! ./internal/identifiers */ \"./node_modules/semver/internal/identifiers.js\")\nconst parse = __webpack_require__(/*! ./functions/parse */ \"./node_modules/semver/functions/parse.js\")\nconst valid = __webpack_require__(/*! ./functions/valid */ \"./node_modules/semver/functions/valid.js\")\nconst clean = __webpack_require__(/*! ./functions/clean */ \"./node_modules/semver/functions/clean.js\")\nconst inc = __webpack_require__(/*! ./functions/inc */ \"./node_modules/semver/functions/inc.js\")\nconst diff = __webpack_require__(/*! ./functions/diff */ \"./node_modules/semver/functions/diff.js\")\nconst major = __webpack_require__(/*! ./functions/major */ \"./node_modules/semver/functions/major.js\")\nconst minor = __webpack_require__(/*! ./functions/minor */ \"./node_modules/semver/functions/minor.js\")\nconst patch = __webpack_require__(/*! ./functions/patch */ \"./node_modules/semver/functions/patch.js\")\nconst prerelease = __webpack_require__(/*! ./functions/prerelease */ \"./node_modules/semver/functions/prerelease.js\")\nconst compare = __webpack_require__(/*! ./functions/compare */ \"./node_modules/semver/functions/compare.js\")\nconst rcompare = __webpack_require__(/*! ./functions/rcompare */ \"./node_modules/semver/functions/rcompare.js\")\nconst compareLoose = __webpack_require__(/*! ./functions/compare-loose */ \"./node_modules/semver/functions/compare-loose.js\")\nconst compareBuild = __webpack_require__(/*! ./functions/compare-build */ \"./node_modules/semver/functions/compare-build.js\")\nconst sort = __webpack_require__(/*! ./functions/sort */ \"./node_modules/semver/functions/sort.js\")\nconst rsort = __webpack_require__(/*! ./functions/rsort */ \"./node_modules/semver/functions/rsort.js\")\nconst gt = __webpack_require__(/*! ./functions/gt */ \"./node_modules/semver/functions/gt.js\")\nconst lt = __webpack_require__(/*! ./functions/lt */ \"./node_modules/semver/functions/lt.js\")\nconst eq = __webpack_require__(/*! ./functions/eq */ \"./node_modules/semver/functions/eq.js\")\nconst neq = __webpack_require__(/*! ./functions/neq */ \"./node_modules/semver/functions/neq.js\")\nconst gte = __webpack_require__(/*! ./functions/gte */ \"./node_modules/semver/functions/gte.js\")\nconst lte = __webpack_require__(/*! ./functions/lte */ \"./node_modules/semver/functions/lte.js\")\nconst cmp = __webpack_require__(/*! ./functions/cmp */ \"./node_modules/semver/functions/cmp.js\")\nconst coerce = __webpack_require__(/*! ./functions/coerce */ \"./node_modules/semver/functions/coerce.js\")\nconst Comparator = __webpack_require__(/*! ./classes/comparator */ \"./node_modules/semver/classes/comparator.js\")\nconst Range = __webpack_require__(/*! ./classes/range */ \"./node_modules/semver/classes/range.js\")\nconst satisfies = __webpack_require__(/*! ./functions/satisfies */ \"./node_modules/semver/functions/satisfies.js\")\nconst toComparators = __webpack_require__(/*! ./ranges/to-comparators */ \"./node_modules/semver/ranges/to-comparators.js\")\nconst maxSatisfying = __webpack_require__(/*! ./ranges/max-satisfying */ \"./node_modules/semver/ranges/max-satisfying.js\")\nconst minSatisfying = __webpack_require__(/*! ./ranges/min-satisfying */ \"./node_modules/semver/ranges/min-satisfying.js\")\nconst minVersion = __webpack_require__(/*! ./ranges/min-version */ \"./node_modules/semver/ranges/min-version.js\")\nconst validRange = __webpack_require__(/*! ./ranges/valid */ \"./node_modules/semver/ranges/valid.js\")\nconst outside = __webpack_require__(/*! ./ranges/outside */ \"./node_modules/semver/ranges/outside.js\")\nconst gtr = __webpack_require__(/*! ./ranges/gtr */ \"./node_modules/semver/ranges/gtr.js\")\nconst ltr = __webpack_require__(/*! ./ranges/ltr */ \"./node_modules/semver/ranges/ltr.js\")\nconst intersects = __webpack_require__(/*! ./ranges/intersects */ \"./node_modules/semver/ranges/intersects.js\")\nconst simplifyRange = __webpack_require__(/*! ./ranges/simplify */ \"./node_modules/semver/ranges/simplify.js\")\nconst subset = __webpack_require__(/*! ./ranges/subset */ \"./node_modules/semver/ranges/subset.js\")\nmodule.exports = {\n  parse,\n  valid,\n  clean,\n  inc,\n  diff,\n  major,\n  minor,\n  patch,\n  prerelease,\n  compare,\n  rcompare,\n  compareLoose,\n  compareBuild,\n  sort,\n  rsort,\n  gt,\n  lt,\n  eq,\n  neq,\n  gte,\n  lte,\n  cmp,\n  coerce,\n  Comparator,\n  Range,\n  satisfies,\n  toComparators,\n  maxSatisfying,\n  minSatisfying,\n  minVersion,\n  validRange,\n  outside,\n  gtr,\n  ltr,\n  intersects,\n  simplifyRange,\n  subset,\n  SemVer,\n  re: internalRe.re,\n  src: internalRe.src,\n  tokens: internalRe.t,\n  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,\n  RELEASE_TYPES: constants.RELEASE_TYPES,\n  compareIdentifiers: identifiers.compareIdentifiers,\n  rcompareIdentifiers: identifiers.rcompareIdentifiers,\n}\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/index.js?");

/***/ }),

/***/ "./node_modules/semver/internal/constants.js":
/*!***************************************************!*\
  !*** ./node_modules/semver/internal/constants.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n// Note: this is the semver.org version of the spec that it implements\n// Not necessarily the package version of this code.\nconst SEMVER_SPEC_VERSION = '2.0.0'\n\nconst MAX_LENGTH = 256\nconst MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||\n/* istanbul ignore next */ 9007199254740991\n\n// Max safe segment length for coercion.\nconst MAX_SAFE_COMPONENT_LENGTH = 16\n\n// Max safe length for a build identifier. The max length minus 6 characters for\n// the shortest version with a build 0.0.0+BUILD.\nconst MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6\n\nconst RELEASE_TYPES = [\n  'major',\n  'premajor',\n  'minor',\n  'preminor',\n  'patch',\n  'prepatch',\n  'prerelease',\n]\n\nmodule.exports = {\n  MAX_LENGTH,\n  MAX_SAFE_COMPONENT_LENGTH,\n  MAX_SAFE_BUILD_LENGTH,\n  MAX_SAFE_INTEGER,\n  RELEASE_TYPES,\n  SEMVER_SPEC_VERSION,\n  FLAG_INCLUDE_PRERELEASE: 0b001,\n  FLAG_LOOSE: 0b010,\n}\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/internal/constants.js?");

/***/ }),

/***/ "./node_modules/semver/internal/debug.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/internal/debug.js ***!
  \***********************************************/
/***/ ((module) => {

"use strict";
eval("\n\nconst debug = (\n  typeof process === 'object' &&\n  process.env &&\n  process.env.NODE_DEBUG &&\n  /\\bsemver\\b/i.test(process.env.NODE_DEBUG)\n) ? (...args) => console.error('SEMVER', ...args)\n  : () => {}\n\nmodule.exports = debug\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/internal/debug.js?");

/***/ }),

/***/ "./node_modules/semver/internal/identifiers.js":
/*!*****************************************************!*\
  !*** ./node_modules/semver/internal/identifiers.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nconst numeric = /^[0-9]+$/\nconst compareIdentifiers = (a, b) => {\n  const anum = numeric.test(a)\n  const bnum = numeric.test(b)\n\n  if (anum && bnum) {\n    a = +a\n    b = +b\n  }\n\n  return a === b ? 0\n    : (anum && !bnum) ? -1\n    : (bnum && !anum) ? 1\n    : a < b ? -1\n    : 1\n}\n\nconst rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)\n\nmodule.exports = {\n  compareIdentifiers,\n  rcompareIdentifiers,\n}\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/internal/identifiers.js?");

/***/ }),

/***/ "./node_modules/semver/internal/lrucache.js":
/*!**************************************************!*\
  !*** ./node_modules/semver/internal/lrucache.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nclass LRUCache {\n  constructor () {\n    this.max = 1000\n    this.map = new Map()\n  }\n\n  get (key) {\n    const value = this.map.get(key)\n    if (value === undefined) {\n      return undefined\n    } else {\n      // Remove the key from the map and add it to the end\n      this.map.delete(key)\n      this.map.set(key, value)\n      return value\n    }\n  }\n\n  delete (key) {\n    return this.map.delete(key)\n  }\n\n  set (key, value) {\n    const deleted = this.delete(key)\n\n    if (!deleted && value !== undefined) {\n      // If cache is full, delete the least recently used item\n      if (this.map.size >= this.max) {\n        const firstKey = this.map.keys().next().value\n        this.delete(firstKey)\n      }\n\n      this.map.set(key, value)\n    }\n\n    return this\n  }\n}\n\nmodule.exports = LRUCache\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/internal/lrucache.js?");

/***/ }),

/***/ "./node_modules/semver/internal/parse-options.js":
/*!*******************************************************!*\
  !*** ./node_modules/semver/internal/parse-options.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n// parse out just the options we care about\nconst looseOption = Object.freeze({ loose: true })\nconst emptyOpts = Object.freeze({ })\nconst parseOptions = options => {\n  if (!options) {\n    return emptyOpts\n  }\n\n  if (typeof options !== 'object') {\n    return looseOption\n  }\n\n  return options\n}\nmodule.exports = parseOptions\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/internal/parse-options.js?");

/***/ }),

/***/ "./node_modules/semver/internal/re.js":
/*!********************************************!*\
  !*** ./node_modules/semver/internal/re.js ***!
  \********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
eval("\n\nconst {\n  MAX_SAFE_COMPONENT_LENGTH,\n  MAX_SAFE_BUILD_LENGTH,\n  MAX_LENGTH,\n} = __webpack_require__(/*! ./constants */ \"./node_modules/semver/internal/constants.js\")\nconst debug = __webpack_require__(/*! ./debug */ \"./node_modules/semver/internal/debug.js\")\nexports = module.exports = {}\n\n// The actual regexps go on exports.re\nconst re = exports.re = []\nconst safeRe = exports.safeRe = []\nconst src = exports.src = []\nconst safeSrc = exports.safeSrc = []\nconst t = exports.t = {}\nlet R = 0\n\nconst LETTERDASHNUMBER = '[a-zA-Z0-9-]'\n\n// Replace some greedy regex tokens to prevent regex dos issues. These regex are\n// used internally via the safeRe object since all inputs in this library get\n// normalized first to trim and collapse all extra whitespace. The original\n// regexes are exported for userland consumption and lower level usage. A\n// future breaking change could export the safer regex only with a note that\n// all input should have extra whitespace removed.\nconst safeRegexReplacements = [\n  ['\\\\s', 1],\n  ['\\\\d', MAX_LENGTH],\n  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],\n]\n\nconst makeSafeRegex = (value) => {\n  for (const [token, max] of safeRegexReplacements) {\n    value = value\n      .split(`${token}*`).join(`${token}{0,${max}}`)\n      .split(`${token}+`).join(`${token}{1,${max}}`)\n  }\n  return value\n}\n\nconst createToken = (name, value, isGlobal) => {\n  const safe = makeSafeRegex(value)\n  const index = R++\n  debug(name, index, value)\n  t[name] = index\n  src[index] = value\n  safeSrc[index] = safe\n  re[index] = new RegExp(value, isGlobal ? 'g' : undefined)\n  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined)\n}\n\n// The following Regular Expressions can be used for tokenizing,\n// validating, and parsing SemVer version strings.\n\n// ## Numeric Identifier\n// A single `0`, or a non-zero digit followed by zero or more digits.\n\ncreateToken('NUMERICIDENTIFIER', '0|[1-9]\\\\d*')\ncreateToken('NUMERICIDENTIFIERLOOSE', '\\\\d+')\n\n// ## Non-numeric Identifier\n// Zero or more digits, followed by a letter or hyphen, and then zero or\n// more letters, digits, or hyphens.\n\ncreateToken('NONNUMERICIDENTIFIER', `\\\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`)\n\n// ## Main Version\n// Three dot-separated numeric identifiers.\n\ncreateToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\\\.` +\n                   `(${src[t.NUMERICIDENTIFIER]})\\\\.` +\n                   `(${src[t.NUMERICIDENTIFIER]})`)\n\ncreateToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\\\.` +\n                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\\\.` +\n                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`)\n\n// ## Pre-release Version Identifier\n// A numeric identifier, or a non-numeric identifier.\n// Non-numberic identifiers include numberic identifiers but can be longer.\n// Therefore non-numberic identifiers must go first.\n\ncreateToken('PRERELEASEIDENTIFIER', `(?:${src[t.NONNUMERICIDENTIFIER]\n}|${src[t.NUMERICIDENTIFIER]})`)\n\ncreateToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NONNUMERICIDENTIFIER]\n}|${src[t.NUMERICIDENTIFIERLOOSE]})`)\n\n// ## Pre-release Version\n// Hyphen, followed by one or more dot-separated pre-release version\n// identifiers.\n\ncreateToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]\n}(?:\\\\.${src[t.PRERELEASEIDENTIFIER]})*))`)\n\ncreateToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]\n}(?:\\\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)\n\n// ## Build Metadata Identifier\n// Any combination of digits, letters, or hyphens.\n\ncreateToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`)\n\n// ## Build Metadata\n// Plus sign, followed by one or more period-separated build metadata\n// identifiers.\n\ncreateToken('BUILD', `(?:\\\\+(${src[t.BUILDIDENTIFIER]\n}(?:\\\\.${src[t.BUILDIDENTIFIER]})*))`)\n\n// ## Full Version String\n// A main version, followed optionally by a pre-release version and\n// build metadata.\n\n// Note that the only major, minor, patch, and pre-release sections of\n// the version string are capturing groups.  The build metadata is not a\n// capturing group, because it should not ever be used in version\n// comparison.\n\ncreateToken('FULLPLAIN', `v?${src[t.MAINVERSION]\n}${src[t.PRERELEASE]}?${\n  src[t.BUILD]}?`)\n\ncreateToken('FULL', `^${src[t.FULLPLAIN]}$`)\n\n// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.\n// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty\n// common in the npm registry.\ncreateToken('LOOSEPLAIN', `[v=\\\\s]*${src[t.MAINVERSIONLOOSE]\n}${src[t.PRERELEASELOOSE]}?${\n  src[t.BUILD]}?`)\n\ncreateToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)\n\ncreateToken('GTLT', '((?:<|>)?=?)')\n\n// Something like \"2.*\" or \"1.2.x\".\n// Note that \"x.x\" is a valid xRange identifer, meaning \"any version\"\n// Only the first item is strictly required.\ncreateToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\\\*`)\ncreateToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\\\*`)\n\ncreateToken('XRANGEPLAIN', `[v=\\\\s]*(${src[t.XRANGEIDENTIFIER]})` +\n                   `(?:\\\\.(${src[t.XRANGEIDENTIFIER]})` +\n                   `(?:\\\\.(${src[t.XRANGEIDENTIFIER]})` +\n                   `(?:${src[t.PRERELEASE]})?${\n                     src[t.BUILD]}?` +\n                   `)?)?`)\n\ncreateToken('XRANGEPLAINLOOSE', `[v=\\\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +\n                        `(?:\\\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +\n                        `(?:\\\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +\n                        `(?:${src[t.PRERELEASELOOSE]})?${\n                          src[t.BUILD]}?` +\n                        `)?)?`)\n\ncreateToken('XRANGE', `^${src[t.GTLT]}\\\\s*${src[t.XRANGEPLAIN]}$`)\ncreateToken('XRANGELOOSE', `^${src[t.GTLT]}\\\\s*${src[t.XRANGEPLAINLOOSE]}$`)\n\n// Coercion.\n// Extract anything that could conceivably be a part of a valid semver\ncreateToken('COERCEPLAIN', `${'(^|[^\\\\d])' +\n              '(\\\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +\n              `(?:\\\\.(\\\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +\n              `(?:\\\\.(\\\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`)\ncreateToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\\\d])`)\ncreateToken('COERCEFULL', src[t.COERCEPLAIN] +\n              `(?:${src[t.PRERELEASE]})?` +\n              `(?:${src[t.BUILD]})?` +\n              `(?:$|[^\\\\d])`)\ncreateToken('COERCERTL', src[t.COERCE], true)\ncreateToken('COERCERTLFULL', src[t.COERCEFULL], true)\n\n// Tilde ranges.\n// Meaning is \"reasonably at or greater than\"\ncreateToken('LONETILDE', '(?:~>?)')\n\ncreateToken('TILDETRIM', `(\\\\s*)${src[t.LONETILDE]}\\\\s+`, true)\nexports.tildeTrimReplace = '$1~'\n\ncreateToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)\ncreateToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)\n\n// Caret ranges.\n// Meaning is \"at least and backwards compatible with\"\ncreateToken('LONECARET', '(?:\\\\^)')\n\ncreateToken('CARETTRIM', `(\\\\s*)${src[t.LONECARET]}\\\\s+`, true)\nexports.caretTrimReplace = '$1^'\n\ncreateToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)\ncreateToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)\n\n// A simple gt/lt/eq thing, or just \"\" to indicate \"any version\"\ncreateToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\\\s*(${src[t.LOOSEPLAIN]})$|^$`)\ncreateToken('COMPARATOR', `^${src[t.GTLT]}\\\\s*(${src[t.FULLPLAIN]})$|^$`)\n\n// An expression to strip any whitespace between the gtlt and the thing\n// it modifies, so that `> 1.2.3` ==> `>1.2.3`\ncreateToken('COMPARATORTRIM', `(\\\\s*)${src[t.GTLT]\n}\\\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)\nexports.comparatorTrimReplace = '$1$2$3'\n\n// Something like `1.2.3 - 1.2.4`\n// Note that these all use the loose form, because they'll be\n// checked against either the strict or loose comparator form\n// later.\ncreateToken('HYPHENRANGE', `^\\\\s*(${src[t.XRANGEPLAIN]})` +\n                   `\\\\s+-\\\\s+` +\n                   `(${src[t.XRANGEPLAIN]})` +\n                   `\\\\s*$`)\n\ncreateToken('HYPHENRANGELOOSE', `^\\\\s*(${src[t.XRANGEPLAINLOOSE]})` +\n                        `\\\\s+-\\\\s+` +\n                        `(${src[t.XRANGEPLAINLOOSE]})` +\n                        `\\\\s*$`)\n\n// Star ranges basically just allow anything at all.\ncreateToken('STAR', '(<|>)?=?\\\\s*\\\\*')\n// >=0.0.0 is like a star\ncreateToken('GTE0', '^\\\\s*>=\\\\s*0\\\\.0\\\\.0\\\\s*$')\ncreateToken('GTE0PRE', '^\\\\s*>=\\\\s*0\\\\.0\\\\.0-0\\\\s*$')\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/internal/re.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/gtr.js":
/*!*******************************************!*\
  !*** ./node_modules/semver/ranges/gtr.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\n// Determine if version is greater than all the versions possible in the range.\nconst outside = __webpack_require__(/*! ./outside */ \"./node_modules/semver/ranges/outside.js\")\nconst gtr = (version, range, options) => outside(version, range, '>', options)\nmodule.exports = gtr\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/gtr.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/intersects.js":
/*!**************************************************!*\
  !*** ./node_modules/semver/ranges/intersects.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst Range = __webpack_require__(/*! ../classes/range */ \"./node_modules/semver/classes/range.js\")\nconst intersects = (r1, r2, options) => {\n  r1 = new Range(r1, options)\n  r2 = new Range(r2, options)\n  return r1.intersects(r2, options)\n}\nmodule.exports = intersects\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/intersects.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/ltr.js":
/*!*******************************************!*\
  !*** ./node_modules/semver/ranges/ltr.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst outside = __webpack_require__(/*! ./outside */ \"./node_modules/semver/ranges/outside.js\")\n// Determine if version is less than all the versions possible in the range\nconst ltr = (version, range, options) => outside(version, range, '<', options)\nmodule.exports = ltr\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/ltr.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/max-satisfying.js":
/*!******************************************************!*\
  !*** ./node_modules/semver/ranges/max-satisfying.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst Range = __webpack_require__(/*! ../classes/range */ \"./node_modules/semver/classes/range.js\")\n\nconst maxSatisfying = (versions, range, options) => {\n  let max = null\n  let maxSV = null\n  let rangeObj = null\n  try {\n    rangeObj = new Range(range, options)\n  } catch (er) {\n    return null\n  }\n  versions.forEach((v) => {\n    if (rangeObj.test(v)) {\n      // satisfies(v, range, options)\n      if (!max || maxSV.compare(v) === -1) {\n        // compare(max, v, true)\n        max = v\n        maxSV = new SemVer(max, options)\n      }\n    }\n  })\n  return max\n}\nmodule.exports = maxSatisfying\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/max-satisfying.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/min-satisfying.js":
/*!******************************************************!*\
  !*** ./node_modules/semver/ranges/min-satisfying.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst Range = __webpack_require__(/*! ../classes/range */ \"./node_modules/semver/classes/range.js\")\nconst minSatisfying = (versions, range, options) => {\n  let min = null\n  let minSV = null\n  let rangeObj = null\n  try {\n    rangeObj = new Range(range, options)\n  } catch (er) {\n    return null\n  }\n  versions.forEach((v) => {\n    if (rangeObj.test(v)) {\n      // satisfies(v, range, options)\n      if (!min || minSV.compare(v) === 1) {\n        // compare(min, v, true)\n        min = v\n        minSV = new SemVer(min, options)\n      }\n    }\n  })\n  return min\n}\nmodule.exports = minSatisfying\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/min-satisfying.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/min-version.js":
/*!***************************************************!*\
  !*** ./node_modules/semver/ranges/min-version.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst Range = __webpack_require__(/*! ../classes/range */ \"./node_modules/semver/classes/range.js\")\nconst gt = __webpack_require__(/*! ../functions/gt */ \"./node_modules/semver/functions/gt.js\")\n\nconst minVersion = (range, loose) => {\n  range = new Range(range, loose)\n\n  let minver = new SemVer('0.0.0')\n  if (range.test(minver)) {\n    return minver\n  }\n\n  minver = new SemVer('0.0.0-0')\n  if (range.test(minver)) {\n    return minver\n  }\n\n  minver = null\n  for (let i = 0; i < range.set.length; ++i) {\n    const comparators = range.set[i]\n\n    let setMin = null\n    comparators.forEach((comparator) => {\n      // Clone to avoid manipulating the comparator's semver object.\n      const compver = new SemVer(comparator.semver.version)\n      switch (comparator.operator) {\n        case '>':\n          if (compver.prerelease.length === 0) {\n            compver.patch++\n          } else {\n            compver.prerelease.push(0)\n          }\n          compver.raw = compver.format()\n          /* fallthrough */\n        case '':\n        case '>=':\n          if (!setMin || gt(compver, setMin)) {\n            setMin = compver\n          }\n          break\n        case '<':\n        case '<=':\n          /* Ignore maximum versions */\n          break\n        /* istanbul ignore next */\n        default:\n          throw new Error(`Unexpected operation: ${comparator.operator}`)\n      }\n    })\n    if (setMin && (!minver || gt(minver, setMin))) {\n      minver = setMin\n    }\n  }\n\n  if (minver && range.test(minver)) {\n    return minver\n  }\n\n  return null\n}\nmodule.exports = minVersion\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/min-version.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/outside.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/ranges/outside.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst SemVer = __webpack_require__(/*! ../classes/semver */ \"./node_modules/semver/classes/semver.js\")\nconst Comparator = __webpack_require__(/*! ../classes/comparator */ \"./node_modules/semver/classes/comparator.js\")\nconst { ANY } = Comparator\nconst Range = __webpack_require__(/*! ../classes/range */ \"./node_modules/semver/classes/range.js\")\nconst satisfies = __webpack_require__(/*! ../functions/satisfies */ \"./node_modules/semver/functions/satisfies.js\")\nconst gt = __webpack_require__(/*! ../functions/gt */ \"./node_modules/semver/functions/gt.js\")\nconst lt = __webpack_require__(/*! ../functions/lt */ \"./node_modules/semver/functions/lt.js\")\nconst lte = __webpack_require__(/*! ../functions/lte */ \"./node_modules/semver/functions/lte.js\")\nconst gte = __webpack_require__(/*! ../functions/gte */ \"./node_modules/semver/functions/gte.js\")\n\nconst outside = (version, range, hilo, options) => {\n  version = new SemVer(version, options)\n  range = new Range(range, options)\n\n  let gtfn, ltefn, ltfn, comp, ecomp\n  switch (hilo) {\n    case '>':\n      gtfn = gt\n      ltefn = lte\n      ltfn = lt\n      comp = '>'\n      ecomp = '>='\n      break\n    case '<':\n      gtfn = lt\n      ltefn = gte\n      ltfn = gt\n      comp = '<'\n      ecomp = '<='\n      break\n    default:\n      throw new TypeError('Must provide a hilo val of \"<\" or \">\"')\n  }\n\n  // If it satisfies the range it is not outside\n  if (satisfies(version, range, options)) {\n    return false\n  }\n\n  // From now on, variable terms are as if we're in \"gtr\" mode.\n  // but note that everything is flipped for the \"ltr\" function.\n\n  for (let i = 0; i < range.set.length; ++i) {\n    const comparators = range.set[i]\n\n    let high = null\n    let low = null\n\n    comparators.forEach((comparator) => {\n      if (comparator.semver === ANY) {\n        comparator = new Comparator('>=0.0.0')\n      }\n      high = high || comparator\n      low = low || comparator\n      if (gtfn(comparator.semver, high.semver, options)) {\n        high = comparator\n      } else if (ltfn(comparator.semver, low.semver, options)) {\n        low = comparator\n      }\n    })\n\n    // If the edge version comparator has a operator then our version\n    // isn't outside it\n    if (high.operator === comp || high.operator === ecomp) {\n      return false\n    }\n\n    // If the lowest version comparator has an operator and our version\n    // is less than it then it isn't higher than the range\n    if ((!low.operator || low.operator === comp) &&\n        ltefn(version, low.semver)) {\n      return false\n    } else if (low.operator === ecomp && ltfn(version, low.semver)) {\n      return false\n    }\n  }\n  return true\n}\n\nmodule.exports = outside\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/outside.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/simplify.js":
/*!************************************************!*\
  !*** ./node_modules/semver/ranges/simplify.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\n// given a set of versions and a range, create a \"simplified\" range\n// that includes the same versions that the original range does\n// If the original range is shorter than the simplified one, return that.\nconst satisfies = __webpack_require__(/*! ../functions/satisfies.js */ \"./node_modules/semver/functions/satisfies.js\")\nconst compare = __webpack_require__(/*! ../functions/compare.js */ \"./node_modules/semver/functions/compare.js\")\nmodule.exports = (versions, range, options) => {\n  const set = []\n  let first = null\n  let prev = null\n  const v = versions.sort((a, b) => compare(a, b, options))\n  for (const version of v) {\n    const included = satisfies(version, range, options)\n    if (included) {\n      prev = version\n      if (!first) {\n        first = version\n      }\n    } else {\n      if (prev) {\n        set.push([first, prev])\n      }\n      prev = null\n      first = null\n    }\n  }\n  if (first) {\n    set.push([first, null])\n  }\n\n  const ranges = []\n  for (const [min, max] of set) {\n    if (min === max) {\n      ranges.push(min)\n    } else if (!max && min === v[0]) {\n      ranges.push('*')\n    } else if (!max) {\n      ranges.push(`>=${min}`)\n    } else if (min === v[0]) {\n      ranges.push(`<=${max}`)\n    } else {\n      ranges.push(`${min} - ${max}`)\n    }\n  }\n  const simplified = ranges.join(' || ')\n  const original = typeof range.raw === 'string' ? range.raw : String(range)\n  return simplified.length < original.length ? simplified : range\n}\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/simplify.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/subset.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/ranges/subset.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst Range = __webpack_require__(/*! ../classes/range.js */ \"./node_modules/semver/classes/range.js\")\nconst Comparator = __webpack_require__(/*! ../classes/comparator.js */ \"./node_modules/semver/classes/comparator.js\")\nconst { ANY } = Comparator\nconst satisfies = __webpack_require__(/*! ../functions/satisfies.js */ \"./node_modules/semver/functions/satisfies.js\")\nconst compare = __webpack_require__(/*! ../functions/compare.js */ \"./node_modules/semver/functions/compare.js\")\n\n// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:\n// - Every simple range `r1, r2, ...` is a null set, OR\n// - Every simple range `r1, r2, ...` which is not a null set is a subset of\n//   some `R1, R2, ...`\n//\n// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:\n// - If c is only the ANY comparator\n//   - If C is only the ANY comparator, return true\n//   - Else if in prerelease mode, return false\n//   - else replace c with `[>=0.0.0]`\n// - If C is only the ANY comparator\n//   - if in prerelease mode, return true\n//   - else replace C with `[>=0.0.0]`\n// - Let EQ be the set of = comparators in c\n// - If EQ is more than one, return true (null set)\n// - Let GT be the highest > or >= comparator in c\n// - Let LT be the lowest < or <= comparator in c\n// - If GT and LT, and GT.semver > LT.semver, return true (null set)\n// - If any C is a = range, and GT or LT are set, return false\n// - If EQ\n//   - If GT, and EQ does not satisfy GT, return true (null set)\n//   - If LT, and EQ does not satisfy LT, return true (null set)\n//   - If EQ satisfies every C, return true\n//   - Else return false\n// - If GT\n//   - If GT.semver is lower than any > or >= comp in C, return false\n//   - If GT is >=, and GT.semver does not satisfy every C, return false\n//   - If GT.semver has a prerelease, and not in prerelease mode\n//     - If no C has a prerelease and the GT.semver tuple, return false\n// - If LT\n//   - If LT.semver is greater than any < or <= comp in C, return false\n//   - If LT is <=, and LT.semver does not satisfy every C, return false\n//   - If GT.semver has a prerelease, and not in prerelease mode\n//     - If no C has a prerelease and the LT.semver tuple, return false\n// - Else return true\n\nconst subset = (sub, dom, options = {}) => {\n  if (sub === dom) {\n    return true\n  }\n\n  sub = new Range(sub, options)\n  dom = new Range(dom, options)\n  let sawNonNull = false\n\n  OUTER: for (const simpleSub of sub.set) {\n    for (const simpleDom of dom.set) {\n      const isSub = simpleSubset(simpleSub, simpleDom, options)\n      sawNonNull = sawNonNull || isSub !== null\n      if (isSub) {\n        continue OUTER\n      }\n    }\n    // the null set is a subset of everything, but null simple ranges in\n    // a complex range should be ignored.  so if we saw a non-null range,\n    // then we know this isn't a subset, but if EVERY simple range was null,\n    // then it is a subset.\n    if (sawNonNull) {\n      return false\n    }\n  }\n  return true\n}\n\nconst minimumVersionWithPreRelease = [new Comparator('>=0.0.0-0')]\nconst minimumVersion = [new Comparator('>=0.0.0')]\n\nconst simpleSubset = (sub, dom, options) => {\n  if (sub === dom) {\n    return true\n  }\n\n  if (sub.length === 1 && sub[0].semver === ANY) {\n    if (dom.length === 1 && dom[0].semver === ANY) {\n      return true\n    } else if (options.includePrerelease) {\n      sub = minimumVersionWithPreRelease\n    } else {\n      sub = minimumVersion\n    }\n  }\n\n  if (dom.length === 1 && dom[0].semver === ANY) {\n    if (options.includePrerelease) {\n      return true\n    } else {\n      dom = minimumVersion\n    }\n  }\n\n  const eqSet = new Set()\n  let gt, lt\n  for (const c of sub) {\n    if (c.operator === '>' || c.operator === '>=') {\n      gt = higherGT(gt, c, options)\n    } else if (c.operator === '<' || c.operator === '<=') {\n      lt = lowerLT(lt, c, options)\n    } else {\n      eqSet.add(c.semver)\n    }\n  }\n\n  if (eqSet.size > 1) {\n    return null\n  }\n\n  let gtltComp\n  if (gt && lt) {\n    gtltComp = compare(gt.semver, lt.semver, options)\n    if (gtltComp > 0) {\n      return null\n    } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {\n      return null\n    }\n  }\n\n  // will iterate one or zero times\n  for (const eq of eqSet) {\n    if (gt && !satisfies(eq, String(gt), options)) {\n      return null\n    }\n\n    if (lt && !satisfies(eq, String(lt), options)) {\n      return null\n    }\n\n    for (const c of dom) {\n      if (!satisfies(eq, String(c), options)) {\n        return false\n      }\n    }\n\n    return true\n  }\n\n  let higher, lower\n  let hasDomLT, hasDomGT\n  // if the subset has a prerelease, we need a comparator in the superset\n  // with the same tuple and a prerelease, or it's not a subset\n  let needDomLTPre = lt &&\n    !options.includePrerelease &&\n    lt.semver.prerelease.length ? lt.semver : false\n  let needDomGTPre = gt &&\n    !options.includePrerelease &&\n    gt.semver.prerelease.length ? gt.semver : false\n  // exception: <1.2.3-0 is the same as <1.2.3\n  if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&\n      lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {\n    needDomLTPre = false\n  }\n\n  for (const c of dom) {\n    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>='\n    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<='\n    if (gt) {\n      if (needDomGTPre) {\n        if (c.semver.prerelease && c.semver.prerelease.length &&\n            c.semver.major === needDomGTPre.major &&\n            c.semver.minor === needDomGTPre.minor &&\n            c.semver.patch === needDomGTPre.patch) {\n          needDomGTPre = false\n        }\n      }\n      if (c.operator === '>' || c.operator === '>=') {\n        higher = higherGT(gt, c, options)\n        if (higher === c && higher !== gt) {\n          return false\n        }\n      } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options)) {\n        return false\n      }\n    }\n    if (lt) {\n      if (needDomLTPre) {\n        if (c.semver.prerelease && c.semver.prerelease.length &&\n            c.semver.major === needDomLTPre.major &&\n            c.semver.minor === needDomLTPre.minor &&\n            c.semver.patch === needDomLTPre.patch) {\n          needDomLTPre = false\n        }\n      }\n      if (c.operator === '<' || c.operator === '<=') {\n        lower = lowerLT(lt, c, options)\n        if (lower === c && lower !== lt) {\n          return false\n        }\n      } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options)) {\n        return false\n      }\n    }\n    if (!c.operator && (lt || gt) && gtltComp !== 0) {\n      return false\n    }\n  }\n\n  // if there was a < or >, and nothing in the dom, then must be false\n  // UNLESS it was limited by another range in the other direction.\n  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0\n  if (gt && hasDomLT && !lt && gtltComp !== 0) {\n    return false\n  }\n\n  if (lt && hasDomGT && !gt && gtltComp !== 0) {\n    return false\n  }\n\n  // we needed a prerelease range in a specific tuple, but didn't get one\n  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,\n  // because it includes prereleases in the 1.2.3 tuple\n  if (needDomGTPre || needDomLTPre) {\n    return false\n  }\n\n  return true\n}\n\n// >=1.2.3 is lower than >1.2.3\nconst higherGT = (a, b, options) => {\n  if (!a) {\n    return b\n  }\n  const comp = compare(a.semver, b.semver, options)\n  return comp > 0 ? a\n    : comp < 0 ? b\n    : b.operator === '>' && a.operator === '>=' ? b\n    : a\n}\n\n// <=1.2.3 is higher than <1.2.3\nconst lowerLT = (a, b, options) => {\n  if (!a) {\n    return b\n  }\n  const comp = compare(a.semver, b.semver, options)\n  return comp < 0 ? a\n    : comp > 0 ? b\n    : b.operator === '<' && a.operator === '<=' ? b\n    : a\n}\n\nmodule.exports = subset\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/subset.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/to-comparators.js":
/*!******************************************************!*\
  !*** ./node_modules/semver/ranges/to-comparators.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst Range = __webpack_require__(/*! ../classes/range */ \"./node_modules/semver/classes/range.js\")\n\n// Mostly just for testing and legacy API reasons\nconst toComparators = (range, options) =>\n  new Range(range, options).set\n    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '))\n\nmodule.exports = toComparators\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/to-comparators.js?");

/***/ }),

/***/ "./node_modules/semver/ranges/valid.js":
/*!*********************************************!*\
  !*** ./node_modules/semver/ranges/valid.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nconst Range = __webpack_require__(/*! ../classes/range */ \"./node_modules/semver/classes/range.js\")\nconst validRange = (range, options) => {\n  try {\n    // Return '*' instead of '' so that truthiness works.\n    // This will throw if it's invalid anyway\n    return new Range(range, options).range || '*'\n  } catch (er) {\n    return null\n  }\n}\nmodule.exports = validRange\n\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/semver/ranges/valid.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nvar stylesInDOM = [];\nfunction getIndexByIdentifier(identifier) {\n  var result = -1;\n  for (var i = 0; i < stylesInDOM.length; i++) {\n    if (stylesInDOM[i].identifier === identifier) {\n      result = i;\n      break;\n    }\n  }\n  return result;\n}\nfunction modulesToDom(list, options) {\n  var idCountMap = {};\n  var identifiers = [];\n  for (var i = 0; i < list.length; i++) {\n    var item = list[i];\n    var id = options.base ? item[0] + options.base : item[0];\n    var count = idCountMap[id] || 0;\n    var identifier = \"\".concat(id, \" \").concat(count);\n    idCountMap[id] = count + 1;\n    var indexByIdentifier = getIndexByIdentifier(identifier);\n    var obj = {\n      css: item[1],\n      media: item[2],\n      sourceMap: item[3],\n      supports: item[4],\n      layer: item[5]\n    };\n    if (indexByIdentifier !== -1) {\n      stylesInDOM[indexByIdentifier].references++;\n      stylesInDOM[indexByIdentifier].updater(obj);\n    } else {\n      var updater = addElementStyle(obj, options);\n      options.byIndex = i;\n      stylesInDOM.splice(i, 0, {\n        identifier: identifier,\n        updater: updater,\n        references: 1\n      });\n    }\n    identifiers.push(identifier);\n  }\n  return identifiers;\n}\nfunction addElementStyle(obj, options) {\n  var api = options.domAPI(options);\n  api.update(obj);\n  var updater = function updater(newObj) {\n    if (newObj) {\n      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {\n        return;\n      }\n      api.update(obj = newObj);\n    } else {\n      api.remove();\n    }\n  };\n  return updater;\n}\nmodule.exports = function (list, options) {\n  options = options || {};\n  list = list || [];\n  var lastIdentifiers = modulesToDom(list, options);\n  return function update(newList) {\n    newList = newList || [];\n    for (var i = 0; i < lastIdentifiers.length; i++) {\n      var identifier = lastIdentifiers[i];\n      var index = getIndexByIdentifier(identifier);\n      stylesInDOM[index].references--;\n    }\n    var newLastIdentifiers = modulesToDom(newList, options);\n    for (var _i = 0; _i < lastIdentifiers.length; _i++) {\n      var _identifier = lastIdentifiers[_i];\n      var _index = getIndexByIdentifier(_identifier);\n      if (stylesInDOM[_index].references === 0) {\n        stylesInDOM[_index].updater();\n        stylesInDOM.splice(_index, 1);\n      }\n    }\n    lastIdentifiers = newLastIdentifiers;\n  };\n};\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nvar memo = {};\n\n/* istanbul ignore next  */\nfunction getTarget(target) {\n  if (typeof memo[target] === \"undefined\") {\n    var styleTarget = document.querySelector(target);\n\n    // Special case to return head of iframe instead of iframe itself\n    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {\n      try {\n        // This will throw an exception if access to iframe is blocked\n        // due to cross-origin restrictions\n        styleTarget = styleTarget.contentDocument.head;\n      } catch (e) {\n        // istanbul ignore next\n        styleTarget = null;\n      }\n    }\n    memo[target] = styleTarget;\n  }\n  return memo[target];\n}\n\n/* istanbul ignore next  */\nfunction insertBySelector(insert, style) {\n  var target = getTarget(insert);\n  if (!target) {\n    throw new Error(\"Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.\");\n  }\n  target.appendChild(style);\n}\nmodule.exports = insertBySelector;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/insertBySelector.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/* istanbul ignore next  */\nfunction insertStyleElement(options) {\n  var element = document.createElement(\"style\");\n  options.setAttributes(element, options.attributes);\n  options.insert(element, options.options);\n  return element;\n}\nmodule.exports = insertStyleElement;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/insertStyleElement.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\n/* istanbul ignore next  */\nfunction setAttributesWithoutAttributes(styleElement) {\n  var nonce =  true ? __webpack_require__.nc : 0;\n  if (nonce) {\n    styleElement.setAttribute(\"nonce\", nonce);\n  }\n}\nmodule.exports = setAttributesWithoutAttributes;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/* istanbul ignore next  */\nfunction apply(styleElement, options, obj) {\n  var css = \"\";\n  if (obj.supports) {\n    css += \"@supports (\".concat(obj.supports, \") {\");\n  }\n  if (obj.media) {\n    css += \"@media \".concat(obj.media, \" {\");\n  }\n  var needLayer = typeof obj.layer !== \"undefined\";\n  if (needLayer) {\n    css += \"@layer\".concat(obj.layer.length > 0 ? \" \".concat(obj.layer) : \"\", \" {\");\n  }\n  css += obj.css;\n  if (needLayer) {\n    css += \"}\";\n  }\n  if (obj.media) {\n    css += \"}\";\n  }\n  if (obj.supports) {\n    css += \"}\";\n  }\n  var sourceMap = obj.sourceMap;\n  if (sourceMap && typeof btoa !== \"undefined\") {\n    css += \"\\n/*# sourceMappingURL=data:application/json;base64,\".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), \" */\");\n  }\n\n  // For old IE\n  /* istanbul ignore if  */\n  options.styleTagTransform(css, styleElement, options.options);\n}\nfunction removeStyleElement(styleElement) {\n  // istanbul ignore if\n  if (styleElement.parentNode === null) {\n    return false;\n  }\n  styleElement.parentNode.removeChild(styleElement);\n}\n\n/* istanbul ignore next  */\nfunction domAPI(options) {\n  if (typeof document === \"undefined\") {\n    return {\n      update: function update() {},\n      remove: function remove() {}\n    };\n  }\n  var styleElement = options.insertStyleElement(options);\n  return {\n    update: function update(obj) {\n      apply(styleElement, options, obj);\n    },\n    remove: function remove() {\n      removeStyleElement(styleElement);\n    }\n  };\n}\nmodule.exports = domAPI;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/styleDomAPI.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/* istanbul ignore next  */\nfunction styleTagTransform(css, styleElement) {\n  if (styleElement.styleSheet) {\n    styleElement.styleSheet.cssText = css;\n  } else {\n    while (styleElement.firstChild) {\n      styleElement.removeChild(styleElement.firstChild);\n    }\n    styleElement.appendChild(document.createTextNode(css));\n  }\n}\nmodule.exports = styleTagTransform;\n\n//# sourceURL=webpack://aframe-stats-panel/./node_modules/style-loader/dist/runtime/styleTagTransform.js?");

/***/ }),

/***/ "./styles.css":
/*!********************!*\
  !*** ./styles.css ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generate = generate;
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function generate(jsonData) {
  var rootNodeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'RootObject';
  var jsonObject = JSON.parse(jsonData);

  if (Array.isArray(jsonObject) && jsonObject.length) {
    jsonObject = jsonObject[0];
  }

  var outputInterface = "interface ".concat(rootNodeName, " {\n").concat(Object.keys(jsonObject).map(function (key) {
    return "  ".concat(key, ": ").concat(_mapToDataType(key, jsonObject[key]), ";\n");
  }).join('')).concat("}\n");
  return outputInterface;
}

function _mapToDataType(key, value) {
  var dataType = _typeof(value);

  if (dataType !== 'object') return dataType;else return key.charAt(0).toUpperCase() + key.slice(1);
}

var _default = generate;
exports["default"] = _default;
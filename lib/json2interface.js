"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generate = generate;
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function generate(jsonData) {
  var rootInterfaceName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'RootObject';
  var jsonObject = JSON.parse(jsonData);

  if (Array.isArray(jsonObject) && jsonObject.length) {
    jsonObject = jsonObject[0];
  }

  var tsInterfaces = _findAllInterfaces(jsonObject, [{
    interfaceName: rootInterfaceName,
    jsonNode: jsonObject
  }]);

  return tsInterfaces.map(function (tsInterface) {
    return _mapJsonNodeToTypescriptInterface(tsInterface.jsonNode, tsInterface.interfaceName);
  }).join('');
}

function _findAllInterfaces(jsonNode, interfaces) {
  Object.keys(jsonNode).forEach(function (key) {
    if (!_isPrimitiveType(jsonNode[key])) {
      interfaces.push({
        interfaceName: _getCustomTypeName(key),
        jsonNode: jsonNode[key]
      });

      _findAllInterfaces(jsonNode[key], interfaces);
    }
  });
  return interfaces;
}
/**
 * Generates the TypeScript interface for a single level json object
 * @param {*} jsonNode a json object
 * @param {*} interfaceName the name of the interface mapping this node
 */


function _mapJsonNodeToTypescriptInterface(jsonNode, interfaceName) {
  var outputInterface = "interface ".concat(interfaceName, " {\n").concat(Object.keys(jsonNode).map(function (key) {
    return "  ".concat(key, ": ").concat(_getType(key, jsonNode[key]), ";\n");
  }).join('')).concat('}\n\n');
  return outputInterface;
}
/**
 * Returns the type of the value if it is a primitive type other than object. Otherwise, it returns the property name capitalized.
 * @param {*} propertyName the name of the property
 * @param {*} propertyValue the property value
 */


function _getType(propertyName, propertyValue) {
  if (_isPrimitiveType(propertyValue)) return _typeof(propertyValue);else return _getCustomTypeName(propertyName);
}
/**
 * Returns the property name Capitalized
 * @param {*} propertyName the name of the property
 */


function _getCustomTypeName(propertyName) {
  return propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
}
/**
 * Checks if the type of the param is a JavaScript primitive type or not
 * @param {*} value the value to be checked
 */


function _isPrimitiveType(value) {
  return _typeof(value) !== 'object';
}

var _default = generate;
exports["default"] = _default;
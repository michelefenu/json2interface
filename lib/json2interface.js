"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generate = generate;
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Parse a JSON string and returns a TypeScript interface representation
 * @param {string} jsonData a valid JSON string
 * @param {string} rootInterfaceName the name of the top level interface. Defaults to 'RootObject'
 */
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
  }).join('\n\n');
}
/**
 * Extract all jsonNodes to be remapped to a TypeScript interface
 * @param {object} jsonNode the jsonNode
 * @param {object} interfaces the interfaces array
 */


function _findAllInterfaces(jsonNode, interfaces) {
  var clonedJsonNode = JSON.parse(JSON.stringify(jsonNode));
  Object.keys(clonedJsonNode).forEach(function (key) {
    if (!_isPrimitiveType(clonedJsonNode[key])) {
      var isArray = Array.isArray(clonedJsonNode[key]);

      if (isArray) {
        clonedJsonNode[key] = clonedJsonNode[key][0] || [];
      } // The array does not contains primitive types


      if (!_isPrimitiveType(clonedJsonNode[key])) {
        interfaces.push({
          interfaceName: _toPascalCase(key),
          jsonNode: clonedJsonNode[key]
        });

        _findAllInterfaces(clonedJsonNode[key], interfaces);
      }
    }
  });
  return interfaces;
}
/**
 * Generates the TypeScript interface for a single level json object
 * @param {object} jsonNode a json object
 * @param {string} interfaceName the name of the interface mapping this node
 */


function _mapJsonNodeToTypescriptInterface(jsonNode, interfaceName) {
  var outputInterface = "export interface ".concat(interfaceName, " {\n").concat(Object.keys(jsonNode).map(function (key) {
    return "  ".concat(_toCamelCase(key), ": ").concat(_getType(key, jsonNode[key]), ";\n");
  }).join('')).concat('}');
  return outputInterface;
}
/**
 * Returns the type of the value if it is a primitive type other than object. Otherwise, it returns the property name capitalized.
 * @param {string} propertyName the name of the property
 * @param {any} propertyValue the property value
 */


function _getType(propertyName, propertyValue) {
  if (_isPrimitiveType(propertyValue)) {
    return _typeof(propertyValue);
  } else if (Array.isArray(propertyValue)) {
    return "".concat(_isPrimitiveType(propertyValue[0]) ? _typeof(propertyValue[0]) || 'any' : _toPascalCase(propertyName), "[]");
  } else {
    return _toPascalCase(propertyName);
  }
}
/**
 * Capitalizes a string. If the string is kebab-cased it will be converted to PascalCase.
 * e.g. geographic-position -> GeographicPosition, user -> User
 * @param {string} text the name of the property
 */


function _toPascalCase(text) {
  text = text.split('-');
  return text.map(function (x) {
    return x.charAt(0).toUpperCase() + x.slice(1);
  }).join('');
}
/**
 * If the string is kebab-cased it will be converted to camelCase.
 * e.g. geographic-position -> geographicPosition, user -> user
 * @param {string} text the name of the property
 */


function _toCamelCase(text) {
  text = text.split('-');
  return text.map(function (value, index) {
    return index === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);
  }).join('');
}
/**
 * Checks if the type of the param is a JavaScript primitive type or not
 * @param {any} value the value to be checked
 */


function _isPrimitiveType(value) {
  return _typeof(value) !== 'object';
}

var _default = generate;
exports["default"] = _default;
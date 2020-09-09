"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generate = generate;
exports["default"] = void 0;

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var PROPERTY_TYPE = {
  Primitive: 'Primitive',
  CustomObject: 'Object',
  Array: 'Array',
  NullOrUndefined: 'NullOrUndefined'
};
var interfaces = [];
/**
 * Parse a JSON string and returns a TypeScript interface representation
 * @param {string} jsonData a valid JSON string
 * @param {string} rootInterfaceName the name of the top level interface. Defaults to 'RootObject'
 */

function generate(jsonData) {
  var rootInterfaceName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'RootObject';
  var jsonNode = JSON.parse(jsonData);

  _getTypeScriptInterfaces(jsonNode, rootInterfaceName);

  return interfaces.map(function (tsInterface) {
    return "export interface ".concat(tsInterface.name, " {\n").concat(tsInterface.properties.map(function (prop) {
      return "  ".concat(prop.name, ": ").concat(prop.type);
    }).join('\n'), "\n}");
  }).join('\n\n');
}

function _getTypeScriptInterfaces(jsonNode, interfaceName) {
  if (_isArray(jsonNode)) {
    _getTypeScriptInterfaces(jsonNode[0], interfaceName);

    return;
  }

  var currentInterface = {
    name: interfaceName,
    properties: []
  };
  Object.keys(jsonNode).map(function (key) {
    switch (_getType(jsonNode[key])) {
      case PROPERTY_TYPE.Primitive:
        currentInterface.properties.push({
          name: _toCamelCase(key),
          type: _typeof(jsonNode[key])
        });
        break;

      case PROPERTY_TYPE.Array:
        break;

      case PROPERTY_TYPE.NullOrUndefined:
        currentInterface.properties.push({
          name: "".concat(_toCamelCase(key), "?"),
          type: 'any'
        });
        break;

      case PROPERTY_TYPE.Object:
        currentInterface.properties.push({
          name: _toCamelCase(key),
          type: _toPascalCase(key)
        });

        _getTypeScriptInterfaces(jsonNode[key], _toPascalCase(key));

        break;
    }
  });
  interfaces.push(currentInterface);
}
/**
 * Returns the type of the value
 * @param {string} value a JavaScript value
 */


function _getType(value) {
  if (_isPrimitive(value)) {
    return PROPERTY_TYPE.Primitive;
  } else if (_isNullOrUndefined(value)) {
    return PROPERTY_TYPE.NullOrUndefined;
  } else if (_isArray(value)) {
    return PROPERTY_TYPE.Array;
  } else if (_isCustomObject(value)) {
    return PROPERTY_TYPE.CustomObject;
  } else {// no way to get there
  }
}
/**
 * Checks if the type of the param is a JavaScript primitive type or not
 * @param {any} value the value to be checked
 */


function _isPrimitive(value) {
  return _typeof(value) !== 'object';
}
/**
 * Checks if the type of the param is a JavaScript Array
 * @param {any} value the value to be checked
 */


function _isArray(value) {
  return _typeof(value) === 'object' && Array.isArray(value);
}
/**
 * Checks if the type of the param is a custom Object
 * @param {any} value the value to be checked
 */


function _isCustomObject(value) {
  return _typeof(value) === 'object' && _isArray(value) && _isNullOrUndefined(value);
}
/**
 * Checks if the type of the param is null or undefined
 * @param {any} value the value to be checked
 */


function _isNullOrUndefined(value) {
  return value === null || typeof value === 'undefined';
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

var _default = generate;
exports["default"] = _default;
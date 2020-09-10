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
var interfaces;
/**
 * Parse a JSON string and returns a TypeScript interface representation
 * @param {string} jsonData a valid JSON string
 * @param {string} rootInterfaceName the name of the top level interface. Defaults to 'RootObject'
 */

function generate(jsonData) {
  var rootInterfaceName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'RootObject';
  interfaces = [];
  var jsonNode = JSON.parse(jsonData);

  _getTypeScriptInterfaces(jsonNode, rootInterfaceName);

  return interfaces.map(function (tsInterface) {
    return "export interface ".concat(tsInterface.name, " {\n").concat(tsInterface.properties.map(function (prop) {
      return "  ".concat(prop.name, ": ").concat(prop.type);
    }).join('\n'), "\n}");
  }).join('\n\n');
}
/**
 * Recursively generates interfaces from a root JSON node
 * @param {object} jsonNode a json to generate interface from
 * @param {string} interfaceName the name for the current interface
 */


function _getTypeScriptInterfaces(jsonNode, interfaceName) {
  if (_isArray(jsonNode)) {
    _getTypeScriptInterfaces(jsonNode[0], interfaceName);

    return;
  }

  var currentInterface = {
    name: interfaceName,
    properties: []
  };
  interfaces.push(currentInterface);
  var typeName, value;
  Object.keys(jsonNode).map(function (key) {
    switch (_getType(jsonNode[key])) {
      case PROPERTY_TYPE.Primitive:
        currentInterface.properties.push({
          name: _toSafeKey(key),
          type: _typeof(jsonNode[key])
        });
        break;

      case PROPERTY_TYPE.Array:
        ;

        var _getArrayTypeAndNode2 = _getArrayTypeAndNode(jsonNode[key], key);

        typeName = _getArrayTypeAndNode2.typeName;
        value = _getArrayTypeAndNode2.value;
        currentInterface.properties.push({
          name: _toSafeKey(key),
          type: typeName
        });

        if (_getType(value) === PROPERTY_TYPE.CustomObject) {
          _getTypeScriptInterfaces(value, _toPascalCase(typeName.replace(/\[\]/g, '')));
        }

        break;

      case PROPERTY_TYPE.NullOrUndefined:
        currentInterface.properties.push({
          name: "".concat(_toSafeKey(key), "?"),
          type: 'any'
        });
        break;

      case PROPERTY_TYPE.CustomObject:
        currentInterface.properties.push({
          name: _toSafeKey(key),
          type: _toPascalCase(_getValidName(key))
        });

        _getTypeScriptInterfaces(jsonNode[key], _toPascalCase(_getValidName(key)));

        break;
    }
  });
}
/**
 * Gets a valid interface name. If another interface with the same name exists it will return existingInterface2, existingInterface3 and so on
 * @param {string} interfaceName
 */


function _getValidName(interfaceName) {
  var numberOfSameNameInterfaces = interfaces.filter(function (x) {
    var _x$name;

    return ((_x$name = x.name) === null || _x$name === void 0 ? void 0 : _x$name.toUpperCase()) === interfaceName.toUpperCase();
  }).length;
  return numberOfSameNameInterfaces ? "".concat(interfaceName).concat(numberOfSameNameInterfaces + 1) : interfaceName;
}
/**
 * Returns TypeScript type name and inner node of an array
 * @param {object} arr
 */


function _getArrayTypeAndNode(arr, propertyName) {
  var typeName = [];

  while (_isArray(arr)) {
    typeName.unshift('[]');
    arr = arr[0];
  }

  switch (_getType(arr)) {
    case PROPERTY_TYPE.Primitive:
      typeName.unshift(_typeof(arr));
      break;

    case PROPERTY_TYPE.NullOrUndefined:
      typeName.unshift('any');
      break;

    case PROPERTY_TYPE.CustomObject:
      typeName.unshift(_getValidName(_toPascalCase(propertyName)));
      break;
  }

  return {
    typeName: typeName.join(''),
    value: arr
  };
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
  return _typeof(value) === 'object' && !_isArray(value) && !_isNullOrUndefined(value);
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
 * If the string is kebab-cased it will be wrapped in single quotes.
 * @param {string} text the name of the property
 */


function _toSafeKey(text) {
  if (text.split('-').length > 1) {
    return "'".concat(text, "'");
  } else {
    return text;
  }
}

var _default = generate;
exports["default"] = _default;
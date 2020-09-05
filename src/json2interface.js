/**
 * Parse a JSON string and returns a TypeScript interface representation
 * @param {string} jsonData a valid JSON string
 * @param {string} rootInterfaceName the name of the top level interface. Defaults to 'RootObject'
 */
export function generate (jsonData, rootInterfaceName = 'RootObject') {
  let jsonObject = JSON.parse(jsonData)

  if (Array.isArray(jsonObject) && jsonObject.length) {
    jsonObject = jsonObject[0]
  }

  const tsInterfaces = _findAllInterfaces(jsonObject, [
    { interfaceName: rootInterfaceName, jsonNode: jsonObject }
  ])

  return tsInterfaces
    .map(tsInterface =>
      _mapJsonNodeToTypescriptInterface(
        tsInterface.jsonNode,
        tsInterface.interfaceName
      )
    )
    .join('\n\n')
}

/**
 * Extract all jsonNodes to be remapped to a TypeScript interface
 * @param {object} jsonNode the jsonNode
 * @param {object} interfaces the interfaces array
 */
function _findAllInterfaces (jsonNode, interfaces) {
  const clonedJsonNode = JSON.parse(JSON.stringify(jsonNode))
  Object.keys(clonedJsonNode).forEach(key => {
    if (!_isPrimitiveType(clonedJsonNode[key])) {
      const isArray = Array.isArray(clonedJsonNode[key])

      if (isArray) {
        clonedJsonNode[key] = clonedJsonNode[key][0]
      }

      // The array does not contains only primitive types and the value is not null or undefined
      if (
        !_isPrimitiveType(clonedJsonNode[key]) &&
        !_isNullOrUndefined(clonedJsonNode[key])
      ) {
        interfaces.push({
          interfaceName: _toPascalCase(key),
          jsonNode: clonedJsonNode[key]
        })
        _findAllInterfaces(clonedJsonNode[key], interfaces)
      }
    }
  })

  return interfaces
}

/**
 * Generates the TypeScript interface for a single level json object
 * @param {object} jsonNode a json object
 * @param {string} interfaceName the name of the interface mapping this node
 */
function _mapJsonNodeToTypescriptInterface (jsonNode, interfaceName) {
  const outputInterface = `export interface ${interfaceName} {\n`
    .concat(
      Object.keys(jsonNode)
        .map(key =>
          !_isNullOrUndefined(jsonNode[key])
            ? `  ${_toCamelCase(key)}: ${_getType(key, jsonNode[key])};\n`
            : `  ${_toCamelCase(key)}?: any\n`
        )
        .join('')
    )
    .concat('}')

  return outputInterface
}

/**
 * Returns the type of the value if it is a primitive type other than object. Otherwise, it returns the property name capitalized.
 * @param {string} propertyName the name of the property
 * @param {any} propertyValue the property value
 */
function _getType (propertyName, propertyValue) {
  if (_isPrimitiveType(propertyValue)) {
    return typeof propertyValue
  } else if (Array.isArray(propertyValue)) {
    return `${
      _isPrimitiveType(propertyValue[0])
        ? typeof propertyValue[0]
        : _toPascalCase(propertyName)
    }[]`
  } else {
    return _toPascalCase(propertyName)
  }
}

/**
 * Capitalizes a string. If the string is kebab-cased it will be converted to PascalCase.
 * e.g. geographic-position -> GeographicPosition, user -> User
 * @param {string} text the name of the property
 */
function _toPascalCase (text) {
  text = text.split('-')
  return text.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('')
}

/**
 * If the string is kebab-cased it will be converted to camelCase.
 * e.g. geographic-position -> geographicPosition, user -> user
 * @param {string} text the name of the property
 */
function _toCamelCase (text) {
  text = text.split('-')
  return text
    .map((value, index) =>
      index === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1)
    )
    .join('')
}

/**
 * Checks if the type of the param is a JavaScript primitive type or not
 * @param {any} value the value to be checked
 */
function _isPrimitiveType (value) {
  return typeof value !== 'object'
}

/**
 * Checks if the type of the param is null or undefined
 * @param {any} value the value to be checked
 */
function _isNullOrUndefined (value) {
  return value === null || typeof value === 'undefined'
}

export default generate

const PROPERTY_TYPE = {
  Primitive: 'Primitive',
  CustomObject: 'Object',
  Array: 'Array',
  NullOrUndefined: 'NullOrUndefined'
}

const interfaces = []

/**
 * Parse a JSON string and returns a TypeScript interface representation
 * @param {string} jsonData a valid JSON string
 * @param {string} rootInterfaceName the name of the top level interface. Defaults to 'RootObject'
 */
export function generate (jsonData, rootInterfaceName = 'RootObject') {
  const jsonNode = JSON.parse(jsonData)

  _getTypeScriptInterfaces(jsonNode, rootInterfaceName)

  return interfaces
    .map(tsInterface => {
      return `export interface ${
        tsInterface.name
      } {\n${tsInterface.properties
        .map(prop => `  ${prop.name}: ${prop.type}`)
        .join('\n')}\n}`
    })
    .join('\n\n')
}

function _getTypeScriptInterfaces (jsonNode, interfaceName) {
  if (_isArray(jsonNode)) {
    _getTypeScriptInterfaces(jsonNode[0], interfaceName)
    return
  }

  const currentInterface = { name: interfaceName, properties: [] }

  Object.keys(jsonNode).map(key => {
    switch (_getType(jsonNode[key])) {
      case PROPERTY_TYPE.Primitive:
        currentInterface.properties.push({
          name: _toCamelCase(key),
          type: typeof jsonNode[key]
        })
        break
      case PROPERTY_TYPE.Array:
        break

      case PROPERTY_TYPE.NullOrUndefined:
        currentInterface.properties.push({
          name: `${_toCamelCase(key)}?`,
          type: 'any'
        })
        break

      case PROPERTY_TYPE.Object:
        currentInterface.properties.push({
          name: _toCamelCase(key),
          type: _toPascalCase(key)
        })

        _getTypeScriptInterfaces(jsonNode[key], _toPascalCase(key))
        break
    }
  })

  interfaces.push(currentInterface)
}

/**
 * Returns the type of the value
 * @param {string} value a JavaScript value
 */
function _getType (value) {
  if (_isPrimitive(value)) {
    return PROPERTY_TYPE.Primitive
  } else if (_isNullOrUndefined(value)) {
    return PROPERTY_TYPE.NullOrUndefined
  } else if (_isArray(value)) {
    return PROPERTY_TYPE.Array
  } else if (_isCustomObject(value)) {
    return PROPERTY_TYPE.CustomObject
  } else {
    // no way to get there
  }
}

/**
 * Checks if the type of the param is a JavaScript primitive type or not
 * @param {any} value the value to be checked
 */
function _isPrimitive (value) {
  return typeof value !== 'object'
}

/**
 * Checks if the type of the param is a JavaScript Array
 * @param {any} value the value to be checked
 */
function _isArray (value) {
  return typeof value === 'object' && Array.isArray(value)
}

/**
 * Checks if the type of the param is a custom Object
 * @param {any} value the value to be checked
 */
function _isCustomObject (value) {
  return (
    typeof value === 'object' && _isArray(value) && _isNullOrUndefined(value)
  )
}

/**
 * Checks if the type of the param is null or undefined
 * @param {any} value the value to be checked
 */
function _isNullOrUndefined (value) {
  return value === null || typeof value === 'undefined'
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

export default generate

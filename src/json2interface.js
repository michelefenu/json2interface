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
  Object.keys(jsonNode).forEach(key => {
    if (!_isPrimitiveType(jsonNode[key])) {
      interfaces.push({
        interfaceName: _getCustomTypeName(key),
        jsonNode: jsonNode[key]
      })
      _findAllInterfaces(jsonNode[key], interfaces)
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
        .map(key => `  ${key}: ${_getType(key, jsonNode[key])};\n`)
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
  if (_isPrimitiveType(propertyValue)) return typeof propertyValue
  else return _getCustomTypeName(propertyName)
}

/**
 * Returns the property name Capitalized
 * @param {string} propertyName the name of the property
 */
function _getCustomTypeName (propertyName) {
  return propertyName.charAt(0).toUpperCase() + propertyName.slice(1)
}

/**
 * Checks if the type of the param is a JavaScript primitive type or not
 * @param {any} value the value to be checked
 */
function _isPrimitiveType (value) {
  return typeof value !== 'object'
}

export default generate

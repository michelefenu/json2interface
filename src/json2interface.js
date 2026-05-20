const PROPERTY_TYPE = {
  Primitive: 'Primitive',
  CustomObject: 'Object',
  Array: 'Array',
  NullOrUndefined: 'NullOrUndefined'
}

const TS_RESERVED_WORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'implements', 'import', 'in',
  'instanceof', 'interface', 'let', 'new', 'null', 'package', 'private',
  'protected', 'public', 'return', 'static', 'super', 'switch', 'this',
  'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while',
  'with', 'yield'
])

/**
 * Parse a JSON string and returns a TypeScript interface representation
 * @param {string} jsonData a valid JSON string
 * @param {string} rootInterfaceName the name of the top level interface. Defaults to 'RootObject'
 */
export function generate (jsonData, rootInterfaceName = 'RootObject') {
  const ctx = { interfaces: [], seenShapes: new Map() }
  const jsonNode = JSON.parse(jsonData)

  _processNode(jsonNode, _sanitizeInterfaceName(rootInterfaceName), ctx)

  return ctx.interfaces
    .map(tsInterface => {
      const props = tsInterface.properties
        .map(prop => {
          const optional = prop.optional ? '?' : ''
          return `  ${prop.name}${optional}: ${prop.type};`
        })
        .join('\n')
      return `export interface ${tsInterface.name} {\n${props}\n}`
    })
    .join('\n\n')
}

/**
 * Dispatch a JSON value to the appropriate handler and return its TypeScript type string
 * @param {any} value a parsed JSON value
 * @param {string} suggestedName suggested interface name if value is an object
 * @param {object} ctx context with interfaces array and seenShapes map
 * @returns {string} TypeScript type string
 */
function _processNode (value, suggestedName, ctx) {
  const type = _getType(value)

  switch (type) {
    case PROPERTY_TYPE.Primitive:
      return typeof value
    case PROPERTY_TYPE.NullOrUndefined:
      return 'any'
    case PROPERTY_TYPE.Array:
      return _processArray(value, suggestedName, ctx)
    case PROPERTY_TYPE.CustomObject:
      return _processObject(value, suggestedName, ctx)
    default:
      return 'any'
  }
}

/**
 * Process a plain object into a TypeScript interface
 * @param {object} obj a plain JS object
 * @param {string} interfaceName desired interface name
 * @param {object} ctx context
 * @returns {string} the resolved interface name
 */
function _processObject (obj, interfaceName, ctx) {
  const properties = []

  Object.keys(obj).sort().forEach(key => {
    const safeKey = _toSafeKey(key)
    const childName = _sanitizeInterfaceName(key)
    const valueType = _getType(obj[key])

    if (valueType === PROPERTY_TYPE.NullOrUndefined) {
      properties.push({ name: safeKey, type: 'any', optional: true })
    } else {
      const childType = _processNode(obj[key], childName, ctx)
      properties.push({ name: safeKey, type: childType, optional: false })
    }
  })

  const fingerprint = properties
    .map(p => `${p.name}:${p.type}${p.optional ? '?' : ''}`)
    .join('|')

  if (ctx.seenShapes.has(fingerprint)) {
    return ctx.seenShapes.get(fingerprint)
  }

  const resolvedName = _resolveUniqueName(interfaceName, ctx)
  ctx.interfaces.push({ name: resolvedName, properties })
  ctx.seenShapes.set(fingerprint, resolvedName)
  return resolvedName
}

/**
 * Process an array and return its TypeScript type string.
 * Iterates ALL elements to support merging and union types.
 * @param {Array} arr a JS array
 * @param {string} suggestedName suggested interface name for object elements
 * @param {object} ctx context
 * @returns {string} TypeScript type string (e.g. "number[]", "(number | string)[]", "Foo[]")
 */
function _processArray (arr, suggestedName, ctx) {
  if (arr.length === 0) {
    return 'any[]'
  }

  const elementTypes = new Set()
  const objectElements = []
  let hasNull = false

  for (let i = 0; i < arr.length; i++) {
    const elemType = _getType(arr[i])

    switch (elemType) {
      case PROPERTY_TYPE.Primitive:
        elementTypes.add(typeof arr[i])
        break
      case PROPERTY_TYPE.NullOrUndefined:
        hasNull = true
        break
      case PROPERTY_TYPE.Array:
        elementTypes.add(_processArray(arr[i], suggestedName, ctx))
        break
      case PROPERTY_TYPE.CustomObject:
        objectElements.push(arr[i])
        break
    }
  }

  if (objectElements.length > 0) {
    const mergedName = _mergeObjects(objectElements, suggestedName, ctx, hasNull)
    elementTypes.add(mergedName)
  } else if (hasNull) {
    if (elementTypes.size === 0) {
      return 'any[]'
    }
    elementTypes.add('null')
  }

  if (elementTypes.size === 0) {
    return 'any[]'
  }

  const typeList = Array.from(elementTypes).sort()

  if (typeList.length === 1) {
    return typeList[0] + '[]'
  }

  return '(' + typeList.join(' | ') + ')[]'
}

/**
 * Merge multiple object shapes into a single interface.
 * Properties not present in all objects become optional.
 * @param {Array} objects array of plain JS objects
 * @param {string} interfaceName desired interface name
 * @param {object} ctx context
 * @param {boolean} hasNull whether null elements were present alongside objects
 * @returns {string} the resolved interface name
 */
function _mergeObjects (objects, interfaceName, ctx, hasNull) {
  const allKeys = new Set()
  for (let i = 0; i < objects.length; i++) {
    Object.keys(objects[i]).forEach(key => allKeys.add(key))
  }

  const properties = []
  const sortedKeys = Array.from(allKeys).sort()

  for (let k = 0; k < sortedKeys.length; k++) {
    const key = sortedKeys[k]
    const safeKey = _toSafeKey(key)
    const childName = _sanitizeInterfaceName(key)
    const valuesForKey = []
    let presentCount = 0

    for (let i = 0; i < objects.length; i++) {
      if (key in objects[i]) {
        presentCount++
        valuesForKey.push(objects[i][key])
      }
    }

    const isOptional = hasNull || presentCount < objects.length
    const mergedType = _mergeValues(valuesForKey, childName, ctx)

    properties.push({ name: safeKey, type: mergedType, optional: isOptional })
  }

  const fingerprint = properties
    .map(p => `${p.name}:${p.type}${p.optional ? '?' : ''}`)
    .join('|')

  if (ctx.seenShapes.has(fingerprint)) {
    return ctx.seenShapes.get(fingerprint)
  }

  const resolvedName = _resolveUniqueName(interfaceName, ctx)
  ctx.interfaces.push({ name: resolvedName, properties })
  ctx.seenShapes.set(fingerprint, resolvedName)
  return resolvedName
}

/**
 * Determine the merged TypeScript type for a set of values (same key across multiple objects)
 * @param {Array} values array of JS values
 * @param {string} suggestedName suggested interface name for nested objects
 * @param {object} ctx context
 * @returns {string} TypeScript type string
 */
function _mergeValues (values, suggestedName, ctx) {
  const types = new Set()
  const objectValues = []

  for (let i = 0; i < values.length; i++) {
    const type = _getType(values[i])

    switch (type) {
      case PROPERTY_TYPE.Primitive:
        types.add(typeof values[i])
        break
      case PROPERTY_TYPE.NullOrUndefined:
        types.add('null')
        break
      case PROPERTY_TYPE.Array:
        types.add(_processArray(values[i], suggestedName, ctx))
        break
      case PROPERTY_TYPE.CustomObject:
        objectValues.push(values[i])
        break
    }
  }

  if (objectValues.length > 0) {
    const mergedName = _mergeObjects(objectValues, suggestedName, ctx, false)
    types.add(mergedName)
  }

  const typeList = Array.from(types).sort()

  if (typeList.length === 0) {
    return 'any'
  } else if (typeList.length === 1) {
    return typeList[0]
  }

  return typeList.join(' | ')
}

/**
 * Sanitize a string into a valid PascalCase TypeScript identifier for use as an interface name.
 * Handles special characters, dots, underscores, spaces, etc.
 * @param {string} text the name to sanitize
 * @returns {string} a valid PascalCase identifier
 */
function _sanitizeInterfaceName (text) {
  if (!text || !text.trim()) {
    return 'Unknown'
  }

  const parts = text.split(/[^a-zA-Z0-9]+/).filter(part => part.length > 0)

  if (parts.length === 0) {
    return 'Unknown'
  }

  const result = parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  if (/^[0-9]/.test(result)) {
    return '_' + result
  }

  return result
}

/**
 * Returns the type of the value
 * @param {any} value a JavaScript value
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
    typeof value === 'object' && !_isArray(value) && !_isNullOrUndefined(value)
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
 * Make a property key safe for TypeScript.
 * Quotes keys that contain special characters, start with digits, are empty, or are reserved words.
 * @param {string} text the property name
 * @returns {string} a safe property key
 */
function _toSafeKey (text) {
  if (text === '') {
    return "''"
  }

  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(text) && !TS_RESERVED_WORDS.has(text)) {
    return text
  }

  return "'" + text.replace(/'/g, "\\'") + "'"
}

/**
 * Resolve a unique interface name by appending numeric suffixes if needed.
 * @param {string} desiredName the desired interface name
 * @param {object} ctx context
 * @returns {string} a unique interface name
 */
function _resolveUniqueName (desiredName, ctx) {
  const existingNames = new Set(ctx.interfaces.map(i => i.name))

  if (!existingNames.has(desiredName)) {
    return desiredName
  }

  let counter = 2
  while (existingNames.has(desiredName + counter)) {
    counter++
  }

  return desiredName + counter
}

export default generate

export function generate (jsonData, rootNodeName = 'RootObject') {
  let jsonObject = JSON.parse(jsonData)

  if (Array.isArray(jsonObject) && jsonObject.length) {
    jsonObject = jsonObject[0]
  }

  const outputInterface = `interface ${rootNodeName} {\n`
    .concat(
      Object.keys(jsonObject)
        .map(key => `  ${key}: ${_mapToDataType(key, jsonObject[key])};\n`)
        .join('')
    )
    .concat(`}\n`)

  return outputInterface
}

function _mapToDataType (key, value) {
  const dataType = typeof value
  if (dataType !== 'object') return dataType
  else return key.charAt(0).toUpperCase() + key.slice(1)
}

export default generate

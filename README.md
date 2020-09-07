[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) ![CodeQL](https://github.com/michelefenu/json2interface/workflows/CodeQL/badge.svg?branch=master) ![Node.js Package](https://github.com/michelefenu/json2interface/workflows/Node.js%20Package/badge.svg)

# JSON to TypeScript Interface
A zero-dependencies package to generate TypeScript interfaces from JSON data

### Installation
`npm install json2interface`

### Usage
```
const json2interface = require('json2interface')
const interface = json2interface.generate(A_VALID_JSON)
```

### Known "bugs"
- A trailing comma will make your JSON invalid
- Different unrelated properties with the same name will be mapped to the same interface name

### Contributing
Issues and pull requests are always welcome

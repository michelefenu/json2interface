/* eslint-env jasmine */
const json2interface = require('../lib/json2interface')

const JSON_SAMPLE = JSON.stringify([
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: {
        lat: '-37.3159',
        lng: '81.1496'
      }
    },
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered client-server neural-net',
      bs: 'harness real-time e-markets'
    }
  }
])

describe('Generating interfaces', () => {
  it('should complete without errors for a valid JSON', () => {
    const result = json2interface.generate(JSON_SAMPLE)
    expect(result).toContain('export interface RootObject')
    expect(result).toContain('export interface Address')
    expect(result).toContain('export interface Company')
    expect(result).toContain('export interface Geo')
  })
})

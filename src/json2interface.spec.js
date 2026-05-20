/* eslint-env jasmine */
const json2interface = require('../lib/json2interface')

function gen (obj, rootName) {
  return json2interface.generate(JSON.stringify(obj), rootName)
}

describe('Generating interfaces', () => {
  describe('Basic functionality', () => {
    it('should generate an interface with primitive types', () => {
      const result = gen({ a: 1, b: 'hello', c: true })
      expect(result).toContain('export interface RootObject')
      expect(result).toContain('a: number;')
      expect(result).toContain('b: string;')
      expect(result).toContain('c: boolean;')
    })

    it('should generate nested object interfaces', () => {
      const result = gen({
        id: 1,
        name: 'Leanne Graham',
        address: {
          street: 'Kulas Light',
          city: 'Gwenborough',
          geo: { lat: '-37.3159', lng: '81.1496' }
        },
        company: {
          name: 'Romaguera-Crona',
          catchPhrase: 'Multi-layered client-server neural-net'
        }
      })
      expect(result).toContain('export interface RootObject')
      expect(result).toContain('export interface Address')
      expect(result).toContain('export interface Geo')
      expect(result).toContain('export interface Company')
      expect(result).toContain('address: Address;')
      expect(result).toContain('company: Company;')
    })

    it('should unwrap root array of objects', () => {
      const result = gen([{ id: 1, name: 'Alice' }])
      expect(result).toContain('export interface RootObject')
      expect(result).toContain('id: number;')
      expect(result).toContain('name: string;')
    })

    it('should accept a custom root interface name', () => {
      const result = gen({ x: 1 }, 'MyRoot')
      expect(result).toContain('export interface MyRoot')
    })
  })

  describe('Array merging', () => {
    it('should merge objects with superset of properties', () => {
      const result = gen({ items: [{ a: 1 }, { a: 2, b: 'x' }] })
      expect(result).toContain('a: number;')
      expect(result).toContain('b?: string;')
    })

    it('should mark all properties optional for completely disjoint objects', () => {
      const result = gen({ items: [{ a: 1 }, { b: 2 }] })
      expect(result).toContain('a?: number;')
      expect(result).toContain('b?: number;')
    })

    it('should merge nested object shapes across array elements', () => {
      const result = gen({
        items: [
          { addr: { city: 'NYC' } },
          { addr: { city: 'LA', zip: '90001' } }
        ]
      })
      expect(result).toContain('city: string;')
      expect(result).toContain('zip?: string;')
    })

    it('should keep all properties required when objects are identical', () => {
      const result = gen({ items: [{ a: 1 }, { a: 2 }] })
      expect(result).toContain('a: number;')
      expect(result).not.toContain('a?: number;')
    })

    it('should handle a single-element array of objects', () => {
      const result = gen({ items: [{ a: 1 }] })
      expect(result).toContain('a: number;')
      expect(result).not.toContain('?')
    })
  })

  describe('Union types', () => {
    it('should generate union type for mixed primitives', () => {
      const result = gen({ values: [1, 'hello'] })
      expect(result).toContain('values: (number | string)[];')
    })

    it('should generate sorted union type for three types', () => {
      const result = gen({ values: [1, 'hello', true] })
      expect(result).toContain('values: (boolean | number | string)[];')
    })

    it('should generate union type for primitives and objects', () => {
      const result = gen({ items: [1, { a: 1 }] })
      expect(result).toContain('(Items | number)[]')
    })

    it('should not union when all elements are same primitive', () => {
      const result = gen({ values: [1, 2, 3] })
      expect(result).toContain('values: number[];')
    })
  })

  describe('Empty arrays', () => {
    it('should type empty arrays as any[]', () => {
      const result = gen({ a: [] })
      expect(result).toContain('a: any[];')
    })

    it('should type nested empty arrays correctly', () => {
      const result = gen({ a: [[]] })
      expect(result).toContain('a: any[][];')
    })
  })

  describe('Null handling', () => {
    it('should mark null properties as optional with type any', () => {
      const result = gen({ a: null })
      expect(result).toContain('a?: any;')
    })

    it('should absorb null into object optionality in arrays', () => {
      const result = gen({ items: [null, { a: 1 }] })
      expect(result).toContain('a?: number;')
      expect(result).not.toContain('null')
    })

    it('should include null in union with primitives', () => {
      const result = gen({ values: [1, null] })
      expect(result).toContain('values: (null | number)[];')
    })

    it('should type all-null arrays as any[]', () => {
      const result = gen({ values: [null, null] })
      expect(result).toContain('values: any[];')
    })
  })

  describe('Property name safety', () => {
    it('should quote kebab-case keys', () => {
      const result = gen({ 'my-prop': 1 })
      expect(result).toContain("'my-prop': number;")
    })

    it('should quote empty string keys', () => {
      const result = gen({ '': 1 })
      expect(result).toContain("'': number;")
    })

    it('should quote numeric-leading keys', () => {
      const result = gen({ '1st': 1 })
      expect(result).toContain("'1st': number;")
    })

    it('should quote reserved word keys', () => {
      const result = gen({ class: 1 })
      expect(result).toContain("'class': number;")
    })

    it('should quote keys with special characters', () => {
      const result = gen({ 'data@type': 1 })
      expect(result).toContain("'data@type': number;")
    })

    it('should quote keys with dots', () => {
      const result = gen({ 'a.b': 1 })
      expect(result).toContain("'a.b': number;")
    })

    it('should quote keys with spaces', () => {
      const result = gen({ 'full name': 'x' })
      expect(result).toContain("'full name': string;")
    })
  })

  describe('Interface name sanitization', () => {
    it('should sanitize special characters into valid interface names', () => {
      const result = gen({ 'data@type': { a: 1 } })
      expect(result).toContain('export interface DataType')
    })

    it('should handle dots in interface names', () => {
      const result = gen({ 'geo.position': { lat: 1 } })
      expect(result).toContain('export interface GeoPosition')
    })

    it('should handle underscores in interface names', () => {
      const result = gen({ user_address: { city: 'x' } })
      expect(result).toContain('export interface User')
    })

    it('should handle numeric-leading interface names', () => {
      const result = gen({ '123data': { a: 1 } })
      expect(result).toContain('export interface _123data')
    })
  })

  describe('Interface deduplication', () => {
    it('should deduplicate identical shapes', () => {
      const result = gen({
        billing: { street: 'x', city: 'y' },
        shipping: { street: 'a', city: 'b' }
      })
      const interfaceCount = (result.match(/export interface/g) || []).length
      expect(interfaceCount).toBe(2) // RootObject + one shared shape
    })

    it('should not deduplicate different shapes', () => {
      const result = gen({
        a: { x: 1 },
        b: { y: 2 }
      })
      const interfaceCount = (result.match(/export interface/g) || []).length
      expect(interfaceCount).toBe(3) // RootObject + A + B
    })

    it('should handle name collisions without shape match', () => {
      const result = gen({
        items: [{ items: [{ a: 1 }] }]
      })
      const interfaceCount = (result.match(/export interface/g) || []).length
      expect(interfaceCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Nested arrays', () => {
    it('should handle arrays of arrays of primitives', () => {
      const result = gen({ matrix: [[1, 2], [3, 4]] })
      expect(result).toContain('matrix: number[][];')
    })

    it('should handle arrays of arrays of objects', () => {
      const result = gen({ data: [[{ a: 1 }]] })
      expect(result).toContain('Data[][]')
    })

    it('should handle deeply nested arrays', () => {
      const result = gen({ a: [[[1]]] })
      expect(result).toContain('a: number[][][];')
    })
  })

  describe('Sorted output', () => {
    it('should output properties in alphabetical order', () => {
      const result = gen({ z: 1, a: 2, m: 3 })
      const lines = result.split('\n').filter(l => l.includes(':'))
      expect(lines[0]).toContain('a:')
      expect(lines[1]).toContain('m:')
      expect(lines[2]).toContain('z:')
    })
  })

  describe('Edge cases', () => {
    it('should return empty string for root primitive array', () => {
      const result = gen([1, 2, 3])
      expect(result).toBe('')
    })

    it('should handle unicode property names', () => {
      const result = gen({ '\u540D\u524D': 'value' })
      expect(result).toContain(': string;')
    })

    it('should handle the original complex test case', () => {
      const result = gen([{
        id: 1,
        name: 'Leanne Graham',
        username: 'Bret',
        email: 'Sincere@april.biz',
        address: {
          street: 'Kulas Light',
          suite: 'Apt. 556',
          city: 'Gwenborough',
          zipcode: '92998-3874',
          geo: { lat: '-37.3159', lng: '81.1496' }
        },
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org',
        company: {
          name: 'Romaguera-Crona',
          catchPhrase: 'Multi-layered client-server neural-net',
          bs: 'harness real-time e-markets'
        }
      }])
      expect(result).toContain('export interface RootObject')
      expect(result).toContain('export interface Address')
      expect(result).toContain('export interface Company')
      expect(result).toContain('export interface Geo')
    })
  })
})

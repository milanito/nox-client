import { curryRight, get, forEach } from 'lodash'

import {  transformOptions, hashOptions, isDirectQuery } from '../../src/utils'

describe('transformOptions function tests', () => {
  it('should work with an empty object without props', () => {
    const options = transformOptions({})

    expect(options).not.toBe(null)
    expect(options).not.toHaveProperty('path')
    expect(options).toHaveProperty('url')
    expect(options).toHaveProperty('cache', true)
  })

  forEach([{
    title: 'should work with an path string without props',
    options: transformOptions({ path: 'some_url' })
  }, {
    title: 'should work with an path function without props',
    options: transformOptions({ path: () => 'some_url' })
  }, {
    title: 'should work with an path function with props',
    options: transformOptions({ path: curryRight(get)('url', 'not_some_url') },
      { url: 'some_url' })
  }], ({ title, options }) =>
    it(title, () => {
      expect(options).not.toBe(null)
      expect(options).not.toHaveProperty('path')
      expect(options).toHaveProperty('url', 'some_url')
      expect(options).toHaveProperty('cache', true)
    }))
})

describe('hashOptions function tests', () => {
  forEach([{ title: 'should work with an empty object', options: {} },
    { title: 'should work with an object', options: { toto: 'toto' } }],
    ({ title, options }) =>
      it(title, () => {
        const hash = hashOptions(options)

        expect(hash).not.toBe(null)
      }))
})

describe('isDirectQuery function tests', () => {
  it('should work with an empty object', () => {
    const answer = isDirectQuery({})

    expect(answer).not.toBeTruthy()
  })

  forEach(['get', 'GET'], method =>
    it(`should indicate true for ${method}`, () => {
      const answer = isDirectQuery({ method })

      expect(answer).toBeTruthy()
    }))

  forEach(['post', 'POST', 'put', 'PUT', 'delete', 'DELETE', 'toto'], method =>
    it(`should indicate false for ${method}`, () => {
      const answer = isDirectQuery({ method })

      expect(answer).not.toBeTruthy()
    }))
})

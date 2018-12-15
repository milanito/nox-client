import React from 'react'
import { mount } from 'enzyme'
import { forEach } from 'lodash'

import { NoxProvider } from '../../src'

describe('NoxProvider test cases', () => {
  describe('NoxProvider error cases', () => {
    forEach([{
      title: 'should require options',
      options: null
    }, {
      title: 'should not work with empty object options',
      options: {}
    }, {
      title: 'should not work with a wrong HTTP url',
      options: { baseURL: 'toto://toto.com' }
    }], ({ title, options }) =>
      it(title, () => {
        const wrapper = mount(
          <NoxProvider options={options}>
            <div className='unique' />
          </NoxProvider>
        )

        expect(wrapper.contains(<div className='unique' />)).toBeTruthy()
        expect(wrapper.props()).not.toHaveProperty('value')
        wrapper.unmount()
      }))
  })
  describe('NoxProvider success cases', () => {
    it('should render correctly', () => {
      const wrapper = mount(
        <NoxProvider options={{ baseURL: 'http://google.com' }}>
          <div className='unique' />
        </NoxProvider>
      )

      expect(wrapper).toMatchSnapshot()
      expect(wrapper.contains(<div className='unique' />)).toBeTruthy()
      expect(wrapper.props()).toHaveProperty('options')
      wrapper.unmount()
    })
  })
})

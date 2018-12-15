import React from 'react'
import { shallow } from 'enzyme'

import { withNoxClient } from '../../src'


it('should render wrapped component', () => {
  const wrapper = shallow(
    <withNoxClient>
      <div className='unique' />
    </withNoxClient>
  )

  expect(wrapper.contains(<div className='unique' />)).toBeTruthy()
})


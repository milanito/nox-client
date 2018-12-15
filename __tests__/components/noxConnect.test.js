import React from 'react'
import { shallow } from 'enzyme'

import { noxConnect } from '../../src'


it('should render wrapped component', () => {
  const wrapper = shallow(
    <noxConnect>
      <div className='unique' />
    </noxConnect>
  )

  expect(wrapper.contains(<div className='unique' />)).toBeTruthy()
})


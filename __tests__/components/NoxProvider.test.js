import React from 'react'
import { shallow } from 'enzyme'

import { NoxProvider } from '../../src'


it('should require options', () => {
  console.log(NoxProvider)
  const wrapper = shallow(
    <NoxProvider>
      <div className='unique' />
    </NoxProvider>
  )

  console.log(wrapper)
  expect(wrapper.contains(<div className='unique' />)).toBeTruthy()
})

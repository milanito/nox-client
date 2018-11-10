import React from 'react'
import { shallow } from 'enzyme'

import { NoxProvider } from '../../src'

console.log(NoxProvider)

it('should require options', () => {
  const wrapper = shallow(
    <NoxProvider>
      <div className='unique' />
    </NoxProvider>
  )

  console.log(wrapper)
  expect(wrapper.contains(<div className='unique' />)).toBeTruthy()
})

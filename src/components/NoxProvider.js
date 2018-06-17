import React, { Component, Children } from 'react'
import { validate } from 'joi'

import createClient from '../config/client'
import { providerOptionsSchema } from '../config/schemas'

export default (Provider) => {
  return class NoxProvider extends Component {
    constructor (props) {
      super(props)

      const { options } = props
      const { error, value } = validate(options, providerOptionsSchema)

      if (error) {
        this.state = { error, client: null }
      } else {
        this.state = { error: null, client: createClient(value) }
      }
    }

    render () {
      const { children } = this.props
      const { client, error } = this.state

      if (error || !client) {
        // TODO Make real logger
        console.log('Something wrong happened')
        return Children.only(children)
      }

      return (
        <Provider value={{ client }}>
          {Children.only(children)}
        </Provider>
      )
    }
  }
}

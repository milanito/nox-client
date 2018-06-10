import { validate } from 'joi'
import React, { Component, Children } from 'react'

import createClient from '../config/client'
import { providerOptionsSchema } from '../config/schemas'

export default (Provider) => {
  return class NoxProvider extends Component {
    constructor (props) {
      super(props)

      this.state = { error: null, options: null }
    }

    async componentDidMount () {
      const { options } = this.props

      try {
        const validatedOptions = await validate(options, providerOptionsSchema)

        return this.setState({ options: validatedOptions })
      } catch (error) {
        console.error(error)
        return this.setState({ error })
      }
    }

    render () {
      const { children } = this.props
      const { options, error } = this.state

      if (error || !options) {
        return Children.only(children)
      }

      return (
        <Provider value={{ client: createClient(options) }}>
          {Children.only(children)}
        </Provider>
      )
    }
  }
}

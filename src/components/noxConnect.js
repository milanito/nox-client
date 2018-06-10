import hoistStatics from 'hoist-non-react-statics'
import React, { Component, Children, cloneElement } from 'react'
import { validate } from 'joi'
import { isEqual, floor, divide, multiply, pick, isNull, merge, omit } from 'lodash'

import { connectOptionsSchema } from '../config/schemas'
import { isDirectQuery, transformOptions } from '../utils'

const OMITTED_FIELDS = ['children', 'client', 'options']

class NoxWrapperComponent extends Component {
  constructor (props) {
    super(props)

    this.state = {
      canMakeRequest: false,
      loading: true,
      data: null,
      error: null,
      percent: 0
    }
  }

  componentDidUpdate (nextProps, prevState) {
    const { client, options } = nextProps

    if (client && options && isDirectQuery(options)) {
      return { canMakeRequest: true }
    }

    if (client && options && !isDirectQuery(options)) {
      return { loading: false }
    }

    return null
  }

  shouldComponentUpdate (nextProps, nextState) {
    const { loading, data, percent } = this.state

    return !(isEqual(loading, nextState.loading) && isEqual(data, nextState.data) &&
      isEqual(percent, nextState.percent)) &&
      (isEqual(nextState.percent, 100) && !isNull(nextState.data))
  }

  async componentDidMount () {
    const { canMakeRequest } = this.state

    if (canMakeRequest) {
      await this.makeRequest()
    }
  }

  async makeRequest () {
    const { client, options } = this.props

    try {
      const validatedOptions = await validate(options, connectOptionsSchema)
      const { data } = await client.request({
        ...transformOptions(validatedOptions, this.props),
        onDownloadProgress: ({ loaded, total }) =>
          this.setState({
            percent: floor(divide(multiply(loaded, 100), total))
          })
      })

      this.setState({ loading: false, data })
    } catch (error) {
      console.error(error)
      this.setState({ loading: false, error })
    }
  }

  render () {
    const { children } = this.props
    const { canMakeRequest } = this.state
    const noxData = pick(this.state, ['loading', 'percent', 'data'])

    return cloneElement(Children.only(children),
      merge(omit(this.props, OMITTED_FIELDS), {
        noxData,
        bark: canMakeRequest
          ? () => console.log('Whouf')
          : () => console.log('making request')
      }))
  }
}

export default (Consumer) => (options) => (WrappedComponent) => {
  class NoxConnect extends Component {
    render () {
      return (
        <Consumer>
          {({ client }) => (
            <NoxWrapperComponent client={client} options={options} {...this.props}>
              <WrappedComponent />
            </NoxWrapperComponent>
          )}
        </Consumer>
      )
    }
  }

  hoistStatics(NoxConnect, WrappedComponent)

  return NoxConnect
}

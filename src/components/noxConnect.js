import hoistStatics from 'hoist-non-react-statics'
import PubSub from 'pubsub-js'
import React, { Component, Children, cloneElement } from 'react'
import { isEqual, pick, merge, omit } from 'lodash'

import { isDirectQuery, hashOptions } from '../utils'

const OMITTED_FIELDS = ['children', 'client', 'options']

class NoxWrapperComponent extends Component {
  constructor (props) {
    super(props)

    this.state = {
      canMakeRequest: false,
      loading: false,
      cached: false,
      data: null,
      error: null
    }
    this.subscriber = this.subscriber.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState) {
    const { loading, data, cached } = this.state

    return !(isEqual(loading, nextState.loading) && isEqual(data, nextState.data) &&
      isEqual(cached, nextState.cached))
  }

  componentDidMount () {
    const { options } = this.props

    // Start the pubsub engine
    this.hash = hashOptions(options)
    this.token = PubSub.subscribe(this.hash, this.subscriber)

    if (options && isDirectQuery(options)) {
      return this.makeRequest()
    }
  }

  componentWillUnmount () {
    PubSub.unsubscribe(this.token)
  }

  subscriber (msg, { type, data }) {
    console.log(type)
    switch (type) {
      case 'onStart':
        return this.setState({ loading: true })
      case 'onCacheDone':
        return this.setState({ cached: true, data })
      case 'onDownloadDone':
        return this.setState({ loading: false, data })
      case 'onError':
        const { error } = data
        return this.setState({ loading: false, error })
      default:
        return this.setState({ loading: false, error: new Error('Wrong type') })
    }
  }

  makeRequest () {
    const { client, options } = this.props
    const { hash } = this

    return client.request(options, hash, omit(this.props, ['client', 'options']))
  }

  render () {
    const { children } = this.props
    const { canMakeRequest } = this.state
    const noxData = pick(this.state, ['loading', 'data'])

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

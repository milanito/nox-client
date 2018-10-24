import hoistStatics from 'hoist-non-react-statics'
import PubSub from 'pubsub-js'
import { isEqual } from 'lodash'
import { compose, withState, withHandlers, lifecycle } from 'recompose'
import React, { Children, cloneElement } from 'react'

import { isDirectQuery, hashOptions } from '../utils'

const NoxWrapperComponent = compose(withState('canMakeRequest', 'modifyCanMakeRequest', false),
  withState('loading', 'modifyLoading', false),
  withState('cached', 'modifyCached', false),
  withState('data', 'modifyData', null),
  withState('error', 'modifyError', null),
  withState('token', 'modifyToken', null),
  withState('hash', 'modifyHash', null),
  withHandlers({
    subscriber: ({ modifyLoading, modifyData, modifyError, modifyCached }) => (msg, { type, data }) => {
      switch (type) {
        case 'onStart':
          return modifyLoading(true)
        case 'onCacheDone':
          modifyCached(true)
          return modifyData(data)
        case 'onDownloadDone':
        case 'onRequestDone':
          modifyLoading(false)
          return modifyData(data)
        case 'onError':
          const { error } = data
          modifyLoading(false)
          return modifyError(error)
        default:
          modifyLoading(false)
          return modifyError(new Error('Wrong type'))
      }
    },
    makeRequest: ({ client, options, hash, ...rest }) => () =>
      client.query(options, hash, { ...rest }),
    bark: ({ canMakeRequest, client, options, hash, ...rest }) => (opts) =>
      canMakeRequest
        ? console.log('Whouf')
        : client.request({ ...options, ...opts }, hash, { ...rest })
  }),
  lifecycle({
    shouldComponentUpdate (nextProps) {
      const { loading, data, cached } = this.props

      return !(isEqual(loading, nextProps.loading) && isEqual(data, nextProps.data) &&
        isEqual(cached, nextProps.cached))
    },
    componentDidMount () {
      const { options, makeRequest, subscriber, modifyHash, modifyToken } = this.props

      // Start the pubsub engine
      const hash = hashOptions(options)
      modifyHash(hash)
      modifyToken(PubSub.subscribe(hash, subscriber.bind(this)))

      if (options && isDirectQuery(options)) {
        return makeRequest()
      }
    },
    componentWillUnmount () {
      PubSub.unsubscribe(this.props.token)
    }
  })
)(({ children, loading, data, error, cached, bark, ...rest }) => (
  cloneElement(Children.only(children), {
    ...rest,
    noxData: { loading, data },
    bark
  }))
)

export default (Consumer) => (options) => (WrappedComponent) => {
  const NoxConnect = (props) => (
    <Consumer>
      {({ client }) => (
        <NoxWrapperComponent client={client} options={options} {...props}>
          <WrappedComponent />
        </NoxWrapperComponent>
      )}
    </Consumer>
  )

  hoistStatics(NoxConnect, WrappedComponent)

  return NoxConnect
}

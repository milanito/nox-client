import hoistStatics from 'hoist-non-react-statics'
import PubSub from 'pubsub-js'
import { isEqual, identity, get } from 'lodash'
import { compose, withState, withHandlers, lifecycle, withProps } from 'recompose'
import React, { Children, cloneElement } from 'react'

import { isDirectQuery, hashOptions } from '../utils'

const NoxWrapperComponent = compose(withState('canMakeRequest', 'modifyCanMakeRequest', false),
  withState('noxLoading', 'modifyNoxLoading', false),
  withState('noxCached', 'modifyNoxCached', false),
  withState('noxData', 'modifyNoxData', null),
  withState('noxError', 'modifyNoxError', null),
  withState('noxToken', 'modifyNoxToken', null),
  withHandlers({
    updateNoxCanMakeRequest: ({ modifyNoxCanMakeRequest }) => canMakeRequest => modifyNoxCanMakeRequest(canMakeRequest),
    updateNoxLoading: ({ modifyNoxLoading }) => loading => modifyNoxLoading(loading),
    updateNoxCached: ({ modifyNoxCached }) => cached => modifyNoxCached(cached),
    updateNoxData: ({ modifyNoxData }) => data => modifyNoxData(data),
    updateNoxError: ({ modifyNoxError }) => error => modifyNoxError(error),
    updateNoxToken: ({ modifyNoxToken }) => token => modifyNoxToken(token),
  }),
  withProps(({ options }) => ({
    hash: hashOptions(options)
  })),
  withHandlers({
    subscriber: ({ updateNoxLoading, updateNoxData, updateNoxError, updateNoxCached }) => (msg, { type, data }) => {
      switch (type) {
        case 'onStart':
          return updateNoxLoading(true)
        case 'onCacheDone':
          updateNoxCached(true)
          return updateNoxData(data)
        case 'onDownloadDone':
        case 'onRequestDone':
          updateNoxLoading(false)
          return updateNoxData(data)
        case 'onError':
          const { error } = data
          updateNoxLoading(false)
          return updateNoxError(error)
        default:
          updateNoxLoading(false)
          return updateNoxError(new Error('Wrong type'))
      }
    },
    makeRequest: ({ client, options, hash, ...rest }) => async () =>
      client.query(options, hash, { ...rest }),
    bark: ({ canMakeRequest, client, options, hash, ...rest }) => (opts) =>
      canMakeRequest
        ? console.log('Whouf')
        : client.request({ ...options, ...opts }, hash, { ...rest })
  }),
  lifecycle({
    shouldComponentUpdate (nextProps) {
      const { noxLoading, noxData, noxCached, noxError } = this.props

      return !(isEqual(noxLoading, nextProps.noxLoading) && isEqual(noxData, nextProps.noxData) &&
        isEqual(noxCached, nextProps.noxCached) && isEqual(noxError, nextProps.noxError))
    },
    componentDidMount () {
      const { options, makeRequest, subscriber, updateNoxToken, client, hash } = this.props

      // Start the pubsub engine
      updateNoxToken(PubSub.subscribe(hash, subscriber.bind(this)))

      if (options && isDirectQuery(options) && client) {
        return requestAnimationFrame(() => makeRequest())
      }
    },
    componentWillUnmount () {
      PubSub.unsubscribe(this.props.noxToken)
    }
  })
)(({ children, noxLoading, noxData, noxError, noxCached, bark, ...rest }) => (
  cloneElement(Children.only(children), {
    ...rest,
    noxData: { loading: noxLoading, data: noxData, error: noxError, cached: noxCached },
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

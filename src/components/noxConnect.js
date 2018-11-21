import hoistStatics from 'hoist-non-react-statics'
import PubSub from 'pubsub-js'
import { isEqual, omit } from 'lodash'
import { compose, withState, withHandlers, lifecycle, withProps } from 'recompose'
import React, { Children, cloneElement } from 'react'

import { OMITTED_NOX_FIELDS } from '../config/fields'
import { isDirectQuery, hashOptions, getOptions } from '../utils'

const NoxWrapperComponent = compose(withState('canMakeRequest', 'modifyCanMakeRequest', false),
  withState('noxLoading', 'modifyNoxLoading', false),
  withState('noxCached', 'modifyNoxCached', false),
  withState('noxData', 'modifyNoxData', null),
  withState('noxError', 'modifyNoxError', null),
  withState('noxToken', 'modifyNoxToken', null),
  withState('noxPollInterval', 'modifyNoxPollInterval', null),
  withHandlers({
    updateNoxCanMakeRequest: ({ modifyNoxCanMakeRequest }) => canMakeRequest => modifyNoxCanMakeRequest(canMakeRequest),
    updateNoxLoading: ({ modifyNoxLoading }) => loading => modifyNoxLoading(loading),
    updateNoxCached: ({ modifyNoxCached }) => cached => modifyNoxCached(cached),
    updateNoxData: ({ modifyNoxData }) => data => modifyNoxData(data),
    updateNoxError: ({ modifyNoxError }) => error => modifyNoxError(error),
    updateNoxToken: ({ modifyNoxToken }) => token => modifyNoxToken(token),
    updateNoxPollInterval: ({ modifyNoxPollInterval }) => interval => modifyNoxPollInterval(interval)
  }),
  withProps(({ options, ...rest }) => ({
    hash: hashOptions(getOptions(options, rest))
  })),
  withHandlers({
    subscriber: ({ updateNoxLoading, updateNoxData, updateNoxError, updateNoxCached }) => (msg, { type, data }) => {
      switch (type) {
        case 'onStart':
          updateNoxError(null)
          return updateNoxLoading(true)
        case 'onCacheDone':
          updateNoxError(null)
          updateNoxData(data)
          return updateNoxCached(true)
        case 'onDownloadDone':
        case 'onRequestDone':
          updateNoxError(null)
          updateNoxData(data)
          return updateNoxLoading(false)
        case 'onError':
          const { error } = data
          updateNoxError(error)
          return updateNoxLoading(false)
        default:
          updateNoxError(new Error('Wrong type'))
          return updateNoxLoading(false)
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
      const {
        options, makeRequest, subscriber, updateNoxToken, updateNoxPollInterval, client, hash
      } = this.props

      // Start the pubsub engine
      updateNoxToken(PubSub.subscribe(hash, subscriber.bind(this)))

      if (options && isDirectQuery(options, this.props) && client) {
        requestAnimationFrame(() => makeRequest())

        const { pollInterval } = getOptions(options, this.props)

        if (pollInterval) {
          updateNoxPollInterval(setInterval(() => makeRequest(), pollInterval))
        }
      }
    },
    componentWillUnmount () {
      PubSub.unsubscribe(this.props.noxToken)
      clearInterval(this.props.noxPollInterval)
    }
  })
)(({ children, noxLoading, noxData, noxError, noxCached, bark, ...rest }) => (
  cloneElement(Children.only(children), {
    ...omit(rest, OMITTED_NOX_FIELDS),
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

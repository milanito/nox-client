import React, { Children } from 'react'
import { validate } from 'joi'
import { compose, withState, lifecycle, branch, renderComponent } from 'recompose'

import createClient from '../config/client'
import { providerOptionsSchema } from '../config/schemas'

/**
 * This function will create a NoxProvider HOC
 * that is responsible for creating the REST client
 * and publish it through the nox context
 * @param {Object} Provider the nox context provider
 * @returns {Object} a react HOC
 */
export default (Provider) => compose(withState('error', 'modifyError', null),
  withState('client', 'null', 'modifyClient'),
  branch(({ error, client }) => error || !client, renderComponent(({ children }) => (
    Children.only(children)
  ))),
  lifecycle({
    componentDidMount () {
      const { options, modifyError, modifyClient } = this.props
      const { error, value } = validate(options, providerOptionsSchema)

      if (error) {
        modifyError(error)
      } else {
        modifyClient(createClient(value))
      }
    }
  })
)(({ client, children }) => (
  <Provider value={{ client }}>{Children.only(children)}</Provider>
))

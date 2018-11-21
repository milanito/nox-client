import hash from 'object-hash'
import { omit, isEqual, isFunction } from 'lodash'

import { OMITTED_CLIENT_FIELDS } from '../config/fields'

const transformPath = ({ path }, props) => {
  if (isFunction(path)) {
    return path(props)
  }

  return path
}

export const getOptions = (options, props) => {
  if (isFunction(options)) {
    return options(props)
  }

  return options
}

export const isDirectQuery = (options, props) => {
  const { method } = getOptions(options, props)

  return isEqual(method, 'GET') || isEqual(method, 'get')
}

export const transformOptions = (options, props) => ({
  url: transformPath(options, props),
  cache: true,
  ...omit(options, OMITTED_CLIENT_FIELDS)
})

export const hashOptions = options => hash(options)

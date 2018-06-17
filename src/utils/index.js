import hash from 'object-hash'
import { omit, isEqual, isFunction } from 'lodash'

export const isDirectQuery = ({ method }) =>
  isEqual(method, 'GET') ||
  isEqual(method, 'get')

const OMITTED_FIELDS = ['path']

const transformPath = ({ path }, props) => {
  if (isFunction(path)) {
    return path(props)
  }

  return path
}

export const transformOptions = (options, props) => ({
  url: transformPath(options, props),
  cache: true,
  ...omit(options, OMITTED_FIELDS)
})

export const hashOptions = options => hash(options)

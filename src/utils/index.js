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
  ...omit(options, OMITTED_FIELDS),
  url: transformPath(options, props)
})

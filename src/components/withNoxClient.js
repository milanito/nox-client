import React from 'react'
import hoistStatics from 'hoist-non-react-statics'

export default (Consumer) => (WrappedComponent) => {
  const WithNoxClient = () => (
    <Consumer>{({ client }) => (<WrappedComponent client={client} />)}</Consumer>
  )

  hoistStatics(WithNoxClient, WrappedComponent)

  return WithNoxClient
}

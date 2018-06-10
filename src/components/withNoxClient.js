import hoistStatics from 'hoist-non-react-statics'
import React, { Component } from 'react'

export default (Consumer) => (WrappedComponent) => {
  class WithNoxClient extends Component {
    render () {
      return (
        <Consumer>
          {({ client }) => (
            <WrappedComponent client={client} />
          )}
        </Consumer>
      )
    }
  }

  hoistStatics(WithNoxClient, WrappedComponent)

  return WithNoxClient
}

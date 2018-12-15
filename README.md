# Nox Client

[![NPM](https://nodei.co/npm/nox-client.png)](https://nodei.co/npm/nox-client/) [![CircleCI](https://circleci.com/gh/milanito/nox-client.svg?style=svg&circle-token=b8d9b4420fee14829c6e21bc1ec198fc8dfb14e8)](https://circleci.com/gh/milanito/nox-client)

## Description

Nox is a REST client for React. It is inspired from the apollo client, especially in its usage

> **Warning** : This is a very early WIP !

## Background

This package is inspired by [React Apollo](https://github.com/apollographql/react-apollo), because I found the usage quite nice in the front end, but I was using a REST API, I thought it'd be a good idea to do so ... As for the name, it's my dog's

## Installation

To install the module, simply enter the following command :

```
# Yarn
$ yarn install nox
# Npm
$ npm install nox --save
```

## Usage

### Provider

In order to use the client, you need to wrap your application inside a `NoxProvider`, here is an example :

```
import React from 'react'
import { NoxProvider } from 'nox'

import App from './App'

export default () => (
  <NoxProvider options={{
    baseURL: 'http://localhost:1337'
  }}>
    <App />
  </NoxProvider>
)
```

#### Available options

The provider accepts the following options :

- `baseURL`: Your API base URL, with the scheme
- `timeout`: Default timeout for request
- `headers`: Default headers for the request
- `cacheTimeout`: The time (in milleseconds) that the object should be keep in cache (Default 10 minutes)

### Components

To use the client, you need to wrap your component using the `noxConnect` function, just like in the following example

```
import React, { Component } from 'react'
import { map } from 'lodash'
import { noxConnect } from 'nox'

import Product from './Product'

class Display extends Component {
  render() {
    const { noxData } = this.props;

    if (noxData.loading) {
      return (
        <h1>Loading</h1>
      )
    }

    const { data } = noxData
    return (
      <div>
        <div>
          {map(data, product => (<Product {...product} key={product._id}/>))}
        </div>
      </div>
    );
  }
}

export default noxConnect({
  method: 'GET',
  path: '/products'
})(Display)
```

#### Available options

The available options are :

- `method` : The HTTP Verb to use, case unsensitive
- `path` : The path to request
- `cache` : A boolean to indicate to use cache or not (default to `true`)
- `subscribe` : Should the request subscribe to the response (default to `true`). Useful for not `GET` request
- `headers` : The request headers
- `pollInterval` : Should be pulled regularly
- `cacheTimeout` : The specfic cache timeout for the request

### Accessing the client directly

To access the REST client directly, you can wrap your component with the `withNoxClient` function, which will make the client accessible in the component's props as `noxClient`

```
import React from 'react'
import { withNoxClient } from 'nox'

class ComponentWithClient extends React.Component {
  render () {
    // Access the client in this.props.client
    return (
      <p>Client is accessible</p>
    )
  }
}

export default withNoxClient(ComponentWithClient)
```

## Who is Nox ?

[Nox de Valvygne](http://www.pedigreedatabase.com/german_shepherd_dog/dog.html?id=2774601-nox-de-valvygne) is my german shepherd dog, he is used to come to the office, so this package is a little tribute for him

![Nox in the office](public/nox_office.png?raw=true "Nox during working hours")


## See also

- [Axios](https://github.com/axios/axios)
- [React Apollo](https://github.com/apollographql/react-apollo)

## TODO

- Make tests
- ...

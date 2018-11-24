import axios from 'axios'
import PubSub from 'pubsub-js'
import { get } from 'lodash'
import { Cache } from 'memory-cache'
import { validate } from 'joi'

import { connectOptionsSchema } from './schemas'
import { transformOptions, getOptions } from '../utils'

/**
 * This class represents a nox client
 */
class NoxClient {
  constructor ({ baseURL, timeout, headers, cacheTimeout = 600000 }) {
    this.cacheTimeout = cacheTimeout
    this.cache = new Cache()
    this.client = axios.create({
      baseURL, timeout, headers
    })
  }

  async request (options, hash, props) {
    console.log('Calling request', getOptions(options, props))
    try {
      const validatedOptions = await validate(getOptions(options, props),
        connectOptionsSchema)
      const fullOptions = transformOptions(validatedOptions, props)

      PubSub.publish(hash, {
        type: 'onStart'
      })

      console.log('options', fullOptions)
      const { data } = await this.client.request(fullOptions)

      if (fullOptions.subscribe) {
        return PubSub.publish(hash, {
          type: 'onRequestDone',
          data
        })
      }

      return data
    } catch (error) {
      console.log('ERROR', error)
      PubSub.publish(hash, {
        type: 'onError',
        data: { error }
      })
    }
  }

  async query (options, hash, props) {
    try {
      const validatedOptions = await validate(getOptions(options, props),
        connectOptionsSchema)
      const fullOptions = transformOptions(validatedOptions, props)

      if (fullOptions.cache) {
        const cachedData = this.cache.get(hash)
        if (cachedData) {
          PubSub.publish(hash, {
            type: 'onCacheDone',
            data: cachedData
          })
        }
      }

      PubSub.publish(hash, {
        type: 'onStart'
      })

      const { data } = await this.client.request(fullOptions)

      PubSub.publish(hash, {
        type: 'onDownloadDone',
        data
      })

      if (fullOptions.cache) {
        this.cache.put(hash, data, get(fullOptions, 'cacheTimeout', this.cacheTimeout))
      }
    } catch (error) {
      PubSub.publish(hash, {
        type: 'onError',
        data: { error }
      })
    }
  }
}

export default options => new NoxClient(options)

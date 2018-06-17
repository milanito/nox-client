import axios from 'axios'
import PubSub from 'pubsub-js'
import { Cache } from 'memory-cache'
import { validate } from 'joi'

import { connectOptionsSchema } from './schemas'
import { transformOptions } from '../utils'

class NoxClient {
  constructor ({ baseURL, timeout, headers }) {
    this.cache = new Cache()
    this.client = axios.create({
      baseURL, timeout, headers
    })
  }

  async request (options, hash, props) {
    try {
      const validatedOptions = await validate(options, connectOptionsSchema)
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
        this.cache.put(hash, data)
      }
    } catch (error) {
      console.error(error)
      PubSub.publish(hash, {
        type: 'onError',
        data: { error }
      })
    }
  }
}

export default (options) => new NoxClient(options)

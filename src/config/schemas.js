import Joi from 'joi'
import { map, toLower, first } from 'lodash'

export const HTTP_VERBS = ['GET', 'POST', 'PUT', 'PATCH']

export const providerOptionsSchema = Joi.object().keys({
  baseURL: Joi.string().uri({
    scheme: ['http', 'https']
  }).required()
})

export const connectOptionsSchema = Joi.object().keys({
  method: Joi.string().valid([
    ...HTTP_VERBS,
    ...map(HTTP_VERBS, toLower)
  ]).default(first(HTTP_VERBS)),
  path: Joi.alternatives().try(Joi.string().uri({
    allowRelative: true,
    relativeOnly: true
  }), Joi.func()).required()
})

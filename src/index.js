import { createContext } from 'react'

import createNoxProvider from './components/NoxProvider'
import createNoxConnect from './components/noxConnect'
import createWithNoxClient from './components/withNoxClient'

const { Provider, Consumer } = createContext('nox')

export const NoxProvider = createNoxProvider(Provider)
export const noxConnect = createNoxConnect(Consumer)
export const withNoxClient = createWithNoxClient(Consumer)

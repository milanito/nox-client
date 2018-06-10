import axios from 'axios'

export default ({ baseURL, timeout, headers }) =>
  axios.create({
    baseURL, timeout, headers
  })

import axios from 'axios'
import cookie from '../utils/cookie'
import { apiBaseUrl } from '../config'

export async function registerUser({ email, name, password }) {
    await axios.post(`${apiBaseUrl}/users`, { email, name, password })
    cookie.set('token', res.data.token, { path: '/' })
}

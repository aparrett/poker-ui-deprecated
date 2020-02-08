import axios from 'axios'
import cookie from '../utils/cookie'
import config from '../config'

export async function registerUser({ username, name, password }) {
    const res = await axios({
        url: '/users',
        baseURL: config.apiBaseUrl,
        method: 'POST',
        data: {
            username,
            name,
            password
        }
    })
    cookie.set('token', res.data.token, { path: '/' })
}

import axios from 'axios'
import cookie from '../utils/cookie'
import config from '../config'

export async function registerUser(name, username, password) {
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
    return res.data.user
}

export async function getUser() {
    const token = cookie.get('token')
    if (!token) {
        return
    }

    try {
        const res = await axios({
            url: '/me',
            baseURL: config.apiBaseUrl,
            method: 'GET',
            headers: { 'x-auth-token': cookie.get('token') }
        })

        return res.data.user
    } catch (e) {
        cookie.remove('token', { path: '/' })
    }
}

export async function loginUser(username, password) {
    const res = await axios({
        url: '/login',
        method: 'POST',
        baseURL: config.apiBaseUrl,
        data: { username, password }
    })
    cookie.set('token', res.data.token, { path: '/' })
    return res.data.user
}

export function logoutUser() {
    cookie.remove('token', { path: '/' })
}

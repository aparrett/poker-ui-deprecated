import axios from 'axios'
import cookie from '../utils/cookie'
import config from '../config'

export async function createGame() {
    const res = await axios({
        url: '/games',
        baseURL: config.apiBaseUrl,
        method: 'POST',
        headers: { 'x-auth-token': cookie.get('token') }
    })
    return res.data
}

export async function getGame(id) {
    const res = await axios({
        url: `/games/${id}`,
        baseURL: config.apiBaseUrl,
        method: 'GET',
        headers: { 'x-auth-token': cookie.get('token') }
    })
    return res.data
}

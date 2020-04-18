import axios from 'axios'
import cookie from '../utils/cookie'
import config from '../config'

export async function createGame(game) {
    const res = await axios({
        url: '/games',
        baseURL: config.apiBaseUrl,
        method: 'POST',
        headers: { 'x-auth-token': cookie.get('token') },
        data: game
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

export async function getGames() {
    const res = await axios({
        url: `/games`,
        baseURL: config.apiBaseUrl,
        method: 'GET',
        headers: { 'x-auth-token': cookie.get('token') }
    })
    return res.data
}

export async function joinTable(id, socketId, buyIn) {
    const res = await axios({
        url: `/games/${id}/players`,
        baseURL: config.apiBaseUrl,
        method: 'POST',
        headers: { 'x-auth-token': cookie.get('token') },
        data: {
            socketId,
            buyIn
        }
    })
    return res.data
}

export async function leaveTable(id) {
    const res = await axios({
        url: `/games/${id}/players`,
        baseURL: config.apiBaseUrl,
        method: 'DELETE',
        headers: { 'x-auth-token': cookie.get('token') }
    })
    return res.data
}

export async function call(gameId) {
    const res = await axios({
        url: `/games/${gameId}/call`,
        baseURL: config.apiBaseUrl,
        method: 'POST',
        headers: { 'x-auth-token': cookie.get('token') }
    })
    return res.data
}

export async function check(gameId) {
    const res = await axios({
        url: `/games/${gameId}/check`,
        baseURL: config.apiBaseUrl,
        method: 'POST',
        headers: { 'x-auth-token': cookie.get('token') }
    })
    return res.data
}

export async function fold(gameId) {
    const res = await axios({
        url: `/games/${gameId}/fold`,
        baseURL: config.apiBaseUrl,
        method: 'POST',
        headers: { 'x-auth-token': cookie.get('token') }
    })
    return res.data
}

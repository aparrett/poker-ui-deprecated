const local = {
    apiBaseUrl: 'http://localhost:8081'
}

const prod = {
    apiBaseUrl: 'https://poker-friends-api.herokuapp.com/'
}

const config = process.env.NODE_ENV === 'production' ? prod : local

export default config

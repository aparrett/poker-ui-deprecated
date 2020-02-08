const local = {
    apiBaseUrl: 'http://localhost:8081'
}

const prod = {
    apiBaseUrl: 'https://poker-friends-api.herokuapp.com/'
}

export default process.env.NODE_ENV === 'production' ? prod : local
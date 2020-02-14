<template>
    <v-content>
        <v-container>
            <div v-if="this.game">
                <v-row>Game: {{ game.name || game._id }}</v-row>
                <v-row
                    >Player Count:
                    {{
                        `${game.players.length} /
                    ${game.maxPlayers} `
                    }}</v-row
                >

                <v-row style="text-decoration: underline; margin-top:200px;"
                    >Table</v-row
                >

                <v-row v-for="player in game.players" :key="player.id">
                    {{ player.name }}
                </v-row>

                <v-btn
                    v-if="!isSeated && user"
                    rounded
                    color="primary"
                    @click="handleSitClick"
                    >Sit</v-btn
                >
            </div>
            <div v-else>Loading Game...</div>
            <v-snackbar v-model="showSnackbar" :timeout="10000">
                {{ errorText }}
                <v-btn color="primary" text @click="showSnackbar = false"
                    >Close</v-btn
                >
            </v-snackbar>
        </v-container>
    </v-content>
</template>

<script>
import { getGame, joinTable } from '../actions/games'
import io from 'socket.io-client'
import config from '../config'

export default {
    name: 'Game',
    data() {
        return {
            game: undefined,
            errorText: '',
            showSnackbar: false
        }
    },
    props: {
        user: Object
    },
    async beforeCreate() {
        const socket = io(config.apiBaseUrl)

        try {
            this.game = await getGame(this.$route.params.id)
            socket.emit('join', this.$route.params.id)
            socket.on('gameUpdate', game => {
                this.game = game
            })
        } catch (e) {
            if (e.response.status === 404) {
                this.errorText = 'Unable to find the specified game.'
            } else {
                this.errorText = 'Something went wrong, please try again later.'
            }

            this.showSnackbar = true
        }
    },
    methods: {
        async handleSitClick() {
            try {
                await joinTable(this.game._id)
            } catch (e) {
                const { status, data } = e.response
                if (status === 401) {
                    this.errorText =
                        'You must be logged in to sit at the table.'
                } else if (status === 404) {
                    this.errorText = 'Unable to find the specified game.'
                } else if (status === 400) {
                    this.errorText = data
                } else {
                    this.errorText =
                        'Something went wrong, please try again later.'
                }

                this.showSnackbar = true
            }
        }
    },
    computed: {
        isSeated() {
            return (
                this.game &&
                this.user &&
                this.game.players.some(player => player._id === this.user._id)
            )
        }
    }
}
</script>

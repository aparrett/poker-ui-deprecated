<template>
    <v-content>
        <v-container>
            <v-row v-for="game in games" :key="game._id">
                <v-card class="mx-auto" max-width="344">
                    <v-card-text>
                        <div>Game Id: {{ game._id }}</div>
                        <ul v-for="player in game.players" :key="player._id">
                            <li>{{ player.name }}</li>
                        </ul>
                    </v-card-text>
                </v-card>
            </v-row>
            <v-row class="d-flex justify-center">
                <v-btn rounded color="primary" @click="handleCreateClick"
                    >Create Game</v-btn
                >

                <v-snackbar v-model="showSnackbar" :timeout="5000">
                    {{ errorText }}
                    <v-btn color="primary" text @click="showSnackbar = false">
                        Close
                    </v-btn>
                </v-snackbar>
            </v-row>
        </v-container>
    </v-content>
</template>

<script>
import { createGame, getGames } from '../actions/games'

export default {
    name: 'Dashboard',
    data() {
        return {
            showSnackbar: false,
            errorText: '',
            games: []
        }
    },
    methods: {
        async handleCreateClick() {
            try {
                const game = await createGame()
                this.$router.push({
                    name: 'games',
                    params: { id: game._id }
                })
            } catch (e) {
                this.showSnackbar = true

                if (e.response.status === 401) {
                    this.errorText = 'You must login before creating a game.'
                } else {
                    this.errorText =
                        'We were unable to create the game. Please try again later.'
                }
            }
        }
    },
    async beforeCreate() {
        try {
            this.games = await getGames()
        } catch (e) {
            this.showSnackbar = true
            this.errorText = 'Something went wrong, please try again later.'
        }
    }
}
</script>

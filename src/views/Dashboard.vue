<template>
    <v-content>
        <v-container>
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
import { createGame } from '../actions/games'
export default {
    name: 'Dashboard',
    data() {
        return {
            showSnackbar: false,
            errorText: ''
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
    }
}
</script>

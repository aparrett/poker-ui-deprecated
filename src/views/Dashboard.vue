<template>
    <v-content>
        <v-container>
            <v-row v-for="game in games" :key="game._id">
                <v-card class="mx-auto" max-width="344">
                    <v-card-text>
                        <div>{{ game.name || game._id }}</div>
                        <v-row
                            >Player Count:
                            {{
                                `${game.players.length} / ${game.maxPlayers} `
                            }}</v-row
                        >
                        <v-btn
                            rounded
                            color="primary"
                            :to="`/games/${game._id}`"
                            >View</v-btn
                        >
                    </v-card-text>
                </v-card>
            </v-row>
            <v-row class="d-flex justify-center">
                <v-btn
                    rounded
                    color="primary"
                    @click="showGameSettingsDialog = true"
                    >Create Game</v-btn
                >
                <GameSettingsDialog
                    :showDialog="showGameSettingsDialog"
                    :closeDialog="closeDialog"
                />
                <v-snackbar v-model="showSnackbar" :timeout="5000">
                    {{ errorText }}
                    <v-btn color="primary" text @click="showSnackbar = false"
                        >Close</v-btn
                    >
                </v-snackbar>
            </v-row>
        </v-container>
    </v-content>
</template>

<script>
import { getGames } from '../actions/games'
import GameSettingsDialog from '../components/GameSettingsDialog'

export default {
    name: 'Dashboard',
    components: {
        GameSettingsDialog
    },
    data() {
        return {
            showSnackbar: false,
            errorText: '',
            games: [],
            showGameSettingsDialog: false
        }
    },
    async beforeCreate() {
        try {
            this.games = await getGames()
        } catch (e) {
            this.showSnackbar = true
            this.errorText = 'Something went wrong, please try again later.'
        }
    },
    methods: {
        closeDialog() {
            this.showGameSettingsDialog = false
        }
    }
}
</script>

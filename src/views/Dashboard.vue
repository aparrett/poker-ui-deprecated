<template>
    <v-content>
        <v-container>
            <v-row class="d-flex justify-center mb-6 mt-2">
                <v-btn @click="showGameSettingsDialog = true">Create Game</v-btn>
            </v-row>
            <v-row v-for="game in games" :key="game._id" class="mb-3">
                <v-card class="mx-auto" width="600" dark>
                    <v-row>
                        <v-col cols="10" style="padding-top: 0; padding-bottom: 0;">
                            <v-card-title v-text="game.name || game._id" style="word-break: break-word;">
                            </v-card-title>
                            <v-card-subtitle
                                v-text="
                                    `Player Count:
                            ${game.players.length} / ${game.maxPlayers}`
                                "
                            >
                            </v-card-subtitle>
                        </v-col>
                        <v-col cols="2" style="align-items: center; display: flex; padding-top: 0; padding-bottom: 0;">
                            <v-btn light :to="`/games/${game._id}`" class="ml-n1">View</v-btn>
                        </v-col>
                    </v-row>
                </v-card>
            </v-row>
            <GameSettingsDialog :showDialog="showGameSettingsDialog" :closeDialog="closeDialog" />
            <v-snackbar v-model="showSnackbar" :timeout="5000">
                {{ errorText }}
                <v-btn light small @click="showSnackbar = false">Close</v-btn>
            </v-snackbar>
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

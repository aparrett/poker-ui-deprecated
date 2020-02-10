<template>
    <v-content>
        <v-container>
            <div v-if="this.game">
                <v-row>Playing Game: {{ game._id }}</v-row>
                <v-row>Players:</v-row>
                <v-row v-for="player in game.players" :key="player.id">
                    {{ player.name }}
                </v-row>
            </div>
            <div v-else-if="errorText.length > 0">
                {{ errorText }}
            </div>
            <div v-else>Loading Game...</div>
        </v-container>
    </v-content>
</template>

<script>
import { getGame } from '../actions/games'

export default {
    name: 'Game',
    data() {
        return {
            game: undefined,
            errorText: ''
        }
    },
    async beforeCreate() {
        try {
            this.game = await getGame(this.$route.params.id)
        } catch (e) {
            if (e.response.status === 404) {
                this.errorText = 'Unable to find the specified game.'
            } else {
                this.errorText = 'Something went wrong, please try again later.'
            }
        }
    }
}
</script>

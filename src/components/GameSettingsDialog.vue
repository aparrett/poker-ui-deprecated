<template>
    <div>
        <v-dialog v-model="showDialog" persistent max-width="290">
            <v-card class="elevation-12">
                <v-toolbar color="primary" dark flat>
                    <v-toolbar-title>Create Game</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-form v-model="valid" ref="form">
                        <v-text-field
                            label="Name"
                            name="name"
                            v-model="name"
                            type="text"
                            :rules="nameRules"
                        />
                        <v-text-field
                            id="maxPlayers"
                            label="Max Player Count"
                            name="maxPlayers"
                            v-model="maxPlayers"
                            :rules="maxPlayersRules"
                        />
                    </v-form>
                    <div class="error--text">{{ errorText }}</div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="closeDialog">Cancel</v-btn>
                    <v-btn text color="primary" @click="submit">Create</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { createGame } from '../actions/games'

export default {
    data() {
        return {
            valid: false,
            name: '',
            nameRules: [
                v =>
                    (v && v.length >= 5 && v.length <= 25) ||
                    'Name must be at least 5 characters and no more than 25 characters'
            ],
            maxPlayers: 12,
            maxPlayersRules: [
                v => !!v || 'Max Player Count is required',
                v =>
                    (v && parseInt(v) <= 12) ||
                    'The max player count cannot be more than 12.',
                v =>
                    (v && parseInt(v) > 0) ||
                    'The max player count must be greater than 0.',
                v =>
                    Number.isInteger(parseInt(v)) ||
                    'The Max Player Count must be an integer.'
            ],
            errorText: ''
        }
    },
    props: {
        showDialog: Boolean,
        closeDialog: Function
    },
    methods: {
        async submit() {
            if (this.$refs.form.validate()) {
                try {
                    const game = await createGame(this.name, this.maxPlayers)
                    this.$router.push({
                        name: 'games',
                        params: { id: game._id }
                    })
                } catch (e) {
                    this.showSnackbar = true

                    const { data, status } = e.response

                    if (status === 401) {
                        this.errorText =
                            'You must login before creating a game.'
                    } else if (status === 400) {
                        this.errorText = data
                    } else {
                        this.errorText =
                            'We were unable to create the game. Please try again later.'
                    }
                }
            }
        }
    }
}
</script>

<template>
    <div>
        <v-dialog v-model="showDialog" persistent max-width="290">
            <v-card class="elevation-12">
                <v-toolbar color="primary" dark flat>
                    <v-toolbar-title>Join Game</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-form v-model="valid" ref="form">
                        <div>Max Buy-in: {{ maxBuyIn }}</div>
                        <div>Current Big Blind: {{ bigBlind }}</div>
                        <v-text-field
                            label="Buy-in"
                            buyIn="buyIn"
                            v-model="buyIn"
                            type="text"
                            :rules="buyInRules"
                            class="mt-3"
                        />
                    </v-form>
                    <div class="error--text">{{ errorText }}</div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="closeDialog">Cancel</v-btn>
                    <v-btn text color="primary" @click="onSubmit">Join</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: 'JoinGameDialog',
    data() {
        return {
            valid: false,
            buyIn: this.maxBuyIn,
            buyInRules: [
                v => !!v || 'Buy-in is required',
                v => (v && parseInt(v) > 0) || 'The buy-in amount must be greater than 0.',
                v => Number.isInteger(parseInt(v)) || 'The buy-in amount must be an integer.',
                v => (v && parseInt(v) <= this.maxBuyIn) || 'The buy-in amount cannot be more than the max buy-in.',
                v => (v && parseInt(v) > this.bigBlind) || 'The buy-in amount must greater than the big blind.'
            ],
            errorText: ''
        }
    },
    props: {
        handleSubmit: Function,
        showDialog: Boolean,
        closeDialog: Function,
        maxBuyIn: Number,
        bigBlind: Number
    },
    methods: {
        async onSubmit() {
            if (this.$refs.form.validate()) {
                await this.handleSubmit(this.buyIn)
            }
        }
    }
}
</script>

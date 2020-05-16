<template>
    <div>
        <v-dialog dark v-model="showDialog" persistent max-width="290">
            <v-card class="elevation-0">
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-form v-model="valid" ref="form">
                                    <v-btn small light @click="handleAllInClick">All-In</v-btn>
                                    <div class="mb-3">Amount to Call: {{ amountToCall }}</div>
                                    <v-text-field
                                        label="Raise"
                                        v-model.number="raiseAmount"
                                        type="number"
                                        :rules="raiseRules"
                                        class="mt-3"
                                        @keypress.enter="onSubmit"
                                    />
                                    <div>Your chips {{ chips }}</div>
                                    <div>Total bet: {{ total }}</div>
                                </v-form>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn light @click="closeDialog">Cancel</v-btn>
                    <v-btn light @click="onSubmit">{{ raiseAmount === amountToAllIn ? 'Go All-In' : 'Raise' }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: 'RaiseDialog',
    data() {
        return {
            valid: false,
            raiseAmount: 10,
            raiseRules: [
                v => !!v || 'Raise is required',
                v => (v && parseInt(v) > 0) || 'The raise amount must be greater than 0.',
                v => Number.isInteger(parseInt(v)) || 'The raise amount must be an integer.',
                v => (v && parseInt(v) <= this.chips) || 'The raise amount cannot be more than than your chip total.',
                v => (v && parseInt(v) <= this.amountToAllIn) || 'Cannot raise more chips than you have.'
            ]
        }
    },
    props: {
        handleSubmit: Function,
        showDialog: Boolean,
        closeDialog: Function,
        chips: Number,
        largestBet: Number,
        playerBet: [Boolean, Number]
    },
    methods: {
        async onSubmit() {
            if (this.$refs.form.validate()) {
                await this.handleSubmit(this.raiseAmount)
            }
        },
        handleAllInClick() {
            this.raiseAmount = this.amountToAllIn
        }
    },
    computed: {
        amountToCall() {
            return this.playerBet ? this.largestBet - this.playerBet : this.largestBet
        },
        total() {
            return this.amountToCall + this.raiseAmount
        },
        amountToAllIn() {
            return this.chips - this.amountToCall
        }
    }
}
</script>

<template>
    <div>
        <v-dialog dark v-model="showDialog" persistent max-width="290">
            <v-card class="elevation-0">
                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" sm="6" md="4">
                                <v-form v-model="valid" ref="form">
                                    <v-text-field
                                        label="Amount"
                                        v-model.number="raiseAmount"
                                        type="number"
                                        :rules="raiseRules"
                                        class="mt-3"
                                        @keypress.enter="onSubmit"
                                    />
                                </v-form>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn light @click="closeDialog">Cancel</v-btn>
                    <v-btn light @click="onSubmit">Raise</v-btn>
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
                v => (v && parseInt(v) <= this.chips) || 'The raise amount cannot be more than than your chip total.'
            ]
        }
    },
    props: {
        handleSubmit: Function,
        showDialog: Boolean,
        closeDialog: Function,
        chips: Number
    },
    methods: {
        async onSubmit() {
            if (this.$refs.form.validate()) {
                await this.handleSubmit(this.raiseAmount)
            }
        }
    }
}
</script>

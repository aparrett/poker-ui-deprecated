<template>
    <div>
        <v-btn color="white" @click.stop="showDialog = true" text>
            Register
        </v-btn>
        <v-dialog v-model="showDialog" persistent max-width="290">
            <v-card class="elevation-12">
                <v-toolbar color="primary" dark flat>
                    <v-toolbar-title>Register</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-form v-model="valid" ref="form">
                        <v-text-field
                            label="Name"
                            name="name"
                            prepend-icon="person"
                            type="text"
                            v-model="name"
                            :rules="nameRules"
                        ></v-text-field>
                        <v-text-field
                            label="Username"
                            name="username"
                            prepend-icon="person"
                            type="text"
                            v-model="username"
                            :rules="usernameRules"
                        ></v-text-field>

                        <v-text-field
                            id="password"
                            label="Password"
                            name="password"
                            prepend-icon="lock"
                            type="password"
                            v-model="password"
                            :rules="passwordRules"
                        ></v-text-field>
                    </v-form>
                    <div class="error--text">{{ errorText }}</div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showDialog = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="submit">Register</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { registerUser } from '../actions/auth'

export default {
    data: () => ({
        showDialog: false,
        valid: false,
        name: '',
        nameRules: [v => !!v || 'Name is required'],
        username: '',
        usernameRules: [
            v => !!v || 'Username is required',
            v =>
                (v && v.length >= 5 && v.length <= 25) ||
                'Name must be at least 5 characters and no more than 25 characters'
        ],
        password: '',
        passwordRules: [
            v => !!v || 'Password is required',
            v =>
                (v && v.length >= 8 && v.length <= 25) ||
                'Password must be at least 8 characters and no more than 25 characters'
        ],
        errorText: ''
    }),
    props: {
        setUser: Function
    },
    methods: {
        async submit() {
            if (this.$refs.form.validate()) {
                try {
                    const user = await registerUser(this.name, this.username, this.password)
                    this.errorText = ''
                    this.showDialog = false
                    this.setUser(user)
                } catch (e) {
                    const { data, status } = e.response
                    if (status === 400) {
                        this.errorText = data
                    } else {
                        this.errorText = 'There was a problem registering your account. Please try again later.'
                    }
                }
            }
        }
    }
}
</script>

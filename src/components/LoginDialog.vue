<template>
    <div>
        <v-btn class="mr-2 mt-2" @click.stop="showDialog = true" small>
            Login
        </v-btn>
        <v-dialog v-model="showDialog" dark persistent max-width="290">
            <v-card class="elevation-0">
                <v-card-text>
                    <v-form v-model="valid" ref="form">
                        <h1 class="mb-4">Login</h1>
                        <v-text-field
                            label="Username"
                            name="username"
                            v-model="username"
                            prepend-icon="person"
                            type="text"
                            :rules="usernameRules"
                        />

                        <v-text-field
                            id="password"
                            label="Password"
                            name="password"
                            v-model="password"
                            prepend-icon="lock"
                            type="password"
                            :rules="passwordRules"
                        />
                    </v-form>
                    <div class="error--text">{{ errorText }}</div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn light @click="showDialog = false">Cancel</v-btn>
                    <v-btn light @click="submit">Login</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { loginUser } from '../actions/auth'

export default {
    data: () => ({
        valid: false,
        showDialog: false,
        username: '',
        usernameRules: [v => !!v || 'Username is required'],
        password: '',
        passwordRules: [v => !!v || 'Password is required'],
        errorText: ''
    }),
    props: {
        setUser: Function
    },
    methods: {
        async submit() {
            if (this.$refs.form.validate()) {
                try {
                    const user = await loginUser(this.username, this.password)
                    this.errorText = ''
                    this.showDialog = false
                    this.setUser(user)
                } catch (e) {
                    if (e.response.status === 400) {
                        this.errorText = 'Invalid Username or Password'
                    } else {
                        this.errorText = 'Something went wrong. Please try again later.'
                    }
                }
            }
        }
    }
}
</script>

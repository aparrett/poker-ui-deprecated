<template>
    <div>
        <v-btn class="mr-2" color="white" @click.stop="showDialog = true" text>
            Login
        </v-btn>
        <v-dialog v-model="showDialog" persistent max-width="290">
            <v-card class="elevation-12">
                <v-toolbar color="primary" dark flat>
                    <v-toolbar-title>Login form</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-form v-model="valid" ref="form">
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
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showDialog = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="submit">Login</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    data: () => ({
        valid: false,
        showDialog: false,
        username: '',
        usernameRules: [v => !!v || 'Username is required'],
        password: '',
        passwordRules: [v => !!v || 'Password is required']
    }),
    methods: {
        submit() {
            if (this.$refs.form.validate()) {
                console.log('submitting')
            }
        }
    }
}
</script>

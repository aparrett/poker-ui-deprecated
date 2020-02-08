<template>
    <v-app>
        <v-app-bar app color="primary" dark>
            <div class="d-flex align-center">
                <v-img
                    alt="Vuetify Logo"
                    class="shrink mr-2"
                    contain
                    src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
                    transition="scale-transition"
                    width="40"
                />
            </div>
            <v-spacer></v-spacer>
            <v-content>
                <v-row justify="center">
                    <v-dialog v-model="loginDialog" max-width="290">
                        <v-card class="elevation-12">
                            <v-toolbar color="primary" dark flat>
                                <v-toolbar-title>Login form</v-toolbar-title>
                            </v-toolbar>
                            <v-card-text>
                                <v-form>
                                    <v-text-field
                                        label="Username"
                                        name="username"
                                        prepend-icon="person"
                                        type="text"
                                    ></v-text-field>

                                    <v-text-field
                                        id="password"
                                        label="Password"
                                        name="password"
                                        prepend-icon="lock"
                                        type="password"
                                    ></v-text-field>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text @click.stop="loginDialog = false"
                                    >Cancel</v-btn
                                >
                                <v-btn text color="primary">Login</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-row>
            </v-content>

            <v-content>
                <v-row justify="center">
                    <v-dialog v-model="registerDialog" max-width="290">
                        <v-card class="elevation-12">
                            <v-toolbar color="primary" dark flat>
                                <v-toolbar-title
                                    >Registration form</v-toolbar-title
                                >
                            </v-toolbar>
                            <v-card-text>
                                <v-form>
                                    <v-text-field
                                        label="Username"
                                        name="username"
                                        prepend-icon="person"
                                        type="text"
                                    ></v-text-field>

                                    <v-text-field
                                        id="password"
                                        label="Password"
                                        name="password"
                                        prepend-icon="lock"
                                        type="password"
                                    ></v-text-field>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text @click.stop="registerDialog = false"
                                    >Cancel</v-btn
                                >
                                <v-btn text color="primary">Register</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-row>
            </v-content>

            <v-btn
                class="mr-2"
                color="white"
                @click.stop="loginDialog = true"
                text
            >
                Login
            </v-btn>
            <v-btn color="white" @click.stop="registerDialog = true" text>
                Register
            </v-btn>
        </v-app-bar>

        <v-content>
            <router-link to="/">Home</router-link>
            <HelloWorld />
        </v-content>
    </v-app>
</template>

<script>
import HelloWorld from './components/HelloWorld'

export default {
    name: 'App',

    components: {
        HelloWorld
    },

    data: () => ({
        loginDialog: false,
        registerDialog: false
    })
}
</script>

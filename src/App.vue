<template>
    <v-app id="app">
        <!-- Elements in this component will be displayed on every page -->
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
            <div v-if="!user">
                <LoginDialog :setUser="setUser" />
                <RegisterDialog :setUser="setUser" />
            </div>
            <div v-else>
                Logged in as {{ user.name }}
                <v-btn class="mr-2" color="white" @click="logout" text>
                    Logout
                </v-btn>
            </div>
        </v-app-bar>

        <router-view />
    </v-app>
</template>

<script>
import LoginDialog from './components/LoginDialog'
import RegisterDialog from './components/RegisterDialog'
import { getUser, logoutUser } from './actions/auth'

export default {
    name: 'App',

    components: {
        LoginDialog,
        RegisterDialog
    },

    data: () => ({
        user: undefined
    }),

    methods: {
        setUser(user) {
            this.user = user
        },
        logout() {
            logoutUser()
            this.user = undefined
        }
    },

    async created() {
        this.user = await getUser()
    }
}
</script>

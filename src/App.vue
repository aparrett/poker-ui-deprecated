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
                <router-link :to="{ path: '/' }" class="custom-link ml-3"
                    >Dashboard</router-link
                >
            </div>
            <v-spacer></v-spacer>
            <div class="d-flex" v-if="!user">
                <LoginDialog :setUser="setUser" />
                <RegisterDialog :setUser="setUser" />
            </div>
            <div class="d-flex align-center" v-else>
                <div>Logged in as {{ user.name }}</div>
                <v-btn class="ml-2" color="white" @click="logout" text>
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

<style>
.v-application a.custom-link {
    color: #fff;
    text-decoration: none;
}
</style>

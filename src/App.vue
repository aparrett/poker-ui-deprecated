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
            <LoginDialog />
            <RegisterDialog />
        </v-app-bar>

        <router-view />
    </v-app>
</template>

<script>
import LoginDialog from './components/LoginDialog'
import RegisterDialog from './components/RegisterDialog'

export default {
    name: 'App',

    components: {
        LoginDialog,
        RegisterDialog
    },

    data: () => ({}),

    methods: {}
}
</script>

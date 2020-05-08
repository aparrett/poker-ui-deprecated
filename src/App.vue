<template>
    <v-app id="app">
        <!-- Elements in this component will be displayed on every page -->
        <div class="d-flex justify-end pt-2">
            <div class="d-flex" v-if="!user">
                <LoginDialog :setUser="setUser" />
                <RegisterDialog :setUser="setUser" />
            </div>
            <div class="d-flex mr-4 mt-2" v-else>
                <v-btn small @click="logout" text>
                    Logout
                </v-btn>
            </div>
        </div>

        <router-view :user="user" />
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

.v-dialog .v-form {
    margin-top: 18px;
}

.v-btn:not(.v-btn--disabled) {
    background-image: linear-gradient(
        to top,
        rgb(195, 195, 195),
        rgb(210, 210, 210),
        rgb(225, 225, 225),
        rgb(240, 240, 240),
        rgb(255, 255, 255)
    );
}

.v-btn.v-btn--disabled {
    background-image: linear-gradient(
        to top,
        rgb(195, 195, 195, 0.6),
        rgb(210, 210, 210, 0.6),
        rgb(225, 225, 225, 0.6),
        rgb(240, 240, 240, 0.6),
        rgb(255, 255, 255, 0.6)
    );
}

.theme--dark.v-card {
    background-color: #00862a8f;
}
</style>

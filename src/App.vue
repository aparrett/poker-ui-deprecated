<template>
    <v-app id="app">
        <!-- Elements in this component will be displayed on every page -->
        <div class="d-flex justify-end pt-2">
            <div class="d-flex" v-if="!user">
                <LoginDialog :setUser="setUser" />
                <RegisterDialog :setUser="setUser" />
            </div>
            <div class="d-flex mr-4 mt-2" v-else>
                <v-btn class="mr-3" small text>{{ user.name }}</v-btn>
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

<style lang="scss">
.v-application a.custom-link {
    color: #fff;
    text-decoration: none;
}

body {
    background-image: url('/images/backgrounds/random_grey_variations.png');
    background-repeat: repeat;
}

#app {
    background: none;
}

.v-dialog {
    background-image: linear-gradient(
        to top,
        rgb(65, 65, 65),
        rgb(62, 62, 62),
        rgb(60, 60, 60),
        rgb(62, 62, 62),
        rgb(65, 65, 65)
    );
    padding: 24px;

    .v-card__text,
    .v-card__actions {
        padding: 0 !important;
    }

    .v-card {
        background: none !important;
    }
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
    background-color: #0000008f;
}

.v-dialog .theme--dark.v-card > .v-card__text,
.v-dialog .theme--dark.v-card .v-card__subtitle {
    color: rgb(238, 238, 238);
}
</style>

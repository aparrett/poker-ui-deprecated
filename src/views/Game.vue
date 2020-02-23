<template>
    <v-content>
        <v-container>
            <div v-if="this.game">
                <v-row>Game: {{ game.name || game._id }}</v-row>
                <v-row
                    >Player Count:
                    {{
                        `${game.players.length} /
                    ${game.maxPlayers} `
                    }}</v-row
                >
                <v-row>Max Buy-in: {{ game.maxBuyIn }}</v-row>
                <v-row>Current Big Blind: {{ game.bigBlind }}</v-row>

                <v-row style="text-decoration: underline; margin-top:50px;">
                    My Hand
                </v-row>
                <v-row v-if="game.hand"
                    >{{ game.hand[0] }} - {{ game.hand[1] }}</v-row
                >

                <v-row style="text-decoration: underline; margin-top:50px;">
                    Current Bets
                </v-row>
                <v-row v-for="bet in game.bets" :key="bet.username">
                    {{ bet.username }} - {{ bet.amount }}
                </v-row>

                <v-row style="text-decoration: underline; margin-top:50px;"
                    >Table</v-row
                >

                <v-row
                    v-for="player in game.players"
                    :key="player.id"
                    class="mb-2"
                >
                    <div>{{ player.name }} - {{ player.chips }}</div>
                    <div v-if="player.isDealer">
                        - D
                    </div>
                    <div v-if="player.isBigBlind">
                        - Big Blind
                    </div>
                    <div v-if="player.isSmallBlind">
                        - Small Blind
                    </div>
                    <div v-if="player.isTurn">
                        - Acting
                    </div>
                </v-row>
                <v-row
                    v-if="isTurn"
                    style="margin-top: 50px; margin-bottom: 50px;"
                >
                    <v-btn rounded color="primary" @click="handleCallClick"
                        >Call</v-btn
                    >
                    <v-btn rounded color="primary" @click="handleRaiseClick"
                        >Raise</v-btn
                    >
                    <v-btn rounded color="primary" @click="handleCheckClick"
                        >Check</v-btn
                    >
                    <v-btn rounded color="primary" @click="handleFoldClick"
                        >Fold</v-btn
                    >
                </v-row>
                <v-btn
                    v-if="!isSeated"
                    rounded
                    color="primary"
                    @click="showJoinGameDialog = true"
                    >Sit</v-btn
                >
                <v-btn v-else rounded color="primary" @click="handleLeaveClick"
                    >Leave</v-btn
                >
            </div>
            <div v-else>Loading Game...</div>

            <v-snackbar v-model="showSnackbar" :timeout="10000">
                {{ errorText }}
                <v-btn color="primary" text @click="showSnackbar = false"
                    >Close</v-btn
                >
            </v-snackbar>

            <JoinGameDialog
                v-if="game"
                :closeDialog="closeJoinGameDialog"
                :showDialog="showJoinGameDialog"
                :handleSubmit="handleSitClick"
                :maxBuyIn="game.maxBuyIn"
                :bigBlind="game.bigBlind"
            />
        </v-container>
    </v-content>
</template>

<script>
import { getGame, joinTable, leaveTable } from '../actions/games'
import io from 'socket.io-client'
import config from '../config'
import JoinGameDialog from '../components/JoinGameDialog'

export default {
    name: 'Game',
    data() {
        return {
            game: undefined,
            errorText: '',
            showSnackbar: false,
            showJoinGameDialog: false
        }
    },
    components: {
        JoinGameDialog
    },
    props: {
        user: Object
    },
    async created() {
        const socket = io(config.apiBaseUrl)
        this.socket = socket
        // TODO: if user connects to game they are already connected to, do not associate again and let user know.

        // TODO: Let the user know that they are waiting for a second player to join to start dealing.

        try {
            this.game = await getGame(this.$route.params.id)

            socket.emit('joinGame', this.$route.params.id, this.user)
            socket.on('gameUpdate', game => {
                if (game) {
                    this.game = game
                } else {
                    let countdown = 5
                    this.showSnackbar = true
                    this.errorText = `The game is over. Redirecting in ${countdown} seconds..`
                    setInterval(() => {
                        countdown--
                        this.errorText = `The game is over. Redirecting in ${countdown} seconds..`
                        if (countdown === 0) {
                            this.$router.push({
                                name: 'dashboard'
                            })
                        }
                    }, 1000)
                }
            })
        } catch (e) {
            if (e.response.status === 404) {
                this.errorText = 'Unable to find the specified game.'
            } else {
                this.errorText = 'Something went wrong, please try again later.'
            }

            this.showSnackbar = true
        }
    },
    methods: {
        async handleSitClick(buyIn) {
            try {
                this.showJoinGameDialog = false
                await joinTable(this.game._id, this.socket.id, buyIn)
            } catch (e) {
                const { status, data } = e.response
                if (status === 401) {
                    this.errorText =
                        'You must be logged in to sit at the table.'
                } else if (status === 404) {
                    this.errorText = 'Unable to find the specified game.'
                } else if (status === 400) {
                    this.errorText = data
                } else {
                    this.errorText =
                        'Something went wrong, please try again later.'
                }

                this.showSnackbar = true
            }
        },
        async handleLeaveClick() {
            try {
                await leaveTable(this.game._id)
            } catch (e) {
                const { status, data } = e.response
                if (status === 401) {
                    this.errorText = 'You must be logged in to leave the table.'
                } else if (status === 404) {
                    this.errorText = 'Unable to find the specified game.'
                } else if (status === 400) {
                    this.errorText = data
                } else {
                    this.errorText =
                        'Something went wrong, please try again later.'
                }

                this.showSnackbar = true
            }
        },
        async handleCallClick() {},
        async handleRaiseClick() {},
        async handleCheckClick() {},
        async handleFoldClick() {},
        closeJoinGameDialog() {
            this.showJoinGameDialog = false
        }
    },
    computed: {
        isSeated() {
            return (
                this.game &&
                this.user &&
                this.game.players.some(player => player._id === this.user._id)
            )
        },
        isTurn() {
            return (
                this.game &&
                this.user &&
                this.game.players.find(
                    player =>
                        player._id === this.user._id && player.isTurn === true
                )
            )
        }
    }
}
</script>

<template>
    <v-content>
        <v-container>
            <v-row v-if="game">
                <v-col md="4">
                    <v-row>Game: {{ game.name || game._id }}</v-row>
                    <v-row>
                        Player Count:
                        {{
                            `${game.players.length} /
                    ${game.maxPlayers} `
                        }}
                    </v-row>
                    <v-row>Max Buy-in: {{ game.maxBuyIn }}</v-row>
                    <v-row>Current Big Blind: {{ game.bigBlind }}</v-row>
                    <v-row>Phase: {{ game.phase }}</v-row>

                    <v-row style="text-decoration: underline; margin-top:50px;">My Hand</v-row>
                    <v-row v-if="game.hand && game.hand.length > 0">
                        <div class="card">{{ game.hand[0] }}</div>
                        <div class="card">{{ game.hand[1] }}</div>
                    </v-row>

                    <v-row style="text-decoration: underline; margin-top:30px;">Current Bets</v-row>
                    <v-row v-for="bet in game.bets" :key="bet.username">{{ bet.username }} - {{ bet.amount }}</v-row>
                    <v-row style="margin-top:10px;">Pot Total: {{ game.pot }}</v-row>

                    <v-row style="text-decoration: underline; margin-top:30px;">Table</v-row>

                    <v-row v-for="player in game.players" :key="player.id" class="mb-2">
                        <div v-if="player.isDealer">(D)</div>
                        <div>{{ player.name }} - {{ player.chips }}</div>
                        <div v-if="player.isBigBlind">- Big Blind</div>
                        <div v-if="player.isSmallBlind">- Small Blind</div>
                        <div v-if="player.isTurn">- Acting</div>
                    </v-row>
                    <v-row v-if="isTurn" style="margin-top: 30px; margin-bottom: 50px;">
                        <v-btn v-if="canCall" rounded color="primary" @click="handleCallClick">Call</v-btn>
                        <v-btn v-if="canRaise" rounded color="primary" @click="showRaiseDialog = true">Raise</v-btn>
                        <v-btn v-if="canCheck" rounded color="primary" @click="handleCheckClick">Check</v-btn>
                        <v-btn rounded color="primary" @click="handleFoldClick">Fold</v-btn>
                    </v-row>
                    <v-btn v-if="!player" rounded color="primary" @click="showJoinGameDialog = true">Sit</v-btn>
                    <v-btn v-else rounded color="primary" @click="handleLeaveClick">Leave</v-btn>
                </v-col>
                <v-col md="6">
                    <v-row class="d-flex justify-md-center align-center" style="height: 100%;">
                        <div class="d-flex community-container">
                            <div class="card" v-for="card in game.communityCards" :key="card">
                                {{ card }}
                            </div>
                        </div>
                    </v-row>
                </v-col>
            </v-row>
            <div v-else>Loading Game...</div>

            <v-snackbar v-model="showSnackbar" :timeout="10000">
                {{ errorText }}
                <v-btn color="primary" text @click="showSnackbar = false">Close</v-btn>
            </v-snackbar>

            <RaiseDialog
                v-if="canRaise"
                :closeDialog="closeRaiseDialog"
                :showDialog="showRaiseDialog"
                :handleSubmit="handleRaise"
                :chips="player.chips"
            />

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
import { getGame, joinTable, leaveTable, call, check, fold, raise } from '../actions/games'
import io from 'socket.io-client'
import config from '../config'
import JoinGameDialog from '../components/JoinGameDialog'
import RaiseDialog from '../components/RaiseDialog'

export default {
    name: 'Game',
    data() {
        return {
            game: undefined,
            errorText: '',
            showSnackbar: false,
            showJoinGameDialog: false,
            showRaiseDialog: false
        }
    },
    components: {
        JoinGameDialog,
        RaiseDialog
    },
    props: {
        user: Object
    },
    async created() {
        const socket = io(config.apiBaseUrl)
        this.socket = socket
        // TODO: if user connects to game they are already connected to, do not associate again and let user know.

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
                    this.errorText = 'You must be logged in to sit at the table.'
                } else if (status === 404) {
                    this.errorText = 'Unable to find the specified game.'
                } else if (status === 400) {
                    this.errorText = data
                } else {
                    this.errorText = 'Something went wrong, please try again later.'
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
                    this.errorText = 'Something went wrong, please try again later.'
                }

                this.showSnackbar = true
            }
        },
        async handleCallClick() {
            try {
                await call(this.game._id)
            } catch (e) {
                const { status, data } = e.response
                if (status === 400) {
                    this.errorText = data
                } else {
                    this.errorText = 'Something went wrong, please try again later.'
                }

                this.showSnackbar = true
            }
        },
        async handleRaise(amount) {
            this.showRaiseDialog = false

            try {
                await raise(this.game._id, amount)
            } catch (e) {
                const { status, data } = e.response
                if (status === 400) {
                    this.errorText = data
                } else {
                    this.errorText = 'Something went wrong, please try again later.'
                }

                this.showSnackbar = true
            }
        },
        async handleCheckClick() {
            try {
                await check(this.game._id)
            } catch (e) {
                const { status, data } = e.response
                if (status === 400) {
                    this.errorText = data
                } else {
                    this.errorText = 'Something went wrong, please try again later.'
                }

                this.showSnackbar = true
            }
        },
        async handleFoldClick() {
            try {
                await fold(this.game._id)
            } catch (e) {
                const { status, data } = e.response
                if (status === 400) {
                    this.errorText = data
                } else {
                    this.errorText = 'Something went wrong, please try again later.'
                }

                this.showSnackbar = true
            }
        },
        closeJoinGameDialog() {
            this.showJoinGameDialog = false
        },
        closeRaiseDialog() {
            this.showRaiseDialog = false
        }
    },
    computed: {
        isTurn() {
            return this.player && this.player.isTurn
        },
        player() {
            return this.game && this.user && this.game.players.find(player => player._id === this.user._id)
        },
        playerBet() {
            if (!this.player) {
                return false
            }
            const bet = this.game.bets.find(b => b.playerId === this.player._id)
            return bet ? bet.amount : false
        },
        largestBet() {
            if (!this.game || this.game.bets.length === 0) {
                return 0
            }
            return Math.max(...this.game.bets.map(bet => bet.amount))
        },
        canCall() {
            return this.game.bets.length > 0 && this.playerBet !== this.largestBet
        },
        canRaise() {
            if (!this.player) {
                return false
            }
            const amountToCall = this.playerBet ? this.largestBet - this.playerBet : this.largestBet
            return this.player.chips > amountToCall && this.game.lastToRaiseId !== this.player._id
        },
        canCheck() {
            if (
                (!this.playerBet && this.game.bets.length > 0) ||
                (this.playerBet && this.playerBet < this.largestBet)
            ) {
                return false
            }
            return true
        }
    }
}
</script>

<style>
.community-container {
    width: 280px;
}
.card {
    border: 1px solid black;
    height: 60px;
    width: 40px;
    padding: 8px;
}
.card + .card {
    margin-left: 20px;
}
</style>

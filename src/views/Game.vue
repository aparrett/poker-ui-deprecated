<template>
    <v-content>
        <v-container>
            <div v-if="game">
                <v-row>
                    <v-col sm="4">
                        <v-row>Game: {{ game.name || game._id }}</v-row>
                        <v-row> Player Count: {{ `${game.players.length} / ${game.maxPlayers} ` }} </v-row>
                        <v-row>Max Buy-in: {{ game.maxBuyIn }}</v-row>
                        <v-row>Current Big Blind: {{ game.bigBlind }}</v-row>
                    </v-col>
                    <v-col sm="4">
                        <v-row style="text-decoration: underline;">My Hand</v-row>
                        <v-row v-if="game.hand && game.hand.length > 0">
                            <div class="card">{{ game.hand[0] }}</div>
                            <div class="card">{{ game.hand[1] }}</div>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row style="justify-content: center;">
                    <div id="table">
                        <div
                            v-for="(player, index) in game.players"
                            :key="player._id"
                            :class="`player player-${index} ${player.isTurn && 'acting'}`"
                        >
                            <div>{{ player.name }}</div>
                            <div>{{ player.chips }}</div>
                            <div v-if="game.bets.find(b => b.playerId === player._id)">
                                ${{ game.bets.find(b => b.playerId === player._id).amount }}
                            </div>
                            <div v-if="player.isDealer">(D)</div>
                        </div>
                        <v-row v-if="isTurn" style="margin-top: 30px; margin-bottom: 50px;">
                            <v-btn v-if="canCall" rounded color="primary" @click="handleCallClick">Call</v-btn>
                            <v-btn v-if="canRaise" rounded color="primary" @click="showRaiseDialog = true">Raise</v-btn>
                            <v-btn v-if="canCheck" rounded color="primary" @click="handleCheckClick">Check</v-btn>
                            <v-btn rounded color="primary" @click="handleFoldClick">Fold</v-btn>
                        </v-row>
                        <v-row class="d-flex justify-sm-center align-center" style="height: 100%;">
                            <div class="d-flex community-container">
                                <div class="card" v-for="card in game.communityCards" :key="card">
                                    {{ card }}
                                </div>
                            </div>
                        </v-row>
                    </div>
                </v-row>
                <v-row>
                    <v-btn v-if="!player" rounded color="primary" @click="showJoinGameDialog = true">Sit</v-btn>
                    <v-btn v-else rounded color="primary" @click="handleLeaveClick">Leave</v-btn>
                </v-row>
            </div>
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
                    // TODO: DELETE THIS LOGIC - ONLY USED FOR STYLING UI
                    const player = {
                        hand: [
                            'U2FsdGVkX1/A1fhVIabwnAiQ1/yoFApi6Ia8S97Fpa0=',
                            'U2FsdGVkX195OCMAvht3pXaymcC6vbs6LbQ9OVFKE8Q='
                        ],
                        socketId: 'hsMS8vuTyIrUjyA2AAAH',
                        chips: 9980,
                        hasActed: false,
                        isTurn: false,
                        isDealer: false,
                        isSmallBlind: false,
                        isBigBlind: false
                    }
                    const players = [
                        { ...player, name: 'Player 0', _id: 'p0', username: 'p0', isDealer: true },
                        { ...player, name: 'Player 1', _id: 'p1', username: 'p1', isSmallBlind: true },
                        { ...player, name: 'Player 2', _id: 'p2', username: 'p2', isBigBlind: true },
                        { ...player, name: 'Player 3', _id: 'p3', username: 'p3', isTurn: true },
                        { ...player, name: 'Player 4', _id: 'p4', username: 'p4' },
                        { ...player, name: 'Player 5', _id: 'p5', username: 'p5' },
                        { ...player, name: 'Player 6', _id: 'p6', username: 'p6' },
                        { ...player, name: 'Player 7', _id: 'p7', username: 'p7' },
                        { ...player, name: 'Player 8', _id: 'p8', username: 'p8' },
                        { ...player, name: 'Player 9', _id: 'p9', username: 'p9' },
                        { ...player, name: 'Player 10', _id: 'p10', username: 'p10' },
                        { ...player, name: 'Player 11', _id: 'p11', username: 'p11' }
                    ]
                    const bets = [
                        { playerId: 'p1', amount: 10 },
                        { playerId: 'p2', amount: 20 }
                    ]
                    game.players = players
                    game.communityCards = ['AH', 'KD', 'JS', 'QD', 'TS']
                    game.bets = bets
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

<style lang="scss">
#table {
    height: 500px;
    position: relative;
    width: 900px;
}
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

.player {
    font-weight: bold;
    position: absolute;
    height: 100px;
    width: 75px;
    border: 1px solid black;

    .acting {
        border: 4px solid blue;
    }
}

.player-0 {
    right: 15.3%;
    bottom: 0;
}

.player-1 {
    right: calc(27.6% + 75px);
    bottom: 0;
}

.player-2 {
    left: calc(27.6% + 75px);
    bottom: 0;
}

.player-3 {
    left: 15.3%;
    bottom: 0;
}

.player-4 {
    left: 0;
    bottom: 20%;
}

.player-5 {
    left: 0;
    top: 20%;
}

.player-6 {
    left: 15.3%;
    top: 0;
}

.player-7 {
    left: calc(27.6% + 75px);
    top: 0;
}

.player-8 {
    right: calc(27.6% + 75px);
    top: 0;
}

.player-9 {
    right: 15.3%;
    top: 0;
}

.player-10 {
    right: 0;
    top: 20%;
}

.player-11 {
    right: 0;
    bottom: 20%;
}
</style>

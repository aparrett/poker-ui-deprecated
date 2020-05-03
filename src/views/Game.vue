<template>
    <v-content>
        <v-container>
            <div v-if="game">
                <v-row>
                    <v-col sm="8">
                        <div v-if="isTurn">
                            <v-btn v-if="canCall" rounded color="primary" @click="handleCallClick">Call</v-btn>
                            <v-btn v-if="canRaise" rounded color="primary" @click="showRaiseDialog = true">Raise</v-btn>
                            <v-btn v-if="canCheck" rounded color="primary" @click="handleCheckClick">Check</v-btn>
                            <v-btn rounded color="primary" @click="handleFoldClick">Fold</v-btn>
                        </div>
                    </v-col>
                </v-row>
                <v-row style="justify-content: center;">
                    <div id="table">
                        <div
                            v-for="(player, index) in game.players"
                            :key="player._id"
                            :class="`player player-${index} ${player.isTurn ? 'acting' : ''}`"
                        >
                            <div class="top sub">
                                <div>{{ player.name }}</div>
                            </div>
                            <div class="bottom sub">
                                <div>${{ player.chips }}</div>
                            </div>

                            <div v-if="game.bets.find(b => b.playerId === player._id)" class="currentBet">
                                ${{ game.bets.find(b => b.playerId === player._id).amount }}
                            </div>
                            <div v-if="player.isDealer" class="dealerChip">(D)</div>
                            <div
                                v-if="game.hand && game.hand.length > 0 && userPlayer && userPlayer._id === player._id"
                                class="hand userHand"
                            >
                                <div
                                    class="card"
                                    :style="`background-image: url('/images/cards/${game.hand[0]}.svg');`"
                                />
                                <div
                                    class="card"
                                    :style="`background-image: url('/images/cards/${game.hand[1]}.svg');`"
                                />
                            </div>
                            <div v-else-if="player.hand && player.hand.length > 0" class="hand">
                                <div class="cardBack"></div>
                                <div class="cardBack"></div>
                            </div>
                        </div>

                        <v-row class="d-flex justify-sm-center align-center" style="height: 100%;">
                            <div class="d-flex community-container">
                                <div
                                    class="card"
                                    v-for="card in game.communityCards"
                                    :key="card"
                                    :style="`background-image: url('/images/cards/${card}.svg');`"
                                />
                            </div>
                        </v-row>

                        <v-btn v-if="!userPlayer" rounded class="sitOrLeaveBtn" @click="showJoinGameDialog = true"
                            >Sit</v-btn
                        >
                        <v-btn v-else rounded prepend-icon="arrow-back" class="sitOrLeaveBtn" @click="handleLeaveClick"
                            ><v-icon left>arrow_back</v-icon>Leave</v-btn
                        >
                    </div>
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
                :chips="userPlayer.chips"
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
            return this.userPlayer && this.userPlayer.isTurn
        },
        userPlayer() {
            return this.game && this.user && this.game.players.find(player => player._id === this.user._id)
        },
        playerBet() {
            if (!this.userPlayer) {
                return false
            }
            const bet = this.game.bets.find(b => b.playerId === this.userPlayer._id)
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
            if (!this.userPlayer) {
                return false
            }
            const amountToCall = this.playerBet ? this.largestBet - this.playerBet : this.largestBet
            return this.userPlayer.chips > amountToCall && this.game.lastToRaiseId !== this.userPlayer._id
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
$userCardWidth: 40px;
$userCardHeight: 53px;
$userHandVerticalOffset: -($userCardHeight) - 5px;
$userHandHorizontalOffset: -($userCardWidth * 2) - 5px;

$playerCardHeight: 30px;
$playerCardWidth: 20px;
$playerHandVerticalOffset: -($playerCardHeight + 5px);

$currentBetWidth: 70px;
$currentBetOffset: -($currentBetWidth + 7px);

.theme--light.v-application {
    color: #fff;
}

body {
    background-image: url('/images/backgrounds/random_grey_variations.png');
    background-repeat: repeat;
}

#app {
    background: none;
}

#table {
    height: 500px;
    position: relative;
    width: 900px;
    background-image: url('/images/poker-table-2-sm.png');
    background-size: 900px 500px;
}

.sitOrLeaveBtn {
    position: absolute;
    bottom: 0;
    left: 0;
}

.community-container {
    width: 430px;

    .card {
        height: 95px;
        width: 70px;
    }

    .card + .card {
        margin-left: 20px;
    }
}

.cardBack {
    background-image: url(/images/card-back.png);
    height: $playerCardHeight;
    width: $playerCardWidth;
    background-size: contain;
    display: inline-block;
}

.userHand {
    width: ($userCardWidth * 2);

    .card {
        height: $userCardHeight;
        width: $userCardWidth;
    }
}

.player {
    font-weight: bold;
    position: absolute;
    height: 100px;
    width: 75px;
    border: 1px solid #fff;

    &.acting {
        border: 4px solid blue;
    }

    .hand {
        position: absolute;
        height: $playerCardHeight;

        &.userHand {
            .card {
                display: inline-block;
            }
        }
    }

    .sub {
        position: absolute;
        text-align: center;
        width: 100%;
    }

    .top {
        top: 0;
    }

    .bottom {
        bottom: 0;
    }

    .currentBet {
        position: absolute;
        width: $currentBetWidth;
        right: $currentBetOffset;
    }

    .dealerChip {
        position: absolute;
        left: -30px;
    }
}

@mixin bottom-row {
    bottom: 0;

    .hand {
        top: $playerHandVerticalOffset;
        left: 20%;

        &.userHand {
            top: $userHandVerticalOffset;
            left: -3px;
        }
    }

    .currentBet {
        top: 0;
    }

    .dealerChip {
        top: 0;
    }
}

@mixin top-row {
    top: 0;

    .hand {
        left: 20%;
        bottom: $playerHandVerticalOffset;

        &.userHand {
            bottom: $userHandVerticalOffset;
            left: -3px;
        }
    }

    .currentBet {
        bottom: 0;
    }

    .dealerChip {
        bottom: 0;
    }
}

@mixin left-col {
    left: 0;

    .hand {
        right: -45px;

        &.userHand {
            right: $userHandHorizontalOffset;
        }
    }

    .dealerChip {
        right: 5px;
        left: unset;
    }
}

@mixin right-col {
    right: 0;

    .hand {
        left: -45px;

        &.userHand {
            left: $userHandHorizontalOffset;
        }
    }

    .currentBet {
        left: $currentBetOffset;
        text-align: right;
    }

    .dealerChip {
        left: 5px;
    }
}

$colHandOffset: 5%;
$colBetVerticalOffset: -25px;
$colDealerChipVerticalOffset: -28px;

.player-0 {
    right: 15.3%;
    @include bottom-row;
}

.player-1 {
    right: calc(27.6% + 75px);
    @include bottom-row;
}

.player-2 {
    left: calc(27.6% + 75px);
    @include bottom-row;
}

.player-3 {
    left: 15.3%;
    @include bottom-row;
}

.player-4 {
    @include left-col;
    bottom: 20%;
    .hand {
        top: $colHandOffset;
        &.userHand {
            top: 0;
        }
    }

    .currentBet {
        top: $colBetVerticalOffset;
    }

    .dealerChip {
        top: $colDealerChipVerticalOffset;
    }
}

.player-5 {
    @include left-col;
    top: 20%;

    .hand {
        bottom: $colHandOffset;
        &.userHand {
            bottom: 0;
        }
    }

    .currentBet {
        bottom: $colBetVerticalOffset;
    }

    .dealerChip {
        bottom: $colDealerChipVerticalOffset;
    }
}

.player-6 {
    left: 15.3%;
    @include top-row;
}

.player-7 {
    left: calc(27.6% + 75px);
    @include top-row;
}

.player-8 {
    right: calc(27.6% + 75px);
    @include top-row;
}

.player-9 {
    right: 15.3%;
    @include top-row;
}

.player-10 {
    top: 20%;
    @include right-col;

    .hand {
        bottom: $colHandOffset;
        &.userHand {
            bottom: 0;
        }
    }

    .currentBet {
        bottom: $colBetVerticalOffset;
    }

    .dealerChip {
        bottom: $colDealerChipVerticalOffset;
    }
}

.player-11 {
    bottom: 20%;
    @include right-col;

    .hand {
        top: $colHandOffset;
        &.userHand {
            top: 0;
        }
    }

    .currentBet {
        top: $colBetVerticalOffset;
    }

    .dealerChip {
        top: $colDealerChipVerticalOffset;
    }
}
</style>

<template>
    <v-content>
        <v-container>
            <div v-if="game">
                <v-row style="justify-content: center;">
                    <div id="table">
                        <v-btn small class="leave-btn" @click="handleLeaveClick"
                            ><v-icon left>arrow_back</v-icon>Leave</v-btn
                        >
                        <v-btn small v-if="!userPlayer" class="sit-btn" @click="showJoinGameDialog = true">Sit</v-btn>
                        <div
                            v-for="(player, index) in game.players"
                            :key="player._id"
                            :class="`player player-${index}`"
                        >
                            <div class="top sub">
                                <div>${{ player.chips }}</div>
                            </div>
                            <div
                                class="middle"
                                :style="`background-image: url('/images/avatars/avatar${index}.jpg');`"
                            />
                            <div class="bottom sub">
                                <div :class="`${player.isTurn ? 'acting' : ''}`">{{ player.name }}</div>
                            </div>

                            <div v-if="player.isDealer" class="dealerChip">D</div>
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
                            <div v-else-if="player.hand" class="hand">
                                <div class="card-back" />
                                <div class="card-back" />
                            </div>
                            <div v-if="game.bets.find(b => b.playerId === player._id)" class="currentBet">
                                ${{ game.bets.find(b => b.playerId === player._id).amount }}
                            </div>
                        </div>

                        <v-row class="d-flex justify-sm-center align-center" style="height: 100%;">
                            <div class="d-flex community-container">
                                <div
                                    :class="`card flip-card ${cardFlipAnimations[index] ? 'flipped' : ''}`"
                                    v-for="(card, index) in game.communityCards"
                                    :key="card"
                                >
                                    <div class="flip-card-inner">
                                        <div class="flip-card-front" />
                                        <div class="flip-card-back">
                                            <img :src="`/images/cards/${card}.svg`" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-row>

                        <div
                            v-for="(player, index) in game.players"
                            :key="'deal-card-0' + player._id"
                            :class="`deal-card card-back deal-animation-${index}-0`"
                        />

                        <div
                            v-for="(player, index) in game.players"
                            :key="'deal-card-1' + player._id"
                            :class="`deal-card card-back deal-animation-${index}-1`"
                        />
                    </div>
                </v-row>
                <v-row class="d-flex justify-center action-btns">
                    <v-btn large :disabled="!isTurn || !canCall" @click="handleCallClick">Call</v-btn>
                    <v-btn large :disabled="!isTurn || !canRaise" @click="showRaiseDialog = true">Raise</v-btn>
                    <v-btn large :disabled="!isTurn || !canCheck" @click="handleCheckClick">Check</v-btn>
                    <v-btn large @click="handleFoldClick">Fold</v-btn>
                </v-row>
            </div>
            <div v-else>Loading Game...</div>

            <v-snackbar v-model="showSnackbar" :timeout="10000">
                {{ errorText }}
                <v-btn light small @click="showSnackbar = false">Close</v-btn>
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
            showRaiseDialog: false,
            cardFlipAnimations: [],
            dealAnimations: []
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

        try {
            this.game = await getGame(this.$route.params.id)

            socket.emit('joinGame', this.$route.params.id, this.user)
            socket.on('gameUpdate', game => {
                if (game) {
                    this.game = game

                    this.deal()
                } else {
                    this.closeGame()
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
            if (!this.userPlayer) {
                return this.$router.push('/')
            }

            try {
                await leaveTable(this.game._id)
                this.$router.push('/')
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
        },
        closeGame() {
            let countdown = 5
            const gamePath = this.$router.current.path
            this.showSnackbar = true
            this.errorText = `The game is over. Redirecting in ${countdown} seconds..`
            setInterval(() => {
                // If user has already navigated away, abort.
                if (this.$router.current.path !== gamePath) {
                    return
                }

                countdown--
                this.errorText = `The game is over. Redirecting in ${countdown} seconds..`
                if (countdown === 0) {
                    this.$router.push({
                        name: 'dashboard'
                    })
                }
            }, 1000)
        },
        addCardAnimation() {
            return new Promise(resolve => {
                setTimeout(() => {
                    this.cardFlipAnimations.push(true)
                    resolve()
                }, 700)
            })
        },
        deal() {
            this.dealAnimations.push('0a')
            this.dealAnimations.push('0b')
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
    },
    watch: {
        // Add card animations and stagger them for the flop.
        'game.communityCards': async function(cards, oldCards) {
            if (oldCards && cards.length === oldCards.length) {
                return
            }

            if (cards.length === 3) {
                await this.addCardAnimation()
                await this.addCardAnimation()
                await this.addCardAnimation()
            } else {
                setTimeout(() => {
                    this.cardFlipAnimations = new Array(cards.length).fill(true)
                }, 50)
            }
        }
    }
}
</script>

<style lang="scss">
$userCardWidth: 40px;
$userCardHeight: 53px;
$userHandVerticalOffset: -($userCardHeight) - 5px;
$userHandHorizontalOffset: -($userCardWidth * 2) - 5px;

$tableWidth: 900px;
$tablePadding: 160px;
$playerHeight: 125px;
$playerWidth: 75px;
$marginBetweenPlayers: ($tableWidth - (2 * $tablePadding) - (4 * $playerWidth)) / 3;

$playerCardHeight: 30px;
$playerCardWidth: 20px;
$playerHandVerticalOffset: -($playerCardHeight + 5px);

$currentBetWidth: 70px;
$currentBetOffset: -($currentBetWidth - 15px);

.theme--light.v-application {
    color: #fff;
}

#table {
    height: 560px;
    position: relative;
    width: $tableWidth;
    background-image: url('/images/poker-table.png');
    background-size: 900px 500px;
    background-position: center;
}

.leave-btn {
    position: absolute;
    top: 0;
    left: 20px;
}

.sit-btn {
    position: absolute;
    top: 40px;
    left: 20px;
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

.card-back {
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

.dealerChip {
    background-image: url('/images/chips/black-chip.png');
    background-size: cover;
    width: 20px;
    height: 20px;

    /* style the letter D until we get a real dealer chip */
    text-align: center;
    font-size: 14px;
    padding-left: 1px;
    color: #e8e8e8;
}

.player {
    font-weight: bold;
    position: absolute;
    height: $playerHeight;
    width: $playerWidth;

    .acting {
        color: #2eaf2e;
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
        background-color: #00000066;
        font-size: 12px;
        padding-top: 3px;
    }

    $outerHeight: 25px;

    .top {
        height: $outerHeight;
        top: 0;
        border-radius: 5px 5px 0 0;
        font-size: 14px;
        padding-top: 2px;
    }

    .bottom {
        height: $outerHeight;
        bottom: 0;
        border-radius: 0 0 5px 5px;
        font-size: 12px;
        padding-top: 3px;
    }

    .middle {
        width: 100%;
        position: absolute;
        top: $outerHeight;
        height: $playerHeight - (2 * $outerHeight);
    }

    .currentBet {
        position: absolute;
        width: $currentBetWidth;
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
        top: -30px;
        right: $currentBetOffset;
    }

    .hand.userHand + .currentBet {
        right: -80px;
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
        bottom: -30px;
        right: $currentBetOffset;
    }

    .hand.userHand + .currentBet {
        right: -80px;
    }

    .dealerChip {
        bottom: 0;
    }
}

@mixin left-col {
    left: 20px;

    .hand {
        right: -45px;

        &.userHand {
            right: $userHandHorizontalOffset;
        }
    }

    .dealerChip {
        right: -25px;
        left: unset;
    }
}

@mixin right-col {
    right: 20px;

    .hand {
        left: -45px;

        &.userHand {
            left: $userHandHorizontalOffset;
        }
    }

    .currentBet {
        text-align: right;
    }

    .dealerChip {
        left: -25px;
    }
}

$colHandOffset: 5%;
$colBetVerticalOffset: -30px;
$colBetHorizontalOffset: 50px;
$colDealerChipVerticalOffset: 60px;

.player-0 {
    right: $tablePadding;
    @include bottom-row;
}

.player-1 {
    right: $tablePadding + $playerWidth + $marginBetweenPlayers;
    @include bottom-row;
}

.player-2 {
    left: $tablePadding + $playerWidth + $marginBetweenPlayers;
    @include bottom-row;
}

.player-3 {
    left: $tablePadding;
    @include bottom-row;
}

.player-4 {
    @include left-col;
    bottom: 17%;
    .hand {
        top: $colHandOffset;
        &.userHand {
            top: 0;
        }
    }

    .currentBet {
        top: $colBetVerticalOffset;
        left: $colBetHorizontalOffset;
    }

    .dealerChip {
        top: $colDealerChipVerticalOffset;
    }
}

.player-5 {
    @include left-col;
    top: 17%;

    .hand {
        bottom: $colHandOffset;
        &.userHand {
            bottom: 0;
        }
    }

    .currentBet {
        bottom: $colBetVerticalOffset;
        left: $colBetHorizontalOffset;
    }

    .dealerChip {
        bottom: $colDealerChipVerticalOffset;
    }
}

.player-6 {
    left: $tablePadding;
    @include top-row;
}

.player-7 {
    left: $tablePadding + $playerWidth + $marginBetweenPlayers;
    @include top-row;
}

.player-8 {
    right: $tablePadding + $playerWidth + $marginBetweenPlayers;
    @include top-row;
}

.player-9 {
    right: $tablePadding;
    @include top-row;
}

.player-10 {
    top: 17%;
    @include right-col;

    .hand {
        bottom: $colHandOffset;
        &.userHand {
            bottom: 0;
        }
    }

    .currentBet {
        bottom: $colBetVerticalOffset;
        right: $colBetHorizontalOffset;
    }

    .dealerChip {
        bottom: $colDealerChipVerticalOffset;
    }
}

.player-11 {
    bottom: 17%;
    @include right-col;

    .hand {
        top: $colHandOffset;
        &.userHand {
            top: 0;
        }
    }

    .currentBet {
        top: $colBetVerticalOffset;
        right: $colBetHorizontalOffset;
    }

    .dealerChip {
        top: $colDealerChipVerticalOffset;
    }
}

.action-btns {
    margin-top: 40px;
    .v-btn + .v-btn {
        margin-left: 40px;
    }
}

/* Animate community cards */
.flip-card {
    background-color: transparent;
    width: 300px;
    height: 300px;
}

.flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.flip-card.flipped .flip-card-inner {
    transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background-color: transparent;
}

.flip-card-front {
    background-size: 100%;
    background-image: url('/images/card-back.png');
}

.flip-card-back {
    transform: rotateY(180deg);
}

/* Animate dealing */
.deal-card {
    position: absolute;
    left: 445px;
    top: 200px;
}

.deal-animation-0-0 {
    -webkit-animation: deal0 0.5s forwards;
    animation: deal0 0.5s forwards;
}

.deal-animation-0-1 {
    -webkit-animation: deal1 0.5s forwards;
    animation: deal1 0.5s forwards;
    animation-delay: 0.75s;
}

.deal-animation-1-0 {
    -webkit-animation: deal2 0.5s forwards;
    animation: deal2 0.5s forwards;
    animation-delay: 0.25s;
}

.deal-animation-1-1 {
    -webkit-animation: deal3 0.5s forwards;
    animation: deal3 0.5s forwards;
    animation-delay: 1s;
}

.deal-animation-2-0 {
    -webkit-animation: deal4 0.5s forwards;
    animation: deal4 0.5s forwards;
    animation-delay: 0.5s;
}

.deal-animation-2-1 {
    -webkit-animation: deal5 0.5s forwards;
    animation: deal5 0.5s forwards;
    animation-delay: 1.25s;
}

@-webkit-keyframes deal0 {
    100% {
        margin-left: 235px;
        margin-top: 200px;
        -webkit-transform: rotate(360deg);
    }
}

@keyframes deal0 {
    100% {
        margin-left: 235px;
        margin-top: 200px;
        transform: rotate(360deg);
    }
}

@-webkit-keyframes deal1 {
    100% {
        margin-left: 255px;
        margin-top: 200px;
        -webkit-transform: rotate(360deg);
    }
}

@keyframes deal1 {
    100% {
        margin-left: 255px;
        margin-top: 200px;
        transform: rotate(360deg);
    }
}

@-webkit-keyframes deal2 {
    100% {
        margin-left: 67px;
        margin-top: 200px;
        -webkit-transform: rotate(360deg);
    }
}

@keyframes deal2 {
    100% {
        margin-left: 67px;
        margin-top: 200px;
        transform: rotate(360deg);
    }
}

@-webkit-keyframes deal3 {
    100% {
        margin-left: 87px;
        margin-top: 200px;
        -webkit-transform: rotate(360deg);
    }
}

@keyframes deal3 {
    100% {
        margin-left: 87px;
        margin-top: 200px;
        transform: rotate(360deg);
    }
}

@-webkit-keyframes deal4 {
    100% {
        margin-left: -101px;
        margin-top: 200px;
        -webkit-transform: rotate(360deg);
    }
}

@keyframes deal4 {
    100% {
        margin-left: -101px;
        margin-top: 200px;
        transform: rotate(360deg);
    }
}

@-webkit-keyframes deal5 {
    100% {
        margin-left: -81px;
        margin-top: 200px;
        -webkit-transform: rotate(360deg);
    }
}

@keyframes deal5 {
    100% {
        margin-left: -81px;
        margin-top: 200px;
        transform: rotate(360deg);
    }
}
</style>

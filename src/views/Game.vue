<template>
    <v-content>
        <v-container>
            <div v-if="game">
                <v-row style="justify-content: center;">
                    <div id="table">
                        <v-btn small class="leave-btn" @click="handleLeaveClick"
                            ><v-icon left>arrow_back</v-icon>Leave</v-btn
                        >
                        <v-btn small v-if="showSitButton" class="sit-btn" @click="showJoinGameDialog = true">Sit</v-btn>
                        <div
                            v-for="(player, index) in [...game.players, ...game.playersWaiting]"
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
                                v-if="
                                    !isDealing &&
                                        game.hand &&
                                        game.hand.length > 0 &&
                                        userPlayer &&
                                        userPlayer._id === player._id
                                "
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
                            <div v-else-if="!isDealing && player.hand" class="hand">
                                <div class="card-back" />
                                <div class="card-back" />
                            </div>
                            <div v-if="game.bets.find(b => b.playerId === player._id)" class="currentBet">
                                ${{ game.bets.find(b => b.playerId === player._id).amount }}
                            </div>
                        </div>

                        <v-row class="d-flex justify-sm-center align-center" style="height: 100%;">
                            <div v-if="game.players.length === 1" style="font-weight: bold;">
                                Waiting for more players to join to start the game.
                            </div>
                            <div v-if="game.communityCards.length > 0" class="d-flex community-container">
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

                        <div v-if="isDealing">
                            <div
                                v-for="(player, index) in game.players"
                                :key="'deal-card-0' + player._id"
                                :class="`deal-card card-back deal-animation-${index}-0`"
                                :style="`animation-delay: ${index * dealAnimationDelay}s;`"
                            />

                            <div
                                v-for="(player, index) in game.players"
                                :key="'deal-card-1' + player._id"
                                :class="`deal-card card-back deal-animation-${index}-1`"
                                :style="
                                    `animation-delay: ${(game.players.length - 1) * dealAnimationDelay +
                                        (index + 1) * dealAnimationDelay}s;`
                                "
                            />
                        </div>
                    </div>
                </v-row>
                <v-row v-if="userPlayer" class="d-flex justify-center action-btns">
                    <v-btn large :disabled="!isTurn || !canCall" @click="handleCallClick">Call</v-btn>
                    <v-btn large :disabled="!isTurn || !canRaise" @click="showRaiseDialog = true">Raise</v-btn>
                    <v-btn large :disabled="!isTurn || !canCheck" @click="handleCheckClick">Check</v-btn>
                    <v-btn large :disabled="!isTurn" @click="handleFoldClick">Fold</v-btn>
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
            isDealing: false,
            dealAnimationDelay: 0.25
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
                    const nextDealer = game.players.find(p => p.isDealer)
                    const previousDealer = this.game.players.find(p => p.isDealer)

                    if (nextDealer) {
                        if (!previousDealer || nextDealer._id !== previousDealer._id) {
                            this.deal(game.players.length)
                        }
                    }

                    this.game = game
                } else {
                    this.closeGame()
                }
            })
        } catch (e) {
            if (e.response.status === 404) {
                this.errorText = 'Unable to find the specified game. Redirecting..'
            } else {
                this.errorText = 'Something went wrong, please try again later. Redirecting'
            }

            setTimeout(() => {
                this.$router.push('/')
            }, 5000)
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
            this.$router.push('/')

            try {
                await leaveTable(this.game._id)
            } catch (e) {
                /* eslint-disable no-console */
                console.log(e)
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
        addCommunityCardAnimation() {
            return new Promise(resolve => {
                setTimeout(() => {
                    this.cardFlipAnimations.push(true)
                    resolve()
                }, 700)
            })
        },
        deal(playerCount) {
            this.isDealing = true
            const timeToDeal = this.dealAnimationDelay * playerCount * 2

            setTimeout(() => {
                this.isDealing = false
            }, timeToDeal * 1000)
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
        },
        showSitButton() {
            if (!this.game) {
                return false
            }
            if (this.atMaxCapacity) {
                return false
            }
            if (!this.user) {
                return true
            }

            return !this.userPlayer && !this.game.playersWaiting.map(p => p._id).includes(this.user._id)
        },
        atMaxCapacity() {
            return this.game && this.game.players.length + this.game.playersWaiting.length === this.game.maxPlayers
        }
    },
    watch: {
        // Add card animations and stagger them for the flop.
        'game.communityCards': async function(cards, oldCards) {
            if (oldCards && cards.length === oldCards.length) {
                return
            }

            if (cards.length === 3) {
                await this.addCommunityCardAnimation()
                await this.addCommunityCardAnimation()
                await this.addCommunityCardAnimation()
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
@import '../styles/game.scss';
</style>

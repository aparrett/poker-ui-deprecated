<template>
    <v-content>
        <v-container>
            <div v-if="game">
                <v-row style="justify-content: center">
                    <div id="table">
                        <v-btn small class="leave-btn" @click="handleLeaveClick"
                            ><v-icon left>arrow_back</v-icon>Leave</v-btn
                        >
                        <v-btn small v-if="showSitButton" class="sit-btn" @click="showJoinGameDialog = true">Sit</v-btn>

                        <Players
                            :game="game"
                            :isDealing="isDealing"
                            :isShowingWinners="isShowingWinners"
                            :endedByFold="endedByFold"
                        />

                        <div v-if="this.middlePot && !isShowingWinners" class="pot d-flex justify-center">
                            ${{ this.middlePot }}
                        </div>

                        <CommunityCards :game="game" :cardFlipAnimations="cardFlipAnimations" />

                        <div v-if="isShowingWinners">
                            <div v-if="!endedByFold && winningHandType" class="winning-hand-type">
                                {{ winningHandType }}
                            </div>
                            <PotAnimations :game="game" :winnerAnimationDelay="winnerAnimationDelay" />
                        </div>

                        <DealAnimations
                            v-if="isDealing"
                            :players="game.players"
                            :dealAnimationDelay="dealAnimationDelay"
                        />
                    </div>
                </v-row>

                <v-row v-if="userPlayer" class="d-flex justify-center action-btns">
                    <v-btn large :disabled="isShowingWinners || !isTurn || !canCall" @click="handleCallClick"
                        >Call</v-btn
                    >
                    <v-btn large :disabled="isShowingWinners || !isTurn || !canRaise" @click="showRaiseDialog = true"
                        >Raise</v-btn
                    >

                    <div v-if="!isDealing && game.hand && game.hand.length > 0" class="hand user-hand">
                        <div class="card" :style="`background-image: url('/images/cards/${game.hand[0]}.svg');`" />
                        <div class="card" :style="`background-image: url('/images/cards/${game.hand[1]}.svg');`" />
                    </div>

                    <v-btn large :disabled="isShowingWinners || !isTurn || !canCheck" @click="handleCheckClick"
                        >Check</v-btn
                    >
                    <v-btn large :disabled="isShowingWinners || !isTurn" @click="handleFoldClick">Fold</v-btn>
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
                :largestBet="largestBet"
                :playerBet="playerBet"
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
import Players from '../components/Players'
import CommunityCards from '../components/CommunityCards'
import PotAnimations from '../components/PotAnimations'
import DealAnimations from '../components/DealAnimations'

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
            isShowingWinners: false,
            endedByFold: false,
            isDealing: false,
            winnerAnimationDelay: 2.5,
            dealAnimationDelay: 0.25,
            winningHandType: null
        }
    },
    components: {
        JoinGameDialog,
        RaiseDialog,
        Players,
        CommunityCards,
        PotAnimations,
        DealAnimations
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

                    const dealerChanged = previousDealer && nextDealer && nextDealer._id !== previousDealer._id
                    if (
                        (this.game.players.length !== 1 && dealerChanged) ||
                        (this.game.players.length > 1 && game.players.length === 1)
                    ) {
                        this.showWinners(game)
                    } else if (this.game.players.length === 1 && game.players.length > 1) {
                        this.game = game
                        this.deal(game.players.length)
                    } else {
                        this.game = game
                    }
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
                if (this.userPlayer) {
                    await leaveTable(this.game._id)
                }
            } catch (e) {
                /* eslint-disable no-console */
                console.error(e)
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
        showWinners(nextGame) {
            const { winners, players } = nextGame
            this.game.winners = nextGame.winners

            this.isShowingWinners = true
            if (nextGame.endedByFold) {
                this.endedByFold = true
            }
            const animationTime = this.winnerAnimationDelay * winners.length

            // Show hand type while chips are being distributed.
            winners.forEach((winner, i) => {
                setTimeout(() => {
                    this.winningHandType = winner.handType
                }, 1000 * i * this.winnerAnimationDelay)
            })

            // Adding some extra time so that the players can look at the board a little longer.
            const extraTime = this.game.phase === 'RIVER' ? 3000 : 1000

            // After the winning animations have finished.
            setTimeout(() => {
                this.isShowingWinners = false
                this.endedByFold = false
                this.winningHandType = null

                this.game = nextGame
                if (players.length > 1) {
                    this.deal(players.length)
                }
            }, animationTime * 1000 + extraTime)
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
        middlePot() {
            return this.game.pot - this.totalBets
        },
        hasBets() {
            return this.game && this.game.bets.length !== 0
        },
        totalBets() {
            if (!this.hasBets) {
                return 0
            }
            return this.game.bets.reduce((acc, bet) => acc + bet.amount, 0)
        },
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

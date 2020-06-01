<template>
    <v-row class="d-flex justify-center align-center" style="height: 100%;">
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
</template>

<script>
export default {
    props: {
        game: Object,
        isShowingWinners: Boolean,
        cardFlipAnimations: Array
    }
}
</script>

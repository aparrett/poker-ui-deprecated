<template>
    <div>
        <div
            v-for="(player, index) in [...game.players, ...game.playersWaiting]"
            :key="player._id"
            :class="`player player-${index} ${!player.hand ? 'dim' : ''}`"
        >
            <div class="top sub">
                <div>${{ player.chips }}</div>
            </div>
            <div class="middle" :style="`background-image: url('/images/avatars/avatar${index}.jpg');`" />
            <div class="bottom sub">
                <div v-if="player.lastAction && !player.isTurn">{{ player.lastAction }}</div>
                <div v-else :class="`${player.isTurn ? 'acting' : ''}`">{{ player.name }}</div>
            </div>

            <div v-if="player.isDealer" class="dealer-chip">D</div>

            <div v-if="(allInHand = game.allInHands.find(h => h.playerId === player._id))" class="hand flipped-hand">
                <div class="card" :style="`background-image: url('/images/cards/${allInHand.hand[0]}.svg');`" />
                <div class="card" :style="`background-image: url('/images/cards/${allInHand.hand[1]}.svg');`" />
            </div>
            <div v-else-if="!isShowingWinners && !isDealing && player.hand" class="hand">
                <div class="card-back" />
                <div class="card-back" />
            </div>
            <div
                v-else-if="isShowingWinners && (winner = game.winners.find(w => w.playerId === player._id))"
                class="hand flipped-hand"
            >
                <div class="card" :style="`background-image: url('/images/cards/${winner.hand[0]}.svg');`" />
                <div class="card" :style="`background-image: url('/images/cards/${winner.hand[1]}.svg');`" />
            </div>

            <div v-if="game.bets.find(b => b.playerId === player._id) && !isShowingWinners" class="current-bet">
                ${{ game.bets.find(b => b.playerId === player._id).amount }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        game: Object,
        isShowingWinners: Boolean,
        isDealing: Boolean
    }
}
</script>

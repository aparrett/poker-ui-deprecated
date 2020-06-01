<template>
    <div>
        <div
            v-for="(player, index) in game.winners"
            :key="index"
            :class="`winner-pot winner-animation-${game.players.findIndex(p => p._id === player.playerId)}`"
            :style="`animation-delay: ${index * winnerAnimationDelay}s;`"
        >
            ${{ player.amount }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        game: Object,
        winnerAnimationDelay: Number
    }
}
</script>

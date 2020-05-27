<template>
    <div>
        <div
            v-for="(player, index) in players"
            :key="'deal-card-0-' + player._id"
            :class="`deal-card card-back deal-animation-${index}-0`"
            :style="`animation-delay: ${index * dealAnimationDelay}s;`"
        />

        <div
            v-for="(player, index) in players"
            :key="'deal-card-1-' + player._id"
            :class="`deal-card card-back deal-animation-${index}-1`"
            :style="
                `animation-delay: ${(players.length - 1) * dealAnimationDelay + (index + 1) * dealAnimationDelay}s;`
            "
        />
    </div>
</template>

<script>
export default {
    props: {
        players: Array,
        dealAnimationDelay: Number
    }
}
</script>

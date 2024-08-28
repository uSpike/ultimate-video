<script lang="ts">
    export let stats;
    export let name;
    export let gender;
</script>

{#if stats}
    <td>{name}</td>
    <td>{gender}</td>
    <td>{stats.timePlayed}</td>
    <td>{stats.pointsPlayed}</td>
    <td>{stats.touchLook}</td>
    <td>{stats.pointsWithTouchLook}</td>
    <td>{Math.floor((stats.pointsWithTouchLook / stats.pointsPlayed) * 100)}</td>
    <td>{stats.offenseTouches}</td>
    <td></td>
    <td>{stats.oPointsPlayed}</td>
    <td>{stats.dPointsPlayed}</td>
    <td>{stats.oPointsWon}</td>
    <td>{stats.dPointsWon}</td>
    <td>{stats.oPointsWon + stats.dPointsWon}</td>
    <td>{Math.floor((stats.oPointsWon / stats.oPointsPlayed) * 100)}</td>
    <td>{Math.floor((stats.dPointsWon / stats.dPointsPlayed) * 100)}</td>
    <td>{Math.floor((stats.totalPointsWon / stats.pointsPlayed) * 100)}</td>
    <td>{stats.possessions}</td>
    <td>{stats.oPointsPossessions}</td>
    <td>{stats.dPointsPossessions}</td>
    <td>{stats.oEfficiency}</td>
    <td>{stats.oPtEfficiencyPct}</td>
    <td>{stats.dPtEfficiencyPct}</td>
    <td>{stats.hockey}</td>
    <td>{stats.assists}</td>
    <td>{stats.goals}</td>
    <td>{stats.plusMinus}</td>
    <td></td>
    <td>{stats.blocks}</td>
    <td></td>
    <td>{stats.possessions}</td>
    <td>{stats.timeWithDisc}</td>
    <td>{(stats.timeWithDisc / stats.possessions).toFixed(1)}</td>
{/if}

<style>
    td {
        text-align: center;
        padding: 2px;
    }
</style>

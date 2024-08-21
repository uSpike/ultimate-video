<script lang="ts">
    import StatTableRow from './statTableRow.svelte';

    import { getPlayerStats, getLineStats, getGenderStats } from '$lib/stats.js';
    import type { Game, Player, Line } from '$lib/stats.ts';

    export let games: Game[];
    export let players: Player[];
    export let lines: Line[];

    let playerStats = getPlayerStats(players, games);
    let lineStats = getLineStats(lines, games);
    let genderStats = getGenderStats(players, games);
</script>

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Match</th>
            <th>Time Played</th>
            <th>Points Played</th>
            <th>Touch-Look</th>
            <th>Points with Touch-Look</th>
            <th>Points with Touch-Look %</th>
            <th>Offense touches</th>
            <th>Usage %</th>
            <th>O Points Played</th>
            <th>D Points Played</th>
            <th>O Points Won</th>
            <th>D Points Won</th>
            <th>Total Points Won</th>
            <th>O Win %</th>
            <th>D Win %</th>
            <th>Point Win %</th>
            <th># Possessions</th>
            <th># O Points Possessions</th>
            <th># D Points Possessions</th>
            <th>O Efficiency</th>
            <th>O Pt. Efficiency %</th>
            <th>D Pt. Efficiency %</th>
            <th>Hockey</th>
            <th>Assists</th>
            <th>Goals</th>
            <th>+/- Points</th>
            <th>+/- Touch-Look</th>
            <th>Blocks</th>
            <th>Pressured</th>
        </tr>
    </thead>
    <tbody>
        {#each players as player}
            {@const stats = playerStats[player.id]}
            <tr>
                <StatTableRow stats={playerStats[player.id]} name={player.name} gender={player.genderMatch} />
            </tr>
        {/each}
        {#each lines as line}
            <tr style="background-color: yellow">
                <StatTableRow stats={lineStats[line.id]} name={line.name} gender="" />
            </tr>
        {/each}
        <tr style="background-color: aqua">
            <StatTableRow stats={genderStats['mmp']} name="MMP" gender="mmp" />
        </tr>
        <tr style="background-color: pink">
            <StatTableRow stats={genderStats['fmp']} name="FMP" gender="fmp" />
        </tr>
    </tbody>
</table>

<style>
    table {
        border-collapse: collapse;
        width: 100%;
    }

    thead {
        background-color: #f0f0f0;
    }

    th {
        text-align: center;
        padding: 2px;
    }

    tr {
        border: 1px solid #f0f0f0;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
</style>

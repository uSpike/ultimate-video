<script lang="ts">
    import { base } from '$app/paths';
    import { sumObjectsByKey, calculateStats } from '$lib/stats.js';
    import StatTable from './statTable.svelte';

    export let data;

    let playerStats = data.tournament.players.reduce<{ [key: number]: ReturnType<typeof calculateStats> }>(
        (acc, player) => {
            acc[player.id] = calculateStats(data.games, null, null, player.id);
            return acc;
        },
        {},
    );

    let genderStats = data.tournament.players.reduce<{ [key: string]: ReturnType<typeof calculateStats> }>(
        (acc, player) => {
            const playerStat = calculateStats(data.games, null, null, player.id);
            acc[player.genderMatch] = sumObjectsByKey(acc[player.genderMatch], playerStat);
            return acc;
        },
        {},
    );

    let lineStats = data.lines.reduce<{ [key: number]: ReturnType<typeof calculateStats> }>((acc, line) => {
        for (const player of line.primaryPlayers) {
            const playerStat = calculateStats(data.games, line.id, null, player.id);
            acc[line.id] = sumObjectsByKey(acc[line.id], playerStat);
        }
        return acc;
    }, {});
</script>

<a href="{base}/">Home</a> &gt;
<a href="{base}/tournament">Tournaments</a>

<h1>{data.tournament.name}</h1>

<h2>Games</h2>
<ul>
    {#each data.games as game}
        <li>
            <a href="{base}/tournament/{data.tournament.id}/game/{game.id}">{game.opponent}</a>
        </li>
    {/each}
</ul>

<form method="POST" action="?/addGame">
    <input type="text" name="opponent" placeholder="Opponent" />
    <input type="date" name="date" placeholder="Date" />
    <input type="text" name="videoFile" placeholder="Video File" />
    <input type="text" name="tournamentId" value={data.tournament.id} hidden />
    <button type="submit">Add Game</button>
</form>

<h2>Players</h2>
<ul>
    {#each data.players as player}
        {@const added = !!data.tournament.players.find((p) => p.id === player.id)}
        <li>
            <form method="POST">
                <input type="text" name="playerId" value={player.id} hidden />
                <input type="text" name="tournamentId" value={data.tournament.id} hidden />
                {#if added}
                    <span><b>{player.name}</b></span>
                {:else}
                    <span>{player.name}</span>
                {/if}
                <button formaction="?/addPlayer" disabled={added}>Add</button>
                <button formaction="?/removePlayer" disabled={!added}>Remove</button>
            </form>
        </li>
    {/each}
</ul>

<h2>Lines</h2>
<ul>
    {#each data.lines as line}
        <li><a href="{base}/tournament}/{data.tournament.id}/line/{line.id}">{line.name}</a></li>
        <ul>
            {#each data.tournament.players as player}
                {@const added = !!line.primaryPlayers.find((p) => p.id === player.id)}
                <li>
                    <form method="POST">
                        <input type="text" name="lineId" value={line.id} hidden />
                        <input type="text" name="playerId" value={player.id} hidden />
                        {#if added}
                            <span><b>{player.name}</b></span>
                        {:else}
                            <span>{player.name}</span>
                        {/if}
                        <button formaction="?/addPlayerToLine" disabled={added}>Add</button>
                        <button formaction="?/removePlayerFromLine" disabled={!added}>Remove</button>
                    </form>
                </li>
            {/each}
        </ul>
    {/each}
</ul>

<form method="POST" action="?/addLine">
    <input type="text" name="name" placeholder="Name" />
    <input type="text" name="tournamentId" value={data.tournament.id} hidden />
    <button type="submit">Add Line</button>
</form>

<h2>Stats</h2>

<table>
    <thead>
        <tr>
            <th>Player</th>
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
        {#each data.tournament.players as player}
            <tr>
                <StatTable stats={playerStats[player.id]} name={player.name} gender={player.genderMatch} />
            </tr>
        {/each}
        {#each data.tournament.lines as line}
        <tr style="background-color: yellow">
            <StatTable stats={lineStats[line.id]} name={line.name} gender="" />
        </tr>
        {/each}
        <tr style="background-color: aqua">
            <StatTable stats={genderStats["mmp"]} name="MMP" gender="mmp" />
        </tr>
        <tr style="background-color: pink">
            <StatTable stats={genderStats["fmp"]} name="FMP" gender="fmp" />
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

    th,
    td {
        text-align: center;
        padding: 2px;
    }

    tr {
        border: 1px solid #f0f0f0;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    td {
        text-align: center;
    }
</style>

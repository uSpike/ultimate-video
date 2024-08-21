<script lang="ts">
    import { base } from '$app/paths';
    import { calculateStats } from '$lib/stats.js';

    export let data;

    let playerStats = data.tournament.players.reduce<{ [key: number]: ReturnType<typeof calculateStats> }>(
        (acc, player) => {
            acc[player.id] = calculateStats(data.games, null, null, player.id);
            return acc;
        },
        {},
    );
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
            {@const stats = playerStats[player.id]}
            <tr>
                <td>{player.name}</td>
                <td>{player.genderMatch}</td>
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
            </tr>
        {/each}
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

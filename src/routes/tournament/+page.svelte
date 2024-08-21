<script lang="ts">
    import { base } from '$app/paths';

    export let data;

    import { calculateStats } from '$lib/stats.js';

    let playerStats = data.players.reduce<{ [key: number]: ReturnType<typeof calculateStats> }>((acc, player) => {
        acc[player.id] = calculateStats(data.games, null, null, player.id);
        return acc;
    }, {});
</script>

<a href="{base}/">Home</a>

<h1>Tournaments</h1>

<ul>
    {#each data.tournaments as tournament}
        <li>
            <form method="POST" action="?/deleteTournament">
                <input type="text" name="tournamentId" value={tournament.id} hidden />
                <a href="{base}/tournament/{tournament.id}">{tournament.name}</a>
                <button type="submit">Remove</button>
            </form>
        </li>
    {/each}
</ul>

<h2>Create Tournament</h2>

<form action="?/addTournament" method="POST">
    <input type="text" name="name" placeholder="Name" />
    <input type="submit" value="Create" />
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
        {#each data.players as player}
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

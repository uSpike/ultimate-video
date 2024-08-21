<script lang="ts">
    import { base } from '$app/paths';
    import StatTable from './[tournamentId]/statTable.svelte';

    export let data;

    import { sumObjectsByKey, calculateStats } from '$lib/stats.js';

    let playerStats = data.players.reduce<{ [key: number]: ReturnType<typeof calculateStats> }>((acc, player) => {
        acc[player.id] = calculateStats(data.games, null, null, player.id);
        return acc;
    }, {});

    let genderStats = data.players.reduce<{ [key: string]: ReturnType<typeof calculateStats> }>(
        (acc, player) => {
            const playerStat = calculateStats(data.games, null, null, player.id);
            acc[player.genderMatch] = sumObjectsByKey(acc[player.genderMatch], playerStat);
            return acc;
        },
        {},
    );

    let lineStats = data.tournaments.reduce<{ [key: number]: ReturnType<typeof calculateStats> }>((acc, tournament) => {
        for (const line of tournament.lines) {
            for (const player of line.primaryPlayers) {
                const playerStat = calculateStats(data.games, null, line.id, player.id);
                acc[line.id] = sumObjectsByKey(acc[line.id], playerStat);
            }
        }
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
        {#each data.players as player}
            {@const stats = playerStats[player.id]}
            <tr>
                <StatTable stats={playerStats[player.id]} name={player.name} gender={player.genderMatch} />
            </tr>
        {/each}
        {#each data.tournaments as tournament}
            {#each tournament.lines as line}
                <tr style="background-color: yellow">
                    <StatTable stats={lineStats[line.id]} name={line.name} gender="" />
                </tr>
            {/each}
        {/each}
        <tr style="background-color: aqua">
            <StatTable stats={genderStats["mmp"]} name="MMP" gender="mmp" />
        </tr>
        <tr style="background-color: pink">
            <StatTable stats={genderStats["fmp"]} name="FMP" gender="fmp" />
        </tr>
    </tbody>
</table>

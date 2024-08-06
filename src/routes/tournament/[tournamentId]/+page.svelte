<script>
    import { invalidateAll } from '$app/navigation';
    import { calculateStats } from '$lib/stats.js';

    /** @type {import('./$types').PageServerLoad} */
    export let data;

    async function addGame(event) {
        const formData = new FormData(event.currentTarget);
        await handleFetch(`?/addGame`, formData);
    }

    async function addLine(event) {
        const formData = new FormData(event.currentTarget);
        await handleFetch(`?/addLine`, formData);
    }

    async function addPlayerToLine(event) {
        const formData = new FormData(event.currentTarget);
        await handleFetch(`?/addPlayerToLine`, formData);
    }

    async function removePlayerFromLine(event) {
        const formData = new FormData(event.currentTarget);
        await handleFetch(`?/removePlayerFromLine`, formData);
    }

    async function addPlayer(event) {
        const formData = new FormData(event.currentTarget);
        await handleFetch(`?/addPlayer`, formData);
    }

    async function newPlayer(event) {
        const formData = new FormData(event.currentTarget);
        await handleFetch(`?/newPlayer`, formData);
    }

    async function handleFetch(url, formData) {
        let response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            invalidateAll();
            return response.json();
        } else {
            let js = await response.json();
            if (js.error) alert(js.error?.message);
        }
    }

    let playerStats = {};
    for (let player of data.tournament.players) {
        playerStats[player.id] = calculateStats(data.games, null, null, player.id);
    }
</script>

<h1>{data.tournament.name}</h1>

<h2>Games</h2>
<ul>
    {#each data.games as game}
        <li>
            <a href="{data.tournament.id}/game/{game.id}">{game.opponent}</a>
        </li>
    {/each}
</ul>

<form method="POST" on:submit|preventDefault={addGame}>
    <input type="text" name="opponent" placeholder="Opponent" />
    <input type="date" name="date" placeholder="Date" />
    <input type="text" name="videoFile" placeholder="Video File" />
    <input type="text" name="tournamentId" value={data.tournament.id} hidden />
    <button type="submit">Add Game</button>
</form>

<h2>Lines</h2>
<ul>
    {#each data.lines as line}
        <li><a href="{data.tournament.id}/line/{line.id}">{line.name}</a></li>
        <ul>
            {#each line.primaryPlayers as player}
                <li>
                    <form method="POST" on:submit|preventDefault={removePlayerFromLine}>
                        <input type="text" name="lineId" value={line.id} hidden />
                        <input type="text" name="playerId" value={player.id} hidden />
                        <span>{player.name}</span>
                        <button type="submit">Remove</button>
                    </form>
                </li>
            {/each}
        </ul>
    {/each}
</ul>

<form method="POST" on:submit|preventDefault={addLine}>
    <input type="text" name="name" placeholder="Name" />
    <input type="text" name="tournamentId" value={data.tournament.id} hidden />
    <button type="submit">Add Line</button>
</form>

<form method="POST" on:submit|preventDefault={addPlayerToLine}>
    <select name="lineId">
        {#each data.lines as line}
            <option value={line.id}>{line.name}</option>
        {/each}
    </select>
    <select name="playerId">
        {#each data.tournament.players as player}
            <option value={player.id}>{player.name}</option>
        {/each}
    </select>
    <input type="text" name="tournamentId" value={data.tournament.id} hidden />
    <button type="submit">Add Player</button>
</form>

<h2>Players</h2>
<ul>
    {#each data.tournament.players as player}
        <li><a href="{data.tournament.id}/player/{player.id}">{player.name}</a></li>
    {/each}
</ul>

{#if data.players.length != data.tournament.players.length}
    <form method="POST" on:submit|preventDefault={addPlayer}>
        <select name="players">
            {#each data.players as player}
                {#if !data.tournament.players.find((p) => p.id === player.id)}
                    <option value={player.id}>{player.name}</option>
                {/if}
            {/each}
        </select>
        <input type="text" name="tournamentId" value={data.tournament.id} hidden />
        <button type="submit">Add Player</button>
    </form>
{/if}

<form method="POST" on:submit|preventDefault={newPlayer}>
    <input type="text" name="name" placeholder="Name" />
    <select name="genderMatch">
        <option value="fmp">FMP</option>
        <option value="mmp">MMP</option>
    </select>
    <input type="text" name="tournamentId" value={data.tournament.id} hidden />
    <button type="submit">New Player</button>
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

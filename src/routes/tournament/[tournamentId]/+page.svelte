<script lang="ts">
    import { base } from '$app/paths';

    import StatTable from './statTable.svelte';

    export let data;

    function getTimeFormattedLink(gameId: number, time: number) {
        let text = new Date(time * 1000).toISOString().slice(11, 19);
        return `<a href="${base}/tournament/${data.tournament.id}/game/${gameId}?time=${time}">${text}</a>`;
    }
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

<h2>Highlights</h2>
<ul>
    {#each data.games as game}
        {#each game.points as point}
            {#each point.actions as action}
                {#if action.type.type === 'Highlight'}
                    <li>
                        {game.opponent}: {@html getTimeFormattedLink(game.id, action.time)}
                        {#if action.primaryPlayer}
                            - {action.primaryPlayer.name}
                        {/if}
                        {#if action.secondaryPlayer}
                            - {action.secondaryPlayer.name}
                        {/if}
                        {#if action.comment}
                            - {action.comment}
                        {/if}
                    </li>
                {/if}
            {/each}
        {/each}
    {/each}
</ul>

<h2>Stats</h2>

{#if data.games.length > 0}
    <StatTable games={data.games} players={data.tournament.players} lines={data.lines} />
{/if}

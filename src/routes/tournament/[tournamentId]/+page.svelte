<script lang="ts">
    import { enhance } from '$app/forms';
    import { base } from '$app/paths';

    import { confirmForm, handleSubmitErrors } from '$lib/form';

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

<form method="POST" action="?/addGame" use:enhance={handleSubmitErrors}>
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
            {#if added}
                <form method="POST" action="?/removePlayer" use:enhance={handleSubmitErrors}>
                    <input type="text" name="playerId" value={player.id} hidden />
                    <input type="text" name="tournamentId" value={data.tournament.id} hidden />
                    <span><b>{player.name}</b></span>
                    <button
                        type="submit"
                        on:click={confirmForm(`Are you sure you want to delete the player ${player.name}?`)}
                        >Remove</button
                    >
                </form>
            {:else}
                <form method="POST" action="?/addPlayer" style="display:inline" use:enhance={handleSubmitErrors}>
                    <input type="text" name="playerId" value={player.id} hidden />
                    <input type="text" name="tournamentId" value={data.tournament.id} hidden />
                    <span>{player.name}</span>
                    <button type="submit">Add</button>
                </form>
            {/if}
        </li>
    {/each}
</ul>

<h2>Lines</h2>

<form method="POST" action="?/addLine" use:enhance={handleSubmitErrors}>
    <input type="text" name="name" placeholder="Name" />
    <input type="text" name="tournamentId" value={data.tournament.id} hidden />
    <button type="submit">Add Line</button>
</form>

<ul style="list-style: none; display: inline-flex">
    {#each data.lines as line}
        <li style="margin-right: 10px">
            <a href="{base}/tournament}/{data.tournament.id}/line/{line.id}">{line.name}</a>
            <form method="POST" action="?/removeLine" style="display: inline" use:enhance={handleSubmitErrors}>
                <input type="text" name="lineId" value={line.id} hidden />
                <button on:click={confirmForm(`Are you sure you want to delete the line ${line.name}?`)}>Delete</button>
            </form>
            <ul>
                {#each data.tournament.players as player}
                    {@const added = !!line.primaryPlayers.find((p) => p.id === player.id)}
                    <li>
                        {#if added}
                            <form method="POST" action="?/removePlayerFromLine" use:enhance={handleSubmitErrors}>
                                <input type="text" name="lineId" value={line.id} hidden />
                                <input type="text" name="playerId" value={player.id} hidden />
                                <span><b>{player.name}</b></span>
                                <button type="submit">Remove</button>
                            </form>
                        {:else}
                            <form method="POST" action="?/addPlayerToLine" use:enhance={handleSubmitErrors}>
                                <input type="text" name="lineId" value={line.id} hidden />
                                <input type="text" name="playerId" value={player.id} hidden />
                                <span>{player.name}</span>
                                <button type="submit">Add</button>
                            </form>
                        {/if}
                    </li>
                {/each}
            </ul>
        </li>
    {/each}
</ul>

<h2 id="highlights">Highlights</h2>
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

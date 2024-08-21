<script lang="ts">
    import { base } from '$app/paths';

    export let data;
</script>

<a href="{base}/">Home</a> &gt;
<a href="{base}/tournament">Tournaments</a> &gt;
<a href="{base}/tournament/{data.tournament.id}">{data.tournament.name}</a>

<h1>{data.line.name}</h1>
<span>{data.tournament.name}</span>

<h2>Players</h2>
<ul>
    {#each data.line.primaryPlayers as player}
        <li>{player.name}</li>
    {/each}
</ul>

<h2>Games</h2>
<ul>
    {#each data.tournament.games as game}
        <li>{game.opponent}</li>
    {/each}
</ul>

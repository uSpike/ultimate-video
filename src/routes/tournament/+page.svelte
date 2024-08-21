<script lang="ts">
    import { base } from '$app/paths';
    import StatTable from './[tournamentId]/statTable.svelte';

    export let data;
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
{#if data.games.length > 0}
    <StatTable games={data.games} players={data.players} lines={data.tournaments.flatMap((t) => t.lines)} />
{/if}

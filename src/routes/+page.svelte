<script lang="ts">
    import { base } from '$app/paths';
    import { enhance } from '$app/forms';

    import { confirmForm, handleSubmitErrors } from '$lib/form';

    export let data;
</script>

<h1><a href="{base}/tournament">Tournaments</a></h1>
<h1><a href="{base}/action">Actions</a></h1>

<h1>Roster</h1>

<ul>
    {#each data.players as player}
        <li>
            <form method="POST" action="?/removePlayer" use:enhance={handleSubmitErrors}>
                <input type="text" name="playerId" value={player.id} hidden />
                <span>{player.name}</span>
                <button type="submit" on:click={confirmForm(`Are you sure you want to remove ${player.name}`)}
                    >Remove</button
                >
            </form>
        </li>
    {/each}
</ul>

<form method="POST" action="?/newPlayer" use:enhance={handleSubmitErrors}>
    <input type="text" name="name" placeholder="Name" />
    <select name="genderMatch">
        <option value="fmp">FMP</option>
        <option value="mmp">MMP</option>
    </select>
    <button type="submit">New Player</button>
</form>

<script lang="ts">
    import { base } from '$app/paths';

    export let data;
</script>

<h1><a href="{base}/tournament">Tournaments</a></h1>
<h1><a href="{base}/action">Actions</a></h1>

<h1>Roster</h1>

<ul>
    {#each data.players as player}
        <li>
            <span>{player.name}</span>
        </li>
    {/each}
</ul>

<form method="POST" action="?/newPlayer">
    <input type="text" name="name" placeholder="Name" />
    <select name="genderMatch">
        <option value="fmp">FMP</option>
        <option value="mmp">MMP</option>
    </select>
    <button type="submit">New Player</button>
</form>

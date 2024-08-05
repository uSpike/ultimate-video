<script>
	export let data;
</script>

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

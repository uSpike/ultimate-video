<script>
	import { invalidateAll } from '$app/navigation';

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
			body: formData
		});

		if (response.ok) {
			invalidateAll();
			return response.json();
		} else {
			let js = await response.json();
			if (js.error) alert(js.error?.message);
		}
	}
	let selectedLine;
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
		<li>{line.name}</li>
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

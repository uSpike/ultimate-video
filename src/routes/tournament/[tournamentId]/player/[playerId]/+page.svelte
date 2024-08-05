<script>
	/** @type {import('./$types').PageServerLoad} */
	export let data;

	function timeToString(time) {
		return new Date(time * 1000).toISOString().slice(11, 19);
	}

	function filterActions(games, actionCall) {
		return games.flatMap((game) =>
			game.points.flatMap((point) => point.actions.filter(actionCall))
		);
	}

	let filterThrows = (action) =>
		action.type == 'Completion' && action.primaryPlayer.id == data.player.id;
	let filterCatches = (action) =>
		action.type == 'Completion' && action.secondaryPlayer.id == data.player.id;
	let filterDrops = (action) => action.type == 'Drop' && action.primaryPlayer?.id == data.player.id;
	let filterTurnovers = (action) =>
		action.type == 'Turnover' && action.primaryPlayer?.id == data.player.id;
	let filterDefended = (action) =>
		action.type == 'Defended' && action.primaryPlayer?.id == data.player.id;

	let throws = filterActions(data.tournament.games, filterThrows);
	let catches = filterActions(data.tournament.games, filterCatches);
	let drops = filterActions(data.tournament.games, filterDrops);
	let turnovers = filterActions(data.tournament.games, filterTurnovers);
	let defended = filterActions(data.tournament.games, filterDefended);
</script>

<h1>{data.player.name} at {data.tournament.name}</h1>

<h2>Stats</h2>

<ul>
	<li>Completed throws: {throws.length}</li>
	<li>Completed catches: {catches.length}</li>
	<li>Drops: {drops.length}</li>
	<li>Turnovers: {turnovers.length}</li>
	<li>Defended: {defended.length}</li>
</ul>

<h2>Games</h2>

{#each data.tournament.games as game}
	<h3><a href="/tournament/{data.tournament.id}/game/{game.id}">{game.opponent}</a></h3>
	<h4>Stats</h4>
	<ul>
		<li>Completed throws: {filterActions([game], filterThrows).length}</li>
		<li>Completed catches: {filterActions([game], filterCatches).length}</li>
		<li>Drops: {filterActions([game], filterDrops).length}</li>
		<li>Turnovers: {filterActions([game], filterTurnovers).length}</li>
		<li>Defended: {filterActions([game], filterDefended).length}</li>
	</ul>
	<h4>Points</h4>
	<ul>
		{#each game.points as point}
			<li>
				<a href="/{data.tournament.id}/{game.id}?time={point.startTime}">
					Point: {timeToString(point.startTime)} - {timeToString(point.endTime)}
				</a>
				<ul>
					{#each point.actions as action}
						{#if action.type == 'Completion'}
							{#if data.player.id == action.primaryPlayer.id}
								<li>
									<a href="../game/{game.id}?time={action.time - 5}"
										>Completion to {action.secondaryPlayer.name}</a
									>
								</li>
							{:else}
								<li>
									<a href="../game/{game.id}?time={action.time - 5}"
										>Completion from {action.primaryPlayer.name}</a
									>
								</li>
							{/if}
						{:else if action.type == 'Turnover'}
							<li><mark><a href="../game/{game.id}?time={action.time - 5}">Turnover</a></mark></li>
						{:else if action.type == 'Goal'}
							{#if data.player.id == action.primaryPlayer.id}
								<li>
									<a href="../game/{game.id}?time={action.time - 5}"
										>Goal from {action.secondaryPlayer.name}</a
									>
								</li>
							{:else}
								<li>
									<a href="../game/{game.id}?time={action.time - 5}"
										>Assist to {action.primaryPlayer.name}</a
									>
								</li>
							{/if}
						{:else if action.type == 'Defended'}
							<li><a href="../game/{game.id}?time={action.time - 5}">Defended</a></li>
						{/if}
					{/each}
				</ul>
			</li>
		{/each}
	</ul>
{/each}

<style>
	label {
		display: inline-block;
		padding: 10px 20px;
		margin: 5px;
		background-color: #f0f0f0;
		color: black;
		border: 2px solid #ccc;
		border-radius: 5px;
		cursor: pointer;
	}

	input[type='radio'] {
		display: none; /* Hide the checkbox */
	}

	input[type='radio']:checked + label {
		background-color: #4caf50; /* Green background when checked */
		color: white; /* White text when checked */
	}
</style>

<script>
	import '$lib/buttons.css';

	export let players = [];
	export let selectedPrimaryPlayer;
	export let selectedSecondaryPlayer;
	export let selectedNote;
	export let selectedComment;

	export let primaryPlayerLabel = null;
	export let secondaryPlayerLabel = null;
	export let noteLabels = [];
</script>

{#if primaryPlayerLabel}
	<p>{primaryPlayerLabel}</p>
	<form>
		{#each players as player}
			<input
				type="radio"
				value={player.id}
				id={`primary ${player.name}`}
				bind:group={selectedPrimaryPlayer}
			/>
			<label for={`primary ${player.name}`}>{player.name}</label>
		{/each}
	</form>
	{#if secondaryPlayerLabel}
		<p>{secondaryPlayerLabel}</p>
		<form>
			{#each players as player}
				<input
					type="radio"
					value={player.id}
					id={`secondary ${player.name}`}
					bind:group={selectedSecondaryPlayer}
					disabled={selectedPrimaryPlayer === player.id}
				/>
				<label for={`secondary ${player.name}`}>{player.name}</label>
			{/each}
		</form>
	{/if}
{/if}
<hr />
{#if noteLabels.length > 0}
	<form>
		{#each noteLabels as note}
			<input type="radio" value={note} id={note} bind:group={selectedNote} />
			<label for={note}>{note}</label>
		{/each}
	</form>
{/if}
<form>
	<input type="text" placeholder="Comments" bind:value={selectedComment} />
</form>

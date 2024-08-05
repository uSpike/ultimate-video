<script>
	import '$lib/buttons.css';

	import { onMount } from 'svelte';

	export let players = [];
	export let selectedPrimaryPlayer;
	export let selectedSecondaryPlayer;
	export let selectedNote;
	export let selectedComment;

	export let primaryPlayerLabel = null;
	export let secondaryPlayerLabel = null;
	export let noteLabels = [];

	class ShortcutManager {
		constructor() {
			// key -> callback
			this.keys = new Map();
			// text -> key
			this.text = new Map();
		}

		clear() {
			this.keys.clear();
			this.text.clear();
		}

		addShortcut(text, callback) {
			text = text.trim().toLowerCase();
			for (let i = 0; i < text.length; i++) {
				let key = text[i];
				if (key === ' ') {
					continue;
				}
				if (!this.keys.has(key)) {
					this.keys.set(key, callback);
					this.text.set(text, key);
					return key;
				}
			}
		}

		makeShortcutText(text) {
			text = text.trim().toLowerCase();
			let key = this.text.get(text);
			if (!key) return text;
			let index = text.indexOf(key);
			return `${text.slice(0, index)}<u>${key}</u>${text.slice(index + 1)}`;
		}

		onKeyDown(event) {
			let key = event.key.toLowerCase();

			if (this.keys.has(key)) {
				let callback = this.keys.get(key);
				callback();
			}
		}
	}

	let shortcuts = new ShortcutManager();

	onMount(() => {
		shortcuts.clear();
		players.forEach((player) => {
			shortcuts.addShortcut(player.name, () => handlePlayerShortcut(player.id));
		});
		noteLabels.forEach((note) => {
			shortcuts.addShortcut(note, () => (selectedNote = note));
		});
	});
</script>

<svelte:window on:keydown={shortcuts.onKeyDown} />

{#if primaryPlayerLabel}
	<div style="clear: both">
		<span>{primaryPlayerLabel}</span>
		<form>
			{#each players as player}
				<input
					type="radio"
					value={player.id}
					id={`primary ${player.name}`}
					bind:group={selectedPrimaryPlayer}
				/>
				<label for={`primary ${player.name}`}>{@html shortcuts.makeShortcutText(player.name)}</label
				>
			{/each}
		</form>
	</div>
	{#if secondaryPlayerLabel}
		<div style="clear: both">
			<span>{secondaryPlayerLabel}</span>
			<form>
				{#each players as player}
					<input
						type="radio"
						value={player.id}
						id={`secondary ${player.name}`}
						bind:group={selectedSecondaryPlayer}
						disabled={selectedPrimaryPlayer === player.id}
					/>
					<label for={`secondary ${player.name}`}
						>{@html shortcuts.makeShortcutText(player.name)}</label
					>
				{/each}
			</form>
		</div>
	{/if}
{/if}

{#if noteLabels.length > 0}
	<div style="clear: both">
		<span>Note</span>
		<form>
			{#each noteLabels as note}
				<input type="radio" value={note} id={note} bind:group={selectedNote} />
				<label for={note}>{@html shortcuts.makeShortcutText(note)}</label>
			{/each}
		</form>
	</div>
{/if}
<form>
	<input type="text" placeholder="Comments" bind:value={selectedComment} />
</form>

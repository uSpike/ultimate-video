<script lang="ts">
    import '$lib/buttons.css';

    import { onMount } from 'svelte';
    import type { PageData } from './$types';

    type Player = PageData['tournament']['players'][number];

    export let players: Player[] = [];
    export let selectedPrimaryPlayer: Player | null = null;
    export let selectedSecondaryPlayer: Player | null = null;
    export let selectedNotes: PageData['actionTypes'][number]['notes'] = [];
    export let selectedComment: string | null;

    export let actionType: PageData['actionTypes'][number];

    class ShortcutManager {
        private keys: Map<string, () => void>;
        private text: Map<string, string>;

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
    });
</script>

<svelte:window on:keydown={shortcuts.onKeyDown} />

{#if actionType.requirePrimaryPlayer !== 'false'}
    <div style="clear: both">
        <span>{actionType.primaryPlayerLabel}</span>
        <form>
            {#each players as player}
                <input
                    type="radio"
                    value={player}
                    id={`primary ${player.name}`}
                    bind:group={selectedPrimaryPlayer}
                />
                <label for={`primary ${player.name}`}>{@html shortcuts.makeShortcutText(player.name)}</label>
            {/each}
        </form>
    </div>
    {#if actionType.requireSecondaryPlayer !== 'false'}
        <div style="clear: both">
            <span>{actionType.secondaryPlayerLabel}</span>
            <form>
                {#each players as player}
                    <input
                        type="radio"
                        value={player}
                        id={`secondary ${player.name}`}
                        bind:group={selectedSecondaryPlayer}
                        disabled={selectedPrimaryPlayer.id === player.id}
                    />
                    <label for={`secondary ${player.name}`}>{@html shortcuts.makeShortcutText(player.name)}</label>
                {/each}
            </form>
        </div>
    {/if}
{/if}

{#if actionType.notes.length > 0}
    <div style="clear: both">
        <span>Note</span>
        <form>
            {#each actionType.notes as note}
                <input type="checkbox" value={note} id={note.name} bind:group={selectedNotes} />
                <label for={note.name}>{note.name}</label>
            {/each}
        </form>
    </div>
{/if}
<form>
    <input type="text" placeholder="Comments" bind:value={selectedComment} />
</form>

<script lang="ts">
    import '$lib/buttons.css';

    import type { PageData } from './$types';

    type Player = PageData['tournament']['players'][number];

    export let allPlayers: Player[] = [];
    export let pointPlayers: Player[] = [];
    export let selectedPrimaryPlayer: Player | null = null;
    export let selectedSecondaryPlayer: Player | null = null;
    export let selectedNotes: PageData['actionTypes'][number]['notes'] = [];
    export let selectedComment: string | null;

    export let actionType: PageData['actionTypes'][number];

    let secondaryPlayerList: Player[] = pointPlayers;
    $: if (actionType.type === 'Injury') {
        secondaryPlayerList = allPlayers;
    } else {
        secondaryPlayerList = pointPlayers;
    }
</script>

{#if actionType.requirePrimaryPlayer !== 'false'}
    <div style="clear: both">
        <span>{actionType.primaryPlayerLabel}</span>
        <form>
            {#each pointPlayers as player}
                <input type="radio" value={player} id={`primary ${player.name}`} bind:group={selectedPrimaryPlayer} />
                <label for={`primary ${player.name}`}>{player.name}</label>
            {/each}
        </form>
    </div>
    {#if actionType.requireSecondaryPlayer !== 'false'}
        <div style="clear: both">
            <span>{actionType.secondaryPlayerLabel}</span>
            <form>
                {#each secondaryPlayerList as player}
                    <input
                        type="radio"
                        value={player}
                        id={`secondary ${player.name}`}
                        bind:group={selectedSecondaryPlayer}
                        disabled={selectedPrimaryPlayer?.id === player.id}
                    />
                    <label for={`secondary ${player.name}`}>{player.name}</label>
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

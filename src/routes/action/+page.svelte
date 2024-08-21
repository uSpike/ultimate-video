<script lang="ts">
    export let data;

    let requirePrimaryPlayer: string = 'false';
    let requireSecondaryPlayer: string = 'false';
</script>

<a href="/">Home</a>

<h1>Actions</h1>
{#each data.actionTypes as actionType}
    <h3>{actionType.type}</h3>
    <ul>
        <li>Description: {actionType.description}</li>
        {#if actionType.requirePrimaryPlayer != 'false'}
            <li>Primary player label: <b>{actionType.primaryPlayerLabel}</b></li>
        {/if}
        {#if actionType.requireSecondaryPlayer != 'false'}
            <li>Secondary player label: <b>{actionType.secondaryPlayerLabel}</b></li>
        {/if}
        <li>Required state: <b>{actionType.requireState}</b></li>
        <li>
            <form action="?/removeActionType" method="POST">
                <input type="hidden" name="id" value={actionType.id} />
                <input type="submit" value="Delete" />
            </form>
        </li>
        <li>
            Notes
            <ul>
                {#each actionType.notes as note}
                    <li>
                        <form action="?/removeActionNoteType" method="POST">
                            <input type="hidden" name="id" value={note.id} />
                            <span><b>{note.name}</b>: {note.description}</span>
                            <input type="submit" value="Delete" />
                        </form>
                    </li>
                {/each}
            </ul>
            <form action="?/addActionNoteType" method="POST">
                <input type="hidden" name="typeId" value={actionType.id} />
                <input type="text" name="name" placeholder="Name" />
                <input type="text" name="description" placeholder="Description" />
                <input type="submit" value="Add note type" />
            </form>
        </li>
    </ul>
{/each}

<h3>Add action type</h3>
<form action="?/addActionType" method="POST">
    <input type="text" name="type" placeholder="Type" />
    <input type="text" name="description" placeholder="Description" />
    <select name="requirePrimaryPlayer" bind:value={requirePrimaryPlayer}>
        <option value="optional">Primary Player Optional</option>
        <option value="true">Primary Player Required</option>
        <option value="false">No Primary Player</option>
    </select>
    <select name="requireSecondaryPlayer" bind:value={requireSecondaryPlayer}>
        <option value="optional">Secondary Player Optional</option>
        <option value="true">Secondary Player Required</option>
        <option value="false">No Secondary Player</option>
    </select>
    {#if ['true', 'optional'].includes(requirePrimaryPlayer)}
        <input type="text" name="primaryPlayerLabel" placeholder="Primary player label" />
    {/if}
    {#if ['true', 'optional'].includes(requireSecondaryPlayer)}
        <input type="text" name="secondaryPlayerLabel" placeholder="Secondary player label" />
    {/if}
    <select name="requireState">
        <option value="offense">Offense</option>
        <option value="defense">Defense</option>
        <option value="any">Any</option>
    </select>

    <input type="submit" value="Add action type" />
</form>

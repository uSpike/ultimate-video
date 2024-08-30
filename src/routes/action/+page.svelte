<script lang="ts">
    import { base } from '$app/paths';
    import { enhance } from '$app/forms';

    import { confirmForm, handleSubmitErrors } from '$lib/form';

    export let data;

    let requirePrimaryPlayer: string = 'false';
    let requireSecondaryPlayer: string = 'false';
</script>

<a href="{base}/">Home</a>

<h1>Actions</h1>
{#each data.actionTypes as actionType}
    <h2>{actionType.type}</h2>
    <form method="POST" action="?/updateActionType" style="display:inline" use:enhance={handleSubmitErrors}>
        <ul>
            <li>
                Description:
                <input type="text" name="description" value={actionType.description} />
            </li>
            <li>
                <select name="requirePrimaryPlayer" bind:value={actionType.requirePrimaryPlayer}>
                    <option value="optional">Primary Player Optional</option>
                    <option value="true">Primary Player Required</option>
                    <option value="false">No Primary Player</option>
                </select>
                {#if actionType.requirePrimaryPlayer != 'false'}
                    label:
                    <input type="text" name="primaryPlayerLabel" value={actionType.primaryPlayerLabel} />
                {/if}
            </li>
            <li>
                <select name="requireSecondaryPlayer" bind:value={actionType.requireSecondaryPlayer}>
                    <option value="optional">Secondary Player Optional</option>
                    <option value="true">Secondary Player Required</option>
                    <option value="false">No Secondary Player</option>
                </select>
                {#if actionType.requireSecondaryPlayer != 'false'}
                    label:
                    <input type="text" name="secondaryPlayerLabel" value={actionType.secondaryPlayerLabel} />
                {/if}
            </li>
            <li>
                Required state:
                <select name="requireState" bind:value={actionType.requireState}>
                    <option value="offense">Offense</option>
                    <option value="defense">Defense</option>
                    <option value="any">Any</option>
                </select>
            </li>
        </ul>
        <input type="hidden" name="id" value={actionType.id} />
        <input type="hidden" name="type" value={actionType.type} />
        <button type="submit">Update</button>
    </form>
    <form method="POST" action="?/removeActionType" style="display:inline" use:enhance={handleSubmitErrors}>
        <input type="hidden" name="id" value={actionType.id} />
        <button
            type="submit"
            value="Delete"
            on:click={confirmForm(`Are you sure you want to delete ${actionType.type}?`)}>Delete</button
        >
    </form>
    <p>Notes</p>
    <ul>
        {#each actionType.notes as note}
            <li>
                <form
                    method="POST"
                    action="?/updateActionNoteType"
                    style="display:inline"
                    use:enhance={handleSubmitErrors}
                >
                    <input type="hidden" name="id" value={note.id} />
                    <input type="text" name="name" value={note.name} />
                    <input type="text" name="description" value={note.description} />
                    <button type="submit">Update</button>
                </form>
                <form
                    method="POST"
                    action="?/removeActionNoteType"
                    style="display:inline"
                    use:enhance={handleSubmitErrors}
                >
                    <input type="hidden" name="noteTypeId" value={note.id} />
                    <button type="submit" on:click={confirmForm(`Are you sure you want to delete ${note.name}?`)}
                        >Delete</button
                    >
                </form>
            </li>
        {/each}
    </ul>
    <form action="?/addActionNoteType" method="POST" use:enhance={handleSubmitErrors}>
        <input type="hidden" name="typeId" value={actionType.id} />
        <input type="text" name="name" placeholder="Name" />
        <input type="text" name="description" placeholder="Description" />
        <input type="submit" value="Add note type" />
    </form>
{/each}

<h3>Add action type</h3>
<form action="?/addActionType" method="POST" use:enhance={handleSubmitErrors}>
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

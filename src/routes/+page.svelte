<script>
    export let data;
</script>

<h2>Actions</h2>
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
            Notes
            <ul>
                {#each actionType.notes as note}
                    <li><b>{note.name}</b>: {note.description}</li>
                {/each}
            </ul>
        </li>
    </ul>
{/each}

<form action="?/addTournament" method="POST">
    <input type="text" name="name" placeholder="Name" />
    <input type="submit" value="Create" />
</form>

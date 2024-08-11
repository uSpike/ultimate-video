<script lang="ts">
    import { invalidateAll } from '$app/navigation';

    export let data;

    async function handleFetch(url: string, formData: FormData) {
        let response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            invalidateAll();
            return response.json();
        } else {
            let js = await response.json();
            if (js.error) alert(js.error?.message);
        }
    }

    async function deleteTournament(event: SubmitEvent) {
        let ok = confirm('Are you sure you want to delete this tournament?');
        if (!ok) return;
        const formData = new FormData(event.target as HTMLFormElement);
        await handleFetch(`?/deleteTournament`, formData);
    }
</script>

<h1>Tournaments</h1>

<ul>
    {#each data.tournaments as tournament}
        <li>
            <form method="POST" on:submit|preventDefault={deleteTournament}>
                <input type="text" name="tournamentId" value={tournament.id} hidden />
                <a href="tournament/{tournament.id}">{tournament.name}</a>
                <button type="submit">Remove</button>
            </form>
        </li>
    {/each}
</ul>

<h2>Create Tournament</h2>

<form action="?/addTournament" method="POST">
    <input type="text" name="name" placeholder="Name" />
    <input type="submit" value="Create" />
</form>

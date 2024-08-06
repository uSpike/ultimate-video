<script>
    /** @type {import('./$types').PageServerLoad} */
    export let data;
</script>

<ul>
    {#each data.tournaments as tournament}
        <li><a href="tournament/{tournament.id}">{tournament.name}</a></li>
    {/each}
</ul>

<script>
	/** @type {import('./$types').PageServerLoad} */
	export let data;
</script>

{#each data.tournaments as tournament}
	<a href="tournament/{tournament.id}">{tournament.name}</a>
{/each}

<script lang="ts">
    import type { PageData } from './$types';

    export let currentTime: number;
    export let video: HTMLVideoElement;
    export let points: PageData['points'];

    let eventElements: Array<HTMLDivElement> = [];
    const eventColors: { [key: string]: string } = {
        Started: '#0ff',
        Completion: '#0fa',
        Turnover: 'red',
        Defended: '#06f',
        Conceded: 'orange',
        Goal: 'green',
    };

    let activeElementIndex = 0;

    function scrollToCurrentEvent(time: number) {
        if (points.length === 0) return;
        for (let point of points) {
            for (let i = 1; i < point.actions.length; i++) {
                let action = point.actions[i];
                if (action.time >= time) {
                    // scroll to active event
                    eventElements[i - 1]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'start',
                    });
                    // highlight active event
                    activeElementIndex = i - 1;
                    return;
                }
            }
            activeElementIndex = 0;
        }
    }

    function seek(time: number) {
        video.currentTime = Number(time);
    }

    $: scrollToCurrentEvent(currentTime);

    function shortName(name: string | undefined) {
        if (!name) return '';
        let parts = name.split(' ');
        return `${parts[0]} ${parts[1][0]}`;
    }
</script>

<div style="height: 5em; overflow-y: scroll">
    {#each points as point}
        {#each point.actions as action, index}
            {@const time = new Date(action.time * 1000).toISOString().slice(11, 19)}

            <!-- only show if it has a defined color -->
            {#if eventColors[action.type.type]}
                <div
                    bind:this={eventElements[index]}
                    class:active-event={index == activeElementIndex}
                    style="background: {eventColors[action.type.type]}; white-space: nowrap; height: 1.2em"
                >
                    <span>
                        <!-- svelte-ignore a11y-invalid-attribute -->
                        <a href="#" on:click={() => seek(action.time)}>{time}</a>
                        {#if action.type.type == 'Started'}
                            Start point
                        {:else if action.type.type == 'Completion'}
                            Completion: {shortName(action.primaryPlayer?.name)} - {shortName(
                                action.secondaryPlayer?.name,
                            )}
                        {:else if action.type.type == 'Turnover'}
                            Turnover: {shortName(action.primaryPlayer?.name)}
                        {:else if action.type.type == 'Defended'}
                            Defended: {shortName(action.primaryPlayer?.name)}
                        {:else if action.type.type == 'Conceded'}
                            Conceded
                        {:else if action.type.type == 'Goal'}
                            Goal: {shortName(action.primaryPlayer?.name)} - {shortName(action.secondaryPlayer?.name)}
                        {/if}
                    </span>
                </div>
            {/if}
        {/each}
    {/each}
</div>

<style>
    .active-event {
        border: 2px solid black;
    }
</style>

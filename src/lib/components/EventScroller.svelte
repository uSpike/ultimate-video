<script>
    export let currentTime;
    export let video;
    export let points;

    $: events = points.flatMap((point) => [
        { type: 'Started', time: point.startTime },
        ...point.actions,
        { type: 'Ended', time: point.endTime },
    ]);

    let eventElements = [];
    const eventColors = {
        Started: '#0ff',
        Completion: '#0fa',
        Turnover: 'red',
        Defended: '#06f',
        Conceded: 'orange',
        Goal: 'green',
    };

    let activeElementIndex = 0;

    function scrollToCurrentEvent(time) {
        if (events.length === 0) return;
        for (let i = 1; i < events.length; i++) {
            if (events[i].type == 'Ended') continue;
            if (events[i].time >= time) {
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

    function seek(time) {
        video.currentTime = Number(time);
    }

    $: scrollToCurrentEvent(currentTime);

    function shortName(name) {
        if (!name) return '';
        let parts = name.split(' ');
        return `${parts[0]} ${parts[1][0]}`;
    }
</script>

<div style="height: 5em; overflow-y: scroll">
    {#each events as event, index}
        {@const time = new Date(event.time * 1000).toISOString().slice(11, 19)}

        <!-- only show if it has a defined color -->
        {#if eventColors[event.type]}
            <div
                bind:this={eventElements[index]}
                class:active-event={index == activeElementIndex}
                style="background: {eventColors[event.type]}; white-space: nowrap; height: 1.2em"
            >
                <span>
                    <a href="#" on:click={seek(event.time)}>{time}</a>
                    {#if event.type == 'Started'}
                        Start point
                    {:else if event.type == 'Completion'}
                        Completion: {shortName(event.primaryPlayer.name)} - {shortName(event.secondaryPlayer.name)}
                    {:else if event.type == 'Turnover'}
                        Turnover: {shortName(event.primaryPlayer.name)}
                    {:else if event.type == 'Defended'}
                        Defended: {shortName(event.primaryPlayer?.name)}
                    {:else if event.type == 'Conceded'}
                        Conceded
                    {:else if event.type == 'Goal'}
                        Goal: {shortName(event.primaryPlayer.name)} - {shortName(event.secondaryPlayer.name)}
                    {/if}
                </span>
            </div>
        {/if}
    {/each}
</div>

<style>
    .active-event {
        border: 2px solid black;
    }
</style>

<script lang="ts">
    import type { PageData } from './$types';
    import { QueuedPoint } from './queuedPoint';

    export let currentTime: number;
    export let duration: number;
    export let video: HTMLVideoElement;

    export let data: PageData;

    export let queuedPoint: QueuedPoint;

    function seekVideo(event: any) {
        // don't allow seeking during editing
        if (queuedPoint.started) return;

        let x = event.offsetX;
        if (event.target !== event.currentTarget) {
            // Calculate the position relative to the slider container
            x += event.target?.offsetLeft;
        }
        video.currentTime = (x / event.currentTarget?.clientWidth) * duration;
    }
</script>

<!-- progress bar -->
<div style="height: 1em; width: 100%;">
    <div class="progress" style="height: 1em; width: {(currentTime / duration) * 100}%;">
        {new Date(currentTime * 1000).toISOString().slice(11, 19)}
    </div>
</div>

<!-- tracker -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={seekVideo} class="tracker">
    {#each data.points as point}
        {@const pointDuration = point.endTime - point.startTime}
        <div
            class="point"
            style="left: {(point.startTime / duration) * 100}%; width: {(pointDuration / duration) * 100}%;"
        ></div>
        {#each point.actions as action}
            <div
                class="hovertext {action.type.type}"
                data-hover={action.type.type}
                style="left: {(action.time / duration) * 100}%;"
            ></div>
        {/each}
    {/each}
    {#if queuedPoint.started}
        <div
            class="point-queued"
            style="left: {(queuedPoint.startTime / duration) * 100}%; width: {((currentTime - queuedPoint.startTime) /
                duration) *
                100}%;"
        ></div>
    {/if}
</div>

<style>
    .progress {
        height: 10px;
        background: #7700e7;
    }

    .point {
        background: rgb(0, 119, 255);
        position: absolute;
        height: 20px;
    }

    .point-queued {
        background: rgb(11, 129, 0);
        position: absolute;
        height: 20px;
    }

    .Turnover {
        background: red;
        position: absolute;
        height: 20px;
        width: 2px;
    }

    .Goal {
        background: green;
        position: absolute;
        height: 20px;
        width: 2px;
    }

    .Conceded {
        background: rgb(143, 0, 0);
        position: absolute;
        height: 20px;
        width: 2px;
    }

    .tracker {
        width: 100%;
        height: 20px;
        background: lightgray;
        position: relative;
        cursor: pointer;
        margin-bottom: 10px;
    }

    .hovertext {
        position: absolute;
    }

    .hovertext:before {
        content: attr(data-hover);
        visibility: hidden;
        opacity: 0;

        background-color: black;
        color: #fff;
        text-align: center;
        border-radius: 5px;
        padding: 10px;

        position: absolute;
        z-index: 1;
        left: 0;
        top: 110%;
    }

    .hovertext:hover:before {
        opacity: 1;
        visibility: visible;
    }
</style>

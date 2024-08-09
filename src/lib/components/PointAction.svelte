<script lang="ts">
    import PointActionButton from '$lib/components/PointActionButton.svelte';

    import { invalidateAll } from '$app/navigation';
    import '$lib/buttons.css';

    let state: string = 'waiting'; // 'waiting', 'startPoint', 'doPoint'
    let actionState = null; // 'Offense' or 'Defense'

    let selectedPlayerIds: number[] = [];
    let selectedOD: string | null = null;
    let selectedLine = null;

    let selectedActionType = null;
    let selectedNotes = [];
    let selectedComment: string | null = null;
    let selectedPrimaryPlayer = null;
    let selectedSecondaryPlayer = null;

    $: FMPPlayers = data.tournament.players.filter((player) => player.genderMatch === 'fmp');
    $: MMPPlayers = data.tournament.players.filter((player) => player.genderMatch === 'mmp');
    $: selectedLineId = data.tournament.lines.find((line) => line.name === selectedLine)?.id;
    $: selectedLinePlayerIds = data.tournament.players
        .filter((player) => player.lines.find((line) => line.id === selectedLineId))
        .map((player) => player.id);

    export let queuedPoint = null;
    export let data;
    export let video;
    export let currentTime;
    $: currentPoint = data.points.find((point) => point.startTime <= currentTime && point.endTime >= currentTime);

    const checkOverlapping = async (queued, current) => {
        if (queued && current) {
            await submitPoint();
            alert('Point overlapped with another point. Submitted current point.');
        }
    };
    $: checkOverlapping(queuedPoint, currentPoint);

    async function queuePoint() {
        queuedPoint.gameId = data.game.id;
        queuedPoint.offenseDefense = selectedOD;
        queuedPoint.lineId = data.tournament.lines.find((line) => line.name === selectedLine).id;
        queuedPoint.startTime = currentTime;
        queuedPoint.players = data.tournament.players.filter((player) => selectedPlayerIds.includes(player.id));

        actionState = selectedOD.toLowerCase();
        goStateDoPoint();
    }

    async function addAction() {
        if (!queuedPoint) return;

        if (selectedPrimaryPlayer && selectedPrimaryPlayer === selectedSecondaryPlayer) {
            alert('Primary and secondary players cannot be the same.');
            return;
        }

        if (selectedActionType.type === 'Injury') {
            // add substitute player
            queuedPoint.players = [...queuedPoint.players, selectedSecondaryPlayer];
        }

        queuedPoint.actions = [
            ...queuedPoint.actions,
            {
                time: currentTime,
                type: selectedActionType,
                notes: selectedNotes,
                comment: selectedComment,
                primaryPlayer: selectedPrimaryPlayer,
                secondaryPlayer: selectedSecondaryPlayer,
            },
        ];

        selectedPrimaryPlayer = null;
        selectedSecondaryPlayer = null;

        let actionType = selectedActionType.type;
        selectedActionType = null;
        selectedNotes = [];
        selectedComment = null;

        if (actionType === 'Goal') {
            await submitPoint();
            return;
        } else if (actionType === 'Conceded') {
            await submitPoint();
            return;
        } else if (actionType === 'Turnover') {
            actionState = 'defense';
        } else if (actionType === 'Defended') {
            actionState = 'offense';
        }

        goStateDoPoint();
    }

    async function submitPoint() {
        let form = new FormData();
        form.append('gameId', data.game.id);
        form.append('offenseDefense', selectedOD);
        form.append('lineId', data.tournament.lines.find((line) => line.name === selectedLine).id);
        form.append('startTime', queuedPoint.startTime);
        form.append('endTime', currentTime);
        selectedPlayerIds.forEach((playerId) => form.append('players', String(playerId)));
        form.append(
            'actions',
            JSON.stringify(
                queuedPoint.actions.map((action) => ({
                    typeId: action.type.id,
                    time: action.time,
                    notes: action.notes.map((note) => note.id),
                    comment: action.comment,
                    primaryPlayer: action.primaryPlayer,
                    secondaryPlayer: action.secondaryPlayer,
                })),
            ),
        );

        let res = await fetch(`?/submitPoint`, {
            method: 'POST',
            body: form,
        });

        goStateWaiting();

        if (res.ok) {
            invalidateAll();
        } else {
            let js = await res.json();
            if (js.error) {
                alert(js.error?.message);
            }
        }
    }

    function startPoint() {
        // User clicks "start point" button from "waiting" state
        state = 'startPoint';
        selectedOD = null;
        selectedLine = null;
        selectedPlayerIds = [];
        video.pause();
        queuedPoint = {
            gameId: data.game.id,
            startTime: currentTime,
            endTime: null,
            actions: [],
        };
    }

    function goStateWaiting() {
        state = 'waiting';
        queuedPoint = null;
        video.play();
    }

    function goStateDoPoint() {
        state = 'doPoint';
        selectedActionType = null;
        selectedPrimaryPlayer = null;
        selectedSecondaryPlayer = null;
        selectedNotes = [];
        selectedComment = null;
        video.play();
    }

    function cancelStartPoint() {
        goStateWaiting();
    }

    async function endPoint() {
        // User clicks "end point" button from "doPoint" state
        let ok = confirm('Are you sure you want to end the point?  Only use this if the video cuts during a point.');
        if (ok) {
            cancelSelectAction();
            await submitPoint();
        }
    }

    function cancelSelectAction() {
        goStateDoPoint();
    }

    function selectAction() {
        // clear out selected players in case a different action is selected
        selectedPrimaryPlayer = null;
        selectedSecondaryPlayer = null;
        selectedNotes = [];
        selectedComment = null;
        video.pause();
    }

    $: lastAction = queuedPoint?.actions[queuedPoint.actions.length - 1];

    $: if (actionState == 'offense' && ['Completion', 'Turnover', 'Goal'].includes(selectedActionType?.type)) {
        // if the last action was a completion, auto-fill the primary player as the previous receiver
        if (lastAction?.type.type === 'Completion') {
            selectedPrimaryPlayer = lastAction.secondaryPlayer;
        }
    }

    function updateSelectedPlayerIds() {
        selectedPlayerIds = [...selectedLinePlayerIds];
    }

    function getTimeFormattedLink(time) {
        let text = new Date(time * 1000).toISOString().slice(11, 19);
        let url = `?time=${time}`;
        return `<a href="${url}">${text}</a>`;
    }

    function getPointResult(point) {
        for (let i = 0; i < point.actions.length; i++) {
            if (point.actions[i].type.type === 'Goal') {
                return 'Goal';
            } else if (point.actions[i].type.type === 'Conceded') {
                return 'Conceded';
            }
        }
        return null;
    }

    async function deletePoint(point) {
        let ok = confirm('Are you sure you want to delete this point?');
        if (!ok) return;

        let form = new FormData();
        form.append('pointId', point.id);

        console.log(JSON.stringify(form));
        let response = await fetch(`?/deletePoint`, {
            method: 'POST',
            body: form,
        });
        if (response.ok) {
            invalidateAll();
        } else {
            let js = await response.json();
            if (js.error) {
                alert(js.error.message);
            }
        }
    }

    let submitDisabled = false;

    $: if (selectedActionType) {
        if (['false', 'optional'].includes(selectedActionType.requirePrimaryPlayer)) {
            submitDisabled = false;
        } else if (selectedPrimaryPlayer === null) {
            submitDisabled = true;
        } else if (['false', 'optional'].includes(selectedActionType.requireSecondaryPlayer)) {
            submitDisabled = false;
        } else {
            submitDisabled = selectedSecondaryPlayer === null;
        }
    }
</script>

<div class="box">
    <div class="col-1">
        {#if state == 'waiting'}
            <button disabled={currentPoint} on:click={startPoint}>Start Point</button>
        {:else if state == 'startPoint'}
            <div style="float: left; width: 10vw;">
                <form>
                    <input type="radio" value="Offense" id="offense" bind:group={selectedOD} />
                    <label for="offense">Offense</label>
                    <input type="radio" value="Defense" id="defense" bind:group={selectedOD} />
                    <label for="defense">Defense</label>
                </form>
            </div>
            <div style="float: left; width: 10vw;">
                <form>
                    {#each data.tournament.lines as line}
                        <input
                            disabled={selectedOD === null}
                            type="radio"
                            value={line.name}
                            id={line.name}
                            bind:group={selectedLine}
                            on:change={updateSelectedPlayerIds}
                        />
                        <label for={line.name}>{line.name}</label>
                    {/each}
                </form>
            </div>
            <div style="float: left; width: 20vw;">
                <form>
                    <div id="fmps">
                        {#each FMPPlayers as player}
                            <input
                                disabled={selectedLine === null}
                                type="checkbox"
                                value={player.id}
                                id={player.name}
                                bind:group={selectedPlayerIds}
                            />
                            <label for={player.name}>{player.name}</label>
                        {/each}
                    </div>
                </form>
            </div>
            <div style="float: left; width: 20vw;">
                <form>
                    <div id="mmps">
                        {#each MMPPlayers as player}
                            <input
                                disabled={selectedLine === null}
                                type="checkbox"
                                value={player.id}
                                id={player.name}
                                bind:group={selectedPlayerIds}
                            />
                            <label for={player.name}>{player.name}</label>
                        {/each}
                    </div>
                </form>
            </div>
            <div style="clear: both;">
                <span>{selectedPlayerIds.length} players selected</span>
                <br />

                <button disabled={selectedPlayerIds.length < 1} on:click={queuePoint}>Submit</button>
                <button on:click={cancelStartPoint}>Cancel</button>
            </div>
        {:else if state == 'doPoint'}
            <form>
                {#each data.actionTypes as actionType}
                    <input
                        type="radio"
                        value={actionType}
                        id={actionType.id}
                        bind:group={selectedActionType}
                        on:click={selectAction}
                        disabled={!['any', actionState].includes(actionType.requireState) ||
                            selectedActionType?.type === actionType.type}
                    />
                    <label for={actionType.id}>{actionType.type}</label>
                {/each}
                <button on:click={endPoint}>End Point</button>
            </form>
            <button on:click={cancelSelectAction} disabled={selectedActionType === null}>Cancel</button>

            <hr />
            {#if selectedActionType}
                <PointActionButton
                    bind:players={queuedPoint.players}
                    bind:selectedPrimaryPlayer
                    bind:selectedSecondaryPlayer
                    bind:selectedNotes
                    bind:selectedComment
                    bind:actionType={selectedActionType}
                />
                <button disabled={submitDisabled} on:click={addAction}> Submit</button>
            {/if}
        {/if}
    </div>

    <div class="col-2" style="height: 20vh; overflow-y: scroll">
        {#if queuedPoint}
            <h2>
                Queued {@html getTimeFormattedLink(queuedPoint.startTime)} - {@html getTimeFormattedLink(currentTime)}
            </h2>
            {#if queuedPoint.lineId}
                <p>Line: {data.tournament.lines.find((line) => line.id === queuedPoint.lineId)?.name}</p>
            {/if}
            {#if queuedPoint.players}
                <p>Players: {queuedPoint.players?.map((player) => player.name).join(', ')}</p>
            {/if}
        {/if}
        {#each [...data.points].reverse() as point}
            <h2>
                Point {@html getTimeFormattedLink(point.startTime)} - {@html getTimeFormattedLink(point.endTime)}
            </h2>
            <a href="?/deletePoint" on:click={deletePoint(point)}>Delete</a>
            <p>{point.offenseDefense}: {point.line.name}</p>
            <p>Players: {point.players.map((player) => player.name).join(', ')}</p>
            <p>Result: {getPointResult(point)}</p>
        {/each}
    </div>
</div>

<style>
    .box {
        display: flex;
    }
    .col-1 {
        float: 1;
        min-width: 70vw;
    }
    .col-2 {
        float: 1;
        min-width: 25vw;
        overflow-y: auto;
        padding: 10px;
    }
</style>

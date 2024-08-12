<script lang="ts">
    import PointActionButton from './PointActionButton.svelte';
    import { QueuedPoint } from './queuedPoint';

    import { invalidateAll } from '$app/navigation';
    import '$lib/buttons.css';

    import type { PageData } from './$types';

    type Player = PageData['tournament']['players'][number];
    type Line = PageData['tournament']['lines'][number];
    type Point = PageData['points'][number];
    type ActionType = PageData['actionTypes'][number];
    type ActionNote = ActionType['notes'][number];

    type Action = {
        type: ActionType;
        time: number;
        notes: ActionNote[];
        comment: string | null;
        primaryPlayer: Player | null;
        secondaryPlayer: Player | null;
    };

    function assert(condition: unknown): asserts condition {
        if (!condition) throw new Error('Assertion failed');
    }

    let state: string = 'waiting'; // 'waiting', 'startPoint', 'doPoint'
    let actionState: string | null = null; // 'Offense' or 'Defense'

    let selectedPlayers: Player[] = [];
    let selectedOD: string | null = null;
    let selectedLine: Line | null = null;

    let selectedActionType: ActionType | null = null;
    let selectedNotes: ActionNote[] = [];
    let selectedComment: string | null = null;
    let selectedPrimaryPlayer: Player | null = null;
    let selectedSecondaryPlayer: Player | null = null;

    let selectedActions: Action[] = [];

    $: FMPPlayers = data.tournament.players.filter((player) => player.genderMatch === 'fmp');
    $: MMPPlayers = data.tournament.players.filter((player) => player.genderMatch === 'mmp');

    export let queuedPoint: QueuedPoint;
    export let data: PageData;
    export let video: HTMLVideoElement;
    export let currentTime: number;
    $: currentPoint = data.points.find((point) => point.startTime <= currentTime && point.endTime >= currentTime);

    const checkOverlapping = async (queued: QueuedPoint, current: Point | null) => {
        if (queued.started && current) {
            await submitPoint();
            alert('Point overlapped with another point. Submitted current point.');
        }
    };
    $: if (currentPoint) {
        checkOverlapping(queuedPoint, currentPoint);
    }

    async function queuePoint() {
        assert(selectedOD);
        assert(selectedLine);
        assert(selectedPlayers.length > 0);

        queuedPoint.startTime = currentTime;

        actionState = selectedOD.toLowerCase();
        goStateDoPoint();
    }

    async function addAction() {
        if (selectedPrimaryPlayer !== null && selectedPrimaryPlayer === selectedSecondaryPlayer) {
            alert('Primary and secondary players cannot be the same.');
            return;
        }

        if (selectedActionType?.type === 'Injury') {
            assert(selectedSecondaryPlayer);
            // add substitute player
            selectedPlayers = [...selectedPlayers, selectedSecondaryPlayer];
        }

        assert(selectedActionType);
        selectedActions = [
            ...selectedActions,
            {
                type: selectedActionType,
                time: currentTime,
                notes: selectedNotes,
                comment: selectedComment,
                primaryPlayer: selectedPrimaryPlayer,
                secondaryPlayer: selectedSecondaryPlayer,
            },
        ];

        selectedPrimaryPlayer = null;
        selectedSecondaryPlayer = null;

        let actionType = selectedActionType?.type;
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
        assert(selectedOD);
        assert(selectedLine);

        let form = new FormData();
        form.append('gameId', String(data.game.id));
        form.append('offenseDefense', selectedOD);
        form.append('lineId', String(selectedLine.id));
        form.append('startTime', String(queuedPoint.startTime));
        form.append('endTime', String(currentTime));
        selectedPlayers.forEach((player) => form.append('players', String(player.id)));
        form.append(
            'actions',
            JSON.stringify(
                selectedActions.map((action) => ({
                    typeId: action.type.id,
                    time: action.time,
                    notes: action.notes.map((note) => note.id),
                    comment: action.comment,
                    primaryPlayerId: action.primaryPlayer?.id,
                    secondaryPlayerId: action.secondaryPlayer?.id,
                })),
            ),
        );

        let res = await fetch(`?/submitPoint`, {
            method: 'POST',
            body: form,
        });

        console.log(res);

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
        selectedPlayers = [];
        selectedActions = [];
        video.pause();
        queuedPoint.start(currentTime);
    }

    function goStateWaiting() {
        state = 'waiting';
        queuedPoint.end();
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

    $: if (
        selectedActionType &&
        actionState == 'offense' &&
        ['Completion', 'Turnover', 'Goal'].includes(selectedActionType.type)
    ) {
        let lastAction = selectedActions[selectedActions.length - 1];
        // if the last action was a completion, auto-fill the primary player as the previous receiver
        if (lastAction && lastAction.type.type === 'Completion') {
            selectedPrimaryPlayer = lastAction.secondaryPlayer;
        }
    }

    function getTimeFormattedLink(time: number) {
        let text = new Date(time * 1000).toISOString().slice(11, 19);
        let url = `?time=${time}`;
        return `<a href="${url}">${text}</a>`;
    }

    function getPointResult(point: Point) {
        for (let i = 0; i < point.actions.length; i++) {
            if (point.actions[i].type.type === 'Goal') {
                return 'Goal';
            } else if (point.actions[i].type.type === 'Conceded') {
                return 'Conceded';
            }
        }
        return null;
    }

    async function deletePoint(point: Point) {
        let ok = confirm('Are you sure you want to delete this point?');
        if (!ok) return;

        let form = new FormData();
        form.append('pointId', String(point.id));

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

    function updateSelectedPlayers() {
        // fill-in players on the selected line
        selectedPlayers = data.tournament.players.filter((player) =>
            player.lines.find((line) => line.id === selectedLine?.id),
        );
    }
</script>

<div class="box">
    <div class="col-1">
        {#if state == 'waiting'}
            <button disabled={currentPoint === null} on:click={startPoint}>Start Point</button>
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
                            value={line}
                            id={line.name}
                            bind:group={selectedLine}
                            on:change={updateSelectedPlayers}
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
                                value={player}
                                id={player.name}
                                bind:group={selectedPlayers}
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
                                value={player}
                                id={player.name}
                                bind:group={selectedPlayers}
                            />
                            <label for={player.name}>{player.name}</label>
                        {/each}
                    </div>
                </form>
            </div>
            <div style="clear: both;">
                <span>{selectedPlayers.length} players selected</span>
                <br />

                <button disabled={selectedPlayers.length < 1} on:click={queuePoint}>Submit</button>
                <button on:click={cancelStartPoint}>Cancel</button>
            </div>
        {:else if state == 'doPoint'}
            <form>
                {#each data.actionTypes as actionType}
                    <input
                        type="radio"
                        value={actionType}
                        id={String(actionType.id)}
                        bind:group={selectedActionType}
                        on:click={selectAction}
                        disabled={!['any', actionState].includes(actionType.requireState) ||
                            selectedActionType?.type === actionType.type}
                    />
                    <label for={String(actionType.id)}>{actionType.type}</label>
                {/each}
                <button on:click={endPoint}>End Point</button>
            </form>
            <button on:click={cancelSelectAction} disabled={selectedActionType === null}>Cancel</button>

            <hr />
            {#if selectedActionType}
                <PointActionButton
                    bind:players={selectedPlayers}
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
        {#if queuedPoint.started}
            <h2>
                Queued {@html getTimeFormattedLink(queuedPoint.startTime)} - {@html getTimeFormattedLink(currentTime)}
            </h2>
            {#if selectedLine !== null}
                <p>Line: {selectedLine.name}</p>
            {/if}
            {#if selectedPlayers}
                <p>Players: {selectedPlayers.map((player) => player.name).join(', ')}</p>
            {/if}
        {/if}
        {#each [...data.points].reverse() as point}
            <h2>
                Point {@html getTimeFormattedLink(point.startTime)} - {@html getTimeFormattedLink(point.endTime)}
            </h2>
            <a href="?/deletePoint" on:click={() => deletePoint(point)}>Delete</a>
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

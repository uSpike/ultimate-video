<script>
    import PointActionButton from '$lib/components/PointActionButton.svelte';

    import { invalidateAll } from '$app/navigation';
    import '$lib/buttons.css';

    let state = 'waiting'; // 'waiting', 'startPoint', 'doPoint'
    let actionState = null; // 'Offense' or 'Defense'

    let selectedPlayerIds = [];
    let selectedOD = null;
    let selectedLine = null;

    let selectedAction = null;
    let selectedNote = null;
    let selectedComment = null;
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

        actionState = selectedOD;
        goStateDoPoint();
    }

    async function addAction() {
        if (!queuedPoint) return;

        if (selectedPrimaryPlayer && selectedPrimaryPlayer === selectedSecondaryPlayer) {
            alert('Primary and secondary players cannot be the same.');
            return;
        }

        queuedPoint.actions = [
            ...queuedPoint.actions,
            {
                time: currentTime,
                type: selectedAction,
                note: selectedNote,
                comment: selectedComment,
                primaryPlayer: selectedPrimaryPlayer,
                secondaryPlayer: selectedSecondaryPlayer,
            },
        ];

        selectedPrimaryPlayer = null;
        selectedSecondaryPlayer = null;

        let action = selectedAction;
        selectedAction = null;
        selectedNote = null;
        selectedComment = null;

        if (action === 'Goal') {
            await submitPoint();
            return;
        } else if (action === 'Conceded') {
            await submitPoint();
            return;
        } else if (action === 'Turnover') {
            actionState = 'Defense';
        } else if (action === 'Defended') {
            actionState = 'Offense';
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
        selectedPlayerIds.forEach((player) => form.append('players', player));
        form.append('actions', JSON.stringify(queuedPoint.actions));

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

    function handleInjury(injuredPlayer, substitutePlayer) {
        // add substitute player
        queuedPoint.players = [...queuedPoint.players, substitutePlayer];
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
        selectedAction = null;
        selectedPrimaryPlayer = null;
        selectedSecondaryPlayer = null;
        selectedNote = null;
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
        selectedNote = null;
        selectedComment = null;
        video.pause();
    }

    $: lastAction = queuedPoint?.actions[queuedPoint.actions.length - 1];

    $: if (actionState == 'Offense' && ['Completion', 'Turnover', 'Goal'].includes(selectedAction)) {
        // if the last action was a completion, auto-fill the primary player as the previous receiver
        if (lastAction?.type === 'Completion') {
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
            if (point.actions[i].type === 'Goal') {
                return 'Goal';
            } else if (point.actions[i].type === 'Conceded') {
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
                <input
                    type="radio"
                    value="Completion"
                    id="completion"
                    bind:group={selectedAction}
                    on:click={selectAction}
                    disabled={(selectedAction && selectedAction !== 'Completion') || actionState == 'Defense'}
                />
                <label for="completion">Completion</label>
                <input
                    type="radio"
                    value="Turnover"
                    id="turnover"
                    bind:group={selectedAction}
                    on:click={selectAction}
                    disabled={(selectedAction && selectedAction !== 'Turnover') || actionState == 'Defense'}
                />
                <label for="turnover">Turnover</label>
                <input
                    type="radio"
                    value="Goal"
                    id="goal"
                    bind:group={selectedAction}
                    on:click={selectAction}
                    disabled={(selectedAction && selectedAction !== 'Goal') || actionState == 'Defense'}
                />
                <label for="goal">Goal</label>
                <input
                    type="radio"
                    value="Defended"
                    id="defended"
                    bind:group={selectedAction}
                    on:click={selectAction}
                    disabled={(selectedAction && selectedAction !== 'Defended') || actionState == 'Offense'}
                />
                <label for="defended">Defended</label>
                <input
                    type="radio"
                    value="Conceded"
                    id="conceded"
                    bind:group={selectedAction}
                    on:click={selectAction}
                    disabled={(selectedAction && selectedAction !== 'Conceded') || actionState == 'Offense'}
                />
                <label for="conceded">Conceded</label>
                <input
                    type="radio"
                    value="Injury"
                    id="injury"
                    bind:group={selectedAction}
                    on:click={selectAction}
                    disabled={selectedAction && selectedAction !== 'Injury'}
                />
                <label for="injury">Injury</label>
                <button on:click={endPoint}>End Point</button>
            </form>
            <button on:click={cancelSelectAction} disabled={selectedAction === null}>Cancel</button>

            <hr />
            {#if selectedAction == 'Completion'}
                <PointActionButton
                    bind:players={queuedPoint.players}
                    bind:selectedPrimaryPlayer
                    bind:selectedSecondaryPlayer
                    bind:selectedNote
                    bind:selectedComment
                    primaryPlayerLabel="Thrower"
                    secondaryPlayerLabel="Receiver"
                    noteLabels={['under', 'skinny', 'strike', 'swing', 'huck', 'dump']}
                />
                <button disabled={!selectedPrimaryPlayer || !selectedPrimaryPlayer} on:click={addAction}>Submit</button>
            {:else if selectedAction == 'Turnover'}
                <PointActionButton
                    bind:players={queuedPoint.players}
                    bind:selectedPrimaryPlayer
                    bind:selectedSecondaryPlayer
                    bind:selectedNote
                    bind:selectedComment
                    primaryPlayerLabel="Thrower"
                    secondaryPlayerLabel="Receiver"
                    noteLabels={['drop', 'throw', 'stall', 'catch', 'miscommunication']}
                />
                <button disabled={!selectedPrimaryPlayer} on:click={addAction}>Submit</button>
            {:else if selectedAction == 'Goal'}
                <PointActionButton
                    bind:players={queuedPoint.players}
                    bind:selectedPrimaryPlayer
                    bind:selectedSecondaryPlayer
                    bind:selectedNote
                    bind:selectedComment
                    primaryPlayerLabel="Thrower"
                    secondaryPlayerLabel="Receiver"
                    noteLabels={['endzone', 'huck', 'flow']}
                />
                <button disabled={!selectedPrimaryPlayer} on:click={addAction}>Submit</button>
                <sub>If it's a callahan, who caught it is the "thrower".</sub>
            {:else if selectedAction == 'Defended'}
                <PointActionButton
                    bind:players={queuedPoint.players}
                    bind:selectedPrimaryPlayer
                    bind:selectedNote
                    bind:selectedComment
                    primaryPlayerLabel="Defender"
                    noteLabels={['drop', 'throw', 'mark', 'block', 'poach']}
                />
                <button on:click={addAction}>Submit</button>
            {:else if selectedAction == 'Conceded'}
                Point for other team
                <PointActionButton
                    bind:players={queuedPoint.players}
                    bind:selectedNote
                    bind:selectedComment
                    noteLabels={['endzone', 'huck', 'flow']}
                />
                <button on:click={addAction}>Submit</button>
            {:else if selectedAction == 'Injury'}
                <p>Injured</p>
                <PointActionButton
                    bind:players={queuedPoint.players}
                    bind:selectedPrimaryPlayer
                    bind:selectedSecondaryPlayer
                    bind:selectedComment
                    primaryPlayerLabel="Injured Player"
                    secondaryPlayerLabel="Substitute Player"
                />
                <button disabled={!selectedPrimaryPlayer || !selectedSecondaryPlayer} on:click={handleInjury}
                    >Submit</button
                >
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

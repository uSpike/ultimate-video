<script>
	import { invalidateAll } from '$app/navigation';

	let state = 'waiting';

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
	$: currentPoint = data.points.find(
		(point) => point.startTime <= currentTime && point.endTime >= currentTime
	);

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
		queuedPoint.players = data.tournament.players.filter((player) =>
			selectedPlayerIds.includes(player.id)
		);

		goStateDoPoint();
	}

	async function addAction() {
		if (!queuedPoint) return;

		queuedPoint.actions = [
			...queuedPoint.actions,
			{
				time: currentTime,
				type: selectedAction,
				note: selectedNote,
				comment: selectedComment,
				primaryPlayer: selectedPrimaryPlayer,
				secondaryPlayer: selectedSecondaryPlayer
			}
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
		selectedPlayerIds.forEach((player) => form.append('players[]', player));
		form.append('actions', JSON.stringify(queuedPoint.actions));

		let res = await fetch(`?/submitPoint`, {
			method: 'POST',
			body: form
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
		selectedPrimaryPlayer = null;
		selectedSecondaryPlayer = null;
		selectedNote = null;
		selectedComment = null;
		selectedPlayerIds = [];
		video.pause();
		queuedPoint = {
			gameId: data.game.id,
			startTime: currentTime,
			endTime: null,
			actions: []
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
		video.play();
	}

	function cancelStartPoint() {
		goStateWaiting();
	}

	async function endPoint() {
		// User clicks "end point" button from "doPoint" state
		let ok = confirm(
			'Are you sure you want to end the point?  Only use this if the video cuts during a point.'
		);
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

	$: if (selectedAction) {
		console.log('selected action ', selectedAction);
		let qa = queuedPoint.actions;

		if (['Completion', 'Turnover', 'Goal'].includes(selectedAction)) {
			// if the last action was a completion, auto-fill the primary player as the previous receiver
			if (qa.length > 0 && qa[qa.length - 1].type === 'Completion') {
				selectedPrimaryPlayer = qa[qa.length - 1].secondaryPlayer;
				console.log('auto-filled primary player ', selectedPrimaryPlayer);
			}
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
		let form = new FormData();
		form.append('pointId', point.id);

		console.log(JSON.stringify(form));
		let response = await fetch(`?/deletePoint`, {
			method: 'POST',
			body: form
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
			<form>
				<input type="radio" value="Offense" id="offense" bind:group={selectedOD} />
				<label for="offense">Offense</label>
				<input type="radio" value="Defense" id="defense" bind:group={selectedOD} />
				<label for="defense">Defense</label>
			</form>

			<hr />

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

			<hr />

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

			{selectedPlayerIds.length} players selected

			<hr />

			<button disabled={selectedPlayerIds.length < 1} on:click={queuePoint}>Submit</button>
			<button on:click={cancelStartPoint}>Cancel</button>
		{:else if state == 'doPoint'}
			<form>
				<input
					type="radio"
					value="Completion"
					id="completion"
					bind:group={selectedAction}
					on:click={selectAction}
					disabled={selectedAction && selectedAction !== 'Completion'}
				/>
				<label for="completion">Completion</label>
				<input
					type="radio"
					value="Turnover"
					id="turnover"
					bind:group={selectedAction}
					on:click={selectAction}
					disabled={selectedAction && selectedAction !== 'Turnover'}
				/>
				<label for="turnover">Turnover</label>
				<input
					type="radio"
					value="Goal"
					id="goal"
					bind:group={selectedAction}
					on:click={selectAction}
					disabled={selectedAction && selectedAction !== 'Goal'}
				/>
				<label for="goal">Goal</label>
				<input
					type="radio"
					value="Defended"
					id="defended"
					bind:group={selectedAction}
					on:click={selectAction}
					disabled={selectedAction && selectedAction !== 'Defended'}
				/>
				<label for="defended">Defended</label>
				<input
					type="radio"
					value="Conceded"
					id="conceded"
					bind:group={selectedAction}
					on:click={selectAction}
					disabled={selectedAction && selectedAction !== 'Conceded'}
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
				<p>Thrower</p>
				<form>
					{#each queuedPoint.players as player}
						<input
							type="radio"
							value={player.id}
							id={`primary ${player.name}`}
							bind:group={selectedPrimaryPlayer}
						/>
						<label for={`primary ${player.name}`}>{player.name}</label>
					{/each}
				</form>
				<p>Receiver</p>
				<form>
					{#each queuedPoint.players as player}
						<input
							type="radio"
							value={player.id}
							id={`secondary ${player.name}`}
							bind:group={selectedSecondaryPlayer}
							disabled={selectedPrimaryPlayer === player.id}
						/>
						<label for={`secondary ${player.name}`}>{player.name}</label>
					{/each}
				</form>
				<hr />
				<form>
					{#each ['under', 'skinny', 'strike', 'swing', 'huck', 'dump'] as note}
						<input type="radio" value={note} id={note} bind:group={selectedNote} />
						<label for={note}>{note}</label>
					{/each}
				</form>
				<form>
					<input type="text" placeholder="Comments" bind:value={selectedComment} />
				</form>
				<button disabled={!selectedPrimaryPlayer || !selectedSecondaryPlayer} on:click={addAction}
					>Submit</button
				>
			{:else if selectedAction == 'Turnover'}
				<p>Thrower</p>
				<form>
					{#each queuedPoint.players as player}
						<input
							type="radio"
							value={player.id}
							id={`primary ${player.name}`}
							bind:group={selectedPrimaryPlayer}
						/>
						<label for={`primary ${player.name}`}>{player.name}</label>
					{/each}
				</form>
				<p>Receiver</p>
				<form>
					{#each queuedPoint.players as player}
						<input
							type="radio"
							value={player.id}
							id={`secondary ${player.name}`}
							bind:group={selectedSecondaryPlayer}
							disabled={selectedPrimaryPlayer === player.id}
						/>
						<label for={`secondary ${player.name}`}>{player.name}</label>
					{/each}
				</form>
				<form>
					{#each ['drop', 'throw', 'stall', 'catch', 'miscommunication'] as note}
						<input type="radio" value={note} id={note} bind:group={selectedNote} />
						<label for={note}>{note}</label>
					{/each}
				</form>
				<form>
					<input type="text" placeholder="Comments" bind:value={selectedComment} />
				</form>
				<button disabled={!selectedPrimaryPlayer} on:click={addAction}>Submit</button>
			{:else if selectedAction == 'Goal'}
				<p>Thrower</p>
				<sub>If it's a callahan, who caught it is the "thrower".</sub>

				<form>
					{#each queuedPoint.players as player}
						<input
							type="radio"
							value={player.id}
							id={`primary ${player.name}`}
							bind:group={selectedPrimaryPlayer}
						/>
						<label for={`primary ${player.name}`}>{player.name}</label>
					{/each}
				</form>
				<p>Receiver</p>
				<form>
					{#each queuedPoint.players as player}
						<input
							type="radio"
							value={player.id}
							id={`secondary ${player.name}`}
							bind:group={selectedSecondaryPlayer}
							disabled={selectedPrimaryPlayer === player.id}
						/>
						<label for={`secondary ${player.name}`}>{player.name}</label>
					{/each}
				</form>
				<form>
					{#each ['endzone', 'huck', 'flow'] as note}
						<input type="radio" value={note} id={note} bind:group={selectedNote} />
						<label for={note}>{note}</label>
					{/each}
				</form>
				<form>
					<input type="text" placeholder="Comments" bind:value={selectedComment} />
				</form>
				<!-- Callahan could just be primary -->
				<button disabled={!selectedPrimaryPlayer} on:click={addAction}>Submit</button>
			{:else if selectedAction == 'Defended'}
				<p>Defender</p>
				<sub>Optional</sub>
				<form>
					{#each queuedPoint.players as player}
						<input
							type="radio"
							value={player.id}
							id={`primary ${player.name}`}
							bind:group={selectedPrimaryPlayer}
						/>
						<label for={`primary ${player.name}`}>{player.name}</label>
					{/each}
				</form>
				<form>
					{#each ['mark', 'block', 'poach'] as note}
						<input type="radio" value={note} id={note} bind:group={selectedNote} />
						<label for={note}>{note}</label>
					{/each}
				</form>
				<form>
					<input type="text" placeholder="Comments" bind:value={selectedComment} />
				</form>
				<button on:click={addAction}>Submit</button>
			{:else if selectedAction == 'Conceded'}
				Point for other team
				<form>
					{#each ['huck', 'endzone', 'flow'] as note}
						<input type="radio" value={note} id={note} bind:group={selectedNote} />
						<label for={note}>{note}</label>
					{/each}
				</form>
				<form>
					<input type="text" placeholder="Comments" bind:value={selectedComment} />
				</form>
				<button on:click={addAction}>Submit</button>
			{:else if selectedAction == 'Injury'}
				<p>Injured</p>
				<form>
					{#each queuedPoint.players as player}
						<input
							type="radio"
							value={player.id}
							id={`primary ${player.name}`}
							bind:group={selectedPrimaryPlayer}
						/>
						<label for={`primary ${player.name}`}>{player.name}</label>
					{/each}
				</form>

				<p>Substitute</p>
				<p />
				<form>
					{#each data.tournament.players as player}
						<input
							type="radio"
							value={player.id}
							id={`secondary ${player.name}`}
							bind:group={selectedSecondaryPlayer}
							disabled={selectedPrimaryPlayer === player.id}
						/>
						<label for={`secondary ${player.name}`}>{player.name}</label>
					{/each}
				</form>
				<form>
					<input type="text" placeholder="Comments" bind:value={selectedComment} />
				</form>
				<button
					disabled={!selectedPrimaryPlayer || !selectedSecondaryPlayer}
					on:click={handleInjury}>Submit</button
				>
			{/if}
			<hr />
		{/if}
	</div>

	<div class="col-2">
		{#if queuedPoint}
			<h2>
				Queued {@html getTimeFormattedLink(queuedPoint.startTime)} - {@html getTimeFormattedLink(
					currentTime
				)}
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
				Point {@html getTimeFormattedLink(point.startTime)} - {@html getTimeFormattedLink(
					point.endTime
				)}
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
	input[type='radio'] {
		display: none;
		text-transform: capitalize;
	}
	input[type='checkbox'] {
		display: none;
	}
	/* Clicking a label will select its corresponding hidden radio button
	We can select that radio buttons sibling label and style it. */
	input[type='radio']:checked + label {
		background-color: #8fff6d;
	}
	input[type='checkbox']:checked + label {
		background-color: #8fff6d;
	}
	label {
		display: inline-block;
		padding: 5px;
		border: 1px solid rgb(82, 82, 82);
		border-radius: 3px;
		background-color: #ffffff;
		/* width:10em; */
		text-align: center;
		text-transform: capitalize;
	}
	input[type='radio']:disabled + label {
		background-color: #ffffff;
		color: #bbbbbb;
	}
	input[type='checkbox']:disabled + label {
		background-color: #ffffff;
		color: #bbbbbb;
	}
</style>

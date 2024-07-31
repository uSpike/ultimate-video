<script>
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import EventScroller from '$lib/components/EventScroller.svelte';
	import PointAction from '$lib/components/PointAction.svelte';

	import * as THREE from "three";

	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	/** @type {import('./$types').PageServerLoad} */
	export let data;

	let video;
	let videoPlaying = false;
	let perspectiveMode = false;
	let playReady = false;
	let currentTime = 0;
	let duration = 0;

	let selectedGame = data.game.id;

	let queuedPoint = null;
	let editMode = false;

	let videoVH = 0.8;

	function onTimeUpdate() {
		currentTime = video.currentTime;
		// this doesn't always get updated so update it here
		duration = video.duration;
		// update url
		//let url = new URL(window.location.href);
		//url.searchParams.set('time', Math.floor(currentTime));
		//window.history.replaceState({}, '', url);
	}

	function goToGame(event) {
		window.location.href = selectedGame;
	}

	function toggleEditMode() {
		if (editMode && queuedPoint) {
			alert('You must submit the current point before exiting edit mode.');
			return;
		}
		editMode = !editMode;
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

	let canvas;

	let videoHeight = 0;
	let videoWidth = 0;
	// let scale = 0;
	// let centerX = 0;
	// let centerY = 0;

	let controls = {
		screenVerticalRotation: 30,
		screenHorizontalRotation: 5,
		cameraY: 0,
		focalLength: 2400
	};

	let renderer, scene, camera;

	let latitude = 0;
	let longitude = 0;

	let originalLatitude = 0;
	let originalLongitude = 0;

	let mouseDown = false;
	let mouseMoved = false;
	let mouseX = 0;
	let mouseY = 0;

	function onCanPlay() {
		console.log("onCanPlay");

		if (playReady) {
			// only need to fire this once
			return;
		}

		playReady = true;

		duration = video.duration;
		// look for ?time in url
		let url = new URL(window.location.href);
		let time = url.searchParams.get('time');
		if (time) {
			video.currentTime = time;
		}
		console.log(video.videoHeight);

		videoHeight = video.videoHeight;
		videoWidth = video.videoWidth;
		//centerX = videoWidth / 2;
		//centerY = videoHeight / 2;
		//scale = videoWidth / window.innerWidth;

		initPerspectiveMode();
	}

	// function setTransform() {
	// 	console.log("setTransform");
	// 	let clientWidth = video.clientWidth;
	// 	let clientHeight = video.clientHeight;

	// 	let reversedScale = videoWidth / clientWidth / scale;

	// 	centerX = Math.max(centerX, clientWidth / 2 * scale);
    //     centerX = Math.min(centerX, videoWidth - clientWidth / 2 * scale);

    //     if (clientHeight > videoHeight / scale) {
    //         centerY = videoHeight / 2;
    //     } else {
    //         centerY = Math.max(centerY, clientHeight / 2 * scale);
    //         centerY = Math.min(centerY, videoHeight - clientHeight / 2 * scale);
    //     }
    //     let translateX = (videoWidth / 2 - centerX) / scale;
    //     let translateY = (videoHeight / 2 - centerY) / scale;

    //     video.style.transform = `translate(${translateX}px, ${translateY}px) scale(${reversedScale})`;
	// }

	let geometry, mesh;

	function initPerspectiveMode() {
		console.log("initPerspectiveMode");
		perspectiveMode = true;

		camera = new THREE.PerspectiveCamera(
			30,
			window.innerWidth / window.innerHeight * 1.3,
			1,
			2 * videoWidth
		);
		let s = videoWidth / controls.focalLength;
		console.log("s: ", s);
		geometry = new THREE.CylinderGeometry(
			controls.focalLength,
			controls.focalLength,
			videoHeight,
			512,
			512,
			true,
			(Math.PI / 2) - (s / 2),
			s,
		);
		geometry.scale(-1, 1, 1);

		let texture = new THREE.VideoTexture(video);
		texture.colorSpace = THREE.SRGBColorSpace;

		let material = new THREE.MeshBasicMaterial({ map: texture });
		mesh = new THREE.Mesh(geometry, material);

		mesh.rotation.z = THREE.MathUtils.degToRad(controls.screenVerticalRotation);
		mesh.rotation.x = THREE.MathUtils.degToRad(controls.screenHorizontalRotation);

		scene = new THREE.Scene();
		scene.add(mesh);

		renderer = new THREE.WebGLRenderer({canvas: canvas});
		renderer.setPixelRatio(window.devicePixelRatio);
		onWindowResize();

		requestAnimationFrame(updatePerspectiveMode);
	}

	function updateControls() {
		perspectiveMoved = true;
		let s = videoWidth / controls.focalLength;
		geometry.radiusTop = controls.focalLength;
		geometry.radiusBottom = controls.focalLength;
		geometry.thetaLength = s;
		geometry.thetaStart = (Math.PI / 2) - (s / 2);
		mesh.rotation.z = THREE.MathUtils.degToRad(controls.screenVerticalRotation);
		mesh.rotation.x = THREE.MathUtils.degToRad(controls.screenHorizontalRotation);
	}

	// force one update to get the initial values
	let perspectiveMoved = true;

	function updatePerspectiveMode() {
		if (!perspectiveMode) {
			requestAnimationFrame(updatePerspectiveMode);
			return;
		}

		if (perspectiveMoved) {
			perspectiveMoved = false;

			latitude = Math.max(-85, Math.min(85, latitude));
			longitude = Math.max(-85, Math.min(85, longitude));
			const phi = THREE.MathUtils.degToRad(90 - latitude);
			const theta = THREE.MathUtils.degToRad(longitude);

			const x = -controls.focalLength * Math.sin(phi) * Math.cos(theta);
			const y = -controls.focalLength * Math.cos(phi);
			const z = -controls.focalLength * Math.sin(phi) * Math.sin(theta);

			camera.position.set(0, controls.cameraY, 0);
			camera.lookAt(x, y + controls.cameraY, z);
		}

		renderer.render(scene, camera);
		requestAnimationFrame(updatePerspectiveMode);
	}

	function onCanvasMouseDown(event) {
		if (event.button != 0) {
			return;
		}
		mouseDown = true;
		mouseMoved = false;

		mouseX = event.clientX;
		mouseY = event.clientY;

		originalLatitude = latitude;
		originalLongitude = longitude;
	}

	function onCanvasMouseMove(event) {
		if (!mouseDown) {
			return;
		}
		mouseMoved = true;
		perspectiveMoved = true;
		longitude = (mouseX - event.clientX) * 0.1 + originalLongitude;
		latitude = (mouseY - event.clientY) * 0.1 + originalLatitude;
	}

	function onCanvasMouseUp(event) {
		if (!mouseDown) {
			return;
		}
		mouseDown = false;
	}

	function onCanvasWheel(event) {
		event.preventDefault();
		event.stopPropagation();

		let fov = camera.fov;
		fov += event.deltaY * -0.02;
		camera.fov = Math.min(Math.max(5, fov), 90);
		camera.updateProjectionMatrix();
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight * (1 / videoVH);
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight * videoVH);
		//scale = videoWidth / video.clientWidth;
		//setTransform();
	}

	function switchMode() {
		perspectiveMode = !perspectiveMode;
	}

	function onPlay() {
		videoPlaying = true;
	}
	function onPause() {
		videoPlaying = false;
	}
	function onKeypress(event) {
		if (event.key === ' ') {
			if (videoPlaying) {
				video.pause();
			} else {
				video.play();
			}
		}
	}
</script>

<svelte:window on:resize={onWindowResize} on:keypress={onKeypress}/>

<div>
	<video
		bind:this={video}
		on:timeupdate={onTimeUpdate}
		on:canplay={onCanPlay}
		on:play={onPlay}
		on:pause={onPause}
		style="display: {perspectiveMode ? 'none' : 'block'}"
		crossorigin="anonymous"
		src={data.game.videoFile}
		preload="auto"
		controls
	>

		<track kind="captions" />
		Your browser is not supported.
	</video>

	<canvas
		bind:this={canvas}
		on:mousedown={onCanvasMouseDown}
		on:mousemove={onCanvasMouseMove}
		on:mouseup={onCanvasMouseUp}
		on:wheel={onCanvasWheel}
		style="display: {perspectiveMode ? 'block' : 'none'}"
	/>

</div>

<div>
	<button disabled={!playReady || videoPlaying} on:click={() => video.play()}>Play</button>
	<button disabled={!videoPlaying} on:click={() => video.pause()}>Pause</button>
	<button on:click={() => (video.currentTime -= 5)}>&lt;&lt; 5s</button>
	<button on:click={() => (video.currentTime += 10)}>&gt;&gt; 10s</button>
	<button on:click={() => (video.currentTime += 30)}>&gt;&gt; 30s</button>
	|
	<button class="mode" disabled={perspectiveMode} on:click={switchMode}>Perspective Mode</button>
	<button class="mode" disabled={!perspectiveMode} on:click={switchMode}>Normal Mode</button> |
	{#if perspectiveMode}
		<div class="slidecontainer">
			<input type="range" min="-90" max="90" class="slider" id="screenVerticalRotation" bind:value={controls.screenVerticalRotation} on:input={updateControls}>
			<label for="screenVerticalRotation">Screen Vertical Rotation {controls.screenVerticalRotation}</label>
			<input type="range" min="-90" max="90" class="slider" id="screenHorizontalRotation" bind:value={controls.screenHorizontalRotation} on:input={updateControls}>
			<label for="screenHorizontalRotation">Screen Horizontal Rotation {controls.screenHorizontalRotation}</label>
			<input type="range" min="-500" max="500" class="slider" id="cameraY" bind:value={controls.cameraY} on:input={updateControls}>
			<label for="cameraY">Camera Y {controls.cameraY}</label>
			<input type="range" min="1000" max="5000" class="slider" id="focalLength" bind:value={controls.focalLength} on:input={updateControls}>
			<label for="focalLength">Focal Length {controls.focalLength}</label>
		</div>
	{/if}
</div>

<hr />

<ProgressBar bind:video bind:currentTime bind:duration bind:data bind:queuedPoint />

<a href="/tournament/{data.tournament.id}">{data.tournament.name}</a> |

<form style="display:inline">
	<select bind:value={selectedGame} on:change={goToGame}>
		{#each data.tournament.games as game}
			{#if game.id === data.game.id}
				<option value={game.id} selected>{game.opponent}</option>
			{:else}
				<option value={game.id}>{game.opponent}</option>
			{/if}
		{/each}
	</select>
</form>
|

<button class="mode" disabled={!editMode} on:click={toggleEditMode}>View Mode</button>
<button class="mode" disabled={editMode} on:click={toggleEditMode}>Edit Mode</button>

<hr />

<div class="box">
	<div id="col-1">
		{#if editMode}
			<PointAction bind:data bind:video bind:currentTime bind:queuedPoint />
		{/if}
	</div>
	<div id="col-2">
		{#if !editMode}
			<EventScroller bind:currentTime bind:points={data.points} bind:video />
		{:else}
			<div style="overflow-y: auto;">
				{#if queuedPoint}
					<h2>Queued {@html getTimeFormattedLink(queuedPoint.startTime)} - {@html getTimeFormattedLink(currentTime)}</h2>
					{#if queuedPoint.lineId}
						<p>Line: {data.tournament.lines.find((line) => line.id === queuedPoint.lineId)?.name}</p>
					{/if}
					{#if queuedPoint.players}
						<p>Players: {queuedPoint.players?.map((player) => player.name).join(', ')}</p>
					{/if}
				{/if}
				{#each [...data.points].reverse() as point}
					<h2>Point {@html getTimeFormattedLink(point.startTime)} - {@html getTimeFormattedLink(
						point.endTime
					)}</h2>
					<a href="?/deletePoint" on:click={deletePoint(point)}>Delete</a>
					<p>{point.offenseDefense}: {point.line.name}</p>
					<p>Players: {point.players.map((player) => player.name).join(', ')}</p>
					<p>Result: {getPointResult(point)}</p>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	video {
		z-index: -1;
	}
	canvas {
		height: 70vh;
	}

	.box {
		display: flex;
	}
	.box > #col-1 {
		float: 1;
		min-width: 70vw;
	}
	.box > #col-2 {
		float: 1;
		min-width: 30vw;
	}
	video {
		width: 100vw;
	}
	.mode:disabled {
		background-color: #9de8ff;
		color: #000;
		border-color: rgb(0, 0, 0);
	}
	.slidecontainer {
		width: 25%; /* Width of the outside container */
		display: inline;
	}

	/* The slider itself */
	.slider {
	}

	/* Mouse-over effects */
	.slider:hover {
		opacity: 1; /* Fully shown on mouse-over */
	}

</style>

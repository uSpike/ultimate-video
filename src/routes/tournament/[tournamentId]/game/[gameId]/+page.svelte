<script>
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import EventScroller from '$lib/components/EventScroller.svelte';
	import PointAction from '$lib/components/PointAction.svelte';

	import * as THREE from 'three';

	/** @type {import('./$types').PageServerLoad} */
	export let data;

	let video;
	let videoPlaying = false;
	let perspectiveMode = false;
	let showPerspectiveControls = false;

	let currentTime = 0;
	let duration = 0;

	let selectedGame = data.game.id;

	let queuedPoint = null;
	let editMode = false;
	let skipBetweenMode = false;

	let videoVH = 0.7;

	function onTimeUpdate() {
		currentTime = video.currentTime;
		if (skipBetweenMode) {
			if (data.points[0].startTime > currentTime) {
				// go to start of first point
				video.currentTime = data.points[0].startTime;
			} else {
				for (let i = 0; i + 1 < data.points.length; i++) {
					console.log(data.points[i].endTime, currentTime, data.points[i + 1].startTime);
					if (data.points[i].endTime < currentTime && currentTime < data.points[i + 1].startTime) {
						video.currentTime = data.points[i + 1].startTime;
						break;
					}
				}
			}
		}
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

	let canvas;

	let videoHeight = 0;
	let videoWidth = 0;

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

	let geometry, mesh;

	// force one update to get the initial values
	let perspectiveMoved = true;

	let playReady = false;

	function onCanPlay() {
		if (playReady) {
			// only need to fire this once
			return;
		}
		playReady = true;

		duration = video.duration;
		//let url = new URL(window.location.href);
		//url.searchParams.set('time', Math.floor(currentTime));
		//window.history.replaceState({}, '', url);

		duration = video.duration;
		// look for ?time in url
		let url = new URL(window.location.href);
		let time = url.searchParams.get('time');
		if (time) {
			video.currentTime = time;
		}

		videoHeight = video.videoHeight;
		videoWidth = video.videoWidth;

		initPerspectiveMode();
	}

	function initPerspectiveMode() {
		console.log('initPerspectiveMode');
		perspectiveMode = true;

		camera = new THREE.PerspectiveCamera(
			30,
			(document.body.clientWidth / window.innerHeight) * 1.3,
			1,
			2 * videoWidth
		);
		let s = videoWidth / controls.focalLength;
		console.log('s: ', s);
		geometry = new THREE.CylinderGeometry(
			controls.focalLength,
			controls.focalLength,
			videoHeight,
			512,
			512,
			true,
			Math.PI / 2 - s / 2,
			s
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

		renderer = new THREE.WebGLRenderer({ canvas: canvas });
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
		geometry.thetaStart = Math.PI / 2 - s / 2;
		mesh.rotation.z = THREE.MathUtils.degToRad(controls.screenVerticalRotation);
		mesh.rotation.x = THREE.MathUtils.degToRad(controls.screenHorizontalRotation);
	}

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
		if (!camera) return;
		camera.aspect = (document.body.clientWidth / window.innerHeight) * (1 / videoVH);
		camera.updateProjectionMatrix();
		renderer.setSize(document.body.clientWidth, window.innerHeight * videoVH);
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
		if (event.key === 'p') {
			if (videoPlaying) {
				video.pause();
			} else {
				video.play();
			}
		}
	}
</script>

<svelte:window on:resize={onWindowResize} on:keypress={onKeypress} />

<div>
	<!-- style="display: flex; flex-flow:column; height: 100%; width: 100%"> -->
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
			<button on:click={() => (showPerspectiveControls = !showPerspectiveControls)}>
				{#if showPerspectiveControls}
					Hide controls
				{:else}
					Show controls
				{/if}
			</button>
			{#if showPerspectiveControls}
				<div class="slidecontainer">
					<input
						type="range"
						min="-90"
						max="90"
						class="slider"
						id="screenVerticalRotation"
						bind:value={controls.screenVerticalRotation}
						on:input={updateControls}
					/>
					<label for="screenVerticalRotation">V Rotation {controls.screenVerticalRotation}</label>
					<input
						type="range"
						min="-90"
						max="90"
						class="slider"
						id="screenHorizontalRotation"
						bind:value={controls.screenHorizontalRotation}
						on:input={updateControls}
					/>
					<label for="screenHorizontalRotation"
						>H Rotation {controls.screenHorizontalRotation}</label
					>
					<input
						type="range"
						min="-500"
						max="500"
						class="slider"
						id="cameraY"
						bind:value={controls.cameraY}
						on:input={updateControls}
					/>
					<label for="cameraY">Height {controls.cameraY}</label>
					<input
						type="range"
						min="1000"
						max="5000"
						class="slider"
						id="focalLength"
						bind:value={controls.focalLength}
						on:input={updateControls}
					/>
					<label for="focalLength">Focal Length {controls.focalLength}</label>
				</div>
			{/if}
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

	{#if !editMode}
		<button
			style="background-color:{skipBetweenMode ? 'aquamarine' : ''}"
			class="mode"
			on:click={() => (skipBetweenMode = !skipBetweenMode)}
		>
			Skip Between Mode
		</button>
	{/if}
	<hr />

	{#if editMode}
		<PointAction bind:data bind:video bind:currentTime bind:queuedPoint />
	{:else}
		<EventScroller bind:currentTime bind:points={data.points} bind:video />
	{/if}
</div>

<style>
	video {
		z-index: -1;
	}
	canvas {
		height: 70vh;
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
		height: 1em;
	}

	/* Mouse-over effects */
	.slider:hover {
		opacity: 1; /* Fully shown on mouse-over */
	}

	button:active {
		background-color: #4caf50;
		color: white;
	}
</style>

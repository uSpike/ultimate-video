<script>
    import * as THREE from 'three';

    export let video;
    export let perspectiveMode = true;

    let canvas;

    let videoHeight = 0;
    let videoWidth = 0;
    let scale = 0;
    let centerX = 0;
    let centerY = 0;

    let controls = {
        screenVerticalRotation: 30,
        screenHorizontalRotation: 5,
        cameraY: 0,
        focalLength: 2400,
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

    let initialized = false;

    $: if (video) {
        videoHeight = video.videoHeight;
        videoWidth = video.videoWidth;
        centerX = videoWidth / 2;
        centerY = videoHeight / 2;
        scale = videoWidth / window.innerWidth;

        console.log('INITIALIZE');

        initPerspectiveMode();
        initialized = true;
    }

    $: {
        if (perspectiveMode) {
            console.log('PERSPECTIVE MODE ACTIVATE');
            updateView();
            setTransform();
        }
    }

    function setTransform() {
        let clientWidth = video.clientWidth;
        let clientHeight = video.clientHeight;

        let reversedScale = videoWidth / clientWidth / scale;

        centerX = Math.max(centerX, (clientWidth / 2) * scale);
        centerX = Math.min(centerX, videoWidth - (clientWidth / 2) * scale);

        if (clientHeight > videoHeight / scale) {
            centerY = videoHeight / 2;
        } else {
            centerY = Math.max(centerY, (clientHeight / 2) * scale);
            centerY = Math.min(centerY, videoHeight - (clientHeight / 2) * scale);
        }
        let translateX = (videoWidth / 2 - centerX) / scale;
        let translateY = (videoHeight / 2 - centerY) / scale;

        video.style.transform = `translate(${translateX}px, ${translateY}px) scale(${reversedScale})`;
    }

    function initPerspectiveMode() {
        perspectiveMode = true;

        camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 2 * videoWidth);
        let s = videoWidth / controls.focalLength;
        console.log('s: ', s);
        let geometry = new THREE.CylinderGeometry(
            controls.focalLength,
            controls.focalLength,
            videoHeight,
            512,
            512,
            true,
            Math.PI / 2 - s / 2,
            s,
        );
        geometry.scale(-1, 1, 1);

        let texture = new THREE.VideoTexture(video);
        texture.colorSpace = THREE.SRGBColorSpace;

        let material = new THREE.MeshBasicMaterial({ map: texture });
        let mesh = new THREE.Mesh(geometry, material);

        mesh.rotation.z = THREE.MathUtils.degToRad(controls.screenVerticalRotation);
        mesh.rotation.x = THREE.MathUtils.degToRad(controls.screenHorizontalRotation);

        scene = new THREE.Scene();
        scene.add(mesh);

        renderer = new THREE.WebGLRenderer({ canvas: canvas });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight * 0.7);

        requestAnimationFrame(updatePerspectiveMode);
    }

    function updatePerspectiveMode() {
        if (!perspectiveMode) {
            return;
        }

        latitude = Math.max(-85, Math.min(85, latitude));
        longitude = Math.max(-85, Math.min(85, longitude));
        const phi = THREE.MathUtils.degToRad(90 - latitude);
        const theta = THREE.MathUtils.degToRad(longitude);

        const x = -controls.focalLength * Math.sin(phi) * Math.cos(theta);
        const y = -controls.focalLength * Math.cos(phi);
        const z = -controls.focalLength * Math.sin(phi) * Math.sin(theta);

        camera.position.set(0, controls.cameraY, 0);
        camera.lookAt(x, y + controls.cameraY, z);
        // update camera position
        // update camera rotation
        // update camera focal length
        // update video texture

        //console.log("update");

        renderer.render(scene, camera);

        requestAnimationFrame(updatePerspectiveMode);
    }

    function updateView() {
        if (perspectiveMode) {
            video.style.display = 'none';
            canvas.style.display = 'block';
        } else {
            video.style.display = 'block';
            canvas.style.display = 'none';
        }
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
        camera.aspect = window.innerWidth / window.innerHeight;
        console.log(camera.aspect);
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight * 1);
        scale = videoWidth / video.clientWidth;
        setTransform();
    }
</script>

<svelte:window on:resize={onWindowResize} />

<canvas
    bind:this={canvas}
    on:mousedown={onCanvasMouseDown}
    on:mousemove={onCanvasMouseMove}
    on:mouseup={onCanvasMouseUp}
    on:wheel={onCanvasWheel}
/>

<script lang="ts">
    import { onMount } from 'svelte';
    import {io, Socket} from 'socket.io-client';

    let status = 'disconnected';
    let socket: Socket;

    onMount(() => {
        socket = io(
            `ws${location.origin.slice(4)}/orientation`,
            {reconnectionDelayMax: 10000, extraHeaders: {id: "1"}},
        );
        socket.on('connect', () => {
            status = 'connected';
        });
        socket.on('disconnect', () => {
            status = 'disconnected';
        });
    });

    // figure out permissions later

    let alpha = 0;
    let beta = 0;
    let gamma = 0;

    function throttle(fn: any, limit: any) {
        let lastCall = 0;
        return function (...args: any) {
            const now = Date.now();
            if (now - lastCall >= limit) {
                lastCall = now;
                return fn(...args);
            }
        };
    }

    const handleOrientation = throttle((event: DeviceOrientationEvent) => {
        alpha = event.alpha as number;
        beta = event.beta as number;
        gamma = event.gamma as number;
        socket.emit('orientation', {alpha, beta, gamma});
    }, 1000 / 10);
</script>

<svelte:window on:deviceorientation={handleOrientation} />
{status} <br />
{alpha}, {beta}, {gamma}
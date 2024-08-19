import {useServer} from "vite-sveltekit-node-ws";
import {Server} from 'socket.io'

const subscriptions = new Map();

useServer((server) => {
    const wsServer = new Server(server);
    wsServer.of('orientation').on('connect', ws => {
        //get headers
        const headers = ws.handshake.headers;

        if (headers.listen) {
            console.log("listening");
            subscriptions.set(headers.id, ws);
        }

        ws.on('disconnect', () => {
            if (headers.listen)
                subscriptions.delete(headers.id);
        });
        ws.on('orientation', e => {
            let other = subscriptions.get(headers.id);
            if (other) {
                console.log("sending data", e);
                other.emit('orientation', e);
            }
        });
    });
}, (path) => /orientation/.test(path))
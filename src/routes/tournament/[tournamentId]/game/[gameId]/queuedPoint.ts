export class QueuedPoint {
    started: boolean;
    startTime: number;

    constructor() {
        this.started = false;
        this.startTime = 0;
    }

    start(startTime: number) {
        this.startTime = startTime;
        this.started = true;
    }

    end() {
        this.started = false;
    }
}

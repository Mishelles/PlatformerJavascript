class EventManager {
    constructor() {
        this.bind = [];
        this.action = [];
    }

    setup() {
        this.bind[37] = 'left';
        this.bind[39] = 'right';
        this.bind[38] = 'up';
        document.body.addEventListener("keydown", this.onKeyDown);
        document.body.addEventListener("keyup", this.onKeyUp);
    }

    onKeyDown(event) {
        const action = eventManager.bind[event.keyCode];
        if(action)
            eventManager.action[action] = true;
    }

    onKeyUp(event) {
        const action = eventManager.bind[event.keyCode];
        if(action)
            eventManager.action[action] = false;
    }
}
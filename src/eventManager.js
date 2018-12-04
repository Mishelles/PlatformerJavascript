class EventManager {
    constructor() {
        this.bind = [];
        this.action = [];
    }

    setup() {
        this.bind[65] = 'left';
        this.bind[68] = 'right';
        this.bind[87] = 'up';
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
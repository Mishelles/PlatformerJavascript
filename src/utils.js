const timestamp = () => {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
};

const getItem = (item) => {
    if(localStorage)
        return localStorage.getItem(item);
    else
        return null;
};

const setItem = (item, val) => {
    if(localStorage){
        localStorage.setItem(item, val);
    }
};

const updateWorld = () => {
    now = timestamp();
    dt = dt + Math.min(1, (now - last) / 900);
    while (dt > step) {
        dt = dt - step;
        gameManager.update();
    }
    last = now;
    counter++;
    ANIM = requestAnimationFrame(updateWorld, canvas);

};
class GameManager {
    constructor() {
        this.factory = {};
        this.entities = [];
        this.coinsNum = 0;
        this.totalScore = 0;
        this.player = null;
        this.levels = {
            curr: 1,
            max: 3
        };
        this.nickname = "";
        this.laterKill = [];
    }

    initPlayer(obj) {
        this.player = obj;
    }

    kill(obj, win = false, count) {
        if (win) {
            this.totalScore += count;
            document.getElementById("total").innerHTML = gameManager.totalScore;

            if (this.levels.curr === this.levels.max) {
                soundManager.stopAll();
                soundManager.init();
                soundManager.play("/mus/aud5.mp3", {looping: 0, volume: 0.5});
                scoreTable.add(nickname, obj.countCoins);
                elem.innerHTML = 'Ура! Кажется, у нас новый победитель!';
                elem1.innerHTML = 'Круто, но я хочу пройти заново!';
                result.style.display = 'block';
            } else {
                this.levelUp();
            }
        }

        if (obj.name !== "player") {
            this.laterKill.push(obj);
        }
    }

    update() {
        if (this.player === null)
            return;
        this.player.move_x = 0;
        this.player.move_y = 0;
        if (eventManager.action["up"] && this.player.jump === false) {
            this.player.jump = true;
            this.player.move_y = -5;
        }
        if (eventManager.action["left"]) {
            this.player.move_x = -1;
            let i = this.player.numbL;
            if (i === 4) {
                i = 0;
                this.player.numbL = 0;
            }
            this.player.position = this.player.left[i];
            this.player.numbL = ++i;
            this.player.numbR = 0;
        }
        if (eventManager.action["right"]) {
            this.player.move_x = 1;
            let i = this.player.numbR;
            if (i === 4) {
                i = 0;
                this.player.numbR = 0;
            }
            this.player.position = this.player.right[i];
            this.player.numbR = ++i;
            this.player.numbL = 0;
        }
        this.entities.forEach(function (e) {
            try {
                e.update();
            } catch (ex) {
            }
        });
        for (let i = 0; i < this.laterKill.length; i++) {
            let idx = this.entities.indexOf(this.laterKill[i]);
            if (idx > -1)
                this.entities.splice(idx, 1);
        }
        if (this.laterKill.length > 0)
            this.laterKill.length = 0;
        mapManager.draw(ctx);
        mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        this.draw(ctx);
    }

    draw(ctx) {
        for(let e = 0; e < this.entities.length; e++)
            this.entities[e].draw(ctx);
    }

    loadAll() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        mapManager = new MapManager();
        mapManager.loadMap(this.levels.curr + ".json");
        spriteManager.loadAtlas("sprites.json", "spritesheet.png");
        this.factory['player'] = Player;
        this.factory['coins'] = Coins;
        this.factory['enemy1'] = Enemy1;
        this.factory['enemy2'] = Enemy2;
        this.factory['kosm'] = Rocket;
        mapManager.parseEntities();
        mapManager.draw(ctx);
        eventManager.setup();
        document.getElementById("pCoins").innerHTML = this.totalScore < 0 ? "0" : this.totalScore;
        document.getElementById("total").innerHTML = this.levels.curr;
    }

    play() {
        this.levels.curr = 1;
        this.totalScore = 0;
        nickname = document.getElementById("nick").value;

        if(nickname.length > 0){
            document.getElementById("myModal").style.display = "none";

            soundManager.init();
            soundManager.loadArray(["/mus/aud1.wav","/mus/aud2.mp3", "/mus/aud3.mp3", "/mus/aud6.mp3", "/mus/aud5.mp3"]);
            soundManager.play("/mus/aud6.mp3", {looping: 1, volume: 0.5});
            this.loadAll();
            updateWorld();
        }
    }

    levelUp() {
        this.levels.curr++;
        this.loadAll();
        updateWorld();
        soundManager.play("/mus/aud6.mp3", {looping: 1, volume: 0.5});
    }
}
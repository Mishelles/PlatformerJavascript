class Entity {
    constructor() {
        this.pos_x = 0;
        this.pos_y = 0;
        this.size_x = 0;
        this.size_y = 0;
        this.touch = false;
    }

    kill() {
        gameManager.kill(this);
    }
}

class Player extends Entity {
    constructor() {
        super();
        this.nickname = "";
        this.countCoins = 0;
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 20;
        this.numbL = 0;
        this.numbR = 0;
        this.left = ["rick_left1", "rick_left2", "rick_left3", "rick_left4"];
        this.right = ["rick_right1", "rick_right4", "rick_right3", "rick_right2"];
        this.position = "rick_right1";
        this.jump = false;
        this.win = false;
    }

    draw(ctx) {
        spriteManager.drawSprite(ctx, this.position, this.pos_x, this.pos_y - 70);
    }

    update() {
        physicManager.update(this);
    }

    onTouchEntity(obj) {
        if (obj.name.match(/coins[\d*]/)) {
            soundManager.play("/mus/aud1.wav", {looping: 0, volume: 0.5});
            this.countCoins += 1;
            let elem = document.getElementById('pCoins');
            elem.innerHTML = this.countCoins;
            obj.kill();

        }
        if (obj.name.match(/kosm/)) {;
            soundManager.stopAll();
            soundManager.init();
            soundManager.play("/mus/aud2.mp3", {looping: 0, volume: 1});
            obj.touch = true;
            this.win = true;
            obj.move_y = 4;
            this.kill();
        }
        if (obj.name.match(/enemy[\d*]/)) {
            this.kill();
        }
    }

    onTouchMap(obj) {
    };

    kill() {
        window.cancelAnimationFrame(ANIM);

        gameManager.entities = [];
        gameManager.kill(this);
        if (!this.win) {
            gameManager.kill(this, false);
            soundManager.stopAll();
            soundManager.init();
            soundManager.play("/mus/aud3.mp3", {looping: 0, volume: 0.5});
            elem.innerHTML = 'Уууупс, игра окончена, дорогой друг!';
            elem1.innerHTML = 'Хочу играть заново!';
            result.style.display = 'block';
        } else {
            gameManager.kill(this, true, this.countCoins);
        }

        document.getElementById("records").innerHTML = scoreTable.get();

        elem1.onclick = function () {
            gameManager.play();

            this.innerHTML = "";
            elem.innerHTML = "";
        }
    }
}

class Enemy1 extends Entity {
    constructor() {
        super();
        this.move_x = 3;
        this.move_y = 3;
        this.speed = 10;
        this.goLeft = true;
        this.goIt = 0;
        this.left = ["enemy1_left1", "enemy1_left2", "enemy1_left3", "enemy1_left4"];
        this.right = ["enemy1_right1", "enemy1_right4", "enemy1_right3", "enemy1_right2"];
        this.position = "enemy1_right1";
    }

    draw(ctx) {
        spriteManager.drawSprite(ctx, this.position, this.pos_x, this.pos_y - 85);
    }

    update() {
        physicManager.update(this);
    }
}

class Enemy2 extends Entity {
    constructor() {
        super();
        this.move_x = 3;
        this.move_y = 3;
        this.speed = 10;
        this.goLeft = true;
        this.goIt = 0;
        this.left = ["enemy2_left1", "enemy2_left2", "enemy2_left3", "enemy2_left4"];
        this.right = ["enemy2_right1", "enemy2_right4", "enemy2_right3", "enemy2_right2"];
        this.position = "enemy2_right1";
    }

    draw(ctx) {
        spriteManager.drawSprite(ctx, this.position, this.pos_x, this.pos_y - 100);
    }

    update() {
        physicManager.update(this);
    }
}

class Rocket extends Entity {
    constructor() {
        super();
        this.move_x = 2;
        this.move_y = 2;
        this.speed = 10;
    }

    draw(ctx) {
        spriteManager.drawSprite(ctx, "kosm", this.pos_x, this.pos_y - 150);
    }

    update() {
        if (this.touch === true) {
            physicManager.update(this);
        }
    }

    kill() {
        gameManager.kill(this);
    }
}

class Coins extends Entity {
    draw() {
        spriteManager.drawSprite(ctx, "coins", this.pos_x, this.pos_y - 100);
    }
}
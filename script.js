var canvas = document.getElementById("canvasId"), ctx = canvas.getContext("2d"); 
var elem = document.getElementById('hBody'), elem1 = document.getElementById('aResult');
var ANIM;

const soundManager = new SoundManager();
const mapManager = new MapManager();
const spriteManager = new SpriteManager();
const eventManager = new EventManager();


function timestamp() {
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

function getItem(item){
	if(localStorage)
		return localStorage.getItem(item);
	else
		return null;
}

function setItem(item, val){
	if(localStorage){
		localStorage.setItem(item, val);
	}
}

var scoreTable = JSON.parse(getItem("table")) || [];
scoreTable.get = function(){
	this.sort(function(a,b) {
		return b[2] - a[2];
	});
	
	var n, content = "";
	for(n = 0; n < scoreTable.length; n++){
		content += "<tr><td>" + scoreTable[n][0] + "</td>" + "<td>" + scoreTable[n][1] + "</td>" + "<td>" + scoreTable[n][2] + "</td></tr>";
	}
	return content;
};
scoreTable.add = function(name, data){
	var date = new Date(), time = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
	
	this.push([time, name, data]);
	setItem("table", JSON.stringify(this));
};

var Entity = {
    pos_x: 0,
    pos_y: 0,
    size_x: 0,
    size_y: 0,
    touch: false,
    kill: function() {
        gameManager.kill(this);
    },
    extend: function(extendProto) {
        var object = Object.create(this);
        for(var property in extendProto) {
            if(this.hasOwnProperty(property) || typeof object[property] === 'undefined') {
                object[property] = extendProto[property];
            }
        }
        return object;
    }
};

var Player = Entity.extend({
	nickname: "",
    countCoins: 0,
    move_x: 0, 
    move_y: 0,
    speed: 20,
    numbL: 0,
    numbR: 0,
    left: ["rick_left1","rick_left2","rick_left3","rick_left4"],
    right: ["rick_right1","rick_right4","rick_right3","rick_right2"],
    position: "rick_right1",
    jump: false,
    win: false,
    draw: function(ctx) {
        spriteManager.drawSprite(ctx, this.position, this.pos_x, this.pos_y-70);
    },
    update: function() {
        physicManager.update(this);
    },
    onTouchEntity: function(obj) {
        if(obj.name.match(/coins[\d*]/)) {
            soundManager.play("/mus/aud1.mp3",{looping:0, volume:0.5});
            this.countCoins += 1;
            var elem = document.getElementById('pCoins');
            elem.innerHTML = this.countCoins;  
            obj.kill();
            
        }
        if(obj.name.match(/kosm/)) {
            soundManager.stopAll();
            soundManager.init();
            soundManager.play("/mus/aud2.mp3",{looping:0, volume:1});
            obj.touch = true;
            this.win = true;
            obj.move_y = 4;
            this.kill();
        }
        if(obj.name.match(/enemy[\d*]/)) {
            this.kill();
        }
    },
    onTouchMap: function(obj) {
    },
    kill: function() {
		window.cancelAnimationFrame(ANIM);
		
		gameManager.entities = [];
        gameManager.kill(this);
        if(!this.win){
			gameManager.kill(this, false);
            elem.innerHTML = 'ВЫ ПРОИГРАЛИ!'; 
            elem1.innerHTML = 'Попробовать еще раз'; 
        }else{
			gameManager.kill(this, true, this.countCoins);
		}
		
		document.getElementById("records").innerHTML = scoreTable.get();
		
		elem1.onclick = function(){
			gameManager.play();
			
			this.innerHTML = "";
			elem.innerHTML = "";
		}
    }
});

var Enemy1 = Entity.extend({
    move_x: 3,
    move_y: 3,
    speed:10,
    goLeft: true,
    goIt: 0,
    left: ["enemy1_left1","enemy1_left2","enemy1_left3","enemy1_left4"],
    right: ["enemy1_right1","enemy1_right4","enemy1_right3","enemy1_right2"],
    position: "enemy1_right1",
    draw: function(ctx) {
        spriteManager.drawSprite(ctx, this.position, this.pos_x, this.pos_y-85);
    },
    update: function() {
        physicManager.update(this); 
    },
});

var Enemy2 = Entity.extend({
    move_x: 3,
    move_y: 3,
    speed:10,
    goLeft: true,
    goIt: 0,
    left: ["enemy2_left1","enemy2_left2","enemy2_left3","enemy2_left4"],
    right: ["enemy2_right1","enemy2_right4","enemy2_right3","enemy2_right2"],
    position: "enemy2_right1",
    draw: function(ctx) {
        spriteManager.drawSprite(ctx, this.position, this.pos_x, this.pos_y-100);
    },
    update: function() {
        physicManager.update(this); 
    },
});

var Rocket = Entity.extend({
    move_x: 2,
    move_y: 2,
    speed: 10,
    draw: function(ctx) {
        spriteManager.drawSprite(ctx, "kosm", this.pos_x, this.pos_y-150);
    },
    update: function() {
        if(this.touch === true) {
            physicManager.update(this); 
        }
    },
    kill: function() {
        gameManager.kill(this);
    }
});

var Coins = Entity.extend({
    draw: function(ctx) {
        spriteManager.drawSprite(ctx, "coins", this.pos_x, this.pos_y-100);
    },
});

var physicManager = {
    update: function(obj) {
        if(obj.pos_y > 650 || obj.pos_y < 0) {
            obj.kill(); 
            return "stop";
        }
        if(obj.move_x === 2 && obj.move_y === 2) {
            return "stop";
        }
        if(obj.move_y === 4) {
            obj.pos_y -=30;
            return "move";
        }
        if(obj.move_x === 3 && obj.move_y === 3) {
            var i = obj.goIt;
            j = i;
            if(i >= 4) j = i-4;
            if (obj.goLeft === true) {
                obj.pos_x +=10;
                obj.position = obj.right[j];
                i++;
                if(i === 8) {
                    obj.goIt = 0;
                    obj.goLeft = false;
                } else obj.goIt = i;
            } else {
                obj.pos_x -=10;
                obj.position = obj.left[j];
                i++;
                if(i === 8) {
                    obj.goIt = 0;
                    obj.goLeft = true;
                } else obj.goIt = i;
            }
            return "move";
        }
        if(obj.jump === true && obj.move_y === 0) {
                var newX = obj.pos_x;
                var newY = obj.pos_y + 50; 
                var ts = mapManager.getTilesetIdx(newX - 10+ obj.size_x/2, newY + obj.size_y/2);
                if(ts !== 0 && obj.onTouchMap){
                    obj.jump = false;
                    obj.onTouchMap(ts);
                }
                if(obj.jump === true) {
                    obj.pos_y += 10;
                }
        }        
        if(obj.move_x === 0 && obj.move_y === 0) {
                var newX = obj.pos_x;
                var newY = obj.pos_y + 50;
                var ts = mapManager.getTilesetIdx(newX -10 + obj.size_x/2, newY + obj.size_y/2);
                if(ts !== 0 && obj.onTouchMap){
                    return "stop";
                }
                obj.pos_y += 10;
            return "stop";
        }        
        if(obj.move_x !== 0 && obj.move_y === 0) {
                var newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
                var newY = obj.pos_y + 50;
                var ts = mapManager.getTilesetIdx(newX -10 + obj.size_x/2, newY + obj.size_y/2);
                if(ts === 0 && obj.onTouchMap){
                    obj.pos_y += 10; 
                }
        }        
        if(obj.move_y !== 0) {
                var newX = obj.pos_x ;
                var newY = obj.pos_y + 50;
                var ts = mapManager.getTilesetIdx(obj.pos_x -10 + obj.size_x/2, newY + obj.size_y/2);
                if(ts === 0 && obj.onTouchMap){
                    return;
                }
        }
        if(obj.jump === true) {
            var newX = obj.pos_x + Math.floor(obj.move_x * obj.speed)+obj.move_x*20; 
        } else {
            var newX = obj.pos_x + Math.floor(obj.move_x * obj.speed);
        }
        if(newX < 10) return "stop";
        var newY = obj.pos_y + Math.floor(obj.move_y * obj.speed);
        var ts = mapManager.getTilesetIdx(newX + obj.size_x/2, newY + obj.size_y/2);
        var e = this.entityAtXY(obj, newX, newY);
        if(e !== null && obj.onTouchEntity) {
            obj.onTouchEntity(e);           
        }
        if(ts !== 0 && obj.onTouchMap) {
            obj.jump = false;
            obj.onTouchMap(ts);
        }
        if(ts === 0 && e === null) {
            obj.pos_x = newX;
            obj.pos_y = newY;
        } else
            return "break";
        return "move";
    },
    entityAtXY: function(obj, x, y) {
        for(var i = 0; i < gameManager.entities.length; i++) {
            var e = gameManager.entities[i];
            if(e.name !== obj.name) {
                if(x + obj.size_x < e.pos_x || y + obj.size_y < e.pos_y || x > e.pos_x + e.size_x  || y > e.pos_y + e.size_y)
                    continue;
                return e;
            }
        }
        return null;
    }
};

var gameManager = {
    factory: {},
    entities: [],
    coinsNum: 0,
	totalScore: 0,
    player: null,
	levels: {curr: 1, max: 3},
	nickname: "",
    laterKill: [],
    initPlayer: function(obj) {
        this.player = obj;
    },
    kill: function(obj, _win, count) {
	  var win = _win || false;
	  
	  if(win){
		gameManager.totalScore += count;
		document.getElementById("total").innerHTML = gameManager.totalScore;
		
		if(gameManager.levels.curr == gameManager.levels.max){
			scoreTable.add(nickname, obj.countCoins);
            elem.innerHTML = 'ВЫ ПРОШЛИ ИГРУ!!'; 
            elem1.innerHTML = 'Играть ещё раз';
		}else{
			gameManager.levelUp();
		}
	  }
	  
	  if(obj.name != "player"){
		this.laterKill.push(obj);
	  }
    },
    update: function() {
        if(this.player === null)
            return;
        this.player.move_x = 0;
        this.player.move_y = 0;
        if(eventManager.action["up"] && this.player.jump === false) {
            this.player.jump = true;
            this.player.move_y = -5;
        };
        if(eventManager.action["left"]) {
            this.player.move_x = -1;
            var i = this.player.numbL;
            if (i == 4) {
                i = 0;
                this.player.numbL = 0;
            }
            this.player.position = this.player.left[i];
            this.player.numbL = ++i;
            this.player.numbR = 0;
        }
        if(eventManager.action["right"]) {
            this.player.move_x = 1;
            var i = this.player.numbR;
            if (i == 4) {
                i = 0;
                this.player.numbR = 0;
            }
            this.player.position = this.player.right[i];
            this.player.numbR = ++i;
            this.player.numbL = 0;
        }
        this.entities.forEach(function(e) {
            try{
                e.update();
            } catch(ex){
            }
        });
        for(var i=0; i < this.laterKill.length; i++) {
            var idx = this.entities.indexOf(this.laterKill[i]);
            if(idx > -1)
                this.entities.splice(idx, 1);
        };
        if(this.laterKill.length > 0)
            this.laterKill.length = 0;
        mapManager.draw(ctx);
        mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        this.draw(ctx);
        
    },
    draw: function(ctx) {
        for(var e = 0; e < this.entities.length; e++)
            this.entities[e].draw(ctx);
    },
    loadAll: function() {
        mapManager.loadMap(this.levels.curr + ".json");
        spriteManager.loadAtlas("sprites.json", "spritesheet.png");
        gameManager.factory['player'] = Player;
        gameManager.factory['coins'] = Coins;
        gameManager.factory['enemy1'] = Enemy1;
        gameManager.factory['enemy2'] = Enemy2;
        gameManager.factory['kosm'] = Rocket;
        mapManager.parseEntities();
        mapManager.draw(ctx);
		document.getElementById("pCoins").innerHTML = "0";
		document.getElementById("total").innerHTML = gameManager.totalScore;
    },
    play: function() {
		this.levels.curr = 1;
		this.totalScore = 0;
		nickname = document.getElementById("nick").value;
		
		if(nickname.length > 0){
			document.getElementById("myModal").style.display = "none";

			soundManager.loadArray(["/mus/aud1.mp3","/mus/aud2.mp3","/mus/aud6.mp3"]);
			this.loadAll();
			updateWorld();
		}
    },
	levelUp: function(){
		this.levels.curr++;
			
		this.loadAll();
		updateWorld();
	}
};

var step = 1/20, counter = 0, dt = 0, now, last = timestamp();
function updateWorld() {
	now = timestamp();
    dt = dt + Math.min(1, (now - last) / 1000);
    while (dt > step) {
        dt = dt - step;
        gameManager.update();
    }
	last = now;
    counter++;
	ANIM = requestAnimationFrame(updateWorld, canvas);
    
}

window.onload = function(){
	document.getElementById("records").innerHTML = scoreTable.get();
}
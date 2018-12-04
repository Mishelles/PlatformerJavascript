var canvas = document.getElementById("canvasId"), ctx = canvas.getContext("2d"); 
var elem = document.getElementById('hBody'), elem1 = document.getElementById('aResult');
var ANIM;

const eventManager = new EventManager();
const gameManager = new GameManager();
const soundManager = new SoundManager();
const mapManager = new MapManager();
const spriteManager = new SpriteManager();
const physicManager = new PhysicManager();

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

var step = 1/20, counter = 0, dt = 0, now, last = timestamp();

window.onload = function(){
	document.getElementById("records").innerHTML = scoreTable.get();
}
// Getting elements
var stick = document.getElementById("stick");
var svg = document.getElementById("svgRoot");
var message = document.getElementById("message");
var stat = document.getElementById("stats");
var health= document.getElementById("health");
var score= document.getElementById("score");

// Stick
var stickWidth = stick.width.baseVal.value;
var stickHeight = stick.height.baseVal.value;
var stickWhiteMargin = 25;
var stickX;
var stickY;
var stickSpeed = 0;
var hearts = 3;
var inertia = 0;//0.80;

// profs
var profs = [];
var profID = 0;
var destroyedprofsCount = 0;
var profWidth = 30;
var profHeight = 50;
var markFont = "Verdana";
var markFontSize = 10;
var marks = ["A+","A","A-","B+","B","B-","C+","C","D","F"];

// Misc.
var minX = 0;
var minY = 0;
var maxX;
var maxY;
var startDate;
var requirement = 100;
var isPaused = false;

// prof function
function prof(id, x, y) {
    var isDead = false;
	var id = id;
    var position = { x: x, y: y };
	var speed = 4;//Math.random()*2+4;
	var speedY=0;
	var val = marks[Math.floor(Math.random()*marks.length)];
	
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    var mark = document.createElementNS("http://www.w3.org/2000/svg", "text");
    g.appendChild(rect);
	mark.appendChild(document.createTextNode(val));
    g.appendChild(mark);
	svg.appendChild(g);
	
    rect.setAttribute("width", profWidth);
    rect.setAttribute("height", profHeight);
	
    // Random green color
    var chars = "456789abc";
    var color = "";
    for (var i = 0; i < 2; i++) {
        var rnd = Math.floor(chars.length * Math.random());
        color += chars.charAt(rnd);
    }
    mark.setAttribute("fill", "blue");
    rect.setAttribute("fill", Math.random()<.5?"#00" + color + "00":"#" + color + "0000");
	
    this.drawAndMove = function () {
        if (isDead)
            return;
        // Drawing
        rect.setAttribute("x", position.x);
        mark.setAttribute("x", position.x);
        rect.setAttribute("y", position.y);
        mark.setAttribute("y", position.y+35);
        // mark.setAttribute("font-family", markFont);
        // mark.setAttribute("font-size", markFontSize);
		position.x -= speed;
		//speedY += (Math.random()-.5)*speed;
		position.y += speedY;
		position.y =  position.y > minY?(position.y<maxY?position.y:maxY):minY;
        // rect.setAttribute("onclick", "this.kill");
        g.setAttribute("onmousedown", "profs["+id+"].kill()");
        g.setAttribute("xlink:href", "#");
        // Collision
        if (position.x < minX)
            this.remove();

        if (stickX + stickWidth - stickWhiteMargin < position.x || stickX +stickWhiteMargin > position.x + profWidth)
            return;
		
        if (stickY + stickHeight < position.y || stickY > position.y + profHeight)
            return;
        // Kill
        this.kill();

    };

    // Killing a prof
	// this.onclick = this.kill();
	
    this.kill = function () {
        if (isDead)
            return;
		if (isPaused) {
			message.innerHTML = "Game paused !";
			message.style.visibility = "visible";
			setTimeout(function() { message.style.visibility = "hidden"; }, 1000);
			return;
		}
        destroyedprofsCount-= marks.indexOf(val)-6;
		if (val == "F") {
			hearts-= 1;
		}
        this.remove();
    };
	
	this.remove = function () {
        isDead = true;
        svg.removeChild(g);
    };
}

// Stick movement
function moveStick() {
    stickY += stickSpeed;

    stickSpeed *= inertia;

    if (stickY < minY - (stickHeight-profHeight)/2)
        stickY = minY - (stickHeight-profHeight)/2;

    if (stickY > maxY - (stickHeight-profHeight)/2)
        stickY = maxY - (stickHeight-profHeight)/2;
}

registerMouseMove(document.getElementById("gameZone"), function (posx, posy, previousX, previousY) {
    stickSpeed += (posy - previousY);
});

window.addEventListener('keydown', function (evt) {
    switch (evt.keyCode) {
        // Left arrow
        // case 37:
            // stickSpeed -= 10;
            // break;
        // Up arrow
        case 38:
            stickSpeed -= (maxY-minY)/2;
            break;
        // Right arrow
        // case 39:
            // stickSpeed -= 10;
            // break;
        // Down arrow
        case 40:
            stickSpeed += (maxY-minY)/2;
            break;
    }
}, true);

function checkWindow() {
    maxX = window.innerWidth - minX;
    maxY = (window.innerHeight - 130 - 40 - minY);
	minY = maxY/3;
    stickX = minX + 30;
}

function gameLoop() {
    moveStick();

    // profs
	if (Math.random() < 0.02) {
		profs[profID++] = new prof(profID-1, maxX, Math.floor(Math.random()*3+1)*minY);
	}
	
    for (var index = 0; index < profs.length; index++) {
        profs[index].drawAndMove();
    }

    // Stick
    stick.setAttribute("x", stickX);
    stick.setAttribute("y", stickY);
	
	// Score
	score.innerHTML = destroyedprofsCount+"/"+requirement;
	
	// Health
	health.innerHTML = Array(hearts+1).join("♥");
	
	// Stat
	
    
    // Victory ?
    if (destroyedprofsCount >= requirement) {
        win();
    }
	
	// Lost ?
	if (hearts < 1) {
		lost();
	}
}

function generateprofs() {
    // Removing previous ones
    for (var index = 0; index < profs.length; index++) {
        profs[index].remove();
    }
	
    profID = 0;
}

var gameIntervalID = -1;

function lost() {
    clearInterval(gameIntervalID);
    gameIntervalID = -1;
    
    message.innerHTML = "Game over !";
    message.style.visibility = "visible";
	
	initGame();
}

function win() {
    clearInterval(gameIntervalID);
    gameIntervalID = -1;

    var end = (new Date).getTime();

    message.innerHTML = "Victory ! (" + Math.round((end - startDate) / 1000) + "s)";
    message.style.visibility = "visible"; 
}

function initGame() {
    destroyedprofsCount = 0;

    checkWindow();
    
    stickY = minY - (stickHeight-profHeight)/2;
    
    stickSpeed = 0;

    generateprofs();
    gameLoop();
}

function startGame() {
    message.style.visibility = "hidden";
    initGame();


    if (gameIntervalID > -1)
        clearInterval(gameIntervalID);

    startDate = (new Date()).getTime();
	resumeGame();
}

function resumeGame() {
    if (gameIntervalID > -1)
        clearInterval(gameIntervalID);

    gameIntervalID = setInterval(gameLoop, 16);
	stick.setAttribute("xlink:href","run.gif");
	isPaused = false;
    document.getElementById("pause").onclick = pauseGame;
    document.getElementById("pause").innerHTML = "Pause";
}

function pauseGame() {
    if (gameIntervalID > -1)
        clearInterval(gameIntervalID);
	stick.setAttribute("xlink:href","stick.gif");
	isPaused = true;
    document.getElementById("pause").onclick = resumeGame;
    document.getElementById("pause").innerHTML = "Resume";
}

document.getElementById("newGame").onclick = startGame;
document.getElementById("fooBar").onclick = lost;
window.onresize = initGame;

initGame();

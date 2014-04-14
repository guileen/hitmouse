(function() {
// init
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// resource
var screen = {w: 800, h: 500};
var bg = { w: 149, h: 105, img: loadImage('img/bg.png') };
var mouseImg = {w: 149, h: 105, img: loadImage('img/mouse.png')};
var holeFg = {w: 149, h: 105, img: loadImage('img/hole-fg.png')};
var holeBg = {w: 149, h: 105, img: loadImage('img/hole-bg.png')};

function loadImage(src, done) {
    var img = new Image();
    img.src = src;
    done && img.onload(done);
    return img;
}

// ============ render ============
// draw background
function drawBg() {
    var wlen = Math.ceil(screen.w / bg.w);
    var hlen = Math.ceil(screen.h / bg.h);
    for(var i = 0; i < wlen; i++) {
        for(var j=0; j < hlen; j++) {
            ctx.drawImage(bg.img, i*bg.w, j*bg.h);
        }
    }
}

// ----------- game map ----------
var map = {
    holes: [
        // row 1
        {x: 30, y: 50}
      , {x: 230, y: 50}
      , {x: 430, y: 50}
      , {x: 630, y: 50}
        // row 2
      , {x: 30, y: 200}
      , {x: 230, y: 200}
      , {x: 430, y: 200}
      , {x: 630, y: 200}
        // row 3
      , {x: 30, y: 350}
      , {x: 230, y: 350}
      , {x: 430, y: 350}
      , {x: 630, y: 350}
        // row 4
      // , {x: 30, y: 500}
      // , {x: 230, y: 500}
      // , {x: 430, y: 500}
      // , {x: 630, y: 500}
    ]
};

function drawHole(hole) {
    ctx.drawImage(holeBg.img, hole.x, hole.y);
    if(hole.mouse) {
        // ctx.drawImage(mouseImg.img, hole.x, hole.y + hole.mouse.y)
        // slicing mouse
        var mouseH = mouseImg.h - hole.mouse.y - 20;
        ctx.drawImage(mouseImg.img,
            // src x, y, w, h
            0, 0, mouseImg.w, mouseH,
            // dest x, y, w, h
            hole.x, hole.y + hole.mouse.y, mouseImg.w, mouseH)
    }
    ctx.drawImage(holeFg.img, hole.x, hole.y);
}

function drawMap() {
    map.holes.forEach(drawHole);
}

function render() {
    drawBg();
    drawMap();
}

// ============ AI ===========
var nextId = 0;
var mouses = {};
var gameState = 'start'; //load, ready, start, end
var maxMouse = 5;
var activeMouse = 0;

function updateMouse(mouse) {
    if(!mouse) return;
    if(mouse.state == 'up') {
        mouse.y -= mouse.speed
        if(mouse.y <= 0) {
            mouse.y = 0;
            mouse.state = 'down';
        }
    } else if(mouse.state == 'down') {
        mouse.y += mouse.speed;
        if(mouse.y >= mouse.base) {
            // remove mouse
            mouse.parent.mouse = null;
            delete mouses[mouse.id];
            activeMouse --;
            generateCooldown = 0;
        }
    }
}

// generate
var generateCooldown = 0;
function generateMouse() {
    if(generateCooldown > 0) return;
    var rand = randInt(map.holes.length);
    var hole = map.holes[rand];
    if(!hole.mouse) {
        var mouse = hole.mouse = {
            parent: hole
          , id: nextId++
          , state: 'up'
          , speed: 2 // 速度
          , y: 100
          , base: 100
        }
        mouses[mouse.id] = mouse;
        activeMouse ++;
        generateCooldown = randInt(100, 500);
    }
}

function updateMouses() {
    for(var key in mouses) {
        updateMouse(mouses[key]);
    }
    if(activeMouse < maxMouse) {
        // TODO generate cooldown.
        generateCooldown -= elapsed;
        generateMouse();
    }
}

function update() {
    if(gameState == 'start') {
        updateMouses();
    }
}

function snapshot() {
    console.log(map);
    console.log(mouses);
    console.log(activeMouse);
}

// ============ utils ==========
// rand [0, max)
function randInt(min, max) {
    if(!max) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * max);
}

// ============ Loop ===========
var currentTime=Date.now();
var elapsed;
function onTick() {
    var now = Date.now();
    elapsed = now - currentTime;
    currentTime = now;
    update();
    render();
}

setInterval(onTick, 1000/30);

})();

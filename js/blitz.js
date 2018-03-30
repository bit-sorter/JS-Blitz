var blitz = {};
var image_wait;

function drawBuildings() {
  var i;
  
  blitz.buildContext.clearRect(0, 0, 640, 480);

  blitz.bheight = [];
  blitz.tot_height = 0;

  for (i = 0; i < 32; i++) {
    var colour, height, j;

    colour = Math.floor(Math.random() * 4);
    height = Math.floor(Math.random() * (5 + blitz.level)) + 1;

    blitz.bheight[i] = height * 20;
    blitz.tot_height += blitz.bheight[i];

    for (j = 0; j < height; j++) {
      blitz.buildContext.drawImage(blitz.storeyImage[colour], i * 20, 460 - j * 20);
    }
  }
}

function loadImage(path)
{
  var image;

  image = new Image();
  image.src = path;
  image.onload = function(){ blitz.imageCount++; };
  
  return image;
}

function awaitImages()
{
  blitz.canvasContext.fillText("Loading images...", 45, 210);

  if (blitz.imageCount == 12) {
    blitz.canvasContext.font = "18px Arial";
    clearInterval(image_wait);
    reset();
    setInterval(update, 10);
  }
}

function init() {
  var canvas;

  canvas = document.getElementById('background');
  blitz.canvasContext = canvas.getContext('2d');
  blitz.canvasContext.font = "18px Arial";
  blitz.canvasContext.fillStyle = "white";

  blitz.buildCanvas = document.getElementById('buildings');
  blitz.buildContext = blitz.buildCanvas.getContext('2d');

  document.addEventListener("click", mouseClick);
  document.addEventListener("keydown", keyDown);

  blitz.bang = false;
  blitz.gameOver = false;
  blitz.imageCount = 0;
  blitz.level = 1;
  blitz.moonBlink = 0;
  blitz.score = 0;
  blitz.wellDone = false;

  blitz.backgroundImage = loadImage("png/background.png");

  blitz.bombImage = loadImage("png/bomb.png");

  blitz.bangImage = loadImage("png/bang.png");

  blitz.planeImage = [];
  blitz.planeImage[0] = loadImage("png/plane_01.png");
  blitz.planeImage[1] = loadImage("png/plane_02.png");

  blitz.storeyImage = [];
  blitz.storeyImage[0] = loadImage("png/storey_01.png");
  blitz.storeyImage[1] = loadImage("png/storey_02.png");
  blitz.storeyImage[2] = loadImage("png/storey_03.png");
  blitz.storeyImage[3] = loadImage("png/storey_04.png");

  blitz.moonImage = [];
  blitz.moonImage[0] = loadImage("png/moon_01.png");
  blitz.moonImage[1] = loadImage("png/moon_02.png");
  blitz.moonImage[2] = loadImage("png/moon_03.png");

  blitz.canvasContext.font = "70px Arial";
  image_wait = setInterval(awaitImages, 100);
}

function stoppedState()
{
  if (blitz.wellDone) {
    blitz.wellDone = false;
    reset();
    return true;
  } else if (blitz.gameOver) {
    blitz.level = 1;
    blitz.score = 0;
    blitz.gameOver = false;
    reset();
    return true;
  }

  return false;
}

function dropBomb()
{
  if (!blitz.bomb_falling && !blitz.paused) {
    blitz.moonBlink = 1;
    blitz.bombX = Math.floor(blitz.planeX / 20) * 20;
    if (blitz.bombX >= 0) {
      blitz.bombY = blitz.planeY + 20;
      blitz.bomb_falling = true;
    }
  }
}

function mouseClick(event) {
  if (stoppedState()) {
    return;
  }

  dropBomb();
}

function keyDown(event) {
  if (stoppedState()) {
    return;
  }

  if (event.key == ' ') {
    dropBomb();
  } else if (event.key == 'p') {
    blitz.paused = !blitz.paused;
  }
}

function moveBomb() {
  var bindx;

  blitz.bombY += 2;
  bindx = Math.floor(blitz.bombX / 20);

  if (blitz.bheight[bindx] > 0 && blitz.bombY > 450 - blitz.bheight[bindx]) {
    blitz.buildContext.clearRect(bindx * 20, 480 - blitz.bheight[bindx], 20, 20);
    blitz.bheight[bindx] -= 20;
    blitz.tot_height -= 20;
    blitz.bang_x = blitz.bombX - 60;
    blitz.bang_y = blitz.bombY - 20;
    blitz.bang_timer = 5;
    blitz.bang = true;
    blitz.score += 20;
    blitz.moonBlink = 0;
    resetBomb();
  } else if (blitz.bombY > 480) {
    resetBomb();
  }
}

function testCrash() {
  var bheight, bindx;

  bindx = 2 + Math.floor(blitz.planeX / 20);
  
  if (bindx >= 0 && bindx < 32) {
    bheight = blitz.bheight[bindx];
  
    if (bheight > 0 && blitz.planeY > 440 - bheight) {
      blitz.bang_x = blitz.planeX - 20;
      blitz.bang_y = blitz.planeY - 30;
      blitz.bang_timer = 5;
      blitz.bang = true;
      blitz.gameOver = true;
      blitz.paused = true;
      blitz.moonBlink = 2;
    }
  }
}

function movePlane() {
  blitz.planeX++;

  if (blitz.planeX > 640) {
    blitz.planeX = -blitz.planeImage[0].width;
    blitz.planeY += 10;
  } else {
    testCrash();
  }
}

function resetBomb() {
  blitz.bomb_falling = false;
}

function resetPlane() {
  blitz.planeX = blitz.planeY = 10;
}

function reset() {
  resetPlane();
  resetBomb();
  blitz.moonBlink = 0;
  drawBuildings();
  blitz.paused = false;
}

function next_level()
{
  blitz.level++;
  blitz.paused = true;
  blitz.wellDone = true;
}

function update() {
  blitz.canvasContext.drawImage(blitz.backgroundImage, 0, 0);
  blitz.canvasContext.drawImage(blitz.buildCanvas, 0, 0);
  blitz.canvasContext.fillText("Score " + blitz.score, 5, 20);

  blitz.canvasContext.drawImage(blitz.moonImage[blitz.moonBlink], 570, 10);

  if (!blitz.paused) {
    blitz.canvasContext.drawImage(blitz.planeImage[0], blitz.planeX, blitz.planeY);
    movePlane();
  } else {
    blitz.canvasContext.drawImage(blitz.planeImage[1], blitz.planeX, blitz.planeY);
  }

  if (blitz.bomb_falling) {
    blitz.canvasContext.drawImage(blitz.bombImage, blitz.bombX, blitz.bombY);
    if (!blitz.paused) {
      moveBomb();
    }
  }

  if (blitz.wellDone) {
    blitz.canvasContext.font = "100px Arial";
    blitz.canvasContext.fillText("Well Done!", 75, 210);
    blitz.canvasContext.font = "18px Arial";
  }

  if (blitz.bang) {
    blitz.canvasContext.drawImage(blitz.bangImage, blitz.bang_x, blitz.bang_y);
    if (!blitz.paused) {
      blitz.bang_timer--;
      if (blitz.bang_timer == 0) {
        blitz.bang = false;
        if (blitz.tot_height == 0) {
          next_level();
        }
      }
    }
  }

  if (blitz.gameOver) {
    blitz.canvasContext.font = "100px Arial";
    blitz.canvasContext.fillText("Game Over!", 60, 210);
    blitz.canvasContext.font = "18px Arial";
  }
}

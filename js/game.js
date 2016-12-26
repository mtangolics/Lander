var ShipStates = {
  BASE: 0,
  LEFT_ROCKET: 1,
  RIGHT_ROCKET: 2,
  BOTTOM_RIGHT_ROCKET: 3,
  BOTTOM_LEFT_ROCKET: 4,
  EXPLOSION: 5,
  BOTTOM_ROCKET: 6
};

var GameStates = {
  PLAYING: 0,
  WIN: 1,
  LOSE: 2
};

var Keys = {
  UP: 38,
  LEFT: 37,
  RIGHT: 39,
  DOWN: 40,
  ENTER: 13
};

var LanderGame = function() {
};

LanderGame.prototype.load = function() {
  this.imgShipSprite = new Image(700,92);
  var self = this;
  this.imgShipSprite.addEventListener('load', function() {
    // Sprite has finished loaded so the game can be initialized
    self.init();
  });
  this.imgShipSprite.src = 'img/ship_sprite.png';
};

LanderGame.prototype.init = function() {
  this.CANVAS_WIDTH = 1000;
  this.CANVAS_HEIGHT = 800;
  this.CUR_GRAVITY = -20;
  this.FPS = 30;
  this.PIXEL_RATIO = 5/1;
  this.MAX_FUEL = 500;

  this.downKeys = [];
  this.fuel = this.MAX_FUEL;

  this.rocketPosX = this.CANVAS_WIDTH/2;
  this.rocketPosY = 100;

  this.rocketVy = 0;
  this.rocketVx = 0;

  this.originX = this.CANVAS_WIDTH/2;
  this.originY = this.CANVAS_HEIGHT;

  this.shipSpriteState = ShipStates.BASE;

  this.gameState = GameStates.PLAYING;

  this.terrainPositions = [];

  this.generateTerrain();

  this.canvas = document.getElementById('GameCanvas').getContext('2d');

  var self = this;

  document.addEventListener('keydown', function(ev) {

    if(ev.keyCode === Keys.ENTER && self.gameState !== GameStates.PLAYING) {
      self.newGame();
    }

    if(!self.isKeyDown(ev.keyCode)) {
      self.downKeys.push(ev.keyCode);
    }
  });

  document.addEventListener('keyup', function(ev) {
      var idx = self.downKeys.indexOf(ev.keyCode);
      if(idx != -1) {
        self.downKeys.splice(idx,1);
      }
  });

  // Update variables and redraw 30 times per second
  this.gameTimer = setInterval(function() {
    self.update();
    self.draw();
  }, 1000/this.FPS);

};

LanderGame.prototype.isKeyDown = function(k) {
  return this.downKeys.indexOf(k) != -1;
};

LanderGame.prototype.generateTerrain = function() {
  for(var i = 0; i < 5; i++) {
    // x, y, radius
    this.terrainPositions.push({x:this.randomRange(i*200,(i+1)*200),y: this.CANVAS_HEIGHT - 80, r: this.randomRange(70,110)});
  }
};

LanderGame.prototype.draw = function() {
  this.canvas.clearRect(0,0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
  this.canvas.font = '36px sans-serif';
  this.canvas.textAlign = 'center';

  this.drawShipSprite();

	this.canvas.fillStyle = 'gray';
	this.canvas.fillRect(0, this.CANVAS_HEIGHT - 100, this.CANVAS_WIDTH, 100);

  for(var i = 0; i < 5; i++) {
    // draw randomly placed circles to form the terrain
    this.drawCircle(this.terrainPositions[i]);
  }

  if(this.gameState === GameStates.WIN) {
    this.canvas.fillStyle = 'green';
  	this.canvas.fillText('SUCCESS', this.CANVAS_WIDTH/2, this.CANVAS_HEIGHT/2 - 100);
  }
  else if(this.gameState === GameStates.LOSE) {
    this.canvas.fillStyle = 'red';
  	this.canvas.fillText('FAILURE', this.CANVAS_WIDTH/2, this.CANVAS_HEIGHT/2 - 100);
  }

  if(this.gameState !== GameStates.PLAYING) {
    this.canvas.fillStyle = 'white';
    this.canvas.fillText('Press [Enter] to restart', this.CANVAS_WIDTH/2, this.CANVAS_HEIGHT/2);
  }

  this.canvas.fillStyle = 'white';
  this.canvas.font = '24px sans-serif';
  this.canvas.textAlign = 'left';
  this.canvas.fillText('Fuel: ' + (this.fuel <= 0 ? 0 : this.fuel), 10, 30);
};

LanderGame.prototype.drawShipSprite = function() {
  // Draw the ship sprite centered over the coordinates
  this.canvas.drawImage(this.imgShipSprite, this.shipSpriteState*100, 0, 100, 92, this.rocketPosX - 52, this.rocketPosY - 68, 100, 92);
};

LanderGame.prototype.update = function() {

  if(this.gameState === GameStates.PLAYING) {

    this.updateThrust();

    this.rocketVy -= this.CUR_GRAVITY/this.FPS;

    if(this.rocketPosY + (this.rocketVy / this.PIXEL_RATIO) > (this.CANVAS_HEIGHT - 100)) {
      // Fail if the rocket hits the ground with a vertical or horizontal velocity exceeding 10
      if(this.rocketVy > 10 || this.rocketVx > 10) {
        this.shipSpriteState = ShipStates.EXPLOSION;
        this.gameState = GameStates.LOSE;
      }
      else {
        this.shipSpriteState = ShipStates.BASE;
        this.gameState = GameStates.WIN;
      }
      this.rocketPosY = this.CANVAS_HEIGHT - 100;
    }
    else {
      // Rocket hasn't hit the ground yet, so continue updating
      this.rocketPosY += (this.rocketVy / this.PIXEL_RATIO);
  		this.rocketPosX += (this.rocketVx / this.PIXEL_RATIO);
      // Check for collision with terrain
      this.collisionDetection();
    }
  }
};

LanderGame.prototype.updateThrust = function() {
  if(this.downKeys.length === 0) {
    this.shipSpriteState = ShipStates.BASE;
  }
  else if(this.fuel > 0){
    if(this.isKeyDown(Keys.UP)) {
      this.rocketVy -= 2;
      this.fuel -= 2;
      this.shipSpriteState = ShipStates.BOTTOM_ROCKET;
      if(this.isKeyDown(Keys.LEFT)) {
        this.rocketVx -= 1.5;
        this.fuel -= 1.5;
        this.shipSpriteState = ShipStates.BOTTOM_RIGHT_ROCKET;
      }
      else if(this.isKeyDown(Keys.RIGHT)) {
        this.rocketVx += 1.5;
        this.fuel -= 1.5;
        this.shipSpriteState = ShipStates.BOTTOM_LEFT_ROCKET;
      }
    }
    else if (this.isKeyDown(Keys.LEFT)) {
      this.rocketVx -= 1.5;
      this.fuel -= 1.5;
      this.shipSpriteState = ShipStates.RIGHT_ROCKET;
    }
    else if (this.isKeyDown(Keys.RIGHT)) {
      this.rocketVx += 1.5;
      this.fuel -= 1.5;
      this.shipSpriteState = ShipStates.LEFT_ROCKET;
    }
  }
};

LanderGame.prototype.collisionDetection = function() {
  for(var i = 0; i < this.terrainPositions.length; i++) {
    // d1 = distance between terrain origin and the bottom left corner of rocket hitbox
    // d2 = distance between terrain origin and the bottom right corner of rocket hitbox
    var d1 = Math.pow(this.terrainPositions[i].y - (this.rocketPosY-3),2) + Math.pow(this.terrainPositions[i].x - (this.rocketPosX-20),2);
    var d2 = Math.pow(this.terrainPositions[i].y - (this.rocketPosY-3),2) + Math.pow(this.terrainPositions[i].x - (this.rocketPosX+20),2);
    var r2 = Math.pow(this.terrainPositions[i].r,2);

    if(d1 <= r2 || d2 <= r2) {
      // Trigger a collision because we've intersected with one of the terrain elements
      this.shipSpriteState = ShipStates.EXPLOSION;
      this.gameState = GameStates.LOSE;
    }
  }
};

LanderGame.prototype.drawCircle = function(data) {
  this.canvas.fillStyle = 'gray';
  this.canvas.strokeStyle = 'gray';
  this.canvas.beginPath();
	this.canvas.arc(data.x,data.y,data.r,2*Math.PI, false)
	this.canvas.fill();
	this.canvas.stroke();
};

LanderGame.prototype.newGame = function() {
  // reset the necessary variables
  this.rocketPosX = this.CANVAS_WIDTH/2;
  this.rocketPosY = 100;

  this.rocketVy = 0;
  this.rocketVx = 0;

  this.fuel = this.MAX_FUEL;

  this.shipSpriteState = ShipStates.BASE;

  this.terrainPositions = [];

  this.generateTerrain();

  this.gameState = GameStates.PLAYING;
};

LanderGame.prototype.randomRange = function(min,max) {
  return Math.round(Math.random() * (max-min) + min);
};

window.onload = function() {
  var game = new LanderGame();
  game.load();
};

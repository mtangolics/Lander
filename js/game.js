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

var LanderGame = function() {
};

LanderGame.prototype.load = function() {
  this.imgShipSprite = new Image(700,92);
  var self = this;
  this.imgShipSprite.addEventListener('load', function() {
    self.init();
  });
  this.imgShipSprite.src = 'img/ship_sprite.png';
};

LanderGame.prototype.isKeyDown = function(k) {
  return this.downKeys.indexOf(k) != -1;
};

LanderGame.prototype.init = function() {
  this.CANVAS_WIDTH = 1000;
  this.CANVAS_HEIGHT = 800;
  this.CUR_GRAVITY = -20; // m/s^2
  this.FPS = 30;
  this.PIXEL_RATIO = 5/1;
  this.MAX_FUEL = 500;

  this.downKeys = [];
  this.fuel = this.MAX_FUEL;

  this.satPosX = this.CANVAS_WIDTH/2;
  this.satPosY = 100;

  this.satVy = 0;
  this.satVx = 0;

  this.originX = this.CANVAS_WIDTH/2;
  this.originY = this.CANVAS_HEIGHT;

  this.shipSpriteState = ShipStates.BASE;

  this.gameState = GameStates.PLAYING;

  this.terrainPositions = [];

  this.generateTerrain();
  //console.log(this.terrainPositions);

  this.canvas = document.getElementById('GameCanvas').getContext('2d');

  var self = this;

  document.addEventListener('keydown', function(ev) {

    if(ev.keyCode === 13 && this.gameState !== GameStates.PLAYING) {
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

  this.gameTimer = setInterval(function() {
    self.update();
    self.draw();
  }, 1000/this.FPS);

};

LanderGame.prototype.generateTerrain = function() {
  for(var i = 0; i < 5; i++) {
    this.terrainPositions.push({x:this.randomRange(i*200,(i+1)*200),y: this.CANVAS_HEIGHT - 80, r: this.randomRange(70,125)});
  }
};

LanderGame.prototype.updateThrust = function() {
  if(this.downKeys.length === 0) {
    this.shipSpriteState = ShipStates.BASE;
  }
  else if(this.fuel > 0){
    if(this.isKeyDown(38)) {
      this.satVy -= 2;
      this.fuel -= 2;
      this.shipSpriteState = ShipStates.BOTTOM_ROCKET;
      if(this.isKeyDown(37)) {
        this.satVx -= 1.5;
        this.fuel -= 1.5;
        this.shipSpriteState = ShipStates.BOTTOM_RIGHT_ROCKET;
      }
      else if(this.isKeyDown(39)) {
        this.satVx += 1.5;
        this.fuel -= 1.5;
        this.shipSpriteState = ShipStates.BOTTOM_LEFT_ROCKET;
      }
    }
    else if (this.isKeyDown(37)) {
      this.satVx -= 1.5;
      this.fuel -= 1.5;
      this.shipSpriteState = ShipStates.RIGHT_ROCKET;
    }
    else if (this.isKeyDown(39)) {
      this.satVx += 1.5;
      this.fuel -= 1.5;
      this.shipSpriteState = ShipStates.LEFT_ROCKET;
    }
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
  // midline -52,-68
  this.canvas.drawImage(this.imgShipSprite, this.shipSpriteState*100, 0, 100, 92, this.satPosX - 52, this.satPosY - 68, 100, 92);
  this.canvas.fillStyle = 'red';
  //this.canvas.fillRect(this.satPosX+20,this.satPosY-3,2,2);
};

LanderGame.prototype.update = function() {

  if(this.gameState === GameStates.PLAYING) {

    this.updateThrust();

    this.satVy -= this.CUR_GRAVITY/this.FPS;

    if(this.satPosY + (this.satVy / this.PIXEL_RATIO) > (this.CANVAS_HEIGHT - 100)) {
      if(this.satVy > 10 || this.satVx > 10) {
        this.shipSpriteState = ShipStates.EXPLOSION;
        this.gameState = GameStates.LOSE;
      }
      else {
        this.shipSpriteState = ShipStates.BASE;
        this.gameState = GameStates.WIN;
      }
      this.satPosY = this.CANVAS_HEIGHT - 100;
    }
    else {
      this.satPosY += (this.satVy / this.PIXEL_RATIO);
  		this.satPosX += (this.satVx / this.PIXEL_RATIO);
      this.collisionDetection();
    }
  }
};

LanderGame.prototype.collisionDetection = function() {
  for(var i = 0; i < this.terrainPositions.length; i++) {
    var d1 = Math.pow(this.terrainPositions[i].y - (this.satPosY-3),2) + Math.pow(this.terrainPositions[i].x - (this.satPosX-20),2);
    var d2 = Math.pow(this.terrainPositions[i].y - (this.satPosY-3),2) + Math.pow(this.terrainPositions[i].x - (this.satPosX+20),2);
    var r2 = Math.pow(this.terrainPositions[i].r,2);

    if(d1 <= r2 || d2 <= r2) {
      //collision
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
  this.satPosX = this.CANVAS_WIDTH/2;
  this.satPosY = 100;

  this.satVy = 0;
  this.satVx = 0;

  this.fuel = this.MAX_FUEL;

  this.shipSpriteState = ShipStates.BASE;

  this.gameState = GameStates.PLAYING;
};

LanderGame.prototype.randomRange = function(min,max) {
  return Math.round(Math.random() * (max-min) + min);
};

window.onload = function() {
  var game = new LanderGame();
  game.load();
  //game.init();
};

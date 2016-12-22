var ShipStates = {
  BASE : 0,
  LEFT_ROCKET : 1,
  RIGHT_ROCKET : 2,
  BOTTOM_ROCKET : 4,
  EXPLOSION : 5
};


var LanderGame = function() {
};

LanderGame.prototype.load = function() {
  this.imgShipSprite = new Image(600,92);
  var self = this;
  this.imgShipSprite.addEventListener('load', function() {
    self.init();
  });
  this.imgShipSprite.src = 'img/ship_sprite.png';
};

LanderGame.prototype.init = function() {
  this.CANVAS_WIDTH = 700;
  this.CANVAS_HEIGHT = 700;
  this.CUR_GRAVITY = -9.8; // m/s^2
  this.FPS = 30;

  this.MASS_SAT = 100; // kg
  this.PIXEL_RATIO = 10/1;

  this.satPosX = this.CANVAS_WIDTH/2;
  this.satPosY = 100;

  this.satVy = 0;
  this.satVx = 0;

  this.originX = this.CANVAS_WIDTH/2;
  this.originY = this.CANVAS_HEIGHT;

  this.shipSpriteState = ShipStates.BASE;

  this.isPlaying = true;

  this.canvas = document.getElementById('GameCanvas').getContext('2d');
  var self = this;

  $('body').on('keydown', function(ev) {
  	//console.log(ev.keyCode);
  		if (ev.keyCode == 38) {
  			self.satVy -= 2;
        self.shipSpriteState = ShipStates.BOTTOM_ROCKET;
  		}
  		if (ev.keyCode == 37) {
  			self.satVx -= 1.5;
        self.shipSpriteState = ShipStates.RIGHT_ROCKET;
  		}
  		if (ev.keyCode == 39) {
  			self.satVx += 1.5;
        self.shipSpriteState = ShipStates.LEFT_ROCKET;
  		}
  });

  $('body').on('keyup', function(ev) {
  	//console.log(ev.keyCode);
  		if (ev.keyCode == 38) {
        self.shipSpriteState = ShipStates.BASE;
  		}
  		if (ev.keyCode == 37) {
  		}
  		if (ev.keyCode == 39) {

  		}
  });

  this.gameTimer = setInterval(function() {
    self.update();
    self.draw();
  }, 1000/this.FPS);

};

LanderGame.prototype.draw = function() {
  this.canvas.clearRect(0,0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

  this.drawShipSprite();

	this.canvas.strokeStyle = "darkgreen";
	this.canvas.fillStyle = "darkgreen";

	this.canvas.fillRect(0, this.CANVAS_HEIGHT - 100, this.CANVAS_WIDTH, 100);

	this.canvas.strokeStyle = "red";
	this.canvas.fillStyle = "red";
	//this.canvas.fillRect(this.satPosX, this.satPosY, 20, 20);
	//this.canvas.fill();
	//this.canvas.stroke();

	this.canvas.fillText('Vy: ' + Math.round(this.satVy) + ' m/s', 5, 15);
	this.canvas.fillText('y: ' + Math.round((this.CANVAS_HEIGHT - this.satPosY)*this.PIXEL_RATIO) + ' m', 5, 30);
};

LanderGame.prototype.gameOver = function(win) {
  clearInterval(this.gameTimer);
  this.isPlaying = false;

  if(win) {

  }
  else {

  }
};

LanderGame.prototype.drawShipSprite = function() {
  this.canvas.drawImage(this.imgShipSprite, this.shipSpriteState*100, 0, 100, 92, this.satPosX - 42, this.satPosY - 50, 100, 92);
};

LanderGame.prototype.update = function() {
  this.satVy -= this.CUR_GRAVITY/this.FPS;

	if(this.satPosY + (this.satVy / this.PIXEL_RATIO) > (this.CANVAS_HEIGHT - 120)) {
		//console.log("Collision!");
		if(this.satVy > 10 || this.satVx > 10) {
			console.log("Cratered!");
      this.shipSpriteState = ShipStates.EXPLOSION;
		}
		else {
			console.log("Safe landing!");
		}
		this.satPosY = this.CANVAS_HEIGHT - 120;
    this.gameOver(false);
	}
	else {
		this.satPosY += (this.satVy / this.PIXEL_RATIO);
		this.satPosX += (this.satVx / this.PIXEL_RATIO);
	}
};
$(document).ready(function() {
  var game = new LanderGame();
  game.load();
  //game.init();
});

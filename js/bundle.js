/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(1);

	$( document ).ready(function() {
	  // create game
	  var game = Game.create();
	  game.init("game-canvas");

	  // add control listeners
	  $("#pause").click(function() {
	    game.togglePause();
	  });
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Spaceship = __webpack_require__(2);
	var AssetManager = __webpack_require__(8);
	var PauseScreen = __webpack_require__(10);

	function Game() {

	  this.isPaused = false;
	  this.stage = null;

	  this.assetManager = AssetManager.create();
	  this.pauseScreen = PauseScreen.create();

	  this.healthId = "health";

	  // this.pauseScreen = null;
	  // this.pauseText = null;
	  // this.switchText = null;

	  this.init = function(gameCanvasId) {
	    this.stage = new createjs.Stage(gameCanvasId);
	    this.stage.addEventListener("click", this._fire.bind(this));
	    this.assetManager.init(this.stage, 8, 90);
	    this._configureTicker();
	  };

	  this.tick = function() {
	    if (!this.isPaused) {
	      this.assetManager.updateAssets();
	      this._updateHealth();
	    }
	    this.stage.update();
	  };

	  this.togglePause = function() {
	    this.isPaused = !this.isPaused;
	    if (this.isPaused) {
	      // probably should pass it some config data or at least the space ship
	      this.pauseScreen.init(this.stage);
	    } else {
	      var selectedweapon = this.pauseScreen.tearDown(this.stage);
	      this.assetManager.player1.switchWeapon(selectedweapon);
	    }
	  };

	  this._configureTicker = function() {
	    createjs.Ticker.useRAF = true; // not sure what this does yt
	    createjs.Ticker.setFPS(60);
	    createjs.Ticker.addEventListener("tick", this.tick.bind(this));
	  };

	  this._fire = function() {
	    if (!this.isPaused) {
	      this.assetManager.firePlayer1();
	    }
	  };

	  this._switchWeapon = function() {
	    console.log("BOOM");
	    this.assetManager.player1.switchWeapon();
	  };

	  this._updateHealth = function() {
	    document.getElementById(this.healthId).innerHTML = this.assetManager.getPlayerHealth();
	  };

	}

	function GameFactory() {
	  this.create = function() {
	    return new Game();
	  };
	}

	module.exports = new GameFactory();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var NavigationSystem = __webpack_require__(3);
	var WeaponsSystem = __webpack_require__(5);

	function SpaceShip(imagePath) {

	  // game attributes
	  this.health = 100;

	  this.navigationSystem = NavigationSystem.create();
	  this.weaponsSystem = WeaponsSystem.create();

	  // visual attributes
	  this.spriteSheet = new createjs.SpriteSheet({
	    images: [imagePath],
	    frames: {width:100, height:100, regX: 50, regY: 50},
	    animations: {
	      default: {
	        frames: [0, 1],
	        speed: 0.1
	      },
	      damaged: {
	        frames: [2, 3],
	        speed: 0.1
	      }
	    }
	  });
	  this.sprite = new createjs.Sprite(this.spriteSheet, "default");
	  this.radius = 50;

	  this.getSelf = function() {
	    return this.sprite;
	  };

	  this.move = function() {
	    var direction = this.navigationSystem.direction;
	    if (direction === "right") {
	      this.moveSpaces(1, 0);
	    } else if (direction === "left") {
	      this.moveSpaces(-1, 0);
	    } else if (direction === "up") {
	      this.moveSpaces(0, -1);
	    } else if (direction === "down") {
	      this.moveSpaces(0, 1);
	    }

	  };

	  this.moveAttemptCompleted = function() {
	    this.navigationSystem.incrementAttempts();
	  };

	  this.moveSpaces = function(x, y) {
	    this.sprite.x = this.sprite.x + x;
	    this.sprite.y = this.sprite.y + y;
	  };

	  this.getDirection = function() {
	    return this.navigationSystem.direction;
	  };

	  this.collidesWithCoordinates = function(x, y) {
	    return (this.isWithinXBoundaries(x) && this.isWithinYBoundaries(y));
	  };

	  this.isWithinYBoundaries = function(yValue) {
	    return (yValue >= this.getTopBoundry() && yValue <= this.getBottomBoundry());
	  };

	  this.isWithinXBoundaries = function(xValue) {
	    return (xValue >= this.getLeftBoundry() && xValue <= this.getRightBoundry());
	  };

	  this.getCurrentX = function() {
	    return this.sprite.x;
	  };

	  this.getCurrentY = function() {
	    return this.sprite.y;
	  };

	  this.getLeftBoundry = function() {
	    return (this.sprite.x - this.radius);
	  };

	  this.getRightBoundry = function() {
	    return (this.sprite.x + this.radius);
	  };

	  this.getTopBoundry = function() {
	    return (this.sprite.y - this.radius);
	  };

	  this.getBottomBoundry = function() {
	    return (this.sprite.y + this.radius);
	  };

	  this.moveToX = function (x) {
	    this.sprite.x = x;
	  };

	  this.moveToY = function (y) {
	    this.sprite.y = y;
	  };

	  this.fire = function() {
	    return this.weaponsSystem.fire(this.getCurrentX(), this.getCurrentY() - this.radius);
	  };

	  this.switchWeapon = function(type) {
	    this.weaponsSystem.switchWeapon(type);
	  };

	  this.takeDamage = function(amount) {
	    this.health = this.health - amount;
	    if (this.health < 50) {
	      this.sprite.gotoAndPlay("damaged");
	    }
	  };
	}

	function SpaceShipFactory() {

	  this.create = function(image) {
	    return new SpaceShip(image);
	  };

	}

	module.exports = new SpaceShipFactory();


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var NumberUtility = __webpack_require__(4);

	function NavigationSystem() {

	  this.directions = ["up", "down", "left", "right"];
	  this.direction = "right"; // For now, up, down, right, left
	  this.maxPersistance = 120;
	  this.persistanceCount = NumberUtility.getRandomNumberBetween(1, this.maxPersistance); // random number
	  this.persistanceAttempts = 0;

	  this.resetPersistantCount = function() {
	    this.persistanceCount = NumberUtility.getRandomNumberBetween(1, this.maxPersistance);
	    this.persistanceAttempts = 0;
	  };

	  this.resetDirection = function() {
	    var newDirection = null;
	    var newDirectionSet = false;
	    while (!newDirectionSet) {
	      newDirection = this.directions[NumberUtility.getRandomNumberBetween(0,3)];
	      if (newDirection !== this.direction) {
	        this.direction = newDirection;
	        newDirectionSet = true;
	      }
	    }
	  };

	  this.incrementAttempts = function() {
	    if (this.persistanceAttempts != this.persistanceCount) {
	      this.persistanceAttempts = this.persistanceAttempts + 1;
	    } else {
	      this.resetDirection();
	      this.resetPersistantCount()
	    }

	  };
	}

	function NavigationSystemFactory() {
	  this.create = function() {
	    return new NavigationSystem();
	  };
	}

	module.exports = new NavigationSystemFactory();


/***/ },
/* 4 */
/***/ function(module, exports) {

	function NumberUtility() {

	  this.getRandomNumberBetween = function(min, max) {
	    return Math.floor(Math.random()*(max-min+1)+min);
	  };
	}

	var numberUtility = new NumberUtility();

	module.exports = numberUtility;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var ProjectileFactory = __webpack_require__(6);

	function WeaponsSystem() {

	  this.activeProjectile = "laser";
	  this.availableProjectileTypes = ["laser", "plasma"];

	  this.fire = function(x, y) {
	    var projectile = ProjectileFactory.getProjectile(this.activeProjectile, x, y);
	    projectile.draw();
	    return projectile;
	  };

	  this.switchWeapon = function(type) {
	    this.activeProjectile = type;
	  };
	}

	function WeaponsSystemFactory() {
	  this.create = function() {
	    return new WeaponsSystem();
	  };
	}

	module.exports = new WeaponsSystemFactory();


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Explosion = __webpack_require__(7);

	var Projectiles = {
	  LASER: {
	    speed: 5,
	    damage: 20,
	    height: 12,
	    width: 6,
	    color: "yellow",
	    getShape: function(x, y) {
	      var rectangle = new createjs.Shape();
	      rectangle.graphics.beginFill(this.color).drawRect(0, 0, this.width, this.height);
	      rectangle.x = x;
	      rectangle.y = y;
	      return rectangle;
	    },
	    getHeightModifier: function() {
	      return this.height / 2;
	    }
	  },
	  PLASMA: {
	    speed: 10,
	    damage: 40,
	    radius: 50,
	    color: "#0F0",
	    getShape: function(x, y) {
	      var circle = new createjs.Shape();
	      circle.graphics.beginFill(this.color).drawCircle(0, 0, 10);
	      circle.x = x;
	      circle.y = y;
	      return circle;
	    },
	    getHeightModifier: function() {
	      return this.radius;
	    }
	  }
	};

	function Projectile(startingX, startingY, config) {

	  this.shape = null;

	  this.damage = config.damage;
	  this.speed = config.speed;
	  this.color = config.color;
	  this.getShape = config.getShape;
	  this.getHeightModifier = config.getHeightModifier;

	  this.startingX = startingX;
	  this.startingY = startingY;
	  this.height = 12;
	  this.width = 6;
	  this.isFriendly = true;
	  this.isExpired = false;

	  this.draw = function() {
	    this.shape = this.getShape(this.startingX, this.startingY);
	  };

	  this.getSelf = function() {
	    return this.shape;
	  };

	  this.move = function() {
	    if (this.isFriendly)
	      this.shape.y = this.shape.y - this.speed;
	    else
	      this.shape.y = this.shape.y + this.speed;
	  };

	  this.getTopBoundry = function() {
	    // PLUS OR MINUS?
	    return (this.shape.y - this.getHeightModifier);
	  };

	  this.getBottomBoundry = function() {
	    return (this.shape.y + this.getHeightModifier);
	  };

	  this.getCurrentX = function() {
	    return (this.shape.x);
	  };

	  this.getCurrentY = function() {
	    return (this.shape.y);
	  };

	  this.explode = function() {
	    this.isExpired = true;
	    var explosion = Explosion.create(this.getCurrentX(), this.getCurrentY());
	    explosion.draw();
	    return explosion;
	  };

	}

	function ProjectileFactory() {

	  this.getProjectile = function(type, x, y) {
	    if (type === "laser")
	      return new Projectile(x, y, Projectiles.LASER);
	    else if (type === "plasma")
	      return new Projectile(x, y, Projectiles.PLASMA);
	  };
	}

	module.exports = new ProjectileFactory();


/***/ },
/* 7 */
/***/ function(module, exports) {

	function Explostion(startingX, startingY) {

	  this.triangle = new createjs.Shape();
	  this.startingX = startingX;
	  this.startingY = startingY;

	  this.radius = 35;
	  this.noOfPoints = 7;
	  this.pointSize = 0.5;
	  this.angle = -90;

	  this.isExpired = false;

	  this.draw = function() {
	    this.triangle.graphics.beginFill("#ff9933").drawPolyStar(this.startingX, this.startingY, this.radius, this.noOfPoints, this.pointSize, this.angle);
	  };

	  this.getSelf = function() {
	    return this.triangle;
	  };

	  this.explode = function() {
	    this.radius = this.radius + 5;
	    this.angle = this.angle - 20;
	    this.draw();
	    if (this.radius > 60) {
	      this.isExpired = true;
	    }
	  };
	}

	function ExplosionFactory() {
	  this.create = function(startingX, startingY) {
	    return new Explostion(startingX, startingY);
	  };
	}

	module.exports = new ExplosionFactory();


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var NumberUtility = __webpack_require__(4);
	var Spaceship = __webpack_require__(2);
	var TrafficController = __webpack_require__(9);

	function AssetManager() {

	  this.stage = null;
	  this.height = null;
	  this.width = null;

	  this.backgroundImage1 = new createjs.Bitmap("/demo-game/img/space-background.png");
	  this.backgroundImage2 = new createjs.Bitmap("/demo-game/img/space-background.png");

	  this.player1 = Spaceship.create("/demo-game/img/spaceship.png");
	  this.projectiles = [];
	  this.explosions = [];
	  this.enemyShips = [];

	  this.enemyAttackFrequency = 90;
	  this.frameCount = 0;

	  this.init = function(stage, enemyShipCount, attackFreq) {
	    this.stage = stage;
	    this.height = stage.canvas.height;
	    this.width = stage.canvas.width;
	    this.enemyAttackFrequency = attackFreq;
	    this._setupAssets(enemyShipCount);
	    this._addAssetsToStage(stage);
	  };

	  this.firePlayer1 = function() {
	    if (this.stage.mouseInBounds) {
	      var laser = this.player1.fire();
	      this.projectiles.push(laser);
	      this.stage.addChild(laser.getSelf());
	    }
	  };

	  this.updateAssets = function() {
	    this._moveBackground();
	    this._movePlayerShip();
	    this._moveEnemyShips();
	    this._attackWithEnemyShips(this.stage);
	    this._moveProjectiles();
	    this._handleProjectileCollisions(this.stage);
	    this._updateExplosions();

	    this._removeDestroyedShips(this.stage);
	    this._removeExpiredProjectiles(this.stage);
	    this._removeExpiredExplosions(this.stage);

	    // this.stage.update();
	  };

	  this.getPlayerHealth = function() {
	    return this.player1.health;
	  };

	  /** PRIVATE METHODS **/

	  this._setupAssets = function(enemyShipCount) {
	    this.backgroundImage2.y = -this.height;
	    this.player1.moveToX(this.width/2);
	    this.player1.moveToY(this.height-100);
	    this._createEnemyShips(enemyShipCount);
	  };

	  this._addAssetsToStage = function(stage) {
	    stage.addChild(this.backgroundImage1);
	    stage.addChild(this.backgroundImage2);
	    for (var i = 0; i < this.enemyShips.length; i++) {
	      stage.addChild(this.enemyShips[i].getSelf());
	    }
	    stage.addChild(this.player1.getSelf());
	  };

	  this._createEnemyShips = function(enemyShipCount) {
	    // this logic is ideal for up to 12 ships on an 800 px wide canvas, I'm defering
	    // making this more dynamic since this is a proof of concept
	    var startingX = 50;
	    var startingY = 80;
	    for (var i = 0; i < enemyShipCount; i++) {
	      var enemyShip = Spaceship.create("/demo-game/img/enemy-spaceship.png");
	      enemyShip.moveToX(startingX);
	      enemyShip.moveToY(startingY);
	      this.enemyShips.push(enemyShip);
	      startingX = startingX + 75;
	      if (startingY > 100) {
	        startingY = startingY - 110;
	      } else {
	        startingY = startingY + 110;
	      }
	    }
	  };

	  this._movePlayerShip = function() {
	    if (this.stage.mouseInBounds) {
	      this.player1.moveToX(this.stage.mouseX);
	      this.player1.moveToY(this.stage.mouseY);
	    }
	  };

	  this._moveEnemyShips = function() {
	    for (var n = 0; n < this.enemyShips.length; n++) {
	      var ship = this.enemyShips[n];
	      if (TrafficController.pathIsClear(ship, this.enemyShips, this.projectiles, this.height - 400, this.width)) {
	        ship.move();
	      }
	      ship.moveAttemptCompleted();
	    }
	  };

	  this._attackWithEnemyShips = function(stage) {
	    this.frameCount = this.frameCount + 1;
	    if (this.frameCount >= this.enemyAttackFrequency) {
	      this.frameCount = 0;
	      this._fireEnemyShip(stage);
	    }
	  };

	  this._moveProjectiles = function() {
	    for (var i = 0; i < this.projectiles.length; i++) {
	      var projectile = this.projectiles[i];
	      projectile.move();
	      var xValue = projectile.getCurrentX();
	      var yValue = projectile.getCurrentY();
	      if (xValue > this.width || xValue < 0) {
	        projectile.isExpired = true;
	      } else if (yValue > this.height || yValue < 0) {
	        projectile.isExpired = true;
	      }
	    }
	  };

	  this._handleProjectileCollisions = function(stage) {
	    for (var i = 0; i < this.projectiles.length; i++) {
	      var projectile = this.projectiles[i];
	      if (projectile.isFriendly) {
	        console.log("friendly projectile");
	        this._handleEnemyCollision(stage, projectile);
	      } else if (this.player1.collidesWithCoordinates(projectile.getCurrentX(), projectile.getCurrentY())) {
	        this._handleCollision(projectile, this.player1, stage);
	      }
	    }
	  };

	  this._updateExplosions = function() {
	    for (var i = 0; i < this.explosions.length; i++) {
	      this.explosions[i].explode();
	    }
	  };

	  this._removeDestroyedShips = function(stage) {
	    for (var i = 0; i < this.enemyShips.length; i++) {
	      if (this.enemyShips[i].health <= 0) {
	        stage.removeChild(this.enemyShips[i].getSelf());
	        this.enemyShips.splice(i, 1);
	      }
	    }
	  };

	  this._removeExpiredProjectiles = function(stage) {
	    for (var i = 0; i < this.projectiles.length; i++) {
	      if (this.projectiles[i].isExpired) {
	        stage.removeChild(this.projectiles[i].getSelf());
	        this.projectiles.splice(i, 1);
	      }
	    }
	  };

	  this._removeExpiredExplosions = function(stage) {
	    for (var i = 0; i < this.explosions.length; i++) {
	      if (this.explosions[i].isExpired) {
	        stage.removeChild(this.explosions[i].getSelf());
	        this.explosions.splice(i, 1);
	      }
	    }
	  };

	  this._fireEnemyShip = function(stage) {
	    var randomIndex = NumberUtility.getRandomNumberBetween(this.enemyShips.length - 1, 0);
	    console.log(randomIndex);
	    var projectile = this.enemyShips[randomIndex].fire();
	    projectile.isFriendly = false;
	    this.projectiles.push(projectile);
	    stage.addChild(projectile.getSelf());
	  };

	  this._moveBackground = function() {
	    if (this.backgroundImage1.y > this.height) {
	      this.backgroundImage1.y = -this.height;
	    }
	    if (this.backgroundImage2.y > this.height) {
	      this.backgroundImage2.y = -this.height;
	    }
	    this.backgroundImage1.y = this.backgroundImage1.y + 0.5;
	    this.backgroundImage2.y = this.backgroundImage2.y + 0.5;
	  };

	  this._handleEnemyCollision = function(stage, projectile) {
	    for (var i = 0; i < this.enemyShips.length; i++) {
	      var enemyShip = this.enemyShips[i];
	      if (enemyShip.collidesWithCoordinates(projectile.getCurrentX(), projectile.getCurrentY())) {
	        console.log("collides with enemy ship");
	        this._handleCollision(projectile, enemyShip, stage);
	        // want to avoid colliding with multiple ships for now
	        break;
	      }
	    }
	  };

	  this._handleCollision = function(projectile, ship, stage) {
	    ship.takeDamage(projectile.damage);
	    var explosion = projectile.explode();
	    stage.addChild(explosion.getSelf());
	    this.explosions.push(explosion);
	  };
	}

	function AssetManagerFactory() {
	  this.create = function() {
	    return new AssetManager();
	  };
	}

	module.exports = new AssetManagerFactory();


/***/ },
/* 9 */
/***/ function(module, exports) {

	
	function TrafficController() {

	  this.pathIsClear = function(ship, ships, projectiles, height, width) {
	    return !(this._willCollideWithBorder(ship, height, width) ||
	             this._willCollideWithShips(ship, ships) ||
	             this._willCollideWithProjectiles(ship, projectiles));
	  };

	  this._willCollideWithProjectiles = function(ship, projectiles) {
	    var direction = ship.getDirection();
	    var willCollide = false;
	    for (var n = 0; n < projectiles.length; n++) {
	      if (direction === "right" && ship.collidesWithCoordinates(projectiles[n].getCurrentX() - 1)) {
	        willCollide = true;
	      } else if (direction === "left" && ship.collidesWithCoordinates(projectiles[n].getCurrentX() + 1)) {
	        willCollide = true;
	      } else if (direction === "up" && ship.collidesWithCoordinates(projectiles[n].getCurrentY() + 1)) {
	        willCollide = true;
	      } else if (direction === "down" && ship.collidesWithCoordinates(projectiles[n].getCurrentY() - 1)) {
	        willCollide = true;
	      }
	    }
	    return willCollide;
	  };

	  this._willCollideWithBorder = function(ship, height, width) {
	    var direction = ship.getDirection();
	    var willCollide = false;
	    if (direction === "right" && (ship.getRightBoundry() + 1) > width) {
	      willCollide = true;
	    } else if (direction === "left" && (ship.getLeftBoundry() - 1) < 0) {
	      willCollide = true;
	    } else if (direction === "up" && (ship.getTopBoundry() - 1) < 0) {
	      willCollide = true;
	    } else if (direction === "down" && (ship.getTopBoundry() + 1) > height) {
	      willCollide = true;
	    }
	    return willCollide;
	  };

	  this._willCollideWithShips = function(ship, ships) {
	    // doesn't quite work yet...
	    var direction = ship.getDirection();
	    var willCollide = false;
	    for (var n = 0; n < ships.length; n++) {
	      if (direction === "right" && ships[n].collidesWithCoordinates(ship.getRightBoundry() + 1, ship.getCurrentY())) {
	        willCollide = true;
	      } else if (direction === "left" && ships[n].collidesWithCoordinates(ship.getLeftBoundry() - 1, ship.getCurrentY())) {
	        willCollide = true;
	      } else if (direction === "up" && ships[n].collidesWithCoordinates(ship.getTopBoundry() - 1, ship.getCurrentY())) {
	        willCollide = true;
	      } else if (direction === "down" && ships[n].collidesWithCoordinates(ship.getTopBoundry() + 1, ship.getCurrentY())) {
	        willCollide = true;
	      }
	    }
	    return willCollide;
	  };
	}

	var trafficController = new TrafficController();
	module.exports = trafficController;


/***/ },
/* 10 */
/***/ function(module, exports) {

	
	function PauseScreen() {

	  this.pauseBackground = new createjs.Shape();

	  this.pauseText = new createjs.Text("PAUSED", "40px Arial", "#000000");
	  this.chooseText = new createjs.Text("Choose Your Weapon", "30px Arial", "#000066");
	  this.laserText = new createjs.Text("Laser", "20px Arial", "#660000");
	  this.plasmaText = new createjs.Text("Plasma", "20px Arial", "#660000");

	  this.selectedWeapon = "laser";

	  this.init = function(stage) {
	    this.pauseBackground.graphics.beginFill("#FFF").drawRect(0, 0, stage.canvas.width, stage.canvas.height);
	    stage.addChild(this.pauseBackground);

	    this.pauseText.x = (stage.canvas.width / 2) - 80;
	    this.pauseText.y = 150;
	    stage.addChild(this.pauseText);

	    this.chooseText.x = (stage.canvas.width / 2) - 145;
	    this.chooseText.y = 250;
	    stage.addChild(this.chooseText);

	    this.laserText.x = (stage.canvas.width / 2) - 100;
	    this.laserText.y = 300;
	    this.laserText.addEventListener("click", this._setToLaser.bind(this));
	    stage.addChild(this.laserText);
	    // this.laserText.addEventListener("click", this._switchWeapon.bind(this));

	    this.plasmaText.x = (stage.canvas.width / 2) + 30;
	    this.plasmaText.y = 300;
	    this.plasmaText.addEventListener("click", this._setToPlasma.bind(this));
	    stage.addChild(this.plasmaText);
	  };

	  this.tearDown = function(stage) {
	    stage.removeChild(this.pauseBackground);
	    stage.removeChild(this.pauseText);
	    stage.removeChild(this.chooseText);
	    stage.removeChild(this.laserText);
	    stage.removeChild(this.plasmaText);
	    return this.selectedWeapon;
	  };

	  this._setToLaser = function() {
	    console.log("laser");
	    this.selectedWeapon = "laser";
	  };

	  this._setToPlasma = function() {
	    console.log("plasma");
	    this.selectedWeapon = "plasma";
	  }
	}

	function PauseScreenFactory() {
	  this.create = function() {
	    return new PauseScreen();
	  };
	}

	module.exports = new PauseScreenFactory();


/***/ }
/******/ ]);
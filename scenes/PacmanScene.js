import Phaser from "phaser";
import WebFontFile from "./WebFontFile";
import Easystar from "easystarjs";
import Ghost from "./ghost";


export default class PacmanScene extends Phaser.Scene {
  constructor() {
    super("PacmanScene");
  }

  layer = null;
  player = null;
  map = null;
  lifes = 3;
  currentDirection = null;
  previousDirection = null;
  pileCount = 0;
  pilesNumber = 0;
  score = 0;
  scoreDisplay = null;
  lifeDisplay = null;
  levelDisplay = null;
  level = 1;
  speed = 100;
  tab = [];
  eatFantom = 0;
  gameOver = false;
  newGame = true;
  ghostPhase = ["scatter","scatter","scatter","scatter"];
  easystar = new Easystar.js();
  scare = false;
  newLife = false;
  deathAnimation = 0;
  blueGhostTimer = 4000
  bonusTimer =15000;
  bonusDuration = 5000;
  bonusNumber = 0;
  eatBonus= 0;
  levelGhost = 1;
  lifeLose = 3;
  backgroundMusicOn = 0;;
  ghostVelocity = [1,1,1,1]
  

  preload() {
    this.load.audio('backgroundMusic',"assets/sounds/pacman.wav");
    this.load.audio('deathMusic',"assets/sounds/dead.wav");

    this.load.image("tiles", "assets/images/drawtiles-spaced.png");
    // this.load.image("pacman", "assets/images/Pacman.png");
    this.load.spritesheet("ghost1", "assets/images/Ghost1Sprite.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("ghost2", "assets/images/Ghost2Sprite.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("ghost3", "assets/images/Ghost3Sprite.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("ghost4", "assets/images/Ghost4Sprite.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("blueGhost", "assets/images/BlueGhostSprite.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("EyesGhost", "assets/images/EyesGhostSprite.png", { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("pacman", "assets/images/Pacman1.png", { frameWidth: 32, frameHeight: 32 });

    // EyesGhostSprite.png
    this.load.spritesheet("fruits", "assets/images/fruits.png", { frameWidth: 32, frameHeight: 32 });



    for (var i = 1; i < 9; i++) {
      this.load.tilemapCSV("level" + i, "assets/grid" + i + ".csv");
    }
    // this.load.image("blueGhost", "assets/images/BlueGhost.png");
    const fonts = new WebFontFile(this.load, "Pacifico");
    this.load.addFile(fonts);
  }

  create() {
    this.map = this.make.tilemap({
      key: "level" + this.level,
      tileWidth: 32,
      tileHeight: 32,
    });
    this.map1 = this.make.tilemap({
      key: "level2",
      tileWidth: 32,
      tileHeight: 32,
    });

    const PacManAnimation = this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('pacman',{start:0, end:2}),
      frameRate:5,

  });

  const PacManDeathAnimation = this.anims.create({
    key: 'death',
    frames: this.anims.generateFrameNumbers('pacman',{start:3, end:7}),
    frameRate:10,

});

  Ghost(this);

    const tileset = this.map.addTilesetImage("tiles", null, 32, 32, 1, 2);
    this.layer = this.map.createLayer(0, tileset, 0, 0);
    this.player = this.physics.add.sprite(32 * 9 + 16, 32 * 12 + 16, "pacman");
    this.ghost1 = this.physics.add.sprite(288 + 16, 288 + 16, "ghost1");
    this.ghost2 = this.physics.add.sprite(288 + 16, 320 + 16, "ghost2");
    this.ghost3 = this.physics.add.sprite(320 + 16, 320 + 16, "ghost3");
    this.ghost4 = this.physics.add.sprite(256 + 16, 320 + 16, "ghost4");
    
    this.fruit = this.physics.add.sprite(32 * 9 + 16, 32 * 12 + 16, "fruits");
    this.fruit.visible=false;


    this.player.play({ key: 'walk', repeat: -1 });
    this.ghost1.play({ key: 'ghost1right', repeat: 0 });
    this.ghost2.play({ key: 'ghost2right', repeat: 0 });
    this.ghost3.play({ key: 'ghost3right', repeat: 0 });
    this.ghost4.play({ key: 'ghost4right', repeat: 0 });

    this.backgroundMusic  = this.sound.add('backgroundMusic', {volume: 0.05},{speed:5});
    this.backgroundMusic.loop = true;
    this.backgroundMusic.setRate(2.6)
    this.deathMusic  = this.sound.add('deathMusic', {volume: 0.2},{speed:2});
    this.deathMusic.loop = false;
    this.deathMusic.setRate(2.6)

    this.enemyGroup = this.add.group();
    this.enemyGroup.add(this.ghost1, true);
    this.enemyGroup.add(this.ghost2, true);
    this.enemyGroup.add(this.ghost3, true);
    this.enemyGroup.add(this.ghost4, true);


    //mise en tableau du CSV
    var count = 0;
    for (var y = 0; y < this.map.height; y++) {
      for (var x = 0; x < this.map.width; x++) {
        var tile = this.map.getTileAt(x, y);
        if (tile.index === 3) count = count + 1;
        if (!this.tab[y]) this.tab[y] = [];
        this.tab[y].push(tile.index);
      }
    }
    this.pilesNumber = count;
    this.pileCount = 0;

    // Easystar

    this.easystar.setGrid(this.tab);
    this.easystar.setAcceptableTiles([0, 4, 3]); 

    //Game Over message

    this.gameOverText = this.add.text(300, 335, "GAME OVER", {
      fontSize: "50px",
      color: "#0f0",
      fontStyle: "bold",
    });
 
    // this.gameOverText.setInteractive();
    // this.input.on('pointerdown', () => this.newGamelaunch(false));
    // this.gameOverText.on("pointerdown", () => this.newGamelaunch(false));


    this.gameOverText.setOrigin(0.5);
    this.gameOverText.visible = false;


    // Victory message


    this.VictoryText = this.add.text(300, 335, "VICTOIRE", {
      fontSize: "50px",
      color: "#0f0",
      fontStyle: "bold",
    });
 

    this.VictoryText.setOrigin(0.5);
    this.VictoryText.visible = false;

    //New game message

    var textY = 335;
    this.newGameText = this.add.text(300, textY, "Start new game", {
      fontFamily: "pacifico",
      color: "#0f0",
      fontSize: "30px",
    });
    this.newGameText.setInteractive();
    this.newGameText.on("pointerdown", () => this.newGamelaunch(this.newGame));

    this.newGameText.setOrigin(0.5);
    this.newGameText.visible = false;

    //ecran de dï¿½marrage
    if (this.newGame == true) {
      this.newGameText.visible = true;

      this.layer.setAlpha(0.1);
      this.enemyGroup.setAlpha(0.1);
      this.player.setAlpha(0.1);
      this.deathAnimation = 0;

    }

    //rencontre entre Pacman et fantome

    this.physics.add.overlap(this.player, this.enemyGroup, (player, ghost) => {
      if (this.eatFantom == 0 && this.deathAnimation == 0 && ghost.texture.key !== 'EyesGhost') {
        if (this.lifes > 0) {
          this.deathAnimation = 1
          this.player.play({ key: 'death', repeat: 0 });
          this.backgroundMusic.stop();
          this.backgroundMusicOn = 0;
          this.deathMusic.play();
          this.player.setVelocity(0, 0);
          setTimeout(() => {
            this.player.angle = 0;
            this.player.setPosition(32 * 9 + 16, 32 * 12 + 16);
            this.ghost1.setPosition(256 + 16, 320 + 16);
            this.ghost2.setPosition(288 + 16, 320 + 16);
            this.ghost3.setPosition(320 + 16, 320 + 16);
            this.ghost4.setPosition(288 + 16, 288 + 16);
            this.ghost1.play({ key: 'ghost1Up', repeat: 0 });
            this.ghost2.play({ key: 'ghost2Up', repeat: 0 });
            this.ghost3.play({ key: 'ghost3Up', repeat: 0 });
            this.ghost4.play({ key: 'ghost4Up', repeat: 0 });


            this.previousDirection = null;
            this.currentDirection = null;
            this.newLife = true;
            if (this.block) this.block.destroy();
            this.lifes -= 1;
            this.lifeDisplay.setText("Lifes : " + this.lifes + " ");
            this.player.play({ key: 'walk', repeat: -1 });
            this.deathAnimation =0;
            this.deathMusic.stop();
          }, 500);
         
        } else {

          // redirection écran Game Over
          this.newGame = false;
          this.gameOver = true;
          this.backgroundMusic.stop();
          this.backgroundMusicOn = 0;
          this.player.setVelocity(0, 0);
          // this.newGameText.visible = true;
          // this.newGameText.setPosition(300, 400);
          if(this.deathAnimation == 0){
            this.deathAnimation = 1;
            this.deathMusic.play();
            this.player.play({ key: 'death', repeat: 0 });
            setTimeout(() => {

              this.gameOverText.visible = true;
              this.layer.setAlpha(0.1);
              this.enemyGroup.setAlpha(0.1);
              this.player.setAlpha(0.1);
              this.fruit.setAlpha(0.1);
              this.input.on('pointerdown', () => this.newGamelaunch(false));
          clearInterval(interval)}, 500);
          }
        }
      } else if (this.eatFantom == 1) {
        if (ghost == this.ghost1) {
          // this.ghost1.setPosition(288 + 16, 288 + 16);
          this.ghostPhase[0] = 'scare'
        }
        if (ghost == this.ghost2) {
          // this.ghost2.setPosition(288 + 16, 320 + 16);
          this.ghostPhase[1] = 'scare'
        }
        if (ghost == this.ghost3) {
          // this.ghost3.setPosition(320 + 16, 320 + 16);
          this.ghostPhase[2] = 'scare'
        }
        if (ghost == this.ghost4) {
          // this.ghost4.setPosition(256 + 16, 320 + 16);
          this.ghostPhase[3] = 'scare'
        }

        this.score += 300;
        // console.log(testgdfber)
      }
    });

        //rencontre entre Pacman et bonus

        this.physics.add.overlap(this.player, this.fruit, () => {
          if( this.fruit.visible==true){
            this.fruit.visible=false;
            this.score += 300;
            this.eatBonus =1;
          }
        })

        
    this.input.keyboard.on("keydown", (e) => this.pressKeyHandler(e));
    
    if(this.levelGhost == this.level){    
    var interval = setInterval(() => this.GhostMove(this.layer), 660);
    console.log('oui')
    }
    //affichage score et vies restantes

    this.scoreDisplay = this.add.text(440, -3, "score: " + this.score + " ", {
      fontFamily: "pacifico",
      fontSize: "25px",
      color: "#0f0",
      fontStyle: "italic",
    });

    this.lifeDisplay = this.add.text(169, -3, "lifes : " + this.lifes + " ", {
      fontFamily: "pacifico",
      fontSize: "25px",
      color: "#0f0",
      fontStyle: "italic",
    });

    this.levelDisplay = this.add.text(38, -3, "level : " + this.level + " ", {
      fontFamily: "pacifico",
      fontSize: "25px",
      color: "#0f0",
      fontStyle: "italic",
    });
  }
  update() {
    if(this.levelGhost != this.level) {
      var count = 0;
      // clearInterval(interval)
      this.levelGhost++
      this.ghostPhase = ["scatter","scatter","scatter","scatter"];
      this.tab = []
      console.log('HOURRA')
      for (var y = 0; y < this.map.height; y++) {
        for (var x = 0; x < this.map.width; x++) {
          var tile = this.map.getTileAt(x, y);
          if (tile.index === 3) count = count + 1;
          if (!this.tab[y]) this.tab[y] = [];
          this.tab[y].push(tile.index);
        }
      }
      this.easystar.setGrid(this.tab);
      this.easystar.setAcceptableTiles([0, 4, 3]);
    }
    var x = Math.ceil(this.player.x / 32) - 1;
    var y = Math.ceil(this.player.y / 32) - 1;
    if (x > 18) x = 18;
    if (x < 0) x = 0;

    // si toutes les piles ont ï¿½tï¿½s mangï¿½, quand pacman quitte la map => next level

    if (x > 17 || x < 1) {
      this.block.destroy;
      if (this.pileCount === this.pilesNumber) {
      // if (this.pileCount >1*this.level){
        if(this.level <8){
        this.level += 1;
        this.eatBonus =0;
        this.backgroundMusic.stop();
        this.backgroundMusicOn = 0;
        this.scene.restart();
        } else {
        this.VictoryText.visible = true;
              this.layer.setAlpha(0.1);
              this.enemyGroup.setAlpha(0.1);
              this.player.setAlpha(0.1);
              this.fruit.setAlpha(0.1);
              this.input.on('pointerdown', () => this.newGamelaunch(false));
              this.player.setVelocity(0, 0);
        }
      }
    }

    //suppression des piles 'mangï¿½s' par le Pacman

    var playerPosition = this.map.getTileAt(x, y);

    if (playerPosition.index === 3) {
      playerPosition.index = 0;
      this.pileCount++;
      this.score += 100;
    }
    if (playerPosition.index === 4) {
      this.scare = true;
      // console.log(this.scare);
      playerPosition.index = 0;
      this.Ghost(0);

      for( var i = 0; i < 10; i++){
        //   i%2==0?setTimeout(() => {this.fruit.visible=false;}, this.bonusTimer+this.bonusDuration-i*100):setTimeout(() => {this.fruit.visible=true;}, this.bonusTimer+this.bonusDuration-i*100);;
          i%2==0?setTimeout(() => {this.Ghost(1)}, this.blueGhostTimer+ i*100):setTimeout(() => {this.Ghost(0)}, this.blueGhostTimer+ i*100);
        }

      setTimeout(() => {
        this.Ghost(1);
        this.scare = false;
      }, 5000);
    }

    //mise ï¿½ jour du score

    this.scoreDisplay.setText("Score : " + this.score + " ");

   //

    if(this.bonusNumber < this.level && this.newGame == false){ 
      // console.log(this.bonusNumber);
      // console.log(this.level);

      this.bonusNumber ++;
      // console.log(this.bonusNumber);
      // console.log(this.level);

      setTimeout(() => {
        if(this.gameOver == false)this.fruit.visible=true;
        this.fruit.play({ key: 'fruit'+this.level%5, repeat: 0 })}, this.bonusTimer);
        var timers=[]
        for( var i = 8; i >= 0; i--){
        //   i%2==0?setTimeout(() => {this.fruit.visible=false;}, this.bonusTimer+this.bonusDuration-i*100):setTimeout(() => {this.fruit.visible=true;}, this.bonusTimer+this.bonusDuration-i*100);;
          i%2==0?setTimeout(() => {this.fruitVisible(false)}, this.bonusTimer+this.bonusDuration-i*100):setTimeout(() => {this.fruitVisible(true)}, this.bonusTimer+this.bonusDuration-i*100);
        }
    }

  }

  fruitVisible(input){
    if (this.eatBonus == 0 && this.gameOver == false){
    if (input ==true){this.fruit.visible=true}
    else if (input ==false){this.fruit.visible=false;}
    }
      
  }
  Center(player) {
    if (this.previousDirection) this.block.destroy();
    if (this.previousDirection === "up") {
      if (this.currentDirection !== "down" && this.currentDirection !== "up") {
        if ((player.y - 16) % 32 < 16) {
          player.y -= (player.y - 16) % 32;
        } else player.y += 32 - ((player.y - 16) % 32);
      }
    }

    if (this.previousDirection === "down") {
      if (this.currentDirection !== "up" && this.currentDirection !== "down") {
        if ((player.y - 16) % 32 > 16) {
          player.y += 32 - ((player.y - 16) % 32);
        } else player.y -= (player.y - 16) % 32;
      }
    }

    if (this.previousDirection === "right") {
      if (
        this.currentDirection !== "right" &&
        this.currentDirection !== "left"
      ) {
        if ((player.x - 16) % 32 > 16) {
          player.x += 32 - ((player.x - 16) % 32);
        } else player.x -= (player.x - 16) % 32;
      }
    }

    if (this.previousDirection === "left") {
      if (
        this.currentDirection !== "right" &&
        this.currentDirection !== "left"
      ) {
        if ((player.x - 16) % 32 < 16) {
          player.x -= (player.x - 16) % 32;
        } else player.x += 32 - ((player.x - 16) % 32);
      }
    }
  }
  Collider(player, block, destroy = 0) {

    var collider = this.physics.add.overlap(
      player,
      block,
      function (playerOnBlock) {
        if (player.x < 32) {
          player.x = 19 * 32 - 16;
          var tile = this.layer.getTileAtWorldXY(17 * 32, player.y, true);

          while (tile.index !== 2) {
            tile = this.layer.getTileAtWorldXY(
              tile.pixelX - 32,
              tile.pixelY,
              true
            );
          }
          block = this.physics.add.image(
            tile.pixelX + 16,
            tile.pixelY + 16,
            "tile"
          );
          block.visible = false;

          this.Collider(player, block, 1);
        } else if (player.x > 18 * 32) {
          player.x = 30;
          tile = this.layer.getTileAtWorldXY(2 * 32, player.y, true);

          while (tile.index !== 2) {
            tile = this.layer.getTileAtWorldXY(
              tile.pixelX + 32,
              tile.pixelY,
              true
            );
          }
          block = this.physics.add.image(
            tile.pixelX + 16,
            tile.pixelY + 16,
            "tile"
          );
          block.visible = false;

          this.Collider(player, block, 1);
        } else {
          playerOnBlock.body.stop();
          this.backgroundMusic.stop();
          this.backgroundMusicOn = 0;
          // console.log('off');
          if (destroy == 1) block.destroy();
          this.physics.world.removeCollider(collider);
        }
      },
      null,
      this
    );
  }

  // Mouvement des fantomes

  GhostMoveRight(ghost,i) {
    (this.ghostPhase[i]=='scare')?ghost.play({ key: 'EyesGhostRight', repeat: 0 }):((this.eatFantom == 0)?ghost.play({ key: ghost.texture.key + 'Right', repeat: 0 }):ghost.play({ key: 'blueGhostRight', repeat: 0 }));
    let start = Date.now();
    let timer = setInterval(function () {
      
      let timePassed = Date.now() - start;
      if (timePassed >= 660) {
        clearInterval(timer);
        return;
      }

      draw(timePassed);
    }, 20);

    function draw(timePassed) {
      ghost.x += 1;
    }
    
  }
  GhostMoveLeft(ghost,i) {
    
    (this.ghostPhase[i]=='scare')?ghost.play({ key: 'EyesGhostLeft', repeat: 0 }):((this.eatFantom == 0)?ghost.play({ key: ghost.texture.key + 'Left', repeat: 0 }):ghost.play({ key: 'blueGhostLeft', repeat: 0 }));

    let start = Date.now();
    let timer = setInterval(function () {
      let timePassed = Date.now() - start;

      if (timePassed >= 660) {
        clearInterval(timer);
        return;
      }

      draw(timePassed);
    }, 20);

    function draw(timePassed) {
      ghost.x -= 1;

    }
  }

  GhostMoveUp(ghost,i) {
    (this.ghostPhase[i]=='scare')?ghost.play({ key: 'EyesGhostUp', repeat: 0 }):((this.eatFantom == 0)?ghost.play({ key: ghost.texture.key + 'Up', repeat: 0 }):ghost.play({ key: 'blueGhostUp', repeat: 0 }));
    let start = Date.now();
    let timer = setInterval(function () {
      let timePassed = Date.now() - start;

      if (timePassed >= 660) {
        clearInterval(timer);
        return;
      }

      draw(timePassed);
    }, 20);

    function draw(timePassed) {
      ghost.y -= 1;
    }
  }

  GhostMoveDown(ghost,i) {
    // console.log(i)
    (this.ghostPhase[i]=='scare')?ghost.play({ key: 'EyesGhostDown', repeat: 0 }):((this.eatFantom == 0)?ghost.play({ key: ghost.texture.key + 'Down', repeat: 0 }):ghost.play({ key: 'blueGhostDown', repeat: 0 }));
    ;
    let start = Date.now();
    var i = 0
    let timer = setInterval(function () {
      let timePassed = Date.now() - start;

      if (timePassed >= 660) {
        clearInterval(timer);
        return;
      }
      draw(timePassed);
    }, 20);

    function draw(timePassed) {
      ghost.y += 1;
    }
  }


  // Mouvement scare -> pacman prend une grosse pacgum
  GhostScare(ghost,i) {
    let playerPos = this.layer.getTileAtWorldXY(
      this.player.x,
      this.player.y - 16
    );
    var tile1 = this.layer.getTileAtWorldXY(ghost.x - 32, ghost.y, true);
    var tile2 = this.layer.getTileAtWorldXY(ghost.x + 32, ghost.y, true);
    var tile3 = this.layer.getTileAtWorldXY(ghost.x, ghost.y - 32, true);
    var tile4 = this.layer.getTileAtWorldXY(ghost.x, ghost.y + 32, true);

    let ghostPos = this.layer.getTileAtWorldXY(ghost.x, ghost.y - 16);
    this.easystar.findPath(
      ghostPos.x,
      ghostPos.y,
      playerPos.x,
      playerPos.y,
      (pathScare) => {
        if (pathScare === null) {
          console.log("The path to the destination point was not found.");
        }
        if (pathScare) {
          if (playerPos.x > ghostPos.x && tile1.index != 2) {
            this.GhostMoveLeft(ghost,i)
          } else if (playerPos.x < ghostPos.x && tile2.index != 2) {
            this.GhostMoveRight(ghost,i)
          } else if (playerPos.y > ghostPos.y && tile3.index != 2) {
            this.GhostMoveUp(ghost,i)
          } else if (playerPos.y < ghostPos.y && tile4.index != 2) {
            this.GhostMoveDown(ghost,i)
          }
        }
      }
    );
    this.easystar.setIterationsPerCalculation(1000);
    this.easystar.calculate();
  }

  GhostReturnPos(ghost,initPosX,initPosY,i) {
    let ghostPos = this.layer.getTileAtWorldXY(ghost.x, ghost.y - 16);
    this.easystar.findPath(
      ghostPos.x,
      ghostPos.y,
      initPosX,
      initPosY,
      (pathReturnPos) => {
        if (pathReturnPos === null) {
          console.log("The path to the destination point was not found.");
        }
        if (pathReturnPos) {
          console.log(pathReturnPos)
          if(pathReturnPos.length > 0) {
            var currentPointx = pathReturnPos[0].x;
            var currentPointy = pathReturnPos[0].y;
            var nextPointx = pathReturnPos[1].x;
            var nextPointy = pathReturnPos[1].y;
            if (nextPointy < currentPointy) {
              this.GhostMoveUp(ghost,i);
              // while((ghost.y-16)%32 != 0) {
              //   ghost.y --; 
              // }
              console.log('up')
            } else if (nextPointy > currentPointy) {
              this.GhostMoveDown(ghost,i);
              // while((ghost.y-16)%32 != 0) {
              //   ghost.y ++;
              // }
              console.log('down')
            } else if (nextPointx < currentPointx) {
              this.GhostMoveLeft(ghost,i);
              // while((ghost.x-16)%32 != 0) {
              //   ghost.x --; 
              // }
              console.log('left')
            } else if (nextPointx > currentPointx) {
              this.GhostMoveRight(ghost,i);
              // while((ghost.x-16)%32 != 0) {
              //   ghost.x ++; 
              // }
              console.log('right')
            }
          }
        }
      })
  }

  // Ghost chase Pacman

  GhostChase(ghost,i) {
    let playerPos = this.layer.getTileAtWorldXY(
      this.player.x,
      this.player.y
    );
    let ghostPos = this.layer.getTileAtWorldXY(ghost.x, ghost.y);
    this.easystar.findPath(
      ghostPos.x,
      ghostPos.y,
      playerPos.x,
      playerPos.y,
      (pathChase) => {
        if (pathChase === null) {
          console.log("The path to the destination point was not found.");
        }

        if (pathChase) {
          var currentPointx = pathChase[0].x;
          var currentPointy = pathChase[0].y;
          var nextPointx = pathChase[1].x;
          var nextPointy = pathChase[1].y;
        }

        if (nextPointy < currentPointy) {
          this.GhostMoveUp(ghost,i);
        } else if (nextPointy > currentPointy) {
          this.GhostMoveDown(ghost,i);
        } else if (nextPointx < currentPointx) {
          this.GhostMoveLeft(ghost,i);
        } else if (nextPointx > currentPointx) {
          this.GhostMoveRight(ghost,i);
        }
      }
    );

    this.easystar.setIterationsPerCalculation(1000);
    this.easystar.calculate();
  }

  // Ghost initial position on map

  GhostScatter = (ghost, finalPosX, finalPosY,i) => {
    let ghostPos = this.layer.getTileAtWorldXY(ghost.x, ghost.y);
    this.easystar.findPath(
      ghostPos.x,
      ghostPos.y,
      finalPosX,
      finalPosY,
      (path) => {
        if (path === null) {
          console.log("The path to the destination point was not found.");
        }
        if (path) {
          
          if(path.length > 0) {
            var currentPointx = path[0].x;
            var currentPointy = path[0].y;
            var nextPointx = path[1].x;
            var nextPointy = path[1].y;
            if (nextPointy < currentPointy) {
              this.GhostMoveUp(ghost,i);
              while((ghost.y-16)%32 != 0) {
                ghost.y -- 
              }
            } else if (nextPointy > currentPointy) {
              this.GhostMoveDown(ghost,i);
              while((ghost.y-16)%32 != 0) {
                ghost.y ++
              }
            } else if (nextPointx < currentPointx) {
              this.GhostMoveLeft(ghost,i);
              while((ghost.x-16)%32 != 0) {
                ghost.x -- 
              }
            } else if (nextPointx > currentPointx) {
              this.GhostMoveRight(ghost,i);
              while((ghost.x-16)%32 != 0) {
                ghost.x ++ 
              }
            }
          }
        }
      }
    );

    this.easystar.setIterationsPerCalculation(1000);
    this.easystar.calculate();


  };


  // Ghost random movement

  GhostMoveRandom(ghost,i) {
    let moveDir = ["left", "right", "up", "down"];
    let move = moveDir[Math.floor(Math.random() * 4)];
    let y = 0
    console.log('oui')
    while(y==0) {
    
    switch (move) {
      // --------------------------------------------------------------
      case "left":
        var tile = this.layer.getTileAtWorldXY(ghost.x - 32, ghost.y, true);
        if (tile.index !== 2) {
          this.GhostMoveLeft(ghost,i);
          while((ghost.x-16)%32 != 0) {
            ghost.x -- 
          }
          y++
        } else {
          move = moveDir[Math.floor(Math.random() * 4)];
        }
        break;

      // ---------------------------------------------------

      case "right":
        var tile = this.layer.getTileAtWorldXY(ghost.x + 32, ghost.y, true);

        if (tile.index !== 2) {
          this.GhostMoveRight(ghost,i);
          while((ghost.x-16)%32 != 0) {
            ghost.x ++ 
          }
          y++
        } else {
          move = moveDir[Math.floor(Math.random() * 4)];
        }
        break;

      // ---------------------------------------------------

      case "up":
        var tile = this.layer.getTileAtWorldXY(ghost.x, ghost.y - 32, true);
        if (tile.index !== 2) {
          this.GhostMoveUp(ghost,i);
          while((ghost.y-16)%32 != 0) {
            ghost.y -- 
          }
          y++
        } else {
          move = moveDir[Math.floor(Math.random() * 4)];
        }
        break;

      // ---------------------------------------------------

      case "down":
        var tile = this.layer.getTileAtWorldXY(ghost.x, ghost.y + 32, true);
        if (tile.index !== 2) {
          this.GhostMoveDown(ghost,i);
          while((ghost.y-16)%32 != 0) {
            ghost.y ++ 
          }
          y++
        } else {
          move = moveDir[Math.floor(Math.random() * 4)];
        }
        break;
      }
  }
  }


  // Ghost movement manager

  GhostMove(layer) {
    const ghosts = [this.ghost1, this.ghost2, this.ghost3, this.ghost4];
    let FinalPos = [2, 1, 16, 1, 2, 20, 16, 20];
    // console.log(this.lifeLose)
    // console.log(this.lifes)
    
    // console.log('*************************************')
    if (this.level == 6) {
      FinalPos = [6,1,13,1,2,20,16,20]
    }
    for (let i = 0; i < ghosts.length; i++) {
      let playerPos = layer.getTileAtWorldXY(this.player.x, this.player.y);
      let ghostPos = layer.getTileAtWorldXY(ghosts[i].x, ghosts[i].y);
      let ghostPhase = this.ghostPhase;

      this.easystar.findPath(ghostPos.x,ghostPos.y,playerPos.x,playerPos.y,
        (pathCheck) => {
          if (this.lifeLose != this.lifes && this.lifeLose > -1){
            this.ghost1.setPosition(256 + 16, 320 + 16);
            this.ghost2.setPosition(288 + 16, 320 + 16);
            this.ghost3.setPosition(320 + 16, 320 + 16);
            this.ghost4.setPosition(288 + 16, 288 + 16);
            this.lifeLose --
          }
          if (this.newGame == false && this.lifes >= 0) {

            if (ghostPhase[i] == null && pathCheck.length > 10 && this.newLife == false) {
              if(ghosts[i] == this.ghost1) {
                // console.log('random' + [i])
              }
              this.GhostMoveRandom(ghosts[i],i);

            }

            if (ghostPhase[i] == "scatter") {
              if(ghosts[i] == this.ghost1) {
                // console.log('scatter'+ [i])
              }
             // Lance Scatter en décalage
              setTimeout(() => 
              this.GhostScatter(ghosts[i],FinalPos[i * 2],FinalPos[i * 2 + 1],i),i*1980)
              // Passe de scatter Ã  Random
              if ((ghosts[i].x-16) == FinalPos[i *2]*32 && (ghosts[i].y-16) == FinalPos[i*2 +1]*32) {
                ghostPhase[i] = null   
              }
            }

            // Relance Scatter aprÃ¨s une mort
            if (this.newLife == true) {
              ghostPhase[i] = 'scatter'
              if(i == 3) {
              this.newLife = false
              }
            } 

            // Lance Chase
            if (ghostPhase[i] == null && pathCheck.length <= 10 && this.newLife == false && this.scare == false
            ) {
              if(ghosts[i] == this.ghost1) {
                // console.log('chase'+ [i])
              }
              this.GhostChase(ghosts[i],i);
            }

            // Lance Scare

            if (this.scare == true && pathCheck.length <= 10 && ghostPhase[i] == null) {             
              this.GhostScare(ghosts[i],i);
            }
            if(ghostPhase[i] == 'scare') {
              if(ghosts[i] == this.ghost1) {
              // console.log('ReturnPosScare'+ [i])
            }
              this.GhostScatter(ghosts[i],9, 9,i)
                if ((ghosts[i].x-16) == 9*32 && (ghosts[i].y-16) == 9*32) {
                  ghostPhase[i] = null
                  ghosts[i].play({ key: 'ghost'+ (i+1) + 'Up', repeat: 0 })   
                }
            } 
          }
        }
      );
    }
    this.easystar.setIterationsPerCalculation(1000);
    this.easystar.calculate();
  // }
  }


  pressKeyHandler(e) {
    if (this.gameOver === false && this.newGame == false && this.deathAnimation == 0) {

      switch (e.key) {
        //Left

        case "q":
        case "ArrowLeft":
          this.moveLeft();

          break;

        //Up
        case "z":
        case "ArrowUp":
          this.moveUp();
          break;

        //Right
        case "d":
        case "ArrowRight":
          this.moveRight();
          break;

        // Down
        case "s":
        case "ArrowDown":
          this.moveDown();

          break;
        default:
          null;
      }
    }
  }

  moveLeft() {
    let tile = null;
    this.currentDirection = "left";
    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y, true);

    
    while (tile.index !== 2) {
      if(this.backgroundMusicOn == 0){
        this.backgroundMusic.play();
        this.backgroundMusicOn = 1;
      }
      var pixelY = tile.pixelY;
      var X = 0;
      if (tile !== null) {
        // console.log(this.player.x);
        // console.log(tile);
        (this.player.x > 32*18)? X =48:X=32;
        tile = this.layer.getTileAtWorldXY(tile.pixelX - X, tile.pixelY, true);
        // console.log(tile);
        if (tile === null && this.player.x < 32*18) {
          tile = this.layer.getTileAtWorldXY(16, pixelY, true);
          tile.pixelX = -50;
          break;
        }
          else if (tile === null &&  this.player.x > 32*18 ){
            tile =this.layer.getTileAtWorldXY(this.player.x - 32, this.player.y, true);
          }
      }
    }

    if (this.player.x - tile.pixelX > 32 + 18) {
      console.log('on');
      this.Center(this.player);
      this.player.angle = 180;
      this.block = this.physics.add.image(
        tile.pixelX + 16 + 5,
        tile.pixelY + 16,
        "tile"
      );

      this.block.visible = false;
      this.previousDirection = "left";
      // Move at 100 px/s:
      this.player.setVelocity(-this.speed + 0.05 * this.level, 0);
      this.Collider(this.player, this.block);
    }
  }
  moveRight() {
    let tile = null;
    this.currentDirection = "right";
    // console.log(this.player.x);
    // console.log(this.player.y)
    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y, true);

    while (tile.index !== 2) {
      if(this.backgroundMusicOn == 0){
        this.backgroundMusic.play();
        this.backgroundMusicOn = 1;
      }
      var pixelY = tile.pixelY;
      if (tile !== null) {
        // console.log(tile);
        (tile.pixelX < 0)? tile.pixelX =0:tile.pixelX=tile.pixelX
        tile = this.layer.getTileAtWorldXY(tile.pixelX + 32, tile.pixelY, true);
        // console.log(tile)
        if (tile === null && this.player.x > 64) {
          tile = this.layer.getTileAtWorldXY(18 * 32 + 16, pixelY, true);
          tile.pixelX = 19 * 32;
          break;
        }
        else if (tile === null && this.player.x < 64 ){
          tile =this.layer.getTileAtWorldXY(this.player.x - 32, this.player.y, true);
        }
      }
    }

    if (this.player.x - tile.pixelX < -18) {
      this.Center(this.player);
      this.player.angle = 0;
      this.block = this.physics.add.image(
        tile.pixelX + 16 - 5,
        tile.pixelY + 16,
        "tile"
      );
      this.block.visible = false;
      this.previousDirection = "right";
      this.player.setVelocity(+this.speed + 0.05 * this.level, 0);
      this.Collider(this.player, this.block);
    }
  }
  moveUp() {
    let tile = null;
    this.currentDirection = "up";

    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y - 32, true);
    while (tile.index !== 2) {
      if(this.backgroundMusicOn == 0){
        this.backgroundMusic.play();
        this.backgroundMusicOn = 1;
      }
      tile = this.layer?.getTileAtWorldXY(tile.pixelX, tile.pixelY - 32, true);
    }
    if (this.player.y - tile.pixelY > +32 + 18) {
      this.Center(this.player);
      this.player.angle = 270;
      this.block = this.physics.add.image(
        tile.pixelX + 16,
        tile.pixelY + 16 + 5,
        "tile"
      );
      this.block.visible = false;
      this.previousDirection = "up";

      // Move at 100 px/s:
      this.player.setVelocity(0, -this.speed + 0.05 * this.level);

      this.Collider(this.player, this.block);
    }
  }
  moveDown() {
    let tile = null;
    this.currentDirection = "down";

    tile = this.layer.getTileAtWorldXY(this.player.x, this.player.y + 32, true);
    while (tile.index !== 2) {
      if(this.backgroundMusicOn == 0){
        this.backgroundMusic.play();
        this.backgroundMusicOn = 1;
      }
      tile = this.layer.getTileAtWorldXY(tile.pixelX, tile.pixelY + 32, true);
    }
    if (this.player.y - tile.pixelY < -32 + 14) {
      this.Center(this.player);
      this.player.angle = 90;
      this.block = this.physics.add.image(
        tile.pixelX + 16,
        tile.pixelY + 16 - 5,
        "tile"
      );
      this.block.visible = false;
      this.previousDirection = "down";

      // Move at 100 px/s:
      this.player.setVelocity(0, +this.speed + 0.05 * this.level);

      this.Collider(this.player, this.block);
    }
  }

  Ghost(number) {
    if (number % 2 == 0) {
      this.eatFantom = 1;
      if(this.ghostPhase[0] !== 'scare')this.ghost1.setTexture("blueGhost");
      if(this.ghostPhase[1] !== 'scare')this.ghost2.setTexture("blueGhost");
      if(this.ghostPhase[2] !== 'scare')this.ghost3.setTexture("blueGhost");
      if(this.ghostPhase[3] !== 'scare')this.ghost4.setTexture("blueGhost");
    } else {
      setTimeout(() => {
        this.eatFantom = 0;
      }, 1000);
      if(this.ghostPhase[0] !== 'scare')this.ghost1.setTexture("ghost1");
      if(this.ghostPhase[1] !== 'scare')this.ghost2.setTexture("ghost2");
      if(this.ghostPhase[2] !== 'scare')this.ghost3.setTexture("ghost3");
      if(this.ghostPhase[3] !== 'scare')this.ghost4.setTexture("ghost4");
    }
  }

  newGamelaunch(newGame) {
    if (newGame == true) {
      this.newGameText.visible = false;
console.log( 'newgame')
      this.layer.setAlpha(1);
      this.enemyGroup.setAlpha(1);
      this.player.setAlpha(1);
      this.newGame = false;

    } else {
      console.log( 'NOTnewgame')
      this.gameOver = false;
      this.newGame = false;
      this.level = 1;
      this.score = 0;
      this.lifes = 3;

      // this.scene.restart();
      location.reload()
    }
  }

}

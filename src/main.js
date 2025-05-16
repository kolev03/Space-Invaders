document
  .getElementById("start-game")
  .addEventListener("click", async function () {
    document.getElementById("start-menu").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    startGame();
  });

// PixiJs Game Logic
import {
  Application,
  Assets,
  Text,
  TextStyle,
  Container,
  Graphics,
  applyMatrix,
} from "pixi.js";
import { addBackground } from "./addBackground";
import Player from "./player";
import Alien from "./alien";
import AliensContainer from "./aliensContainer";
import Missle from "./missle";
import Blocker from "./blockers";
import alienMissile from "./alienMissle";
import UFO from "./ufo";
import Score from "./score";
import OmegaRayDrop from "./omegaRayDrop";
import ShieldDrop from "./ShieldDrop";
import GuidedMissile from "./guidedMissile";
import Laser from "./laser";

const app = new Application();

// Game is running
let gameRunning = true;

// Setting the numbers of aliens and the spacing between them
const ROWS = 5;
const COLS = 13;
const SPACING = 55;
const NUMBER_SHIELDS = 4;

// Variables for adaptive scoreboard
let score = 0;

//Actions variables
const keys = {};
let isMissleOnScreen = false;
let missle = null;
const missiles = [];
let guidedMissiles = [];
let aliensTotal = [];
let powerDrops = [];
let shield = false;
let omegaRay = false;
let slayedAliens = 0;
const activeShieldSeconds = 6;

// Setting the speed of aliens
let aliensSpeed = 0.75;

// Counting time past in the ticker
let intervalUFO = 0;
let intervalAlienMissile = 0;
let intervalShield = 0;
let intervalLaser = 0;

// Seconds for actions
const secondsUFO = 15;
const secondsAlienShoot = 2;

async function setup() {
  await app.init({
    background: `white`,
    resizeTo: window,
  });

  const gameContainer = document.getElementById("game-container");
  gameContainer.appendChild(app.canvas);
}

async function load() {
  const assets = [
    {
      alias: "background",
      src: "assets/galaxy.webp",
    },
    {
      alias: "playerShip",
      src: "assets/space-ship.png",
    },
    {
      alias: "missle",
      src: "assets/missle.jpg",
    },
    {
      alias: "alien1",
      src: "assets/alien1.png",
    },
    {
      alias: "blocker1",
      src: "assets/BLOCKER.png",
    },
    {
      alias: "ufo",
      src: "assets/ufo.png",
    },
    {
      alias: "omegaRay",
      src: "assets/omegaRay.jpg",
    },
    {
      alias: "guidedMissile",
      src: "assets/guidedMissile.jpg",
    },
    {
      alias: "shieldIcon",
      src: "assets/shieldIcon.jpg",
    },
    {
      alias: "ray",
      src: "assets/ray.png",
    },
  ];

  await Assets.load(assets);
}

async function startGame() {
  await setup();
  await load();

  addBackground(app);

  const player = new Player(app.screen.width / 2, app.screen.height - 30);
  app.stage.addChild(player);

  const scoreDisplay = new Score(30, 15); // Create a new Score object
  scoreDisplay.x = app.screen.width / 2;
  scoreDisplay.addTo(app.stage);

  const aliensContainer = new AliensContainer();

  // Add aliens to the container
  for (let col = 0; col < COLS; col++) {
    const container = new Container();

    for (let row = 0; row < ROWS; row++) {
      const alien = new Alien(col * SPACING, row * SPACING - 40);
      container.addChild(alien);
    }
    aliensContainer.addChild(container);
  }

  // Add container to the canvas
  app.stage.addChild(aliensContainer);

  // Center container based on its width
  aliensContainer.x = (app.screen.width - aliensContainer.width) / 2;
  aliensContainer.y = 125;

  // Add defense blocks
  let blockersContainer = new Container();
  for (let i = 1; i <= NUMBER_SHIELDS; i++) {
    const block = new Blocker((app.screen.width / 5) * i, player.y - 125);
    blockersContainer.addChild(block);
  }

  app.stage.addChild(blockersContainer);

  // Listening for key actions
  window.addEventListener("keydown", (key) => (keys[key.code] = true));
  window.addEventListener("keyup", (key) => (keys[key.code] = false));

  //  const keyActions = {
  //     ArrowLeft: () => {
  //       player.moveLeft(app);
  //     },
  //     ArrowRight: () => {
  //       player.moveRight(app);
  //     },
  //     Space: () => {
  //       if (isMissleOnScreen) return;
  //       isMissleOnScreen = true;
  //       missle = new Missle(player.x, player.y);
  //       app.stage.addChild(missle);
  //     },
  //   };

  //   window.addEventListener("keydown", (key) => {
  //     if (keyActions[key.code]) keyActions[key.code]();
  //   });

  // Array to store active missiles

  // Main game logic ticker
  app.ticker.add(() => {
    if (!gameRunning) return;

    intervalUFO++;
    intervalAlienMissile++;
    if (shield === true) intervalShield++;

    // Handling player movement
    if (keys["ArrowLeft"]) player.moveLeft(app);
    if (keys["ArrowRight"]) player.moveRight(app);
    if (keys["ArrowDown"]) shield = true;

    if (keys["Space"]) {
      if (omegaRay === true) {
        const globalPlayerPos = player.getGlobalPosition();
        const laser = new Laser(
          globalPlayerPos.x,
          globalPlayerPos.y,
          app.screen.height
        );
        laser.label = "laser";
        app.stage.addChild(laser);
        player.omegaRayStrike();
        player.omegaRayShake(false);
        omegaRay = false;
        isMissleOnScreen = true;
      }
      if (isMissleOnScreen) return;
      isMissleOnScreen = true;
      missle = new Missle(player.x, player.y);
      app.stage.addChild(missle);
    }

    // Sending UFO every secondsUFO seconds
    if (intervalUFO == secondsUFO * 60) {
      const ufo = new UFO();
      ufo.x = app.screen.width + ufo.width;
      ufo.label = "ufo";
      app.stage.addChild(ufo);
      intervalUFO = 0;
    }

    // Moving the UFO, if there is any
    if (app.stage.getChildByName("ufo")) {
      const ufo = app.stage.getChildByName("ufo");
      ufo.move();
      if (ufo.x + ufo.width <= 0) {
        ufo.die();
        console.log("Ufo died");
      }
    }

    // Moving the aliens
    aliensContainer.x += aliensSpeed * aliensContainer.direction;
    let leftMost = Infinity;
    let rightMost = -Infinity;

    // Making the aliens container adaptive, so when the container reaches the end of the screen it goes to the last alien
    aliensContainer.children.forEach((col) => {
      col.children.forEach((alien) => {
        if (!alien.destroyed) {
          let alienGlob = alien.getGlobalPosition();
          leftMost = Math.min(leftMost, alienGlob.x);
          rightMost = Math.max(rightMost, alienGlob.x);
        }
      });
    });

    // Bouncing the alien container
    if (leftMost <= 50) {
      aliensContainer.direction = 1;
      aliensContainer.y += 15;
    } else if (rightMost >= app.screen.width - 50) {
      aliensContainer.direction = -1;
      aliensContainer.y += 15;
    }

    //Storing all alive aliens
    aliensTotal = [];
    aliensContainer.children.forEach((col) => {
      for (let index = 0; index < col.children.length; index++) {
        aliensTotal.push(col.children[index]);
      }
    });

    // Making the aliens shoot every secondsAlienShoot seconds
    if (intervalAlienMissile == secondsAlienShoot * 60) {
      const randomNum = Math.floor(
        Math.random() * aliensContainer.children.length
      );
      if (aliensContainer.children[randomNum]) {
        let randomCol = aliensContainer.children[randomNum];
        if (randomCol.children && randomCol.children.length > 0) {
          const chosenAlien = randomCol.children[randomCol.children.length - 1];
          chosenAlien.fire = true;
          const chosenAlienGlobal = chosenAlien.getGlobalPosition();
          const alienMissleStrike = new alienMissile(
            chosenAlienGlobal.x,
            chosenAlienGlobal.y
          );
          app.stage.addChild(alienMissleStrike);
          missiles.push(alienMissleStrike);
        }
      }
      intervalAlienMissile = 0;
    }

    // Tracking the alien missiles
    for (let i = missiles.length - 1; i >= 0; i--) {
      const missile = missiles[i];
      if (missile.destroyed) continue;
      missile.move();

      if (missile.y - missile.height > app.screen.height) {
        missile.die();
        missiles.splice(i, 1); // Remove from the array
        continue;
      }

      const globalPlayerPos = player.getGlobalPosition();
      const distance = Math.hypot(
        missile.x - globalPlayerPos.x,
        missile.y - globalPlayerPos.y
      );

      // Checking if the player is hit
      if (distance < player.width / 2 + missile.width / 2) {
        if (intervalShield >= activeShieldSeconds * 60) {
          player.shielded(false);
          shield = false;
          intervalShield = 0;
        }

        if (shield) {
          missile.die();
          missiles.splice(i, 1);
          break;
        }

        player.hp -= 1;
        scoreDisplay.updateHp(player.hp);

        if (player.hp === 0) {
          player.die();
          gameRunning = false;
          scoreDisplay.updateScore("LOST");
        }

        missile.die();
        missiles.splice(i, 1);
        break;
      }

      // Checking if the blockers are hit
      blockersContainer.children.forEach((blocker) => {
        if (!missile.destroyed) {
          const distance = Math.hypot(
            missile.x - blocker.x,
            missile.y - blocker.y
          );
          if (distance < blocker.width / 2 + missile.width / 2) {
            missile.die();
            blocker.alpha -= 0.25;
            blocker.hp = blocker.hp - 1;
            if (blocker.hp === 0) blocker.die();
          }
        }
      });
    }

    // Making the laser to hit
    if (app.stage.getChildByName("laser")) {
      const laser = app.stage.getChildByName("laser");
      if (!laser.destroyed) {
        //added to prevent error
        aliensContainer.children.forEach((col) => {
          col.children.forEach((alien) => {
            if (alien.destroyed) return;
            const laserBounds = laser.getBounds();
            const alienBounds = alien.getBounds();
            if (
              laserBounds.x < alienBounds.x + alienBounds.width &&
              laserBounds.x + laserBounds.width > alienBounds.x &&
              laserBounds.y < alienBounds.y + alienBounds.height &&
              laserBounds.y + laserBounds.height > alienBounds.y
            ) {
              alien.die();
              score += 10;
            }
            scoreDisplay.updateScore(score);
          });
        });
      }
      intervalLaser++;
      if (intervalLaser >= 10) {
        intervalLaser = 0;
        laser.die();
        app.stage.removeChild(laser);
        isMissleOnScreen = false;
      }
    }

    // Making the guided missile move
    guidedMissiles.forEach((missile) => {
      missile.move();
      if (
        missile.y - missile.height > app.screen.height ||
        missile.x < 0 ||
        missile.x > app.screen.width
      ) {
        missile.die();
        guidedMissiles.splice(guidedMissiles.indexOf(missile), 1);
      }
    });

    // Making the missle move, and dissappear if it gets outside the view
    if (missle) {
      missle.move();

      if (missle.isOutOfBounds) {
        isMissleOnScreen = false;
        missle.die();
        missle = null;
        return;
      }

      // Logic for aliens hit
      aliensContainer.children.forEach((col) => {
        col.children.forEach((alien) => {
          if (!missle) return;

          const globalAlienPos = alien.getGlobalPosition();
          const distance = Math.hypot(
            missle.x - globalAlienPos.x,
            missle.y - globalAlienPos.y
          );

          if (distance < alien.width / 2 + missle.width) {
            isMissleOnScreen = false;
            missle.die();
            missle = null;
            alien.die();
            score += 10;
            slayedAliens++;

            // Dropping random bonus, on 7 killed units
            if (slayedAliens % 7 === 0) {
              const randomBonus = Math.floor(Math.random() * 2) + 1;

              if (randomBonus === 1) {
                const drop = new ShieldDrop(globalAlienPos.x, globalAlienPos.y);
                app.stage.addChild(drop);
                powerDrops.push(drop);
              } else {
                const drop = new OmegaRayDrop(
                  globalAlienPos.x,
                  globalAlienPos.y
                );
                app.stage.addChild(drop);
                powerDrops.push(drop);
              }
            }

            // Logic for spawning guided missiles
            if (score % 100 === 0) {
              const totalAlienFilter = aliensTotal.filter(
                (alien) => alien.fire == true
              );
              const number =
                Math.floor(
                  Math.random() *
                    aliensTotal.filter((alien) => alien.fire == true).length
                ) + 1;

              const guidedMissile = new GuidedMissile(
                player.x,
                player.y,
                totalAlienFilter[number]
              );
              // Target the alien
              guidedMissiles.push(guidedMissile);
              app.stage.addChild(guidedMissile);
            }

            scoreDisplay.updateScore(score);
            aliensSpeed += aliensSpeed * 0.043;
          }
        });
      });

      // Logic for shield blocks hit
      blockersContainer.children.forEach((blocker) => {
        if (!missle) return;

        const distance = Math.hypot(missle.x - blocker.x, missle.y - blocker.y);
        if (distance < blocker.width / 2 + missle.width / 2) {
          isMissleOnScreen = false;
          missle.die();
          missle = null;
          blocker.alpha -= 0.25;
          blocker.hp = blocker.hp - 1;
          if (blocker.hp === 0) blocker.die();
        }
      });

      // Logic for UFO hit
      if (app.stage.getChildByName("ufo")) {
        if (!missle) return;
        const ufo = app.stage.getChildByName("ufo");
        const globalUfo = ufo.getGlobalPosition();

        const distance = Math.hypot(
          missle.x - globalUfo.x,
          missle.y - globalUfo.y
        );

        if (distance < ufo.width / 2 + missle.width / 2) {
          isMissleOnScreen = false;
          missle.die();
          missle = null;
          ufo.die();
          score += 150;
          scoreDisplay.updateScore(score);
        }
      }
    }

    //Moving any available power ups
    for (let i = powerDrops.length - 1; i >= 0; i--) {
      const drop = powerDrops[i];
      if (!drop) continue; // Important: Check if drop is valid

      drop.move();
      if (drop.y - drop.height > app.screen.height) {
        drop.disappear();
        powerDrops.splice(i, 1);
        continue;
      }

      const globalPlayerPos = player.getGlobalPosition();
      const distance = Math.hypot(
        drop.x - globalPlayerPos.x,
        drop.y - globalPlayerPos.y
      );

      if (distance < player.width / 2 + drop.width / 2) {
        if (drop instanceof ShieldDrop) {
          player.shielded(true);
          shield = true;
        } else if (drop instanceof OmegaRayDrop) {
          player.omegaRayShake(true);
          omegaRay = true;
        }
        drop.disappear();
        powerDrops.splice(i, 1);
      }
    }

    // Checking if all the aliens are killed
    if (aliensTotal.length == 0) scoreDisplay.displayResult("WON");
  });
}

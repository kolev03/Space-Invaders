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
import { addBackground } from "./addBackground.js";
import Player from "./player.js";
import Alien from "./alien.js";
import AliensContainer from "./aliensContainer.js";
import Missle from "./missle.js";
import Blocker from "./blockers.js";
import alienMissile from "./alienMissle.js";
import UFO from "./ufo.js";
import Score from "./score.js";
import OmegaRayDrop from "./omegaRayDrop.js";
import ShieldDrop from "./ShieldDrop.js";
import GuidedMissile from "./guidedMissile.js";
import Laser from "./laser.js";
import StageDisplay from "./stage.js";
import gsap from "gsap";

const app = new Application();
const backgroundMusic = new Audio("audio/battleMusic.mp3");

// Game is running
let gameRunning = true;

// Setting the numbers of aliens and the spacing between them
const ROWS = 5;
const COLS = 13;
const SPACING = 55;
const NUMBER_SHIELDS = 4;

// Seconds for actions
const SECONDS_UFO = 15;
let SECONDS_ALIENS_SHOOT = 2;
const ACTIVE_SHIELD_SECONDS = 6;

//Actions variables
export const gameState = {
  difficulty: "Normal",
};

let score = 0;
let keys = {};
let missiles = [];
let guidedMissiles = [];
let aliensAlive = [];
let powerDrops = [];
let isMissleOnScreen = false;
let missle = null;
let shield = false;
let omegaRay = false;
let killedAliensForDrops = 0;
let currentStage = 1;
let aliensKilledForGuidedMissile = 0;

// Setting the speed of aliens
let aliensSpeed = 0.75;

// Counting time past in the ticker
let intervalUFO = 0;
let intervalAlienMissile = 0;
let intervalShield = 0;
let intervalLaser = 0;

let once = true;
async function setup() {
  await app.init({
    background: `white`,
    resizeTo: window,
  });

  const gameContainer = document.getElementById("game-container");
  gameContainer.appendChild(app.canvas);

  once = false;
}

async function load() {
  const assets = [
    {
      alias: "background",
      src: "assets/background.png",
    },
    {
      alias: "playerShip",
      src: "assets/space-ship.png",
    },
    {
      alias: "alienMissile",
      src: "assets/alienMissile.png",
    },
    {
      alias: "missle",
      src: "assets/missile.png",
    },
    {
      alias: "alien1",
      src: "assets/alien1.png",
    },
    {
      alias: "blocker4/4",
      src: "assets/blockerFull.png",
    },
    {
      alias: "blocker4/3",
      src: "assets/blockerLittleDmg.png",
    },
    {
      alias: "blocker4/2",
      src: "assets/blockerDecentDmg.png",
    },
    {
      alias: "blocker4/1",
      src: "assets/blockerDestroyed.png",
    },
    {
      alias: "ufo",
      src: "assets/ufo.png",
    },
    {
      alias: "omegaRay",
      src: "assets/omegaRay.png",
    },
    {
      alias: "guidedMissile",
      src: "assets/guidedMissile.png",
    },
    {
      alias: "shield",
      src: "assets/shield.png",
    },
    {
      alias: "shieldIcon",
      src: "assets/shieldIcon.png",
    },
    {
      alias: "ray",
      src: "assets/ray.png",
    },
  ];

  await Assets.load(assets);
}

export async function startGame() {
  backgroundMusic.volume = 0.4;
  backgroundMusic.play();

  gameRunning = true;
  if (once === true) await setup();

  await load();

  addBackground(app);

  const player = new Player(app.screen.width / 2, app.screen.height - 30);
  app.stage.addChild(player);

  const scoreDisplay = new Score(app.screen.width / 2, 15);
  scoreDisplay.addTo(app.stage);

  const stageDisplay = new StageDisplay();
  app.stage.addChild(stageDisplay.getDisplayObject());

  let aliensContainer = new AliensContainer();

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
    const block = new Blocker(
      (app.screen.width / (NUMBER_SHIELDS + 1)) * i,
      player.y - 110
    );
    blockersContainer.addChild(block);
  }

  app.stage.addChild(blockersContainer);

  // Listening for key assosiated with player movement
  window.addEventListener("keydown", (key) => (keys[key.code] = true));
  window.addEventListener("keyup", (key) => (keys[key.code] = false));

  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
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
      let laserSound = new Audio("audio/laserSound.mp3");
      laserSound.play();
      isMissleOnScreen = true;
      missle = new Missle(player.x, player.y);
      app.stage.addChild(missle);
    }
  });

  // Adapting the difficulty
  if (gameState.difficulty === "Hard") {
    player.hp = 1;
    scoreDisplay.updateHp(player.hp);
    aliensSpeed += 1.5;
    SECONDS_ALIENS_SHOOT = 1.25;
  }

  // Main game logic ticker
  app.ticker.add(() => {
    if (!gameRunning) return;

    intervalUFO++;
    intervalAlienMissile++;
    if (shield === true) intervalShield++;

    // // Handling player movement
    if (keys["ArrowLeft"]) player.moveLeft(app);
    if (keys["ArrowRight"]) player.moveRight(app);

    // Sending UFO every SECONDS_UFO seconds
    if (intervalUFO == SECONDS_UFO * 60) {
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

    // Storing all alive aliens
    aliensAlive = [];
    aliensContainer.children.forEach((col) => {
      for (let index = 0; index < col.children.length; index++) {
        aliensAlive.push(col.children[index]);
      }
    });

    // Making the aliens shoot every SECONDS_ALIENS_SHOOT seconds
    if (intervalAlienMissile == SECONDS_ALIENS_SHOOT * 60) {
      const randomNum = Math.floor(
        Math.random() * aliensContainer.children.length
      );
      if (aliensContainer.children[randomNum]) {
        let randomCol = aliensContainer.children[randomNum];
        if (randomCol.children && randomCol.children.length > 0) {
          const chosenAlien = randomCol.children[randomCol.children.length - 1];
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
      if (shield && intervalShield >= ACTIVE_SHIELD_SECONDS * 60) {
        player.shielded(false);
        shield = false;
        intervalShield = 0;
      }
      if (distance < player.width / 2 + missile.width / 2) {
        if (shield) {
          missile.die();
          missiles.splice(i, 1);
          break;
        }

        player.hp -= 1;
        let takingDmgSound = new Audio("audio/takingDmg.wav");
        takingDmgSound.play();
        player.takesDmg();
        scoreDisplay.updateHp(player.hp);

        if (player.hp === 0) {
          player.die();
          gameRunning = false;
          displayEndResult(false);
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
            blocker.hp = blocker.hp - 1;
            blocker.updateTexture();
            if (blocker.hp === 0) blocker.die();
          }
        }
      });
    }

    // Making the laser to hit
    if (app.stage.getChildByName("laser")) {
      const laser = app.stage.getChildByName("laser");
      if (!laser.destroyed) {
        // Checking if alien is hit
        aliensContainer.children.forEach((col) => {
          col.children.forEach((alien) => {
            if (alien.destroyed) return;
            if (checkCollisionByBounds(laser, alien)) {
              alien.die();
              score += 10;
              killedAliensForDrops++;
              aliensKilledForGuidedMissile++;
              scoreDisplay.updateScore(score);
            }
          });

          // Checking if blocker is hit
          blockersContainer.children.forEach((blocker) => {
            if (checkCollisionByBounds(laser, blocker)) {
              blocker.die();
            }
          });

          // Checking if UFO is hit
          if (app.stage.getChildByName("ufo")) {
            const ufo = app.stage.getChildByName("ufo");
            if (checkCollisionByBounds(laser, ufo)) {
              ufo.die();
              score += 150;
              scoreDisplay.updateScore(score);
            }
          }

          // Check if missile is hit\
          if (missle) {
            if (checkCollisionByBounds(laser, missle)) {
              isMissleOnScreen = false;
              missle.die();
              missle = null;
            }
          }
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
      // First we check if the missile is destroyed
      if (missile.destroyed) return;
      // If the missile is out of bounds
      if (
        missile.y - missile.height > app.screen.height ||
        missile.x < 0 ||
        missile.x > app.screen.width
      ) {
        missile.die();
        guidedMissiles.splice(guidedMissiles.indexOf(missile), 1);
      }

      // Hitting the target. If the target is destroyed before reaching it, find the nearest alien and go for it
      if (!missile.target || missile.target.destroyed) {
        // Finding the nearest alien
        let nearest = null,
          minD2 = Infinity;
        aliensAlive.forEach((alien) => {
          if (alien.destroyed) return;
          const dx = alien.x - missile.x;
          const dy = alien.y - missile.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < minD2) {
            minD2 = d2;
            nearest = alien;
          }
        });
        if (nearest) {
          missile.changeTarget(nearest);
        } else {
          missile.die();
          return;
        }
      }
      missile.move();

      // 4) check collision with *that* target
      if (checkCollisionByHypot(missile, missile.target)) {
        missile.target.die();
        missile.die();
        score += 10;
        scoreDisplay.updateScore(score);
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

          if (checkCollisionByHypot(missle, alien)) {
            isMissleOnScreen = false;
            missle.die();
            missle = null;
            const globalAlienPos = alien.getGlobalPosition();
            aliensKilledForGuidedMissile++;
            alien.die();
            score += 10;
            killedAliensForDrops++;
            // Dropping random bonus, on 7 killed units
            if (killedAliensForDrops >= 7) {
              killedAliensForDrops = 0;
              const randomBonus = Math.floor(Math.random() * 1) + 1;

              let drop;
              if (randomBonus === 1) {
                drop = new ShieldDrop(globalAlienPos.x, globalAlienPos.y);
              } else {
                drop = new OmegaRayDrop(globalAlienPos.x, globalAlienPos.y);
              }
              app.stage.addChild(drop);
              powerDrops.push(drop);
            }

            // Logic for spawning guided missiles
            if (aliensKilledForGuidedMissile >= 10) {
              const bottomAliens = [];

              aliensContainer.children.forEach((col) => {
                for (let i = col.children.length - 1; i >= 0; i--) {
                  const alien = col.children[i];
                  if (!alien.destroyed) {
                    bottomAliens.push(alien);
                    break; // Only the last (bottom) alive alien
                  }
                }
              });

              if (bottomAliens.length > 0) {
                const targetAlien =
                  bottomAliens[Math.floor(Math.random() * bottomAliens.length)];
                const guidedMissile = new GuidedMissile(
                  player.x,
                  player.y,
                  targetAlien
                );
                guidedMissiles.push(guidedMissile);
                app.stage.addChild(guidedMissile);
                aliensKilledForGuidedMissile = 0;
              }
            }

            scoreDisplay.updateScore(score);
          }
        });
      });

      // Logic for shield blocks hit
      blockersContainer.children.forEach((blocker) => {
        if (!missle) return;
        if (checkCollisionByHypot(missle, blocker)) {
          isMissleOnScreen = false;
          missle.die();
          missle = null;
          blocker.hp = blocker.hp - 1;
          blocker.updateTexture();
          if (blocker.hp === 0) blocker.die();
        }
      });

      // Logic for UFO hit
      if (app.stage.getChildByName("ufo")) {
        if (!missle) return;
        const ufo = app.stage.getChildByName("ufo");

        if (checkCollisionByBounds(missle, ufo)) {
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

      if (checkCollisionByHypot(drop, player)) {
        if (drop instanceof ShieldDrop) {
          player.shielded(true);
          shield = true;
          intervalShield = 0;
        } else if (drop instanceof OmegaRayDrop) {
          player.omegaRayShake(true);
          omegaRay = true;
        }
        drop.disappear();
        powerDrops.splice(i, 1);
      }
    }

    // Checking if aliens have reacher the blockers, if they have, game is LOST.
    blockersContainer.children.forEach((blocker) => {
      aliensAlive.forEach((alien) => {
        if (alien.destroyed) return;

        const alienBottom = alien.getGlobalPosition().y + alien.height / 2;
        const blockerTop = blocker.getGlobalPosition().y - blocker.height / 2;

        if (alienBottom >= blockerTop) {
          displayEndResult(false);
          gameRunning = false;
        }
      });
    });

    if (aliensAlive.length === 0) {
      // Checking if the game is won
      if (currentStage >= 10) {
        scoreDisplay.displayResult(true);
        displayEndResult(true);
        return;
      }

      currentStage++;

      app.stage.removeChild(aliensContainer);
      aliensContainer.destroy({ children: true });

      aliensContainer = new AliensContainer();

      for (let col = 0; col < COLS; col++) {
        const container = new Container();

        for (let row = 0; row < ROWS; row++) {
          const alien = new Alien(col * SPACING, row * SPACING - 40);
          container.addChild(alien);
        }

        aliensContainer.addChild(container);
      }

      stageDisplay.update(currentStage);
      // Add to stage and reposition
      app.stage.addChild(aliensContainer);
      aliensContainer.x = (app.screen.width - aliensContainer.width) / 2;
      aliensContainer.y = 125;

      aliensSpeed += 1;
    }
  });
}

function checkCollisionByHypot(fire, object) {
  if (object.destroyed || fire.destroyed) return;
  const objectGlobalPos = object.getGlobalPosition();
  const distance = Math.hypot(
    fire.x - objectGlobalPos.x,
    fire.y - objectGlobalPos.y
  );

  if (distance < object.width / 2 + fire.width / 2) {
    return true;
  } else {
    return false;
  }
}

function checkCollisionByBounds(fire, object) {
  if (object.destroyed || fire.destroyed) return;
  const fireBounds = fire.getBounds();
  const objectBounds = object.getBounds();
  if (
    fireBounds.x < objectBounds.x + objectBounds.width &&
    fireBounds.x + fireBounds.width > objectBounds.x &&
    fireBounds.y < objectBounds.y + objectBounds.height &&
    fireBounds.y + fireBounds.height > objectBounds.y
  )
    return true;
}

/**
 * IF result = true -> WON
 * IF result = false -> LOST
 */
function displayEndResult(result) {
  backgroundMusic.currentTime = 0;
  backgroundMusic.pause();
  const endScreen = document.getElementById("end-screen");
  document.getElementById("end-screen-result").textContent = `${
    result ? "YOU WIN!" : "GAME OVER"
  }`;
  document.getElementById(
    "end-screen-score"
  ).textContent = `Your score: ${score}.  Note: To play the game again, restart the tab.`;
  setTimeout(() => {
    const tl = gsap.timeline();
    tl.to(endScreen, {
      duration: 0.35,
      x: "100%",
    });
  }, 500);
}

function resetGame() {
  // 1) Stop the game loop
  gameRunning = false;
  app.ticker.stop();

  // 2) Clear the stage entirely (removes player, aliens, UI, etc.)

  // 3) Reset all counters & flags
  score = 0;
  killedAliensForDrops = 0;
  aliensKilledForGuidedMissile = 0;
  aliensSpeed = 0.75; // back to your base speed
  intervalUFO = 0;
  intervalAlienMissile = 0;
  intervalShield = 0;
  intervalLaser = 0;
  isMissleOnScreen = false;
  missle = null;
  shield = false;
  omegaRay = false;

  // 4) Clear input state
  keys = {};

  // 5) Destroy & empty all projectile/bonus arrays
  missiles.forEach((m) => m.die());
  missiles = [];

  guidedMissiles.forEach((m) => m.die());
  guidedMissiles = [];

  powerDrops.forEach((p) => p.disappear());
  powerDrops = [];

  aliensAlive = [];
  currentStage = 1;

  // 7) Restart ticker so you can play again
  gameRunning = true;
}

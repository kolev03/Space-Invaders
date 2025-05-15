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

const app = new Application();

// Game is running
let gameRunning = true;
let isMissleOnScreen = false;
let missle = null;

// Setting the numbers of aliens and the spacing between them
const ROWS = 5;
const COLS = 13;
const SPACING = 55;
const NUMBER_SHIELDS = 4;

// Variables for adaptive scoreboard
let INFO_TEXT;
const score = 0;
const playerHpText = 3;

// Setting the speed of aliens
const aliensSpeed = 0.75;

// Counting time past in the ticker
const intervalUFO = 0;
const intervalAlienMissile = 0;

// Seconds for actions
const secondsUFO = 15;
const secondsAlienShoot = 2;

async function setup() {
  await app.init({
    background: `white`,
    resizeTo: window,
  });

  document.body.appendChild(app.canvas);
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
  ];

  await Assets.load(assets);
}



(async () => {
  await setup();
  await load();

  addBackground(app);

  const player = new Player(app.screen.width / 2, app.screen.height);
  app.stage.addChild(player);

  addScore(app, player);

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
  let shieldContainer = new Container();
  for (let i = 1; i <= NUMBER_SHIELDS; i++) {
    const block = new Blocker((app.screen.width / 5) * i, player.y - 125);
    shieldContainer.addChild(block);
  }

  app.stage.addChild(shieldContainer);

  // Listening for key actions
  const keys = {};
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

  const missiles = []; // Array to store active missiles

  // Main game logic ticker
  app.ticker.add(() => {
    if (!gameRunning) return;

    intervalUFO++;
    intervalAlienMissile++;

    // Handling player movement
    if (keys["ArrowLeft"]) player.moveLeft(app);
    if (keys["ArrowRight"]) player.moveRight(app);

    if (keys["Space"]) {
      keys["Space"] = false;
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
      console.log("added");
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

    // Making the aliens shoot every secondsAlienShoot seconds
    if (intervalAlienMissile == secondsAlienShoot * 60) {
      const randomNum =
        Math.trunc(Math.random() * aliensContainer.children.length) + 1;
      let randomCol = aliensContainer.children[randomNum];
      const chosenAlien = randomCol.children[randomCol.children.length - 1];

      const chosenAlienGlobal = chosenAlien.getGlobalPosition();

      const alienMissleStrike = new alienMissile(
        chosenAlienGlobal.x,
        chosenAlienGlobal.y
      );

      app.stage.addChild(alienMissleStrike);
      missiles.push(alienMissleStrike);
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
        player.hp -= 1;
        INFO_TEXT.text = `Score: ${score}, HP: ${player.hp}`;
        if (player.hp === 0) {
          player.die();
          gameRunning = false;
          INFO_TEXT.text = `YOU LOST!`;
        }
        missile.die();
        missiles.splice(i, 1);
        break;
      }

      // Checking if the shield is hit
      shieldContainer.children.forEach((shield) => {
        if (!missile.destroyed) {
          const distance = Math.hypot(
            missile.x - shield.x,
            missile.y - shield.y
          );
          if (distance < shield.width / 2 + missile.width / 2) {
            missile.die();
            shield.alpha -= 0.25;
            shield.hp = shield.hp - 1;
            if (shield.hp === 0) shield.die();
          }
        }
      });
    }

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
          if (distance < alien.width / 2 + missle.width / 2) {
            isMissleOnScreen = false;
            missle.die();
            missle = null;
            alien.die();
            score += 10;
            if (score == 650) {
              INFO_TEXT.text = `YOU WON!`;
              gameRunning = false;
              return;
            }
            aliensSpeed += aliensSpeed * 0.043;
            INFO_TEXT.text = `Score: ${score}, HP: ${player.hp}`;
          }
        });
      });

      // Logic for shield blocks hit
      shieldContainer.children.forEach((shield) => {
        if (!missle) return;

        const distance = Math.hypot(missle.x - shield.x, missle.y - shield.y);
        if (distance < shield.width / 2 + missle.width / 2) {
          isMissleOnScreen = false;
          missle.die();
          missle = null;
          shield.alpha -= 0.25;
          shield.hp = shield.hp - 1;
          if (shield.hp === 0) shield.die();
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
          console.log("Hit");
          score += 150;
          INFO_TEXT.text = `Score: ${score}, HP: ${player.hp}`;
        }
      }
    }
  });
})();

/**
 * Adding the score to the game
 */
function addScore(app, player) {
  const uiContainer = new Container();
  uiContainer.x = 30;
  uiContainer.y = 10;

  // Create text style
  const style = new TextStyle({
    fontSize: 34,
    fill: "#ffffff",
    fontFamily: "Arial",
  });

  // Create text
  INFO_TEXT = new Text({ text: `Score: ${score}, HP: ${playerHpText}`, style });

  const bg = new Graphics();
  bg.fill({ color: 0x00000 }); // semi-transparent black
  bg.roundRect(0, 0, INFO_TEXT.width + 20, INFO_TEXT.height + 20, 10);
  bg.resolution = 10;

  // Assemble and add to stage
  uiContainer.addChild(INFO_TEXT);
  app.stage.addChild(uiContainer);
}

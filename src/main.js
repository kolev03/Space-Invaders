import {
  Application,
  Assets,
  Text,
  TextStyle,
  Container,
  Graphics,
} from "pixi.js";
import { addBackground } from "./addBackground";
import Player from "./player";
import Alien from "./alien";
import AliensContainer from "./aliensContainer";
import Missle from "./missle";
import Blocker from "./blockers";
import alienMissile from "./alienMissle";

const app = new Application();

// Setting the numbers of aliens and the spacing between them
const ROWS = 5;
const COLS = 13;
const SPACING = 55;

let infoText;
let score = 0;

// Setting the time for shooting the aliens
let SHOOT_TIMER = 0;

// Setting the speed of aliens
let aliensSpeed = 0.75;

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
      src: "https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg",
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
  ];

  await Assets.load(assets);
}

let isMissleOnScreen = false;
let missle = null;

(async () => {
  await setup();
  await load();

  addBackground(app);
  addScore(app);

  const player = new Player(app.screen.width / 2, app.screen.height);
  app.stage.addChild(player);

  const aliensContainer = new AliensContainer();

  // Add aliens to the container
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const alien = new Alien(col * SPACING, row * SPACING - 40);
      aliensContainer.addChild(alien);
    }
  }

  // Add container to the canvas
  app.stage.addChild(aliensContainer);

  // Center container based on its width
  aliensContainer.x = (app.screen.width - aliensContainer.width) / 2;
  aliensContainer.y = 125;

  // Add defense blocks
  let numberShields = 4;
  let shieldContainer = new Container();
  for (let i = 1; i <= numberShields; i++) {
    const block = new Blocker((app.screen.width / 5) * i, player.y - 125);
    shieldContainer.addChild(block);
  }

  app.stage.addChild(shieldContainer);

  // Listening for key actions
  const keys = {};
  window.addEventListener("keydown", (key) => (keys[key.code] = true));
  window.addEventListener("keyup", (key) => (keys[key.code] = false));

  // Player control ticker
  app.ticker.add(() => {
    if (keys["ArrowLeft"]) player.moveLeft(app);
    if (keys["ArrowRight"]) player.moveRight(app);

    if (keys["Space"]) {
      if (isMissleOnScreen) return;
      isMissleOnScreen = true;
      missle = new Missle(player.x, player.y);
      app.stage.addChild(missle);
    }
  });

  const columns = {};

  // Main game logic ticker
  console.log(aliensContainer.children.filter(alien => alien.fire === true))
  app.ticker.add((delta) => {

    aliensContainer.x += aliensSpeed * aliensContainer.direction;

    let leftMost = Infinity;
    let rightMost = -Infinity;

    // Adapting the width of the aliens container
    aliensContainer.children.forEach((alien) => {
      if (!alien.destroyed) {
        let alienGlob = alien.getGlobalPosition();
        leftMost = Math.min(leftMost, alienGlob.x);
        rightMost = Math.max(rightMost, alienGlob.x);
      }
    });

    // Storing the aliens in an object by columns and the setting the last to strike
    aliensContainer.children.forEach((alien) => {
      if (alien.destroyed) return;

      const roundedX = Math.round(alien.x / SPACING) * SPACING;

      if (!columns[roundedX]) {
        columns[roundedX] = [];
      }

      columns[roundedX].push(alien);

      for (let col in columns) {
        const aliensInColumn = columns[col];

        let lowestAlien = null;
        let maxY = -Infinity;

        for (const alien of aliensInColumn) {
          if (!alien.destroyed && alien.y > maxY) {
            maxY = alien.y;
            lowestAlien = alien;
          }
        }

        if (lowestAlien) {
          lowestAlien.fire = true;
        }
      }
    });

    // setInterval(() => {
    //   console.log("hi");
    // }, 2000);

    if (leftMost <= 50) {
      aliensContainer.direction = 1;
      aliensContainer.y += 5;
    } else if (rightMost >= app.screen.width - 50) {
      aliensContainer.direction = -1;
      aliensContainer.y += 5;
    }

    // Missle logic
    if (missle) {
      missle.move();

      if (missle.isOutOfBounds) {
        isMissleOnScreen = false;
        missle.die();
        missle = null;
        return;
      }

      // Logic for aliens hit
      aliensContainer.children.forEach((alien) => {
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
          console.log(alien.fire);
          alien.die();
          score += 10;
          if (score == 650) {
            infoText.text = `YOU WON!`;
            return;
          }
          aliensSpeed += aliensSpeed * 0.043;
          infoText.text = `Score: ${score}`;
        }
      });

      // Logic for shield blocks hit
      shieldContainer.children.forEach((shield) => {
        if (!missle) return;

        const distance = Math.hypot(missle.x - shield.x, missle.y - shield.y);
        if (distance < shield.width / 2 + missle.width / 2) {
          isMissleOnScreen = false;
          missle.die();
          missle = null;
          shield.hp = shield.hp - 1;
          if (shield.hp === 0) shield.die();
        }
      });
    }
  });
})();

/**
 * Adding the score to the game
 */
function addScore(app) {
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
  infoText = new Text({ text: `Score: ${score}`, style });

  const bg = new Graphics();
  bg.fill({ color: 0x00000 }); // semi-transparent black
  bg.roundRect(0, 0, infoText.width + 20, infoText.height + 20, 10);
  bg.resolution = 10;

  // Assemble and add to stage
  uiContainer.addChild(infoText);
  app.stage.addChild(uiContainer);
}

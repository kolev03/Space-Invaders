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

const app = new Application();

const ROWS = 5; 
const COLS = 13;
const SPACING = 55;

let infoText;
let score = 0;

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
  let shieldContainer = new Container()
  for (let i = 1; i <= numberShields; i++) {
    const block = new Blocker((app.screen.width / 5) * i, player.y - 100);
    shieldContainer.addChild(block)
    app.stage.addChild(block);
  }

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

  // Main game logic ticker
  app.ticker.add(() => {
    // Move aliensContainer

    let aliensSpeed = 2.5;

    aliensContainer.x += aliensContainer.direction * aliensSpeed;

    const rightEdge = aliensContainer.x + aliensContainer.width;
    const leftEdge = aliensContainer.x;

    if (rightEdge >= app.screen.width) {
      aliensContainer.direction = -1;
      aliensContainer.y += 5;
    } else if (leftEdge <= 50) {
      aliensContainer.direction = 1;
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
          alien.die();
          score += 10;
          infoText.text = `Score: ${score}`;
        }
        
      });

      shieldContainer.children.forEach((shield) => {
        if (!missle) return;

        const distance = Math.hypot(
          missle.x - shield.x,
          missle.y - shield.y
        );
        if (distance < shield.width / 2 + missle.width / 2) {
          isMissleOnScreen = false;
          missle.die();
          missle = null;
          shield.die();
        }
        
      });
    }
  });
  await addScore(app);
})();

async function addScore(app) {
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

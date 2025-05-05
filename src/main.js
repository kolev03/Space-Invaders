import { Application, Assets } from "pixi.js";
import { addBackground } from "./addBackground";
import Player from "./player";
import Alien from "./alien";
import AliensContainer from "./aliensContainer";
import Missle from "./missle";

const app = new Application();

const ROWS = 5;
const COLS = 10;
const SPACING = 75;

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
  const aliensContainer = new AliensContainer();

  // Add aliens to the container
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const alien = new Alien(col * SPACING, row * SPACING - 40);
      aliensContainer.addChild(alien);
    }
  }

  // Measure custom width of the widest alien row
  let maxRowWidth = 0;
  for (let row = 0; row < ROWS; row++) {
    const y = row * SPACING - 40;
    const aliensInRow = aliensContainer.children.filter(
      (alien) => Math.abs(alien.y - y) < 1
    );
    if (aliensInRow.length === 0) continue;

    const leftMost = Math.min(...aliensInRow.map(a => a.x - a.width / 2));
    const rightMost = Math.max(...aliensInRow.map(a => a.x + a.width / 2));
    const rowWidth = rightMost - leftMost;

    if (rowWidth > maxRowWidth) maxRowWidth = rowWidth;
  }

  // Store the true width manually
  aliensContainer.customWidth = maxRowWidth;

  app.stage.addChild(aliensContainer);

  // Center container based on computed width
  aliensContainer.x = (app.screen.width - aliensContainer.customWidth) / 2;
  aliensContainer.y = 70;
  aliensContainer.direction = 1;

  app.stage.addChild(player);

  const keys = {};
  window.addEventListener("keydown", (key) => (keys[key.code] = true));
  window.addEventListener("keyup", (key) => (keys[key.code] = false));

  // Player control
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

  // Game loop
  app.ticker.add(() => {
    // Move aliensContainer
    const speed = 2.5;
    aliensContainer.x += aliensContainer.direction * speed;

    const rightEdge = aliensContainer.x + aliensContainer.customWidth;
    const leftEdge = aliensContainer.x;

    if (rightEdge >= app.screen.width) {
      aliensContainer.direction = -1;
      aliensContainer.y += 5;
    } else if (leftEdge <= 0) {
      aliensContainer.direction = 1;
      aliensContainer.y += 5;
    }

    // Missile logic
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
        }
      });
    }
  });
})();

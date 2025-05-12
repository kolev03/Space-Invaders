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
let SHOOT_TIMER = 2000;

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

  //-------------------------------------------------------------------------------------

  const missiles = []; // Array to store active missiles

  function alienShoot() {
    console.log(
      `${SHOOT_TIMER / 1000} seconds passed - Aliens should shoot now!`
    );
    let aliensToShoot = aliensContainer.children.filter((alien) => alien.fire);
    let randomAlienIndex = Math.floor(Math.random() * aliensToShoot.length);
    // Check if there are any aliens to shoot
    if (aliensToShoot.length > 0) {
      const randomAlien = aliensToShoot[randomAlienIndex];
      const alienGlobal = randomAlien.getGlobalPosition();

      const alienMissileInstance = new alienMissile(
        alienGlobal.x,
        alienGlobal.y
      );
      app.stage.addChild(alienMissileInstance);
      missiles.push(alienMissileInstance);
    } else {
      console.log("No aliens to shoot");
      return; // Exit, if no aliens to shoot.
    }
  }

  // Set up the 2-second interval using setInterval
  setInterval(alienShoot, SHOOT_TIMER);
  //-------------------------------------------------------------------------------------

  // Main game logic ticker
  app.ticker.add(() => {
    // Tracking the alien missiles
    for (let i = missiles.length - 1; i >= 0; i--) {
      const missile = missiles[i];
      missile.move(); // Move the missile

      if (missile.y - missile.height > app.screen.height) {
        missile.die();
        missiles.splice(i, 1); // Remove from the array
        console.log("Missile destroyed and removed from array");
      }

      const globalPlayerPos = player.getGlobalPosition();
      const distance = Math.hypot(
        alienMissile.x - globalPlayerPos.x,
        alienMissile.y - globalPlayerPos.y
      );


      if (distance < player.width / 2 + alienMissile.width / 2) {
        console.log("HIT");
        player.die();
        alienMissile.die();
      }
      // You can add collision detection here, and remove missiles from the array
      // when they collide, too.
    }

    // Moving the aliens
    aliensContainer.x += aliensSpeed * aliensContainer.direction;
    let leftMost = Infinity;
    let rightMost = -Infinity;

    // Making the aliens container adaptive, so when the container reaches the end of the screen it goes to the last alien
    aliensContainer.children.forEach((alien) => {
      if (!alien.destroyed) {
        let alienGlob = alien.getGlobalPosition();
        leftMost = Math.min(leftMost, alienGlob.x);
        rightMost = Math.max(rightMost, alienGlob.x);
      }
    });

    // Making each alien in a column and getting the alien with the biggest Y from each column. Then we set the property fire of that alien to true so it can shoot.
    const columns = {};
    aliensContainer.children.forEach((alien) => {
      if (alien.destroyed) return;

      const roundedX = Math.round(alien.x / SPACING) * SPACING;

      if (!columns[roundedX]) {
        columns[roundedX] = [];
      }

      // Check if the alien is already in the column before adding.
      if (!columns[roundedX].includes(alien)) {
        columns[roundedX].push(alien);
      }
    });

    // Iterate through the columns object to find the lowest alien in each
    for (const col in columns) {
      let lowestAlien = null;
      let maxY = -Infinity;

      columns[col].forEach((alien) => {
        // Iterate over the aliens *in the column*
        if (!alien.destroyed && alien.y > maxY) {
          maxY = alien.y;
          lowestAlien = alien;
        }
      });

      if (lowestAlien) {
        lowestAlien.fire = true;
      }
    }

    // Clear the columns object.
    for (const col in columns) {
      columns[col] = [];
    }

    if (leftMost <= 50) {
      aliensContainer.direction = 1;
      aliensContainer.y += 5;
    } else if (rightMost >= app.screen.width - 50) {
      aliensContainer.direction = -1;
      aliensContainer.y += 5;
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
          shield.alpha -= 0.25;
          console.log(shield.opac);
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

import { Sprite } from "pixi.js";

export function addPlayer(app) {
  // Load the space ship
  const player = Sprite.from("playerShip");

  // Set the size and position of the ship
  player.anchor.set(0.5);

  player.width = 150;
  player.height = 100;
  player.background = `transparent`;

  player.x = app.screen.width / 2;
  player.y = app.screen.height - 70;

  const keys = {};

  window.addEventListener("keydown", (key) => {
    keys[key.code] = true;
    console.log(key);
  });

  window.addEventListener("keyup", (key) => {
    keys[key.code] = false;
  });

  app.ticker.add(() => {
    const speed = 15;
    if (player.x > 100) {
      if (keys[`ArrowLeft`]) player.x -= speed;
    }
    if (player.x < app.screen.width - 100) {
      if (keys[`ArrowRight`]) player.x += speed;
    }
  });

  app.stage.addChild(player);
}

import { Sprite } from "pixi.js";
import { fireMissle } from "./missle";

export function addPlayer(app) {
  // Load the space ship
  const player = Sprite.from("playerShip");

  // Set the size and position of the ship
  player.anchor.set(0.5);

  player.width = 150;
  player.height = 100;

  // Set starting position
  player.x = app.screen.width / 2;
  player.y = app.screen.height - 70;

  const keys = {};

  // Event listeners for the pressed keys
  window.addEventListener("keydown", (key) => {
    keys[key.code] = true;
    console.log(key);
  });

  window.addEventListener("keyup", (key) => {
    keys[key.code] = false;
  });

  app.ticker.add(() => {
    // Player speed
    const speed = 15;

    if (player.x > 100) {
      if (keys[`ArrowLeft`]) player.x -= speed;
    }
    if (player.x < app.screen.width - 100) {
      if (keys[`ArrowRight`]) player.x += speed;
    }

    // If space is clicked a missle will be launched
    if (keys["Space"]) fireMissle(app, player.x);
  });

  app.stage.addChild(player);
}

import { Sprite } from "pixi.js";

export function addPlayer(app) {
    // Load the space ship
  const player = Sprite.from("playerShip");

  // Set the size and position of the ship
  player.anchor.set(0.5);

  player.width = 150;
  player.height = 100;
  player.background = `transparent`

  player.x = app.screen.width / 2;
  player.y = app.screen.height - 70;



  app.stage.addChild(player);
}

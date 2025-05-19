import { Sprite } from "pixi.js";

export function addBackground(app) {
  const background = Sprite.from("background");

  background.anchor.set(0.5);

  background.height = app.screen.height > 720 ? app.screen.height : 720;
  background.width = app.screen.width > 1280 ? app.screen.width : 1280;

  background.x = app.screen.width / 2;
  background.y = app.screen.height / 2;

  app.stage.addChild(background);
}

import { Sprite, Texture } from "pixi.js";

const WIDTH = 30;

export default class Laser extends Sprite {
  constructor(x, y, height) {
    super(Texture.from("ray"));
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = WIDTH;
    this.anchor.y = 1;
    this.anchor.x = 0.5;
  }

  die() {
    this.destroy();
  }
}

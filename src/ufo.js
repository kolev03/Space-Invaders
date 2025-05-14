import { Sprite, Texture } from "pixi.js";

const WIDTH = 120;
const HEIGHT = 120;
const SPEED = 3;

class UFO extends Sprite {
  constructor(x) {
    super(Texture.from("ufo"));
    this.width = WIDTH;
    this.height = HEIGHT;
    this.x = x;
    this.y = 50;
  }

  move() {
    this.x -= SPEED;
  }

  die() {
    this.destroy();
  }
}

export default UFO;

import { Sprite, Texture } from "pixi.js";

const HEIGHT = 20;
const WIDTH = 10;

const SPEED = 3;

class alienMissle extends Sprite {
  get isOutOfBounce() {
    return this.y + HEIGHT < 0;
  }
  constructor(x, y) {
    super(Texture.from(`missle`)), (this.x = x);
    this.y = y;
    this.width = WIDTH;
    this.height = HEIGHT;
  }
  move() {
    this.y += SPEED;
  }
  die() {
    this.destroy();
  }
}

export default alienMissle;

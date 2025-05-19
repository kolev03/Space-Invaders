import { Sprite, Texture } from "pixi.js";

const HEIGHT = 40;
const WIDTH = 30;

const SPEED = 3;

class alienMissile extends Sprite {
  constructor(x, y) {
    super(Texture.from(`alienMissile`));
    this.x = x;
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

export default alienMissile;

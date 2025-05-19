import { Sprite, Texture } from "pixi.js";

const WIDTH = 50; 
const HEIGHT = 50;

const SPEED = 13

class Missle extends Sprite {
  get isOutOfBounds() {
    return this.y + HEIGHT / 2 < 0;
  }

  constructor(x, y) {
    super(Texture.from("missle"));
    this.width = WIDTH;
    this.height = HEIGHT;
    this.x = x;
    this.y = y;
    this.anchor.set(0.5);
  }

  move() {
    this.y -= SPEED;
  }

  die() {
    this.destroy();
  }
}

export default Missle;

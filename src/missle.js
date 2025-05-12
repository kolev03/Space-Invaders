import { Sprite, Texture } from "pixi.js";

const WIDTH = 30; 
const HEIGHT = 70;

const SPEED = 45
const HP = 4

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
    this.hp = HP;
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

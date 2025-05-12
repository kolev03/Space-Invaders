import { Sprite } from "pixi.js";

const WIDTH = 50;
const HEIGHT = 20;
const SPEED = 5;

class UFO extends Sprite {
  constructor(x) {
    super(Texture.from("ufo"));
    this.width = WIDTH;
    this.height = HEIGHT;
    this.x = x;
    this.y = 100;
  }

  move() {
    this.x -= SPEED;
  }
}

export default UFO;

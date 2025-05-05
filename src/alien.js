import { Sprite, Texture } from "pixi.js";

const SIZE = 50;

class Alien extends Sprite {
  constructor(x, y) {
    super(Texture.from("alien1"));
    this.width = SIZE;
    this.height = SIZE;
    this.x = x;
    this.y = y;
    this.anchor.set(0.5);
  }

  die() {
    this.destroy();
  }
}

export default Alien;

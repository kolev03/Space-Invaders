import { Sprite, Texture } from "pixi.js";

const SIZE = 100;

class Blocker extends Sprite {
  constructor(x, y) {
    super(Texture.from("blocker1"));
    this.x = x;
    this.y = y;
    this.width = SIZE
    this.height = SIZE
    this.hp = 4;
    this.anchor.set(0.5);
  }

  die() {
    this.destroy();
  }
}

export default Blocker;

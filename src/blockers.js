import { Sprite, Texture } from "pixi.js";

class Blocker extends Sprite {
  constructor(x, y) {
    super(Texture.from("blocker1"));
    this.x = x;
    this.y = y;
    this.width = 100
    this.height = 100
    this.anchor.set(0.5);
  }

  die() {
    this.destroy();
  }
}

export default Blocker;

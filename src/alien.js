import { Sprite, Texture } from "pixi.js";

const SIZE = 65;

class Alien extends Sprite {
  constructor(x, y) {
    const randomNum = Math.floor(Math.random() * 3) + 1
    super(Texture.from("alien1"));
    this.width = SIZE;
    this.height = SIZE;
    this.x = x;
    this.y = y;
    this.anchor.set(0.5);
    this.fire = false;
  }

  die() {
    this.destroy();
  }
}

export default Alien;

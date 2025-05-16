import { Sprite, Texture } from "pixi.js";

const SPEED = 3;
const SIZE = 30;

export default class ShieldDrop extends Sprite {
  constructor(x, y) {
    super(Texture.from("shieldIcon"));
    this.x = x;
    this.y = y;
    this.width = SIZE;
    this.height = SIZE;
  }

  move() {
    this.y += SPEED;
  }

  disappear() {
    this.destroy();
  }
}

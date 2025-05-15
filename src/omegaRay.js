import { Sprite, Texture } from "pixi.js";

const SIZE = 30;
const SPEED = 3;

export default class OmegaRay extends Sprite {
  constructor(x, y) {
    super(Texture.from("omegaRay"));
    this.x = x;
    this.y = y;
    this.width = SIZE;
    this.height = SIZE;
  }

  move() {
    this.y += SPEED;
  }
}

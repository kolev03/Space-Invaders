import { Sprite, Texture } from "pixi.js";

const SPEED = 3;
const SIZE = 30;

export default class OmegaRayDrop extends Sprite {
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

  disappear(){
    this.destroy();
  }
}

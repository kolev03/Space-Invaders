import { Sprite, Texture } from "pixi.js";

const SIZE = 140;

class Blocker extends Sprite {
  constructor(x, y) {
    super(Texture.from("blocker4/4"));
    this.x = x;
    this.y = y;
    this.width = SIZE;
    this.height = SIZE;
    this.hp = 12;
    this.anchor.set(0.5);
  }

  die() {
    this.destroy();
  }

  updateTexture() {
    if (this.hp === 0) return;
    const state = Math.max(0, 3 - Math.floor((12 - this.hp) / 4));
    this.texture = Texture.from(`blocker4/${state}`);
  }
}

export default Blocker;

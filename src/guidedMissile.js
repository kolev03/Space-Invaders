import { Sprite, Texture } from "pixi.js";

const WIDTH = 50;
const HEIGHT = 50;
const SPEED = 12;

export default class GuidedMissile extends Sprite {
  constructor(x, y, target) {
    super(Texture.from("guidedMissile"));

    this.anchor.set(0.5);

    this.width = WIDTH;
    this.height = HEIGHT;
    this.x = x;
    this.y = y;
    this.target = target;
    this.speed = SPEED;
  }

  move() {
    if (!this.target || this.target.destroyed) return;

    // Calculated this with ChatGPT
    const { x: targetX, y: targetY } = this.target.getGlobalPosition();
    const dx = targetX - this.x;
    const dy = targetY - this.y;

    const angle = Math.atan2(dy, dx);
    this.rotation = angle + Math.PI / 2;

    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
    this.x += vx;
    this.y += vy;
  }

  changeTarget(newTarget) {
    this.target = newTarget;
  }

  die() {
    this.destroy();
  }
}

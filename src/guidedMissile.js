import { Sprite, Texture } from "pixi.js";

const WIDTH = 30;
const HEIGHT = 70;
const SPEED = 5;

export default class GuidedMissile extends Sprite {
  constructor(x, y, target) {
    super(Texture.from("guidedMissile"));
    this.x = x;
    this.y = y;
    this.width = WIDTH;
    this.height = HEIGHT;
    this.target = target;
    this.speed = SPEED;
    this.trackingSpeed = 0.1;
  }

  move() {
    const targetGlobalPos = this.target.getGlobalPosition();
    const targetX = targetGlobalPos.x;
    const targetY = targetGlobalPos.y;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the desired velocity vector
    const vx = (dx / distance) * this.speed;
    const vy = (dy / distance) * this.speed;

    this.x += vx;
    this.y += vy;
  }

  die() {
    this.destroy();
  }
}

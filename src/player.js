import { Sprite, Texture, Graphics } from "pixi.js";
import gsap from "gsap";

const WIDTH = 125;
const HEIGHT = 100;
const HP = 3;

const PADDING = 80;

class Player extends Sprite {
  constructor(x, y) {
    super(Texture.from("assets/space-ship.png"));
    this.width = WIDTH;
    this.height = HEIGHT;
    this.x = x;
    this.y = y - HEIGHT / 2;
    this.hp = HP;
    this.anchor.set(0.5);
    this.speed = 15;
  }

  moveLeft() {
    if (this.x <= PADDING) return;

    this.x -= this.speed;
  }

  moveRight(app) {
    if (this.x >= app.screen.width - PADDING) return;

    this.x += this.speed;
  }

  omegaRayStrike() {
    const originalY = this.y;

    gsap.to(this, {
      y: originalY + 30,
      duration: 0.15,
      ease: "power1.out",
      yoyo: true,
      repeat: 1,
    });
  }

  omegaRayShake(active) {
    if (active) {
      if (this._shakeTween) return;

      this._shakeTween = gsap.to(this, {
        rotation: 0.13,
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    } else {
      if (this._shakeTween) {
        this._shakeTween.kill();
        this._shakeTween = null;
        this.rotation = 0;
      }
    }
  }

  shielded(active) {
    if (active) {
      if (this._shield) return; // Already active

      const shield = Sprite.from("shield");
      shield.anchor.set(0.5);
      shield.width = 500;
      shield.height = 500;
      console.log(shield);

      shield.x = 0; // relative to player
      shield.y = -225; // 50 pixels above player's center

      this.addChild(shield);
      this._shield = shield;
    } else {
      if (this._shield) {
        this.removeChild(this._shield);
        this._shield.destroy();
        this._shield = null;
      }
    }
  }

  takesDmg() {
    const originalTint = this.tint;

    gsap.to(this, {
      rotation: 0.1,
      duration: 0.06,
      repeat: 1,
      yoyo: true,
      ease: "sine.inOut",
    });

    this.tint = 0xff6666;

    gsap.delayedCall(0.12, () => {
      this.tint = originalTint;
    });
  }

  die() {
    this.destroy();
  }
}

export default Player;

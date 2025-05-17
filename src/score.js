import { Text, Container, Graphics, Texture, Sprite } from "pixi.js";
import gsap from "gsap";

export default class Score {
  constructor(x, y) {
    this.score = 0;
    this.hp = 3;

    this.container = new Container();
    this.container.x = x;
    this.container.y = y;

    this.text = new Text(`Score: ${this.score}`, {
      fontSize: 34,
      fill: "#ffffff",
      fontFamily: "Jersey 10",
    });

    this.bg = new Graphics();
    this.bg.fill({ color: 0x000000 });
    this.bg.roundRect(0, 0, this.text.width + 20, this.text.height + 20, 10);
    this.bg.resolution = 10;

    this.container.addChild(this.bg);
    this.container.addChild(this.text);

    this.hpIcons = [];
    this.iconTexture = Texture.from("assets/space-ship.png");

    this.updateHpIcons();
  }

  getDisplayObject() {
    return this.container;
  }

  updateScore(newScore) {
    this.score = newScore;
    this.text.text = `Score: ${this.score}`;
    this.updateHpIcons();

    const originalTint = this.text.tint;

    gsap.to(this.text, {
      y: 10,
      duration: 0.05,
      ease: "power1.out",
      yoyo: true,
      repeat: 1,
    });

    this.text.tint = 0x66ff66;

    gsap.delayedCall(0.12, () => {
      this.text.tint = originalTint;
    });
  }

  updateHp(newHp) {
    this.hp = newHp;
    this.updateHpIcons();
  }

  displayResult(result) {
    if (result.includes("STAGE")) this.text.text = `${result}`;
    else { 
      this.text.text = `YOU ${result}`;
    }
    for (const icon of this.hpIcons) {
      this.container.removeChild(icon);
      icon.destroy();
    }
    this.hpIcons = [];
    this.updateBackgroundSize();
  }

  updateBackgroundSize() {
    const lastIcon = this.hpIcons[this.hpIcons.length - 1];
    const contentWidth = lastIcon
      ? lastIcon.x + lastIcon.width
      : this.text.width;

    const width = contentWidth + 20;
    const height = this.text.height + 20;

    this.bg.clear();
    this.bg.fill({ color: 0x000000 });
    this.bg.roundRect(0, 0, width, height, 10);
  }

  updateHpIcons() {
    for (const icon of this.hpIcons) {
      this.container.removeChild(icon);
      icon.destroy();
    }
    this.hpIcons = [];

    const iconSize = 50;
    const padding = 5;

    for (let i = 0; i < this.hp; i++) {
      const icon = new Sprite(this.iconTexture);
      icon.width = iconSize;
      icon.height = iconSize / 1.5;
      icon.x = this.text.width + 30 + i * (iconSize + padding);
      icon.y = 0;
      this.hpIcons.push(icon);
      this.container.addChild(icon);
    }

    this.updateBackgroundSize();
  }

  addTo(stage) {
    stage.addChild(this.container);
    this.center(stage);
  }

  center(stage) {
    this.container.x = (stage.width - this.container.width) / 2;
  }
}

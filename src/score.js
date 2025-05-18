import { Text, Container, Graphics, Texture, Sprite } from "pixi.js";
import gsap from "gsap";

export default class Score {
  constructor(x, y) {
    this.score = 0;
    this.hp = 3;

    // Positioning constants
    this.hpIconStartX = 250;
    this.iconSize = 50;
    this.iconPadding = 5;

    // Main container
    this.container = new Container();
    this.container.x = x;
    this.container.y = y;

    // Score text
    this.text = new Text(`SCORE: ${this.score}`, {
      fontSize: 34,
      fill: "#ffffff",
      fontFamily: "Jersey 10",
    });

    // HP label
    this.hpLabel = new Text("HP:", {
      fontSize: 34,
      fill: "#ffffff",
      fontFamily: "Jersey 10",
    });

    // Background graphic
    this.bg = new Graphics();
    this.bg.fill({ color: 0x000000 });
    this.bg.roundRect(0, 0, this.text.width + 20, this.text.height + 20, 10);
    this.bg.resolution = 10;

    // Add in proper order: background, text, label, icons
    this.container.addChild(this.bg);
    this.container.addChild(this.text);
    this.container.addChild(this.hpLabel);

    this.hpIcons = [];
    this.iconTexture = Texture.from("assets/space-ship.png");

    this.updateHpIcons();
  }

  getDisplayObject() {
    return this.container;
  }

  updateScore(newScore) {
    const oldScore = this.score;
    if (newScore === oldScore) {
      // Only text update, no blink
      this.text.text = `SCORE: ${newScore}`;
      return;
    }

    this.score = newScore;
    this.text.text = `SCORE: ${newScore}`;
    this.updateHpIcons();

    // Blink tint
    const originalTint = 0xffffff;
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
    this.text.text = `YOU ${result}`;

    // Remove icons
    this.hpIcons.forEach((icon) => {
      this.container.removeChild(icon);
      icon.destroy();
    });
    this.hpIcons = [];
    this.updateBackgroundSize();
  }

  updateBackgroundSize() {
    // Determine rightmost edges
    const textRight = this.text.x + this.text.width;
    const labelRight = this.hpLabel.x + this.hpLabel.width;
    const iconsRight =
      this.hpIconStartX +
      this.hp * (this.iconSize + this.iconPadding) -
      this.iconPadding;

    const contentWidth = Math.max(textRight, labelRight, iconsRight);
    const width = contentWidth + 20;
    const height = this.text.height + 20;

    this.bg.clear();
    this.bg.fill({ color: 0x000000 });
    this.bg.roundRect(0, 0, width, height, 10);
  }

  updateHpIcons() {
    // Clear old icons
    this.hpIcons.forEach((icon) => {
      this.container.removeChild(icon);
      icon.destroy();
    });
    this.hpIcons = [];

    // Position HP label just before the icons
    this.hpLabel.x = this.hpIconStartX - (this.iconSize + this.iconPadding);
    this.hpLabel.y = (this.text.height - this.hpLabel.height) / 2;

    // Create icons in a row
    for (let i = 0; i < this.hp; i++) {
      const icon = new Sprite(this.iconTexture);
      icon.width = this.iconSize;
      icon.height = this.iconSize / 1.5;
      icon.x = this.hpIconStartX + i * (this.iconSize + this.iconPadding);
      icon.y = (this.text.height - icon.height) / 2;
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

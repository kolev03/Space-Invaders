import { Text, Container, Graphics } from "pixi.js";

export default class Score {
  constructor(x = 30, y = 10) {
    this.score = 0;
    this.hp = 3; // Добавяме начална стойност за HP

    this.container = new Container();
    this.container.x = x;
    this.container.y = y;

    this.text = new Text(`Score: ${this.score}, HP: ${this.hp}`, {
      // Display the HP
      fontSize: 34,
      fill: "#ffffff",
      fontFamily: "Arial",
    });

    const bg = new Graphics();
    bg.fill({ color: 0x000000 });
    bg.roundRect(0, 0, this.text.width + 20, this.text.height + 20, 10);
    bg.resolution = 10;

    this.container.addChild(bg);
    this.container.addChild(this.text);
  }

  getDisplayObject() {
    return this.container;
  }

  updateScore(newScore) {
    this.score = newScore;
    this.text.text = `Score: ${this.score}, HP: ${this.hp}`; // Update the text
    this.updateBackgroundSize();
  }

  updateHp(newHp) {
    this.hp = newHp;
    this.text.text = `Score: ${this.score}, HP: ${this.hp}`; // Update the text
    this.updateBackgroundSize();
  }

  displayResult(result) {
    this.text.text = `YOU ${result}`;
  }

  updateBackgroundSize() {
    const bg = this.container.getChildAt(0);
    bg.clear();
    bg.fill({ color: 0x000000 });
    bg.roundRect(0, 0, this.text.width + 20, this.text.height + 20, 10);
  }

  addTo(stage) {
    stage.addChild(this.container);
  }
}

import { Container, Graphics, Text } from "pixi.js";

/**
 * Displays the current stage number in the top-left corner.
 * Usage:
 *   const stageDisplay = new StageDisplay();
 *   app.stage.addChild(stageDisplay.getDisplayObject());
 *   stageDisplay.update(2);
 */
export default class StageDisplay {
  /**
   * @param {number} x - Horizontal position (default 10)
   * @param {number} y - Vertical position (default 10)
   */
  constructor(x = 20, y = 10) {
    this.container = new Container();
    this.container.x = x;
    this.container.y = y;

    this.text = new Text("STAGE 1", {
      fontSize: 34,
      fill: "#ffffff",
      fontFamily: "Jersey 10",
    });

    this.bg = new Graphics(); 
    this.bg.beginFill(0x000000);
    this.bg.drawRoundedRect(
      0,
      0,
      this.text.width + 20,
      this.text.height + 20,
      10
    );
    this.bg.endFill();
    this.bg.resolution = 10;

    this.container.addChild(this.bg);
    this.container.addChild(this.text);
  }

  update(stageNumber) {
    this.text.text = `STAGE ${stageNumber}`;
    this.bg.clear();
    this.bg.beginFill(0x000000);
    this.bg.drawRoundedRect(
      0,
      0,
      this.text.width + 20,
      this.text.height + 20,
      10
    );
    this.bg.endFill();
  }

  getDisplayObject() {
    return this.container;
  }
}
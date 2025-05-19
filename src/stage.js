import { Container, Graphics, Text } from "pixi.js";


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


    this.container.addChild(this.text);
  }

  update(stageNumber) {
    this.text.text = `STAGE ${stageNumber}`;
  }

  getDisplayObject() {
    return this.container;
  }
}
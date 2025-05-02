import { Sprite, Container, BackgroundLoader } from "pixi.js";

export const alienArr = [];

export function addAliens(app) {
  const aliensContainer = new Container();
  app.stage.addChild(aliensContainer);

  const rows = 5;
  const cols = 10;
  const spacing = 75;

  // Making the aliens
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const alien = Sprite.from("alien1");

      alien.width = 50;
      alien.height = 50;

      alien.x = col * spacing;
      alien.y = row * spacing - 40;

      alienArr.push(alien);

      aliensContainer.addChild(alien);
    }
  }

  let direction = "right";

  // Moving the container
  const moveLeft = () => {
    aliensContainer.x -= 3; // Move left
    if (aliensContainer.x <= 20) {
      aliensContainer.y += 5;
      direction = "right";
    }
  };

  const moveRight = () => {
    aliensContainer.x += 3; // Move right
    if (aliensContainer.x + aliensContainer.width >= app.screen.width - 20) {
      aliensContainer.y += 5;
      direction = "left";
    }
  };

  app.ticker.add(() => {
    (direction === "left" ? moveLeft : moveRight)();
  });

  // Center the container on screen
  aliensContainer.x = app.screen.width / 2 - (cols * spacing) / 2;
  aliensContainer.y = 40;
}

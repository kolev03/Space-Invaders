import { Sprite } from "pixi.js";
import { alienArr } from "./aliens";

let shoot = true;

/**
 * This is the function which generates and move the missile. Inside it we check:
 * - if there is another missile in the canvas, if there is second missile can't be send
 */

export function fireMissle(app, firePoint, alienHit) {
  if (shoot) {
    const missile = Sprite.from(`missle`);
    shoot = false;
    missile.label = "missile";
    missile.anchor.set(0.5);

    // Making responsive size
    const desiredWidth = app.screen.width * 0.015;
    missile.width = Math.min(desiredWidth, 30);
    const desiredHeight = app.screen.width * 0.05;
    missile.height = Math.min(desiredHeight, 70);

    // Setting starting position
    missile.x = firePoint;
    missile.y = app.screen.height - 130;

    app.stage.addChild(missile);

    // Moving the missile, and if the missile gets way of screen in allows a other missile to be send
    const moveMissle = () => {
      // Missile speed
      missile.y -= 17;

      if (missile.y < -100) {
        shoot = true;
        app.stage.removeChild(missile);
        missile.destroy();
        app.ticker.remove(moveMissle);
      }

      alienArr.forEach((alien) => {
        if (missile.x === alien.x) {
          shoot = true;
          app.stage.removeChild(missile);
          missile.destroy();
          app.ticker.remove(moveMissle);
          console.log("Hit");
        }
      });
    };

    app.ticker.add(moveMissle);
  }
}

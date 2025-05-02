import { Application, Assets, Text } from "pixi.js";
import { addBackground } from "./addBackground";
import { addPlayer } from "./player";
const app = new Application();

async function setup() {
  await app.init({
    background: `white`,
    resizeTo: window,
  });

  document.body.appendChild(app.canvas);
}

async function load() {
  const assets = [
    {
      alias: "background",
      src: "https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg",
    },
    {
      alias: "playerShip",
      src: "assets/space-ship.png",
    },
    {
      alias: "missle",
      src: "assets/missle.jpg",
    },
    {
      alias: "alien1",
      src: "assets/alien1.png",
    },
  ];

  await Assets.load(assets);
}
(async () => {
  await setup();
  await load();

  addBackground(app);
  addPlayer(app);
})();

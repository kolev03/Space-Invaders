import { Application, Assets, Text } from 'pixi.js';
import { addBackground } from './addBackground';
import Player from './player';
import Alien from './alien';
import AliensContainer from './aliensContainer';
import Missle from './missle';
const app = new Application();

const ROWS = 5;
const COLS = 10;
const SPACING = 75;

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
            alias: 'background',
            src: 'https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg',
        },
        {
            alias: 'playerShip',
            src: 'assets/space-ship.png',
        },
        {
            alias: 'missle',
            src: 'assets/missle.jpg',
        },
        {
            alias: 'alien1',
            src: 'assets/alien1.png',
        },
    ];

    await Assets.load(assets);
}

let isMissleOnScreen = false;
let missle = null;

(async () => {
    await setup();
    await load();

    addBackground(app);

    const player = new Player(app.screen.width / 2, app.screen.height);
    const aliensContainer = new AliensContainer();

    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
            const alien = new Alien(col * SPACING, row * SPACING - 40);
            aliensContainer.addChild(alien);
        }
    }

    app.stage.addChild(aliensContainer);
    app.stage.addChild(player);

    window.addEventListener('keydown', (event) => {
        console.log(event.keyCode);
        if (event.keyCode === 32) {
            // Space key
            if (isMissleOnScreen) return;

            isMissleOnScreen = true;
            missle = new Missle(player.x, player.y);
            app.stage.addChild(missle);
        }
    });

    app.ticker.add(() => {
        if (missle) {
            missle.move();

            if (missle.isOutOfBounds) {
                isMissleOnScreen = false;
                missle.die();
                missle = null;
                return;
            }

            aliensContainer.children.forEach((alien) => {
                if (!missle) return;

                const distance = Math.hypot(missle.x - alien.x, missle.y - alien.y);

                if (distance < alien.width / 2 + missle.width / 2) {
                    isMissleOnScreen = false;
                    missle.die();
                    missle = null;
                    alien.die();
                    return;
                }
            });
        }
    });
})();

import { Sprite, Texture } from 'pixi.js';

const WIDTH = 150;
const HEIGHT = 100;

const PADDING = 80;

class Player extends Sprite {
    constructor(x, y) {
        super(Texture.from('assets/space-ship.png'));
        this.width = WIDTH;
        this.height = HEIGHT;
        this.x = x;
        this.y = y - HEIGHT / 2;

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

    fire() {}
}

export default Player;

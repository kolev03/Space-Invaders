import { Container } from 'pixi.js';

class AliensContainer extends Container {
    constructor() {
        super({ x: 0, y: 0 });
        this.aliens = [];
        this.direction = 1;
    }

    move(direction) {
        this.x += this.direction * 3;
    }
}

export default AliensContainer;

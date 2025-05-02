import { Sprite} from "pixi.js";

export function addBackground(app){
    const background = Sprite.from(`background`)

    background.anchor.set(0.5)

    if(background.width > app.screen.width){
        background.width = app.screen.width * 1.2
        background.scale.y = background.scale.x
    } else {
        background.height = app.screen.height * 1.5
        background.scale.x = background.scale.y
    }

    background.x = app.screen.width / 2;
    background.y = app.screen.height / 2;

    app.stage.addChild(background)
}
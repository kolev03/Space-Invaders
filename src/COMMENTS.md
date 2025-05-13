Не подавай app, ами директно width-a защото не се очаква плейъра да се използва в контекста на app
```
  moveRight(app) {
    if (this.x >= app.screen.width - PADDING) return;

    this.x += this.speed;
  }
```
-----------------------

Използвай един тикер само в main.js

-----------------------

Това е готино дето си направил 

```
  const keys = {};
  window.addEventListener("keydown", (key) => (keys[key.code] = true));
  window.addEventListener("keyup", (key) => (keys[key.code] = false));

  // Player control ticker
  app.ticker.add(() => {
    if (keys["ArrowLeft"]) player.moveLeft(app);
    if (keys["ArrowRight"]) player.moveRight(app);

    if (keys["Space"]) {
      if (isMissleOnScreen) return;
      isMissleOnScreen = true;
      missle = new Missle(player.x, player.y);
      app.stage.addChild(missle);
    }
  });
```

но няма много смисъл от него. Само задълбаваш тикерите като им сложиш if-ове

по-скоро хендълвай всичко в addEventListener()

```
const keyActions = {
    'ArrowLeft': () => {
        player.moveLeft(app)
    }
}

window.addEventListener('keydown', (key) => {
    if (keyActions[key.code]) keyAction[key.code]();
})

```

--------------------------------------

За извънземните дето могат да стрелят, това което си направил е добре, но мисля че по-добър начин ще бъде

```
//Когато ги добавяш в контейнера можеш да направиш следното

  // Add aliens to the container
  for (let col = 0; col < COLS; col++) {
    const container = new Container();
    
    for (let row = 0; row < ROWS; row++) {
      const alien = new Alien(col * SPACING, row * SPACING - 40);
      container.addChild(alien);
    }
    aliensContainer.add(container)
  }

  ```

  Така всъщност си правиш колоните. Сега вместо на всеки тик да търсиш колона, можеш да направиш

  ```
  aliensContainer.children.forEach(col => col.children[col.children.length - 1].fire())

  ```
  Това е примерно нали, но няма да е нужно да филтрираш или добавяш пропъртита. Просто си избираш колона на произволен принцип и караш последното да стреля

  -----------------------------------

  Когато се движи контейнера с извънземните когато умре извънземно от края се променя width и x. Не виждам смисъл да търсиш кое е най-отляво и кое най-отдясно, просто си ползвай x > 0 и x + width < screenWidth

  -------------------------------

  Направи си обект за текста и можеш да му сложиш методи - updateScore, updateHP

  --------------------------------

  Сложи всички числа като константи, за да се знае какви са
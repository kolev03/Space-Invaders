import { startGame } from "./main";

import { gameState } from "./main";

const startPage = document.getElementById("start-menu");
const normalDifficultyButton = document.getElementById(
  "normal-difficulty-button"
);
const hardDifficultyButton = document.getElementById("hard-difficulty-button");
const buttonsContainer = document.querySelector(".buttons");
const instructionButton = document.getElementById("instructions");
const startGameButton = document.getElementById("start-game");
const difficultyContainer = document.querySelector(".difficulty-container");

// Starting the game in normal difficulty
normalDifficultyButton.addEventListener("click", async function () {
  gameState.difficulty = "Normal";
  switchScreen();
  startGame();
  console.log("click");
});

//Starting the game in hard difficulty
hardDifficultyButton.addEventListener("click", async function () {
  gameState.difficulty = "Hard";
  switchScreen();
  startGame();
});

let on = true;
startGameButton.addEventListener("click", async function () {
  on = !on;

  startPage.style.color = on == true ? "white" : "#525252 ";
  difficultyContainer.style.display = on == true ? "none" : "block";
  difficultyContainer.style.color = on == true ? "#525252 " : "white";
  instructionButton.style.fontSize = on == true ? "4rem" : "3rem";
  instructionButton.style.color = on == true ? "white" : "#525252 ";
  startGameButton.style.fontSize = on == true ? "4rem" : "3rem";
  buttonsContainer.style.margin = on == true ? "7rem auto 0" : "3rem auto 0";
});

function switchScreen() {
  document.getElementById("start-menu").style.display = "none";
  document.getElementById("game-container").style.display = "block";
}

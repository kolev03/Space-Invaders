import { startGame } from "./main";
import gsap from "gsap";
import { gameState } from "./main";

const startPage = document.getElementById("start-menu");
const titleText = document.querySelector(".title-text");
const creatorText = document.querySelector(".creator-text");
const normalDifficultyButton = document.getElementById(
  "normal-difficulty-button"
);
const hardDifficultyButton = document.getElementById("hard-difficulty-button");
const buttonsContainer = document.querySelector(".buttons");
const instructionButton = document.getElementById("instructions");
const startGameButton = document.getElementById("start-game");
const difficultyContainer = document.querySelector(".difficulty-container");
const overlay = document.getElementById("transition-overlay");
const goText = document.querySelector(".go-text");
const backToHome = document.getElementById("back-home");
const endScreen = document.getElementById("end-screen");

// Animation when clicking Start Game
let on = true;
startGameButton.addEventListener("click", async function () {
  on = !on;
  applyStartPageStyles();
});

// Starting the game in normal difficulty
normalDifficultyButton.addEventListener("click", async function () {
  gameState.difficulty = "Normal";
  switchScreen();
  startGame();
});

//Starting the game in hard difficulty
hardDifficultyButton.addEventListener("click", async function () {
  gameState.difficulty = "Hard";
  switchScreen();
  startGame();
});

// Clicking Back to Home button
backToHome.addEventListener("click", () => {
  gsap.to(endScreen, {
    duration: 0.35,
    x: "100%",
    onComplete: () => {
      endScreen.style.display = "none";
      document.getElementById("start-menu").style.display = "block";
    },
  });
  on = !on;
  applyStartPageStyles();
});

function applyStartPageStyles() {
  titleText.style.opacity = on ? 1 : 0.3;
  creatorText.style.opacity = on ? 1 : 0.3;
  difficultyContainer.style.display = on ? "none" : "block";
  instructionButton.style.fontSize = on ? "4rem" : "3rem";
  instructionButton.style.color = on ? "white" : "#525252";
  startGameButton.style.fontSize = on ? "4rem" : "3rem";
  buttonsContainer.style.margin = on ? "7rem auto 0" : "3rem auto 0";
}

// Animation for switching between home and game pages
function switchScreen() {
  setTimeout(() => {
    goText.style.display = "block";
  }, 1300);
  const tl = gsap.timeline();
  tl.to(overlay, { duration: 0.5, x: "100%", ease: "power1.in" })
    .to({}, { duration: 1.3 })
    .call(() => {
      document.getElementById("start-menu").style.display = "none";
      document.getElementById("game-container").style.display = "block";
    })
    .to(overlay, {
      duration: 0.5,
      x: "200%",
      ease: "power1.in",
    });
}

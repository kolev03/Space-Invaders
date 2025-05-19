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
const instructionsPanel = document.querySelector(".instructions-container");
const startGameButton = document.getElementById("start-game");
const difficultyContainer = document.querySelector(".difficulty-container");
const overlay = document.getElementById("transition-overlay");
const goText = document.querySelector(".go-text");
const backToHome = document.getElementById("back-home");
const endScreen = document.getElementById("end-screen");
const closeInstructionButton = document.querySelector(".close-instructions");

// Animation when clicking Start Game
let on = true;

//Adding background music
const backgroundMusic = new Audio("audio/startMenuMusic.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;
backgroundMusic.play();

//Adding click souns
const clickSound = new Audio("audio/clickSound.mp3");

instructionButton.addEventListener("click", function () {
  getClickSound();
  instructionsPanel.style.display = "block";
  document.getElementById("start-menu").classList.add("blurred-dark");
});

startGameButton.addEventListener("click", function () {
  on = !on;
  getClickSound();
  applyStartPageStyles();
});

// Starting the game in normal difficulty
normalDifficultyButton.addEventListener("click", async function () {
  getClickSound();
  gameState.difficulty = "Normal";
  switchScreen();
  startGame();
});

//Starting the game in hard difficulty
hardDifficultyButton.addEventListener("click", async function () {
  getClickSound();
  gameState.difficulty = "Hard";
  switchScreen();
  startGame();
});

// Clicking Back to Home button
backToHome.addEventListener("click", () => {
  getClickSound();
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
  backgroundMusic.play();
});

closeInstructionButton.addEventListener("click", function () {
  getClickSound();
  instructionsPanel.style.display = "none";
  document.getElementById("start-menu").classList.remove("blurred-dark");
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
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;

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

function getClickSound() {
  clickSound.pause();
  clickSound.currentTime = 0;
  clickSound.play();
}

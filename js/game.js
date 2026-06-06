import Score from "./score.js";
import Berry from "./berry.js";
import Snake from "./snake.js";
import Pixi from "./pixi.js";
import GameLoop from "./gameloop.js";
import Config from "./config.js";

class Game {
  constructor(pixi) {
    this.pixi = pixi;
    this.config = new Config();
    this.snake = new Snake();
    this.snake.onGameOver = () => this.showMenu();
    this.berry = new Berry(this.pixi);
    this.score = new Score(".score-count", ".best-value", 0, 0);
    this.isRunning = false;

    this.modeClassic = document.getElementById("mode-classic");
    this.modeNoDie = document.getElementById("mode-no-die");
    this.modeWalls = document.getElementById("mode-walls");
    this.modePortal = document.getElementById("mode-portal");
    this.modeSpeed = document.getElementById("mode-speed");
    this.playButton = document.getElementById("play-button");
    this.exitButton = document.getElementById("exit-button");
    this.menuButton = document.getElementById("menu-button");
    this.modePanel = document.getElementById("mode-panel");
    this.menuActions = document.querySelector(".menu-actions");
    this.playActions = document.querySelector(".play-actions");

    if (this.playButton) {
      this.playButton.addEventListener("click", () => this.startGame());
    }

    if (this.exitButton) {
      this.exitButton.addEventListener("click", () => this.showMenu());
    }

    if (this.menuButton) {
      this.menuButton.addEventListener("click", () => this.showMenu());
    }

    this.showMenu();
    new GameLoop(this.update.bind(this), this.draw.bind(this), this.pixi, this.config);
  }

  showMenu() {
    this.isRunning = false;
    this.updateInterface();
  }

  startGame() {
    this.applyModes();
    this.resetGame();
    this.isRunning = true;
    this.updateInterface();
  }

  applyModes() {
    const classic = this.modeClassic?.checked ?? true;
    const noDie = this.modeNoDie?.checked ?? false;
    const walls = this.modeWalls?.checked ?? false;
    const portal = this.modePortal?.checked ?? false;
    const speed = this.modeSpeed?.checked ?? false;

    this.mode = {
      classic,
      noDie,
      walls,
      portal,
      speed,
    };

    if (!classic && !noDie) {
      this.mode.classic = true;
    }

    this.config.maxStep = Config.MAX_STEP;

    if (this.snake) {
      this.snake.setMode(this.mode);
    }
  }

  updateInterface() {
    const menuState = !this.isRunning;
    if (this.modePanel) {
      this.modePanel.classList.toggle("hidden", !menuState);
    }
    if (this.menuActions) {
      this.menuActions.classList.toggle("hidden", !menuState);
    }
    if (this.playActions) {
      this.playActions.classList.toggle("hidden", menuState);
    }
  }

  resetGame() {
    this.score.setToZero();
    if (this.snake) {
      this.snake.death();
    }

    this.berry.clear();
    const occupied = this.getOccupiedCells();
    if (this.mode.portal) {
      this.berry.spawnFood(2, occupied);
    } else {
      this.berry.spawnFood(1, occupied);
    }
  }

  getOccupiedCells() {
    const positions = this.snake.getOccupiedPositions();
    positions.push(...this.berry.walls);
    positions.push(...this.berry.berries);
    return positions;
  }

  update() {
    if (!this.isRunning) return;
    this.snake.update(this.berry, this.score, this.config);
  }

  draw() {
    this.pixi.container.removeChildren();
    if (!this.isRunning) return;
    this.snake.draw(this.pixi);
    this.berry.draw(this.pixi);
  }
}

Pixi.create(document.getElementById("pixi-app")).then(pixi => new Game(pixi));

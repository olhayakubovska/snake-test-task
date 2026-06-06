import Config from "./config.js";
import { getRandomInt } from "./suppFunc.js";

export default class Snake {
  constructor() {
    this.config = new Config();
    this.x = 160;
    this.y = 160;
    this.dx = this.config.sizeCell;
    this.dy = 0;
    this.tails = [];
    this.maxTails = 3;
    this.mode = {
      classic: true,
      noDie: false,
      walls: false,
      portal: false,
      speed: false,
    };

    this.onGameOver = null;
    this.control();
  }

  setMode(mode) {
    const base = mode.noDie ? "god" : "classic";
    this.mode = {
      base,
      walls: !!mode.walls,
      portal: !!mode.portal,
      speed: !!mode.speed,
    };
  }

  isGodMode() {
    return this.mode.base === "god";
  }

  update(berry, score, gameConfig) {
    this.x += this.dx;
    this.y += this.dy;

    const width = this.config.fieldWidth * this.config.sizeCell;
    const height = this.config.fieldHeight * this.config.sizeCell;

    if (this.isGodMode()) {
      if (this.x < 0) {
        this.x = width - this.config.sizeCell;
      } else if (this.x >= width) {
        this.x = 0;
      }

      if (this.y < 0) {
        this.y = height - this.config.sizeCell;
      } else if (this.y >= height) {
        this.y = 0;
      }
    } else if (this.x < 0 || this.x >= width || this.y < 0 || this.y >= height) {
      this.death();
      score.setToZero();
      this.resetAfterDeath(berry);
      return;
    }

    const berryIndex = berry.getFoodIndexAt(this.x, this.y);

    if (berryIndex !== -1) {
      this.maxTails++;
      score.incScore();
      const occupiedPositions = [...this.getOccupiedPositions(), ...berry.walls];

      if (this.mode.portal && berry.berries.length === 2) {
        const otherIndex = berryIndex === 0 ? 1 : 0;
        const teleportTarget = berry.berries[otherIndex];
        berry.clear();
        this.x = teleportTarget.x;
        this.y = teleportTarget.y;
        berry.spawnFood(2, [...this.getOccupiedPositions(), ...berry.walls]);
      } else {
        berry.removeFoodAt(berryIndex);
        berry.spawnFood(1, occupiedPositions);
      }

      if (this.mode.walls) {
        berry.spawnWall([...occupiedPositions, ...berry.berries]);
      }

      if (this.mode.speed && gameConfig) {
        gameConfig.maxStep = Math.max(1, Math.round(gameConfig.maxStep * 0.9));
      }
    }

    this.tails.unshift({ x: this.x, y: this.y });

    if (this.tails.length > this.maxTails) {
      this.tails.pop();
    }

    if (this.checkWallCollision(berry, score)) {
      return;
    }

    if (this.checkSelfCollision(score, berry)) {
      return;
    }
  }

  resetAfterDeath(berry) {
    berry.berries = [];
    const occupied = [...this.getOccupiedPositions(), ...berry.walls];
    if (this.mode.portal) {
      berry.spawnFood(2, occupied);
    } else {
      berry.spawnFood(1, occupied);
    }
  }

  getOccupiedPositions() {
    const positions = [{ x: this.x, y: this.y }];
    this.tails.forEach((segment) => positions.push({ x: segment.x, y: segment.y }));
    return positions;
  }

  checkWallCollision(berry, score) {
    if (this.isGodMode()) {
      return false;
    }

    for (const wall of berry.walls) {
      if (this.tails[0].x === wall.x && this.tails[0].y === wall.y) {
        this.death();
        score.setToZero();
        this.resetAfterDeath(berry);
        if (this.onGameOver) this.onGameOver();
        return true;
      }
    }

    return false;
  }

  checkSelfCollision(score, berry) {
    if (this.isGodMode()) {
      return false;
    }

    for (let i = 1; i < this.tails.length; i++) {
      if (this.tails[0].x === this.tails[i].x && this.tails[0].y === this.tails[i].y) {
        this.death();
        score.setToZero();
        this.resetAfterDeath(berry);
        return true;
      }
    }

    return false;
  }

  draw(pixi) {
    this.tails.forEach((el, index) => {
      const color = index === 0 ? "#faee05" : "#ffffff";
      const snakeElement = new PIXI.Graphics();
      snakeElement.rect(el.x, el.y, this.config.sizeCell, this.config.sizeCell).fill(color);
      pixi.container.addChild(snakeElement);
    });
  }

  death() {
    this.x = 160;
    this.y = 160;
    this.dx = this.config.sizeCell;
    this.dy = 0;
    this.tails = [];
    this.maxTails = 3;
  }

  control() {
    document.addEventListener("keydown", (e) => {
      if ((e.code == "KeyW" || e.code == "ArrowUp") && this.dy === 0) {
        this.dy = -this.config.sizeCell;
        this.dx = 0;
      } else if ((e.code == "KeyA" || e.code == "ArrowLeft") && this.dx === 0) {
        this.dx = -this.config.sizeCell;
        this.dy = 0;
      } else if ((e.code == "KeyS" || e.code == "ArrowDown") && this.dy === 0) {
        this.dy = this.config.sizeCell;
        this.dx = 0;
      } else if ((e.code == "KeyD" || e.code == "ArrowRight") && this.dx === 0) {
        this.dx = this.config.sizeCell;
        this.dy = 0;
      }
    });
  }
}

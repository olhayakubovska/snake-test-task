import Config from "./config.js";
import { getRandomInt } from "./suppFunc.js";

export default class Berry {
  constructor(pixi) {
    this.pixi = pixi;
    this.config = new Config();
    this.berries = [];
    this.walls = [];
  }

  clear() {
    this.berries = [];
    this.walls = [];
  }

  randomPosition(occupiedPositions = []) {
    const position = this.getFreePosition(occupiedPositions);
    this.berries = position ? [position] : [];
  }

  spawnFood(count = 1, occupiedPositions = []) {
    const occupied = this.positionsToSet(occupiedPositions);
    const foods = [];

    for (let i = 0; i < count; i += 1) {
      const position = this.getFreePosition(occupied);
      if (!position) {
        break;
      }
      foods.push(position);
      occupied.add(`${position.x},${position.y}`);
    }

    this.berries.push(...foods);
  }

  spawnWall(occupiedPositions = []) {
    const occupied = this.positionsToSet(occupiedPositions);
    const position = this.getFreePosition(occupied);
    if (position) {
      this.walls.push(position);
    }
  }

  getFreePosition(occupiedSet) {
    const occupied = occupiedSet instanceof Set ? occupiedSet : this.positionsToSet(occupiedSet);
    const totalCells = this.config.fieldWidth * this.config.fieldHeight;

    if (occupied.size >= totalCells) {
      return null;
    }

    let x;
    let y;
    let key;
    let attempts = 0;

    do {
      x = getRandomInt(0, this.config.fieldWidth) * this.config.sizeCell;
      y = getRandomInt(0, this.config.fieldHeight) * this.config.sizeCell;
      key = `${x},${y}`;
      attempts += 1;
    } while (occupied.has(key) && attempts < 1000);

    if (!occupied.has(key)) {
      return { x, y };
    }

    for (let ix = 0; ix < this.config.fieldWidth; ix += 1) {
      for (let iy = 0; iy < this.config.fieldHeight; iy += 1) {
        const tryKey = `${ix * this.config.sizeCell},${iy * this.config.sizeCell}`;
        if (!occupied.has(tryKey)) {
          return { x: ix * this.config.sizeCell, y: iy * this.config.sizeCell };
        }
      }
    }

    return null;
  }

  positionsToSet(positions) {
    const set = new Set();
    positions.forEach((position) => {
      if (position && typeof position.x === "number" && typeof position.y === "number") {
        set.add(`${position.x},${position.y}`);
      }
    });
    return set;
  }

  getFoodIndexAt(x, y) {
    return this.berries.findIndex((berry) => berry.x === x && berry.y === y);
  }

  removeFoodAt(index) {
    if (index >= 0) {
      this.berries.splice(index, 1);
    }
  }

  draw(pixi) {
    this.berries.forEach((berry) => {
      const berryDraw = new PIXI.Graphics();
      berryDraw.rect(berry.x, berry.y, this.config.sizeCell, this.config.sizeCell).fill("#124909");
      this.pixi.container.addChild(berryDraw);
    });

    this.walls.forEach((wall) => {
      const wallDraw = new PIXI.Graphics();
      wallDraw.rect(wall.x, wall.y, this.config.sizeCell, this.config.sizeCell).fill("#808080");
      this.pixi.container.addChild(wallDraw);
    });
  }
}

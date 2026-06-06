import Config from "./config.js";

export default class Snake {
  constructor() {
    this.config = new Config();
    this.x = 160;
    this.y = 160;
    this.dx = this.config.sizeCell;
    this.dy = 0;
    this.tails = [];
    this.maxTails = 3;
    this.mode = { base: "classic", walls: false, portal: false, speed: false };

    this.prevTails = [];
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
    this.prevTails = this.tails.map(t => ({ x: t.x, y: t.y }));
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

    if (this.checkWallCollision(berry, score)) {
      return;
    }

    const berryIndex = berry.getFoodIndexAt(this.x, this.y);

    if (berryIndex !== -1) {
      if (this.mode.portal) {
        const other = berry.berries[berryIndex === 0 ? 1 : 0];
        berry.berries = [];
        this.maxTails++;
        score.incScore();
        if (other) {
          this.x = other.x;
          this.y = other.y;
        }
        berry.spawnFood(2, [...this.getOccupiedPositions(), ...berry.walls]);
      } else {
        const occupiedPositions = [...this.getOccupiedPositions(), ...berry.walls];
        this.maxTails++;
        score.incScore();
        berry.removeFoodAt(berryIndex);
        berry.spawnFood(1, occupiedPositions);

        if (this.mode.walls) {
          berry.spawnWall([...occupiedPositions, ...berry.berries]);
        }

        if (this.mode.speed && gameConfig) {
          gameConfig.maxStep = Math.max(1, Math.round(gameConfig.maxStep * 0.9));
        }
      }
    }

    this.tails.unshift({ x: this.x, y: this.y });

    if (this.tails.length > this.maxTails) {
      this.tails.pop();
    }

    if (this.checkSelfCollision(score, berry)) {
      return;
    }
  }

  resetAfterDeath(berry) {
    berry.berries = [];
    const occupied = [...this.getOccupiedPositions(), ...berry.walls];
    berry.spawnFood(this.mode.portal ? 2 : 1, occupied);
  }

  getOccupiedPositions() {
    const positions = [{ x: this.x, y: this.y }];
    this.tails.forEach((segment) => positions.push({ x: segment.x, y: segment.y }));
    return positions;
  }

  checkWallCollision(berry, score) {
    if (this.isGodMode()) return false;

    for (const wall of berry.walls) {
      if (this.x === wall.x && this.y === wall.y) {
        this.death();
        score.setToZero();
        berry.walls = [];
        this.resetAfterDeath(berry);
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

  draw(pixi, progress = 1) {
    const g = pixi.graphics;
    const s = this.config.sizeCell;
    const W = this.config.fieldWidth * s;
    const H = this.config.fieldHeight * s;

    if (!this.tails.length) return;

    for (let i = 0; i < this.tails.length - 1; i++) {
      const prev_i = this.prevTails[i];
      const prev_i1 = this.prevTails[i + 1];
      if (!prev_i || !prev_i1) continue;

      const dxi = this.tails[i].x - prev_i.x;
      const dyi = this.tails[i].y - prev_i.y;
      const dxi1 = this.tails[i + 1].x - prev_i1.x;
      const dyi1 = this.tails[i + 1].y - prev_i1.y;

      if (Math.abs(dxi) > s || Math.abs(dyi) > s || Math.abs(dxi1) > s || Math.abs(dyi1) > s) continue;

      if ((dxi !== 0 && dyi1 !== 0) || (dyi !== 0 && dxi1 !== 0)) {
        g.rect(prev_i.x, prev_i.y, s, s).fill(0xffffff);
      }
    }

    this.tails.forEach((el, index) => {
      const color = index === 0 ? 0xfaee05 : 0xffffff;
      const prev = this.prevTails[index];

      if (!prev) {
        g.rect(el.x, el.y, s, s).fill(color);
        return;
      }

      const dx = el.x - prev.x;
      const dy = el.y - prev.y;

      if (Math.abs(dx) > s || Math.abs(dy) > s) {
        if (this.isGodMode()) {
          if (Math.abs(dx) > s) {
            if (dx < 0) {
              const vx = prev.x + s * progress;
              const exitW = Math.max(0, W - vx);
              if (exitW > 0) g.rect(vx, el.y, exitW, s).fill(color);
              const entryW = Math.max(0, vx + s - W);
              if (entryW > 0) g.rect(0, el.y, entryW, s).fill(color);
            } else {
              const vx = prev.x - s * progress;
              const exitW = Math.max(0, Math.min(vx + s, s));
              if (exitW > 0) g.rect(Math.max(0, vx), el.y, exitW, s).fill(color);
              const entryW = Math.max(0, -vx);
              if (entryW > 0) g.rect(W - entryW, el.y, entryW, s).fill(color);
            }
          } else {
            if (dy < 0) {
              const vy = prev.y + s * progress;
              const exitH = Math.max(0, H - vy);
              if (exitH > 0) g.rect(el.x, vy, s, exitH).fill(color);
              const entryH = Math.max(0, vy + s - H);
              if (entryH > 0) g.rect(el.x, 0, s, entryH).fill(color);
            } else {
              const vy = prev.y - s * progress;
              const exitH = Math.max(0, Math.min(vy + s, s));
              if (exitH > 0) g.rect(el.x, Math.max(0, vy), s, exitH).fill(color);
              const entryH = Math.max(0, -vy);
              if (entryH > 0) g.rect(el.x, H - entryH, s, entryH).fill(color);
            }
          }
        } else {
          g.rect(el.x, el.y, s, s).fill(color);
        }
      } else {
        g.rect(prev.x + dx * progress, prev.y + dy * progress, s, s).fill(color);
      }
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
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
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

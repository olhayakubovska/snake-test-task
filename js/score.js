export default class Score {
  constructor(scoreBlock, bestBlock, score = 0, best = 0) {
    this.scoreBlock = document.querySelector(scoreBlock);
    this.bestBlock = document.querySelector(bestBlock);
    this.score = score;
    this.best = best;

    this.draw();
  }

  incScore() {
    this.score++;
    this.draw();
  }

  setToZero() {
    if (this.score > this.best) {
      this.best = this.score;
    }
    this.score = 0;
    this.draw();
  }

  draw() {
    if (this.scoreBlock) {
      this.scoreBlock.innerHTML = this.score;
    }
    if (this.bestBlock) {
      this.bestBlock.innerHTML = this.best;
    }
  }
}

import Config from "./config.js";

export default class GameLoop {
  constructor(update, draw, pixi, config = new Config()) {
    this.update = update;
    this.draw = draw;
    this.pixi = pixi;
    this.config = config;
    this.animate = this.animate.bind(this);
    this.animate();
  }

  animate() {
    this.pixi.app.ticker.add((delta) => {
      this.config.step += 1;
      if (this.config.step < this.config.maxStep) {
        return;
      }
      this.config.step = 0;

      this.update();
      this.draw();
    });
  }
}

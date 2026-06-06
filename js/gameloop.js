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
    this.pixi.app.ticker.add(() => {
      this.config.step += 1;
      const progress = this.config.step / this.config.maxStep;
      this.draw(progress);
      if (this.config.step >= this.config.maxStep) {
        this.config.step = 0;
        this.update();
      }
    });
  }
}

import Config from "./config.js";

export default class GameInstance {
  constructor() {
    this.instanceConfig;
  }

  createInstanceConfig() {
    const object = new Config();
    return object;
  }

  getInstanceConfig() {
    if (!this.instanceConfig) {
      this.instanceConfig = this.createInstanceConfig();
    }
    return this.instanceConfig;
  }
}

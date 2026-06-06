export default class Config {
  static MAX_STEP = 12;
  static CELL_SIZE = 16;
  static FIELD_WIDTH = 20;
  static FIELD_HEIGHT = 20;

  constructor() {
    this.step = 0;
    this.maxStep = this.MAX_STEP;
    this.sizeCell = 16;
    this.sizeBerry = 16 / 4;
    this.fieldWidth = Config.FIELD_WIDTH;
    this.fieldHeight = Config.FIELD_HEIGHT;
    this.speedMultiplier = 1;
  }
}

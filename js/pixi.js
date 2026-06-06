export default class Pixi {
  static async create(pixiConteiner) {
    const instance = new Pixi();
    instance.app = new PIXI.Application();
    await instance.app.init({
      width: 320,
      height: 320,
      background: 0x5f5f5f,
      antialias: false
    });

    instance.app.canvas.style.imageRendering = 'pixelated';
    pixiConteiner.appendChild(instance.app.canvas);

    instance.container = new PIXI.Container();
    instance.app.stage.addChild(instance.container);

    instance.graphics = new PIXI.Graphics();
    instance.container.addChild(instance.graphics);

    return instance;
  }
}

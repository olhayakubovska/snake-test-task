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

    const resize = () => {
      const w = pixiConteiner.clientWidth;
      const h = pixiConteiner.clientHeight;
      const size = Math.min(w, h);
      instance.app.canvas.style.width = size + 'px';
      instance.app.canvas.style.height = size + 'px';
    };

    window.addEventListener('resize', resize);
    resize();

    return instance;
  }
}

/**
 * Game Engine — fixed timestep game loop
 */

export class Engine {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.fixedDt = 1 / 60;
    this.maxAccumulator = 0.25;
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
    this._rafId = null;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this._loop();
  }

  stop() {
    this.running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _loop() {
    if (!this.running) return;

    const now = performance.now() / 1000;
    let frameTime = now - this.lastTime;
    this.lastTime = now;

    if (frameTime > this.maxAccumulator) {
      frameTime = this.maxAccumulator;
    }

    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedDt) {
      this.updateFn(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    const alpha = this.accumulator / this.fixedDt;
    this.renderFn(alpha);

    this._rafId = requestAnimationFrame(() => this._loop());
  }
}

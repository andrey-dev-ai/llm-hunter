/**
 * Mouse input tracking
 */

export class Input {
  constructor(canvas) {
    this.mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    this.clicked = false;
    this.keyPressed = null;

    window.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '3') {
        this.keyPressed = parseInt(e.key);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('click', () => {
      this.clicked = true;
    });

    // Touch support (basic)
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.mouse.x = touch.clientX - rect.left;
      this.mouse.y = touch.clientY - rect.top;
    }, { passive: false });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.clicked = true;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.mouse.x = touch.clientX - rect.left;
      this.mouse.y = touch.clientY - rect.top;
    }, { passive: false });
  }

  consumeClick() {
    if (this.clicked) {
      this.clicked = false;
      return true;
    }
    return false;
  }

  consumeKey() {
    const k = this.keyPressed;
    this.keyPressed = null;
    return k;
  }
}

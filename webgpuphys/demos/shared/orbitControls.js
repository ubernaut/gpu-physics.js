// Minimal orbit-style camera (no deps)
class OrbitCamera {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.target = opts.target || [0, 0.5, 0];
    this.radius = opts.radius || 14;
    this.minRadius = opts.minRadius || 2;
    this.maxRadius = opts.maxRadius || 60;
    this.theta = opts.theta || 0; // yaw
    this.phi = opts.phi || Math.PI / 4; // pitch
    this.rotateSpeed = opts.rotateSpeed || 0.005;
    this.zoomSpeed = opts.zoomSpeed || 0.0015;

    this._dragging = false;
    this._last = [0, 0];

    this._initEvents();
  }

  _initEvents() {
    this.canvas.addEventListener("pointerdown", (e) => {
      this._dragging = true;
      this._last = [e.clientX, e.clientY];
      this.canvas.setPointerCapture(e.pointerId);
    });
    this.canvas.addEventListener("pointerup", (e) => {
      this._dragging = false;
      this.canvas.releasePointerCapture(e.pointerId);
    });
    this.canvas.addEventListener("pointermove", (e) => {
      if (!this._dragging) return;
      const dx = e.clientX - this._last[0];
      const dy = e.clientY - this._last[1];
      this._last = [e.clientX, e.clientY];
      this.theta -= dx * this.rotateSpeed;
      this.phi -= dy * this.rotateSpeed;
      const eps = 0.001;
      this.phi = Math.max(eps, Math.min(Math.PI - eps, this.phi));
    });
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = Math.exp(e.deltaY * this.zoomSpeed);
      this.radius = Math.min(this.maxRadius, Math.max(this.minRadius, this.radius * factor));
    }, { passive: false });
  }

  getViewProj(aspect) {
    const fov = Math.PI / 4;
    const near = 0.1;
    const far = 200;
    const f = 1 / Math.tan(fov / 2);
    const proj = new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, far / (near - far), -1,
      0, 0, far * near / (near - far), 0,
    ]);

    const cx = Math.sin(this.phi) * Math.sin(this.theta) * this.radius + this.target[0];
    const cy = Math.cos(this.phi) * this.radius + this.target[1];
    const cz = Math.sin(this.phi) * Math.cos(this.theta) * this.radius + this.target[2];
    const eye = [cx, cy, cz];
    const view = this.lookAt(eye, this.target, [0, 1, 0]);
    // Note: multiplyMat4ColumnMajor(a, b) computes b * a.
    // We want proj * view, so we pass (view, proj).
    return this.multiplyMat4ColumnMajor(view, proj);
  }

  lookAt(eye, target, up) {
    const z = this.normalize([
      eye[0] - target[0],
      eye[1] - target[1],
      eye[2] - target[2],
    ]);
    const x = this.normalize(this.cross(up, z));
    const y = this.cross(z, x);
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -this.dot(x, eye), -this.dot(y, eye), -this.dot(z, eye), 1,
    ]);
  }

  normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
  }
  cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  }
  dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  multiplyMat4ColumnMajor(a, b) {
    const out = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        out[i + j * 4] =
          a[0 + j * 4] * b[i + 0 * 4] +
          a[1 + j * 4] * b[i + 1 * 4] +
          a[2 + j * 4] * b[i + 2 * 4] +
          a[3 + j * 4] * b[i + 3 * 4];
      }
    }
    return out;
  }
}

export { OrbitCamera };

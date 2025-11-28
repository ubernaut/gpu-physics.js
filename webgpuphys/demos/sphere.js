import { World, Vec3 } from "../src/index.js";
import { calculateBoxInertia } from "../src/math.js";
import { BoxRenderer } from "./shared/boxRenderer.js";
import { ParticleRenderer } from "./shared/particleRenderer.js";
import { GridRenderer } from "./shared/gridRenderer.js";
import { OrbitCamera } from "./shared/orbitControls.js";

async function main() {
  const canvas = document.getElementById("canvas");
  const errorEl = document.getElementById("error");
  const bodyCountEl = document.getElementById("bodyCount");
  const fpsEl = document.getElementById("fps");

  const world = new World({
    maxBodies: 1024,
    maxParticles: 16384,
    radius: 0.08,
    stiffness: 140,
    damping: 0.6,
    friction: 0.35,
    drag: 0.25,
    fixedTimeStep: 1 / 90,
    gravity: new Vec3(0, -2, 0),
    boxSize: new Vec3(15, 15, 15),
    gridPosition: new Vec3(-15, 0, -15),
    gridResolution: new Vec3(96, 48, 96),
    maxSubSteps: 8,
  });
  await world.ready();

  const boxRenderer = new BoxRenderer(world.getDevice(), canvas);
  const particleRenderer = new ParticleRenderer(world.getDevice());
  const gridRenderer = new GridRenderer(world.getDevice(), boxRenderer.format, { size: 30, height: 0 });
  const orbit = new OrbitCamera(canvas, { radius: 16, target: [0, 0.5, 0] });

  const params = {
    sphereRadius: 1.5,
    stiffness: world.stiffness,
    damping: world.damping,
    friction: world.friction,
    drag: world.drag,
    gravityY: -2,
    showParticles: true,
    paused: false,
  };

  // Build a pile of small boxes (denser particles)
  const N = 3;
  const radius = world.radius;
  const spacing = radius * 2.02;
  const boxExt = new Vec3(radius * N * 0.9, radius * N * 0.9, radius * N * 0.9);
  const inertia = calculateBoxInertia(1, boxExt);
  const tmpRot = [0, 0, 0, 1];
  function addBox(x, y, z) {
    const bodyId = world.addBody(x, y, z, tmpRot[0], tmpRot[1], tmpRot[2], tmpRot[3], 1, inertia.x, inertia.y, inertia.z);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          if (i === 0 || i === N - 1 || j === 0 || j === N - 1 || k === 0 || k === N - 1) {
            const lx = (i - (N - 1) * 0.5) * spacing;
            const ly = (j - (N - 1) * 0.5) * spacing;
            const lz = (k - (N - 1) * 0.5) * spacing;
            world.addParticle(bodyId, lx, ly, lz);
          }
        }
      }
    }
  }

  for (let i = 0; i < 80; i++) {
    const x = (Math.random() - 0.5) * 6;
    const y = 1 + i * 0.03;
    const z = (Math.random() - 0.5) * 6;
    addBox(x, y, z);
  }

  world.setSphereRadius(0, params.sphereRadius);
  world.setSpherePosition(0, 0, 1.2, 0);
  world.step(world.fixedTimeStep || 1 / 60);

  const gui = new window.lil.GUI({ title: "Sphere Interaction" });
  gui.add(params, "sphereRadius", 0.2, 3, 0.05).onChange((v) => world.setSphereRadius(0, v));
  gui.add(params, "stiffness", 50, 4000, 10).onChange((v) => (world.stiffness = v));
  gui.add(params, "damping", 0, 10, 0.05).onChange((v) => (world.damping = v));
  gui.add(params, "friction", 0, 3, 0.05).onChange((v) => (world.friction = v));
  gui.add(params, "drag", 0, 1, 0.02).onChange((v) => (world.drag = v));
  gui.add(params, "gravityY", -10, 10, 0.1).onChange((v) => (world.gravity = new Vec3(0, v, 0)));
  gui.add(params, "showParticles");
  gui.add(params, "paused");

  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTime = 0;

  function frame() {
    const now = performance.now();
    const dt = (now - lastTime) * 0.001;
    lastTime = now;
    frameCount++;
    fpsTime += dt;
    if (fpsTime >= 1) {
      fpsEl.textContent = Math.round(frameCount / fpsTime).toString();
      frameCount = 0;
      fpsTime = 0;
    }

    const t = now * 0.001;
    const sx = Math.sin(t * 0.6) * 2.5;
    const sz = Math.cos(t * 0.45) * 2.5;
    const sy = 1.2 + Math.sin(t * 0.9) * 0.8;
    world.setSpherePosition(0, sx, sy, sz);

    if (!params.paused) {
      world.step(dt);
    }

    const viewProj = orbit.getViewProj(canvas.width / canvas.height);
    boxRenderer.updateBindGroup(world.getBodyPositionBuffer(), world.getBodyQuaternionBuffer());
    particleRenderer.updateBindGroup(world.getParticleWorldPositionBuffer());
    particleRenderer.updateViewProj(viewProj, world.radius);

    boxRenderer.render(world.bodyCount, {
      viewProj,
      drawExtras: (pass) => {
        gridRenderer.update(viewProj, { gridSize: 0.5, lineWidth: 0.04, height: 0 });
        gridRenderer.record(pass);
        if (params.showParticles) {
          particleRenderer.record(pass, world.particleCount);
        }
      },
    });

    bodyCountEl.textContent = world.bodyCount.toString();
    requestAnimationFrame(frame);
  }

  frame();
}

main().catch((err) => {
  const errorEl = document.getElementById("error");
  errorEl.textContent = `Error: ${err.message || err}`;
  console.error(err);
});

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

  const params = {
    stiffness: 1700,
    damping: 6,
    friction: 2,
    drag: 0.3,
    gravityY: -2,
    fixedTimeStep: 1 / 120,
    radius: 0.05,
    sphereRadius: 0.8,
    showParticles: true,
    paused: false,
    boxesToAdd: 12,
  };

  const world = new World({
    maxBodies: 2048,
    maxParticles: 32768,
    radius: params.radius,
    stiffness: params.stiffness,
    damping: params.damping,
    friction: params.friction,
    drag: params.drag,
    fixedTimeStep: params.fixedTimeStep,
    gravity: new Vec3(0, params.gravityY, 0),
    boxSize: new Vec3(20, 20, 20),
    gridPosition: new Vec3(-20, 0, -20),
    gridResolution: new Vec3(128, 64, 128),
    maxSubSteps: 8,
  });
  await world.ready();

  const boxRenderer = new BoxRenderer(world.getDevice(), canvas);
  const particleRenderer = new ParticleRenderer(world.getDevice());
  const gridRenderer = new GridRenderer(world.getDevice(), boxRenderer.format, { size: 40, height: 0 });
  const orbit = new OrbitCamera(canvas, { radius: 18, target: [0, 0.5, 0] });

  // --- creation helpers ---
  const N = 3; // particle density per axis (higher = more particles per box)
  const boxExtent = params.radius * N * 0.8;
  const inertia = calculateBoxInertia(1, new Vec3(boxExtent, boxExtent, boxExtent));
  const tmpRot = [0, 0, 0, 1];

  function addBox(x, y, z) {
    const bodyId = world.addBody(x, y, z, tmpRot[0], tmpRot[1], tmpRot[2], tmpRot[3], 1, inertia.x, inertia.y, inertia.z);
    const spacing = params.radius * 2.01;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          // shell only to keep counts reasonable
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

  function seedScene(count) {
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 6;
      const y = 1 + i * params.radius * 1.5;
      const z = (Math.random() - 0.5) * 6;
      addBox(x, y, z);
    }
    bodyCountEl.textContent = world.bodyCount.toString();
  }

  seedScene(24);
  world.setSphereRadius(0, params.sphereRadius);
  world.setSpherePosition(0, 0, 1.2, 0);
  // Prime GPU buffers so the first frame has data
  world.step(world.fixedTimeStep || 1 / 60);

  // --- GUI ---
  const gui = new window.lil.GUI({ title: "Physics" });
  gui.add(params, "stiffness", 100, 5000, 10).onChange((v) => (world.stiffness = v));
  gui.add(params, "damping", 0, 20, 0.1).onChange((v) => (world.damping = v));
  gui.add(params, "friction", 0, 5, 0.1).onChange((v) => (world.friction = v));
  gui.add(params, "drag", 0, 2, 0.05).onChange((v) => (world.drag = v));
  gui.add(params, "fixedTimeStep", 1 / 240, 1 / 30, 0.0005).onChange((v) => (world.fixedTimeStep = v));
  gui.add(params, "gravityY", -10, 10, 0.1).onChange((v) => (world.gravity = new Vec3(0, v, 0)));
  gui.add(params, "sphereRadius", 0.1, 3, 0.05).onChange((v) => world.setSphereRadius(0, v));
  gui.add(params, "showParticles").name("render particles");
  gui.add(params, "paused");
  gui.add(params, "boxesToAdd", 1, 200, 1).name("add count");
  gui.add({ add: () => seedScene(params.boxesToAdd) }, "add").name("add boxes");

  // --- Render loop ---
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

    if (!params.paused) {
      world.step(dt);
    }

    const viewProj = orbit.getViewProj(canvas.width / canvas.height);
    boxRenderer.updateBindGroup(world.getBodyPositionBuffer(), world.getBodyQuaternionBuffer());
    particleRenderer.updateBindGroup(world.getParticleWorldPositionBuffer());
    particleRenderer.updateViewProj(viewProj, world.radius);
    gridRenderer.update(viewProj, { gridSize: 0.5, lineWidth: 0.04, height: 0 });

    boxRenderer.render(world.bodyCount, {
      viewProj,
      drawExtras: (pass) => {
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

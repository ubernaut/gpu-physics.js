import { World, Vec3 } from "../src/index.js";
import { calculateBoxInertia } from "../src/math.js";
import { BoxRenderer } from "./shared/boxRenderer.js";
import { ParticleRenderer } from "./shared/particleRenderer.js";
import { GridRenderer } from "./shared/gridRenderer.js";
import { OrbitCamera } from "./shared/orbitControls.js";

async function main() {
  const canvas = document.getElementById("canvas");
  const errorEl = document.getElementById("error");

  const world = new World({
    maxBodies: 32,
    maxParticles: 512,
    radius: 0.08,
    stiffness: 500,
    damping: 0.5,
    friction: 0.4,
    drag: 0.2,
    fixedTimeStep: 1 / 60,
    gravity: new Vec3(0, -1.5, 0),
    boxSize: new Vec3(10, 10, 10),
    gridPosition: new Vec3(-10, 0, -10),
    gridResolution: new Vec3(64, 32, 64),
  });
  await world.ready();

  const boxRenderer = new BoxRenderer(world.getDevice(), canvas);
  const particleRenderer = new ParticleRenderer(world.getDevice());
  const gridRenderer = new GridRenderer(world.getDevice(), boxRenderer.format, { size: 20, height: 0 });
  const orbit = new OrbitCamera(canvas, { radius: 12, target: [0, 0.5, 0] });

  const N = 3;
  const spacing = world.radius * 2.05;
  const inertia = calculateBoxInertia(1, new Vec3(world.radius * N, world.radius * N, world.radius * N));
  const bodyId = world.addBody(0, 1.5, 0, 0, 0, 0, 1, 1, inertia.x, inertia.y, inertia.z);
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

  const params = {
    showParticles: true,
    paused: false,
  };

  const gui = new window.lil.GUI({ title: "Single Box" });
  gui.add(params, "showParticles");
  gui.add(params, "paused");

  // Prime GPU buffers
  world.step(world.fixedTimeStep || 1 / 60);

  function frame() {
    if (!params.paused) {
      world.step(1 / 60);
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
        if (params.showParticles) particleRenderer.record(pass, world.particleCount);
      },
    });

    requestAnimationFrame(frame);
  }

  frame();
}

main().catch((err) => {
  const errorEl = document.getElementById("error");
  errorEl.textContent = `Error: ${err.message || err}`;
  console.error(err);
});

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
    maxBodies: 2048,
    maxParticles: 32768,
    radius: 0.05,
    stiffness: 1200,
    damping: 4,
    friction: 0.9,
    drag: 0.2,
    fixedTimeStep: 1 / 120,
    gravity: new Vec3(0, -3, 0),
    boxSize: new Vec3(8, 8, 8),
    gridPosition: new Vec3(-8, 0, -8),
    gridResolution: new Vec3(96, 48, 96),
  });
  await world.ready();

  const boxRenderer = new BoxRenderer(world.getDevice(), canvas);
  const particleRenderer = new ParticleRenderer(world.getDevice());
  const gridRenderer = new GridRenderer(world.getDevice(), boxRenderer.format, { size: 20, height: 0 });
  const orbit = new OrbitCamera(canvas, { radius: 14, target: [0, 0.5, 0] });

  const params = {
    showParticles: true,
    paused: false,
    batch: 40,
  };

  const N = 3;
  const spacing = world.radius * 2.01;
  const inertia = calculateBoxInertia(1, new Vec3(world.radius * N, world.radius * N, world.radius * N));
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

  function seed(count) {
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 4;
      const y = 0.5 + i * 0.05;
      const z = (Math.random() - 0.5) * 4;
      addBox(x, y, z);
    }
  }

  seed(200);

  const gui = new window.lil.GUI({ title: "Container" });
  gui.add(params, "showParticles");
  gui.add(params, "paused");
  gui.add(params, "batch", 10, 200, 1).name("add count");
  gui.add({ add: () => seed(params.batch) }, "add").name("add more");

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
        gridRenderer.update(viewProj, { gridSize: 0.4, lineWidth: 0.03, height: 0 });
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

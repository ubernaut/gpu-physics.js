/// <reference types="@webgpu/types" />
/**
 * Container fill demo: spawn many small boxes inside a tighter container volume.
 */
import { World, Vec3 } from '../src';
import { calculateBoxInertia } from '../src/math';
import { BoxRenderer } from './shared/boxRenderer';

async function main() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const errorDiv = document.getElementById('error')!;
  const bodyCountSpan = document.getElementById('bodyCount')!;
  const fpsSpan = document.getElementById('fps')!;

  try {
    const radius = 0.08;
    const gridRes = new Vec3(80, 80, 80);

    const world = new World({
      maxBodies: 256,
      maxParticles: 4096,
      radius,
      stiffness: 160,
      damping: 0.6,
      gravity: new Vec3(0, -2.5, 0),
      friction: 0.5,
      drag: 0.18,
      fixedTimeStep: 1 / 60,
      boxSize: new Vec3(4, 6, 4),
      gridPosition: new Vec3(-4, 0, -4),
      gridResolution: gridRes,
      maxSubSteps: 8
    });

    await world.ready();

    const renderer = new BoxRenderer(world.getDevice(), canvas);

    // Fill container with many small boxes
    const count = 120;
    const boxExt = new Vec3(radius * 1.2, radius * 1.2, radius * 1.2);
    const inertia = calculateBoxInertia(0.5, boxExt);
    const spread = 3.5;

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread;
      const y = 0.5 + Math.random() * 3.0;
      const z = (Math.random() - 0.5) * spread;
      const bodyId = world.addBody(x, y, z, 0, 0, 0, 1, 0.5, inertia.x, inertia.y, inertia.z);
      const s = radius * 1.1;
      world.addParticle(bodyId, -s, -s, -s);
      world.addParticle(bodyId,  s, -s, -s);
      world.addParticle(bodyId, -s,  s, -s);
      world.addParticle(bodyId,  s,  s, -s);
      world.addParticle(bodyId, -s, -s,  s);
      world.addParticle(bodyId,  s, -s,  s);
      world.addParticle(bodyId, -s,  s,  s);
      world.addParticle(bodyId,  s,  s,  s);
    }

    bodyCountSpan.textContent = world.bodyCount.toString();

    renderer.updateBindGroup(world.getBodyPositionBuffer(), world.getBodyQuaternionBuffer());

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    function animate() {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      frameCount++;
      fpsTime += dt;
      if (fpsTime >= 1) {
        fpsSpan.textContent = Math.round(frameCount / fpsTime).toString();
        frameCount = 0;
        fpsTime = 0;
      }

      world.step(dt);
      renderer.updateBindGroup(world.getBodyPositionBuffer(), world.getBodyQuaternionBuffer());
      renderer.render(world.bodyCount);

      requestAnimationFrame(animate);
    }

    animate();
  } catch (err) {
    console.error(err);
    errorDiv.textContent = `Error: ${err instanceof Error ? err.message : err}`;
  }
}

main();

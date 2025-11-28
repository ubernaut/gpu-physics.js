/// <reference types="@webgpu/types" />
/**
 * Sphere interaction demo: many bodies with a large moving interaction sphere,
 * similar to the original GPU physics demo with a giant sphere pushing piles.
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
    const radius = 0.12;
    const gridRes = new Vec3(96, 48, 96);

    const world = new World({
      maxBodies: 128,
      maxParticles: 4096,
      radius,
      stiffness: 120,
      damping: 0.5,
      gravity: new Vec3(0, -2, 0),
      friction: 0.4,
      drag: 0.25,
      fixedTimeStep: 1 / 60,
      boxSize: new Vec3(gridRes.x * radius * 0.6, 30, gridRes.z * radius * 0.6),
      gridPosition: new Vec3(-gridRes.x * radius * 0.3, 0, -gridRes.z * radius * 0.3),
      gridResolution: gridRes,
      maxSubSteps: 8
    });

    await world.ready();

    const renderer = new BoxRenderer(world.getDevice(), canvas);

    // Create many boxes in a rough pile
    const boxCount = 60;
    const boxExt = new Vec3(radius * 1.5, radius * 1.5, radius * 1.5);
    const inertia = calculateBoxInertia(1, boxExt);

    for (let i = 0; i < boxCount; i++) {
      const x = (Math.random() - 0.5) * 3.0;
      const y = 1 + i * 0.05;
      const z = (Math.random() - 0.5) * 3.0;
      const qx = 0, qy = 0, qz = 0, qw = 1;
      const bodyId = world.addBody(x, y, z, qx, qy, qz, qw, 1, inertia.x, inertia.y, inertia.z);

      // 8 corner particles
      const s = radius * 1.2;
      world.addParticle(bodyId, -s, -s, -s);
      world.addParticle(bodyId,  s, -s, -s);
      world.addParticle(bodyId, -s,  s, -s);
      world.addParticle(bodyId,  s,  s, -s);
      world.addParticle(bodyId, -s, -s,  s);
      world.addParticle(bodyId,  s, -s,  s);
      world.addParticle(bodyId, -s,  s,  s);
      world.addParticle(bodyId,  s,  s,  s);
    }

    // Large interaction sphere that sweeps across the scene
    const sphereRadius = 2.0;
    world.setSphereRadius(0, sphereRadius);

    bodyCountSpan.textContent = world.bodyCount.toString();

    renderer.updateBindGroup(world.getBodyPositionBuffer(), world.getBodyQuaternionBuffer());

    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;
    const start = performance.now();

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

      const t = (now - start) * 0.001;
      const sx = Math.sin(t * 0.4) * 2.0;
      const sz = Math.cos(t * 0.3) * 2.0;
      const sy = 1.2 + Math.sin(t * 0.7) * 0.5;
      world.setSpherePosition(0, sx, sy, sz);

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

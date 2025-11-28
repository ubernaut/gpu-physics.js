import { World, Vec3 } from "../src/index.js";
import { calculateBoxInertia } from "../src/math.js";
import { BoxRenderer } from "./shared/boxRenderer.js";
import { ParticleRenderer } from "./shared/particleRenderer.js";
import { GridRenderer } from "./shared/gridRenderer.js";
import { OrbitCamera } from "./shared/orbitControls.js";

function createViewProj(aspect) {
  const fov = Math.PI / 4;
  const near = 0.1;
  const far = 100;
  const f = 1 / Math.tan(fov / 2);
  const proj = new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, far / (near - far), -1,
    0, 0, far * near / (near - far), 0,
  ]);
  // Match the other demos: slightly higher eye and a small pitch downward
  const eye = [0, 5, 12];
  const target = [0, 0.5, 0];
  const up = [0, 1, 0];
  const view = lookAt(eye, target, up);
  return multiplyMat4ColumnMajor(proj, view);
}

function lookAt(eye, target, up) {
  const z = normalize([
    eye[0] - target[0],
    eye[1] - target[1],
    eye[2] - target[2],
  ]);
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}
function multiplyMat4ColumnMajor(a, b) {
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

async function main() {
  const canvas = document.getElementById("canvas");
  const errorEl = document.getElementById("error");
  const particleCountEl = document.getElementById("particleCount");
  const fpsEl = document.getElementById("fps");

  const params = {
    radius: 0.1,
    stiffness: 900,
    damping: 5,
    friction: 1.5,
    drag: 0.25,
    gravityY: -2,
    sphereRadius: 0.6,
    oscillate: true,
    showParticles: true,
    paused: false,
  };

  const world = new World({
    maxBodies: 1024,
    maxParticles: 16384,
    radius: params.radius,
    stiffness: params.stiffness,
    damping: params.damping,
    friction: params.friction,
    drag: params.drag,
    fixedTimeStep: 1 / 120,
    gravity: new Vec3(0, params.gravityY, 0),
    boxSize: new Vec3(12, 12, 12),
    gridPosition: new Vec3(-12, 0, -12),
    gridResolution: new Vec3(96, 48, 96),
    maxSubSteps: 8,
  });
  await world.ready();

  const device = world.getDevice();
  const format = navigator.gpu.getPreferredCanvasFormat();
  const context = canvas.getContext("webgpu");
  context.configure({ device, format, alphaMode: "premultiplied" });

  const particleRenderer = new ParticleRenderer(world.getDevice());
  const boxRenderer = new BoxRenderer(world.getDevice(), canvas);
  const gridRenderer = new GridRenderer(world.getDevice(), format, { size: 40, height: 0 });
  const orbit = new OrbitCamera(canvas, { radius: 20, target: [0, 0.5, 0] });

  // Compound box parameters
  const boxN = 3;
  const boxR = params.radius;
  const boxSize = boxN * boxR * 2;
  const boxMass = 1;
  const boxInertia = calculateBoxInertia(boxMass, new Vec3(boxSize/2, boxSize/2, boxSize/2));

  function addCompoundBox(x, y, z) {
    // Random orientation
    const axis = new Vec3(Math.random(), Math.random(), Math.random()).normalize();
    const angle = Math.random() * Math.PI * 2;
    // Simple quaternion from axis-angle (approx)
    const s = Math.sin(angle/2);
    const qx = axis.x * s;
    const qy = axis.y * s;
    const qz = axis.z * s;
    const qw = Math.cos(angle/2);

    const bodyId = world.addBody(x, y, z, qx, qy, qz, qw, boxMass, boxInertia.x, boxInertia.y, boxInertia.z);
    
    // Fill box with particles
    const offset = (boxN - 1) * boxR;
    for(let i=0; i<boxN; i++) {
        for(let j=0; j<boxN; j++) {
            for(let k=0; k<boxN; k++) {
                // Hollow box optimization: only place particles on surface
                if(i===0 || i===boxN-1 || j===0 || j===boxN-1 || k===0 || k===boxN-1) {
                    const lx = i * 2 * boxR - offset;
                    const ly = j * 2 * boxR - offset;
                    const lz = k * 2 * boxR - offset;
                    world.addParticle(bodyId, lx, ly, lz);
                }
            }
        }
    }
  }

  function seedBoxes(count = 50) {
    for(let i=0; i<count; i++) {
        const x = (Math.random() - 0.5) * 8;
        const z = (Math.random() - 0.5) * 8;
        const y = 2 + i * (boxSize + 0.1);
        addCompoundBox(x, y, z);
    }
    particleCountEl.textContent = world.particleCount.toString();
  }

  seedBoxes(64);
  world.setSphereRadius(0, params.sphereRadius);
  world.setSpherePosition(0, 0, 1, 0);
  // Prime GPU buffers
  world.step(world.fixedTimeStep || 1 / 60);

  const gui = new window.lil.GUI({ title: "Particle Carpet" });
  gui.add(params, "sphereRadius", 0.1, 2, 0.05).onChange((v) => world.setSphereRadius(0, v));
  gui.add(params, "oscillate");
  gui.add(params, "showParticles");
  gui.add(params, "paused");

  let depthTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

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

    if (params.oscillate) {
      const t = now * 0.001;
      const sx = Math.sin(t * 0.5) * 2.5;
      const sz = Math.cos(t * 0.35) * 2.5;
      const sy = 0.8 + Math.sin(t * 0.9) * 0.6;
      world.setSpherePosition(0, sx, sy, sz);
    }

    if (!params.paused) {
      world.step(dt);
    }

    const particleBuffer = world.getParticleWorldPositionBuffer ? world.getParticleWorldPositionBuffer() : world.getParticlePositionBuffer();
    particleRenderer.updateBindGroup(particleBuffer);
    boxRenderer.updateBindGroup(world.getBodyPositionBuffer(), world.getBodyQuaternionBuffer());
    
    const viewProj = orbit.getViewProj(canvas.width / canvas.height);
    // Draw particles a bit larger than their physics radius to make them visible
    particleRenderer.updateViewProj(viewProj, world.radius);
    gridRenderer.update(viewProj, { gridSize: 0.5, lineWidth: 0.04, height: 0 });

    if (!params.showParticles) {
      boxRenderer.render(world.bodyCount, {
        viewProj,
        scale: [boxSize, boxSize, boxSize],
        drawExtras: (pass) => {
          gridRenderer.record(pass);
        },
      });
    } else {
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.14, g: 0.16, b: 0.2, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        }],
        depthStencilAttachment: {
          view: depthTexture.createView(),
          depthClearValue: 1,
          depthLoadOp: "clear",
          depthStoreOp: "store",
        },
      });

      particleRenderer.record(pass, world.particleCount);
      gridRenderer.record(pass);
      pass.end();
      device.queue.submit([encoder.finish()]);
    }

    requestAnimationFrame(frame);
  }

  frame();
}

main().catch((err) => {
  const errorEl = document.getElementById("error");
  errorEl.textContent = `Error: ${err.message || err}`;
  console.error(err);
});

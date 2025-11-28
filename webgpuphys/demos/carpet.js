import { World, Vec3 } from "../src/index.js";
import { calculateBoxInertia, calculateCloudInertia } from "../src/math.js";
import { ShapeRenderer } from "./shared/shapeRenderer.js";
import { ParticleRenderer } from "./shared/particleRenderer.js";
import { GridRenderer } from "./shared/gridRenderer.js";
import { OrbitCamera } from "./shared/orbitControls.js";
import { createBoxGeometry, createCylinderGeometry, createTetrisGeometry, getTetrisBlocks, createSphereGeometry } from "./shared/geometries.js";

async function main() {
  const canvas = document.getElementById("canvas");
  const errorEl = document.getElementById("error");
  const particleCountEl = document.getElementById("particleCount");
  const fpsEl = document.getElementById("fps");

  const params = {
    radius: 0.1,
    stiffness: 1200,
    damping: 5,
    friction: 1.5,
    drag: 0.25,
    gravityY: -2,
    sphereRadius: 0.6,
    oscillate: true,
    showParticles: true,
    paused: false,
    
    // Generator params
    objectCount: 64,
    resolution: 2, // N particles per unit size
    spawnShape: 'Mix', // Box, Cylinder, Tetris, Mix
  };

  let world = null;
  let particleRenderer = null;
  let gridRenderer = null;
  let sphereRenderer = null; // For interaction sphere
  let orbit = null;
  let depthTexture = null;
  
  // Renderers for different shapes
  let shapeRenderers = {};
  
  // Buffers for interaction sphere (single instance)
  let spherePosBuffer = null;
  let sphereQuatBuffer = null;
  // Track body ranges for each shape type: { type: [[start, count], ...] }
  let bodyRanges = {}; 

  // Helpers
  function getTetrisTypes() { return ['I', 'J', 'L', 'O', 'S', 'T', 'Z']; }

  async function initWorld() {
    // Pause rendering by destroying old world
    if (world) {
      world.destroy(); // sets initialized = false
    }

    const primitiveSize = 0.6; 
    const r = (primitiveSize / params.resolution) * 0.5;
    
    // Create new world locally
    const newWorld = new World({
      maxBodies: 4096,
      maxParticles: 65536,
      radius: r,
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
    await newWorld.ready();

    const device = newWorld.getDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();
    const context = canvas.getContext("webgpu");
    context.configure({ device, format, alphaMode: "premultiplied" });

    const newParticleRenderer = new ParticleRenderer(device);
    const newGridRenderer = new GridRenderer(device, format, { size: 40, height: 0 });
    
    const newDepthTexture = device.createTexture({
      size: [canvas.width, canvas.height],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const newShapeRenderers = {};
    newShapeRenderers['Box'] = new ShapeRenderer(device, createBoxGeometry());
    newShapeRenderers['Cylinder'] = new ShapeRenderer(device, createCylinderGeometry());
    for(let t of getTetrisTypes()) {
        newShapeRenderers[`Tetris_${t}`] = new ShapeRenderer(device, createTetrisGeometry(t));
    }
    
    // Interaction sphere renderer
    const newSphereRenderer = new ShapeRenderer(device, createSphereGeometry(1, 32, 24));
    const newSpherePosBuffer = device.createBuffer({ size: 16, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    const newSphereQuatBuffer = device.createBuffer({ size: 16, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    // Initialize quat to identity
    device.queue.writeBuffer(newSphereQuatBuffer, 0, new Float32Array([0,0,0,1]));
    newSphereRenderer.updateBindGroup(newSpherePosBuffer, newSphereQuatBuffer);

    if (!orbit) {
       orbit = new OrbitCamera(canvas, { radius: 20, target: [0, 0.5, 0] });
    }

    // Setup new ranges map
    const newBodyRanges = {};

    spawnObjects(newWorld, newBodyRanges);
    
    newWorld.setSphereRadius(0, params.sphereRadius);
    newWorld.setSpherePosition(0, 0, 1, 0);
    newWorld.step(newWorld.fixedTimeStep || 1 / 60);

    // Atomic swap
    if (depthTexture) depthTexture.destroy();
    if (spherePosBuffer) spherePosBuffer.destroy();
    if (sphereQuatBuffer) sphereQuatBuffer.destroy();

    world = newWorld;
    particleRenderer = newParticleRenderer;
    gridRenderer = newGridRenderer;
    shapeRenderers = newShapeRenderers;
    sphereRenderer = newSphereRenderer;
    spherePosBuffer = newSpherePosBuffer;
    sphereQuatBuffer = newSphereQuatBuffer;
    bodyRanges = newBodyRanges;
    depthTexture = newDepthTexture;
  }

  function spawnObjects(w, ranges) {
    const N = params.resolution;
    const r = w.radius; 
    const particleMass = 1; 
    
    function addRange(type, start, count) {
        if (!ranges[type]) ranges[type] = [];
        ranges[type].push([start, count]);
    }

    // 1. Box Generator
    function addCompoundBox(x, y, z) {
        const bodyStart = w.bodyCount;
        
        // Box is NxNxN particles.
        // Size = N * 2r.
        const size = N * 2 * r;
        // Total mass? Or particle mass = 1?
        // Let's assume uniform density.
        // Inertia of box:
        const totalMass = Math.pow(N, 3) * particleMass; // Approximation (filled)
        // If hollow, mass is less.
        // calculateBoxInertia expects total mass.
        // We will construct it hollow or filled?
        // User asked for "1, 8, 27". 1=1x1x1. 8=2x2x2. 27=3x3x3.
        // These are filled.
        
        const particles = [];
        const offset = (N - 1) * r;
        for(let i=0; i<N; i++) {
            for(let j=0; j<N; j++) {
                for(let k=0; k<N; k++) {
                    const lx = i * 2 * r - offset;
                    const ly = j * 2 * r - offset;
                    const lz = k * 2 * r - offset;
                    particles.push([lx, ly, lz]);
                }
            }
        }
        
        const inertia = calculateCloudInertia(particles.length * particleMass, particles);
        const mass = particles.length * particleMass;

        // Random rotation
        const axis = new Vec3(Math.random(), Math.random(), Math.random()).normalize();
        const angle = Math.random() * Math.PI * 2;
        const s = Math.sin(angle/2);
        const qw = Math.cos(angle/2);
        
        const bodyId = w.addBody(x, y, z, axis.x*s, axis.y*s, axis.z*s, qw, mass, inertia.x, inertia.y, inertia.z);
        
        for(let p of particles) {
            w.addParticle(bodyId, p[0], p[1], p[2]);
        }
        
        addRange('Box', bodyStart, 1);
    }

    // 2. Cylinder Generator
    function addCompoundCylinder(x, y, z) {
        const bodyStart = w.bodyCount;
        // Cylinder height = size. Diameter = size.
        // Approximation: fill grid, keep if inside radius.
        const size = N * 2 * r;
        const radius = size / 2;
        const height = size; // aspect 1:1
        
        const particles = [];
        const offset = (N - 1) * r; // Centering offset for grid
        
        // We iterate grid NxNxN and carve cylinder
        for(let i=0; i<N; i++) {
            for(let j=0; j<N; j++) { // Y axis
                for(let k=0; k<N; k++) {
                    const lx = i * 2 * r - offset;
                    const ly = j * 2 * r - offset;
                    const lz = k * 2 * r - offset;
                    
                    // Check radius in XZ plane
                    // Cylinder radius is roughly offset + r? 
                    // Let's use `radius` derived from size.
                    if (lx*lx + lz*lz <= radius*radius * 1.2) { // Allow slightly rough
                        particles.push([lx, ly, lz]);
                    }
                }
            }
        }
        
        if (particles.length === 0) return; // Should not happen

        const mass = particles.length * particleMass;
        const inertia = calculateCloudInertia(mass, particles);

        const axis = new Vec3(Math.random(), Math.random(), Math.random()).normalize();
        const angle = Math.random() * Math.PI * 2;
        const s = Math.sin(angle/2);
        const qw = Math.cos(angle/2);
        
        const bodyId = w.addBody(x, y, z, axis.x*s, axis.y*s, axis.z*s, qw, mass, inertia.x, inertia.y, inertia.z);
        for(let p of particles) {
            w.addParticle(bodyId, p[0], p[1], p[2]);
        }
        addRange('Cylinder', bodyStart, 1);
    }

    // 3. Tetris Generator
    function addCompoundTetris(x, y, z, type) {
        const bodyStart = w.bodyCount;
        const offsets = getTetrisBlocks(type); // Array of 4 centers [x,y,z] (units)
        // Unit is "one block". One block corresponds to NxNxN particles.
        // Block size = N * 2r.
        const blockSize = N * 2 * r;
        
        const particles = [];
        // For each block in tetris shape
        for(let off of offsets) {
            const bx = off[0] * blockSize;
            const by = off[1] * blockSize;
            const bz = off[2] * blockSize;
            
            // Fill block with particles
            const internalOffset = (N - 1) * r;
            for(let i=0; i<N; i++) {
                for(let j=0; j<N; j++) {
                    for(let k=0; k<N; k++) {
                        const lx = i * 2 * r - internalOffset;
                        const ly = j * 2 * r - internalOffset;
                        const lz = k * 2 * r - internalOffset;
                        particles.push([bx + lx, by + ly, bz + lz]);
                    }
                }
            }
        }
        
        // Calculate COM of particles
        let cx=0, cy=0, cz=0;
        for(let p of particles) { cx+=p[0]; cy+=p[1]; cz+=p[2]; }
        cx /= particles.length;
        cy /= particles.length;
        cz /= particles.length;
        
        // Recenter particles
        for(let p of particles) { p[0]-=cx; p[1]-=cy; p[2]-=cz; }
        
        const mass = particles.length * particleMass;
        const inertia = calculateCloudInertia(mass, particles);

        const axis = new Vec3(Math.random(), Math.random(), Math.random()).normalize();
        const angle = Math.random() * Math.PI * 2;
        const s = Math.sin(angle/2);
        const qw = Math.cos(angle/2);
        
        const bodyId = w.addBody(x, y, z, axis.x*s, axis.y*s, axis.z*s, qw, mass, inertia.x, inertia.y, inertia.z);
        for(let p of particles) {
            w.addParticle(bodyId, p[0], p[1], p[2]);
        }
        addRange(`Tetris_${type}`, bodyStart, 1);
    }

    // Main Spawn Loop
    const tetrisTypes = getTetrisTypes();
    const count = params.objectCount;
    const shape = params.spawnShape;
    const spacing = (N * 2 * w.radius) * 4; 

    for(let i=0; i<count; i++) {
        const px = (Math.random() - 0.5) * 8;
        const pz = (Math.random() - 0.5) * 8;
        const py = 2 + i * 1.0; // Stack them up

        let type = shape;
        if (type === 'Mix') {
            const r = Math.random();
            if (r < 0.33) type = 'Box';
            else if (r < 0.66) type = 'Cylinder';
            else type = 'Tetris';
        }

        if (type === 'Box') addCompoundBox(px, py, pz);
        else if (type === 'Cylinder') addCompoundCylinder(px, py, pz);
        else if (type === 'Tetris') {
            const t = tetrisTypes[Math.floor(Math.random() * tetrisTypes.length)];
            addCompoundTetris(px, py, pz, t);
        }
    }
    
    particleCountEl.textContent = w.particleCount.toString();
  }

  await initWorld();

  const gui = new window.lil.GUI({ title: "Shapes Demo" });
  gui.add(params, "objectCount", 1, 10000, 1).name("Object Count").onFinishChange(initWorld);
  gui.add(params, "resolution", 1, 4, 1).name("Particles/Side").onFinishChange(initWorld);
  gui.add(params, "spawnShape", ['Box', 'Cylinder', 'Tetris', 'Mix']).name("Shape").onFinishChange(initWorld);
  
  const folderPhys = gui.addFolder("Physics");
  folderPhys.add(world, "stiffness", 0, 5000, 10);
  folderPhys.add(world, "damping", 0, 20, 0.1);
  folderPhys.add(world, "friction", 0, 10, 0.1);
  folderPhys.add(world, "fixedTimeStep", 0.001, 0.1, 0.001).name("Time Step");
  folderPhys.add(params, "gravityY", -20, 20, 0.1).name("Gravity Y").onChange(v => world.gravity = new Vec3(0, v, 0));
  
  gui.add(params, "sphereRadius", 0.1, 2, 0.05).onChange((v) => world.setSphereRadius(0, v));
  gui.add(params, "oscillate");
  gui.add(params, "showParticles").name("Render Particles");
  gui.add(params, "paused");
  
  gui.add({ reset: initWorld }, "reset").name("Reset World");

  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTime = 0;

  function frame() {
    requestAnimationFrame(frame);

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

    // Guard: wait for world to be ready
    if (!world || !world.initialized) return;

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

    const device = world.getDevice();
    const context = canvas.getContext("webgpu");
    const viewProj = orbit.getViewProj(canvas.width / canvas.height);
    
    // Update all renderers
    // Scale for rendering:
    // Box: size = N * 2r. Scale = size. (Since geometry is unit cube size 1... wait, geometry is -1..1 size 2. ShapeRenderer scales by uniforms.scale * 0.5. So if we pass size, it renders size.)
    // Cylinder: Geometry is -1..1 (height 2, diameter 2). Scale by 0.5 inside shader?
    // ShapeRenderer code: `localPos * uniforms.scale`.
    // It does NOT multiply by 0.5 in shader unless I put it there.
    // In BoxRenderer it did: `localPos * uniforms.scale * 0.5`.
    // In ShapeRenderer I copied it. `localPos * uniforms.scale`.
    // Wait, let's check ShapeRenderer.js content I wrote.
    // `let scaledPos = localPos * uniforms.scale;`
    // No 0.5 factor?
    // Box geometry is -1..1. If I pass scale=1, size is 2.
    // If I want size S, I need scale S/2? No.
    // If I pass scale 1, result is -1..1.
    // If I want result to be -S/2 .. S/2 (size S).
    // I need scale S/2? No.
    // I need `localPos * 0.5 * S`.
    // So scale should be `S * 0.5`.
    
    // But wait, `BoxRenderer.js` previously had `localPos * 0.5` hardcoded.
    // And I updated it to `localPos * uniforms.scale * 0.5`.
    // `ShapeRenderer.js`: I wrote `let scaledPos = localPos * uniforms.scale;`.
    // I did NOT put 0.5.
    // So `ShapeRenderer` draws size 2 * scale.
    // So if I want size S, I should pass `scale = S / 2`.
    
    // Box size: `N * 2 * r`.
    // Scale = `N * r`.
    const scaleBox = params.resolution * world.radius;
    // Cylinder size: diameter `N * 2 * r`. Height `N * 2 * r`.
    // Scale = `N * r`.
    const scaleCyl = params.resolution * world.radius;
    // Tetris: Unit block size `N * 2 * r`.
    // Geometry is built from 1x1x1 cubes?
    // `createTetrisGeometry`: `bx = baseBox * 0.5`. So cubes are 1x1x1.
    // Then merged.
    // If I scale by S, cubes become SxSxS.
    // I want cubes to be size `N * 2 * r`.
    // So scale = `N * 2 * r`.
    const scaleTetris = params.resolution * 2 * world.radius;

    // Update bindings
    particleRenderer.updateBindGroup(world.getParticleWorldPositionBuffer());
    particleRenderer.updateViewProj(viewProj, world.radius);
    
    gridRenderer.update(viewProj, { gridSize: 0.5, lineWidth: 0.04, height: 0 });
    
    // Update interaction sphere
    const spherePos = new Float32Array(4); // x,y,z,w
    const p = world.getSpherePosition(0);
    spherePos.set([p.x, p.y, p.z, 1]);
    device.queue.writeBuffer(spherePosBuffer, 0, spherePos);
    
    const sr = world.getSphereRadius(0);
    sphereRenderer.updateUniforms(viewProj, [sr, sr, sr]);

    for(let key in shapeRenderers) {
        shapeRenderers[key].updateBindGroup(world.getBodyPositionBuffer(), world.getBodyQuaternionBuffer());
        let s = [1,1,1];
        if (key === 'Box') s = [scaleBox, scaleBox, scaleBox]; // Box geometry is -1..1. Scale=scaleBox -> Size 2*scaleBox. Wait.
        // Box geometry (-1..1). Size 2.
        // I want size `2 * N * r`.
        // Scale = `(2 * N * r) / 2` = `N * r`.
        // Yes `scaleBox` is correct.
        
        else if (key === 'Cylinder') s = [scaleCyl, scaleCyl, scaleCyl]; // Same logic.
        
        else if (key.startsWith('Tetris')) {
            // Tetris geometry is built of 1x1x1 cubes.
            // I want cubes of size `2 * N * r`.
            // So scale = `2 * N * r`.
            s = [scaleTetris, scaleTetris, scaleTetris];
        }
        
        shapeRenderers[key].updateUniforms(viewProj, s);
    }

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

    if (params.showParticles) {
      particleRenderer.record(pass, world.particleCount);
    } else {
      // Render shapes by iterating ranges
      for (let type in bodyRanges) {
        const ranges = bodyRanges[type];
        const renderer = shapeRenderers[type];
        if (!renderer) continue;
        for (let range of ranges) {
            const start = range[0];
            const count = range[1];
            renderer.record(pass, count, start);
        }
      }
    }
    
    // Render interaction sphere (always visible?) or only if shadows?
    // User said "interactive sphere ... is not visible".
    // I'll render it always.
    sphereRenderer.record(pass, 1);

    gridRenderer.record(pass);
    pass.end();
    device.queue.submit([encoder.finish()]);

  }

  frame();
}

main().catch((err) => {
  const errorEl = document.getElementById("error");
  errorEl.textContent = `Error: ${err.message || err}`;
  console.error(err);
});

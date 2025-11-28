/// <reference types="@webgpu/types" />
/**
 * Single Box Demo - minimal scene mirroring the original gpu-physics.js example
 */
import { World, Vec3 } from '../src';
import { calculateBoxInertia } from '../src/math';

// Simple box renderer using WebGPU (copied from boxes demo)
class BoxRenderer {
  private device: GPUDevice;
  private context: GPUCanvasContext;
  private pipeline: GPURenderPipeline;
  private viewProjBuffer: GPUBuffer;
  private bindGroup: GPUBindGroup;
  private vertexBuffer: GPUBuffer;
  private indexBuffer: GPUBuffer;
  private indexCount: number;

  constructor(device: GPUDevice, canvas: HTMLCanvasElement) {
    this.device = device;
    
    // Configure canvas context
    this.context = canvas.getContext('webgpu')!;
    const format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device,
      format,
      alphaMode: 'premultiplied'
    });

    // Create box geometry
    const { vertices, indices } = this.createBoxGeometry();
    this.vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(this.vertexBuffer, 0, vertices);

    this.indexBuffer = device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(this.indexBuffer, 0, indices);
    this.indexCount = indices.length;

    // View-projection uniform buffer
    this.viewProjBuffer = device.createBuffer({
      size: 64, // mat4x4
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    // Shader module
    const shaderCode = `
      struct Uniforms {
        viewProj: mat4x4<f32>
      }
      @group(0) @binding(0) var<uniform> uniforms: Uniforms;
      @group(0) @binding(1) var<storage, read> positions: array<vec4<f32>>;
      @group(0) @binding(2) var<storage, read> quaternions: array<vec4<f32>>;

      struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) normal: vec3<f32>,
        @location(1) @interpolate(flat) instanceId: u32
      }

      fn quatRotate(q: vec4<f32>, v: vec3<f32>) -> vec3<f32> {
        let t = 2.0 * cross(q.xyz, v);
        return v + q.w * t + cross(q.xyz, t);
      }

      @vertex
      fn vs_main(
        @location(0) localPos: vec3<f32>,
        @location(1) normal: vec3<f32>,
        @builtin(instance_index) instanceId: u32
      ) -> VertexOutput {
        let bodyPos = positions[instanceId].xyz;
        let bodyQuat = quaternions[instanceId];
        
        // Transform local position by body transform
        let worldPos = bodyPos + quatRotate(bodyQuat, localPos * 0.5);
        let worldNormal = quatRotate(bodyQuat, normal);
        
        var out: VertexOutput;
        out.position = uniforms.viewProj * vec4(worldPos, 1.0);
        out.normal = worldNormal;
        out.instanceId = instanceId;
        return out;
      }

      @fragment
      fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
        let lightDir = normalize(vec3(0.5, 1.0, 0.3));
        let ambient = 0.25;
        let diffuse = max(dot(in.normal, lightDir), 0.0);
        
        // Color based on instance ID
        let hue = f32(in.instanceId % 12u) / 12.0;
        let color = hsvToRgb(hue, 0.7, 0.9);
        
        let lighting = ambient + diffuse * 0.75;
        return vec4(color * lighting, 1.0);
      }

      fn hsvToRgb(h: f32, s: f32, v: f32) -> vec3<f32> {
        let c = v * s;
        let x = c * (1.0 - abs(fract(h * 6.0) * 2.0 - 1.0));
        let m = v - c;
        var rgb: vec3<f32>;
        let hi = u32(h * 6.0) % 6u;
        if (hi == 0u) { rgb = vec3(c, x, 0.0); }
        else if (hi == 1u) { rgb = vec3(x, c, 0.0); }
        else if (hi == 2u) { rgb = vec3(0.0, c, x); }
        else if (hi == 3u) { rgb = vec3(0.0, x, c); }
        else if (hi == 4u) { rgb = vec3(x, 0.0, c); }
        else { rgb = vec3(c, 0.0, x); }
        return rgb + vec3(m);
      }
    `;

    const shaderModule = device.createShaderModule({ code: shaderCode });

    // Bind group layout
    const bindGroupLayout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } }
      ]
    });

    // Create pipeline
    this.pipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: [{
          arrayStride: 24, // vec3 pos + vec3 normal
          attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x3' }
          ]
        }]
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{ format }]
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'back'
      },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: true,
        depthCompare: 'less'
      }
    });

    // Create bind group (will be recreated when physics buffers change)
    this.bindGroup = null!;
  }

  private createBoxGeometry() {
    // Unit box centered at origin
    const vertices = new Float32Array([
      // Front face
      -1, -1,  1,  0,  0,  1,
       1, -1,  1,  0,  0,  1,
       1,  1,  1,  0,  0,  1,
      -1,  1,  1,  0,  0,  1,
      // Back face
       1, -1, -1,  0,  0, -1,
      -1, -1, -1,  0,  0, -1,
      -1,  1, -1,  0,  0, -1,
       1,  1, -1,  0,  0, -1,
      // Top face
      -1,  1,  1,  0,  1,  0,
       1,  1,  1,  0,  1,  0,
       1,  1, -1,  0,  1,  0,
      -1,  1, -1,  0,  1,  0,
      // Bottom face
      -1, -1, -1,  0, -1,  0,
       1, -1, -1,  0, -1,  0,
       1, -1,  1,  0, -1,  0,
      -1, -1,  1,  0, -1,  0,
      // Right face
       1, -1,  1,  1,  0,  0,
       1, -1, -1,  1,  0,  0,
       1,  1, -1,  1,  0,  0,
       1,  1,  1,  1,  0,  0,
      // Left face
      -1, -1, -1, -1,  0,  0,
      -1, -1,  1, -1,  0,  0,
      -1,  1,  1, -1,  0,  0,
      -1,  1, -1, -1,  0,  0,
    ]);

    const indices = new Uint16Array([
       0,  1,  2,  0,  2,  3,  // front
       4,  5,  6,  4,  6,  7,  // back
       8,  9, 10,  8, 10, 11,  // top
      12, 13, 14, 12, 14, 15,  // bottom
      16, 17, 18, 16, 18, 19,  // right
      20, 21, 22, 20, 22, 23   // left
    ]);

    return { vertices, indices };
  }

  updateBindGroup(positionBuffer: GPUBuffer, quaternionBuffer: GPUBuffer) {
    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.viewProjBuffer } },
        { binding: 1, resource: { buffer: positionBuffer } },
        { binding: 2, resource: { buffer: quaternionBuffer } }
      ]
    });
  }

  render(bodyCount: number) {
    // Update view-projection matrix
    const aspect = 800 / 600;
    const viewProj = this.createViewProjMatrix(aspect);
    this.device.queue.writeBuffer(this.viewProjBuffer, 0, viewProj as unknown as ArrayBuffer);

    // Create depth texture
    const depthTexture = this.device.createTexture({
      size: [800, 600],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    const commandEncoder = this.device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: { r: 0.07, g: 0.07, b: 0.1, a: 1 },
        loadOp: 'clear',
        storeOp: 'store'
      }],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store'
      }
    });

    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.bindGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setIndexBuffer(this.indexBuffer, 'uint16');
    renderPass.drawIndexed(this.indexCount, bodyCount);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
    depthTexture.destroy();
  }

  private createViewProjMatrix(aspect: number): Float32Array {
    // Column-major perspective matrix
    const fov = Math.PI / 4;
    const near = 0.1;
    const far = 100;
    const f = 1 / Math.tan(fov / 2);
    const proj = new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, far / (near - far), -1,
      0, 0, (far * near) / (near - far), 0
    ]);

    // Column-major lookAt matrix
    const eye = [4, 2, -6];
    const target = [0, 0.5, 0];
    const up = [0, 1, 0];
    const view = this.lookAt(eye, target, up);

    return this.multiplyMat4ColumnMajor(proj, view);
  }

  private lookAt(eye: number[], target: number[], up: number[]): Float32Array {
    const z = this.normalize([
      eye[0] - target[0],
      eye[1] - target[1],
      eye[2] - target[2],
    ]);
    const x = this.normalize(this.cross(up, z));
    const y = this.cross(z, x);

    // Column-major view matrix
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -this.dot(x, eye), -this.dot(y, eye), -this.dot(z, eye), 1,
    ]);
  }

  private normalize(v: number[]): number[] {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return [v[0]/len, v[1]/len, v[2]/len];
  }

  private cross(a: number[], b: number[]): number[] {
    return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
  }

  private dot(a: number[], b: number[]): number {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  }

  // Column-major matrix multiply: out = a * b
  private multiplyMat4ColumnMajor(a: Float32Array, b: Float32Array): Float32Array {
    const out = new Float32Array(16);
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        out[col * 4 + row] =
          a[0 * 4 + row] * b[col * 4 + 0] +
          a[1 * 4 + row] * b[col * 4 + 1] +
          a[2 * 4 + row] * b[col * 4 + 2] +
          a[3 * 4 + row] * b[col * 4 + 3];
      }
    }
    return out;
  }
}

// Main demo
async function main() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const errorDiv = document.getElementById('error')!;
  const bodyCountSpan = document.getElementById('bodyCount')!;
  const fpsSpan = document.getElementById('fps')!;

  try {
    // Create physics world tuned similar to the original single-box example
    const radius = 0.05;
    const gridRes = new Vec3(128, 32, 128);
    const world = new World({
      maxBodies: 32,
      maxParticles: 4096,
      radius,
      stiffness: 100,
      damping: 0.4,
      gravity: new Vec3(0, -1, 0),
      friction: 0.4,
      drag: 0.3,
      fixedTimeStep: 1/60,
      boxSize: new Vec3(gridRes.x * radius, 10000, gridRes.z * radius),
      gridPosition: new Vec3(-gridRes.x * radius, 0, -gridRes.z * radius),
      gridResolution: gridRes,
    });

    await world.ready();

    // Create renderer
    const renderer = new BoxRenderer(world.getDevice(), canvas);

    // Build a single particle box (shell only)
    const N = 5;
    const mass = 0.5;
    const extent = new Vec3(radius * N, radius * N, radius * N);
    const inertiaVec = calculateBoxInertia(mass, extent);
    const axis = new Vec3(Math.random(), Math.random(), Math.random()).normalize();
    const angle = Math.PI * Math.random();
    const qx = axis.x * Math.sin(angle / 2);
    const qy = axis.y * Math.sin(angle / 2);
    const qz = axis.z * Math.sin(angle / 2);
    const qw = Math.cos(angle / 2);
    const bodyId = world.addBody(0, 1.5, 0, qx, qy, qz, qw, mass, inertiaVec.x, inertiaVec.y, inertiaVec.z);

    const spacing = radius * 2;
    const half = (N - 1) * 0.5 * spacing;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          const onSurface = i === 0 || j === 0 || k === 0 || i === N - 1 || j === N - 1 || k === N - 1;
          if (!onSurface) continue;
          const x = i * spacing - half;
          const y = j * spacing - half;
          const z = k * spacing - half;
          world.addParticle(bodyId, x, y, z);
        }
      }
    }

    bodyCountSpan.textContent = world.bodyCount.toString();

    // Update renderer with physics buffers
    renderer.updateBindGroup(
      world.getBodyPositionBuffer(),
      world.getBodyQuaternionBuffer()
    );

    // Animation loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = 0;

    function animate() {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Update FPS counter
      frameCount++;
      fpsTime += dt;
      if (fpsTime >= 1) {
        fpsSpan.textContent = Math.round(frameCount / fpsTime).toString();
        frameCount = 0;
        fpsTime = 0;
      }

      // Step physics
      world.step(dt);

      // Sync renderer bind group with the current buffers
      renderer.updateBindGroup(
        world.getBodyPositionBuffer(),
        world.getBodyQuaternionBuffer()
      );

      // Render
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

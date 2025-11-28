# WebGPU Physics Migration Plan

## Overview

This document outlines the migration strategy for converting `gpu-physics.js` from WebGL (THREE.js-based GPGPU) to native WebGPU. The goal is to create a modern, high-performance physics library that leverages WebGPU compute shaders for maximum performance while maintaining correctness.

## Existing Architecture Analysis

### Current Implementation (WebGL/THREE.js)
- **Render-to-texture GPGPU**: Uses THREE.js WebGLRenderTarget for physics computations
- **Fullscreen quad rendering**: Fragment shaders process data as textures
- **Particle-based rigid body physics**: Bodies composed of particles for collision detection
- **Spatial hashing**: Grid-based broadphase using stencil buffer for bucket routing
- **Double-buffered textures**: Read/write swap pattern for state updates

### Core Physics Pipeline
1. `flushData()` - Initialize texture data
2. `updateWorldParticlePositions()` - Transform local particles to world space
3. `updateRelativeParticlePositions()` - Compute relative positions for torque
4. `updateParticleVelocity()` - Derive particle velocities from body velocities
5. `updateGrid()` - Spatial hash broadphase
6. `updateParticleForce()` - Collision detection & force calculation
7. `updateParticleTorque()` - Torque from particle collisions
8. `updateBodyForce()` - Aggregate particle forces to bodies
9. `updateBodyTorque()` - Aggregate particle torques to bodies
10. `updateBodyVelocity()` - Linear velocity integration
11. `updateBodyAngularVelocity()` - Angular velocity integration
12. `updateBodyPosition()` - Position integration
13. `updateBodyQuaternion()` - Quaternion integration

### Key Data Structures
- **Body textures**: Position, quaternion, velocity, angular velocity, force, torque, mass/inertia
- **Particle textures**: Local position, relative position, world position, velocity, force, torque
- **Grid texture**: Spatial hash cells (4 particles per cell via stencil routing)

---

## WebGPU Migration Strategy

### Phase 1: Project Setup
- [ ] Initialize npm project with modern tooling (Vite, TypeScript)
- [ ] Set up WebGPU type definitions and feature detection
- [ ] Create build system with WGSL shader support
- [ ] Configure testing framework (Vitest + Puppeteer for headless)

### Phase 2: Core Infrastructure
- [ ] Create WebGPU device/adapter initialization
- [ ] Implement GPUBuffer management for physics data (replacing textures)
- [ ] Build bind group and pipeline layout system
- [ ] Create compute pipeline factory for shader dispatch

### Phase 3: Data Structures (Textures → Buffers)
Convert all texture-based storage to structured GPUBuffers:

| Old (Texture) | New (Buffer) | Format |
|---------------|--------------|--------|
| bodyPos | bodyPositionBuffer | vec4<f32>[] |
| bodyQuat | bodyQuaternionBuffer | vec4<f32>[] |
| bodyVel | bodyVelocityBuffer | vec4<f32>[] |
| bodyAngularVel | bodyAngularVelocityBuffer | vec4<f32>[] |
| bodyForce | bodyForceBuffer | vec4<f32>[] |
| bodyTorque | bodyTorqueBuffer | vec4<f32>[] |
| bodyMass | bodyMassBuffer | vec4<f32>[] (invInertia.xyz, invMass) |
| particlePosLocal | particleLocalPosBuffer | vec4<f32>[] (x,y,z,bodyId) |
| particlePosRelative | particleRelativePosBuffer | vec4<f32>[] |
| particlePosWorld | particleWorldPosBuffer | vec4<f32>[] |
| particleVel | particleVelocityBuffer | vec4<f32>[] |
| particleForce | particleForceBuffer | vec4<f32>[] |
| particleTorque | particleTorqueBuffer | vec4<f32>[] |
| grid | gridBuffer | u32[] or vec4<u32>[] |

### Phase 4: WGSL Shader Port

#### Utility Functions (shared.wgsl)
- [ ] `uvToIndex()` → `index` arithmetic (direct)
- [ ] `indexToUV()` → remove (use direct indexing)
- [ ] `worldPosToGridPos()` → port to WGSL
- [ ] `gridPosToGridIndex()` → new function for buffer indexing
- [ ] `quat_integrate()` → port quaternion math
- [ ] `vec3_applyQuat()` → port rotation
- [ ] `quat2mat()` → port matrix conversion
- [ ] `invInertiaWorld()` → port inertia tensor transform

#### Compute Shaders (replacing fragment shaders)
1. [ ] `local_to_world.wgsl` - Transform local particle positions to world space
2. [ ] `local_to_relative.wgsl` - Compute relative positions
3. [ ] `body_vel_to_particle_vel.wgsl` - Derive particle velocities
4. [ ] `build_grid.wgsl` - Spatial hash construction (atomic operations)
5. [ ] `update_force.wgsl` - Collision detection & force calculation
6. [ ] `update_torque.wgsl` - Torque calculation
7. [ ] `reduce_particle_force.wgsl` - Sum particle forces to bodies (atomic add)
8. [ ] `reduce_particle_torque.wgsl` - Sum particle torques to bodies
9. [ ] `update_body_velocity.wgsl` - Linear velocity integration
10. [ ] `update_body_angular_velocity.wgsl` - Angular velocity integration
11. [ ] `update_body_position.wgsl` - Position integration
12. [ ] `update_body_quaternion.wgsl` - Quaternion integration

### Phase 5: Grid/Broadphase Reimplementation

The current stencil-based grid routing is WebGL-specific. WebGPU alternatives:

**Option A: Atomic Counting Grid** (Recommended)
- Use `atomicAdd` to count particles per cell
- Store particle indices in a prefix-sum indexed array
- More flexible, better for varying particle densities

**Option B: Fixed-Size Grid Cells**
- Similar to current approach but use atomic ops for slot allocation
- Simpler but limited to 4 particles per cell

### Phase 6: World API Implementation
- [ ] `World` class with WebGPU device management
- [ ] `addBody()` / `addParticle()` with staging buffer writes
- [ ] `step()` / `singleStep()` orchestrating compute passes
- [ ] Property getters/setters for physics parameters
- [ ] Position/quaternion setters for runtime manipulation

### Phase 7: Rendering Integration
- [ ] Create vertex buffer views of body position/quaternion
- [ ] Implement instanced rendering for particle spheres
- [ ] Add shadow map support
- [ ] THREE.js interop layer (optional)

### Phase 8: Testing Framework
- [ ] Unit tests for math functions (quaternions, vectors)
- [ ] Integration tests for physics correctness
- [ ] Performance benchmarks
- [ ] Headless browser tests via Puppeteer

### Phase 9: Demo Reimplementation
- [ ] Boxes demo (stacking rigid bodies)
- [ ] Box demo (single body)
- [ ] Interactive sphere demo
- [ ] Performance stress test demo

---

## Directory Structure

```
webgpuphys/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── src/
│   ├── index.ts              # Main exports
│   ├── world.ts              # World class
│   ├── device.ts             # WebGPU initialization
│   ├── buffers.ts            # Buffer management
│   ├── pipelines.ts          # Compute pipeline creation
│   ├── broadphase.ts         # Spatial hash grid
│   ├── math/
│   │   ├── vec3.ts
│   │   ├── vec4.ts
│   │   ├── quat.ts
│   │   └── mat3.ts
│   └── shaders/
│       ├── shared.wgsl
│       ├── local_to_world.wgsl
│       ├── local_to_relative.wgsl
│       ├── body_vel_to_particle_vel.wgsl
│       ├── build_grid.wgsl
│       ├── clear_grid.wgsl
│       ├── update_force.wgsl
│       ├── update_torque.wgsl
│       ├── reduce_force.wgsl
│       ├── reduce_torque.wgsl
│       ├── update_body_velocity.wgsl
│       ├── update_body_angular_velocity.wgsl
│       ├── update_body_position.wgsl
│       └── update_body_quaternion.wgsl
├── demos/
│   ├── index.html
│   ├── boxes.html
│   ├── boxes.ts
│   └── common/
│       ├── renderer.ts       # WebGPU rendering helpers
│       └── controls.ts       # Camera/interaction
├── tests/
│   ├── math.test.ts
│   ├── physics.test.ts
│   ├── integration.test.ts
│   └── e2e/
│       └── headless.test.ts
└── dist/                     # Build output
```

---

## Performance Considerations

### WebGPU Advantages
1. **Compute shaders**: Direct compute without fragment shader overhead
2. **Workgroup shared memory**: Efficient local data sharing
3. **Better memory access**: Structured buffers vs texture fetches
4. **Atomic operations**: Native support for reductions
5. **Timestamp queries**: Accurate performance profiling

### Optimization Strategies
1. **Workgroup sizing**: Tune for GPU occupancy (64-256 threads typical)
2. **Memory coalescing**: Ensure adjacent threads access adjacent memory
3. **Minimize dispatches**: Combine operations where possible
4. **Double buffering**: Avoid pipeline stalls
5. **Async readback**: Non-blocking CPU reads when needed

---

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// Example: Quaternion integration test
test('quaternion integration preserves length', () => {
  const q = new Float32Array([0, 0, 0, 1]);
  const w = new Float32Array([0.1, 0.2, 0.3]);
  const dt = 1/60;
  quatIntegrate(q, w, dt);
  expect(quatLength(q)).toBeCloseTo(1.0, 5);
});
```

### Integration Tests
- Single body falling under gravity
- Two-body collision response
- Stack stability test
- Energy conservation checks

### E2E/Headless Tests (Puppeteer)
- WebGPU feature detection
- Demo loading and execution
- Visual regression (screenshot comparison)
- Performance metrics collection

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Setup | 1 day | None |
| Phase 2: Infrastructure | 2 days | Phase 1 |
| Phase 3: Data Structures | 1 day | Phase 2 |
| Phase 4: Shaders | 3 days | Phase 3 |
| Phase 5: Broadphase | 2 days | Phase 4 |
| Phase 6: World API | 2 days | Phase 5 |
| Phase 7: Rendering | 2 days | Phase 6 |
| Phase 8: Testing | 2 days | Parallel |
| Phase 9: Demos | 1 day | Phase 7 |

**Total: ~16 days**

---

## Risk Mitigation

1. **Browser compatibility**: Feature detect WebGPU, provide clear error messages
2. **Precision issues**: Use f32 consistently, validate numerical stability
3. **Debugging difficulty**: Add CPU fallback for validation, extensive logging
4. **Performance regression**: Benchmark against original early and often

---

## Success Criteria

1. ✓ All demos run correctly with WebGPU
2. ✓ Performance equal or better than WebGL version
3. ✓ Automated tests pass in headless Chrome
4. ✓ Clean TypeScript API with full type coverage
5. ✓ Zero WebGL dependencies in core library

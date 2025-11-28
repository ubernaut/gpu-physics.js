/**
 * Type definitions for WebGPU Physics
 */

/**
 * Represents a rigid body in the physics simulation
 */
export interface PhysicsBody {
  /** Unique identifier for this body */
  id: number;
  /** Position in world space (x, y, z) */
  position: Float32Array;
  /** Rotation quaternion (x, y, z, w) */
  quaternion: Float32Array;
  /** Linear velocity */
  velocity: Float32Array;
  /** Angular velocity */
  angularVelocity: Float32Array;
  /** Mass of the body (0 for static bodies) */
  mass: number;
  /** Inertia tensor diagonal (Ixx, Iyy, Izz) */
  inertia: Float32Array;
}

/**
 * Represents a collision particle attached to a body
 */
export interface PhysicsParticle {
  /** Unique identifier for this particle */
  id: number;
  /** Body this particle belongs to */
  bodyId: number;
  /** Local position relative to body center */
  localPosition: Float32Array;
}

/**
 * Parameters for simulation
 */
export interface SimulationParams {
  /** Spring stiffness for contacts */
  stiffness: number;
  /** Damping coefficient */
  damping: number;
  /** Friction coefficient */
  friction: number;
  /** Air drag coefficient */
  drag: number;
  /** Particle/cell radius */
  radius: number;
  /** Fixed timestep for simulation */
  fixedTimeStep: number;
  /** Gravity vector */
  gravity: Float32Array;
  /** World bounds (half extents) */
  boxSize: Float32Array;
}

/**
 * Grid configuration for broadphase
 */
export interface GridConfig {
  /** Position of grid origin */
  position: Float32Array;
  /** Resolution in each dimension */
  resolution: Float32Array;
  /** Maximum particles per cell */
  maxParticlesPerCell: number;
}

/**
 * Buffer handles for GPU resources
 */
export interface PhysicsBuffers {
  // Body buffers (double-buffered for read/write)
  bodyPositionA: GPUBuffer;
  bodyPositionB: GPUBuffer;
  bodyQuaternionA: GPUBuffer;
  bodyQuaternionB: GPUBuffer;
  bodyVelocityA: GPUBuffer;
  bodyVelocityB: GPUBuffer;
  bodyAngularVelocityA: GPUBuffer;
  bodyAngularVelocityB: GPUBuffer;
  bodyForce: GPUBuffer;
  bodyTorque: GPUBuffer;
  bodyMass: GPUBuffer;

  // Particle buffers
  particleLocalPosition: GPUBuffer;
  particleRelativePosition: GPUBuffer;
  particleWorldPosition: GPUBuffer;
  particleVelocity: GPUBuffer;
  particleForce: GPUBuffer;
  particleTorque: GPUBuffer;

  // Broadphase grid
  gridCellCount: GPUBuffer;
  gridCellParticles: GPUBuffer;

  // Uniform/params buffer
  params: GPUBuffer;

  // Staging buffers for CPU readback
  stagingPosition: GPUBuffer;
  stagingQuaternion: GPUBuffer;
}

/**
 * Compute pipelines for physics simulation
 */
export interface PhysicsPipelines {
  localToWorld: GPUComputePipeline;
  localToRelative: GPUComputePipeline;
  bodyVelToParticleVel: GPUComputePipeline;
  clearGrid: GPUComputePipeline;
  buildGrid: GPUComputePipeline;
  updateForce: GPUComputePipeline;
  updateTorque: GPUComputePipeline;
  reduceForce: GPUComputePipeline;
  reduceTorque: GPUComputePipeline;
  updateBodyVelocity: GPUComputePipeline;
  updateBodyAngularVelocity: GPUComputePipeline;
  updateBodyPosition: GPUComputePipeline;
  updateBodyQuaternion: GPUComputePipeline;
}

/**
 * WGSL shader sources
 */
export interface ShaderSources {
  shared: string;
  localToWorld: string;
  localToRelative: string;
  bodyVelToParticleVel: string;
  clearGrid: string;
  buildGrid: string;
  updateForce: string;
  updateTorque: string;
  reduceForce: string;
  reduceTorque: string;
  updateBodyVelocity: string;
  updateBodyAngularVelocity: string;
  updateBodyPosition: string;
  updateBodyQuaternion: string;
}

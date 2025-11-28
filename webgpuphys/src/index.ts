/**
 * WebGPU Physics - High-performance GPU-accelerated physics simulation
 * 
 * A port of gpu-physics.js from WebGL to WebGPU compute shaders
 */

export { World, type WorldOptions } from './world';
export { initWebGPU, isWebGPUSupported, type WebGPUContext } from './device';
export { Vec3, Vec4, Quat, Mat3 } from './math';
export type { PhysicsBody, PhysicsParticle } from './types';

// Re-export constants
export const VERSION = '1.0.0';

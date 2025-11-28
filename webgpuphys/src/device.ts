/**
 * WebGPU Device initialization and management
 */

/**
 * WebGPU context containing device and adapter
 */
export interface WebGPUContext {
  adapter: GPUAdapter;
  device: GPUDevice;
  features: GPUSupportedFeatures;
  limits: GPUSupportedLimits;
}

/**
 * Check if WebGPU is supported in the current environment
 */
export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

/**
 * Initialize WebGPU and request a device
 * @throws Error if WebGPU is not supported or device creation fails
 */
export async function initWebGPU(): Promise<WebGPUContext> {
  if (!isWebGPUSupported()) {
    throw new Error('WebGPU is not supported in this browser. Please use a WebGPU-enabled browser like Chrome 113+ or Edge 113+.');
  }

  const gpu = navigator.gpu;
  
  // Request adapter
  const adapter = await gpu.requestAdapter({
    powerPreference: 'high-performance'
  });

  if (!adapter) {
    throw new Error('Failed to get WebGPU adapter. Your GPU may not support WebGPU.');
  }

  // Log adapter info for debugging
  const adapterInfo = adapter.info;
  console.log('WebGPU Adapter:', {
    vendor: adapterInfo.vendor,
    architecture: adapterInfo.architecture,
    device: adapterInfo.device,
    description: adapterInfo.description
  });

  // Request device with required features
  const requiredFeatures: GPUFeatureName[] = [];
  const requiredLimits: Record<string, number> = {
    maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
    maxComputeWorkgroupsPerDimension: adapter.limits.maxComputeWorkgroupsPerDimension,
    maxComputeInvocationsPerWorkgroup: adapter.limits.maxComputeInvocationsPerWorkgroup,
    maxComputeWorkgroupSizeX: adapter.limits.maxComputeWorkgroupSizeX,
    maxComputeWorkgroupSizeY: adapter.limits.maxComputeWorkgroupSizeY,
    maxComputeWorkgroupSizeZ: adapter.limits.maxComputeWorkgroupSizeZ,
  };

  // Check for timestamp query support (useful for profiling)
  if (adapter.features.has('timestamp-query')) {
    requiredFeatures.push('timestamp-query');
  }

  const device = await adapter.requestDevice({
    requiredFeatures,
    requiredLimits
  });

  // Handle device loss
  device.lost.then((info) => {
    console.error('WebGPU device lost:', info.message);
    if (info.reason !== 'destroyed') {
      // Could attempt to recreate device here
      console.error('Device loss reason:', info.reason);
    }
  });

  // Set up error handling
  device.onuncapturederror = (event) => {
    console.error('WebGPU uncaptured error:', event.error);
  };

  return {
    adapter,
    device,
    features: device.features,
    limits: device.limits
  };
}

/**
 * Create a compute shader module from WGSL source
 */
export function createShaderModule(device: GPUDevice, code: string, label?: string): GPUShaderModule {
  return device.createShaderModule({
    label: label || 'shader',
    code
  });
}

/**
 * Create a compute pipeline
 */
export function createComputePipeline(
  device: GPUDevice,
  shaderModule: GPUShaderModule,
  entryPoint: string,
  layout: GPUPipelineLayout | 'auto',
  label?: string
): GPUComputePipeline {
  return device.createComputePipeline({
    label: label || 'compute-pipeline',
    layout,
    compute: {
      module: shaderModule,
      entryPoint
    }
  });
}

/**
 * Create a storage buffer
 */
export function createStorageBuffer(
  device: GPUDevice,
  size: number,
  label?: string,
  mappedAtCreation = false
): GPUBuffer {
  return device.createBuffer({
    label: label || 'storage-buffer',
    size,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    mappedAtCreation
  });
}

/**
 * Create a uniform buffer
 */
export function createUniformBuffer(
  device: GPUDevice,
  size: number,
  label?: string
): GPUBuffer {
  return device.createBuffer({
    label: label || 'uniform-buffer',
    size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
}

/**
 * Create a staging buffer for GPU->CPU readback
 */
export function createStagingBuffer(
  device: GPUDevice,
  size: number,
  label?: string
): GPUBuffer {
  return device.createBuffer({
    label: label || 'staging-buffer',
    size,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
  });
}

/**
 * Write data to a buffer
 */
export function writeBuffer(
  device: GPUDevice,
  buffer: GPUBuffer,
  data: ArrayBuffer | ArrayBufferView,
  offset = 0
): void {
  device.queue.writeBuffer(buffer, offset, data as ArrayBuffer);
}

/**
 * Read data from a buffer (async)
 */
export async function readBuffer(
  device: GPUDevice,
  sourceBuffer: GPUBuffer,
  stagingBuffer: GPUBuffer,
  size: number
): Promise<ArrayBuffer> {
  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyBufferToBuffer(sourceBuffer, 0, stagingBuffer, 0, size);
  device.queue.submit([commandEncoder.finish()]);

  await stagingBuffer.mapAsync(GPUMapMode.READ);
  const copyData = stagingBuffer.getMappedRange().slice(0);
  stagingBuffer.unmap();

  return copyData;
}

/**
 * Utility to align buffer sizes to GPU requirements
 */
export function alignTo(size: number, alignment: number): number {
  return Math.ceil(size / alignment) * alignment;
}

/**
 * Get workgroup dispatch dimensions for a given number of elements
 */
export function getDispatchSize(numElements: number, workgroupSize: number): number {
  return Math.ceil(numElements / workgroupSize);
}

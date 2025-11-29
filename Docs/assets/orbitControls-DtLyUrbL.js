var S=Object.defineProperty;var R=(s,e,t)=>e in s?S(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var p=(s,e,t)=>R(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(i){if(i.ep)return;i.ep=!0;const n=t(i);fetch(i.href,n)}})();class v{constructor(e=0,t=0,r=0){this.data=new Float32Array([e,t,r])}get x(){return this.data[0]}set x(e){this.data[0]=e}get y(){return this.data[1]}set y(e){this.data[1]=e}get z(){return this.data[2]}set z(e){this.data[2]=e}set(e,t,r){return this.data[0]=e,this.data[1]=t,this.data[2]=r,this}copy(e){return this.data[0]=e.data[0],this.data[1]=e.data[1],this.data[2]=e.data[2],this}clone(){return new v(this.x,this.y,this.z)}add(e){return this.data[0]+=e.data[0],this.data[1]+=e.data[1],this.data[2]+=e.data[2],this}sub(e){return this.data[0]-=e.data[0],this.data[1]-=e.data[1],this.data[2]-=e.data[2],this}scale(e){return this.data[0]*=e,this.data[1]*=e,this.data[2]*=e,this}dot(e){return this.data[0]*e.data[0]+this.data[1]*e.data[1]+this.data[2]*e.data[2]}cross(e){const t=this.data[0],r=this.data[1],i=this.data[2],n=e.data[0],o=e.data[1],a=e.data[2];return this.data[0]=r*a-i*o,this.data[1]=i*n-t*a,this.data[2]=t*o-r*n,this}length(){return Math.sqrt(this.dot(this))}lengthSq(){return this.dot(this)}normalize(){const e=this.length();return e>0&&this.scale(1/e),this}static cross(e,t,r=new v){return r.data[0]=e.y*t.z-e.z*t.y,r.data[1]=e.z*t.x-e.x*t.z,r.data[2]=e.x*t.y-e.y*t.x,r}static dot(e,t){return e.x*t.x+e.y*t.y+e.z*t.z}}function ee(s,e){const t=.08333333333333333*s,r=2*e.x,i=2*e.y,n=2*e.z;return new v(t*(i*i+n*n),t*(r*r+n*n),t*(r*r+i*i))}function te(s,e){const t=s/e.length;let r=0,i=0,n=0;for(const o of e){const a=o[0],d=o[1],l=o[2];r+=t*(d*d+l*l),i+=t*(a*a+l*l),n+=t*(a*a+d*d)}return new v(r,i,n)}function re(s,e){const t=.4*s*e*e;return new v(t,t,t)}function A(){return typeof navigator<"u"&&"gpu"in navigator}async function T(){if(!A())throw new Error("WebGPU is not supported in this browser. Use Chrome/Edge 113+ with WebGPU enabled.");const e=await navigator.gpu.requestAdapter({powerPreference:"high-performance"});if(!e)throw new Error("Failed to acquire a WebGPU adapter. Your GPU may not support WebGPU.");const t=e.info||{};console.log("WebGPU Adapter:",{vendor:t.vendor,architecture:t.architecture,device:t.device,description:t.description});const r=[];e.features&&e.features.has&&e.features.has("timestamp-query")&&r.push("timestamp-query");const i=await e.requestDevice({requiredFeatures:r,requiredLimits:{maxStorageBufferBindingSize:e.limits.maxStorageBufferBindingSize,maxBufferSize:e.limits.maxBufferSize,maxComputeWorkgroupsPerDimension:e.limits.maxComputeWorkgroupsPerDimension,maxComputeInvocationsPerWorkgroup:e.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:e.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:e.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:e.limits.maxComputeWorkgroupSizeZ}});return i.lost.then(n=>{console.error("WebGPU device lost:",n.message),n.reason!=="destroyed"&&console.error("Device loss reason:",n.reason)}),i.onuncapturederror=n=>{console.error("WebGPU uncaptured error:",n.error)},{adapter:e,device:i,features:i.features,limits:i.limits}}function b(s,e,t){return s.createShaderModule({label:t||"shader",code:e})}function y(s,e,t,r=!1){return s.createBuffer({label:t||"storage-buffer",size:e,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST,mappedAtCreation:r})}function _(s,e,t){return s.createBuffer({label:t,size:e,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST})}function I(s,e,t){return s.createBuffer({label:t||"staging-buffer",size:e,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST})}function x(s,e,t,r=0){s.queue.writeBuffer(e,r,t)}async function w(s,e,t,r){const i=s.createCommandEncoder();i.copyBufferToBuffer(e,0,t,0,r),s.queue.submit([i.finish()]),await t.mapAsync(GPUMapMode.READ);const n=t.getMappedRange().slice(0);return t.unmap(),n}function M(s,e){return Math.ceil(s/e)*e}function V(s,e){return Math.ceil(s/e)}const W=`// Shared WGSL utilities for WebGPU Physics

// Simulation parameters uniform buffer
struct Params {
  // params1: stiffness, damping, radius, particleCount
  stiffness: f32,
  damping: f32,
  radius: f32,
  particleCount: f32,
  
  // params2: dt, friction, drag, bodyCount  
  dt: f32,
  friction: f32,
  drag: f32,
  bodyCount: f32,
  
  // gravity: x, y, z, 0
  gravity: vec4<f32>,
  
  // boxSize: x, y, z, 0
  boxSize: vec4<f32>,
  
  // gridPos: x, y, z, 0
  gridPos: vec4<f32>,
  
  // gridRes: x, y, z, maxParticlesPerCell
  gridRes: vec4<f32>,
  
  // sphereInteraction: x, y, z, radius
  sphere: vec4<f32>,
  
  // maxVelocity: x, y, z, 0
  maxVelocity: vec4<f32>,
}

// Workgroup size constant
const WORKGROUP_SIZE: u32 = 64u;

// Get grid cell position from world position
fn worldPosToGridPos(particlePos: vec3<f32>, gridPos: vec3<f32>, cellSize: vec3<f32>) -> vec3<i32> {
  return vec3<i32>(floor((particlePos - gridPos) / cellSize));
}

// Convert 3D grid position to linear index
fn gridPosToIndex(gridPos: vec3<i32>, gridRes: vec3<i32>) -> i32 {
  // Clamp to valid range
  let clamped = clamp(gridPos, vec3<i32>(0), gridRes - vec3<i32>(1));
  return clamped.x + clamped.y * gridRes.x + clamped.z * gridRes.x * gridRes.y;
}

// Check if grid position is valid
fn isValidGridPos(gridPos: vec3<i32>, gridRes: vec3<i32>) -> bool {
  return gridPos.x >= 0 && gridPos.x < gridRes.x &&
         gridPos.y >= 0 && gridPos.y < gridRes.y &&
         gridPos.z >= 0 && gridPos.z < gridRes.z;
}

// Quaternion multiplication
fn quatMul(a: vec4<f32>, b: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(
    a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    a.w * b.y + a.y * b.w + a.z * b.x - a.x * b.z,
    a.w * b.z + a.z * b.w + a.x * b.y - a.y * b.x,
    a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
  );
}

// Integrate quaternion with angular velocity
fn quatIntegrate(q: vec4<f32>, w: vec3<f32>, dt: f32) -> vec4<f32> {
  let halfDt = dt * 0.5;
  
  var result = q;
  result.x += halfDt * (w.x * q.w + w.y * q.z - w.z * q.y);
  result.y += halfDt * (w.y * q.w + w.z * q.x - w.x * q.z);
  result.z += halfDt * (w.z * q.w + w.x * q.y - w.y * q.x);
  result.w += halfDt * (-w.x * q.x - w.y * q.y - w.z * q.z);
  
  return normalize(result);
}

// Rotate vector by quaternion
fn quatRotate(v: vec3<f32>, q: vec4<f32>) -> vec3<f32> {
  let ix = q.w * v.x + q.y * v.z - q.z * v.y;
  let iy = q.w * v.y + q.z * v.x - q.x * v.z;
  let iz = q.w * v.z + q.x * v.y - q.y * v.x;
  let iw = -q.x * v.x - q.y * v.y - q.z * v.z;
  
  return vec3<f32>(
    ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
    iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
    iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x
  );
}

// Quaternion to rotation matrix (3x3)
fn quatToMat3(q: vec4<f32>) -> mat3x3<f32> {
  let x = q.x;
  let y = q.y;
  let z = q.z;
  let w = q.w;
  
  let x2 = x + x;
  let y2 = y + y;
  let z2 = z + z;
  
  let xx = x * x2;
  let xy = x * y2;
  let xz = x * z2;
  let yy = y * y2;
  let yz = y * z2;
  let zz = z * z2;
  let wx = w * x2;
  let wy = w * y2;
  let wz = w * z2;
  
  return mat3x3<f32>(
    vec3<f32>(1.0 - (yy + zz), xy + wz, xz - wy),
    vec3<f32>(xy - wz, 1.0 - (xx + zz), yz + wx),
    vec3<f32>(xz + wy, yz - wx, 1.0 - (xx + yy))
  );
}

// Compute world-space inverse inertia tensor
fn invInertiaWorld(q: vec4<f32>, invInertia: vec3<f32>) -> mat3x3<f32> {
  let R = quatToMat3(q);
  let RT = transpose(R);
  
  // Diagonal inverse inertia matrix
  let I = mat3x3<f32>(
    vec3<f32>(invInertia.x, 0.0, 0.0),
    vec3<f32>(0.0, invInertia.y, 0.0),
    vec3<f32>(0.0, 0.0, invInertia.z)
  );
  
  // R^T * I * R
  return RT * I * R;
}

// Cross product
fn cross3(a: vec3<f32>, b: vec3<f32>) -> vec3<f32> {
  return vec3<f32>(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

// Particle contact force calculation (spring-damper model)
fn particleForce(
  stiffness: f32,
  damping: f32,
  friction: f32,
  distance: f32,
  minDistance: f32,
  xi: vec3<f32>,
  xj: vec3<f32>,
  vi: vec3<f32>,
  vj: vec3<f32>
) -> vec3<f32> {
  let rij = xj - xi;
  let len = length(rij);
  
  if (len < 0.0001) {
    return vec3<f32>(0.0);
  }
  
  let rijUnit = rij / len;
  let vij = vj - vi;
  let vijT = vij - dot(vij, rijUnit) * rijUnit;
  
  let springForce = -stiffness * (distance - max(len, minDistance)) * rijUnit;
  let dampingForce = damping * dot(vij, rijUnit) * rijUnit;
  let tangentForce = friction * vijT;
  
  return springForce + dampingForce + tangentForce;
}
`,U=`// Transform local particle positions to world space

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> particleLocalPos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> bodyPos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> bodyQuat: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read_write> particleWorldPos: array<vec4<f32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let particleIndex = id.x;
  
  if (particleIndex >= u32(params.particleCount)) {
    return;
  }
  
  let localPosAndBodyId = particleLocalPos[particleIndex];
  let localPos = localPosAndBodyId.xyz;
  let bodyId = u32(localPosAndBodyId.w);
  
  let bodyPosition = bodyPos[bodyId].xyz;
  let bodyQuaternion = bodyQuat[bodyId];
  
  // Rotate local position by body quaternion and add body position
  let worldPos = bodyPosition + quatRotate(localPos, bodyQuaternion);
  
  particleWorldPos[particleIndex] = vec4<f32>(worldPos, f32(bodyId));
}
`,F=`// Compute relative particle positions (for torque calculation)

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> particleLocalPos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> bodyPos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> bodyQuat: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read_write> particleRelativePos: array<vec4<f32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let particleIndex = id.x;
  
  if (particleIndex >= u32(params.particleCount)) {
    return;
  }
  
  let localPosAndBodyId = particleLocalPos[particleIndex];
  let localPos = localPosAndBodyId.xyz;
  let bodyId = u32(localPosAndBodyId.w);
  
  let bodyQuaternion = bodyQuat[bodyId];
  
  // Relative position = rotated local position (without body position offset)
  let relativePos = quatRotate(localPos, bodyQuaternion);
  
  particleRelativePos[particleIndex] = vec4<f32>(relativePos, f32(bodyId));
}
`,O=`// Derive particle velocities from body velocities

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> particleRelativePos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> bodyVel: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> bodyAngularVel: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read_write> particleVel: array<vec4<f32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let particleIndex = id.x;
  
  if (particleIndex >= u32(params.particleCount)) {
    return;
  }
  
  let relativePosAndBodyId = particleRelativePos[particleIndex];
  let relativePos = relativePosAndBodyId.xyz;
  let bodyId = u32(relativePosAndBodyId.w);
  
  let linearVel = bodyVel[bodyId].xyz;
  let angularVel = bodyAngularVel[bodyId].xyz;
  
  // v_particle = v_body + omega x r
  let vel = linearVel + cross3(angularVel, relativePos);
  
  particleVel[particleIndex] = vec4<f32>(vel, 1.0);
}
`,D=`// Clear the spatial hash grid

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> gridCellCount: array<atomic<u32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  // Calculate linear index from 2D dispatch to support > 65535 workgroups
  // stride (dispatchX * WORKGROUP_SIZE) is stored in params.maxVelocity.w
  let stride = u32(params.maxVelocity.w);
  let cellIndex = id.y * stride + id.x;
  
  let gridRes = vec3<i32>(params.gridRes.xyz);
  let totalCells = u32(gridRes.x * gridRes.y * gridRes.z);
  
  if (cellIndex >= totalCells) {
    return;
  }
  
  atomicStore(&gridCellCount[cellIndex], 0u);
}
`,k=`// Build spatial hash grid from particle positions

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> particleWorldPos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> gridCellCount: array<atomic<u32>>;
@group(0) @binding(3) var<storage, read_write> gridCellParticles: array<u32>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let particleIndex = id.x;
  
  if (particleIndex >= u32(params.particleCount)) {
    return;
  }
  
  let worldPos = particleWorldPos[particleIndex].xyz;
  let cellSize = vec3<f32>(params.radius * 2.0);
  let gridPos = params.gridPos.xyz;
  let gridRes = vec3<i32>(params.gridRes.xyz);
  let maxParticlesPerCell = u32(params.gridRes.w);
  
  // Get grid cell for this particle
  let cellPos = worldPosToGridPos(worldPos, gridPos, cellSize);
  
  // Check if within grid bounds
  if (!isValidGridPos(cellPos, gridRes)) {
    return;
  }
  
  let cellIndex = gridPosToIndex(cellPos, gridRes);
  
  // Atomically increment cell count and get slot
  let slot = atomicAdd(&gridCellCount[u32(cellIndex)], 1u);
  
  // Store particle index if slot available
  if (slot < maxParticlesPerCell) {
    let particleSlotIndex = u32(cellIndex) * maxParticlesPerCell + slot;
    gridCellParticles[particleSlotIndex] = particleIndex + 1u; // Store +1 so 0 means empty
  }
}
`,L=`// Calculate particle collision forces

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> particleWorldPos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> particleRelativePos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> particleVel: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> bodyAngularVel: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read> gridCellCount: array<u32>;
@group(0) @binding(6) var<storage, read> gridCellParticles: array<u32>;
@group(0) @binding(7) var<storage, read_write> particleForceOut: array<vec4<f32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let particleIndex = id.x;
  
  if (particleIndex >= u32(params.particleCount)) {
    return;
  }
  
  let worldPosAndBodyId = particleWorldPos[particleIndex];
  let position = worldPosAndBodyId.xyz;
  let bodyId = u32(worldPosAndBodyId.w);
  
  let velocity = particleVel[particleIndex].xyz;
  let relativePos = particleRelativePos[particleIndex].xyz;
  let angularVel = bodyAngularVel[bodyId].xyz;
  
  let cellSize = vec3<f32>(params.radius * 2.0);
  let gridPos = params.gridPos.xyz;
  let gridRes = vec3<i32>(params.gridRes.xyz);
  let maxParticlesPerCell = u32(params.gridRes.w);
  let radius = params.radius;
  let stiffness = params.stiffness;
  let damping = params.damping;
  let friction = params.friction;
  
  var force = vec3<f32>(0.0);
  
  // Get current particle's grid cell
  let particleGridPos = worldPosToGridPos(position, gridPos, cellSize);
  
  // Check neighboring cells (3x3x3)
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      for (var k = -1; k <= 1; k++) {
        let neighborCellPos = particleGridPos + vec3<i32>(i, j, k);
        
        if (!isValidGridPos(neighborCellPos, gridRes)) {
          continue;
        }
        
        let cellIndex = gridPosToIndex(neighborCellPos, gridRes);
        
        // Check all particles in this cell
        for (var slot = 0u; slot < maxParticlesPerCell; slot++) {
          let particleSlotIndex = u32(cellIndex) * maxParticlesPerCell + slot;
          let neighborIndexPlusOne = gridCellParticles[particleSlotIndex];
          
          if (neighborIndexPlusOne == 0u) {
            continue; // Empty slot
          }
          
          let neighborIndex = neighborIndexPlusOne - 1u;
          
          if (neighborIndex == particleIndex) {
            continue; // Skip self
          }
          
          let neighborPosAndBodyId = particleWorldPos[neighborIndex];
          let neighborPos = neighborPosAndBodyId.xyz;
          let neighborBodyId = u32(neighborPosAndBodyId.w);
          
          if (neighborBodyId == bodyId) {
            continue; // Skip same body
          }
          
          let neighborVel = particleVel[neighborIndex].xyz;
          let neighborRelativePos = particleRelativePos[neighborIndex].xyz;
          let neighborAngularVel = bodyAngularVel[neighborBodyId].xyz;
          
          // Check collision
          let r = position - neighborPos;
          let dist = length(r);
          
          if (dist > 0.0 && dist < radius * 2.0) {
            let dir = normalize(r);
            
            // Compute velocities including angular contribution
            let v = velocity - cross3(relativePos + radius * dir, angularVel);
            let nv = neighborVel - cross3(neighborRelativePos + radius * (-dir), neighborAngularVel);
            
            force += particleForce(stiffness, damping, friction, 2.0 * radius, radius, position, neighborPos, v, nv);
          }
        }
      }
    }
  }
  
  // Ground/boundary collisions
  let boxMin = vec3<f32>(-params.boxSize.x, 0.0, -params.boxSize.z);
  let boxMax = vec3<f32>(params.boxSize.x, params.boxSize.y * 0.5, params.boxSize.z);
  
  // X bounds
  {
    let dir = vec3<f32>(1.0, 0.0, 0.0);
    let v = velocity - cross3(relativePos + radius * dir, angularVel);
    let tangentVel = v - dot(v, dir) * dir;
    let x = position.x - radius;
    if (x < boxMin.x) {
      force += -(stiffness * (x - boxMin.x) * dir + damping * dot(v, dir) * dir);
      force -= friction * tangentVel;
    }
  }
  {
    let dir = vec3<f32>(-1.0, 0.0, 0.0);
    let v = velocity - cross3(relativePos + radius * (-dir), angularVel);
    let tangentVel = v - dot(v, dir) * dir;
    let x = position.x + radius;
    if (x > boxMax.x) {
      force -= -(stiffness * (x - boxMax.x) * dir - damping * dot(v, dir) * dir);
      force -= friction * tangentVel;
    }
  }
  
  // Y bounds (ground)
  {
    let dir = vec3<f32>(0.0, 1.0, 0.0);
    let v = velocity - cross3(relativePos + radius * dir, angularVel);
    let tangentVel = v - dot(v, dir) * dir;
    let y = position.y - radius;
    if (y < boxMin.y) {
      force += -(stiffness * (y - boxMin.y) * dir + damping * dot(v, dir) * dir);
      force -= friction * tangentVel;
    }
  }
  {
    let dir = vec3<f32>(0.0, -1.0, 0.0);
    let v = velocity - cross3(relativePos + radius * (-dir), angularVel);
    let tangentVel = v - dot(v, dir) * dir;
    let y = position.y + radius;
    if (y > boxMax.y) {
      force -= -(stiffness * (y - boxMax.y) * dir - damping * dot(v, dir) * dir);
      force -= friction * tangentVel;
    }
  }
  
  // Z bounds
  {
    let dir = vec3<f32>(0.0, 0.0, 1.0);
    let v = velocity - cross3(relativePos + radius * dir, angularVel);
    let tangentVel = v - dot(v, dir) * dir;
    let z = position.z - radius;
    if (z < boxMin.z) {
      force += -(stiffness * (z - boxMin.z) * dir + damping * dot(v, dir) * dir);
      force -= friction * tangentVel;
    }
  }
  {
    let dir = vec3<f32>(0.0, 0.0, -1.0);
    let v = velocity - cross3(relativePos + radius * (-dir), angularVel);
    let tangentVel = v - dot(v, dir) * dir;
    let z = position.z + radius;
    if (z > boxMax.z) {
      force -= -(stiffness * (z - boxMax.z) * dir - damping * dot(v, dir) * dir);
      force -= friction * tangentVel;
    }
  }
  
  // Interaction sphere collision
  let spherePos = params.sphere.xyz;
  let sphereRadius = params.sphere.w;
  let rSphere = position - spherePos;
  let distSphere = length(rSphere);
  if (distSphere > 0.0 && distSphere < sphereRadius + radius) {
    force += particleForce(stiffness, damping, friction, radius + sphereRadius, sphereRadius, position, spherePos, velocity, vec3<f32>(0.0));
  }
  
  particleForceOut[particleIndex] = vec4<f32>(force, 1.0);
}
`,E=`// Calculate particle collision torques (similar to force but for rotation)

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> particleWorldPos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> particleRelativePos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> particleVel: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> bodyAngularVel: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read> gridCellCount: array<u32>;
@group(0) @binding(6) var<storage, read> gridCellParticles: array<u32>;
@group(0) @binding(7) var<storage, read_write> particleTorqueOut: array<vec4<f32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let particleIndex = id.x;
  
  if (particleIndex >= u32(params.particleCount)) {
    return;
  }
  
  let worldPosAndBodyId = particleWorldPos[particleIndex];
  let position = worldPosAndBodyId.xyz;
  let bodyId = u32(worldPosAndBodyId.w);
  
  let velocity = particleVel[particleIndex].xyz;
  let relativePos = particleRelativePos[particleIndex].xyz;
  let angularVel = bodyAngularVel[bodyId].xyz;
  
  let cellSize = vec3<f32>(params.radius * 2.0);
  let gridPos = params.gridPos.xyz;
  let gridRes = vec3<i32>(params.gridRes.xyz);
  let maxParticlesPerCell = u32(params.gridRes.w);
  let radius = params.radius;
  let stiffness = params.stiffness;
  let damping = params.damping;
  let friction = params.friction;
  
  var torque = vec3<f32>(0.0);
  
  // Get current particle's grid cell
  let particleGridPos = worldPosToGridPos(position, gridPos, cellSize);
  
  // Check neighboring cells (3x3x3) - same logic as update_force
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      for (var k = -1; k <= 1; k++) {
        let neighborCellPos = particleGridPos + vec3<i32>(i, j, k);
        
        if (!isValidGridPos(neighborCellPos, gridRes)) {
          continue;
        }
        
        let cellIndex = gridPosToIndex(neighborCellPos, gridRes);
        
        for (var slot = 0u; slot < maxParticlesPerCell; slot++) {
          let particleSlotIndex = u32(cellIndex) * maxParticlesPerCell + slot;
          let neighborIndexPlusOne = gridCellParticles[particleSlotIndex];
          
          if (neighborIndexPlusOne == 0u) {
            continue;
          }
          
          let neighborIndex = neighborIndexPlusOne - 1u;
          
          if (neighborIndex == particleIndex) {
            continue;
          }
          
          let neighborPosAndBodyId = particleWorldPos[neighborIndex];
          let neighborPos = neighborPosAndBodyId.xyz;
          let neighborBodyId = u32(neighborPosAndBodyId.w);
          
          if (neighborBodyId == bodyId) {
            continue;
          }
          
          let neighborVel = particleVel[neighborIndex].xyz;
          let neighborRelativePos = particleRelativePos[neighborIndex].xyz;
          let neighborAngularVel = bodyAngularVel[neighborBodyId].xyz;
          
          let r = position - neighborPos;
          let dist = length(r);
          
          if (dist > 0.0 && dist < radius * 2.0) {
            let dir = normalize(r);
            let v = velocity - cross3(relativePos + radius * dir, angularVel);
            let nv = neighborVel - cross3(neighborRelativePos + radius * (-dir), neighborAngularVel);
            
            let force = particleForce(stiffness, damping, friction, 2.0 * radius, radius, position, neighborPos, v, nv);
            
            // Torque = r x F (relative position cross force)
            torque += cross3(relativePos, force);
          }
        }
      }
    }
  }
  
  particleTorqueOut[particleIndex] = vec4<f32>(torque, 1.0);
}
`,Q=`// Reduce particle forces to body forces using atomics

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> particleLocalPos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> particleForceBuf: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> bodyForce: array<atomic<u32>>;

// Helper to atomic add f32 by encoding as u32
fn atomicAddF32(ptr: ptr<storage, atomic<u32>, read_write>, value: f32) {
  var old = atomicLoad(ptr);
  loop {
    let newVal = bitcast<u32>(bitcast<f32>(old) + value);
    let result = atomicCompareExchangeWeak(ptr, old, newVal);
    if (result.exchanged) {
      break;
    }
    old = result.old_value;
  }
}

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let particleIndex = id.x;
  
  if (particleIndex >= u32(params.particleCount)) {
    return;
  }
  
  let localPosAndBodyId = particleLocalPos[particleIndex];
  let bodyId = u32(localPosAndBodyId.w);
  
  let force = particleForceBuf[particleIndex].xyz;
  
  // Atomic add force components to body
  // Body force is stored as 4 u32s: (fx, fy, fz, 1) encoded as f32->u32
  let bodyOffset = bodyId * 4u;
  
  atomicAddF32(&bodyForce[bodyOffset + 0u], force.x);
  atomicAddF32(&bodyForce[bodyOffset + 1u], force.y);
  atomicAddF32(&bodyForce[bodyOffset + 2u], force.z);
}
`,j=`// Reduce particle torques to body torques using atomics

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> particleLocalPos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> particleRelativePos: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> particleForceBuf: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> particleTorque: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read_write> bodyTorque: array<atomic<u32>>;

// Helper to atomic add f32 by encoding as u32
fn atomicAddF32Torque(ptr: ptr<storage, atomic<u32>, read_write>, value: f32) {
  var old = atomicLoad(ptr);
  loop {
    let newVal = bitcast<u32>(bitcast<f32>(old) + value);
    let result = atomicCompareExchangeWeak(ptr, old, newVal);
    if (result.exchanged) {
      break;
    }
    old = result.old_value;
  }
}

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let particleIndex = id.x;
  
  if (particleIndex >= u32(params.particleCount)) {
    return;
  }
  
  let localPosAndBodyId = particleLocalPos[particleIndex];
  let bodyId = u32(localPosAndBodyId.w);
  
  let relativePos = particleRelativePos[particleIndex].xyz;
  let force = particleForceBuf[particleIndex].xyz;
  let torqueFromCollision = particleTorque[particleIndex].xyz;
  
  // Total torque = collision torque + r x F
  let totalTorque = torqueFromCollision + cross3(relativePos, force);
  
  // Atomic add torque components to body
  let bodyOffset = bodyId * 4u;
  
  atomicAddF32Torque(&bodyTorque[bodyOffset + 0u], totalTorque.x);
  atomicAddF32Torque(&bodyTorque[bodyOffset + 1u], totalTorque.y);
  atomicAddF32Torque(&bodyTorque[bodyOffset + 2u], totalTorque.z);
}
`,Z=`// Update body linear velocity

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> bodyVelIn: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> bodyForce: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> bodyMass: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read_write> bodyVelOut: array<vec4<f32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let bodyIndex = id.x;
  
  if (bodyIndex >= u32(params.bodyCount)) {
    return;
  }
  
  let velocity = bodyVelIn[bodyIndex].xyz;
  let force = bodyForce[bodyIndex].xyz;
  let massData = bodyMass[bodyIndex];
  let invMass = massData.w; // Inverse mass stored in w component
  
  let dt = params.dt;
  let gravity = params.gravity.xyz;
  let drag = params.drag;
  let maxVel = params.maxVelocity.xyz;
  
  // Skip static bodies (invMass == 0)
  if (invMass == 0.0) {
    bodyVelOut[bodyIndex] = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    return;
  }
  
  // Apply gravity and forces: v += (g + F/m) * dt
  var newVel = velocity + (gravity + force * invMass) * dt;
  
  // Apply drag
  newVel = newVel * (1.0 - drag * dt);
  
  // Clamp velocity
  newVel = clamp(newVel, -maxVel, maxVel);
  
  bodyVelOut[bodyIndex] = vec4<f32>(newVel, 1.0);
}
`,K=`// Update body angular velocity

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> bodyAngVelIn: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> bodyTorque: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> bodyMass: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> bodyQuat: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read_write> bodyAngVelOut: array<vec4<f32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let bodyIndex = id.x;
  
  if (bodyIndex >= u32(params.bodyCount)) {
    return;
  }
  
  let angularVel = bodyAngVelIn[bodyIndex].xyz;
  let torque = bodyTorque[bodyIndex].xyz;
  let massData = bodyMass[bodyIndex];
  let invInertia = massData.xyz; // Inverse inertia stored in xyz
  let invMass = massData.w;
  let quat = bodyQuat[bodyIndex];
  
  let dt = params.dt;
  let drag = params.drag;
  let maxVel = params.maxVelocity.xyz;
  
  // Skip static bodies
  if (invMass == 0.0) {
    bodyAngVelOut[bodyIndex] = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    return;
  }
  
  // Compute world-space inverse inertia tensor
  let invIWorld = invInertiaWorld(quat, invInertia);
  
  // Apply torque: omega += I^-1 * T * dt
  let angularAccel = invIWorld * torque;
  var newAngVel = angularVel + angularAccel * dt;
  
  // Apply drag
  newAngVel = newAngVel * (1.0 - drag * dt);
  
  // Clamp angular velocity
  newAngVel = clamp(newAngVel, -maxVel, maxVel);
  
  bodyAngVelOut[bodyIndex] = vec4<f32>(newAngVel, 1.0);
}
`,Y=`// Update body position

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> bodyPosIn: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> bodyVel: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> bodyPosOut: array<vec4<f32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let bodyIndex = id.x;
  
  if (bodyIndex >= u32(params.bodyCount)) {
    return;
  }
  
  let position = bodyPosIn[bodyIndex].xyz;
  let velocity = bodyVel[bodyIndex].xyz;
  let dt = params.dt;
  
  // Simple Euler integration: x += v * dt
  let newPos = position + velocity * dt;
  
  bodyPosOut[bodyIndex] = vec4<f32>(newPos, 1.0);
}
`,X=`// Update body quaternion

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> bodyQuatIn: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> bodyAngVel: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> bodyQuatOut: array<vec4<f32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let bodyIndex = id.x;
  
  if (bodyIndex >= u32(params.bodyCount)) {
    return;
  }
  
  let quat = bodyQuatIn[bodyIndex];
  let angularVel = bodyAngVel[bodyIndex].xyz;
  let dt = params.dt;
  
  // Integrate quaternion with angular velocity
  let newQuat = quatIntegrate(quat, angularVel, dt);
  
  bodyQuatOut[bodyIndex] = newQuat;
}
`,z=64,G=4;class ie{constructor(e={}){p(this,"ctx");p(this,"device");p(this,"buffers");p(this,"pipelines");p(this,"layouts");p(this,"bindGroups",new Map);p(this,"_bodyCount",0);p(this,"_particleCount",0);p(this,"maxBodies");p(this,"maxParticles");p(this,"params");p(this,"grid");p(this,"time",0);p(this,"fixedTime",0);p(this,"accumulator",0);p(this,"maxSubSteps");p(this,"_interpolationValue",0);p(this,"bufferIndex",0);p(this,"bodyPositions");p(this,"bodyQuaternions");p(this,"bodyMasses");p(this,"particleLocalPositions");p(this,"bodyDataDirty",!0);p(this,"particleDataDirty",!0);p(this,"massDirty",!0);p(this,"interactionSphere",{position:new v(10,1,0),radius:1});p(this,"initPromise");p(this,"initialized",!1);var r,i,n;this.maxBodies=e.maxBodies||64,this.maxParticles=e.maxParticles||256,this.maxSubSteps=e.maxSubSteps||5,this.params={stiffness:e.stiffness??1700,damping:e.damping??6,friction:e.friction??2,drag:e.drag??.1,radius:e.radius??.5,fixedTimeStep:e.fixedTimeStep??1/120,gravity:((r=e.gravity)==null?void 0:r.data)??new Float32Array([0,-9.81,0]),boxSize:((i=e.boxSize)==null?void 0:i.data)??new Float32Array([10,10,10])};const t=e.gridResolution||new v(64,64,64);this.grid={position:((n=e.gridPosition)==null?void 0:n.data)??new Float32Array([0,0,0]),resolution:t.data,maxParticlesPerCell:G},this.bodyPositions=new Float32Array(this.maxBodies*4),this.bodyQuaternions=new Float32Array(this.maxBodies*4),this.bodyMasses=new Float32Array(this.maxBodies*4),this.particleLocalPositions=new Float32Array(this.maxParticles*4);for(let o=0;o<this.maxBodies;o++)this.bodyQuaternions[o*4+3]=1;this.initPromise=this.initialize()}async initialize(){this.ctx=await T(),this.device=this.ctx.device,this.createBuffers(),await this.createPipelines(),this.createBindGroups(),this.initialized=!0}async ready(){await this.initPromise}createBuffers(){const e=this.device,t=this.maxBodies*4*4,r=this.maxParticles*4*4,i=Math.ceil(this.grid.resolution[0])*Math.ceil(this.grid.resolution[1])*Math.ceil(this.grid.resolution[2]),n=Math.ceil(i/z),o=65535;this.gridDispatch={x:Math.min(n,o),y:Math.ceil(n/o),z:1},this.gridStride=this.gridDispatch.x*z;const a=i*4,d=i*G*4;this.buffers={bodyPositionA:y(e,t,"body-position-a"),bodyPositionB:y(e,t,"body-position-b"),bodyQuaternionA:y(e,t,"body-quaternion-a"),bodyQuaternionB:y(e,t,"body-quaternion-b"),bodyVelocityA:y(e,t,"body-velocity-a"),bodyVelocityB:y(e,t,"body-velocity-b"),bodyAngularVelocityA:y(e,t,"body-angular-velocity-a"),bodyAngularVelocityB:y(e,t,"body-angular-velocity-b"),bodyForce:y(e,t,"body-force"),bodyTorque:y(e,t,"body-torque"),bodyMass:y(e,t,"body-mass"),particleLocalPosition:y(e,r,"particle-local-position"),particleRelativePosition:y(e,r,"particle-relative-position"),particleWorldPosition:y(e,r,"particle-world-position"),particleVelocity:y(e,r,"particle-velocity"),particleForce:y(e,r,"particle-force"),particleTorque:y(e,r,"particle-torque"),gridCellCount:y(e,a,"grid-cell-count"),gridCellParticles:y(e,d,"grid-cell-particles"),params:_(e,M(256,256),"params"),stagingPosition:I(e,t,"staging-position"),stagingQuaternion:I(e,t,"staging-quaternion")}}async createPipelines(){const e=this.device,t=d=>W+`
`+d,r=(d,l)=>({binding:d,visibility:GPUShaderStage.COMPUTE,buffer:{type:l}}),i=(d,l)=>e.createBindGroupLayout({label:d,entries:l}),n=(d,l,c)=>e.createComputePipeline({label:d,layout:e.createPipelineLayout({label:`${d}-layout`,bindGroupLayouts:[c]}),compute:{module:l,entryPoint:"main"}}),o={localToWorld:b(e,t(U),"local-to-world"),localToRelative:b(e,t(F),"local-to-relative"),bodyVelToParticleVel:b(e,t(O),"body-vel-to-particle-vel"),clearGrid:b(e,t(D),"clear-grid"),buildGrid:b(e,t(k),"build-grid"),updateForce:b(e,t(L),"update-force"),updateTorque:b(e,t(E),"update-torque"),reduceForce:b(e,t(Q),"reduce-force"),reduceTorque:b(e,t(j),"reduce-torque"),updateBodyVelocity:b(e,t(Z),"update-body-velocity"),updateBodyAngularVelocity:b(e,t(K),"update-body-angular-velocity"),updateBodyPosition:b(e,t(Y),"update-body-position"),updateBodyQuaternion:b(e,t(X),"update-body-quaternion")},a={localToWorld:i("layout/local-to-world",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"read-only-storage"),r(4,"storage")]),localToRelative:i("layout/local-to-relative",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"read-only-storage"),r(4,"storage")]),bodyVelToParticleVel:i("layout/body-vel-to-particle-vel",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"read-only-storage"),r(4,"storage")]),clearGrid:i("layout/clear-grid",[r(0,"uniform"),r(1,"storage")]),buildGrid:i("layout/build-grid",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"storage"),r(3,"storage")]),updateForce:i("layout/update-force",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"read-only-storage"),r(4,"read-only-storage"),r(5,"read-only-storage"),r(6,"read-only-storage"),r(7,"storage")]),updateTorque:i("layout/update-torque",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"read-only-storage"),r(4,"read-only-storage"),r(5,"read-only-storage"),r(6,"read-only-storage"),r(7,"storage")]),reduceForce:i("layout/reduce-force",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"storage")]),reduceTorque:i("layout/reduce-torque",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"read-only-storage"),r(4,"read-only-storage"),r(5,"storage")]),updateBodyVelocity:i("layout/update-body-velocity",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"read-only-storage"),r(4,"storage")]),updateBodyAngularVelocity:i("layout/update-body-angular-velocity",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"read-only-storage"),r(4,"read-only-storage"),r(5,"storage")]),updateBodyPosition:i("layout/update-body-position",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"storage")]),updateBodyQuaternion:i("layout/update-body-quaternion",[r(0,"uniform"),r(1,"read-only-storage"),r(2,"read-only-storage"),r(3,"storage")])};this.layouts=a,this.pipelines={localToWorld:n("local-to-world",o.localToWorld,a.localToWorld),localToRelative:n("local-to-relative",o.localToRelative,a.localToRelative),bodyVelToParticleVel:n("body-vel-to-particle-vel",o.bodyVelToParticleVel,a.bodyVelToParticleVel),clearGrid:n("clear-grid",o.clearGrid,a.clearGrid),buildGrid:n("build-grid",o.buildGrid,a.buildGrid),updateForce:n("update-force",o.updateForce,a.updateForce),updateTorque:n("update-torque",o.updateTorque,a.updateTorque),reduceForce:n("reduce-force",o.reduceForce,a.reduceForce),reduceTorque:n("reduce-torque",o.reduceTorque,a.reduceTorque),updateBodyVelocity:n("update-body-velocity",o.updateBodyVelocity,a.updateBodyVelocity),updateBodyAngularVelocity:n("update-body-angular-velocity",o.updateBodyAngularVelocity,a.updateBodyAngularVelocity),updateBodyPosition:n("update-body-position",o.updateBodyPosition,a.updateBodyPosition),updateBodyQuaternion:n("update-body-quaternion",o.updateBodyQuaternion,a.updateBodyQuaternion)}}createBindGroups(){this.updateBindGroups()}updateBindGroups(){const e=this.device,t=this.buffers,r=this.layouts,i=this.bufferIndex===0?t.bodyPositionA:t.bodyPositionB,n=this.bufferIndex===0?t.bodyPositionB:t.bodyPositionA,o=this.bufferIndex===0?t.bodyQuaternionA:t.bodyQuaternionB,a=this.bufferIndex===0?t.bodyQuaternionB:t.bodyQuaternionA,d=this.bufferIndex===0?t.bodyVelocityA:t.bodyVelocityB,l=this.bufferIndex===0?t.bodyVelocityB:t.bodyVelocityA,c=this.bufferIndex===0?t.bodyAngularVelocityA:t.bodyAngularVelocityB,u=this.bufferIndex===0?t.bodyAngularVelocityB:t.bodyAngularVelocityA;this.bindGroups.set("localToWorld",e.createBindGroup({layout:r.localToWorld,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:t.particleLocalPosition}},{binding:2,resource:{buffer:i}},{binding:3,resource:{buffer:o}},{binding:4,resource:{buffer:t.particleWorldPosition}}]})),this.bindGroups.set("localToRelative",e.createBindGroup({layout:r.localToRelative,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:t.particleLocalPosition}},{binding:2,resource:{buffer:i}},{binding:3,resource:{buffer:o}},{binding:4,resource:{buffer:t.particleRelativePosition}}]})),this.bindGroups.set("bodyVelToParticleVel",e.createBindGroup({layout:r.bodyVelToParticleVel,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:t.particleRelativePosition}},{binding:2,resource:{buffer:d}},{binding:3,resource:{buffer:c}},{binding:4,resource:{buffer:t.particleVelocity}}]})),this.bindGroups.set("clearGrid",e.createBindGroup({layout:r.clearGrid,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:t.gridCellCount}}]})),this.bindGroups.set("buildGrid",e.createBindGroup({layout:r.buildGrid,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:t.particleWorldPosition}},{binding:2,resource:{buffer:t.gridCellCount}},{binding:3,resource:{buffer:t.gridCellParticles}}]})),this.bindGroups.set("updateForce",e.createBindGroup({layout:r.updateForce,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:t.particleWorldPosition}},{binding:2,resource:{buffer:t.particleRelativePosition}},{binding:3,resource:{buffer:t.particleVelocity}},{binding:4,resource:{buffer:c}},{binding:5,resource:{buffer:t.gridCellCount}},{binding:6,resource:{buffer:t.gridCellParticles}},{binding:7,resource:{buffer:t.particleForce}}]})),this.bindGroups.set("updateTorque",e.createBindGroup({layout:r.updateTorque,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:t.particleWorldPosition}},{binding:2,resource:{buffer:t.particleRelativePosition}},{binding:3,resource:{buffer:t.particleVelocity}},{binding:4,resource:{buffer:c}},{binding:5,resource:{buffer:t.gridCellCount}},{binding:6,resource:{buffer:t.gridCellParticles}},{binding:7,resource:{buffer:t.particleTorque}}]})),this.bindGroups.set("reduceForce",e.createBindGroup({layout:r.reduceForce,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:t.particleLocalPosition}},{binding:2,resource:{buffer:t.particleForce}},{binding:3,resource:{buffer:t.bodyForce}}]})),this.bindGroups.set("reduceTorque",e.createBindGroup({layout:r.reduceTorque,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:t.particleLocalPosition}},{binding:2,resource:{buffer:t.particleRelativePosition}},{binding:3,resource:{buffer:t.particleForce}},{binding:4,resource:{buffer:t.particleTorque}},{binding:5,resource:{buffer:t.bodyTorque}}]})),this.bindGroups.set("updateBodyVelocity",e.createBindGroup({layout:r.updateBodyVelocity,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:d}},{binding:2,resource:{buffer:t.bodyForce}},{binding:3,resource:{buffer:t.bodyMass}},{binding:4,resource:{buffer:l}}]})),this.bindGroups.set("updateBodyAngularVelocity",e.createBindGroup({layout:r.updateBodyAngularVelocity,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:c}},{binding:2,resource:{buffer:t.bodyTorque}},{binding:3,resource:{buffer:t.bodyMass}},{binding:4,resource:{buffer:o}},{binding:5,resource:{buffer:u}}]})),this.bindGroups.set("updateBodyPosition",e.createBindGroup({layout:r.updateBodyPosition,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:i}},{binding:2,resource:{buffer:l}},{binding:3,resource:{buffer:n}}]})),this.bindGroups.set("updateBodyQuaternion",e.createBindGroup({layout:r.updateBodyQuaternion,entries:[{binding:0,resource:{buffer:t.params}},{binding:1,resource:{buffer:o}},{binding:2,resource:{buffer:u}},{binding:3,resource:{buffer:a}}]}))}swapBuffers(){this.bufferIndex=1-this.bufferIndex,this.updateBindGroups()}flushData(){this.bodyDataDirty&&(x(this.device,this.buffers.bodyPositionA,this.bodyPositions),x(this.device,this.buffers.bodyPositionB,this.bodyPositions),x(this.device,this.buffers.bodyQuaternionA,this.bodyQuaternions),x(this.device,this.buffers.bodyQuaternionB,this.bodyQuaternions),this.bodyDataDirty=!1),this.particleDataDirty&&(x(this.device,this.buffers.particleLocalPosition,this.particleLocalPositions),this.particleDataDirty=!1),this.massDirty&&(x(this.device,this.buffers.bodyMass,this.bodyMasses),this.massDirty=!1),this.updateParamsBuffer()}updateParamsBuffer(){const e=new Float32Array(32);e[0]=this.params.stiffness,e[1]=this.params.damping,e[2]=this.params.radius,e[3]=this._particleCount,e[4]=this.params.fixedTimeStep,e[5]=this.params.friction,e[6]=this.params.drag,e[7]=this._bodyCount,e[8]=this.params.gravity[0],e[9]=this.params.gravity[1],e[10]=this.params.gravity[2],e[11]=0,e[12]=this.params.boxSize[0],e[13]=this.params.boxSize[1],e[14]=this.params.boxSize[2],e[15]=0,e[16]=this.grid.position[0],e[17]=this.grid.position[1],e[18]=this.grid.position[2],e[19]=0,e[20]=this.grid.resolution[0],e[21]=this.grid.resolution[1],e[22]=this.grid.resolution[2],e[23]=this.grid.maxParticlesPerCell,e[24]=this.interactionSphere.position.x,e[25]=this.interactionSphere.position.y,e[26]=this.interactionSphere.position.z,e[27]=this.interactionSphere.radius;const t=2*this.params.radius/this.params.fixedTimeStep;e[28]=t,e[29]=t,e[30]=t,e[31]=this.gridStride||0,x(this.device,this.buffers.params,e)}addBody(e,t,r,i,n,o,a,d,l,c,u){if(this._bodyCount>=this.maxBodies)return console.warn(`Cannot add body: maximum (${this.maxBodies}) reached`),-1;const h=this._bodyCount,g=h*4;return this.bodyPositions[g]=e,this.bodyPositions[g+1]=t,this.bodyPositions[g+2]=r,this.bodyPositions[g+3]=1,this.bodyQuaternions[g]=i,this.bodyQuaternions[g+1]=n,this.bodyQuaternions[g+2]=o,this.bodyQuaternions[g+3]=a,this.bodyMasses[g]=l>0?1/l:0,this.bodyMasses[g+1]=c>0?1/c:0,this.bodyMasses[g+2]=u>0?1/u:0,this.bodyMasses[g+3]=d>0?1/d:0,this._bodyCount++,this.bodyDataDirty=!0,this.massDirty=!0,h}addParticle(e,t,r,i){if(this._particleCount>=this.maxParticles)return console.warn(`Cannot add particle: maximum (${this.maxParticles}) reached`),-1;const n=this._particleCount,o=n*4;return this.particleLocalPositions[o]=t,this.particleLocalPositions[o+1]=r,this.particleLocalPositions[o+2]=i,this.particleLocalPositions[o+3]=e,this._particleCount++,this.particleDataDirty=!0,n}step(e){if(!this.initialized){console.warn("World not initialized. Call await world.ready() first.");return}this.accumulator+=e;let t=0;for(;this.accumulator>=this.params.fixedTimeStep&&t<this.maxSubSteps;)this.singleStep(),this.accumulator-=this.params.fixedTimeStep,t++;this._interpolationValue=this.accumulator/this.params.fixedTimeStep,this.time+=e}singleStep(){this.flushData();const e=this.device.createCommandEncoder({label:"physics-step"});e.clearBuffer(this.buffers.bodyForce),e.clearBuffer(this.buffers.bodyTorque),e.clearBuffer(this.buffers.gridCellParticles);const t=V(this._particleCount,z),r=V(this._bodyCount,z);{const i=e.beginComputePass({label:"local-to-world"});i.setPipeline(this.pipelines.localToWorld),i.setBindGroup(0,this.bindGroups.get("localToWorld")),i.dispatchWorkgroups(t),i.end()}{const i=e.beginComputePass({label:"local-to-relative"});i.setPipeline(this.pipelines.localToRelative),i.setBindGroup(0,this.bindGroups.get("localToRelative")),i.dispatchWorkgroups(t),i.end()}{const i=e.beginComputePass({label:"body-vel-to-particle-vel"});i.setPipeline(this.pipelines.bodyVelToParticleVel),i.setBindGroup(0,this.bindGroups.get("bodyVelToParticleVel")),i.dispatchWorkgroups(t),i.end()}{const i=e.beginComputePass({label:"clear-grid"});i.setPipeline(this.pipelines.clearGrid),i.setBindGroup(0,this.bindGroups.get("clearGrid")),i.dispatchWorkgroups(this.gridDispatch.x,this.gridDispatch.y,this.gridDispatch.z),i.end()}{const i=e.beginComputePass({label:"build-grid"});i.setPipeline(this.pipelines.buildGrid),i.setBindGroup(0,this.bindGroups.get("buildGrid")),i.dispatchWorkgroups(t),i.end()}{const i=e.beginComputePass({label:"update-force"});i.setPipeline(this.pipelines.updateForce),i.setBindGroup(0,this.bindGroups.get("updateForce")),i.dispatchWorkgroups(t),i.end()}{const i=e.beginComputePass({label:"update-torque"});i.setPipeline(this.pipelines.updateTorque),i.setBindGroup(0,this.bindGroups.get("updateTorque")),i.dispatchWorkgroups(t),i.end()}{const i=e.beginComputePass({label:"reduce-force"});i.setPipeline(this.pipelines.reduceForce),i.setBindGroup(0,this.bindGroups.get("reduceForce")),i.dispatchWorkgroups(t),i.end()}{const i=e.beginComputePass({label:"reduce-torque"});i.setPipeline(this.pipelines.reduceTorque),i.setBindGroup(0,this.bindGroups.get("reduceTorque")),i.dispatchWorkgroups(t),i.end()}{const i=e.beginComputePass({label:"update-body-velocity"});i.setPipeline(this.pipelines.updateBodyVelocity),i.setBindGroup(0,this.bindGroups.get("updateBodyVelocity")),i.dispatchWorkgroups(r),i.end()}{const i=e.beginComputePass({label:"update-body-angular-velocity"});i.setPipeline(this.pipelines.updateBodyAngularVelocity),i.setBindGroup(0,this.bindGroups.get("updateBodyAngularVelocity")),i.dispatchWorkgroups(r),i.end()}{const i=e.beginComputePass({label:"update-body-position"});i.setPipeline(this.pipelines.updateBodyPosition),i.setBindGroup(0,this.bindGroups.get("updateBodyPosition")),i.dispatchWorkgroups(r),i.end()}{const i=e.beginComputePass({label:"update-body-quaternion"});i.setPipeline(this.pipelines.updateBodyQuaternion),i.setBindGroup(0,this.bindGroups.get("updateBodyQuaternion")),i.dispatchWorkgroups(r),i.end()}this.device.queue.submit([e.finish()]),this.swapBuffers(),this.fixedTime+=this.params.fixedTimeStep}get bodyCount(){return this._bodyCount}get particleCount(){return this._particleCount}getParticleWorldPositionBuffer(){return this.buffers.particleWorldPosition}getParticlePositionBuffer(){return this.getParticleWorldPositionBuffer()}getParamsBuffer(){return this.buffers.params}get interpolationValue(){return this._interpolationValue}get stiffness(){return this.params.stiffness}set stiffness(e){this.params.stiffness=e}get damping(){return this.params.damping}set damping(e){this.params.damping=e}get friction(){return this.params.friction}set friction(e){this.params.friction=e}get drag(){return this.params.drag}set drag(e){this.params.drag=e}get radius(){return this.params.radius}set radius(e){this.params.radius=e}get fixedTimeStep(){return this.params.fixedTimeStep}set fixedTimeStep(e){this.params.fixedTimeStep=e}get gravity(){return new v(this.params.gravity[0],this.params.gravity[1],this.params.gravity[2])}set gravity(e){this.params.gravity[0]=e.x,this.params.gravity[1]=e.y,this.params.gravity[2]=e.z}setSpherePosition(e,t,r,i){if(e!==0)throw new Error("Multiple spheres not supported yet");this.interactionSphere.position.set(t,r,i)}getSpherePosition(e,t){if(e!==0)throw new Error("Multiple spheres not supported yet");return t=t||new v,t.copy(this.interactionSphere.position),t}setSphereRadius(e,t){if(e!==0)throw new Error("Multiple spheres not supported yet");this.interactionSphere.radius=t}getSphereRadius(e){if(e!==0)throw new Error("Multiple spheres not supported yet");return this.interactionSphere.radius}async readBodyPositions(){const e=this._bodyCount*4*4,t=this.bufferIndex===0?this.buffers.bodyPositionA:this.buffers.bodyPositionB,r=await w(this.device,t,this.buffers.stagingPosition,e);return new Float32Array(r)}async readBodyQuaternions(){const e=this._bodyCount*4*4,t=this.bufferIndex===0?this.buffers.bodyQuaternionA:this.buffers.bodyQuaternionB,r=await w(this.device,t,this.buffers.stagingQuaternion,e);return new Float32Array(r)}getDevice(){return this.device}getBodyPositionBuffer(){return this.bufferIndex===0?this.buffers.bodyPositionA:this.buffers.bodyPositionB}getBodyQuaternionBuffer(){return this.bufferIndex===0?this.buffers.bodyQuaternionA:this.buffers.bodyQuaternionB}destroy(){this.initialized&&(Object.values(this.buffers).forEach(e=>{e&&typeof e.destroy=="function"&&e.destroy()}),this.bindGroups.clear(),this.initialized=!1)}}function N(){const s=new Float32Array([-1,-1,1,0,0,1,1,-1,1,0,0,1,1,1,1,0,0,1,-1,1,1,0,0,1,1,-1,-1,0,0,-1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,1,-1,0,0,-1,-1,1,1,0,1,0,1,1,1,0,1,0,1,1,-1,0,1,0,-1,1,-1,0,1,0,-1,-1,-1,0,-1,0,1,-1,-1,0,-1,0,1,-1,1,0,-1,0,-1,-1,1,0,-1,0,1,-1,1,1,0,0,1,-1,-1,1,0,0,1,1,-1,1,0,0,1,1,1,1,0,0,-1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,1,-1,0,0,-1,1,-1,-1,0,0]),e=new Uint16Array([0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23]);return{vertices:s,indices:e}}function H(s=1,e=16,t=12){const r=[],i=[];for(let o=0;o<=t;o++)for(let a=0;a<=e;a++){const d=a/e,l=o/t,c=d*Math.PI*2,u=l*Math.PI,h=-s*Math.sin(u)*Math.cos(c),g=s*Math.cos(u),P=s*Math.sin(u)*Math.sin(c),m=h/s,f=g/s,B=P/s;r.push(h,g,P,m,f,B)}const n=e+1;for(let o=0;o<t;o++)for(let a=0;a<e;a++){const d=o*n+a,l=o*n+a+1,c=(o+1)*n+a,u=(o+1)*n+a+1;o!==0&&i.push(d,u,l),o!==t-1&&i.push(d,c,u)}return{vertices:new Float32Array(r),indices:new Uint16Array(i)}}function ne(s=16){const e=[],t=[];e.push(0,1,0,0,1,0);for(let n=0;n<s;n++){const o=n/s*Math.PI*2,a=Math.sin(o),d=Math.cos(o);e.push(a,1,d,0,1,0)}for(let n=0;n<s;n++)t.push(0,n+1,(n+1)%s+1);const r=e.length/6;e.push(0,-1,0,0,-1,0);for(let n=0;n<s;n++){const o=n/s*Math.PI*2,a=Math.sin(o),d=Math.cos(o);e.push(a,-1,d,0,-1,0)}for(let n=0;n<s;n++)t.push(r,r+(n+1)%s+1,r+n+1);const i=e.length/6;for(let n=0;n<=s;n++){const o=n/s*Math.PI*2,a=Math.sin(o),d=Math.cos(o);e.push(a,1,d,a,0,d),e.push(a,-1,d,a,0,d)}for(let n=0;n<s;n++){const o=i+n*2,a=i+n*2+1,d=i+(n+1)*2,l=i+(n+1)*2+1;t.push(o,a,l),t.push(o,l,d)}return{vertices:new Float32Array(e),indices:new Uint16Array(t)}}function $(s){return{I:[[-1.5,.5,.5],[-.5,.5,.5],[.5,.5,.5],[1.5,.5,.5]],J:[[-1.5,1.5,.5],[-1.5,.5,.5],[-.5,.5,.5],[.5,.5,.5]],L:[[1.5,1.5,.5],[1.5,.5,.5],[.5,.5,.5],[-.5,.5,.5]],O:[[-.5,1.5,.5],[.5,1.5,.5],[-.5,.5,.5],[.5,.5,.5]],S:[[.5,1.5,.5],[-.5,1.5,.5],[-.5,.5,.5],[-1.5,.5,.5]],T:[[-.5,1.5,.5],[-1.5,.5,.5],[-.5,.5,.5],[.5,.5,.5]],Z:[[-1.5,1.5,.5],[-.5,1.5,.5],[-.5,.5,.5],[.5,.5,.5]]}[s]}function oe(s){const e=$(s);if(!e)throw new Error("Unknown tetris type");const t=N(),r=t.vertices.length/6,i=r*4,n=new Float32Array(i*6),o=t.indices.length,a=new Uint16Array(o*4);let d=0,l=0,c=0;for(let u of e)d+=u[0],l+=u[1],c+=u[2];d/=4,l/=4,c/=4;for(let u=0;u<4;u++){const h=e[u],g=(h[0]-d)*1,P=(h[1]-l)*1,m=(h[2]-c)*1;for(let f=0;f<r;f++){let B=t.vertices[f*6+0]*.5,C=t.vertices[f*6+1]*.5,q=t.vertices[f*6+2]*.5;n[(u*r+f)*6+0]=B+g,n[(u*r+f)*6+1]=C+P,n[(u*r+f)*6+2]=q+m,n[(u*r+f)*6+3]=t.vertices[f*6+3],n[(u*r+f)*6+4]=t.vertices[f*6+4],n[(u*r+f)*6+5]=t.vertices[f*6+5]}for(let f=0;f<o;f++)a[u*o+f]=t.indices[f]+u*r}return{vertices:n,indices:a}}class ae{constructor(e){this.device=e;const{vertices:t,indices:r}=H(1,8,6);this.vertexBuffer=e.createBuffer({size:t.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),e.queue.writeBuffer(this.vertexBuffer,0,t),this.indexBuffer=e.createBuffer({size:r.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST}),e.queue.writeBuffer(this.indexBuffer,0,r),this.indexCount=r.length,this.uniformBuffer=e.createBuffer({size:256,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const n=e.createShaderModule({code:`
      struct Uniforms {
        viewProj: mat4x4<f32>,
        radius: f32,
        pad0: vec3<f32>,
      };
      @group(0) @binding(0) var<uniform> uniforms: Uniforms;
      @group(0) @binding(1) var<storage, read> positions: array<vec4<f32>>;

      struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) normal: vec3<f32>,
        @location(1) @interpolate(flat) bodyId: u32,
      };

      @vertex
      fn vs_main(
        @location(0) localPos: vec3<f32>,
        @location(1) normal: vec3<f32>,
        @builtin(instance_index) instanceId: u32
      ) -> VertexOutput {
        let p = positions[instanceId];
        let worldPos = p.xyz + localPos * uniforms.radius;
        var out: VertexOutput;
        out.position = uniforms.viewProj * vec4(worldPos, 1.0);
        out.normal = normal;
        out.bodyId = u32(p.w);
        return out;
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

      @fragment
      fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
        let lightDir = vec3(0.0, 1.0, 0.0); // Straight down
        let ambient = 0.3;
        let diffuse = max(dot(in.normal, lightDir), 0.0);
        let hue = f32(in.bodyId % 16u) / 16.0;
        let color = hsvToRgb(hue, 0.6, 0.95);
        let lighting = ambient + diffuse * 1.0;
        return vec4(color * lighting, 1.0);
      }
    `}),o=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}}]});this.pipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[o]}),vertex:{module:n,entryPoint:"vs_main",buffers:[{arrayStride:24,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"}]}]},fragment:{module:n,entryPoint:"fs_main",targets:[{format:navigator.gpu.getPreferredCanvasFormat()}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less"}}),this.bindGroup=null}updateBindGroup(e){this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:{buffer:e}}]})}updateViewProj(e,t){const r=new Float32Array(20);r.set(e,0),r[16]=t,this.device.queue.writeBuffer(this.uniformBuffer,0,r)}record(e,t){this.bindGroup&&(e.setPipeline(this.pipeline),e.setBindGroup(0,this.bindGroup),e.setVertexBuffer(0,this.vertexBuffer),e.setIndexBuffer(this.indexBuffer,"uint16"),e.drawIndexed(this.indexCount,t))}}class se{constructor(e,t,r={}){this.device=e,this.format=t||navigator.gpu.getPreferredCanvasFormat();const i=r.size||40,n=r.height||0,o=new Float32Array([-i,n,-i,i,n,-i,i,n,i,-i,n,i]),a=new Uint16Array([0,2,1,0,3,2]);this.vertexBuffer=e.createBuffer({size:o.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),e.queue.writeBuffer(this.vertexBuffer,0,o),this.indexBuffer=e.createBuffer({size:a.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST}),e.queue.writeBuffer(this.indexBuffer,0,a),this.indexCount=a.length,this.uniformBuffer=e.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const l=e.createShaderModule({code:`
      struct Uniforms {
        viewProj: mat4x4<f32>,
        planeHeight: f32,
        gridSize: f32,
        lineWidth: f32,
        pad: f32,
      };
      @group(0) @binding(0) var<uniform> uniforms: Uniforms;

      struct VSOut {
        @builtin(position) position: vec4<f32>,
        @location(0) worldPos: vec3<f32>,
      };

      @vertex
      fn vs_main(@location(0) pos: vec3<f32>) -> VSOut {
        var out: VSOut;
        out.worldPos = pos;
        out.position = uniforms.viewProj * vec4(pos, 1.0);
        return out;
      }

      fn gridMask(p: vec3<f32>, grid: f32, width: f32) -> f32 {
        let gx = abs(fract(p.x / grid) - 0.5) * grid;
        let gz = abs(fract(p.z / grid) - 0.5) * grid;
        let d = min(gx, gz);
        return smoothstep(width, width * 0.2, d);
      }

      @fragment
      fn fs_main(in: VSOut) -> @location(0) vec4<f32> {
        let line = 1.0 - gridMask(in.worldPos, uniforms.gridSize, uniforms.lineWidth);
        let base = vec3(0.08, 0.09, 0.1);
        let color = mix(base, vec3(0.35, 0.4, 0.45), line);
        return vec4(color, 1.0);
      }
    `}),c=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}}]});this.pipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[c]}),vertex:{module:l,entryPoint:"vs_main",buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]}]},fragment:{module:l,entryPoint:"fs_main",targets:[{format:this.format}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{format:"depth24plus",depthWriteEnabled:!1,depthCompare:"less-equal"}}),this.bindGroup=e.createBindGroup({layout:c,entries:[{binding:0,resource:{buffer:this.uniformBuffer}}]})}update(e,{gridSize:t=1,lineWidth:r=.04,height:i=0}={}){const n=new Float32Array(20);n.set(e,0),n[16]=i,n[17]=t,n[18]=r,n[19]=0,this.device.queue.writeBuffer(this.uniformBuffer,0,n)}record(e){e.setPipeline(this.pipeline),e.setBindGroup(0,this.bindGroup),e.setVertexBuffer(0,this.vertexBuffer),e.setIndexBuffer(this.indexBuffer,"uint16"),e.drawIndexed(this.indexCount,1)}}class de{constructor(e,t={}){this.canvas=e,this.target=t.target||[0,.5,0],this.radius=t.radius||14,this.minRadius=t.minRadius||2,this.maxRadius=t.maxRadius||200,this.theta=t.theta||0,this.phi=t.phi||Math.PI/4,this.rotateSpeed=t.rotateSpeed||.005,this.zoomSpeed=t.zoomSpeed||.0015,this.panSpeed=t.panSpeed||.001,this._dragging=!1,this._dragButton=0,this._last=[0,0],this._initEvents()}_initEvents(){this.canvas.addEventListener("pointerdown",e=>{this._dragging=!0,this._dragButton=e.button,this._last=[e.clientX,e.clientY],this.canvas.setPointerCapture(e.pointerId),e.preventDefault()}),this.canvas.addEventListener("contextmenu",e=>{e.preventDefault()}),this.canvas.addEventListener("pointerup",e=>{this._dragging=!1,this.canvas.releasePointerCapture(e.pointerId)}),this.canvas.addEventListener("pointermove",e=>{if(!this._dragging)return;const t=e.clientX-this._last[0],r=e.clientY-this._last[1];if(this._last=[e.clientX,e.clientY],this._dragButton===0){this.theta-=t*this.rotateSpeed,this.phi-=r*this.rotateSpeed;const i=.001;this.phi=Math.max(i,Math.min(Math.PI-i,this.phi))}else(this._dragButton===1||this._dragButton===2)&&this.pan(-t,r)}),this.canvas.addEventListener("wheel",e=>{e.preventDefault();const t=Math.exp(e.deltaY*this.zoomSpeed);this.radius=Math.min(this.maxRadius,Math.max(this.minRadius,this.radius*t))},{passive:!1})}pan(e,t){const r=Math.sin(this.phi)*Math.sin(this.theta),i=Math.cos(this.phi),n=Math.sin(this.phi)*Math.cos(this.theta),o=[r,i,n],a=[0,1,0];let d=a[1]*o[2]-a[2]*o[1],l=a[2]*o[0]-a[0]*o[2],c=a[0]*o[1]-a[1]*o[0];const u=Math.hypot(d,l,c);u>1e-4&&(d/=u,l/=u,c/=u);let h=o[1]*c-o[2]*l,g=o[2]*d-o[0]*c,P=o[0]*l-o[1]*d;const m=this.panSpeed*this.radius;this.target[0]+=(d*e+h*t)*m,this.target[1]+=(l*e+g*t)*m,this.target[2]+=(c*e+P*t)*m}getViewProj(e){const t=Math.PI/4,r=.1,i=200,n=1/Math.tan(t/2),o=new Float32Array([n/e,0,0,0,0,n,0,0,0,0,i/(r-i),-1,0,0,i*r/(r-i),0]),a=Math.sin(this.phi)*Math.sin(this.theta)*this.radius+this.target[0],d=Math.cos(this.phi)*this.radius+this.target[1],l=Math.sin(this.phi)*Math.cos(this.theta)*this.radius+this.target[2],c=[a,d,l],u=this.lookAt(c,this.target,[0,1,0]);return this.multiplyMat4ColumnMajor(u,o)}lookAt(e,t,r){const i=this.normalize([e[0]-t[0],e[1]-t[1],e[2]-t[2]]),n=this.normalize(this.cross(r,i)),o=this.cross(i,n);return new Float32Array([n[0],o[0],i[0],0,n[1],o[1],i[1],0,n[2],o[2],i[2],0,-this.dot(n,e),-this.dot(o,e),-this.dot(i,e),1])}normalize(e){const t=Math.hypot(e[0],e[1],e[2]);return t>0?[e[0]/t,e[1]/t,e[2]/t]:[0,0,0]}cross(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}dot(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}multiplyMat4ColumnMajor(e,t){const r=new Float32Array(16);for(let i=0;i<4;i++)for(let n=0;n<4;n++)r[i+n*4]=e[0+n*4]*t[i+0*4]+e[1+n*4]*t[i+1*4]+e[2+n*4]*t[i+2*4]+e[3+n*4]*t[i+3*4];return r}}export{se as G,de as O,ae as P,v as V,ie as W,N as a,ne as b,ee as c,H as d,oe as e,te as f,re as g,$ as h};

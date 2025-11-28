var A = Object.defineProperty;
var S = (u, e, t) => e in u ? A(u, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : u[e] = t;
var l = (u, e, t) => S(u, typeof e != "symbol" ? e + "" : e, t);
class h {
  constructor(e = 0, t = 0, i = 0) {
    this.data = new Float32Array([e, t, i]);
  }
  get x() {
    return this.data[0];
  }
  set x(e) {
    this.data[0] = e;
  }
  get y() {
    return this.data[1];
  }
  set y(e) {
    this.data[1] = e;
  }
  get z() {
    return this.data[2];
  }
  set z(e) {
    this.data[2] = e;
  }
  set(e, t, i) {
    return this.data[0] = e, this.data[1] = t, this.data[2] = i, this;
  }
  copy(e) {
    return this.data[0] = e.data[0], this.data[1] = e.data[1], this.data[2] = e.data[2], this;
  }
  clone() {
    return new h(this.x, this.y, this.z);
  }
  add(e) {
    return this.data[0] += e.data[0], this.data[1] += e.data[1], this.data[2] += e.data[2], this;
  }
  sub(e) {
    return this.data[0] -= e.data[0], this.data[1] -= e.data[1], this.data[2] -= e.data[2], this;
  }
  scale(e) {
    return this.data[0] *= e, this.data[1] *= e, this.data[2] *= e, this;
  }
  dot(e) {
    return this.data[0] * e.data[0] + this.data[1] * e.data[1] + this.data[2] * e.data[2];
  }
  cross(e) {
    const t = this.data[0], i = this.data[1], n = this.data[2], a = e.data[0], r = e.data[1], o = e.data[2];
    return this.data[0] = i * o - n * r, this.data[1] = n * a - t * o, this.data[2] = t * r - i * a, this;
  }
  length() {
    return Math.sqrt(this.dot(this));
  }
  lengthSq() {
    return this.dot(this);
  }
  normalize() {
    const e = this.length();
    return e > 0 && this.scale(1 / e), this;
  }
  static cross(e, t, i = new h()) {
    return i.data[0] = e.y * t.z - e.z * t.y, i.data[1] = e.z * t.x - e.x * t.z, i.data[2] = e.x * t.y - e.y * t.x, i;
  }
  static dot(e, t) {
    return e.x * t.x + e.y * t.y + e.z * t.z;
  }
}
class G {
  constructor(e = 0, t = 0, i = 0, n = 0) {
    this.data = new Float32Array([e, t, i, n]);
  }
  get x() {
    return this.data[0];
  }
  set x(e) {
    this.data[0] = e;
  }
  get y() {
    return this.data[1];
  }
  set y(e) {
    this.data[1] = e;
  }
  get z() {
    return this.data[2];
  }
  set z(e) {
    this.data[2] = e;
  }
  get w() {
    return this.data[3];
  }
  set w(e) {
    this.data[3] = e;
  }
  set(e, t, i, n) {
    return this.data[0] = e, this.data[1] = t, this.data[2] = i, this.data[3] = n, this;
  }
  copy(e) {
    return this.data[0] = e.data[0], this.data[1] = e.data[1], this.data[2] = e.data[2], this.data[3] = e.data[3], this;
  }
  clone() {
    return new G(this.x, this.y, this.z, this.w);
  }
}
class w {
  constructor(e = 0, t = 0, i = 0, n = 1) {
    this.data = new Float32Array([e, t, i, n]);
  }
  get x() {
    return this.data[0];
  }
  set x(e) {
    this.data[0] = e;
  }
  get y() {
    return this.data[1];
  }
  set y(e) {
    this.data[1] = e;
  }
  get z() {
    return this.data[2];
  }
  set z(e) {
    this.data[2] = e;
  }
  get w() {
    return this.data[3];
  }
  set w(e) {
    this.data[3] = e;
  }
  set(e, t, i, n) {
    return this.data[0] = e, this.data[1] = t, this.data[2] = i, this.data[3] = n, this;
  }
  copy(e) {
    return this.data[0] = e.data[0], this.data[1] = e.data[1], this.data[2] = e.data[2], this.data[3] = e.data[3], this;
  }
  clone() {
    return new w(this.x, this.y, this.z, this.w);
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  normalize() {
    const e = this.length();
    if (e > 0) {
      const t = 1 / e;
      this.data[0] *= t, this.data[1] *= t, this.data[2] *= t, this.data[3] *= t;
    }
    return this;
  }
  integrate(e, t) {
    const i = t * 0.5, n = e.x, a = e.y, r = e.z;
    return this.data[0] += i * (n * this.w + a * this.z - r * this.y), this.data[1] += i * (a * this.w + r * this.x - n * this.z), this.data[2] += i * (r * this.w + n * this.y - a * this.x), this.data[3] += i * (-n * this.x - a * this.y - r * this.z), this.normalize();
  }
  applyToVec3(e, t = new h()) {
    const i = e.x, n = e.y, a = e.z, r = this.x, o = this.y, s = this.z, d = this.w, p = d * i + o * a - s * n, g = d * n + s * i - r * a, b = d * a + r * n - o * i, c = -r * i - o * n - s * a;
    return t.data[0] = p * d + c * -r + g * -s - b * -o, t.data[1] = g * d + c * -o + b * -r - p * -s, t.data[2] = b * d + c * -s + p * -o - g * -r, t;
  }
  setFromAxisAngle(e, t) {
    const i = t * 0.5, n = Math.sin(i);
    return this.data[0] = e.x * n, this.data[1] = e.y * n, this.data[2] = e.z * n, this.data[3] = Math.cos(i), this;
  }
  multiply(e) {
    const t = this.x, i = this.y, n = this.z, a = this.w, r = e.x, o = e.y, s = e.z, d = e.w;
    return this.data[0] = t * d + a * r + i * s - n * o, this.data[1] = i * d + a * o + n * r - t * s, this.data[2] = n * d + a * s + t * o - i * r, this.data[3] = a * d - t * r - i * o - n * s, this;
  }
  static slerp(e, t, i, n = new w()) {
    let a = e.x * t.x + e.y * t.y + e.z * t.z + e.w * t.w, r = t.x, o = t.y, s = t.z, d = t.w;
    if (a < 0 && (r = -r, o = -o, s = -s, d = -d, a = -a), a > 0.9995)
      return n.data[0] = e.x + i * (r - e.x), n.data[1] = e.y + i * (o - e.y), n.data[2] = e.z + i * (s - e.z), n.data[3] = e.w + i * (d - e.w), n.normalize();
    const p = Math.acos(a), g = p * i, b = Math.sin(g), c = Math.sin(p), v = Math.cos(g) - a * b / c, m = b / c;
    return n.data[0] = e.x * v + r * m, n.data[1] = e.y * v + o * m, n.data[2] = e.z * v + s * m, n.data[3] = e.w * v + d * m, n;
  }
}
class R {
  constructor() {
    this.data = new Float32Array(9), this.identity();
  }
  identity() {
    return this.data.fill(0), this.data[0] = 1, this.data[4] = 1, this.data[8] = 1, this;
  }
  fromQuat(e) {
    const t = e.x, i = e.y, n = e.z, a = e.w, r = t + t, o = i + i, s = n + n, d = t * r, p = t * o, g = t * s, b = i * o, c = i * s, v = n * s, m = a * r, I = a * o, B = a * s;
    return this.data[0] = 1 - (b + v), this.data[1] = p + B, this.data[2] = g - I, this.data[3] = p - B, this.data[4] = 1 - (d + v), this.data[5] = c + m, this.data[6] = g + I, this.data[7] = c - m, this.data[8] = 1 - (d + b), this;
  }
  transpose() {
    const e = this.data;
    let t;
    return t = e[1], e[1] = e[3], e[3] = t, t = e[2], e[2] = e[6], e[6] = t, t = e[5], e[5] = e[7], e[7] = t, this;
  }
  multiply(e) {
    const t = this.data, i = [...t], n = e.data;
    return t[0] = i[0] * n[0] + i[3] * n[1] + i[6] * n[2], t[1] = i[1] * n[0] + i[4] * n[1] + i[7] * n[2], t[2] = i[2] * n[0] + i[5] * n[1] + i[8] * n[2], t[3] = i[0] * n[3] + i[3] * n[4] + i[6] * n[5], t[4] = i[1] * n[3] + i[4] * n[4] + i[7] * n[5], t[5] = i[2] * n[3] + i[5] * n[4] + i[8] * n[5], t[6] = i[0] * n[6] + i[3] * n[7] + i[6] * n[8], t[7] = i[1] * n[6] + i[4] * n[7] + i[7] * n[8], t[8] = i[2] * n[6] + i[5] * n[7] + i[8] * n[8], this;
  }
  applyToVec3(e, t = new h()) {
    const i = this.data, n = e.x, a = e.y, r = e.z;
    return t.data[0] = i[0] * n + i[3] * a + i[6] * r, t.data[1] = i[1] * n + i[4] * a + i[7] * r, t.data[2] = i[2] * n + i[5] * a + i[8] * r, t;
  }
  setDiagonal(e) {
    return this.data.fill(0), this.data[0] = e.x, this.data[4] = e.y, this.data[8] = e.z, this;
  }
  clone() {
    const e = new R();
    return e.data.set(this.data), e;
  }
}
function T() {
  return typeof navigator < "u" && "gpu" in navigator;
}
async function W() {
  if (!T())
    throw new Error("WebGPU is not supported in this browser. Use Chrome/Edge 113+ with WebGPU enabled.");
  const e = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  if (!e)
    throw new Error("Failed to acquire a WebGPU adapter. Your GPU may not support WebGPU.");
  const t = e.info || {};
  console.log("WebGPU Adapter:", {
    vendor: t.vendor,
    architecture: t.architecture,
    device: t.device,
    description: t.description
  });
  const i = [];
  e.features && e.features.has && e.features.has("timestamp-query") && i.push("timestamp-query");
  const n = await e.requestDevice({
    requiredFeatures: i,
    requiredLimits: {
      maxStorageBufferBindingSize: e.limits.maxStorageBufferBindingSize,
      maxComputeWorkgroupsPerDimension: e.limits.maxComputeWorkgroupsPerDimension,
      maxComputeInvocationsPerWorkgroup: e.limits.maxComputeInvocationsPerWorkgroup,
      maxComputeWorkgroupSizeX: e.limits.maxComputeWorkgroupSizeX,
      maxComputeWorkgroupSizeY: e.limits.maxComputeWorkgroupSizeY,
      maxComputeWorkgroupSizeZ: e.limits.maxComputeWorkgroupSizeZ
    }
  });
  return n.lost.then((a) => {
    console.error("WebGPU device lost:", a.message), a.reason !== "destroyed" && console.error("Device loss reason:", a.reason);
  }), n.onuncapturederror = (a) => {
    console.error("WebGPU uncaptured error:", a.error);
  }, {
    adapter: e,
    device: n,
    features: n.features,
    limits: n.limits
  };
}
function f(u, e, t) {
  return u.createShaderModule({
    label: t || "shader",
    code: e
  });
}
function y(u, e, t, i = !1) {
  return u.createBuffer({
    label: t || "storage-buffer",
    size: e,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    mappedAtCreation: i
  });
}
function _(u, e, t) {
  return u.createBuffer({
    label: t,
    size: e,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
}
function V(u, e, t) {
  return u.createBuffer({
    label: t || "staging-buffer",
    size: e,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
  });
}
function x(u, e, t, i = 0) {
  u.queue.writeBuffer(e, i, t);
}
async function q(u, e, t, i) {
  const n = u.createCommandEncoder();
  n.copyBufferToBuffer(e, 0, t, 0, i), u.queue.submit([n.finish()]), await t.mapAsync(GPUMapMode.READ);
  const a = t.getMappedRange().slice(0);
  return t.unmap(), a;
}
function F(u, e) {
  return Math.ceil(u / e) * e;
}
function P(u, e) {
  return Math.ceil(u / e);
}
const M = `// Shared WGSL utilities for WebGPU Physics

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
`, O = `// Transform local particle positions to world space

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
`, k = `// Compute relative particle positions (for torque calculation)

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
`, U = `// Derive particle velocities from body velocities

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
`, D = `// Clear the spatial hash grid

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> gridCellCount: array<atomic<u32>>;

@compute @workgroup_size(WORKGROUP_SIZE)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let cellIndex = id.x;
  let gridRes = vec3<i32>(params.gridRes.xyz);
  let totalCells = u32(gridRes.x * gridRes.y * gridRes.z);
  
  if (cellIndex >= totalCells) {
    return;
  }
  
  atomicStore(&gridCellCount[cellIndex], 0u);
}
`, Q = `// Build spatial hash grid from particle positions

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
`, E = `// Calculate particle collision forces

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
`, L = `// Calculate particle collision torques (similar to force but for rotation)

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
`, j = `// Reduce particle forces to body forces using atomics

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
`, Z = `// Reduce particle torques to body torques using atomics

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
`, K = `// Update body linear velocity

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
`, Y = `// Update body angular velocity

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
`, X = `// Update body position

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
`, $ = `// Update body quaternion

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
`, z = 64, C = 4;
class N {
  constructor(e = {}) {
    // WebGPU context
    l(this, "ctx");
    l(this, "device");
    // Buffers
    l(this, "buffers");
    l(this, "pipelines");
    l(this, "layouts");
    l(this, "bindGroups", /* @__PURE__ */ new Map());
    // Simulation state
    l(this, "_bodyCount", 0);
    l(this, "_particleCount", 0);
    l(this, "maxBodies");
    l(this, "maxParticles");
    // Simulation parameters
    l(this, "params");
    l(this, "grid");
    // Timing
    l(this, "time", 0);
    l(this, "fixedTime", 0);
    l(this, "accumulator", 0);
    l(this, "maxSubSteps");
    l(this, "_interpolationValue", 0);
    // Double-buffer state (which buffer is current)
    l(this, "bufferIndex", 0);
    // CPU-side data for initialization
    l(this, "bodyPositions");
    l(this, "bodyQuaternions");
    l(this, "bodyMasses");
    l(this, "particleLocalPositions");
    // Dirty flags for CPU->GPU sync
    l(this, "bodyDataDirty", !0);
    l(this, "particleDataDirty", !0);
    l(this, "massDirty", !0);
    // Sphere interaction
    l(this, "interactionSphere", {
      position: new h(10, 1, 0),
      radius: 1
    });
    // Initialization promise
    l(this, "initPromise");
    l(this, "initialized", !1);
    var i, n, a;
    this.maxBodies = e.maxBodies || 64, this.maxParticles = e.maxParticles || 256, this.maxSubSteps = e.maxSubSteps || 5, this.params = {
      stiffness: e.stiffness ?? 1700,
      damping: e.damping ?? 6,
      friction: e.friction ?? 2,
      drag: e.drag ?? 0.1,
      radius: e.radius ?? 0.5,
      fixedTimeStep: e.fixedTimeStep ?? 1 / 120,
      gravity: ((i = e.gravity) == null ? void 0 : i.data) ?? new Float32Array([0, -9.81, 0]),
      boxSize: ((n = e.boxSize) == null ? void 0 : n.data) ?? new Float32Array([10, 10, 10])
    };
    const t = e.gridResolution || new h(64, 64, 64);
    this.grid = {
      position: ((a = e.gridPosition) == null ? void 0 : a.data) ?? new Float32Array([0, 0, 0]),
      resolution: t.data,
      maxParticlesPerCell: C
    }, this.bodyPositions = new Float32Array(this.maxBodies * 4), this.bodyQuaternions = new Float32Array(this.maxBodies * 4), this.bodyMasses = new Float32Array(this.maxBodies * 4), this.particleLocalPositions = new Float32Array(this.maxParticles * 4);
    for (let r = 0; r < this.maxBodies; r++)
      this.bodyQuaternions[r * 4 + 3] = 1;
    this.initPromise = this.initialize();
  }
  /**
   * Initialize WebGPU resources
   */
  async initialize() {
    this.ctx = await W(), this.device = this.ctx.device, this.createBuffers(), await this.createPipelines(), this.createBindGroups(), this.initialized = !0;
  }
  /**
   * Wait for initialization to complete
   */
  async ready() {
    await this.initPromise;
  }
  /**
   * Create all GPU buffers
   */
  createBuffers() {
    const e = this.device, t = this.maxBodies * 4 * 4, i = this.maxParticles * 4 * 4, n = Math.ceil(this.grid.resolution[0]) * Math.ceil(this.grid.resolution[1]) * Math.ceil(this.grid.resolution[2]), a = n * 4, r = n * C * 4;
    this.buffers = {
      // Body buffers (double-buffered)
      bodyPositionA: y(e, t, "body-position-a"),
      bodyPositionB: y(e, t, "body-position-b"),
      bodyQuaternionA: y(e, t, "body-quaternion-a"),
      bodyQuaternionB: y(e, t, "body-quaternion-b"),
      bodyVelocityA: y(e, t, "body-velocity-a"),
      bodyVelocityB: y(e, t, "body-velocity-b"),
      bodyAngularVelocityA: y(e, t, "body-angular-velocity-a"),
      bodyAngularVelocityB: y(e, t, "body-angular-velocity-b"),
      bodyForce: y(e, t, "body-force"),
      bodyTorque: y(e, t, "body-torque"),
      bodyMass: y(e, t, "body-mass"),
      // Particle buffers
      particleLocalPosition: y(e, i, "particle-local-position"),
      particleRelativePosition: y(e, i, "particle-relative-position"),
      particleWorldPosition: y(e, i, "particle-world-position"),
      particleVelocity: y(e, i, "particle-velocity"),
      particleForce: y(e, i, "particle-force"),
      particleTorque: y(e, i, "particle-torque"),
      // Broadphase grid
      gridCellCount: y(e, a, "grid-cell-count"),
      gridCellParticles: y(e, r, "grid-cell-particles"),
      // Uniform params buffer (aligned to 256 bytes for uniform binding)
      params: _(e, F(256, 256), "params"),
      // Staging buffers for CPU readback
      stagingPosition: V(e, t, "staging-position"),
      stagingQuaternion: V(e, t, "staging-quaternion")
    };
  }
  /**
   * Create compute pipelines
   */
  async createPipelines() {
    const e = this.device, t = (s) => M + `
` + s, i = (s, d) => ({
      binding: s,
      visibility: GPUShaderStage.COMPUTE,
      buffer: { type: d }
    }), n = (s, d) => e.createBindGroupLayout({ label: s, entries: d }), a = (s, d, p) => e.createComputePipeline({
      label: s,
      layout: e.createPipelineLayout({
        label: `${s}-layout`,
        bindGroupLayouts: [p]
      }),
      compute: {
        module: d,
        entryPoint: "main"
      }
    }), r = {
      localToWorld: f(e, t(O), "local-to-world"),
      localToRelative: f(e, t(k), "local-to-relative"),
      bodyVelToParticleVel: f(e, t(U), "body-vel-to-particle-vel"),
      clearGrid: f(e, t(D), "clear-grid"),
      buildGrid: f(e, t(Q), "build-grid"),
      updateForce: f(e, t(E), "update-force"),
      updateTorque: f(e, t(L), "update-torque"),
      reduceForce: f(e, t(j), "reduce-force"),
      reduceTorque: f(e, t(Z), "reduce-torque"),
      updateBodyVelocity: f(e, t(K), "update-body-velocity"),
      updateBodyAngularVelocity: f(e, t(Y), "update-body-angular-velocity"),
      updateBodyPosition: f(e, t(X), "update-body-position"),
      updateBodyQuaternion: f(e, t($), "update-body-quaternion")
    }, o = {
      localToWorld: n("layout/local-to-world", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "read-only-storage"),
        i(4, "storage")
      ]),
      localToRelative: n("layout/local-to-relative", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "read-only-storage"),
        i(4, "storage")
      ]),
      bodyVelToParticleVel: n("layout/body-vel-to-particle-vel", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "read-only-storage"),
        i(4, "storage")
      ]),
      clearGrid: n("layout/clear-grid", [
        i(0, "uniform"),
        i(1, "storage")
      ]),
      buildGrid: n("layout/build-grid", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "storage"),
        i(3, "storage")
      ]),
      updateForce: n("layout/update-force", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "read-only-storage"),
        i(4, "read-only-storage"),
        i(5, "read-only-storage"),
        i(6, "read-only-storage"),
        i(7, "storage")
      ]),
      updateTorque: n("layout/update-torque", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "read-only-storage"),
        i(4, "read-only-storage"),
        i(5, "read-only-storage"),
        i(6, "read-only-storage"),
        i(7, "storage")
      ]),
      reduceForce: n("layout/reduce-force", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "storage")
      ]),
      reduceTorque: n("layout/reduce-torque", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "read-only-storage"),
        i(4, "read-only-storage"),
        i(5, "storage")
      ]),
      updateBodyVelocity: n("layout/update-body-velocity", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "read-only-storage"),
        i(4, "storage")
      ]),
      updateBodyAngularVelocity: n("layout/update-body-angular-velocity", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "read-only-storage"),
        i(4, "read-only-storage"),
        i(5, "storage")
      ]),
      updateBodyPosition: n("layout/update-body-position", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "storage")
      ]),
      updateBodyQuaternion: n("layout/update-body-quaternion", [
        i(0, "uniform"),
        i(1, "read-only-storage"),
        i(2, "read-only-storage"),
        i(3, "storage")
      ])
    };
    this.layouts = o, this.pipelines = {
      localToWorld: a("local-to-world", r.localToWorld, o.localToWorld),
      localToRelative: a("local-to-relative", r.localToRelative, o.localToRelative),
      bodyVelToParticleVel: a("body-vel-to-particle-vel", r.bodyVelToParticleVel, o.bodyVelToParticleVel),
      clearGrid: a("clear-grid", r.clearGrid, o.clearGrid),
      buildGrid: a("build-grid", r.buildGrid, o.buildGrid),
      updateForce: a("update-force", r.updateForce, o.updateForce),
      updateTorque: a("update-torque", r.updateTorque, o.updateTorque),
      reduceForce: a("reduce-force", r.reduceForce, o.reduceForce),
      reduceTorque: a("reduce-torque", r.reduceTorque, o.reduceTorque),
      updateBodyVelocity: a("update-body-velocity", r.updateBodyVelocity, o.updateBodyVelocity),
      updateBodyAngularVelocity: a("update-body-angular-velocity", r.updateBodyAngularVelocity, o.updateBodyAngularVelocity),
      updateBodyPosition: a("update-body-position", r.updateBodyPosition, o.updateBodyPosition),
      updateBodyQuaternion: a("update-body-quaternion", r.updateBodyQuaternion, o.updateBodyQuaternion)
    };
  }
  /**
   * Create bind groups for each pipeline
   */
  createBindGroups() {
    this.updateBindGroups();
  }
  /**
   * Update bind groups after buffer swap
   */
  updateBindGroups() {
    const e = this.device, t = this.buffers, i = this.layouts, n = this.bufferIndex === 0 ? t.bodyPositionA : t.bodyPositionB, a = this.bufferIndex === 0 ? t.bodyPositionB : t.bodyPositionA, r = this.bufferIndex === 0 ? t.bodyQuaternionA : t.bodyQuaternionB, o = this.bufferIndex === 0 ? t.bodyQuaternionB : t.bodyQuaternionA, s = this.bufferIndex === 0 ? t.bodyVelocityA : t.bodyVelocityB, d = this.bufferIndex === 0 ? t.bodyVelocityB : t.bodyVelocityA, p = this.bufferIndex === 0 ? t.bodyAngularVelocityA : t.bodyAngularVelocityB, g = this.bufferIndex === 0 ? t.bodyAngularVelocityB : t.bodyAngularVelocityA;
    this.bindGroups.set("localToWorld", e.createBindGroup({
      layout: i.localToWorld,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: t.particleLocalPosition } },
        { binding: 2, resource: { buffer: n } },
        { binding: 3, resource: { buffer: r } },
        { binding: 4, resource: { buffer: t.particleWorldPosition } }
      ]
    })), this.bindGroups.set("localToRelative", e.createBindGroup({
      layout: i.localToRelative,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: t.particleLocalPosition } },
        { binding: 2, resource: { buffer: n } },
        { binding: 3, resource: { buffer: r } },
        { binding: 4, resource: { buffer: t.particleRelativePosition } }
      ]
    })), this.bindGroups.set("bodyVelToParticleVel", e.createBindGroup({
      layout: i.bodyVelToParticleVel,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: t.particleRelativePosition } },
        { binding: 2, resource: { buffer: s } },
        { binding: 3, resource: { buffer: p } },
        { binding: 4, resource: { buffer: t.particleVelocity } }
      ]
    })), this.bindGroups.set("clearGrid", e.createBindGroup({
      layout: i.clearGrid,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: t.gridCellCount } }
      ]
    })), this.bindGroups.set("buildGrid", e.createBindGroup({
      layout: i.buildGrid,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: t.particleWorldPosition } },
        { binding: 2, resource: { buffer: t.gridCellCount } },
        { binding: 3, resource: { buffer: t.gridCellParticles } }
      ]
    })), this.bindGroups.set("updateForce", e.createBindGroup({
      layout: i.updateForce,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: t.particleWorldPosition } },
        { binding: 2, resource: { buffer: t.particleRelativePosition } },
        { binding: 3, resource: { buffer: t.particleVelocity } },
        { binding: 4, resource: { buffer: p } },
        { binding: 5, resource: { buffer: t.gridCellCount } },
        { binding: 6, resource: { buffer: t.gridCellParticles } },
        { binding: 7, resource: { buffer: t.particleForce } }
      ]
    })), this.bindGroups.set("updateTorque", e.createBindGroup({
      layout: i.updateTorque,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: t.particleWorldPosition } },
        { binding: 2, resource: { buffer: t.particleRelativePosition } },
        { binding: 3, resource: { buffer: t.particleVelocity } },
        { binding: 4, resource: { buffer: p } },
        { binding: 5, resource: { buffer: t.gridCellCount } },
        { binding: 6, resource: { buffer: t.gridCellParticles } },
        { binding: 7, resource: { buffer: t.particleTorque } }
      ]
    })), this.bindGroups.set("reduceForce", e.createBindGroup({
      layout: i.reduceForce,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: t.particleLocalPosition } },
        { binding: 2, resource: { buffer: t.particleForce } },
        { binding: 3, resource: { buffer: t.bodyForce } }
      ]
    })), this.bindGroups.set("reduceTorque", e.createBindGroup({
      layout: i.reduceTorque,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: t.particleLocalPosition } },
        { binding: 2, resource: { buffer: t.particleRelativePosition } },
        { binding: 3, resource: { buffer: t.particleForce } },
        { binding: 4, resource: { buffer: t.particleTorque } },
        { binding: 5, resource: { buffer: t.bodyTorque } }
      ]
    })), this.bindGroups.set("updateBodyVelocity", e.createBindGroup({
      layout: i.updateBodyVelocity,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: s } },
        { binding: 2, resource: { buffer: t.bodyForce } },
        { binding: 3, resource: { buffer: t.bodyMass } },
        { binding: 4, resource: { buffer: d } }
      ]
    })), this.bindGroups.set("updateBodyAngularVelocity", e.createBindGroup({
      layout: i.updateBodyAngularVelocity,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: p } },
        { binding: 2, resource: { buffer: t.bodyTorque } },
        { binding: 3, resource: { buffer: t.bodyMass } },
        { binding: 4, resource: { buffer: r } },
        { binding: 5, resource: { buffer: g } }
      ]
    })), this.bindGroups.set("updateBodyPosition", e.createBindGroup({
      layout: i.updateBodyPosition,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: n } },
        { binding: 2, resource: { buffer: d } },
        // Use updated velocity
        { binding: 3, resource: { buffer: a } }
      ]
    })), this.bindGroups.set("updateBodyQuaternion", e.createBindGroup({
      layout: i.updateBodyQuaternion,
      entries: [
        { binding: 0, resource: { buffer: t.params } },
        { binding: 1, resource: { buffer: r } },
        { binding: 2, resource: { buffer: g } },
        // Use updated angular velocity
        { binding: 3, resource: { buffer: o } }
      ]
    }));
  }
  /**
   * Swap double-buffered resources
   */
  swapBuffers() {
    this.bufferIndex = 1 - this.bufferIndex, this.updateBindGroups();
  }
  /**
   * Sync CPU data to GPU
   */
  flushData() {
    this.bodyDataDirty && (x(this.device, this.buffers.bodyPositionA, this.bodyPositions), x(this.device, this.buffers.bodyPositionB, this.bodyPositions), x(this.device, this.buffers.bodyQuaternionA, this.bodyQuaternions), x(this.device, this.buffers.bodyQuaternionB, this.bodyQuaternions), this.bodyDataDirty = !1), this.particleDataDirty && (x(this.device, this.buffers.particleLocalPosition, this.particleLocalPositions), this.particleDataDirty = !1), this.massDirty && (x(this.device, this.buffers.bodyMass, this.bodyMasses), this.massDirty = !1), this.updateParamsBuffer();
  }
  /**
   * Update the params uniform buffer
   */
  updateParamsBuffer() {
    const e = new Float32Array(32);
    e[0] = this.params.stiffness, e[1] = this.params.damping, e[2] = this.params.radius, e[3] = this._particleCount, e[4] = this.params.fixedTimeStep, e[5] = this.params.friction, e[6] = this.params.drag, e[7] = this._bodyCount, e[8] = this.params.gravity[0], e[9] = this.params.gravity[1], e[10] = this.params.gravity[2], e[11] = 0, e[12] = this.params.boxSize[0], e[13] = this.params.boxSize[1], e[14] = this.params.boxSize[2], e[15] = 0, e[16] = this.grid.position[0], e[17] = this.grid.position[1], e[18] = this.grid.position[2], e[19] = 0, e[20] = this.grid.resolution[0], e[21] = this.grid.resolution[1], e[22] = this.grid.resolution[2], e[23] = this.grid.maxParticlesPerCell, e[24] = this.interactionSphere.position.x, e[25] = this.interactionSphere.position.y, e[26] = this.interactionSphere.position.z, e[27] = this.interactionSphere.radius;
    const t = 2 * this.params.radius / this.params.fixedTimeStep;
    e[28] = t, e[29] = t, e[30] = t, e[31] = 0, x(this.device, this.buffers.params, e);
  }
  /**
   * Add a rigid body to the simulation
   */
  addBody(e, t, i, n, a, r, o, s, d, p, g) {
    if (this._bodyCount >= this.maxBodies)
      return console.warn(`Cannot add body: maximum (${this.maxBodies}) reached`), -1;
    const b = this._bodyCount, c = b * 4;
    return this.bodyPositions[c] = e, this.bodyPositions[c + 1] = t, this.bodyPositions[c + 2] = i, this.bodyPositions[c + 3] = 1, this.bodyQuaternions[c] = n, this.bodyQuaternions[c + 1] = a, this.bodyQuaternions[c + 2] = r, this.bodyQuaternions[c + 3] = o, this.bodyMasses[c] = d > 0 ? 1 / d : 0, this.bodyMasses[c + 1] = p > 0 ? 1 / p : 0, this.bodyMasses[c + 2] = g > 0 ? 1 / g : 0, this.bodyMasses[c + 3] = s > 0 ? 1 / s : 0, this._bodyCount++, this.bodyDataDirty = !0, this.massDirty = !0, b;
  }
  /**
   * Add a collision particle to a body
   */
  addParticle(e, t, i, n) {
    if (this._particleCount >= this.maxParticles)
      return console.warn(`Cannot add particle: maximum (${this.maxParticles}) reached`), -1;
    const a = this._particleCount, r = a * 4;
    return this.particleLocalPositions[r] = t, this.particleLocalPositions[r + 1] = i, this.particleLocalPositions[r + 2] = n, this.particleLocalPositions[r + 3] = e, this._particleCount++, this.particleDataDirty = !0, a;
  }
  /**
   * Step the simulation forward by deltaTime
   */
  step(e) {
    if (!this.initialized) {
      console.warn("World not initialized. Call await world.ready() first.");
      return;
    }
    this.accumulator += e;
    let t = 0;
    for (; this.accumulator >= this.params.fixedTimeStep && t < this.maxSubSteps; )
      this.singleStep(), this.accumulator -= this.params.fixedTimeStep, t++;
    this._interpolationValue = this.accumulator / this.params.fixedTimeStep, this.time += e;
  }
  /**
   * Execute a single physics step
   */
  singleStep() {
    this.flushData();
    const e = this.device.createCommandEncoder({ label: "physics-step" });
    e.clearBuffer(this.buffers.bodyForce), e.clearBuffer(this.buffers.bodyTorque), e.clearBuffer(this.buffers.gridCellParticles);
    const t = P(this._particleCount, z), i = P(this._bodyCount, z), n = Math.ceil(this.grid.resolution[0]) * Math.ceil(this.grid.resolution[1]) * Math.ceil(this.grid.resolution[2]), a = P(n, z);
    {
      const r = e.beginComputePass({ label: "local-to-world" });
      r.setPipeline(this.pipelines.localToWorld), r.setBindGroup(0, this.bindGroups.get("localToWorld")), r.dispatchWorkgroups(t), r.end();
    }
    {
      const r = e.beginComputePass({ label: "local-to-relative" });
      r.setPipeline(this.pipelines.localToRelative), r.setBindGroup(0, this.bindGroups.get("localToRelative")), r.dispatchWorkgroups(t), r.end();
    }
    {
      const r = e.beginComputePass({ label: "body-vel-to-particle-vel" });
      r.setPipeline(this.pipelines.bodyVelToParticleVel), r.setBindGroup(0, this.bindGroups.get("bodyVelToParticleVel")), r.dispatchWorkgroups(t), r.end();
    }
    {
      const r = e.beginComputePass({ label: "clear-grid" });
      r.setPipeline(this.pipelines.clearGrid), r.setBindGroup(0, this.bindGroups.get("clearGrid")), r.dispatchWorkgroups(a), r.end();
    }
    {
      const r = e.beginComputePass({ label: "build-grid" });
      r.setPipeline(this.pipelines.buildGrid), r.setBindGroup(0, this.bindGroups.get("buildGrid")), r.dispatchWorkgroups(t), r.end();
    }
    {
      const r = e.beginComputePass({ label: "update-force" });
      r.setPipeline(this.pipelines.updateForce), r.setBindGroup(0, this.bindGroups.get("updateForce")), r.dispatchWorkgroups(t), r.end();
    }
    {
      const r = e.beginComputePass({ label: "update-torque" });
      r.setPipeline(this.pipelines.updateTorque), r.setBindGroup(0, this.bindGroups.get("updateTorque")), r.dispatchWorkgroups(t), r.end();
    }
    {
      const r = e.beginComputePass({ label: "reduce-force" });
      r.setPipeline(this.pipelines.reduceForce), r.setBindGroup(0, this.bindGroups.get("reduceForce")), r.dispatchWorkgroups(t), r.end();
    }
    {
      const r = e.beginComputePass({ label: "reduce-torque" });
      r.setPipeline(this.pipelines.reduceTorque), r.setBindGroup(0, this.bindGroups.get("reduceTorque")), r.dispatchWorkgroups(t), r.end();
    }
    {
      const r = e.beginComputePass({ label: "update-body-velocity" });
      r.setPipeline(this.pipelines.updateBodyVelocity), r.setBindGroup(0, this.bindGroups.get("updateBodyVelocity")), r.dispatchWorkgroups(i), r.end();
    }
    {
      const r = e.beginComputePass({ label: "update-body-angular-velocity" });
      r.setPipeline(this.pipelines.updateBodyAngularVelocity), r.setBindGroup(0, this.bindGroups.get("updateBodyAngularVelocity")), r.dispatchWorkgroups(i), r.end();
    }
    {
      const r = e.beginComputePass({ label: "update-body-position" });
      r.setPipeline(this.pipelines.updateBodyPosition), r.setBindGroup(0, this.bindGroups.get("updateBodyPosition")), r.dispatchWorkgroups(i), r.end();
    }
    {
      const r = e.beginComputePass({ label: "update-body-quaternion" });
      r.setPipeline(this.pipelines.updateBodyQuaternion), r.setBindGroup(0, this.bindGroups.get("updateBodyQuaternion")), r.dispatchWorkgroups(i), r.end();
    }
    this.device.queue.submit([e.finish()]), this.swapBuffers(), this.fixedTime += this.params.fixedTimeStep;
  }
  // Property getters and setters
  get bodyCount() {
    return this._bodyCount;
  }
  get particleCount() {
    return this._particleCount;
  }
  /**
   * Expose GPU buffers for rendering
   */
  getParticleWorldPositionBuffer() {
    return this.buffers.particleWorldPosition;
  }
  // Backward/compat alias
  getParticlePositionBuffer() {
    return this.getParticleWorldPositionBuffer();
  }
  getParamsBuffer() {
    return this.buffers.params;
  }
  get interpolationValue() {
    return this._interpolationValue;
  }
  get stiffness() {
    return this.params.stiffness;
  }
  set stiffness(e) {
    this.params.stiffness = e;
  }
  get damping() {
    return this.params.damping;
  }
  set damping(e) {
    this.params.damping = e;
  }
  get friction() {
    return this.params.friction;
  }
  set friction(e) {
    this.params.friction = e;
  }
  get drag() {
    return this.params.drag;
  }
  set drag(e) {
    this.params.drag = e;
  }
  get radius() {
    return this.params.radius;
  }
  set radius(e) {
    this.params.radius = e;
  }
  get fixedTimeStep() {
    return this.params.fixedTimeStep;
  }
  set fixedTimeStep(e) {
    this.params.fixedTimeStep = e;
  }
  get gravity() {
    return new h(this.params.gravity[0], this.params.gravity[1], this.params.gravity[2]);
  }
  set gravity(e) {
    this.params.gravity[0] = e.x, this.params.gravity[1] = e.y, this.params.gravity[2] = e.z;
  }
  /**
   * Set interaction sphere position
   */
  setSpherePosition(e, t, i, n) {
    if (e !== 0) throw new Error("Multiple spheres not supported yet");
    this.interactionSphere.position.set(t, i, n);
  }
  /**
   * Get interaction sphere position
   */
  getSpherePosition(e, t) {
    if (e !== 0) throw new Error("Multiple spheres not supported yet");
    return t = t || new h(), t.copy(this.interactionSphere.position), t;
  }
  /**
   * Set interaction sphere radius
   */
  setSphereRadius(e, t) {
    if (e !== 0) throw new Error("Multiple spheres not supported yet");
    this.interactionSphere.radius = t;
  }
  /**
   * Get interaction sphere radius
   */
  getSphereRadius(e) {
    if (e !== 0) throw new Error("Multiple spheres not supported yet");
    return this.interactionSphere.radius;
  }
  /**
   * Read body positions from GPU (async)
   */
  async readBodyPositions() {
    const e = this._bodyCount * 4 * 4, t = this.bufferIndex === 0 ? this.buffers.bodyPositionA : this.buffers.bodyPositionB, i = await q(this.device, t, this.buffers.stagingPosition, e);
    return new Float32Array(i);
  }
  /**
   * Read body quaternions from GPU (async)
   */
  async readBodyQuaternions() {
    const e = this._bodyCount * 4 * 4, t = this.bufferIndex === 0 ? this.buffers.bodyQuaternionA : this.buffers.bodyQuaternionB, i = await q(this.device, t, this.buffers.stagingQuaternion, e);
    return new Float32Array(i);
  }
  /**
   * Get the WebGPU device (for rendering integration)
   */
  getDevice() {
    return this.device;
  }
  /**
   * Get body position buffer for rendering
   */
  getBodyPositionBuffer() {
    return this.bufferIndex === 0 ? this.buffers.bodyPositionA : this.buffers.bodyPositionB;
  }
  /**
   * Get body quaternion buffer for rendering  
   */
  getBodyQuaternionBuffer() {
    return this.bufferIndex === 0 ? this.buffers.bodyQuaternionA : this.buffers.bodyQuaternionB;
  }
  /**
   * Destroy all GPU resources
   */
  destroy() {
    this.initialized && (Object.values(this.buffers).forEach((e) => {
      e && typeof e.destroy == "function" && e.destroy();
    }), this.bindGroups.clear(), this.initialized = !1);
  }
}
const J = "1.0.0";
export {
  R as Mat3,
  w as Quat,
  J as VERSION,
  h as Vec3,
  G as Vec4,
  N as World,
  W as initWebGPU,
  T as isWebGPUSupported
};
//# sourceMappingURL=webgpu-physics.js.map

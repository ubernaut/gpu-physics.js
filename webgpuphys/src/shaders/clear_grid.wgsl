// Clear the spatial hash grid

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

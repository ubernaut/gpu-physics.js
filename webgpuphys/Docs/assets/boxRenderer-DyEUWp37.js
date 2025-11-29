class l{constructor(e,t){this.device=e,this.canvas=t,this.context=t.getContext("webgpu"),this.format=navigator.gpu.getPreferredCanvasFormat(),this.context.configure({device:e,format:this.format,alphaMode:"premultiplied"});const{vertices:o,indices:r}=this.createBoxGeometry();this.vertexBuffer=e.createBuffer({size:o.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),e.queue.writeBuffer(this.vertexBuffer,0,o),this.indexBuffer=e.createBuffer({size:r.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST}),e.queue.writeBuffer(this.indexBuffer,0,r),this.indexCount=r.length,this.uniformBuffer=e.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const n=e.createShaderModule({code:`
      struct Uniforms {
        viewProj: mat4x4<f32>,
        scale: vec3<f32>,
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
        
        let worldPos = bodyPos + quatRotate(bodyQuat, localPos * uniforms.scale * 0.5);
        let worldNormal = quatRotate(bodyQuat, normal);
        
        var out: VertexOutput;
        out.position = uniforms.viewProj * vec4(worldPos, 1.0);
        out.normal = worldNormal;
        out.instanceId = instanceId;
        return out;
      }

      @fragment
      fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
        let lightDir = vec3(0.0, 1.0, 0.0); // Straight down
        let ambient = 0.3;
        let diffuse = max(dot(in.normal, lightDir), 0.0);
        let hue = f32(in.instanceId % 12u) / 12.0;
        let color = hsvToRgb(hue, 0.7, 0.9);
        let lighting = ambient + diffuse * 1.0;
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
    `}),a=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}}]});this.pipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[a]}),vertex:{module:n,entryPoint:"vs_main",buffers:[{arrayStride:24,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"}]}]},fragment:{module:n,entryPoint:"fs_main",targets:[{format:this.format}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less"}}),this.bindGroup=null}updateBindGroup(e,t){this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:{buffer:e}},{binding:2,resource:{buffer:t}}]})}render(e,{viewProj:t,scale:o=[1,1,1],drawExtras:r}={}){if(!this.bindGroup)return;const i=this.canvas.width/this.canvas.height,n=t||this.createViewProjMatrix(i),a=new Float32Array(20);a.set(n,0),a.set(o,16),this.device.queue.writeBuffer(this.uniformBuffer,0,a);const u=this.device.createTexture({size:[this.canvas.width,this.canvas.height],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),c=this.device.createCommandEncoder(),s=c.beginRenderPass({colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:.07,g:.07,b:.1,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:u.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}});s.setPipeline(this.pipeline),s.setBindGroup(0,this.bindGroup),s.setVertexBuffer(0,this.vertexBuffer),s.setIndexBuffer(this.indexBuffer,"uint16"),s.drawIndexed(this.indexCount,e),r&&r(s),s.end(),this.device.queue.submit([c.finish()]),u.destroy()}createViewProjMatrix(e){const t=Math.PI/4,o=.1,r=100,i=1/Math.tan(t/2),n=new Float32Array([i/e,0,0,0,0,i,0,0,0,0,r/(o-r),-1,0,0,r*o/(o-r),0]),a=[0,6,16],u=[0,.5,0],c=[0,1,0],s=this.lookAt(a,u,c);return this.multiplyMat4ColumnMajor(n,s)}lookAt(e,t,o){const r=this.normalize([e[0]-t[0],e[1]-t[1],e[2]-t[2]]),i=this.normalize(this.cross(o,r)),n=this.cross(r,i);return new Float32Array([i[0],n[0],r[0],0,i[1],n[1],r[1],0,i[2],n[2],r[2],0,-this.dot(i,e),-this.dot(n,e),-this.dot(r,e),1])}normalize(e){const t=Math.hypot(e[0],e[1],e[2]);return t>0?[e[0]/t,e[1]/t,e[2]/t]:[0,0,0]}cross(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}dot(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}multiplyMat4ColumnMajor(e,t){const o=new Float32Array(16);for(let r=0;r<4;r++)for(let i=0;i<4;i++)o[r+i*4]=e[0+i*4]*t[r+0*4]+e[1+i*4]*t[r+1*4]+e[2+i*4]*t[r+2*4]+e[3+i*4]*t[r+3*4];return o}createBoxGeometry(){const e=new Float32Array([-1,-1,1,0,0,1,1,-1,1,0,0,1,1,1,1,0,0,1,-1,1,1,0,0,1,1,-1,-1,0,0,-1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,1,-1,0,0,-1,-1,1,1,0,1,0,1,1,1,0,1,0,1,1,-1,0,1,0,-1,1,-1,0,1,0,-1,-1,-1,0,-1,0,1,-1,-1,0,-1,0,1,-1,1,0,-1,0,-1,-1,1,0,-1,0,1,-1,1,1,0,0,1,-1,-1,1,0,0,1,1,-1,1,0,0,1,1,1,1,0,0,-1,-1,-1,-1,0,0,-1,-1,1,-1,0,0,-1,1,1,-1,0,0,-1,1,-1,-1,0,0]),t=new Uint16Array([0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23]);return{vertices:e,indices:t}}}export{l as B};

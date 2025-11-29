import{V as O,W as we,P as Pe,G as ve,a as Be,b as Se,d as he,e as Ce,O as Me,f as de,g as ze,h as Te}from"./orbitControls-DtLyUrbL.js";class Q{constructor(i,B,e){this.device=i,this.format=e||navigator.gpu.getPreferredCanvasFormat(),this.vertexBuffer=i.createBuffer({size:B.vertices.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),i.queue.writeBuffer(this.vertexBuffer,0,B.vertices),this.indexBuffer=i.createBuffer({size:B.indices.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST}),i.queue.writeBuffer(this.indexBuffer,0,B.indices),this.indexCount=B.indices.length,this.uniformBuffer=i.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const q=i.createShaderModule({code:`
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
        
        // Apply scale then rotate then translate
        let scaledPos = localPos * uniforms.scale;
        let worldPos = bodyPos + quatRotate(bodyQuat, scaledPos);
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
    `}),F=i.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}}]});this.pipeline=i.createRenderPipeline({layout:i.createPipelineLayout({bindGroupLayouts:[F]}),vertex:{module:q,entryPoint:"vs_main",buffers:[{arrayStride:24,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"}]}]},fragment:{module:q,entryPoint:"fs_main",targets:[{format:this.format}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less"}}),this.bindGroup=null}updateBindGroup(i,B){this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:{buffer:i}},{binding:2,resource:{buffer:B}}]})}record(i,B,e=0,{viewProj:t,scale:q=[1,1,1]}={}){this.bindGroup&&(i.setPipeline(this.pipeline),i.setBindGroup(0,this.bindGroup),i.setVertexBuffer(0,this.vertexBuffer),i.setIndexBuffer(this.indexBuffer,"uint16"),i.drawIndexed(this.indexCount,B,0,0,e))}updateUniforms(i,B=[1,1,1]){const e=new Float32Array(20);e.set(i,0),e.set(B,16),this.device.queue.writeBuffer(this.uniformBuffer,0,e)}}async function Re(){const h=document.getElementById("canvas");document.getElementById("error");const i=document.getElementById("particleCount"),B=document.getElementById("fps");h.style.width="100%",h.style.height="100%",h.style.display="block";const e={radius:.1,stiffness:1200,damping:5,friction:1.5,drag:.25,gravityY:-2,sphereRadius:6,oscillate:!0,ampX:2.5,ampY:2,ampZ:2.5,showParticles:!1,paused:!1,objectCount:256,resolution:2,spawnShape:"Mix",boxX:12,boxY:48,boxZ:12};let t=null,q=null,F=null,K=null,ee=null,X=null,L={},H=null,te=null,ne={};function ce(){return["I","J","L","O","S","T","Z"]}async function Z(){t&&t.destroy();const U=.6/e.resolution*.5,o=U*2,d=Math.ceil(e.boxX*2/o)+8,M=Math.ceil(e.boxY*2/o)+8,G=Math.ceil(e.boxZ*2/o)+8,P=new we({maxBodies:16384,maxParticles:131072,radius:U,stiffness:e.stiffness,damping:e.damping,friction:e.friction,drag:e.drag,fixedTimeStep:1/120,gravity:new O(0,e.gravityY,0),boxSize:new O(e.boxX,e.boxY,e.boxZ),gridPosition:new O(-e.boxX,0,-e.boxZ),gridResolution:new O(d,M,G),maxSubSteps:8});await P.ready();const p=P.getDevice(),Y=navigator.gpu.getPreferredCanvasFormat();h.getContext("webgpu").configure({device:p,format:Y,alphaMode:"premultiplied"});const D=new Pe(p),j=new ve(p,Y,{size:40,height:0}),_=p.createTexture({size:[h.width,h.height],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),S={};S.Box=new Q(p,Be()),S.Cylinder=new Q(p,Se()),S.Sphere=new Q(p,he(1,16,12));for(let g of ce())S[`Tetris_${g}`]=new Q(p,Ce(g));const m=new Q(p,he(1,32,24)),r=p.createBuffer({size:16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),c=p.createBuffer({size:16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});p.queue.writeBuffer(c,0,new Float32Array([0,0,0,1])),m.updateBindGroup(r,c),ee||(ee=new Me(h,{radius:20,target:[0,.5,0]}));const l={};pe(P,l),P.setSphereRadius(0,e.sphereRadius),P.setSpherePosition(0,0,1,0),P.step(P.fixedTimeStep||1/60),X&&X.destroy(),H&&H.destroy(),te&&te.destroy(),t=P,q=D,F=j,L=S,K=m,H=r,te=c,ne=l,X=_}function pe(n,U){const o=e.resolution,d=n.radius,M=1;function G(r,c,l){U[r]||(U[r]=[]),U[r].push([c,l])}function P(r,c,l){const g=n.bodyCount,y=[],u=(o-1)*d;for(let b=0;b<o;b++)for(let w=0;w<o;w++)for(let f=0;f<o;f++){const T=b*2*d-u,E=w*2*d-u,I=f*2*d-u;y.push([T,E,I])}const s=de(y.length*M,y),a=y.length*M,v=new O(Math.random(),Math.random(),Math.random()).normalize(),z=Math.random()*Math.PI*2,C=Math.sin(z/2),V=Math.cos(z/2),A=n.addBody(r,c,l,v.x*C,v.y*C,v.z*C,V,a,s.x,s.y,s.z);for(let b=0;b<o;b++)for(let w=0;w<o;w++)for(let f=0;f<o;f++)if(b===0||b===o-1||w===0||w===o-1||f===0||f===o-1){const T=b*2*d-u,E=w*2*d-u,I=f*2*d-u;n.addParticle(A,T,E,I)}G("Box",g,1)}function p(r,c,l){const g=n.bodyCount,y=M,u=ze(y,d),s=new O(Math.random(),Math.random(),Math.random()).normalize(),a=Math.random()*Math.PI*2,v=Math.sin(a/2),z=Math.cos(a/2),C=n.addBody(r,c,l,s.x*v,s.y*v,s.z*v,z,y,u.x,u.y,u.z);n.addParticle(C,0,0,0),G("Sphere",g,1)}function Y(r,c,l){const g=n.bodyCount,u=o*2*d/2,s=[],a=(o-1)*d;for(let f=0;f<o;f++)for(let T=0;T<o;T++)for(let E=0;E<o;E++){const I=f*2*d-a,x=T*2*d-a,N=E*2*d-a;I*I+N*N<=u*u*1.2&&s.push([I,x,N])}if(s.length===0)return;const v=s.length*M,z=de(v,s),C=new O(Math.random(),Math.random(),Math.random()).normalize(),V=Math.random()*Math.PI*2,A=Math.sin(V/2),b=Math.cos(V/2),w=n.addBody(r,c,l,C.x*A,C.y*A,C.z*A,b,v,z.x,z.y,z.z);for(let f of s)n.addParticle(w,f[0],f[1],f[2]);G("Cylinder",g,1)}function k(r,c,l,g){const y=n.bodyCount,u=Te(g),s=o*2*d,a=[],v=(o-1)*d;for(let x of u){const N=x[0]*s,me=x[1]*s,ge=x[2]*s;for(let se=0;se<o;se++)for(let ie=0;ie<o;ie++)for(let ae=0;ae<o;ae++){const ye=se*2*d-v,xe=ie*2*d-v,be=ae*2*d-v;a.push([N+ye,me+xe,ge+be])}}let z=0,C=0,V=0;for(let x of a)z+=x[0],C+=x[1],V+=x[2];z/=a.length,C/=a.length,V/=a.length;for(let x of a)x[0]-=z,x[1]-=C,x[2]-=V;const A=a.length*M,b=de(A,a),w=new O(Math.random(),Math.random(),Math.random()).normalize(),f=Math.random()*Math.PI*2,T=Math.sin(f/2),E=Math.cos(f/2),I=n.addBody(r,c,l,w.x*T,w.y*T,w.z*T,E,A,b.x,b.y,b.z);for(let x of a)n.addParticle(I,x[0],x[1],x[2]);G(`Tetris_${g}`,y,1)}const D=ce(),j=e.objectCount,_=e.spawnShape,S=o*2*d*3,m=12*.5;for(let r=0;r<j;r++){const c=Math.random()*Math.PI*2,l=Math.random()*(m/2),g=Math.cos(c)*l,y=Math.sin(c)*l,u=2+r*(S*.25);let s=_;if(s==="Mix"){const a=Math.random();a<.25?s="Box":a<.5?s="Cylinder":a<.75?s="Sphere":s="Tetris"}if(s==="Box")P(g,u,y);else if(s==="Cylinder")Y(g,u,y);else if(s==="Sphere")p(g,u,y);else if(s==="Tetris"){const a=D[Math.floor(Math.random()*D.length)];k(g,u,y,a)}}i.textContent=n.particleCount.toString()}await Z();const R=new window.lil.GUI({title:"Shapes Demo"});R.add(e,"objectCount",1,1e4,1).name("Object Count").onFinishChange(Z),R.add(e,"resolution",1,4,1).name("Particles/Side").onFinishChange(Z),R.add(e,"spawnShape",["Box","Cylinder","Sphere","Tetris","Mix"]).name("Shape").onFinishChange(Z);const W=R.addFolder("Physics");W.add(t,"stiffness",0,5e3,10),W.add(t,"damping",0,20,.1),W.add(t,"friction",0,10,.1),W.add(t,"fixedTimeStep",.001,.1,.001).name("Time Step"),W.add(e,"gravityY",-20,20,.1).name("Gravity Y").onChange(n=>t.gravity=new O(0,n,0));const oe=R.addFolder("Container");oe.add(e,"boxX",2,100,1).name("Width (X)").onChange(n=>{t&&(t.params.boxSize[0]=n)}),oe.add(e,"boxY",2,100,1).name("Height (Y)").onChange(n=>{t&&(t.params.boxSize[1]=n)}),oe.add(e,"boxZ",2,100,1).name("Depth (Z)").onChange(n=>{t&&(t.params.boxSize[2]=n)}),R.add(e,"sphereRadius",.1,10,.05).onChange(n=>t.setSphereRadius(0,n));const $=R.addFolder("Oscillation");$.add(e,"oscillate"),$.add(e,"ampX",0,60).name("Amplitude X"),$.add(e,"ampY",0,60).name("Amplitude Y"),$.add(e,"ampZ",0,60).name("Amplitude Z"),R.add(e,"showParticles").name("Render Particles"),R.add(e,"paused"),R.add({reset:Z},"reset").name("Reset World");function le(){h.width=window.innerWidth,h.height=window.innerHeight,t&&t.initialized&&(X&&X.destroy(),X=t.getDevice().createTexture({size:[h.width,h.height],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}))}window.addEventListener("resize",le),le();let ue=performance.now(),re=0,J=0;function fe(){requestAnimationFrame(fe);const n=performance.now(),U=(n-ue)*.001;if(ue=n,re++,J+=U,J>=1&&(B.textContent=Math.round(re/J).toString(),re=0,J=0),!t||!t.initialized)return;if(e.oscillate){const m=n*.001,r=Math.sin(m*2)*e.ampX,c=Math.cos(m*1.4)*e.ampZ,l=.8+Math.sin(m*3.6)*e.ampY;t.setSpherePosition(0,r,l,c)}e.paused||t.step(U);const o=t.getDevice(),d=h.getContext("webgpu"),M=ee.getViewProj(h.width/h.height),G=e.resolution*t.radius,P=e.resolution*t.radius,p=t.radius,Y=e.resolution*2*t.radius;q.updateBindGroup(t.getParticleWorldPositionBuffer()),q.updateViewProj(M,t.radius),F.update(M,{gridSize:.5,lineWidth:.04,height:0});const k=new Float32Array(4),D=t.getSpherePosition(0);k.set([D.x,D.y,D.z,1]),o.queue.writeBuffer(H,0,k);const j=t.getSphereRadius(0);K.updateUniforms(M,[j,j,j]);for(let m in L){L[m].updateBindGroup(t.getBodyPositionBuffer(),t.getBodyQuaternionBuffer());let r=[1,1,1];m==="Box"?r=[G,G,G]:m==="Cylinder"?r=[P,P,P]:m==="Sphere"?r=[p,p,p]:m.startsWith("Tetris")&&(r=[Y,Y,Y]),L[m].updateUniforms(M,r)}const _=o.createCommandEncoder(),S=_.beginRenderPass({colorAttachments:[{view:d.getCurrentTexture().createView(),clearValue:{r:.14,g:.16,b:.2,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:X.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}});if(e.showParticles)q.record(S,t.particleCount);else for(let m in ne){const r=ne[m],c=L[m];if(c)for(let l of r){const g=l[0],y=l[1];c.record(S,y,g)}}K.record(S,1),F.record(S),S.end(),o.queue.submit([_.finish()])}fe()}Re().catch(h=>{const i=document.getElementById("error");i.textContent=`Error: ${h.message||h}`,console.error(h)});

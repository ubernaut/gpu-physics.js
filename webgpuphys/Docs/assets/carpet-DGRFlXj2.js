import{V as D,W as xe,P as be,G as we,a as ve,b as Pe,d as Be,e as Se,O as Ce,f as ae,g as Me}from"./orbitControls-Bz_JsIjz.js";class ${constructor(i,P,e){this.device=i,this.format=e||navigator.gpu.getPreferredCanvasFormat(),this.vertexBuffer=i.createBuffer({size:P.vertices.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),i.queue.writeBuffer(this.vertexBuffer,0,P.vertices),this.indexBuffer=i.createBuffer({size:P.indices.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST}),i.queue.writeBuffer(this.indexBuffer,0,P.indices),this.indexCount=P.indices.length,this.uniformBuffer=i.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});const O=i.createShaderModule({code:`
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
    `}),F=i.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}}]});this.pipeline=i.createRenderPipeline({layout:i.createPipelineLayout({bindGroupLayouts:[F]}),vertex:{module:O,entryPoint:"vs_main",buffers:[{arrayStride:24,attributes:[{shaderLocation:0,offset:0,format:"float32x3"},{shaderLocation:1,offset:12,format:"float32x3"}]}]},fragment:{module:O,entryPoint:"fs_main",targets:[{format:this.format}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less"}}),this.bindGroup=null}updateBindGroup(i,P){this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.uniformBuffer}},{binding:1,resource:{buffer:i}},{binding:2,resource:{buffer:P}}]})}record(i,P,e=0,{viewProj:t,scale:O=[1,1,1]}={}){this.bindGroup&&(i.setPipeline(this.pipeline),i.setBindGroup(0,this.bindGroup),i.setVertexBuffer(0,this.vertexBuffer),i.setIndexBuffer(this.indexBuffer,"uint16"),i.drawIndexed(this.indexCount,P,0,0,e))}updateUniforms(i,P=[1,1,1]){const e=new Float32Array(20);e.set(i,0),e.set(P,16),this.device.queue.writeBuffer(this.uniformBuffer,0,e)}}async function Te(){const l=document.getElementById("canvas");document.getElementById("error");const i=document.getElementById("particleCount"),P=document.getElementById("fps");l.style.width="100%",l.style.height="100%",l.style.display="block";const e={radius:.1,stiffness:1200,damping:5,friction:1.5,drag:.25,gravityY:-2,sphereRadius:6,oscillate:!0,ampX:2.5,ampY:2,ampZ:2.5,showParticles:!1,paused:!1,objectCount:256,resolution:2,spawnShape:"Mix",boxX:12,boxY:48,boxZ:12};let t=null,O=null,F=null,J=null,K=null,V=null,L={},N=null,ee=null,te={};function de(){return["I","J","L","O","S","T","Z"]}async function Z(){t&&t.destroy();const z=.6/e.resolution*.5,n=z*2,s=Math.ceil(e.boxX*2/n)+8,B=Math.ceil(e.boxY*2/n)+8,G=Math.ceil(e.boxZ*2/n)+8,v=new xe({maxBodies:16384,maxParticles:131072,radius:z,stiffness:e.stiffness,damping:e.damping,friction:e.friction,drag:e.drag,fixedTimeStep:1/120,gravity:new D(0,e.gravityY,0),boxSize:new D(e.boxX,e.boxY,e.boxZ),gridPosition:new D(-e.boxX,0,-e.boxZ),gridResolution:new D(s,B,G),maxSubSteps:8});await v.ready();const p=v.getDevice(),A=navigator.gpu.getPreferredCanvasFormat();l.getContext("webgpu").configure({device:p,format:A,alphaMode:"premultiplied"});const j=new be(p),_=new we(p,A,{size:40,height:0}),U=p.createTexture({size:[l.width,l.height],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),u={};u.Box=new $(p,ve()),u.Cylinder=new $(p,Pe());for(let m of de())u[`Tetris_${m}`]=new $(p,Be(m));const r=new $(p,Se(1,32,24)),h=p.createBuffer({size:16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),f=p.createBuffer({size:16,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});p.queue.writeBuffer(f,0,new Float32Array([0,0,0,1])),r.updateBindGroup(h,f),K||(K=new Ce(l,{radius:20,target:[0,.5,0]}));const y={};fe(v,y),v.setSphereRadius(0,e.sphereRadius),v.setSpherePosition(0,0,1,0),v.step(v.fixedTimeStep||1/60),V&&V.destroy(),N&&N.destroy(),ee&&ee.destroy(),t=v,O=j,F=_,L=u,J=r,N=h,ee=f,te=y,V=U}function fe(o,z){const n=e.resolution,s=o.radius,B=1;function G(r,h,f){z[r]||(z[r]=[]),z[r].push([h,f])}function v(r,h,f){const y=o.bodyCount,m=[],x=(n-1)*s;for(let b=0;b<n;b++)for(let w=0;w<n;w++)for(let c=0;c<n;c++){const C=b*2*s-x,E=w*2*s-x,I=c*2*s-x;m.push([C,E,I])}const a=ae(m.length*B,m),d=m.length*B,T=new D(Math.random(),Math.random(),Math.random()).normalize(),R=Math.random()*Math.PI*2,S=Math.sin(R/2),q=Math.cos(R/2),Y=o.addBody(r,h,f,T.x*S,T.y*S,T.z*S,q,d,a.x,a.y,a.z);for(let b=0;b<n;b++)for(let w=0;w<n;w++)for(let c=0;c<n;c++)if(b===0||b===n-1||w===0||w===n-1||c===0||c===n-1){const C=b*2*s-x,E=w*2*s-x,I=c*2*s-x;o.addParticle(Y,C,E,I)}G("Box",y,1)}function p(r,h,f){const y=o.bodyCount,x=n*2*s/2,a=[],d=(n-1)*s;for(let c=0;c<n;c++)for(let C=0;C<n;C++)for(let E=0;E<n;E++){const I=c*2*s-d,g=C*2*s-d,k=E*2*s-d;I*I+k*k<=x*x*1.2&&a.push([I,g,k])}if(a.length===0)return;const T=a.length*B,R=ae(T,a),S=new D(Math.random(),Math.random(),Math.random()).normalize(),q=Math.random()*Math.PI*2,Y=Math.sin(q/2),b=Math.cos(q/2),w=o.addBody(r,h,f,S.x*Y,S.y*Y,S.z*Y,b,T,R.x,R.y,R.z);for(let c of a)o.addParticle(w,c[0],c[1],c[2]);G("Cylinder",y,1)}function A(r,h,f,y){const m=o.bodyCount,x=Me(y),a=n*2*s,d=[],T=(n-1)*s;for(let g of x){const k=g[0]*a,he=g[1]*a,pe=g[2]*a;for(let re=0;re<n;re++)for(let ie=0;ie<n;ie++)for(let se=0;se<n;se++){const ge=re*2*s-T,me=ie*2*s-T,ye=se*2*s-T;d.push([k+ge,he+me,pe+ye])}}let R=0,S=0,q=0;for(let g of d)R+=g[0],S+=g[1],q+=g[2];R/=d.length,S/=d.length,q/=d.length;for(let g of d)g[0]-=R,g[1]-=S,g[2]-=q;const Y=d.length*B,b=ae(Y,d),w=new D(Math.random(),Math.random(),Math.random()).normalize(),c=Math.random()*Math.PI*2,C=Math.sin(c/2),E=Math.cos(c/2),I=o.addBody(r,h,f,w.x*C,w.y*C,w.z*C,E,Y,b.x,b.y,b.z);for(let g of d)o.addParticle(I,g[0],g[1],g[2]);G(`Tetris_${y}`,m,1)}const X=de(),j=e.objectCount,_=e.spawnShape,U=n*2*s*3,u=12*.5;for(let r=0;r<j;r++){const h=Math.random()*Math.PI*2,f=Math.random()*(u/2),y=Math.cos(h)*f,m=Math.sin(h)*f,x=2+r*(U*.25);let a=_;if(a==="Mix"){const d=Math.random();d<.33?a="Box":d<.66?a="Cylinder":a="Tetris"}if(a==="Box")v(y,x,m);else if(a==="Cylinder")p(y,x,m);else if(a==="Tetris"){const d=X[Math.floor(Math.random()*X.length)];A(y,x,m,d)}}i.textContent=o.particleCount.toString()}await Z();const M=new window.lil.GUI({title:"Shapes Demo"});M.add(e,"objectCount",1,1e4,1).name("Object Count").onFinishChange(Z),M.add(e,"resolution",1,4,1).name("Particles/Side").onFinishChange(Z),M.add(e,"spawnShape",["Box","Cylinder","Tetris","Mix"]).name("Shape").onFinishChange(Z);const W=M.addFolder("Physics");W.add(t,"stiffness",0,5e3,10),W.add(t,"damping",0,20,.1),W.add(t,"friction",0,10,.1),W.add(t,"fixedTimeStep",.001,.1,.001).name("Time Step"),W.add(e,"gravityY",-20,20,.1).name("Gravity Y").onChange(o=>t.gravity=new D(0,o,0));const ne=M.addFolder("Container");ne.add(e,"boxX",2,100,1).name("Width (X)").onChange(o=>{t&&(t.params.boxSize[0]=o)}),ne.add(e,"boxY",2,100,1).name("Height (Y)").onChange(o=>{t&&(t.params.boxSize[1]=o)}),ne.add(e,"boxZ",2,100,1).name("Depth (Z)").onChange(o=>{t&&(t.params.boxSize[2]=o)}),M.add(e,"sphereRadius",.1,10,.05).onChange(o=>t.setSphereRadius(0,o));const Q=M.addFolder("Oscillation");Q.add(e,"oscillate"),Q.add(e,"ampX",0,60).name("Amplitude X"),Q.add(e,"ampY",0,60).name("Amplitude Y"),Q.add(e,"ampZ",0,60).name("Amplitude Z"),M.add(e,"showParticles").name("Render Particles"),M.add(e,"paused"),M.add({reset:Z},"reset").name("Reset World");function ce(){l.width=window.innerWidth,l.height=window.innerHeight,t&&t.initialized&&(V&&V.destroy(),V=t.getDevice().createTexture({size:[l.width,l.height],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}))}window.addEventListener("resize",ce),ce();let le=performance.now(),oe=0,H=0;function ue(){requestAnimationFrame(ue);const o=performance.now(),z=(o-le)*.001;if(le=o,oe++,H+=z,H>=1&&(P.textContent=Math.round(oe/H).toString(),oe=0,H=0),!t||!t.initialized)return;if(e.oscillate){const u=o*.001,r=Math.sin(u*2)*e.ampX,h=Math.cos(u*1.4)*e.ampZ,f=.8+Math.sin(u*3.6)*e.ampY;t.setSpherePosition(0,r,f,h)}e.paused||t.step(z);const n=t.getDevice(),s=l.getContext("webgpu"),B=K.getViewProj(l.width/l.height),G=e.resolution*t.radius,v=e.resolution*t.radius,p=e.resolution*2*t.radius;O.updateBindGroup(t.getParticleWorldPositionBuffer()),O.updateViewProj(B,t.radius),F.update(B,{gridSize:.5,lineWidth:.04,height:0});const A=new Float32Array(4),X=t.getSpherePosition(0);A.set([X.x,X.y,X.z,1]),n.queue.writeBuffer(N,0,A);const j=t.getSphereRadius(0);J.updateUniforms(B,[j,j,j]);for(let u in L){L[u].updateBindGroup(t.getBodyPositionBuffer(),t.getBodyQuaternionBuffer());let r=[1,1,1];u==="Box"?r=[G,G,G]:u==="Cylinder"?r=[v,v,v]:u.startsWith("Tetris")&&(r=[p,p,p]),L[u].updateUniforms(B,r)}const _=n.createCommandEncoder(),U=_.beginRenderPass({colorAttachments:[{view:s.getCurrentTexture().createView(),clearValue:{r:.14,g:.16,b:.2,a:1},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:V.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}});if(e.showParticles)O.record(U,t.particleCount);else for(let u in te){const r=te[u],h=L[u];if(h)for(let f of r){const y=f[0],m=f[1];h.record(U,m,y)}}J.record(U,1),F.record(U),U.end(),n.queue.submit([_.finish()])}ue()}Te().catch(l=>{const i=document.getElementById("error");i.textContent=`Error: ${l.message||l}`,console.error(l)});

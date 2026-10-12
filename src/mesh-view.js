// Visor y sombra ortográfica experimental en Canvas 2D.
// No depende de una librería externa. No simula penumbra ni material.
export function boundsOf(mesh){
 if(!mesh.vertices.length)return null;
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of mesh.vertices)for(let i=0;i<3;i++){min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);}
 return {min,max,center:min.map((v,i)=>(v+max[i])/2),span:Math.max(...min.map((v,i)=>max[i]-v),1)};
}
function projectedTriangles(mesh, map){
 return mesh.faces.map(f=>f.map(i=>map(mesh.vertices[i])));
}
export function drawMeshOrbit(ctx,mesh,{yaw=.7,pitch=.35}={}){
 const {width,height}=ctx.canvas;ctx.fillStyle='#f2f5fa';ctx.fillRect(0,0,width,height);
 const b=boundsOf(mesh);if(!b)return;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const scale=Math.min(width,height)*.72/b.span;
 const xyz=p=>{const [x,y,z]=p.map((v,i)=>v-b.center[i]);const xx=cy*x+sy*z,zz=-sy*x+cy*z;return [width/2+xx*scale,height/2-(cp*y-sp*zz)*scale,sp*y+cp*zz];};
 const triangles=projectedTriangles(mesh,xyz);
 // Painter's algorithm: adequate for a prototype view of opaque voxel geometry.
 const ordered=triangles.map(t=>({t,depth:t.reduce((a,v)=>a+v[2],0)/3})).sort((a,b)=>a.depth-b.depth);
 for(const {t} of ordered){
  const u=t[1].map((v,i)=>v-t[0][i]),v=t[2].map((w,i)=>w-t[0][i]);
  const nz=u[0]*v[1]-u[1]*v[0];
  ctx.fillStyle=nz<0?'#566e92':'#849fc3';
  ctx.beginPath();ctx.moveTo(t[0][0],t[0][1]);ctx.lineTo(t[1][0],t[1][1]);ctx.lineTo(t[2][0],t[2][1]);ctx.closePath();ctx.fill();
 }
}
/** Renders actual mesh faces under a point light, projected to a receiver z=0. */
export function drawMeshShadow(ctx,mesh,{lightX=0,lightY=0,lightZ=300,receiverSizeMm=300}={}){
 if(!(lightZ>0&&receiverSizeMm>0))throw new Error('Escena óptica inválida');
 const {width,height}=ctx.canvas;ctx.fillStyle='white';ctx.fillRect(0,0,width,height);
 const scale=Math.min(width,height)/receiverSizeMm;
 const project=p=>{
  if(p[2]>=lightZ)throw new Error('Malla fuera de región de iluminación');
  const m=lightZ/(lightZ-p[2]);
  return [width/2+(lightX+(p[0]-lightX)*m)*scale,height/2-(lightY+(p[1]-lightY)*m)*scale];
 };
 const vertices=mesh.vertices.map(project);
 ctx.fillStyle='#101723';
 for(const f of mesh.faces){
  const a=vertices[f[0]],b=vertices[f[1]],c=vertices[f[2]];
  ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.closePath();ctx.fill();
 }
}
export function compareCanvasMasks(referenceCtx,resultCtx){
 const a=referenceCtx.getImageData(0,0,referenceCtx.canvas.width,referenceCtx.canvas.height);
 const b=resultCtx.getImageData(0,0,resultCtx.canvas.width,resultCtx.canvas.height);
 if(a.width!==b.width||a.height!==b.height)throw new Error('Las resoluciones deben coincidir');
 let inter=0,union=0,difference=0;
 for(let i=0;i<a.data.length;i+=4){
  const x=a.data[i]<128,y=b.data[i]<128;
  if(x&&y)inter++;if(x||y)union++;if(x!==y)difference++;
 }
 return {iou:union?inter/union:1,error:difference/(a.width*a.height)};
}

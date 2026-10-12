// Unión volumétrica experimental por vóxeles. No constituye validación de impresión.
// Cada celda ocupada produce únicamente caras expuestas, sin superficies internas.
export function voxelizeNetwork(network,{resolutionMm=1.5,maxCells=2500000}={}){
 const segments=[...network.bars,...network.bridges];
 if(!segments.length)return {vertices:[],faces:[],stats:{components:0,cells:0,triangles:0}};
 if(!(resolutionMm>=0.5&&resolutionMm<=5))throw new Error('Resolución fuera de rango');
 const rad=Math.max(...segments.map(s=>s.thicknessMm))/2+resolutionMm;
 const pts=segments.flatMap(s=>[s.a,s.b]);
 const min=[0,1,2].map(k=>Math.min(...pts.map(p=>p[k]))-rad);
 const max=[0,1,2].map(k=>Math.max(...pts.map(p=>p[k]))+rad);
 const dims=min.map((v,i)=>Math.ceil((max[i]-v)/resolutionMm)+1);
 const total=dims.reduce((a,b)=>a*b,1);
 if(total>maxCells)throw new Error('Geometría demasiado grande para esta resolución; aumentá el tamaño de vóxel');
 const index=(x,y,z)=>(z*dims[1]+y)*dims[0]+x;
 const cells=new Uint8Array(total);
 for(const s of segments){
  const d=s.b.map((v,i)=>v-s.a[i]);
  const steps=Math.max(1,Math.ceil(Math.hypot(...d)/(resolutionMm*.4)));
  const radius=s.thicknessMm/2;
  const rr=Math.ceil((radius+resolutionMm)/resolutionMm);
  for(let i=0;i<=steps;i++){
   const p=s.a.map((v,k)=>v+d[k]*i/steps);
   const c=p.map((v,k)=>Math.floor((v-min[k])/resolutionMm));
   for(let z=Math.max(0,c[2]-rr);z<=Math.min(dims[2]-1,c[2]+rr);z++)
    for(let y=Math.max(0,c[1]-rr);y<=Math.min(dims[1]-1,c[1]+rr);y++)
     for(let x=Math.max(0,c[0]-rr);x<=Math.min(dims[0]-1,c[0]+rr);x++){
      const q=[x,y,z].map((v,k)=>min[k]+(v+.5)*resolutionMm);
      if(Math.hypot(...q.map((v,k)=>v-p[k]))<=radius+resolutionMm*.32)cells[index(x,y,z)]=1;
     }
  }
 }
 const sides=[
  {n:[1,0,0],corners:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]]},
  {n:[-1,0,0],corners:[[0,0,0],[0,0,1],[0,1,1],[0,1,0]]},
  {n:[0,1,0],corners:[[0,1,0],[0,1,1],[1,1,1],[1,1,0]]},
  {n:[0,-1,0],corners:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]},
  {n:[0,0,1],corners:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]]},
  {n:[0,0,-1],corners:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]}
 ];
 const vertices=[],faces=[],cache=new Map();
 function vertex(x,y,z){
  const key=x+','+y+','+z;
  if(cache.has(key))return cache.get(key);
  const i=vertices.length;vertices.push([x,y,z].map((v,k)=>min[k]+v*resolutionMm));cache.set(key,i);return i;
 }
 const active=[];
 for(let z=0;z<dims[2];z++)for(let y=0;y<dims[1];y++)for(let x=0;x<dims[0];x++)if(cells[index(x,y,z)]){
  active.push(index(x,y,z));
  for(const s of sides){
   const nx=x+s.n[0],ny=y+s.n[1],nz=z+s.n[2];
   if(nx>=0&&ny>=0&&nz>=0&&nx<dims[0]&&ny<dims[1]&&nz<dims[2]&&cells[index(nx,ny,nz)])continue;
   const v=s.corners.map(k=>vertex(x+k[0],y+k[1],z+k[2]));
   faces.push([v[0],v[1],v[2]],[v[0],v[2],v[3]]);
  }
 }
 // 6-neighbour component count measures solid voxel connectivity, not printability.
 let components=0;const seen=new Uint8Array(total);
 for(const start of active){if(seen[start])continue;components++;seen[start]=1;const q=[start];for(let head=0;head<q.length;head++){
  const v=q[head],x=v%dims[0],y=Math.floor(v/dims[0])%dims[1],z=Math.floor(v/(dims[0]*dims[1]));
  for(const [dx,dy,dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){
   const xx=x+dx,yy=y+dy,zz=z+dz;
   if(xx<0||yy<0||zz<0||xx>=dims[0]||yy>=dims[1]||zz>=dims[2])continue;
   const nxt=index(xx,yy,zz);if(cells[nxt]&&!seen[nxt]){seen[nxt]=1;q.push(nxt);}
  }
 }}
 return {vertices,faces,stats:{components,cells:active.length,triangles:faces.length,resolutionMm}};
}
export function validateSurface(mesh){
 const edgeCounts=new Map();
 for(const f of mesh.faces){
  if(new Set(f).size!==3)return {watertight:false,invalidTriangles:1,nonManifoldEdges:0};
  for(let i=0;i<3;i++){const a=f[i],b=f[(i+1)%3],k=Math.min(a,b)+':'+Math.max(a,b);edgeCounts.set(k,(edgeCounts.get(k)||0)+1);}
 }
 const bad=[...edgeCounts.values()].filter(c=>c!==2).length;
 return {watertight:mesh.faces.length>0&&bad===0,nonManifoldEdges:bad,invalidTriangles:0};
}
export function meshToAsciiStl(mesh){
 const out=['solid shadow_portrait_voxel_experimental'];
 for(const face of mesh.faces){
  const [a,b,c]=face.map(i=>mesh.vertices[i]);
  const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
  const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  const m=Math.hypot(...n)||1;
  out.push('facet normal '+n.map(x=>x/m).join(' '),'outer loop',... [a,b,c].map(x=>'vertex '+x.join(' ')),'endloop','endfacet');
 }
 out.push('endsolid shadow_portrait_voxel_experimental');
 return out.join('\n')+'\n';
}

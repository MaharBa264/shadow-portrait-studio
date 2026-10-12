// Experimental volumetric scanline geometry. Units: millimetres.
// A sequence of dark runs is lifted to varying depths along inverse light rays.
// The resulting STL contains separate bars, NOT a connected printable sculpture.
export function generateLineBars(pixels, width, height, scene, {rows=60, thicknessMm=1.8, depthVariationMm=20}={}) {
 if (pixels.length!==width*height*4) throw new Error('Invalid image size');
 const {lightX,lightY=0,lightZ,objectZ,objectX=0,receiverSizeMm}=scene;
 if (![lightX,lightY,lightZ,objectZ,receiverSizeMm,rows,thicknessMm,depthVariationMm].every(Number.isFinite)) throw new Error('Non-finite parameter');
 if (!(lightZ>objectZ+depthVariationMm && objectZ-depthVariationMm>0 && rows>=1 && rows<=250 && thicknessMm>0 && receiverSizeMm>0)) throw new Error('Invalid scene bounds');
 const bars=[];
 for(let row=0;row<rows;row++){
  const iy=Math.min(height-1,Math.floor((row+0.5)*height/rows));
  let run=-1;
  for(let ix=0;ix<=width;ix++){
   const dark=ix<width && pixels[(iy*width+ix)*4]<128;
   if(dark && run<0) run=ix;
   if(!dark && run>=0){
    if(ix-run>=2){
     const z=objectZ+Math.sin((row/rows)*Math.PI*6)*depthVariationMm;
     const k=(lightZ-z)/lightZ;
     const xa=lightX+((run/width-.5)*receiverSizeMm-lightX)*k;
     const xb=lightX+((ix/width-.5)*receiverSizeMm-lightX)*k;
     const wy=(.5-(iy+.5)/height)*receiverSizeMm;
     const y=lightY+(wy-lightY)*k;
     bars.push({a:[xa+objectX,y,z],b:[xb+objectX,y,z],thicknessMm});
    }
    run=-1;
   }
  }
 }
 return bars;
}
export function projectBars(bars,light) {
 return bars.map(bar=>{
  const project = ([x,y,z])=>{
   const t=light[2]/(light[2]-z);
   return [light[0]+t*(x-light[0]),light[1]+t*(y-light[1])];
  };
  return {a:project(bar.a),b:project(bar.b),thicknessMm:bar.thicknessMm*light[2]/(light[2]-bar.a[2])};
 });
}
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const minus=(a,b)=>a.map((v,i)=>v-b[i]);
const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n);};
export function barsToAsciiStl(bars){
 const out=['solid shadow_portrait_experimental'];
 function face(a,b,c) {
  const normal=unit(cross(minus(b,a),minus(c,a)));
  if(!normal.every(Number.isFinite))return;
  out.push(' facet normal '+normal.join(' '),'  outer loop',... [a,b,c].map(v=>'   vertex '+v.join(' ')),'  endloop',' endfacet');
 }
 for(const {a,b,thicknessMm:t} of bars){
  const d=minus(b,a),len=Math.hypot(...d);if(len<1e-8)continue;
  const side=unit(cross(d,[0,0,1])),up=[0,0,1];
  const verts=[];
  for(const p of [a,b])for(const s of [-1,1])for(const z of [-1,1])
   verts.push(p.map((v,i)=>v+(side[i]*s+up[i]*z)*t/2));
  const quads=[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]];
  for(const [i,j,k,l] of quads){face(verts[i],verts[j],verts[k]);face(verts[i],verts[k],verts[l]);}
 }
 out.push('endsolid shadow_portrait_experimental');
 return out.join('\n')+'\n';
}

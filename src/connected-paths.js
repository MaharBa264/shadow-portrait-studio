import { generateLineBars, projectBars } from './generator-lines.js';

/** Experimental connected centerline graph, NOT a watertight printable solid.
 * Links route beyond the receiver's left edge to reduce unwanted shadows.
 * All dimensions are millimetres.
 */
export function createConnectedPaths(pixels,width,height,scene,opts={}){
 const bars=generateLineBars(pixels,width,height,scene,opts);
 if(!bars.length)return {bars:[],bridges:[],spine:[],stats:{components:0,segments:0,bridges:0}};
 const zMin=Math.min(...bars.map(b=>b.a[2]));
 const anchorX=scene.lightX-(scene.receiverSizeMm/2+Math.max(10,opts.marginMm??18))*(scene.lightZ-zMin)/scene.lightZ;
 const ordered=[...bars].sort((a,b)=>b.a[1]-a.a[1]);
 const bridges=[],spine=[];
 for (const b of ordered) {
   // Elbow onto the outer backbone at the same Y and depth.
   const left=b.a[0]<=b.b[0]?b.a:b.b;
   const edge=[anchorX,left[1],left[2]];
   bridges.push({a:edge,b:left,thicknessMm:b.thicknessMm,kind:'puente'});
   spine.push(edge);
 }
 // A sequence of outside-the-frame spine segments gives centerline connectivity.
 for(let i=1;i<spine.length;i++)bridges.push({
   a:spine[i-1],b:spine[i],thicknessMm:opts.thicknessMm??1.8,kind:'columna'
 });
 return {bars,bridges,spine,stats:{components:1,segments:bars.length+bridges.length,bridges:bridges.length,centerlineOnly:true}};
}

/** Compares two binary raster masks (0 dark), returns IoU and wrong-pixel fraction. */
export function compareBinaryMasks(expected,actual){
 if(expected.length!==actual.length || expected.length===0)throw new Error('Tamaños incompatibles');
 let intersection=0,union=0,wrong=0;
 for(let i=0;i<expected.length;i++){
  const a=expected[i]<128,b=actual[i]<128;
  if(a&&b)intersection++;
  if(a||b)union++;
  if(a!==b)wrong++;
 }
 return {iou:union?intersection/union:1,errorPixeles:wrong/expected.length};
}
export function projectNetwork(network,light){
 return projectBars([...network.bars,...network.bridges],light);
}

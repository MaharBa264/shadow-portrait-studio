import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLineBars, projectBars, barsToAsciiStl } from '../src/generator-lines.js';
const width=16,height=16;
function mask(){
 const pixels=new Uint8ClampedArray(width*height*4).fill(255);
 for(let y=4;y<12;y++)for(let x=3;x<13;x++) pixels[(y*width+x)*4]=0;
 return pixels;
}
const scene={lightX:0,lightY:0,lightZ:300,objectZ:100,receiverSizeMm:180};
test('generates depth-varying 3D bars from dark rows',()=>{
 const bars=generateLineBars(mask(),width,height,scene,{rows:16,depthVariationMm:20});
 assert.ok(bars.length>0);
 assert.ok(new Set(bars.map(x=>x.a[2].toFixed(2))).size>1);
});
test('projected bar endpoints agree with target image positions',()=>{
 const bars=generateLineBars(mask(),width,height,scene,{rows:16});
 const shadows=projectBars(bars,[0,0,300]);
 for(const item of shadows){assert.ok(item.a[0]>=-57);assert.ok(item.b[0]<=57);}
});
test('exports valid-looking ASCII STL triangles',()=>{
 const bars=generateLineBars(mask(),width,height,scene,{rows:16});
 const stl=barsToAsciiStl(bars);
 assert.match(stl,/^solid shadow_portrait_experimental/);
 assert.match(stl,/facet normal/);
 assert.match(stl,/endsolid shadow_portrait_experimental/);
});
test('rejects out-of-bounds scene',()=>{
 assert.throws(()=>generateLineBars(mask(),width,height,{...scene,lightZ:100},{}));
});

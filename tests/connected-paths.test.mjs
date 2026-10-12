import test from 'node:test';
import assert from 'node:assert/strict';
import { createConnectedPaths, compareBinaryMasks, projectNetwork } from '../src/connected-paths.js';
const w=20,h=20,p=new Uint8ClampedArray(w*h*4).fill(255);
for(let y=4;y<18;y++)for(let x=5;x<14;x++)p[(y*w+x)*4]=0;
const scene={lightX:0,lightY:0,lightZ:300,objectZ:100,receiverSizeMm:180};
test('connects rows into a shared outer spine',()=>{
 const n=createConnectedPaths(p,w,h,scene,{rows:20,thicknessMm:2});
 assert.ok(n.bars.length>1);
 assert.equal(n.stats.components,1);
 assert.equal(n.spine.length,n.bars.length);
 assert.equal(n.bridges.length,2*n.bars.length-1);
 assert.ok(projectNetwork(n,[0,0,300]).length>n.bars.length);
});
test('empty mask gives empty network',()=>{
 const white=new Uint8ClampedArray(w*h*4).fill(255);
 assert.equal(createConnectedPaths(white,w,h,scene).stats.components,0);
});
test('identical masks have perfect IoU',()=>assert.deepEqual(compareBinaryMasks([0,255],[0,255]),{iou:1,errorPixeles:0}));
test('non-identical masks quantify mismatch',()=>{
 const d=compareBinaryMasks([0,255,0,255],[0,0,255,255]);assert.ok(d.iou<1);assert.equal(d.errorPixeles,.5);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPoint, shadowScale, receiverToObject, renderFlatMaskShadow } from '../src/optics.js';

test('central ray maps to receiver centre', () => {
 assert.deepEqual(projectPoint([0,0,50],[0,0,200]),[0,0]);
});
test('off-axis point is magnified by a point source', () => {
 assert.deepEqual(projectPoint([30,0,100],[0,0,200]),[60,0]);
 assert.equal(shadowScale(200,100),2);
});
test('inverse projection recovers object coordinates', () => {
 assert.deepEqual(receiverToObject(60,0,{lightX:0,lightY:0,lightZ:200,objectZ:100}),[30,0]);
});
test('invalid coincident light and object planes rejected', () => {
 assert.throws(()=>shadowScale(100,100));
});
test('binary mask casts projected shade', () => {
 const img = new Uint8ClampedArray(4*4*4).fill(255);
 for(let i=0;i<4;i++) img[(1*4+i)*4]=0;
 const out=renderFlatMaskShadow(img,4,4,{lightX:0,lightY:0,lightZ:200,objectZ:100,objectSizeMm:100,receiverSizeMm:200},4);
 assert.equal(out[(1*4+1)*4],0);
 assert.equal(out[(3*4+1)*4],255);
});

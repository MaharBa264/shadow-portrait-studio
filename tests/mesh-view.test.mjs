import test from 'node:test';
import assert from 'node:assert/strict';
import {boundsOf, drawMeshShadow,drawTargetOnReceiver} from '../src/mesh-view.js';
test('mesh bounding box is correct',()=> {
 const b=boundsOf({vertices:[[0,2,4],[10,12,14]],faces:[]});
 assert.deepEqual(b.min,[0,2,4]); assert.deepEqual(b.max,[10,12,14]);
 assert.deepEqual(b.center,[5,7,9]);assert.equal(b.span,10);
});
test('empty bounds return null',()=>assert.equal(boundsOf({vertices:[],faces:[]}),null));
test('light behind solid is rejected before rendering triangle',()=>{
 const ctx={canvas:{width:12,height:12},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){}};
 assert.throws(()=>drawMeshShadow(ctx,{vertices:[[0,0,400]],faces:[]},{lightZ:300}),/fuera de región/);
});
test('solid triangles draw through face projection',()=>{
 let triangles=0;
 const ctx={canvas:{width:12,height:12},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){triangles++;}};
 drawMeshShadow(ctx,{vertices:[[0,0,10],[10,0,10],[0,10,10]],faces:[[0,1,2]]},{lightZ:300});
 assert.equal(triangles,1);
});

test('target reference is drawn at its physical receiver size',()=>{
 const calls=[];
 const ctx={canvas:{width:400,height:400},fillRect(){},drawImage(...args){calls.push(args);}};
 drawTargetOnReceiver(ctx,{id:'target'},{targetSizeMm:100,receiverSizeMm:200});
 assert.equal(calls.length,1);
 assert.deepEqual(calls[0].slice(1),[100,100,200,200]);
});
test('invalid receiver dimensions rejected',()=>{
 const ctx={canvas:{width:400,height:400},fillRect(){},drawImage(){}};
 assert.throws(()=>drawTargetOnReceiver(ctx,{}, {targetSizeMm:180,receiverSizeMm:0}));
});

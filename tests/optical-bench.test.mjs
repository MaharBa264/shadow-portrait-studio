import test from 'node:test';import assert from 'node:assert/strict';
import {paintProjectedSegments,scoreMasks,diagnoseStages} from '../src/optical-bench.js';
function ctx(w=4,h=4){const data=new Uint8ClampedArray(w*h*4).fill(255);return {canvas:{width:w,height:h},data,getImageData(){return {data:this.data}},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}};}
test('same masks are perfect',()=>{const a=ctx();assert.equal(scoreMasks(a,a).iou,1);});
test('false positive is reported',()=>{const a=ctx(),b=ctx();b.data[0]=0;const s=scoreMasks(a,b);assert.equal(s.falsePositive,1);assert.equal(s.iou,0);});
test('first large fidelity drop is located',()=>{const a=ctx(),b=ctx(),c=ctx();a.data[0]=b.data[0]=0;c.data[4]=0;const d=diagnoseStages([a,b,c,null],a);assert.equal(d.firstLoss,2);});
test('point light projection rejects geometry behind light',()=>{const a=ctx();assert.throws(()=>paintProjectedSegments(a,[{a:[0,0,301],b:[1,0,301],thicknessMm:1}],{lightZ:300}));});

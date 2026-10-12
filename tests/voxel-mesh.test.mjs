import test from 'node:test';
import assert from 'node:assert/strict';
import { voxelizeNetwork,validateSurface,meshToAsciiStl } from '../src/voxel-mesh.js';
const line=(a,b,t=4)=>({a,b,thicknessMm:t});
test('un tubo voxelizado genera malla de superficie cerrada',()=>{
 const mesh=voxelizeNetwork({bars:[line([0,0,0],[20,0,0])],bridges:[]},{resolutionMm:1});
 assert.equal(mesh.stats.components,1);
 assert.ok(mesh.faces.length>0);
 assert.deepEqual(validateSurface(mesh),{watertight:true,nonManifoldEdges:0,invalidTriangles:0});
 assert.match(meshToAsciiStl(mesh),/endsolid shadow_portrait_voxel_experimental/);
});
test('piezas aisladas son detectadas como componentes separados',()=>{
 const m=voxelizeNetwork({bars:[line([0,0,0],[10,0,0]),line([0,30,0],[10,30,0])],bridges:[]},{resolutionMm:1});
 assert.equal(m.stats.components,2);
 assert.equal(validateSurface(m).watertight,true);
});
test('segmentos unidos se fusionan en una ocupación conectada',()=>{
 const m=voxelizeNetwork({bars:[line([0,0,0],[10,0,0])],bridges:[line([10,0,0],[10,10,0])]},{resolutionMm:1});
 assert.equal(m.stats.components,1);
 assert.equal(validateSurface(m).watertight,true);
});
test('presupuesto de memoria protege al navegador',()=>{
 assert.throws(()=>voxelizeNetwork({bars:[line([0,0,0],[500,500,500])],bridges:[]},{resolutionMm:.5,maxCells:1000}));
});

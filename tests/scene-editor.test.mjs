import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultScene,validScene,sceneGeometry,dragScene,hitScene} from '../src/scene-editor.js';
import {renderFlatMaskShadow} from '../src/optics.js';

test('escena inicial válida y geometría ordenada',()=>{
 const s=defaultScene(),g=sceneGeometry(s,600,320);
 assert.equal(validScene(s),true);
 assert.ok(g.wall<g.object&&g.object<g.light);
 assert.equal(hitScene(s,g.light,g.ly,600,320),'light');
 assert.equal(hitScene(s,g.object,g.oy,600,320),'object');
});
test('arrastre modifica solo el elemento elegido y respeta límites',()=>{
 const s=defaultScene(),g=sceneGeometry(s,600,320);
 const shifted=dragScene(s,'light',g.light-35,g.ly+20,600,320);
 assert.ok(shifted.lightZ<s.lightZ);
 assert.notEqual(shifted.lightX,s.lightX);
 assert.equal(shifted.objectZ,s.objectZ);
 assert.equal(validScene(shifted),true);
});
test('objeto desplazado altera máscara proyectada',()=>{
 const px=new Uint8ClampedArray(4*4*4).fill(255);
 px[(1*4+1)*4]=0;
 const scene={lightX:0,lightY:0,lightZ:300,objectZ:100,objectSizeMm:160,receiverSizeMm:300};
 const first=renderFlatMaskShadow(px,4,4,scene,40);
 const moved=renderFlatMaskShadow(px,4,4,{...scene,objectX:35},40);
 assert.notDeepEqual(first,moved);
});

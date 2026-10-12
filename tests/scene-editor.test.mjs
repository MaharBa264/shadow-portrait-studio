import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultScene,validScene,sceneGeometry,dragScene,hitScene,shadowFootprint} from '../src/scene-editor.js';
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

test('la sombra proyectada mide 240 mm con factor 1.5',()=>{
 const s=defaultScene(),p=shadowFootprint(s);
 assert.equal(p.scale,1.5);
 assert.equal(p.widthMm,240);
 assert.equal(p.centerMm,0);
 assert.equal(p.insideReceiver,true);
});
test('el desplazamiento lateral mueve la sombra sin cambiar su ancho',()=>{
 const a=shadowFootprint(defaultScene());
 const b=shadowFootprint({...defaultScene(),objectX:50});
 assert.equal(b.widthMm,a.widthMm);
 assert.equal(b.centerMm,75);
 assert.equal(b.insideReceiver,false);
});
test('distancia de luz cambia tamaño estimado',()=>{
 const near=shadowFootprint({...defaultScene(),lightZ:200});
 const far=shadowFootprint({...defaultScene(),lightZ:700});
 assert.ok(near.widthMm>far.widthMm);
});

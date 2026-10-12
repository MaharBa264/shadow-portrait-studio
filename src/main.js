import { generateLineBars, projectBars, barsToAsciiStl } from './generator-lines.js';
import { renderFlatMaskShadow, shadowScale } from './optics.js';
const $ = (id) => document.getElementById(id);
const original = $('original');
const target = $('target');
const originalCtx = original.getContext('2d', {willReadFrequently:true});
const targetCtx = target.getContext('2d');
const projectionCtx = $('projection').getContext('2d');
let sourceData = null;
let originalName = null;
let generatedBars = null;
const geometryCtx = $('geometry').getContext('2d');
const castCtx = $('cast').getContext('2d');
const size = 420;
function emptyCanvas(ctx,text){ctx.fillStyle='#eff2f6';ctx.fillRect(0,0,size,size);ctx.fillStyle='#64748b';ctx.textAlign='center';ctx.font='16px system-ui';ctx.fillText(text,size/2,size/2);}
emptyCanvas(originalCtx,'Cargá tu fotografía');emptyCanvas(targetCtx,'Esperando imagen');emptyCanvas(projectionCtx,'Esperando máscara');emptyCanvas(geometryCtx,'Generación pendiente');emptyCanvas(castCtx,'Generación pendiente');
function sceneSettings(){
 return {lightX:Number($('lightX').value),lightY:0,lightZ:Number($('lightZ').value),objectZ:Number($('objectZ').value),receiverSizeMm:180};
}
function invalidateGeometry(){
 generatedBars=null;$('stl').disabled=true;
 emptyCanvas(geometryCtx,'Generación pendiente');emptyCanvas(castCtx,'Generación pendiente');
 $('geometryInfo').textContent='Generá de nuevo para actualizar la geometría.';
}
function drawBars(bars){
 const sizeMm=180;
 geometryCtx.fillStyle='#f3f5f8';geometryCtx.fillRect(0,0,size,size);
 geometryCtx.strokeStyle='#233c64';geometryCtx.lineWidth=1.25;
 for(const bar of bars){
  const map=([x,y,z])=>[size/2+x*size/sizeMm+z*.45,size/2-y*size/sizeMm-z*.35];
  const a=map(bar.a),b=map(bar.b);
  geometryCtx.beginPath();geometryCtx.moveTo(...a);geometryCtx.lineTo(...b);geometryCtx.stroke();
 }
 castCtx.fillStyle='#fff';castCtx.fillRect(0,0,size,size);
 castCtx.lineCap='butt';castCtx.strokeStyle='#101723';
 for(const bar of projectBars(bars,[Number($('lightX').value),0,Number($('lightZ').value)])){
  const map=([x,y])=>[size/2+x*size/300,size/2-y*size/300];
  castCtx.lineWidth=Math.max(1,bar.thicknessMm*size/300);
  castCtx.beginPath();castCtx.moveTo(...map(bar.a));castCtx.lineTo(...map(bar.b));castCtx.stroke();
 }
 $('geometryInfo').textContent=bars.length+' filamentos independientes · exportación de prueba, sin soportes ni validación de impresión';
}
function updateProjection(){
 if (!sourceData) return;
 const lightZ=Number($('lightZ').value),objectZ=Number($('objectZ').value),lightX=Number($('lightX').value);
 for (const id of ['lightZ','objectZ','lightX']) $(id+'Value').value=$(id).value;
 const pixels=targetCtx.getImageData(0,0,size,size);
 const scene={lightX,lightY:0,lightZ,objectZ,objectSizeMm:160,receiverSizeMm:300};
 const projected=renderFlatMaskShadow(pixels.data,size,size,scene,size);
 projectionCtx.putImageData(new ImageData(projected,size,size),0,0);
 $('opticalScale').textContent='Aumento geométrico: '+shadowScale(lightZ,objectZ).toFixed(2)+'× · máscara de 160 mm · pared visible 300 mm';
}
function process(){
 if(!sourceData)return;
 const threshold = Number($('threshold').value), contrast = Number($('contrast').value), invert = $('invert').checked;
 $('thresholdValue').value=threshold; $('contrastValue').value=contrast.toFixed(1);
 const pixels = new Uint8ClampedArray(sourceData.data);
 for(let i=0;i<pixels.length;i+=4){let luminance=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];luminance=Math.max(0,Math.min(255,(luminance-127.5)*contrast+127.5));const dark=luminance<threshold;const value=(dark!==invert)?0:255;pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=255;}
 targetCtx.putImageData(new ImageData(pixels,size,size),0,0);
 updateProjection();invalidateGeometry();
 $('status').textContent='Imagen procesada. Ajustá el umbral para definir la sombra objetivo.';
}
$('upload').addEventListener('change', async (event)=>{
 const file=event.target.files?.[0]; if(!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)){ $('status').textContent='Formato no compatible.';return; }
 try {
  const bitmap=await createImageBitmap(file);
  originalCtx.fillStyle='#fff'; originalCtx.fillRect(0,0,size,size);
  const scale=Math.min(size/bitmap.width,size/bitmap.height);
  const w=bitmap.width*scale,h=bitmap.height*scale;
  originalCtx.drawImage(bitmap,(size-w)/2,(size-h)/2,w,h);bitmap.close();
  sourceData=originalCtx.getImageData(0,0,size,size); originalName=file.name;
  process();
 }catch(error){$('status').textContent='No se pudo leer la imagen.';}
});
['threshold','contrast','invert'].forEach(id=>$(id).addEventListener('input',process));
['lightZ','objectZ','lightX'].forEach(id=>$(id).addEventListener('input',()=>{updateProjection();invalidateGeometry();}));
['rows','rod'].forEach(id=>$(id).addEventListener('input',()=>{$(id+'Value').value=$(id).value;invalidateGeometry();}));
$('generate').addEventListener('click',()=>{
 if(!sourceData){$('status').textContent='Primero elegí una imagen.';return;}
 if(document.querySelector('input[name=mode]:checked').value!=='lines'){$('status').textContent='El motor volumétrico todavía está pendiente. Seleccioná Filamentos.';return;}
 try{
  const data=targetCtx.getImageData(0,0,size,size);
  generatedBars=generateLineBars(data.data,size,size,sceneSettings(),{rows:Number($('rows').value),thicknessMm:Number($('rod').value),depthVariationMm:20});
  drawBars(generatedBars);
  $('stl').disabled=generatedBars.length===0;
  $('status').textContent=generatedBars.length+' barras 3D calculadas. Modelo experimental, no conectado ni validado para impresión.';
 }catch(error){invalidateGeometry();$('status').textContent='Error de generación: '+error.message;}
});
$('stl').addEventListener('click',()=>{
 if(!generatedBars?.length)return;
 const blob=new Blob([barsToAsciiStl(generatedBars)],{type:'model/stl'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='shadow-portrait-experimental-UNCONNECTED.stl';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
document.querySelectorAll('input[name=mode]').forEach(r=>r.addEventListener('change',()=>{
 $('methodNote').textContent=r.value==='lines'&&r.checked?'Motor de filamentos: interfaz y contrato previstos. Algoritmo geométrico pendiente.':r.value==='volume'&&r.checked?'Motor volumétrico: interfaz y contrato previstos. Algoritmo geométrico pendiente.':$('methodNote').textContent;
}));
$('export').addEventListener('click',()=>{
 const settings={schemaVersion:'0.3.0',title:$('title').value,sourceFileName:originalName,mode:document.querySelector('input[name=mode]:checked').value,preprocessing:{threshold:Number($('threshold').value),contrast:Number($('contrast').value),invert:$('invert').checked},targetWidth:size,targetHeight:size,scene:{lightX:Number($('lightX').value),lightY:0,lightZ:Number($('lightZ').value),objectZ:Number($('objectZ').value),objectSizeMm:160,receiverSizeMm:300},sourceIncluded:false};
 const blob=new Blob([JSON.stringify(settings,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='shadow-portrait-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
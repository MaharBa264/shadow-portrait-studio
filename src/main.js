import { renderFlatMaskShadow, shadowScale } from './optics.js';
const $ = (id) => document.getElementById(id);
const original = $('original');
const target = $('target');
const originalCtx = original.getContext('2d', {willReadFrequently:true});
const targetCtx = target.getContext('2d');
const projectionCtx = $('projection').getContext('2d');
let sourceData = null;
let originalName = null;
const size = 420;
function emptyCanvas(ctx,text){ctx.fillStyle='#eff2f6';ctx.fillRect(0,0,size,size);ctx.fillStyle='#64748b';ctx.textAlign='center';ctx.font='16px system-ui';ctx.fillText(text,size/2,size/2);}
emptyCanvas(originalCtx,'Cargá tu fotografía');emptyCanvas(targetCtx,'Esperando imagen');emptyCanvas(projectionCtx,'Esperando máscara');
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
 updateProjection();
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
['lightZ','objectZ','lightX'].forEach(id=>$(id).addEventListener('input',updateProjection));
document.querySelectorAll('input[name=mode]').forEach(r=>r.addEventListener('change',()=>{
 $('methodNote').textContent=r.value==='lines'&&r.checked?'Motor de filamentos: interfaz y contrato previstos. Algoritmo geométrico pendiente.':r.value==='volume'&&r.checked?'Motor volumétrico: interfaz y contrato previstos. Algoritmo geométrico pendiente.':$('methodNote').textContent;
}));
$('export').addEventListener('click',()=>{
 const settings={schemaVersion:'0.2.0',title:$('title').value,sourceFileName:originalName,mode:document.querySelector('input[name=mode]:checked').value,preprocessing:{threshold:Number($('threshold').value),contrast:Number($('contrast').value),invert:$('invert').checked},targetWidth:size,targetHeight:size,scene:{lightX:Number($('lightX').value),lightY:0,lightZ:Number($('lightZ').value),objectZ:Number($('objectZ').value),objectSizeMm:160,receiverSizeMm:300},sourceIncluded:false};
 const blob=new Blob([JSON.stringify(settings,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='shadow-portrait-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
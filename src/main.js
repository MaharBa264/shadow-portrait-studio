const $ = (id) => document.getElementById(id);
const original = $('original');
const target = $('target');
const originalCtx = original.getContext('2d', {willReadFrequently:true});
const targetCtx = target.getContext('2d');
let sourceData = null;
let originalName = null;
const size = 420;
function emptyCanvas(ctx,text){ctx.fillStyle='#eff2f6';ctx.fillRect(0,0,size,size);ctx.fillStyle='#64748b';ctx.textAlign='center';ctx.font='16px system-ui';ctx.fillText(text,size/2,size/2);}
emptyCanvas(originalCtx,'Cargá tu fotografía');emptyCanvas(targetCtx,'Esperando imagen');
function process(){
 if(!sourceData)return;
 const threshold = Number($('threshold').value), contrast = Number($('contrast').value), invert = $('invert').checked;
 $('thresholdValue').value=threshold; $('contrastValue').value=contrast.toFixed(1);
 const pixels = new Uint8ClampedArray(sourceData.data);
 for(let i=0;i<pixels.length;i+=4){let luminance=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];luminance=Math.max(0,Math.min(255,(luminance-127.5)*contrast+127.5));const dark=luminance<threshold;const value=(dark!==invert)?0:255;pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=255;}
 targetCtx.putImageData(new ImageData(pixels,size,size),0,0);
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
document.querySelectorAll('input[name=mode]').forEach(r=>r.addEventListener('change',()=>{
 $('methodNote').textContent=r.value==='lines'&&r.checked?'Motor de filamentos: interfaz y contrato previstos. Algoritmo geométrico pendiente.':r.value==='volume'&&r.checked?'Motor volumétrico: interfaz y contrato previstos. Algoritmo geométrico pendiente.':$('methodNote').textContent;
}));
$('export').addEventListener('click',()=>{
 const settings={schemaVersion:'0.1.0',title:$('title').value,sourceFileName:originalName,mode:document.querySelector('input[name=mode]:checked').value,preprocessing:{threshold:Number($('threshold').value),contrast:Number($('contrast').value),invert:$('invert').checked},targetWidth:size,targetHeight:size,sourceIncluded:false};
 const blob=new Blob([JSON.stringify(settings,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='shadow-portrait-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
// Banco óptico de diagnóstico: mismas coordenadas y escala en las cuatro etapas.
// Objetivo: sombra en receptor de 180 mm, cuadro visible de 300 mm, luz puntual.
export function paintProjectedSegments(ctx,segments,{lightX=0,lightY=0,lightZ=300,receiverSizeMm=300}={}){
 const {width,height}=ctx.canvas;ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
 if(!(lightZ>0&&receiverSizeMm>0))throw new Error('Escena óptica inválida');
 const scale=Math.min(width,height)/receiverSizeMm;
 const point=([x,y,z])=>{
  if(z>=lightZ)throw new Error('Segmento fuera del espacio óptico');
  const k=lightZ/(lightZ-z);
  return [width/2+(lightX+(x-lightX)*k)*scale,height/2-(lightY+(y-lightY)*k)*scale,k];
 };
 ctx.strokeStyle='#000';ctx.lineCap='round';
 for(const s of segments){
  const a=point(s.a),b=point(s.b);
  const t=(a[2]+b[2])/2;
  ctx.lineWidth=Math.max(.5,s.thicknessMm*t*scale);
  ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
 }
}
export function scoreMasks(aCtx,bCtx){
 const a=aCtx.getImageData(0,0,aCtx.canvas.width,aCtx.canvas.height).data;
 const b=bCtx.getImageData(0,0,bCtx.canvas.width,bCtx.canvas.height).data;
 if(a.length!==b.length)throw new Error('Tamaños de máscara incompatibles');
 let intersection=0,union=0,falsePositive=0,falseNegative=0;
 for(let i=0;i<a.length;i+=4){
  const target=a[i]<128,actual=b[i]<128;
  if(target&&actual)intersection++;
  if(target||actual)union++;
  if(!target&&actual)falsePositive++;
  if(target&&!actual)falseNegative++;
 }
 return {iou:union?intersection/union:1,falsePositive,falseNegative,intersection,union};
}
export function diagnoseStages(stages,reference){
 const results=stages.map(stage=>stage?scoreMasks(reference,stage):null);
 let firstLoss=null,largestLoss=null,maxDrop=0;
 for(let i=1;i<results.length;i++){
  if(!results[i]||!results[i-1])continue;
  const drop=results[i-1].iou-results[i].iou;
  if(drop>0.08&&firstLoss===null)firstLoss=i;
  if(drop>maxDrop){maxDrop=drop;largestLoss=i;}
 }
 return {results,firstLoss,largestLoss,maxDrop};
}

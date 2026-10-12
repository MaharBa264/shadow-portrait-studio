// Editor de escena MVP: plano lateral X–Z, pared z=0, luz z>objeto>0.
// Mantiene la escena física separada del dibujo Canvas.
export const defaultScene=()=>({lightX:0,lightZ:300,objectZ:100,objectX:0,objectWidthMm:160,receiverSizeMm:300});
export function validScene(s){
 return Object.values(s).every(Number.isFinite)&&s.lightZ>=200&&s.lightZ<=700&&s.objectZ>=20&&s.objectZ<=170&&s.objectZ<s.lightZ-20&&Math.abs(s.lightX)<=100&&Math.abs(s.objectX)<=100&&s.objectWidthMm>0&&s.receiverSizeMm>0;
}
export function clampScene(s){
 const x=(v,min,max)=>Math.min(max,Math.max(min,v));
 return {...s,lightZ:x(s.lightZ,200,700),lightX:x(s.lightX,-100,100),objectZ:x(s.objectZ,20,Math.min(170,s.lightZ-21)),objectX:x(s.objectX,-100,100)};
}
export function mapScene(s,w=600,h=320){
 const left=55,right=w-55,top=35,bottom=h-45;
 const zToX=z=>left+(z/750)*(right-left);
 const xToY=x=>(top+bottom)/2-x*(bottom-top)/250;
 return {zToX,xToY,xFromPx:px=>Math.min(700,Math.max(0,(px-left)/(right-left)*750)),lateralFromPy:py=>Math.min(100,Math.max(-100,((top+bottom)/2-py)*250/(bottom-top))),top,bottom,left,right};
}
export function shadowFootprint(s){
 if(!validScene(s))throw new Error('Escena óptica inválida');
 const scale=s.lightZ/(s.lightZ-s.objectZ);
 const center=s.lightX+(s.objectX-s.lightX)*scale;
 const width=s.objectWidthMm*scale;
 return {centerMm:center,widthMm:width,minMm:center-width/2,maxMm:center+width/2,scale,insideReceiver:Math.abs(center)+width/2<=s.receiverSizeMm/2};
}
export function sceneGeometry(s,width,height){
 const m=mapScene(s,width,height);
 const wall=m.zToX(0),object=m.zToX(s.objectZ),light=m.zToX(s.lightZ);
 const ly=m.xToY(s.lightX),oy=m.xToY(s.objectX);
 const half=s.objectWidthMm/2;
 const upper=m.xToY(s.objectX+half),lower=m.xToY(s.objectX-half);
 const foot=shadowFootprint(s);
 const project=x=>s.lightX+(x-s.lightX)*foot.scale;
 return {wall,object,light,ly,oy,upper,lower,
  shadowUpper:m.xToY(project(s.objectX+half)),shadowLower:m.xToY(project(s.objectX-half)),footprint:foot,map:m};
}
export function drawScene(ctx,s){
 if(!validScene(s))throw new Error('Escena óptica fuera de límites');
 const w=ctx.canvas.width,h=ctx.canvas.height,g=sceneGeometry(s,w,h);
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#f2f5fa';ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#dae4f0';ctx.fillRect(0,g.map.top,w,g.map.bottom-g.map.top);
 ctx.strokeStyle='#b6c4d7';ctx.lineWidth=1;
 for(let z=0;z<=700;z+=100){const x=g.map.zToX(z);ctx.beginPath();ctx.moveTo(x,g.map.top);ctx.lineTo(x,g.map.bottom);ctx.stroke();}
 ctx.strokeStyle='#66809b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(g.wall,g.map.top);ctx.lineTo(g.wall,g.map.bottom);ctx.stroke();
 // The blue receiver segment is a fixed usable aperture; the red/orange interval is the
 // projected footprint and may extend outside it. Clip the visible segment to canvas.
 const receptorTop=g.map.xToY(s.receiverSizeMm/2),receptorBottom=g.map.xToY(-s.receiverSizeMm/2);
 ctx.strokeStyle='#1e86b7';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(g.wall,receptorTop);ctx.lineTo(g.wall,receptorBottom);ctx.stroke();
 ctx.strokeStyle=g.footprint.insideReceiver?'#2b9c69':'#de5b4b';ctx.lineWidth=12;
 ctx.beginPath();ctx.moveTo(g.wall-7,g.shadowUpper);ctx.lineTo(g.wall-7,g.shadowLower);ctx.stroke();
 ctx.strokeStyle='#f59e0b';ctx.lineWidth=1.7;ctx.setLineDash([6,5]);
 for(const end of [g.shadowUpper,g.shadowLower]){ctx.beginPath();ctx.moveTo(g.light,g.ly);ctx.lineTo(g.wall,end);ctx.stroke();}
 ctx.setLineDash([]);
 ctx.strokeStyle='#536d97';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(g.object,g.upper);ctx.lineTo(g.object,g.lower);ctx.stroke();
 ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.arc(g.light,g.ly,9,0,2*Math.PI);ctx.fill();
 ctx.fillStyle='#1f3b63';ctx.beginPath();ctx.arc(g.object,g.oy,5,0,2*Math.PI);ctx.fill();
 ctx.fillStyle='#182c46';ctx.font='14px system-ui';
 // Labels are anchored below each physical marker, not all in the top margin.
 ctx.fillText('Pared',g.wall-24,23);
 ctx.fillText('Pieza',g.object-18,g.map.bottom+18);
 ctx.fillText('Luz',g.light-11,g.map.bottom+18);
 ctx.fillStyle=g.footprint.insideReceiver?'#136a4c':'#b23f34';
 ctx.font='bold 12px system-ui';
 ctx.fillText('Sombra '+g.footprint.widthMm.toFixed(1)+' mm',g.wall+12,g.map.bottom+20);
 ctx.font='12px system-ui';ctx.fillText('Vista lateral · medidas en mm · dibujo no a escala de altura',14,h-12);
 return g;
}
export function dragScene(s,handle,px,py,width,height){
 const m=mapScene(s,width,height);
 if(handle==='light')return clampScene({...s,lightZ:m.xFromPx(px),lightX:m.lateralFromPy(py)});
 if(handle==='object')return clampScene({...s,objectZ:m.xFromPx(px),objectX:m.lateralFromPy(py)});
 return s;
}
export function hitScene(s,px,py,width,height){
 const g=sceneGeometry(s,width,height);
 if(Math.hypot(px-g.light,py-g.ly)<24)return 'light';
 if(Math.abs(px-g.object)<23&&py>=g.upper-24&&py<=g.lower+24)return 'object';
 return null;
}

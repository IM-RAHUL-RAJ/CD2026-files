/* ---------- Docker 3D scenes ---------- */
const c01=v=>Math.max(0,Math.min(1,v));
function dk(c){const r=mkR(c),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(38,1,.1,300);lights(sc);const g=new THREE.Group();sc.add(g);return {r,sc,cam,g}}
function mbox(g,w,h,d,col,o={}){const geo=new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(geo,std(col,{emissive:col,emissiveIntensity:o.emi??.18,transparent:(o.op??1)<1,opacity:o.op??1}));
  const e=edges(geo,o.ec??0xEBF0F9,o.eo??.25);m.add(e);if(o.at)m.position.copy(o.at);g.add(m);return m}
function lab(g,t,col,pos,s=.8,plain=false){const l=plain?plainLabel(t,col,s,700):label(t,col,s);l.position.copy(pos);g.add(l);return l}
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
function arcPath(a,b,h){const m=a.clone().add(b).multiplyScalar(.5);m.y+=h;return new THREE.QuadraticBezierCurve3(a,m,b)}

/* A · virtualization vs containerization */
function initVmc(){const c=$('#vmc3d'),{r,sc,cam,g}=dk(c);g.add(new THREE.GridHelper(48,48,0x253350,0x18233a));
  const XL=-6.6,XR=6.6;let stage=0,t0=0;
  mbox(g,9.6,.6,5.2,0x3a4766,{at:V(XL,.3,0)});lab(g,'Hardware','#C9D2E3',V(XL,.32,3.1),.75,true);
  mbox(g,9.6,.5,5.2,0x5a4ab0,{at:V(XL,.85,0),ec:0xA193FF,eo:.7});lab(g,'Hypervisor','#A193FF',V(XL,.88,3.1),.75,true);
  const vms=[],bars=[];
  [-3.1,0,3.1].forEach(dx=>{const x=XL+dx;mbox(g,2.7,1.8,3.6,0x56658a,{at:V(x,2,0),emi:.1});mbox(g,2.7,.3,3.6,0x8a97b8,{at:V(x,3.05,0)});mbox(g,1.7,1,2.2,0xFFB547,{at:V(x,3.7,0),emi:.35});
    lab(g,'Guest OS','#EBF0F9',V(x,2,1.95),.65,true);
    const bg=new THREE.BoxGeometry(2.5,.18,.18);bg.translate(1.25,0,0);const bar=new THREE.Mesh(bg,new THREE.MeshBasicMaterial({color:0xFF6F8E}));bar.position.set(x-1.25,4.7,0);bar.visible=false;g.add(bar);bars.push(bar);
    const wall=edges(new THREE.BoxGeometry(3.1,4.1,4),0xA193FF,1);wall.position.set(x,2.95,0);wall.visible=false;g.add(wall);vms.push(wall)});
  const ghost=mbox(g,2.7,3,3.6,0xFF6F8E,{at:V(XL,6.4,0),op:.25,ec:0xFF6F8E,eo:.9});ghost.visible=false;const ghL=lab(g,'VM 4? no room left','#FF6F8E',V(XL,8.3,0),.8);ghL.visible=false;
  mbox(g,9.6,.6,5.2,0x3a4766,{at:V(XR,.3,0)});lab(g,'Hardware','#C9D2E3',V(XR,.32,3.1),.75,true);
  const kern=mbox(g,9.6,.6,5.2,0x1f8f84,{at:V(XR,.9,0),ec:0x3FD5C2,eo:.8,emi:.3});lab(g,'Host OS · one Linux kernel','#3FD5C2',V(XR,.92,3.1),.7,true);
  mbox(g,9.6,.3,5.2,0x2f5fb0,{at:V(XR,1.35,0),ec:0x64A0FF,eo:.7});lab(g,'Docker Engine','#64A0FF',V(XR,1.42,3.1),.6,true);
  const cts=[],klines=[];
  for(let row=0;row<4;row++)for(let col=0;col<5;col++){const x=XR-3.6+col*1.8,z=-1.85+row*1.23;const ct=new THREE.Group();ct.position.set(x,1.5,z);
    mbox(ct,1.45,.16,.95,0x8a97b8,{at:V(0,.08,0)});mbox(ct,1,.62,.62,0xFFB547,{at:V(0,.47,0),emi:.35});ct.userData.base=row>=1&&row<=2&&col<4;ct.scale.setScalar(.001);g.add(ct);cts.push(ct);
    const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(x,1.5,z),V(x,1.2,z),V(XR,1.2,0)]),new THREE.LineBasicMaterial({color:0x3FD5C2,transparent:true,opacity:.7}));ln.visible=false;g.add(ln);klines.push(ln)}
  const vmT=lab(g,'Virtual machines','#A193FF',V(XL,6.4,-1),1.15);lab(g,'Containers','#3FD5C2',V(XR,4.8,-1),1.15);
  const tL=lab(g,'boot: ~60 s','#FF6F8E',V(XL,5.4,0),.9),tR=lab(g,'start: < 1 s','#6EDC92',V(XR,3.6,0),.9);
  const cL=lab(g,'3 VMs','#FFB547',V(XL-3.6,5.6,2),.9),cR=lab(g,'20 containers','#FFB547',V(XR+2.2,3.7,2),.9);
  const iL=lab(g,'separate kernels: strong walls','#A193FF',V(XL,5.7,2.4),.8),iR=lab(g,'one shared kernel: light walls','#3FD5C2',V(XR,3.5,2.4),.8);
  const st={yaw:0,pitch:0};drag(c,st);cam.position.set(0,10.4,20.6);
  function setStage(n){stage=n;t0=performance.now()}
  return {setStage,render(t){size(r,cam,c);const now=performance.now(),el=now-t0;
    g.rotation.y=st.yaw*.6+(reduce?0:Math.sin(t*.00012)*.08);cam.lookAt(0,2.1,0);
    const cyc=(el%7000)/1000;
    cts.forEach((ct,i)=>{const show=stage>=2||ct.userData.base;let s=show?1:.001;if(stage===1&&show)s=c01((cyc-.25)/.25)||.001;else if(stage===2&&!ct.userData.base)s=c01((el/1000-.3-i*.04)/.3)||.001;const k=ct.scale.x+(s-ct.scale.x)*(stage===1?1:.2);ct.scale.setScalar(Math.max(.001,k));klines[i].visible=stage===3&&show});
    bars.forEach(b=>{b.visible=stage===1;b.scale.x=Math.max(.001,c01((cyc-.25)/6))});
    tL.visible=tR.visible=stage===1;vmT.visible=stage!==2;cL.visible=cR.visible=ghost.visible=ghL.visible=stage===2;iL.visible=iR.visible=stage===3;vms.forEach(w=>w.visible=stage===3);
    kern.material.emissiveIntensity=stage===3?.35+.3*Math.sin(t*.006):.3;
    r.render(sc,cam)}}}

/* B · image layers: build, compress, push, pull, run */
function initLayers(){const c=$('#layers3d'),{r,sc,cam,g}=dk(c);g.add(new THREE.GridHelper(48,48,0x253350,0x18233a));let stage=0,t0=0;
  const LAY=[[0x64A0FF,'125 MB','45 MB'],[0xA193FF,'18 MB','7 MB'],[0x3FD5C2,'1 KB','1 KB'],[0x6EDC92,'62 MB','21 MB'],[0xFFB547,'2 MB','0.6 MB']];
  const BX=-6.2,SX=6.2,REG=V(0,6.2,-4.5),ly=i=>.55+i*.62;
  mbox(g,6.4,.4,4.4,0x2a3550,{at:V(BX,.2,0)});lab(g,"Rahul's laptop",'#C9D2E3',V(BX,.25,2.6),.75,true);
  mbox(g,6.4,.4,4.4,0x2a3550,{at:V(SX,.2,0)});lab(g,'EC2 server','#C9D2E3',V(SX,.25,2.6),.75,true);
  mbox(g,8.2,.3,2.6,0x3a2f12,{at:V(REG.x,REG.y,REG.z),ec:0xFFB547,eo:.8});lab(g,'Registry (ECR)','#FFB547',V(REG.x,REG.y+2,REG.z),.95);
  const plate=(col,op=.62)=>{const geo=new THREE.BoxGeometry(5,.36,3.4);const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.35,transparent:true,opacity:op,roughness:.3,metalness:.1}));m.add(edges(geo,col,1));g.add(m);return m};
  const brick=col=>{const geo=new THREE.BoxGeometry(1.5,.55,1.05);const m=new THREE.Mesh(geo,std(col,{emissive:col,emissiveIntensity:.4}));m.add(edges(geo,0xEBF0F9,.5));g.add(m);return m};
  const A=LAY.map(([col,u],i)=>{const p=plate(col);const l=plainLabel(u,'#EBF0F9',.55,700);g.add(l);return {p,l,home:V(BX,ly(i),0)}});
  const slot=i=>V(REG.x-3.2+i*1.6,REG.y+.45,REG.z);
  const B=LAY.map(([col,,z],i)=>{const b=brick(col);const l=plainLabel(z,'#3FD5C2',.5,700);g.add(l);return {b,l}});
  const S=LAY.map(([col],i)=>({p:plate(col),home:V(SX,ly(i),0)}));
  const Pb=LAY.map(([col])=>brick(col));
  const exists=lab(g,'Already exists','#6EDC92',V(SX+2.4,ly(0)-.1,2.6),.7);
  const W=[-1.75,0,1.75].map((dx,k)=>{const geo=new THREE.BoxGeometry(1.6,.14,3.4);const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xFF6F8E,transparent:true,opacity:.85}));m.add(edges(geo,0xFFB3C4,1));m.position.set(SX+dx,ly(5)+.35,0);g.add(m);
    const l=plainLabel('container '+(k+1),'#FF6F8E',.45,700);l.position.set(SX+dx,ly(5)+.95,0);g.add(l);return {m,l}});
  const wl=lab(g,'writable layer, one per container','#FF6F8E',V(SX,ly(5)+1.9,0),.7);
  const cow=new THREE.Mesh(new THREE.BoxGeometry(.32,.32,.32),new THREE.MeshBasicMaterial({color:0xFFB547}));g.add(cow);const cowL=plainLabel('config.json copied up','#FFB547',.45,700);g.add(cowL);
  const st={yaw:0};drag(c,st);cam.position.set(0,8.8,16.4);
  function setStage(n){stage=n;t0=performance.now()}
  const fly=(o,a,b,p,h=3)=>{o.position.copy(arcPath(a,b,h).getPoint(ease(c01(p))))};
  return {setStage,render(t){size(r,cam,c);const el=(performance.now()-t0)/1000;g.rotation.y=st.yaw*.6+(reduce?0:Math.sin(t*.0001)*.07);cam.lookAt(0,1.5,-1);
    A.forEach((o,i)=>{const p=stage===0?ease(c01((el-i*.45)/.6)):1;o.p.position.copy(o.home).add(V(0,(1-p)*5,0));o.p.material.opacity=(stage>=1?.35:.62)*(p>0?1:0);o.p.visible=p>0;
      o.l.position.copy(o.p.position).add(V(3.4,0,1.2));o.l.visible=p>.95&&stage===0});
    B.forEach((o,i)=>{const on=stage>=1;o.b.visible=o.l.visible=on;if(!on)return;const p=stage===1?(el-.4-i*.3)/1.1:1;
      if(p<=0){o.b.position.copy(A[i].home);o.b.scale.set(3.2,.65,3.2)}else{fly(o.b,A[i].home,slot(i),p,4);const s=1+(1-c01(p*2))*2.2;o.b.scale.set(s,.65+c01(p*2)*.35,s)}
      o.l.position.copy(o.b.position).add(V(0,.62,0));o.l.visible=p>.98});
    S.forEach((o,i)=>{let s=0;if(i===0)s=1;else if(stage>=2){const p=stage===2?(el-.3-(i-1)*.35)/1.1:1;s=c01((p-.9)*10)}o.p.visible=s>0;o.p.position.copy(o.home);o.p.scale.set(Math.max(.3,s),1,Math.max(.3,s));
      if(i===0)o.p.material.emissiveIntensity=stage===2?.35+.4*(.5+.5*Math.sin(t*.008)):.35});
    Pb.forEach((b,i)=>{const p=stage===2&&i>0?(el-.3-(i-1)*.35)/1.1:-1;b.visible=p>0&&p<1;if(b.visible)fly(b,slot(i),S[i].home,p,3)});
    exists.visible=stage===2;
    const runP=stage>=3?c01((el-.2)/.6):0;W.forEach((w,k)=>{w.m.visible=w.l.visible=runP>0;w.m.scale.set(1,1,Math.max(.01,c01(runP*1.5-k*.25)))});wl.visible=runP>0;
    const cp=((el-1)%3)/2.2;cow.visible=cowL.visible=stage>=3&&el>1;if(cow.visible){const a=V(SX-1.75,ly(4),.6),b=V(SX-1.75,ly(5)+.35,.6);cow.position.copy(a).lerp(b,ease(c01(cp)));cow.material.color.setHex(cp>.9?0xFF6F8E:0xFFB547);cowL.position.copy(cow.position).add(V(-2.2,.2,.8))}
    r.render(sc,cam)}}}

/* C · docker exec: real use cases */
function makeScreen(w,h){const cv=document.createElement('canvas');cv.width=1400;cv.height=Math.round(1400*h/w);const ctx=cv.getContext('2d');const tex=new THREE.CanvasTexture(cv);tex.minFilter=THREE.LinearFilter;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true}));let key='';
  function draw(title,col,lines,n){const k=title+n;if(k===key)return;key=k;ctx.clearRect(0,0,cv.width,cv.height);ctx.fillStyle='rgba(6,9,16,.94)';ctx.fillRect(0,0,cv.width,cv.height);ctx.strokeStyle=col;ctx.lineWidth=8;ctx.strokeRect(4,4,cv.width-8,cv.height-8);
    ctx.fillStyle=col;ctx.font='700 50px "JetBrains Mono",monospace';ctx.fillText(title,44,80);ctx.font='500 44px "JetBrains Mono",monospace';
    lines.slice(0,n).forEach((l,i)=>{ctx.fillStyle=l[1]||'#D4DCEC';ctx.fillText(l[0],44,170+i*68)});tex.needsUpdate=true}
  return {m,draw}}
function initExec(){const c=$('#exec3d'),{r,sc,cam,g}=dk(c);let stage=0,t0=0;
  const kern=mbox(g,24,.6,15,0x0d3d3a,{at:V(0,-.32,0),ec:0x3FD5C2,eo:.9,emi:.25});const kg=new THREE.GridHelper(24,24,0x3FD5C2,0x1a5c56);kg.scale.z=15/24;g.add(kg);
  const kL=lab(g,'one EC2 host · one Linux kernel','#3FD5C2',V(0,0,7.8),.8);
  const O=new THREE.Group();g.add(O);const boxes={};
  [['kafka',-5.5,0xFF9466],['backend',0,0x3FD5C2],['postgres',5.5,0x64A0FF]].forEach(([n,x,col])=>{const b=new THREE.Group();b.position.set(x,0,0);
    const m=mbox(b,3,2.6,3,col,{at:V(0,1.3,0),op:.16,ec:col,eo:1,emi:.4});b.userData.m=m;const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,0),new THREE.MeshBasicMaterial({color:col,wireframe:true}));core.position.y=1.3;b.add(core);b.userData.core=core;
    const l=label(n,'#'+col.toString(16).padStart(6,'0'),.8);l.position.set(0,3.4,0);b.add(l);O.add(b);boxes[n]=b});
  const I=new THREE.Group();g.add(I);I.visible=false;
  const room=new THREE.BoxGeometry(16,8,14);room.translate(0,4,0);const roomE=new THREE.LineSegments(new THREE.EdgesGeometry(room),new THREE.LineBasicMaterial({color:0x3FD5C2}));I.add(roomE);
  const roomW=new THREE.Mesh(room,new THREE.MeshBasicMaterial({color:0x3FD5C2,transparent:true,opacity:.05,side:THREE.BackSide}));I.add(roomW);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(16,14),new THREE.MeshBasicMaterial({color:0x0C1220,transparent:true,opacity:.85}));floor.rotation.x=-Math.PI/2;floor.position.y=.02;I.add(floor);
  const fgrid=new THREE.GridHelper(14,14,0x3FD5C2,0x1d3b4a);fgrid.position.y=.04;fgrid.scale.set(16/14,1,1);I.add(fgrid);
  const N=900,pp=new Float32Array(N*3),pd=[];for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,rr=4+Math.random()*3.5,y=1+Math.random()*6.5;pd.push([a,rr,y]);pp[i*3]=Math.cos(a)*rr;pp[i*3+1]=y;pp[i*3+2]=Math.sin(a)*rr}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));const swirlM=new THREE.PointsMaterial({color:0x7FE8DA,size:.07,transparent:true,opacity:.75});I.add(new THREE.Points(pg,swirlM));
  const scr=makeScreen(8.6,4.6);scr.m.position.set(-2.6,4,-6.85);I.add(scr.m);
  const where={backend:lab(I,'you are inside: backend','#3FD5C2',V(-2.6,7.1,-6.6),.75),kafka:lab(I,'you are inside: kafka','#FF9466',V(-2.6,7.1,-6.6),.75),postgres:lab(I,'you are inside: postgres','#64A0FF',V(-2.6,7.1,-6.6),.75)};
  // kafka conveyor
  const kz=new THREE.Group();I.add(kz);mbox(kz,13,.3,1.2,0x3a2a1a,{at:V(0,.9,-3.6),ec:0xFF9466,eo:.9});lab(kz,'topic: orders','#FF9466',V(-5.2,1.9,-3.6),.55);
  const evs=[];for(let i=0;i<6;i++){const e=new THREE.Mesh(new THREE.BoxGeometry(.7,.7,.7),std(0xFF9466,{emissive:0xFF9466,emissiveIntensity:.5}));kz.add(e);evs.push(e)}
  // postgres rows
  const pzg=new THREE.Group();I.add(pzg);const cyl=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,2.6,40),std(0x64A0FF,{emissive:0x64A0FF,emissiveIntensity:.35,transparent:true,opacity:.8}));cyl.position.set(4.6,1.4,-4.6);pzg.add(cyl);
  const rings=[0,1,2].map(k=>{const rg=new THREE.Mesh(new THREE.TorusGeometry(1.15,.06,8,48),new THREE.MeshBasicMaterial({color:k===2?0xFFB547:0xEBF0F9}));rg.rotation.x=Math.PI/2;rg.position.set(4.6,.7+k*.7,-4.6);pzg.add(rg);return rg});
  lab(pzg,'table: orders','#64A0FF',V(4.6,3.3,-4.6),.55);
  // log sheets
  const lgz=new THREE.Group();I.add(lgz);const sheets=[];for(let i=0;i<5;i++){const sh=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.34),new THREE.MeshBasicMaterial({color:i===4?0xFF6F8E:0x97A3BE,transparent:true,opacity:.85,side:THREE.DoubleSide}));lgz.add(sh);sheets.push(sh)}
  lab(lgz,'logs/app.log','#EBF0F9',V(4.6,5.6,-3.4),.55);
  const stdout=lab(g,'docker logs = what the app printed','#EBF0F9',V(0,4.4,0),.6);const strm=[];for(let i=0;i<8;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),new THREE.MeshBasicMaterial({color:0x3FD5C2}));g.add(d);strm.push(d)}
  const CONTENT={1:['backend : /app','#3FD5C2',[['$ ls'],['app.jar   logs/   config/','#97A3BE'],['$ whoami'],['app','#97A3BE']]],
    2:['backend : logs/app.log','#3FD5C2',[['10:42:01 INFO  Order 1042 created'],['10:42:01 INFO  Event sent to orders'],['10:42:05 WARN  Payment slow (4s)','#FFB547'],['10:42:07 ERROR Payment timeout 1042','#FF6F8E']]],
    3:['kafka : topic orders','#FF9466',[['{"orderId":1040,"status":"PAID"}'],['{"orderId":1041,"status":"PAID"}'],['{"orderId":1042,"status":"CREATED"}','#FFB547'],['^C  Processed 3 messages','#97A3BE']]],
    4:['postgres : shop','#64A0FF',[['  id  | status'],[' ------+---------','#97A3BE'],[' 1041 | PAID'],[' 1042 | PENDING','#FFB547']]]};
  const ROOMC={1:0x3FD5C2,2:0x3FD5C2,3:0xFF9466,4:0x64A0FF},WHO={1:'backend',2:'backend',3:'kafka',4:'postgres'};
  const st={yaw:0};drag(c,st);const OUT={p:V(0,9,17),l:V(0,1.4,0)},IN={p:V(0,3.6,6.6),l:V(0,3.4,-3)};
  cam.position.copy(OUT.p);const look=OUT.l.clone();let sc_=.19,spinT=-1e9;
  function setStage(n){const was=stage;stage=n;t0=performance.now();const inN=n>=1&&n<=4;if(inN&&(was<1||was>4||WHO[n]!==WHO[was]))spinT=performance.now()}
  return {setStage,render(t){size(r,cam,c);const el=(performance.now()-t0)/1000,inside=stage>=1&&stage<=4;
    const tgt=inside?IN:OUT;cam.position.lerp(tgt.p,.045);look.lerp(tgt.l,.06);cam.lookAt(look);g.rotation.y=st.yaw*.5;
    const spin=Math.exp(-(performance.now()-spinT)/700);const tgS=inside?Math.max(.19,1-spin*.8):.19;sc_+=(tgS-sc_)*.08;I.visible=sc_>.2;I.scale.setScalar(sc_);I.rotation.y=-spin*Math.PI*1.2;
    O.visible=sc_<.6;Object.entries(boxes).forEach(([n,b])=>{b.visible=!inside||sc_<.3;b.userData.core.rotation.y=t*.002;b.userData.core.rotation.x=t*.0013;b.userData.m.material.emissiveIntensity=(stage===5&&n==='backend')?.9:.4});
    if(inside){const col=ROOMC[stage];roomE.material.color.setHex(col);roomW.material.color.setHex(col);swirlM.color.setHex(col);const [ti,tc,ls]=CONTENT[stage];scr.draw(ti,tc,ls,Math.min(ls.length,Math.floor(el/.55)+1))}
    Object.entries(where).forEach(([n,l])=>l.visible=inside&&WHO[stage]===n);
    const sp=.0004+spin*.012;for(let i=0;i<N;i++){const d=pd[i];d[0]+=sp*(1+(i%5)*.2);pp[i*3]=Math.cos(d[0])*d[1];pp[i*3+2]=Math.sin(d[0])*d[1]}pg.attributes.position.needsUpdate=true;
    kz.visible=inside&&stage===3;evs.forEach((e,i)=>{const k=((t*.00012)+i/6)%1;e.position.set(-6+k*12,1.45,-3.6);e.rotation.y=t*.002});
    pzg.visible=inside&&stage===4;rings[2].material.color.setHex(Math.sin(t*.008)>0?0xFFB547:0x6b5320);
    lgz.visible=inside&&stage===2;sheets.forEach((sh,i)=>{const k=((t*.0002)+i/5)%1;sh.position.set(4.6,1+k*4,-3.4);sh.material.opacity=.9*(1-Math.abs(k-.5)*1.6)});
    kL.visible=!inside;stdout.visible=stage===5;strm.forEach((d,i)=>{d.visible=stage===5;const k=((t*.0006)+i/8)%1;d.position.set(k*6,1.5+k*3,0)});
    r.render(sc,cam)}}}

/* D · docker compose: a walled network region */
function initCompose(){const c=$('#compose3d'),{r,sc,cam,g}=dk(c);let stage=0,t0=0;
  mbox(g,22,.5,15,0x111827,{at:V(0,-.25,0),ec:0x3a4766,eo:.8,emi:.05});lab(g,'EC2 host','#C9D2E3',V(-8.6,0,7.6),.8,true);
  const reg=new THREE.Group();g.add(reg);mbox(reg,15,.12,10,0x1f8f84,{at:V(0,.08,0),op:.3,ec:0x3FD5C2,eo:1,emi:.5});
  const wallM=()=>new THREE.MeshBasicMaterial({color:0x3FD5C2,transparent:true,opacity:.13,side:THREE.DoubleSide});
  const wall=(w,x,z,ry)=>{const geo=new THREE.PlaneGeometry(w,2.4);const m=new THREE.Mesh(geo,wallM());m.position.set(x,1.25,z);m.rotation.y=ry;const e=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0x3FD5C2}));m.add(e);reg.add(m)};
  wall(15,0,-5,0);wall(10,-7.5,0,Math.PI/2);wall(10,7.5,0,Math.PI/2);wall(6.2,-4.4,5,0);wall(6.2,4.4,5,0);
  lab(reg,'Docker network · shop_default','#3FD5C2',V(0,3.5,-5),1.15);lab(reg,'inside the wall, everyone can call everyone by name','#7FE8DA',V(0,2.7,-5),.8,true);
  const S={};[['frontend','frontend :80',0,2.4,0xFFB547],['backend','backend :8080',0,-1.2,0x3FD5C2],['postgres','postgres :5432',-4.6,-3.2,0x64A0FF],['kafka','kafka :9092',4.6,-3.2,0xFF9466]].forEach(([k,n,x,z,col])=>{
    const b=new THREE.Group();b.position.set(x,.15,z);mbox(b,2.6,1.6,1.9,col,{at:V(0,.8,0),op:.88,emi:.35,ec:0xEBF0F9,eo:.5});const l=label(n,'#'+col.toString(16).padStart(6,'0'),1.05);l.position.set(0,2.4,0);b.add(l);b.scale.setScalar(.001);g.add(b);S[k]={b}});
  const delay={postgres:0,kafka:.2,backend:1,frontend:1.9};
  const door=new THREE.Mesh(new THREE.TorusGeometry(1.1,.14,12,40,Math.PI),std(0xFFB547,{emissive:0xFFB547,emissiveIntensity:.6}));door.position.set(0,.15,5);g.add(door);const dL=lab(g,'the only door · port 3000 → 80','#FFB547',V(2.6,3.1,5.3),.8);
  const br=new THREE.Group();br.position.set(-4.6,1.3,7.6);g.add(br);mbox(br,3,1.8,.15,0x1a2236,{at:V(0,0,0),ec:0xEBF0F9,eo:.9,emi:.2});const bl=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.3),new THREE.MeshBasicMaterial({color:0xFFB547}));bl.position.set(0,.55,.09);br.add(bl);
  lab(g,'browser · localhost:3000','#EBF0F9',V(-4.6,2.8,7.6),.85);
  const vols=[[-9.4,-5,'pgdata','postgres'],[9.4,-5,'kafkadata','kafka']].map(([x,z,n,svc])=>{const gr=new THREE.Group();g.add(gr);const cy=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,1.3,32),std(0xA193FF,{emissive:0xA193FF,emissiveIntensity:.4}));cy.position.set(x,.65,z);gr.add(cy);lab(gr,'volume '+n,'#A193FF',V(x,2,z),.6);
    const sx=svc==='postgres'?-4.6:4.6;const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(x,.65,z),V(sx,.65,-3.2)]),new THREE.LineDashedMaterial({color:0xA193FF,dashSize:.25,gapSize:.18}));ln.computeLineDistances();g.add(ln);return {cy,ln}});
  const P=(pts,col,txt,tpos)=>{const cv=new THREE.CatmullRomCurve3(pts);const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(cv.getPoints(80)),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.85}));g.add(ln);
    const d=new THREE.Mesh(new THREE.SphereGeometry(.28,14,14),new THREE.MeshBasicMaterial({color:col}));g.add(d);const l=txt?lab(g,txt,'#'+col.toString(16).padStart(6,'0'),tpos,.88):null;return {cv,ln,d,l}};
  const fe=V(0,1,2.4),be=V(0,1,-1.2),pq=V(-4.6,1,-3.2),kf=V(4.6,1,-3.2);
  const pIn=P([V(-4.6,1.2,7.4),V(-1.6,.9,6.4),V(0,.8,5),fe],0xFFB547,'localhost:3000 → frontend:80',V(-3.4,2.1,6.1));
  const pFB=P([fe,V(.4,1.4,.6),be],0x3FD5C2,'http://backend:8080/api/orders',V(3.8,1.9,.8));
  const pBP=P([be,V(-2.4,1.5,-2.4),pq],0x64A0FF,'postgres:5432',V(-2.6,2.4,-1.6));
  const pBK=P([be,V(2.4,1.5,-2.4),kf],0xFF9466,'kafka:9092 · order-created',V(3.4,2.6,-1.4));
  const pX1=P([V(6.2,1,8.6),V(6.2,1,6.8),V(6.2,1,5.15)],0xFF6F8E,'backend:8080? no door',V(3.9,2.3,7.4));
  const pX2=P([V(9.4,1,1.2),V(8.5,1,1.2),V(7.6,1,1.2)],0xFF6F8E,'postgres:5432? no door',V(5,2.7,2.4));
  const st={yaw:0};drag(c,st);cam.position.set(0,12.8,18.4);
  function setStage(n){stage=n;t0=performance.now()}
  const run=(p,k,on)=>{p.ln.visible=p.d.visible=on;if(p.l)p.l.visible=on;if(on)p.d.position.copy(p.cv.getPoint(k))};
  return {setStage,render(t){size(r,cam,c);const el=(performance.now()-t0)/1000;g.rotation.y=st.yaw*.6+(reduce?0:Math.sin(t*.0001)*.05);cam.lookAt(0,.2,.6);
    const regOn=stage>=1&&stage<5;const rs=stage===5?c01(1-el/.8):regOn?1:0;reg.visible=rs>0;reg.scale.set(1,Math.max(.01,rs),1);
    Object.entries(S).forEach(([k,o])=>{let s=.001;if(regOn)s=stage===1?c01((el-.6-delay[k])/.4):1;if(stage===5)s=c01(1-el/.7);o.b.scale.setScalar(Math.max(.001,ease(s)));o.b.position.y=.15-(1-s)});
    door.visible=dL.visible=regOn;
    const c2=(el%2.6)/2.6;run(pIn,c2,stage===2);
    const c3=(el%3.2)/3.2;run(pFB,c01(c3/.4),stage===3);run(pBP,c01((c3-.4)/.6),stage===3);run(pBK,c01((c3-.4)/.6),stage===3);if(stage===3){pFB.ln.visible=pBP.ln.visible=pBK.ln.visible=true}
    const c4=c01(((el%2.2)/2.2)/.75);run(pX1,c4,stage===4);run(pX2,c4,stage===4);
    vols.forEach(v=>{v.cy.material.emissiveIntensity=stage===5?.5+.4*Math.sin(t*.008):.4;v.ln.visible=regOn});
    r.render(sc,cam)}}}

/* E · our trading app on EKS */
function initEks(){const c=$('#eks3d'),{r,sc,cam,g}=dk(c);g.add(new THREE.GridHelper(50,50,0x253350,0x18233a));let stage=0,t0=0;
  const cp=new THREE.Group();g.add(cp);mbox(cp,16,.6,3,0x2a2350,{at:V(0,5.6,-8),ec:0xA193FF,eo:1,emi:.4});lab(cp,'EKS control plane · run by AWS','#A193FF',V(0,7.3,-8),1.2);
  ['API server','scheduler','controllers','etcd'].forEach((n,i)=>{mbox(cp,3.2,.5,2,0x3a3370,{at:V(-5.7+i*3.8,6.2,-8),emi:.5});lab(cp,n,'#EBF0F9',V(-5.7+i*3.8,6.85,-8),.75,true)});
  const NA=V(-5,0,0),NB=V(5,0,0);
  const node=(p,n)=>{const m=mbox(g,8.6,.5,6.2,0x1d2b47,{at:p.clone().setY(.25),ec:0x64A0FF,eo:.9,emi:.15});const l=lab(g,n,'#64A0FF',p.clone().add(V(0,.3,3.7)),1,true);return {m,l}};
  const nA=node(NA,'node 1 · EC2 t3.medium · AZ a'),nB=node(NB,'node 2 · EC2 t3.medium · AZ b');
  const nsBox=new THREE.BoxGeometry(20,3.6,8.4);const ns=new THREE.LineSegments(new THREE.EdgesGeometry(nsBox),new THREE.LineBasicMaterial({color:0x3FD5C2,transparent:true,opacity:.8}));ns.position.set(0,1.8,0);g.add(ns);
  lab(g,'namespace: trading','#3FD5C2',V(-7,4,-4.2),1);
  const slot=(N,i)=>N.clone().add(V([-2.6,0,2.6][i%3],1.15,[-1.4,1.4][Math.floor(i/3)]));
  const PODS=[['frontend',0xFFB547,NA,0],['auth-service',0x3FD5C2,NA,1],['kafka-0',0xFF9466,NA,3],['mailpit',0x97A3BE,NA,4],['order-service',0x64A0FF,NB,0],['executor-service',0xA193FF,NB,1]];
  const pods=PODS.map(([n,col,N,i],k)=>{const p=new THREE.Group();const m=mbox(p,1.7,1.3,1.7,col,{at:V(0,0,0),emi:.35,ec:0xEBF0F9,eo:.5});const l=label(n,'#'+col.toString(16).padStart(6,'0'),.8);l.position.set(0,1.35,0);p.add(l);p.position.copy(slot(N,i));p.scale.setScalar(.001);g.add(p);return {p,m,home:slot(N,i),alt:slot(NA,[2,5][Math.max(0,k-4)]),col,n}});
  const disk=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.7,24),std(0xA193FF,{emissive:0xA193FF,emissiveIntensity:.4}));disk.position.copy(slot(NA,3)).add(V(1.25,-.5,0));disk.visible=false;g.add(disk);const dL=lab(g,'EBS gp3 · 2Gi','#A193FF',disk.position.clone().add(V(1.6,.2,0)),.65,true);
  const job=new THREE.Group();mbox(job,1.5,1.1,1.5,0xFF9466,{at:V(0,0,0),op:.5,emi:.3,ec:0xFF9466,eo:1});const jL=label('Job kafka-topics','#FF9466',.7);jL.position.set(0,1.1,0);job.add(jL);job.position.copy(slot(NA,5));job.visible=false;g.add(job);
  const cards=new THREE.Group();g.add(cards);mbox(cards,3.4,2,.2,0x1f8f84,{at:V(-12.6,2.6,1),ec:0x3FD5C2,eo:1,emi:.3});lab(cards,'ConfigMap app-config','#3FD5C2',V(-12.6,4,1),.75);mbox(cards,3.4,2,.2,0x6b2338,{at:V(-12.6,2.6,-2.6),ec:0xFF6F8E,eo:1,emi:.3});lab(cards,'Secret app-secrets','#FF6F8E',V(-12.6,4,-2.6),.75);
  const envL=[];for(let i=0;i<6;i++){const ln=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x3FD5C2,transparent:true,opacity:.4}));g.add(ln);envL.push(ln)}
  const alb=new THREE.Group();g.add(alb);mbox(alb,7,.8,1.2,0xFFB547,{at:V(3,.5,6.6),emi:.4,op:.9});lab(alb,'AWS load balancer · from ingress.yaml','#FFB547',V(3,1.6,6.6),.85);
  const user=new THREE.Mesh(new THREE.SphereGeometry(.6,24,24),std(0xEBF0F9,{emissive:0x555c6c,emissiveIntensity:.5}));user.position.set(3,1,10);g.add(user);lab(g,'users · internet','#EBF0F9',V(3,2.1,10),.8);
  const routes=[[0,'/  → frontend'],[1,'/api/auth → auth-service'],[4,'/api/orders → order-service']].map(([pi,txt],k)=>{const cv=()=>new THREE.CatmullRomCurve3([V(3,1,9.6),V(3+(k-1)*2.4,.6,6.6),pods[pi].p.position.clone().add(V(0,.4,1.6)),pods[pi].p.position.clone()]);const ln=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xFFB547,transparent:true,opacity:.7}));g.add(ln);const d=new THREE.Mesh(new THREE.SphereGeometry(.22,12,12),new THREE.MeshBasicMaterial({color:0xFFB547}));g.add(d);const l=lab(g,txt,'#FFB547',V((k-1)*6,3.3,5),.75);return {cv,ln,d,l,pi}});
  const msg=lab(g,'','#EBF0F9',V(0,4.6,3),.7);const msgs={};const setMsg=(t,col)=>{if(!msgs[t]){msgs[t]=label(t,col,1);msgs[t].position.set(0,5,3.2);g.add(msgs[t])}Object.values(msgs).forEach(m=>m.visible=false);msgs[t].visible=true};msg.visible=false;
  const st={yaw:0};drag(c,st);cam.position.set(-1.5,11.5,18.5);
  function setStage(n){stage=n;t0=performance.now()}
  return {setStage,render(t){size(r,cam,c);const el=(performance.now()-t0)/1000;g.rotation.y=st.yaw*.6+(reduce?0:Math.sin(t*.0001)*.05);cam.lookAt(-1,1.8,0);
    const nodeDead=stage===4;nB.m.material.color.setHex(nodeDead?0x3a1520:0x1d2b47);nB.m.children[0].material.color.setHex(nodeDead?0xFF6F8E:0x64A0FF);
    pods.forEach((o,k)=>{let s=0;if(stage>=1)s=stage===1?c01((el-.3-k*.35)/.4):1;let pos=o.home;if(stage===4&&k>=4){pos=el<1?o.home:o.alt;s=el<1?c01(1-el):c01(el-1.2)}
      if(stage===3&&k===4){const ph=el%5;o.m.material.color.setHex(ph<1.6?0xFF6F8E:o.col);o.m.material.emissive.setHex(ph<1.6?0xFF6F8E:o.col);s=ph<1.2?1:ph<1.8?c01(1-(ph-1.2)/.6):c01((ph-1.8)/.5)}else{o.m.material.color.setHex(stage===5&&el>.8+k*.5?0x6EDC92:o.col);o.m.material.emissive.setHex(stage===5&&el>.8+k*.5&&k!==2&&k!==3?0x6EDC92:o.col)}
      if(stage===5&&(k===2||k===3)){o.m.material.color.setHex(o.col);o.m.material.emissive.setHex(o.col)}
      o.p.position.lerp(pos,.12);o.p.scale.setScalar(Math.max(.001,ease(s)))});
    disk.visible=dL.visible=stage>=1;job.visible=stage===1&&el>.5&&el<4.5;if(job.visible)job.children[0].material.opacity=el>3.2?.5*(1-(el-3.2)/1.3):.5;
    envL.forEach((ln,k)=>{const on=stage===1&&el>2.4;ln.visible=on;if(on){const p=pods[k].p.position;ln.geometry.setFromPoints([V(-10.9,2.6,k%2?-2.6:1),V(-8,3,0),p])}});
    routes.forEach(rt=>{const on=stage===2;rt.ln.visible=rt.d.visible=rt.l.visible=on;if(on){const cv=rt.cv();rt.ln.geometry.setFromPoints(cv.getPoints(40));rt.d.position.copy(cv.getPoint(((el*.4)+rt.pi*.13)%1))}});
    const M={1:['kubectl apply: the scheduler places every pod','#EBF0F9'],3:['liveness probe failed → pod restarted','#FF6F8E'],4:['node 2 lost → pods rescheduled on node 1','#FF6F8E'],5:['rolling update: new pods ready, old ones removed','#6EDC92']};
    if(M[stage])setMsg(...M[stage]);else Object.values(msgs).forEach(m=>m.visible=false);
    r.render(sc,cam)}}}

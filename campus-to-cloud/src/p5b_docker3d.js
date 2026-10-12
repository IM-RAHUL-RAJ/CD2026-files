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

/* C · docker exec: inside the container */
function initExec(){const c=$('#exec3d'),{r,sc,cam,g}=dk(c);let stage=0,t0=0;
  const kern=mbox(g,24,.6,15,0x0d3d3a,{at:V(0,-.32,0),ec:0x3FD5C2,eo:.9,emi:.25});const kg=new THREE.GridHelper(24,24,0x3FD5C2,0x1a5c56);kg.position.y=.0;kg.scale.z=15/24;g.add(kg);
  const kL=lab(g,'Linux kernel · shared by every container','#3FD5C2',V(0,0,7.8),.8);
  const O=new THREE.Group();g.add(O);const boxes={};
  [['web',-5.5,0xFFB547],['api',0,0x3FD5C2],['db',5.5,0x64A0FF]].forEach(([n,x,col])=>{const b=new THREE.Group();b.position.set(x,0,0);
    const m=mbox(b,3,2.6,3,col,{at:V(0,1.3,0),op:.16,ec:col,eo:1,emi:.4});const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.45,0),new THREE.MeshBasicMaterial({color:col,wireframe:true}));core.position.y=1.3;b.add(core);b.userData.core=core;
    const l=label(n,'#'+col.toString(16).padStart(6,'0'),.7);l.position.set(0,3.4,0);b.add(l);O.add(b);boxes[n]=b});
  // host processes (dim specks on the kernel, invisible from inside)
  const hp=[];for(let i=0;i<70;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.07,6,6),new THREE.MeshBasicMaterial({color:0x97A3BE,transparent:true,opacity:.5}));s.position.set((Math.random()-.5)*22,.08,(Math.random()-.5)*13);if(Math.abs(s.position.z)<2.2&&Math.abs(s.position.x)<8)s.position.z+=4;O.add(s);hp.push(s)}
  // inside world
  const I=new THREE.Group();g.add(I);I.visible=false;
  const room=new THREE.BoxGeometry(16,8,14);room.translate(0,4,0);I.add(new THREE.LineSegments(new THREE.EdgesGeometry(room),new THREE.LineBasicMaterial({color:0x3FD5C2})));
  I.add(new THREE.Mesh(room,new THREE.MeshBasicMaterial({color:0x3FD5C2,transparent:true,opacity:.05,side:THREE.BackSide})));
  const floorM=new THREE.MeshBasicMaterial({color:0x0C1220,transparent:true,opacity:.85});const floor=new THREE.Mesh(new THREE.PlaneGeometry(16,14),floorM);floor.rotation.x=-Math.PI/2;floor.position.y=.02;I.add(floor);
  const fgrid=new THREE.GridHelper(14,14,0x3FD5C2,0x1d3b4a);fgrid.position.y=.04;fgrid.scale.set(16/14,1,1);I.add(fgrid);
  const N=1100,pp=new Float32Array(N*3),pd=[];for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,rr=4+Math.random()*3.5,y=1+Math.random()*6.5;pd.push([a,rr,y]);pp[i*3]=Math.cos(a)*rr;pp[i*3+1]=y;pp[i*3+2]=Math.sin(a)*rr}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));const swirl=new THREE.Points(pg,new THREE.PointsMaterial({color:0x7FE8DA,size:.07,transparent:true,opacity:.8}));I.add(swirl);
  const nsL=['PID','NET','MNT','UTS','IPC','USER'].map(n=>{const l=plainLabel(n,'#3FD5C2',.6,800);I.add(l);return l});
  const pid=new THREE.Group();I.add(pid);const o1=new THREE.Mesh(new THREE.SphereGeometry(.85,32,32),std(0xFFB547,{emissive:0xFFB547,emissiveIntensity:.6}));o1.position.set(-4.6,3.3,-3);pid.add(o1);
  const o2=new THREE.Mesh(new THREE.SphereGeometry(.45,24,24),std(0x6EDC92,{emissive:0x6EDC92,emissiveIntensity:.6}));o2.position.set(-2.4,2.1,-1.6);pid.add(o2);
  pid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([o1.position,o2.position]),new THREE.LineBasicMaterial({color:0xEBF0F9,transparent:true,opacity:.5})));
  lab(pid,'PID 1 · python app.py','#FFB547',V(-4.6,4.6,-3),.55);lab(pid,'PID 7 · sh (you)','#6EDC92',V(-2.4,2.95,-1.6),.45);
  const fs=new THREE.Group();I.add(fs);['/var','/usr','/etc','/bin','/app'].forEach((n,i)=>{mbox(fs,2.8,.38,1.7,0x64A0FF,{at:V(2.9,.9+i*.6,-5),op:.6,ec:0x9CC2FF,eo:.9,emi:.4});const l=plainLabel(n,'#EBF0F9',.34,700);l.position.set(2.9,.9+i*.6,-4);fs.add(l)});
  lab(fs,'root filesystem = image layers','#64A0FF',V(2.9,4.3,-5),.55);
  const net=new THREE.Group();I.add(net);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,.12,12,48),std(0x6EDC92,{emissive:0x6EDC92,emissiveIntensity:.7}));ring.position.set(0,5.6,-6.2);net.add(ring);
  net.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0,5.6,-6.2),V(0,5.6,-7),V(0,5.6,-12)]),new THREE.LineBasicMaterial({color:0x6EDC92})));
  lab(net,'eth0 · 172.18.0.3','#6EDC92',V(0,4.1,-6.2),.5);lab(net,'hostname: 3f2a9c1b','#EBF0F9',V(0,7.1,-6.2),.5);
  const here=lab(I,'you are inside api · 3f2a9c1b','#EBF0F9',V(0,4.6,-6.4),.75);const kIn=lab(I,'same kernel as the host · 6.1.0-aws','#3FD5C2',V(0,-.1,2.5),.6);
  const out=lab(g,'sh ended · app (PID 1) still running','#6EDC92',V(0,4.3,0),.55);
  const st={yaw:0,pitch:0};drag(c,st);const OUT={p:V(0,9,17),l:V(0,1.4,0)},IN={p:V(0,3.5,6.4),l:V(0,3.1,-3)},DOWN={p:V(0,6.4,4.6),l:V(0,-.6,-1.5)};
  cam.position.copy(OUT.p);const look=OUT.l.clone();let sc_=0.19,spin=0;
  let spinT=-1e9;function setStage(n){const was=stage;stage=n;t0=performance.now();if(n===1&&was<1)spinT=performance.now()}
  return {setStage,render(t){size(r,cam,c);const el=(performance.now()-t0)/1000,inside=stage>=1&&stage<=5;
    const tgt=stage===5?DOWN:inside?IN:OUT;cam.position.lerp(tgt.p,.045);look.lerp(tgt.l,.06);cam.lookAt(look);g.rotation.y=st.yaw*.5;
    sc_+=((inside?1:.19)-sc_)*.06;I.visible=sc_>.2;I.scale.setScalar(sc_);spin=Math.exp(-(performance.now()-spinT)/700);I.rotation.y=-spin*Math.PI*1.4;
    O.visible=sc_<.6;['web','db'].forEach(n=>boxes[n].visible=!inside||sc_<.3);boxes.api.visible=sc_<.25;
    Object.values(boxes).forEach(b=>{b.userData.core.rotation.y=t*.002;b.userData.core.rotation.x=t*.0013});
    const sp=.0004+spin*.01;for(let i=0;i<N;i++){const d=pd[i];d[0]+=sp*(1+(i%5)*.2);pp[i*3]=Math.cos(d[0])*d[1];pp[i*3+2]=Math.sin(d[0])*d[1]}pg.attributes.position.needsUpdate=true;
    nsL.forEach((l,i)=>{l.position.set(-6.2+i*2.48,7.25+.12*Math.sin(t*.002+i),-6.6)});
    pid.visible=stage>=2&&stage<5&&inside;fs.visible=stage>=3&&stage<5&&inside;net.visible=stage===4&&inside;
    floorM.opacity+=((stage===5?.06:.85)-floorM.opacity)*.08;fgrid.visible=stage!==5;kIn.visible=stage===5;kL.visible=!inside;
    kern.material.emissiveIntensity=stage===5?.35+.3*Math.sin(t*.006):.25;o1.scale.setScalar(1+.06*Math.sin(t*.005));
    out.visible=stage===6;here.visible=stage===1;r.render(sc,cam)}}}

/* D · docker compose network */
function initCompose(){const c=$('#compose3d'),{r,sc,cam,g}=dk(c);let stage=0,t0=0;
  mbox(g,21,.5,14,0x111827,{at:V(0,-.25,0),ec:0x3a4766,eo:.8,emi:.05});lab(g,"Rahul's laptop · Docker host",'#C9D2E3',V(-3.6,0,7.3),.8,true);
  const netM=new THREE.Group();g.add(netM);mbox(netM,15,.12,10,0x1f8f84,{at:V(0,.08,0),op:.35,ec:0x3FD5C2,eo:1,emi:.5});lab(netM,'network: ticketwave_default','#3FD5C2',V(-4.4,.5,5.4),.8);
  const S={};[['web','web · nginx :80',0,3,0xFFB547],['api','api :3000',0,-.4,0x3FD5C2],['db','db · postgres :5432',-4.6,-3.4,0x64A0FF],['redis','redis :6379',4.6,-3.4,0xFF6F8E]].forEach(([k,n,x,z,col])=>{
    const b=new THREE.Group();b.position.set(x,.15,z);mbox(b,2.6,1.7,2.1,col,{at:V(0,.85,0),op:.85,emi:.35,ec:0xEBF0F9,eo:.5});const l=label(n,'#'+col.toString(16).padStart(6,'0'),.95);l.position.set(0,2.6,0);b.add(l);b.scale.setScalar(.001);g.add(b);S[k]={b,home:V(x,.15,z),col}});
  const delay={db:0,redis:.15,api:1,web:2};
  const dns=new THREE.Group();g.add(dns);const tw=new THREE.Mesh(new THREE.CylinderGeometry(.35,.55,2.2,16),std(0x6EDC92,{emissive:0x6EDC92,emissiveIntensity:.4}));tw.position.set(-5.6,1.2,1.6);dns.add(tw);lab(dns,'DNS 127.0.0.11','#6EDC92',V(-5.6,2.9,1.6),.7);
  const vol=new THREE.Group();g.add(vol);const cy=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,1.3,32),std(0xA193FF,{emissive:0xA193FF,emissiveIntensity:.4}));cy.position.set(-8.9,.65,-3.4);vol.add(cy);lab(vol,'volume db-data','#A193FF',V(-8.9,2.1,-3.4),.7);
  const vline=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-8,.65,-3.4),V(-5.9,.65,-3.4)]),new THREE.LineDashedMaterial({color:0xA193FF,dashSize:.2,gapSize:.15}));vline.computeLineDistances();g.add(vline);
  const gate=new THREE.Mesh(new THREE.TorusGeometry(.75,.12,12,40,Math.PI),std(0xFFB547,{emissive:0xFFB547,emissiveIntensity:.5}));gate.position.set(0,.15,5);g.add(gate);const gL=lab(g,'8080 → 80','#FFB547',V(2.2,1,5.2),.7);
  const you=new THREE.Mesh(new THREE.SphereGeometry(.55,24,24),std(0xEBF0F9,{emissive:0x555c6c,emissiveIntensity:.5}));you.position.set(0,1,8.6);g.add(you);lab(g,'you · localhost:8080','#EBF0F9',V(0,2.1,8.6),.7);
  const bad=new THREE.Mesh(new THREE.SphereGeometry(.45,20,20),std(0xFF6F8E,{emissive:0xFF6F8E,emissiveIntensity:.5}));bad.position.set(8.8,1,-6);g.add(bad);const badL=lab(g,'outsider → db:5432','#FF6F8E',V(8.6,2.2,-6),.8);
  const xm=lab(g,'✗ no published port','#FF6F8E',V(7,1.8,-3.6),.8);
  const q1=lab(g,'“db?”','#EBF0F9',V(0,0,0),.65),q2=lab(g,'172.18.0.4','#6EDC92',V(0,0,0),.65);
  const P=(pts,col)=>{const cv=new THREE.CatmullRomCurve3(pts);const ln=new THREE.Line(new THREE.BufferGeometry().setFromPoints(cv.getPoints(80)),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.85}));g.add(ln);const d=new THREE.Mesh(new THREE.SphereGeometry(.28,14,14),new THREE.MeshBasicMaterial({color:col}));g.add(d);return {cv,ln,d}};
  const api=V(0,1,-.4),db=V(-4.6,1,-3.4),rd=V(4.6,1,-3.4),web=V(0,1,3),dn=V(-5.6,1.6,1.6);
  const pQ=P([api,V(-2.6,2.2,.8),dn],0xEBF0F9),pR=P([dn,V(-2.6,2.6,.8),api],0x6EDC92),pDB=P([api,V(-2.4,1.6,-2),db],0x3FD5C2);
  const pIn=P([V(0,1,8.6),V(0,.6,5),web,api,V(2.4,1.4,-2),rd],0xFFB547),pIn2=P([api,V(-2.4,1.3,-2.2),db],0xFFB547);
  const pBad=P([V(8.8,1,-6),V(8.1,1,-5.3),V(7.6,1,-4.6)],0xFF6F8E);
  const st={yaw:0};drag(c,st);cam.position.set(0,13.2,18.6);
  function setStage(n){stage=n;t0=performance.now()}
  const run=(p,k,on)=>{p.ln.visible=p.d.visible=on;if(on)p.d.position.copy(p.cv.getPoint(k))};
  return {setStage,render(t){size(r,cam,c);const el=(performance.now()-t0)/1000;g.rotation.y=st.yaw*.6+(reduce?0:Math.sin(t*.0001)*.06);cam.lookAt(0,-.2,.6);
    const netOn=stage>=1&&stage<5;netM.visible=netOn||stage===5&&el<.8;netM.children.forEach(m=>{if(m.material){m.material.opacity=m.isSprite?1:(stage===5?.35*c01(1-el/.8):.35)}});
    Object.entries(S).forEach(([k,o])=>{let s=.001;if(stage>=1&&stage<5)s=stage===1?c01((el-.5-delay[k])/.4):1;if(stage===5)s=c01(1-el/.7);o.b.scale.setScalar(Math.max(.001,ease(s)));o.b.position.y=.15-(1-s)*1});
    dns.visible=netOn;gate.visible=gL.visible=netOn;
    const cyc=(el%3)/3;
    run(pQ,c01(cyc/.4),stage===2&&cyc<.4);run(pR,c01((cyc-.4)/.3),stage===2&&cyc>=.4&&cyc<.7);run(pDB,c01((cyc-.7)/.3),stage===2&&cyc>=.7);
    q1.visible=stage===2&&cyc<.4;if(q1.visible)q1.position.copy(pQ.d.position).add(V(0,.6,0));q2.visible=stage===2&&cyc>=.4&&cyc<.7;if(q2.visible)q2.position.copy(pR.d.position).add(V(0,.6,0));
    const c3=(el%4)/4;run(pIn,c3,stage===3);run(pIn2,(c3*2)%1,stage===3);
    run(pBad,c01(((el%2.4)/2.4)/.7),stage===4);bad.visible=badL.visible=xm.visible=stage===4;
    cy.material.emissiveIntensity=stage===5?.5+.4*Math.sin(t*.008):.4;
    r.render(sc,cam)}}}

// Original, schematic joint animation. It intentionally does not pretend to be validated motion capture.
export async function mountExtendedMotion(dialog,holder,preset,kind){
 const canvas=holder.querySelector('canvas');
 const THREE=await import('three');
 const {OrbitControls}=await import('three/addons/controls/OrbitControls.js');
 if(!dialog.open||!dialog.isConnected)return ()=>{};
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});}
 catch{holder.querySelector('.motion-stage').insertAdjacentHTML('beforeend','<p class="motion-webgl-error">WebGL non disponibile. Consulta le istruzioni e il video sotto.</p>');return ()=>{};}
 renderer.setClearColor(0x101827);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,40);
 const controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2.5;controls.maxDistance=9;controls.target.set(0,1.1,0);
 scene.add(new THREE.HemisphereLight(0xf0f5ff,0x273344,2.2));
 const lamp=new THREE.DirectionalLight(0xffffff,2.8);lamp.position.set(-2,5,3);scene.add(lamp);
 const makeMat=(c,metalness=0)=>new THREE.MeshStandardMaterial({color:c,metalness,roughness:metalness?.3:.68});
 const skin=makeMat(0xe0ab8c),shirt=makeMat(0x2b5073),muscle=makeMat(0xd85c66),shorts=makeMat(0x45556d),silver=makeMat(0xb6c5d4,.7),dark=makeMat(0x39536b,.35),gold=makeMat(0xf5b935),base=makeMat(0x202c3b);
 const v=(x,y,z)=>new THREE.Vector3(x,y,z);
 const box=(p,sz,m)=>{const x=new THREE.Mesh(new THREE.BoxGeometry(...sz),m);x.position.copy(p);scene.add(x);return x};
 const ball=(p,r,m)=>{const x=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),m);x.position.copy(p);scene.add(x);return x};
 const place=(mesh,a,b)=>{const delta=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(v(0,1,0),delta.clone().normalize());mesh.scale.set(1,delta.length(),1)};
 const stick=(a,b,r,m)=>{const x=new THREE.Mesh(new THREE.CylinderGeometry(r,r,1,10),m);scene.add(x);place(x,a,b);return x};
 const b0=v(0,0,0);
 box(v(0,-.03,0),[6,.06,6],base);
 const shoulder=[v(-.36,1.56,0),v(.36,1.56,0)];
 const elbowNodes=[ball(b0,.095,skin),ball(b0,.095,skin)];
 const handNodes=[ball(b0,.083,skin),ball(b0,.083,skin)];
 const upper=[stick(b0,v(0,1,0),.105,muscle),stick(b0,v(0,1,0),.105,muscle)];
 const fore=[stick(b0,v(0,1,0),.08,skin),stick(b0,v(0,1,0),.08,skin)];
 const knees=[ball(b0,.115,skin),ball(b0,.115,skin)];
 const thigh=[stick(b0,v(0,1,0),.14,shorts),stick(b0,v(0,1,0),.14,shorts)];
 const shin=[stick(b0,v(0,1,0),.095,skin),stick(b0,v(0,1,0),.095,skin)];
 const feet=[box(b0,[.23,.15,.35],shorts),box(b0,[.23,.15,.35],shorts)];
 const chest=box(v(0,1.28,0),[.68,.73,.38],shirt);
 const musclePatch=box(v(0,1.44,-.21),[.65,.15,.05],muscle);
 const hipBox=box(v(0,.89,0),[.6,.28,.36],shorts);
 const head=ball(v(0,1.93,0),.22,skin);
 const neck=stick(v(0,1.65,0),v(0,1.78,0),.10,skin);
 const bar=stick(v(-1,1,0),v(1,1,0),.032,silver);
 const discs=[-1,1].map(side=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.10,24),dark);c.rotation.z=Math.PI/2;scene.add(c);return {side,c}});
 const dumbbells=[-1,1].map(()=>box(v(0,0,0),[.34,.11,.14],silver));
 const legRoller=stick(v(-.48,.40,-1),v(.48,.40,-1),.095,dark);
 if(kind==='lat'||kind==='legextension'){
  box(v(0,.47,.15),[.65,.08,.6],dark);
  box(v(0,.70,.5),[.65,.85,.12],dark);
  box(v(0,.26,.15),[.11,.45,.11],silver);
 }
 if(kind==='lat'){
  box(v(0,2.45,-.45),[2.2,.09,.14],dark);
  box(v(1.05,1.3,-.45),[.12,2.6,.14],silver);
 }
 // Upright reference coordinate: head at top; chest faces negative Z.
 const posePoints=t=>{
  const smooth=(1-Math.cos(t*Math.PI*2))/2;
  const sit=kind==='lat'||kind==='legextension';
  const squat=kind==='squat',row=kind==='row';
  const hipY=squat?1-.42*smooth:sit?.72:.96;
  const hipZ=squat?.22*smooth:row?.33:0;
  const torsoAngle=row?.8:(squat?.20*smooth:0);
  const shoulders=shoulder.map(q=>v(q.x,hipY+.64*Math.cos(torsoAngle),hipZ-.55*Math.sin(torsoAngle)));
  const headPos=v(0,hipY+1.02*Math.cos(torsoAngle),hipZ-.89*Math.sin(torsoAngle));
  const low=kind==='squat';
  const sh=shoulders;
  const hand=[],elbow=[];
  let barY=1.6,barZ=-.3,width=.95;
  if(kind==='squat'){
   barY=sh[0].y-.04;barZ=sh[0].z+.08;width=.88;
   for(const side of [-1,1]){hand.push(v(side*.54,barY,barZ));elbow.push(v(side*.49,barY-.22,barZ+.25));}
  }else if(kind==='curl'){
   const a=-.45+smooth*1.65;barY=.93+.52*smooth;barZ=-.43-.18*smooth;width=.83;
   for(const side of [-1,1]){elbow.push(v(side*.39,1.05,-.06));hand.push(v(side*.42,barY,barZ));}
  }else if(kind==='press'){
   barY=1.58+.87*smooth;barZ=-.20+.22*smooth;width=1.02;
   for(const side of [-1,1]){elbow.push(v(side*.66,1.33+.42*smooth,-.12));hand.push(v(side*.53,barY,barZ));}
  }else if(kind==='row'){
   barY=.37+.34*smooth;barZ=-.48-.20*smooth;width=.85;
   for(const side of [-1,1]){elbow.push(v(side*.53,.65+.28*smooth,.12-.15*smooth));hand.push(v(side*.44,barY,barZ));}
  }else if(kind==='lat'){
   barY=2.32-.79*smooth;barZ=-.40-.15*smooth;width=1.18;
   for(const side of [-1,1]){elbow.push(v(side*.68,1.70-.25*smooth,-.18));hand.push(v(side*.63,barY,barZ));}
  }else if(kind==='legextension'){
   barY=.5+.36*smooth;barZ=-.52-.48*smooth;width=.80;
   for(const side of [-1,1]){elbow.push(v(side*.42,1.08,.05));hand.push(v(side*.42,.92,-.17));}
  }
  return {smooth,hipY,hipZ,sh,headPos,hand,elbow,barY,barZ,width};
 };
 function update(t){
  const p=posePoints(t),{smooth,hipY,hipZ,sh,headPos,hand,elbow,barY,barZ,width}=p;
  head.position.copy(headPos);
  const chestPos=sh[0].clone().add(sh[1]).multiplyScalar(.5);
  chest.position.copy(chestPos).add(v(0,-.36,.035));chest.rotation.x=kind==='row'?.8:(kind==='squat'?.20*smooth:0);
  musclePatch.position.copy(chest.position).add(v(0,.08,-.215));musclePatch.rotation.x=chest.rotation.x;
  hipBox.position.set(0,hipY,hipZ);
  place(neck,chestPos.clone().add(v(0,-.06,0)),headPos.clone().add(v(0,-.14,0)));
  for(let i=0;i<2;i++){
   const side=i?1:-1;
   place(upper[i],sh[i],elbow[i]);place(fore[i],elbow[i],hand[i]);
   elbowNodes[i].position.copy(elbow[i]);handNodes[i].position.copy(hand[i]);
   const hip=v(side*.25,hipY-.1,hipZ);
   let knee,ankle;
   if(kind==='squat'){
    knee=v(side*.31,.57-.20*smooth,-.42+.18*smooth);
    ankle=v(side*.33,.13,-.43);
   }else if(kind==='lat'||kind==='legextension'){
    knee=v(side*.29,.60,-.54);
    const zz=kind==='legextension'?-1.02-.55*smooth:-.57;
    ankle=v(side*.30,kind==='legextension'?.10+.50*smooth:.12,zz);
   }else{
    knee=v(side*.29,.57,-.06);
    ankle=v(side*.30,.12,-.23);
   }
   knees[i].position.copy(knee);feet[i].position.copy(ankle).add(v(0,-.05,-.12));
   place(thigh[i],hip,knee);place(shin[i],knee,ankle);
  }
  place(bar,v(-1.35,barY,barZ),v(1.35,barY,barZ));
  discs.forEach(({side,c})=>c.position.set(side*1.13,barY,barZ));
  if(kind==='press'||kind==='legextension'){
   bar.visible=false;discs.forEach(({c})=>c.visible=false);
  }
  dumbbells.forEach((mesh,i)=>{mesh.visible=kind==='press';mesh.position.copy(hand[i]).add(v(0,.01,0));});
  legRoller.visible=kind==='legextension';
  if(kind==='legextension')place(legRoller,feet[0].position.clone().add(v(0,.08,-.1)),feet[1].position.clone().add(v(0,.08,-.1)));
  if(kind==='squat'){bar.visible=true;discs.forEach(({c})=>c.visible=true);}
 }
 const samples=[];for(let k=0;k<=32;k++){const p=posePoints(k/64);samples.push(v(0,p.barY,p.barZ));}
 const route=new THREE.Line(new THREE.BufferGeometry().setFromPoints(samples),new THREE.LineDashedMaterial({color:0xf5b935,dashSize:.07,gapSize:.035}));
 route.computeLineDistances();scene.add(route);
 const hint=ball(samples[samples.length-1],.05,gold);
 const view=holder.querySelector('.motion-view-name');
 const setView=what=>{if(what==='front'){camera.position.set(0,2.5,5);view.textContent='Vista frontale';}else if(what==='side'){camera.position.set(5,2.2,0);view.textContent='Vista laterale';}else{camera.position.set(3.6,2.65,4.4);view.textContent='Vista 3/4';}controls.update();};
 setView('reset');update(0);
 let playing=true,speed=1,phase=0,prev=0,raf=0,disposed=false;
 const off=[];
 holder.querySelectorAll('[data-motion-control]').forEach(button=>{
  const fn=()=>{const cmd=button.dataset.motionControl;if(cmd==='play'){playing=!playing;button.textContent=playing?'⏸ Pausa':'▶ Avvia';button.setAttribute('aria-pressed',String(playing));}else setView(cmd);};
  button.addEventListener('click',fn);off.push(()=>button.removeEventListener('click',fn));
 });
 const selector=holder.querySelector('[data-motion-speed]');
 const onSpeed=()=>{speed=Number(selector.value)||1;};selector.addEventListener('change',onSpeed);
 const resize=()=>{if(disposed)return;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
 const ro=new ResizeObserver(resize);ro.observe(canvas);
 const tick=now=>{if(disposed||!dialog.open||!dialog.isConnected){dispose();return;}const dt=Math.min(.04,Math.max(0,(now-prev)/1000));prev=now;if(playing){phase=(phase+dt*speed/3.5)%1;update(phase);}controls.update();renderer.render(scene,camera);canvas.dataset.rendererReady='true';raf=requestAnimationFrame(tick);};
 raf=requestAnimationFrame(tick);
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);ro.disconnect();off.forEach(f=>f());selector.removeEventListener('change',onSpeed);controls.dispose();scene.traverse(obj=>{obj.geometry?.dispose?.();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material?.dispose?.();});renderer.dispose();}
 dialog.addEventListener('close',dispose,{once:true});
 return dispose;
}

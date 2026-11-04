// An original interactive 3D *schematic*, not captured athlete motion or a medical biomechanical model.
// The bench and JM bar paths are intentionally distinct; angles/grip widths illustrate concepts, not prescriptions.
import {extendedPresets,extendedPresetFor} from './motion-extensions.js';
export const motionPresets = {
  bench: {
    title:'Panca piana · bilanciere',muscles:'Petto · tricipiti · deltoidi anteriori',
    summary:'Vista 3D schematica: osserva presa, gomiti e traiettoria del bilanciere.',
    do:[
      'Presa leggermente più larga delle spalle, adattata affinché, nella fase bassa, gli avambracci siano pressoché verticali.',
      'Polsi allineati agli avambracci; scapole addotte e depresse, piedi stabili e glutei a contatto con la panca.',
      'Scendi verso lo sterno medio-basso, spesso vicino alla linea dei capezzoli ma non in un punto uguale per tutti.',
      'Gomiti in posizione intermedia, indicativamente 45–70° rispetto al busto; risali con leggera traiettoria verso le spalle.'
    ],
    dont:[
      'Non aprire i gomiti a 90° né tenerli forzatamente chiusi ai fianchi.',
      'Non rimbalzare il bilanciere sul petto e non lasciare collassare i polsi.',
      'Non usare la linea dei capezzoli come bersaglio universale: anatomia, presa e arco modificano il punto di contatto.'
    ],
    cue:'Presa ≈ 1,3–1,6× larghezza spalle (indicativa, non una misura obbligatoria) · Gomiti ~45–70°',
    top:{z:-.18,y:1.84},bottom:{z:.14,y:1.16},width:1.34,
  },
  jm:{
    title:'JM Press · bilanciere',muscles:'Tricipiti · supporto di spalle e pettorali',
    summary:'Traiettoria corta vicino alla zona del mento: NON è la stessa discesa della panca piana.',
    do:[
      'Presa circa alla larghezza delle spalle, polsi stabili e scapole fissate alla panca.',
      'Durante la discesa mantieni i gomiti controllati e spostali leggermente in avanti; il bilanciere si avvicina alla zona del mento.',
      'Arresta il movimento prima del viso e del collo, quindi estendi i gomiti senza lanciare il peso.',
      'Parti con carico leggero e confronta la dimostrazione con quella di JM Blakley.'
    ],
    dont:[
      'Non far toccare il bilanciere a viso, gola o collo.',
      'Non scendere al petto come nella panca stretta: qui la meccanica è diversa.',
      'Non piegare i polsi all’indietro né forzare un ROM doloroso per i gomiti.'
    ],
    cue:'Presa circa larghezza spalle · Gomiti controllati · Stop prima del volto',
    top:{z:-.30,y:1.80},bottom:{z:-.78,y:1.32},width:.94
  }
};
Object.assign(motionPresets,extendedPresets);
const n=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function motionPresetFor(name){
 const k=n(name);
 if(/\bjm press\b/.test(k))return 'jm';
 if(/panca piana|barbell bench press/.test(k)&&!(/presa stretta|jm/.test(k)))return 'bench';
 return extendedPresetFor(name);
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=items=>'<ul>'+items.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>';
export function motionPanelHtml(name){
 const kind=motionPresetFor(name),p=motionPresets[kind];
 if(!p)return '<section class="panel movement-unavailable"><p class="eyebrow">ANIMAZIONE 3D</p><h3>Traiettoria non ancora verificata per questo esercizio</h3><p>Evitiamo di mostrare un movimento generico o scorretto. Consulta sotto i video e le fonti, quando disponibili.</p></section>';
 return '<section class="motion-workspace" data-motion="'+kind+'">'+
 '<div class="motion-visual">'+
 '<div class="motion-stage"><div class="motion-stage-top"><span class="motion-live-label">MODELLO SCHEMATICO 3D · NON IN SCALA</span><span class="motion-view-name" aria-live="polite">Vista 3/4</span></div><canvas class="motion-canvas" aria-label="Animazione 3D interattiva di '+esc(p.title)+' con corpo, bilanciere e traiettoria" role="img"></canvas><div class="motion-help">Trascina per ruotare · Pizzica o usa la rotellina per lo zoom</div></div>'+
 '<div class="motion-controls">'+
 '<button type="button" class="secondary motion-play" data-motion-control="play" aria-pressed="true">⏸ Pausa</button>'+
 '<button type="button" class="secondary" data-motion-control="front">Frontale</button>'+
 '<button type="button" class="secondary" data-motion-control="side">Laterale</button>'+
 '<button type="button" class="secondary" data-motion-control="reset">3/4</button>'+
 '<label class="motion-speed-label">Velocità <select aria-label="Velocità animazione" data-motion-speed><option value="0.25">0,25×</option><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="1.5">1,5×</option></select></label>'+
 '</div><div class="motion-legend"><span><i class="motion-dot muscle"></i> Gruppo muscolare</span><span><i class="motion-dot bar"></i> Bilanciere</span><span><i class="motion-dot path"></i> Traiettoria</span></div>'+
 '<p class="helper">'+esc(p.summary)+' La geometria illustra la direzione del movimento, non angoli personalizzati misurati.</p></div>'+
 '<div class="motion-guidance"><p class="eyebrow">IMPOSTAZIONE E TRAIETTORIA</p><h3>'+esc(p.title)+'</h3><p class="motion-cue">'+esc(p.cue)+'</p>'+
 '<h4 class="motion-yes">✓ Cosa fare</h4>'+list(p.do)+
 '<h4 class="motion-no">✕ Cosa evitare</h4>'+list(p.dont)+
 '<p class="helper">Le indicazioni vanno adattate a mobilità, attrezzatura e comfort articolare. Il modello non sostituisce una valutazione dal vivo.</p></div></section>';
}
export async function mountMotionPanel(dialog){
 const holder=dialog?.querySelector('.motion-workspace');
 if(!holder)return ()=>{};
 const kind=holder.dataset.motion, p=motionPresets[kind];
 if(!p)return ()=>{};
 if(p.shape&&p.shape!=='supine'){const {mountExtendedMotion}=await import('./motion-extension-renderer.js');return mountExtendedMotion(dialog,holder,p,kind);}
 const canvas=holder.querySelector('canvas');
 const THREE=await import('three');
 const {OrbitControls}=await import('three/addons/controls/OrbitControls.js');
 if(!dialog.isConnected||!dialog.open)return ()=>{};
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});}
 catch{holder.querySelector('.motion-stage').insertAdjacentHTML('beforeend','<p class="motion-webgl-error">Visualizzazione 3D non disponibile su questo dispositivo. Consulta le istruzioni e il video sotto.</p>');return ()=>{};}
 renderer.setClearColor(0x101827,1);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(37,1,.1,45);
 camera.position.set(3.6,2.9,4.5);
 const ctl=new OrbitControls(camera,canvas);
 ctl.enableDamping=true;ctl.enablePan=false;
 ctl.minDistance=2.5;ctl.maxDistance=9;
 ctl.target.set(0,1.12,-.1);ctl.update();
 scene.add(new THREE.HemisphereLight(0xebf4ff,0x273343,2.2));
 const light=new THREE.DirectionalLight(0xffffff,3.0);light.position.set(-2,6,3);scene.add(light);
 const mat=(color,opts={})=>new THREE.MeshStandardMaterial({color,roughness:.63,metalness:0,...opts});
 const skin=mat(0xe7af8d),shirt=mat(0x27466f),muscle=mat(0xd85c66),shorts=mat(0x424b63),metal=mat(0xb8c8d9,{metalness:.8,roughness:.2}),grip=mat(0xf4b73e),benchmat=mat(0x293444),frame=mat(0x65748b),floor=mat(0x1c2737);
 const box=(x,y,z,w,h,d,m)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);scene.add(mesh);return mesh};
 const ball=(x,y,z,rad,m)=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(rad,18,12),m);mesh.position.set(x,y,z);scene.add(mesh);return mesh};
 const line=(a,b,r,m)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,1,10),m);scene.add(mesh);updateLine(mesh,a,b);return mesh};
 function updateLine(mesh,a,b){const a1=new THREE.Vector3(...a),b1=new THREE.Vector3(...b),v=b1.clone().sub(a1);mesh.position.copy(a1.add(b1).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());mesh.scale.y=v.length();}
 box(0,.01,0,8,.02,8,floor);
 box(0,.78,-.25,.87,.13,2.05,benchmat);
 box(0,.38,-.25,.15,.75,.18,frame);
 box(0,.14,.40,.78,.09,.62,frame);
 // Torso supine. Head at negative Z, feet at positive Z.
 box(0,.97,-.12,.76,.38,1.1,shirt);
 box(0,.94,-.10,.76,.06,.65,muscle);
 box(0,.96,.50,.64,.30,.35,shorts);
 ball(0,1.01,-.92,.24,skin);
 box(0,1.0,-1.17,.24,.07,.13,skin);
 const shoulders=[[-.38,1.06,-.53],[.38,1.06,-.53]];
 const hips=[[-.24,.87,.6],[.24,.87,.6]];
 const elbows=[],hands=[],upper=[],fore=[],leg1=[],leg2=[];
 const sideVals=[-1,1];
 sideVals.forEach((side,i)=>{
  const shoulder=shoulders[i],hip=hips[i];
  const knee=[side*.30,.65,1.15],ankle=[side*.32,.12,1.55];
  leg1.push(line(hip,knee,.145,shorts));leg2.push(line(knee,ankle,.115,skin));
  ball(...knee,.14,skin);box(ankle[0],.10,1.63,.22,.16,.39,shorts);
  const elbow=[side*.64,1.24,-.30],hand=[side*(p.width/2),1.76,-.3];
  elbows.push(ball(...elbow,.105,skin));hands.push(ball(...hand,.1,skin));
  upper.push(line(shoulder,elbow,.113,muscle));
  fore.push(line(elbow,hand,.093,skin));
 });
 // Dynamic bar, not animated by a canned 2-D sprite.
 const bar=line([-1.37,1.8,-.3],[1.37,1.8,-.3],.037,metal);
 const plates=[-1,1].flatMap(s=>[1.03,1.17].map((x,j)=>{
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(j?.19:.24,j?.19:.24,.09,30),mat(j?0x162136:0x3a5578,{metalness:.48}));
  mesh.rotation.z=Math.PI/2;scene.add(mesh);return {s,x,mesh};
 }));
 const pathPoints=[];
 for(let j=0;j<=20;j++){const t=j/20;pathPoints.push(new THREE.Vector3(0,p.bottom.y+(p.top.y-p.bottom.y)*t,p.bottom.z+(p.top.z-p.bottom.z)*t));}
 const pathGeo=new THREE.BufferGeometry().setFromPoints(pathPoints);
 const pathLine=new THREE.Line(pathGeo,new THREE.LineDashedMaterial({color:0xf4b73e,dashSize:.09,gapSize:.06}));
 pathLine.computeLineDistances();scene.add(pathLine);
 // Highlight front/back of travel with markers.
 ball(0,p.bottom.y,p.bottom.z,.073,grip);ball(0,p.top.y,p.top.z,.06,grip);
 const initialWidth=p.width/2;
 let playing=true,speed=1,phase=.02,last=0,disposed=false,raf=0;
 const lerp=(a,b,t)=>a+(b-a)*t;
 function pose(){
  const t=(1-Math.cos(phase*Math.PI*2))/2;
  const cy=lerp(p.top.y,p.bottom.y,t),cz=lerp(p.top.z,p.bottom.z,t);
  updateLine(bar,[-1.4,cy,cz],[1.4,cy,cz]);
  plates.forEach(({s,x,mesh})=>mesh.position.set(s*x,cy,cz));
  sideVals.forEach((s,i)=>{
   const shoulder=shoulders[i];
   const hand=[s*initialWidth,cy,cz];
   // The elbow bends and tracks inward. On bench, broader lateral elbows;
   // on JM, elbows remain closer, bar goes toward the chin instead of the sternum.
   const elbow=kind==='jm'?[s*.45,lerp(1.40,1.21,t),lerp(-.46,-.51,t)]:[s*.66,lerp(1.33,1.05,t),lerp(-.31,-.02,t)];
   hands[i].position.set(...hand);elbows[i].position.set(...elbow);
   updateLine(upper[i],shoulder,elbow);updateLine(fore[i],elbow,hand);
  });
 }
 pose();
 const viewLabel=holder.querySelector('.motion-view-name');
 function setView(which){
  if(which==='front'){camera.position.set(0,3.0,5.6);viewLabel.textContent='Vista frontale';}
  else if(which==='side'){camera.position.set(5.4,2.1,0);viewLabel.textContent='Vista laterale';}
  else{camera.position.set(3.6,2.9,4.5);viewLabel.textContent='Vista 3/4';}
  ctl.update();
 }
 const controls=holder.querySelectorAll('[data-motion-control]');
 const clickFns=[];
 controls.forEach(b=>{
  const click=()=>{
   const cmd=b.dataset.motionControl;
   if(cmd==='play'){playing=!playing;b.textContent=playing?'⏸ Pausa':'▶ Avvia';b.setAttribute('aria-pressed',String(playing));}
   else setView(cmd);
  };
  b.addEventListener('click',click);clickFns.push(()=>b.removeEventListener('click',click));
 });
 const select=holder.querySelector('[data-motion-speed]');const onSpeed=()=>speed=Number(select.value)||1;
 select.addEventListener('change',onSpeed);
 const resize=()=>{
  if(disposed)return;
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
  if(canvas.width!==Math.round(w*devicePixelRatio)||canvas.height!==Math.round(h*devicePixelRatio)){
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
   renderer.setSize(w,h,false);
   camera.aspect=w/h;camera.updateProjectionMatrix();
  }
 };
 const ro=new ResizeObserver(resize);ro.observe(canvas);
 function tick(now){
  if(disposed||!dialog.open||!dialog.isConnected){dispose();return;}
  const dt=Math.min(.04,Math.max(0,(now-last)/1000));last=now;
  if(playing){phase=(phase+dt*speed/3.2)%1;pose();}
  ctl.update();resize();renderer.render(scene,camera);canvas.dataset.rendererReady='true';
  raf=requestAnimationFrame(tick);
 }
 raf=requestAnimationFrame(tick);
 function dispose(){
  if(disposed)return;disposed=true;cancelAnimationFrame(raf);ro.disconnect();
  clickFns.forEach(f=>f());select.removeEventListener('change',onSpeed);
  ctl.dispose();scene.traverse(obj=>{obj.geometry?.dispose?.();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material?.dispose?.();});
  renderer.dispose();
 }
 dialog.addEventListener('close',dispose,{once:true});
 return dispose;
}

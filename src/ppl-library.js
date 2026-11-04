import {ppl,pplExercises} from './ppl.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rep=r=>r.targetSeconds?r.targetSeconds+' secondi':r.toFailure?'Cedimento':r.freeReps?'Libere':r.repsMax?r.reps+'–'+r.repsMax:r.reps;
export function pplLibraryHtml(button) {
 return '<header class="page-head"><div><p class="eyebrow">2019 · IAIN VALLIERE</p><h1>CHRIS 2019 · PPL</h1><p class="sub">La preparazione nel periodo con Iain Valliere. Apri una seduta per studiare esercizi, serie, range e tecniche. La selezione e il ciclo si impostano soltanto da Oggi.</p></div></header>'+
 '<section class="panel program-intro"><p class="eyebrow">IL COACH</p><h2>IAIN VALLIERE</h2><p>Iain era il coach e mentore di Chris nel 2019. La collaborazione con Hany Rambod sarebbe iniziata soltanto nell’ottobre 2022.</p><p class="helper">Video originale del 21 novembre 2019. Sei sessioni A/B a rotazione; i riposi sono flessibili secondo le indicazioni di Chris, non un lunedì–domenica fisso.</p><a class="text-button" href="'+esc(ppl.video)+'" target="_blank" rel="noopener noreferrer">Guarda il video originale</a></section>'+
 '<div class="program-grid">'+ppl.sessions.map((s,i)=>'<article class="panel program-session"><p class="eyebrow">SEDUTA '+(i+1)+'/6 · 2019</p><h2>'+esc(s.name)+'</h2><p>'+esc(s.focus)+'</p><p class="helper">'+s.exercises.length+' blocchi esercizio · '+s.exercises.reduce((n,r)=>n+r.sets,0)+' serie di lavoro</p><button class="secondary" data-action="library-ppl-session" data-id="'+esc(s.key)+'">Apri '+esc(s.name)+' e le metodiche</button></article>').join('')+'</div>'+
 '<section class="panel spaced"><h2>COME LEGGERE IL PROGRAMMA</h2><p>Serie pesanti e back-off, riscaldamenti, serie a tempo di 40 secondi, cedimento, drop set e superset sono evidenziati solo nei blocchi in cui risultano dal video. Carico e ripetizioni realmente eseguite sono personali.</p><p class="helper">Per attivare questa split: Oggi → Scegli split e ciclo → Chris 2019 PPL. Da Schede non si avvia nessun allenamento.</p></section>';
}
export function pplSessionHtml(key,allExercises){
 const s=ppl.sessions.find(x=>x.key===key);
 if(!s)return null;
 const name=id=>allExercises.find(x=>x.id===id)?.name ?? pplExercises.find(x=>x[0]===id)?.[1] ?? id;
 const technique=r=>[
   r.warmup?'Attivazione / riscaldamento':null,
   r.warmupSets?r.warmupSets+' serie di avvicinamento':null,
   r.label,
   r.group?'Superset / tri-set · gruppo '+r.group:null,
   r.drops?r.drops+' riduzioni drop set':null,
   r.variableDrops?'Run-the-rack':null,
   r.restPause?.some(n=>n>0)?'Rest-pause':null,
   r.targetSeconds?'Tensione continua a tempo':null,
   r.toFailure?'Cedimento':null
 ].filter(Boolean);
 return '<p class="eyebrow">CHRIS 2019 · IAIN VALLIERE · '+esc(s.name)+'</p><p>'+esc(s.focus)+'</p><p class="helper">Tutti gli esercizi e i metodi dal prospetto originale del 2019. La consultazione non avvia timer o allenamento.</p>'+
 '<div class="library-detail-list">'+s.exercises.map((r,i)=>'<article class="detail-row"><h3>'+(i+1)+'. '+esc(name(r.exerciseId))+'</h3><p><strong>'+r.sets+' × '+esc(rep(r))+'</strong> · '+(r.rest?r.rest+' secondi':'Recupero non specificato')+'</p>'+
 (technique(r).length?'<p class="library-tags">'+technique(r).map(t=>'<span class="tag">'+esc(t)+'</span>').join(' ')+'</p>':'')+
 (r.instructions?'<p>'+esc(r.instructions)+'</p>':'')+
 '<p class="helper">'+(r.label?.toLowerCase().includes('back-off')?'Back-off: serie successiva con un carico inferiore e più ripetizioni.':r.targetSeconds?'Serie a tempo: 40 secondi di tensione continua, non 40 ripetizioni.':r.drops?'Drop set: abbassa il peso e prosegui, registrando ogni riduzione.':r.group?'Gruppo: alterna gli esercizi indicati prima del recupero principale.':r.warmupSets?'Avvicinamento: prepara il movimento senza cercare il cedimento.':'Usa il carico adeguato a eseguire il range con tecnica corretta.')+'</p></article>').join('')+'</div>'+
 '<p class="helper">Riferimento verificabile: il video spiega questa seduta a partire da '+Math.floor(s.time/60)+':'+String(s.time%60).padStart(2,'0')+'. Non ci sono pesi imposti dal video.</p><a class="text-button" target="_blank" rel="noopener noreferrer" href="'+esc(ppl.video)+'&t='+s.time+'s">Apri la spiegazione nel video</a>';
}

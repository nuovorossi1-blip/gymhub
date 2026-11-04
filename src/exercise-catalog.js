import {trainingDetails,hanyPreparations} from './training-details.js';
import {backReference,additionalSessions} from './references.js';
import {ppl,pplExercises} from './ppl.js';
import {exerciseVideo} from './videos.js';

const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
export const normalizeExerciseSearch=norm;
const guide={
 'jm press bilanciere':{
  aliases:['jm press','barbell jm press','jm press con bilanciere','jm blakley press','blakley press','press jm','jm press tricipiti'],
  summary:'Distensione per i tricipiti, ibrida tra panca a presa stretta e estensione del gomito. Esegui prima a carico leggero.',
  steps:[
   'Sdraiati stabile sulla panca, piedi a terra e impugna il bilanciere all’incirca alla larghezza delle spalle.',
   'Piega i gomiti mantenendoli sotto controllo, circa 45° rispetto al tronco, mentre il bilanciere scende verso l’alto del torace, vicino alla linea del mento.',
   'Interrompi la discesa quando avambracci e bicipiti si avvicinano, senza portare il bilanciere a contatto con collo o volto.',
   'Estendi i gomiti per riportare il bilanciere in alto. Non sacrificare il controllo della traiettoria per aumentare il peso.'
  ],
  cautions:'Non è un french press classico né una panca stretta. La traiettoria vicino a testa e collo richiede tecnica e controllo: inizia leggero, eventualmente con un istruttore.',
  demos:[
   {label:'Dimostrazione originale · Chris 2026',url:'https://www.youtube.com/watch?v=ynbS3UZT2O8&t=462s',type:'video'},
   {label:'Guida animata e muscoli · Weight Training Guide',url:'https://weighttraining.guide/exercises/barbell-jm-press/',type:'animazione esterna'},
   {label:'Tecnica spiegata dall’inventore · EliteFTS',url:'https://elitefts.com/blogs/training/how-to-perform-the-jm-press-a-step-by-step-guide-from-the-inventor',type:'video e articolo'}
  ]
 }
};
const getEquipment=name=>{
 const s=norm(name);
 if(/manub|dumbbell|hammer curl|split squat/.test(s))return 'Manubri';
 if(/cavo|cavi|corda|pulley|pushdown|face pull|cable/.test(s))return 'Cavi';
 if(/bilanciere|barbell|squat|stacc|jm press|military|ez /.test(s))return 'Bilanciere';
 if(/t[ -]?bar|machine|macchin|press|lat machine|pec deck|curl seduto|abductor|adductor|calf raise|leg curl|leg extension|hack|belt|pendulum|hip thrust/.test(s))return 'Macchina';
 if(/trazion|piegament|dip parallele|iperestension/.test(s))return 'Corpo libero';
 return 'Altro';
};
const getMuscle=(name,focus='')=>{
 const s=norm(name),f=norm(focus);
 if(/jm press|tricipit|pushdown|french press|skull|kickback|estensioni .*cavo|overhead extension/.test(s))return 'Tricipiti';
 if(/bicipit|curl|hammer curl|preacher/.test(s))return 'Bicipiti';
 if(/face pull|deltoid|lateral|alzate|shoulder press|military|tirate al mento|pec deck invers|reverse pec/.test(s))return 'Spalle';
 if(/pett|panca|croci|chest|pec deck|push.?up/.test(s))return 'Petto';
 if(/dorsal|schien|remat|pulldown|pullover|lat machine|trazion|row/.test(s))return 'Schiena';
 if(/calf|quad|femoral|glute|squat|leg press|leg curl|leg extension|stacc|affond|hip thrust|hack|belt|pendulum|abductor|adductor|ghr/.test(s))return 'Gambe';
 if(/tricipit/.test(f))return 'Tricipiti';
 if(/bicipit/.test(f))return 'Bicipiti';
 if(/pett/.test(f))return 'Petto';
 if(/schien/.test(f))return 'Schiena';
 if(/spall/.test(f))return 'Spalle';
 return 'Gambe';
};
const catalog=[],seen=new Map();
const insert=(entry)=>{
 const name=entry.name.trim(), key=norm(name);
 if(!key)return;
 if(seen.has(key)){
  const old=seen.get(key);
  if(entry.demos?.length)old.demos=[...(old.demos||[]),...entry.demos];
  if(entry.source&&!old.sources.some(s=>s.url===entry.source))old.sources.push({title:entry.context||'Fonte della preparazione',url:entry.source});
  if(entry.summary&&!old.summary)old.summary=entry.summary;
  if(entry.aliases)old.aliases=[...new Set([...(old.aliases||[]),...entry.aliases])];
  return;
 }
 const e={id:'ref-'+catalog.length,name,muscle:entry.muscle||getMuscle(name,entry.context),equipment:entry.equipment||getEquipment(name),aliases:entry.aliases||[],summary:entry.summary||'',steps:entry.steps||[],cautions:entry.cautions||'',demos:entry.demos||[],sources:entry.source?[{title:entry.context||'Fonte',url:entry.source}]:[]};
 seen.set(key,e);catalog.push(e);
};
// Esercizi con dimostrazione video esatta della seduta.
for(const ref of [backReference,...additionalSessions]){
 for(const ex of ref.exercises){
  const v=exerciseVideo({id:ex.id});
  insert({...ex,context:ref.title,source:ref.url,demos:v?[{label:'Chris Bumstead · video originale del movimento',url:v.url,type:'video'}]:[]});
 }
}
// Esercizi della split PPL storica, con link al timestamp se esiste.
for(const [id,name,muscle,equipment] of pplExercises){
 const v=exerciseVideo({id});
 insert({name,muscle,equipment,context:'Chris 2019 · PPL',source:ppl.video,demos:v?[{label:'Chris 2019 · spiegazione della seduta',url:v.url,type:'video'}]:[]});
}
// Esercizi delle split storiche, delle ricostruzioni e delle sessioni Hany.
for(const [programId,sessions] of Object.entries(trainingDetails)){
 for(const session of sessions||[]){
  if(!session)continue;
  for(const row of session.exercises)insert({name:row.name,context:session.title+' · '+programId,source:session.source,summary:row.method?[row.method,row.note].filter(Boolean).join(' · '):row.note});
 }
}
for(const [id,program] of Object.entries(hanyPreparations))for(const session of program.sessions){
 for(const row of session.exercises)insert({name:row.name,context:program.title+' · '+id,source:session.source,summary:row.method?[row.method,row.note].filter(Boolean).join(' · '):row.note});
}
for(const [name,details] of Object.entries(guide)){
 const item=seen.get(norm(name));
 if(item){
  item.aliases=[...new Set([...(item.aliases||[]),...details.aliases])];
  item.summary=details.summary;item.steps=details.steps;item.cautions=details.cautions;
  item.demos=[...details.demos,...item.demos.filter(d=>!details.demos.some(x=>x.url===d.url))];
 }
 else insert({name,...details});
}
export const exerciseReferenceCatalog=catalog;
export const findReferenceExercise=id=>catalog.find(r=>r.id===id);
export const matchReferenceExercise=name=>catalog.find(r=>norm(r.name)===norm(name)||r.aliases.some(a=>norm(a)===norm(name)));
export function searchLibraryExercises(saved,query='',muscle=''){
 const q=norm(query);
 // The user's saved exercises keep their IDs and are never overwritten by reference data.
 const result=[],savedNames=new Set();
 for(const e of saved){
  if(muscle&&e.muscle!==muscle)continue;
  const ref=matchReferenceExercise(e.name);
  if(q&&!norm([e.name,e.equipment,ref?.aliases?.join(' ')].filter(Boolean).join(' ')).includes(q))continue;
  result.push({...e,catalogRef:ref?.id||null,kind:'saved'});savedNames.add(norm(e.name));
 }
 for(const e of catalog){
  if(savedNames.has(norm(e.name))||saved.some(x=>norm(x.name)===norm(e.name)))continue;
  if(muscle&&e.muscle!==muscle)continue;
  if(q&&!norm(e.name+' '+e.equipment+' '+e.aliases.join(' ')+' '+e.muscle).includes(q))continue;
  result.push({...e,kind:'reference'});
 }
 return result;
}

const htmlEsc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function referenceExerciseHtml(ref){
 if(!ref)return '';
 const demoIds=new Set();
 const demos=ref.demos.filter(d=>{if(demoIds.has(d.url))return false;demoIds.add(d.url);return true;});
 return '<section class="exercise-knowledge">'+
 (ref.summary?'<p>'+htmlEsc(ref.summary)+'</p>':'')+
 (ref.steps.length?'<h3>COME SI ESEGUE</h3><ol>'+ref.steps.map(step=>'<li>'+htmlEsc(step)+'</li>').join('')+'</ol>':'')+
 (ref.cautions?'<p class="helper"><strong>Attenzione:</strong> '+htmlEsc(ref.cautions)+'</p>':'')+
 '<h3>VIDEO, ANIMAZIONI E FONTI</h3>'+
 (demos.length?'<div class="exercise-source-links">'+demos.map(d=>'<a class="secondary" href="'+htmlEsc(d.url)+'" target="_blank" rel="noopener noreferrer"><strong>'+htmlEsc(d.label)+'</strong><small>'+htmlEsc(d.type)+'</small></a>').join('')+'</div>':'<p class="helper">Non abbiamo ancora verificato un video specifico di questo movimento. Nessun video generico viene spacciato per una dimostrazione esatta.</p>')+
 (ref.sources.length?'<p class="eyebrow">FONTI DELLE SCHEDE</p><div class="exercise-source-links">'+ref.sources.map(s=>'<a class="text-button" target="_blank" rel="noopener noreferrer" href="'+htmlEsc(s.url)+'">'+htmlEsc(s.title)+'</a>').join('')+'</div>':'')+
 '<p class="helper">I filmati e le animazioni si aprono sui rispettivi siti. Nessuna risorsa multimediale di terzi è copiata o salvata in GymHub.</p></section>';
}

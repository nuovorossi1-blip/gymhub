import {cbumCatalog} from './cbum-catalog.js';
import {trainingDetails,hanyPreparations,fstMethod} from './training-details.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>url?'<a class="text-button" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>':'';
const methodPills=methods=>methods?.length?'<div class="library-tags">'+methods.map(m=>'<span class="tag">'+esc(m)+'</span>').join('')+'</div>':'<p class="helper">Metodiche specifiche non documentate</p>';
const explainMethod=label=>{
 const s=label.toLowerCase();
 if(s.includes('fst-7'))return 'Sette serie consecutive su uno specifico esercizio con recuperi brevi; non su tutti i movimenti.';
 if(s.includes('10×10')||s.includes('gvt'))return 'Dieci serie da dieci ripetizioni sullo stesso esercizio, con volume elevato e recuperi gestiti.';
 if(s.includes('tri-set'))return 'Tre esercizi consecutivi nello stesso giro, poi il recupero principale. Le lettere identificano il gruppo.';
 if(s.includes('superset'))return 'Due esercizi consecutivi, poi recupero; i gruppi A/B/C identificano gli accoppiamenti.';
 if(s.includes('back-off'))return 'Dopo le serie più pesanti si riduce il carico per fare più ripetizioni controllate.';
 if(s.includes('top set'))return 'Una o più serie relativamente pesanti prima delle serie alleggerite.';
 if(s.includes('drop'))return 'Una volta conclusa la serie si riduce il peso e si continua con poco o nessun recupero.';
 if(s.includes('run-the-rack'))return 'Si scende progressivamente nei manubri/carichi, registrando le riduzioni effettive.';
 if(s.includes('eccentric'))return 'La fase di discesa viene eseguita lentamente e con controllo.';
 if(s.includes('piramid'))return 'Il numero delle ripetizioni cambia fra le serie; il carico effettivo va adattato.';
 if(s.includes('cediment'))return 'Si arriva al limite della tecnica corretta, evitando ripetizioni eseguite male.';
 if(s.includes('parzial'))return 'Dopo le ripetizioni complete possono essere usate ripetizioni su una porzione del movimento se documentate.';
 if(s.includes('controll')||s.includes('tensione')||s.includes('rom'))return 'Cura il range di movimento, la velocità e la contrazione, senza slanci.';
 return 'La metodica è documentata per questa seduta; vedi indicazioni dei singoli esercizi e fonte.';
};
const methodGuide=methods=>methods?.length?'<div class="library-method"><strong>Come si eseguono le tecniche citate</strong>'+methods.map(m=>'<p><b>'+esc(m)+'</b>: '+esc(explainMethod(m))+'</p>').join('')+'</div>':'';

const tile=(action,id,name,subtitle,i)=>'<article class="library-session-tile"><div><p class="eyebrow">SEDUTA '+i+'</p><h3>'+esc(name)+'</h3><p class="helper">'+esc(subtitle)+'</p></div><button type="button" class="secondary" data-action="'+esc(action)+'" data-id="'+esc(id)+'">Apri allenamento e metodiche</button></article>';

export function catalogProgramHtml(program){
 const sessions=trainingDetails[program.id]||[];
 return '<p class="eyebrow">'+esc(program.year)+' · '+esc(program.certainty)+'</p>'+
 '<p>'+esc(program.note)+'</p>'+
 '<section class="library-method"><strong>Coach e preparazione</strong><p>'+esc(coachDescription(program.id))+'</p></section>'+
 '<h3>SPLIT · '+program.sessions.length+' GIORNI</h3><p class="helper">Tocca ogni seduta per vedere esercizi, serie, ripetizioni e metodo. I giorni senza una fonte completa indicano espressamente ciò che manca.</p>'+
 '<div class="library-session-list">'+program.sessions.map((s,i)=>s.rest?
 '<article class="library-session-tile rest-day"><div><p class="eyebrow">GIORNO '+(i+1)+'</p><h3>Riposo</h3><p class="helper">Recupero del ciclo</p></div></article>':
 tile('library-catalog-session',program.id+':'+i,s.name,sessions[i]?.exercises?.length?sessions[i].exercises.length+' esercizi · '+sessions[i].methods.join(' · '):'Split nota · esercizi non verificati',i+1)).join('')+'</div>'+
 '<p class="helper">Le schede della biblioteca sono in sola lettura; per pianificare questo ciclo vai in Oggi.</p>'+
 link(program.source,'Fonte della split');
}
export function catalogSessionHtml(id){
 const [programId,ix]=id.split(':');const program=cbumCatalog.find(p=>p.id===programId);
 const index=Number(ix);if(!program||!Number.isInteger(index)||index<0||index>=program.sessions.length)return null;
 const session=trainingDetails[program.id]?.[index];
 return '<p class="eyebrow">'+program.year+' · '+esc(program.title)+' · GIORNO '+(index+1)+'</p>'+
 '<h3>'+esc(program.sessions[index].name)+'</h3>'+
 (session?sessionDetailMarkup(session):
 '<div class="library-method"><strong>La split è documentata; la seduta completa no.</strong><p>Conosciamo la collocazione e i muscoli del giorno, ma per questo allenamento mancano una lista verificata di esercizi, serie, ripetizioni e tecniche. Non li sostituiamo con valori inventati.</p></div><p>Puoi usare una tua scheda personalizzata in Oggi, senza attribuirla a Chris.</p>')+
 '<div class="wrap-actions"><button type="button" class="secondary" data-action="library-program" data-id="'+esc(program.id)+'">Torna a tutte le sedute</button></div>'+link(session?.source||program.source,'Fonte originale o resoconto');
}
export function hanyProgramHtml(kind){
 const p=hanyPreparations[kind];if(!p)return null;
 return '<p class="eyebrow">'+esc(p.date)+' · COACH '+esc(p.coach)+'</p>'+
 '<p>'+esc(p.summary)+'</p>'+
 '<h3>LA SPLIT DI QUESTA PREPARAZIONE</h3><div class="library-method"><strong>Copertura verificata</strong><p>'+esc(p.cycle.join(' · '))+'</p></div>'+
 '<h3>SEDUTE DOCUMENTATE</h3><div class="library-session-list">'+p.sessions.map((s,i)=>tile('library-hany-session',kind+':'+i,s.title,s.exercises.length+' esercizi · '+s.methods.join(' · '),i+1)).join('')+'</div>'+
 '<h3>LE METODICHE DI QUESTA FASE</h3>'+methodPills(p.methods)+
 '<p class="helper">Non confondere una singola seduta pubblicata con l’intera rotazione. Se la split completa non è verificabile, l’app non inventa gli altri giorni.</p>'+
 link(p.sessions[0]?.source,'Fonte della sessione');
}
export function hanySessionHtml(id){
 const [kind,ix]=id.split(':');const p=hanyPreparations[kind],s=p?.sessions[Number(ix)];if(!s)return null;
 return '<p class="eyebrow">'+esc(p.title)+' · '+esc(p.coach)+'</p><h3>'+esc(s.title)+'</h3>'+
 sessionDetailMarkup(s)+
 '<div class="wrap-actions"><button class="secondary" type="button" data-action="library-hany" data-id="'+esc(kind)+'">Torna alla preparazione</button></div>'+
 link(s.source,'Fonte e video documentato');
}
export function fst7DetailHtml(){
 return '<h3>'+esc(fstMethod.name)+' · METODO DI HANY RAMBOD</h3>'+
 '<p>'+esc(fstMethod.description)+'</p><div class="library-method"><strong>Come funziona</strong><ul>'+fstMethod.points.map(p=>'<li>'+esc(p)+'</li>').join('')+'</ul></div>'+
 '<h3>ESEMPIO REALE IN UNA SEDUTA DI CHRIS</h3><p>'+esc(fstMethod.example)+'</p>'+
 '<button class="secondary" type="button" data-action="library-hany-session" data-id="hany2024:0">Apri la scheda gambe 2024 con FST-7</button><p class="helper">La tecnica è applicata a uno specifico allenamento, non automaticamente a tutte le split.</p>'+link(fstMethod.source,'Fonte');
}
function sessionDetailMarkup(s){
 return '<div class="library-method"><strong>Grado di documentazione</strong><p>'+esc(s.quality)+'.'+(s.exercises.some(x=>!x.series)?' Le serie mancanti sono lasciate non dichiarate.':'')+'</p></div>'+
 '<h3>ESERCIZI E PRESCRIZIONI</h3><div class="library-exercise-list">'+s.exercises.map((x,i)=>'<article class="detail-row"><p class="eyebrow">ESERCIZIO '+(i+1)+'</p><h3>'+esc(x.name)+'</h3><p><strong>Serie: '+(x.series?esc(x.series):'non specificate')+' · Ripetizioni: '+(x.reps?esc(x.reps):'non specificate')+'</strong></p>'+
 (x.method?'<p class="library-tags"><span class="tag">'+esc(x.method)+'</span></p>':'')+
 (x.note?'<p>'+esc(x.note)+'</p>':'')+'</article>').join('')+'</div>'+
 '<h3>METODICHE E STILE</h3>'+methodPills(s.methods)+methodGuide(s.methods)+
 '<p class="helper">I dati riportati derivano dalla fonte indicata. Non è una scheda personale attiva; per scegliere un ciclo e allenarti utilizza Oggi.</p>';
}
function coachDescription(id){
 if(id==='cbum-five-2016')return 'Split raccontata direttamente da Chris nel periodo iniziale. Riposi flessibili; non va confusa con la collaborazione Hany, iniziata nel 2022.';
 if(id==='cbum-olympia-2020')return 'Periodo Iain Valliere: fonte relativa alla sequenza delle sedute, senza prescrizioni affidabili per ogni esercizio.';
 if(id==='cbum-olympia-2023')return 'Olympia 2023 con coach Hany Rambod. Le sedute petto e schiena qui elencate sono esempi video documentati; gli altri giorni hanno solo la collocazione verificata.';
 return 'Off-season 2024, in cui Chris ha lavorato anche con Justin King. Scheda ricostruita da una fonte terza, distinta dalla preparazione Olympia 2024 con Hany Rambod.';
}

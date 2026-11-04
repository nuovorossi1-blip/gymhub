import {cbumCatalog} from './cbum-catalog.js';
import {ppl} from './ppl.js';
import {additionalSessions} from './references.js';
const e = v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const era=(label,description,cards)=>'<section class="library-era"><div class="section-head"><div><p class="eyebrow">'+e(label)+'</p><p class="helper">'+e(description)+'</p></div></div><div class="library-program-list">'+cards.join('')+'</div></section>';
const card=(eyebrow,title,description,action,label,meta='')=>'<article class="panel library-program"><div class="library-program-copy"><p class="eyebrow">'+e(eyebrow)+'</p><h2>'+e(title)+'</h2><p>'+e(description)+'</p>'+ (meta?'<p class="helper">'+e(meta)+'</p>':'')+'</div><button class="secondary" data-action="'+e(action)+'" data-id="'+e(label)+'">Esplora <span aria-hidden="true">›</span></button></article>';
export function libraryPageHtml(state,button){
 const p=id=>cbumCatalog.find(x=>x.id===id);
 const item=(id,description,coach)=>{const x=p(id);return card(x.year+' · '+coach,x.title,description,'library-program',id,x.certainty);};
 return '<header class="page-head"><div><p class="eyebrow">LA BIBLIOTECA DEGLI ALLENAMENTI</p><h1>SCHEDE & METODI</h1><p class="sub">Qui studi e confronti. Per scegliere un ciclo, pianificare o iniziare vai su Oggi.</p></div></header>'+
 era('01 · LE ORIGINI / PERIODO IAIN VALLIERE','Dalle prime split alla preparazione Olympia.',
 [item('cbum-five-2016','Cinque sedute a rotazione, riposo secondo necessità.','Periodo iniziale'),
 card('2019 · Programma da video originale','PUSH / PULL / LEGS A-B','Sei allenamenti distinti con esercizi, range, riscaldamenti, back-off e tecniche documentate.','library-ppl','2019','Periodizzazione e recuperi personalizzabili'),
 item('cbum-olympia-2020','Rotazione di otto giorni con priorità a braccia e schiena.','Iain Valliere')])+
 era('02 · HANY RAMBOD · 2022–2024','Preparazione Olympia: qualità esecutiva, volume mirato e FST-7.',
 [card('2022 · Olympia · Hany Rambod','CHRIS + HANY · PREPARAZIONE 2022','Apri la preparazione, la seduta documentata petto/tricipiti con otto esercizi e le metodiche. La rotazione completa 2022 non è verificata.','library-hany','hany2022','Coach dal 2022 · sedute pubbliche documentate'),
 item('cbum-olympia-2023','Ciclo 3 giorni ON / 1 OFF / 3 ON / 1 OFF.','Hany Rambod'),
 card('2023–2024 · Metodica specifica','FST-7 CON ESEMPIO DI SEDUTA','Apri come funziona FST-7 e la scheda gambe del 2024 in cui Hany lo applica ai polpacci.','library-hany','fst7','Non attribuire FST-7 a tutte le sedute'),
 card('2024 · Olympia preparation','GAMBE CON HANY','Sessione femorali, glutei e polpacci con attenzione alla posizione e FST-7 sui polpacci.','library-hany','hany2024','Sessione documentata, non una settimana completa')])+
 era('03 · OFF-SEASON 2024 · JUSTIN KING','Fase off-season: cicli lunghi e lavoro complementare sulla qualità del movimento.',
 [item('cbum-offseason-2024','Nove giorni e due riposi. Una ricostruzione esterna da confrontare con la fonte.','Off-season / Justin King')])+
 era('04 · VIDEO E SESSIONI 2026','Sessioni indipendenti; non sono automaticamente una split settimanale.',
 [card('1 novembre 2026 · Video','SCHIENA, BICIPITI E DELTOIDI','Rest-pause, due tri-set e finisher 10×10.','library-back','back','Sessione singola con range verificati'),
 ...additionalSessions.map(r=>card(r.published+' · Video',r.cardTitle,r.summary,'library-video',r.key,'Sessione singola · alcune prescrizioni personali')),
 card('19 marzo e 30 maggio 2026','PETTO/SCHIENA E BRACCIA','Due video di riferimento da esplorare, senza programma completo verificato.','library-more-videos','more','Solo consultazione')])+
 era('05 · LE TUE SCHEDE PERSONALI','Le copie che hai creato o importato: qui puoi leggerle, non avviare un allenamento.',
 state.plans.map(p=>card(p.exercises.length+' esercizi · '+p.exercises.reduce((n,r)=>n+r.sets,0)+' serie',p.name,p.notes||'Scheda personale','plan-detail',p.id,'Visualizzazione completa delle serie e dei range')))+
 '<p class="helper library-bottom-note">Libreria di studio. Per creare, modificare, pianificare, scegliere la seduta e avviare: apri Oggi.</p>';
}
export function programDetailHtml(program){
 return '<p class="eyebrow">'+e(program.year)+' · '+e(program.certainty)+'</p><p>'+e(program.note)+'</p><div class="library-method"><strong>Il programma e il coach</strong><p>'+e(coachDescription(program.id))+'</p></div><h3>IL CICLO, GIORNO PER GIORNO</h3><ol class="library-detail-list">'+program.sessions.map((s,i)=>'<li><strong>'+(i+1)+'. '+e(s.name)+'</strong><span>'+(s.rest?'Riposo e recupero':'Seduta · esercizi e carichi da verificare dalla fonte')+'</span></li>').join('')+'</ol><p class="helper">Questa è la struttura documentata, non una prescrizione inventata. Gli allenamenti si scelgono in Oggi.</p><a href="'+e(program.source)+'" target="_blank" rel="noopener noreferrer" class="text-button">Leggi la fonte originale o secondaria</a>';
}
function coachDescription(id){
 if(id==='cbum-five-2016')return 'Fase storica prima di Hany Rambod: cinque sedute in rotazione, senza riposo settimanale prefissato. Iain Valliere era un mentore e coach nelle prime fasi.';
 if(id==='cbum-olympia-2020')return 'Allenamento impostato con Iain Valliere, con attenzione ai gruppi da migliorare (schiena e braccia), carichi elevati e volume relativamente contenuto.';
 if(id==='cbum-olympia-2023')return 'Periodo seguito da Hany Rambod. Il ciclo di otto giorni è documentato, ma il metodo FST-7 va attribuito soltanto alle sedute in cui risulta.';
 return 'Nel 2024 Chris ha affiancato il lavoro con Justin King durante l’off-season e quello con Hany Rambod nella preparazione agonistica. Non sono la stessa fase né un identico programma.';
}
export function hanyDetailHtml(kind){
 const url=kind==='hany2022'?'https://www.evolutionofbodybuilding.net/chris-bumstead-hany-rambod-team-up-chest-workout/':kind==='hany2024'?'https://barbend.com/news/chris-bumstead-hany-rambod-hamstring-glute-training/':'https://barbend.com/chris-bumstead/';
 const title=kind==='hany2022'?'2022 · IL NUOVO COACH':kind==='hany2024'?'2024 · SESSIONE GAMBE':'METODOLOGIA FST-7';
 const intro=kind==='hany2022'?'Collaborazione annunciata nell’ottobre 2022. Chris ha spiegato che le serie FST-7 si aggiungevano a un allenamento che continuava a includere squat e press pesanti.':kind==='hany2024'?'Preparazione Olympia 2024: femorali, glutei e polpacci. Un resoconto documenta l’uso del protocollo FST-7 sui calf raise da seduto.':'Hany Rambod ha sviluppato FST-7: una modalità che prevede sette serie finali con recuperi brevi. Non è una split universale, né un programma da assegnare a ogni esercizio.';
 return '<p class="eyebrow">'+title+'</p><p>'+intro+'</p><div class="library-method"><strong>Come si riconosce in una scheda</strong><p><b>Serie:</b> sette serie finali quando la fonte indica FST-7.<br><b>Ripetizioni:</b> secondo esercizio e fonte, non fissate uguali per tutti.<br><b>Recupero:</b> breve e configurabile, non automaticamente 80 secondi.<br><b>Tecnica:</b> movimento controllato, attenzione alla contrazione; parziali o isometrie solo quando documentate.<br><b>Carico:</b> registrato personalmente, senza aumento automatico imposto.</p></div><p class="helper">Questa scheda descrive un metodo. La split di Chris sotto Hany va consultata separatamente nella sezione 2023.</p><a href="'+url+'" target="_blank" rel="noopener noreferrer" class="text-button">Fonte e approfondimento</a>';
}

import {clone, uid, dayKey} from './domain.js';

// Fonti dichiarate. Questa raccolta descrive i cicli, non inventa prescrizioni.
export const cbumCatalog = [
  {id:'cbum-five-2016', title:'Split storica · 5 sedute',year:2016,certainty:'Intervista diretta', source:'https://simplyshredded.com/21-year-old-beast-chris-bumstead-talks-with-simplyshredded-com.html',
   note:'Chris parla di cinque giorni in rotazione con riposi flessibili. La struttura qui NON impone recuperi non dichiarati.',
   sessions:[['Schiena','Schiena'],['Petto e bicipiti','Petto · Bicipiti'],['Femorali e glutei','Gambe'],['Spalle e tricipiti','Spalle · Tricipiti'],['Quadricipiti','Gambe']].map(([name,focus])=>({name,focus}))},
  {id:'cbum-olympia-2020',title:'Olympia 2020 · 8 giorni',year:2020,certainty:'Split spiegata da Chris in video, riportata da fonte sportiva',source:'https://fitnessvolt.com/CHRIS-BUMSTEAD-OLYMPIA-TRAINING-SPLIT/',
   note:'Tre giorni di lavoro, un riposo, tre giorni di lavoro, un riposo. Le prescrizioni dei singoli esercizi non sono fornite da questa fonte.',
   sessions:['Petto e tricipiti','Quadricipiti e polpacci','Schiena e bicipiti',null,'Spalle e petto alto','Femorali e dorsali','Braccia',null].map(name=>({name:name||'Riposo',rest:!name}))},
  {id:'cbum-olympia-2023',title:'Olympia 2023 · 8 giorni',year:2023,certainty:'Split dichiarata da Chris, fonte secondaria',source:'https://fitnessvolt.com/CHRIS-BUMSTEAD-CURRENT-WORKOUT-SPLIT-2023-OLYMPIA/',
   note:'Rotazione 3 ON / 1 OFF / 3 ON / 1 OFF; non equivale a un calendario settimanale rigido. Nessuna serie inventata.',
   sessions:['Quadricipiti','Petto e tricipiti','Schiena e bicipiti',null,'Spalle e petto','Femorali e schiena','Braccia',null].map(name=>({name:name||'Riposo',rest:!name}))},
  {id:'cbum-offseason-2024',title:'Off-season 2024 · 9 giorni',year:2024,certainty:'Ricostruzione giornalistica, non scheda ufficiale',source:'https://kylehuntfitness.com/chris-bumstead-workout-and-diet-program-for-2024/',
   note:'Sette sedute e due riposi. La fonte descrive anche esercizi e tecniche, ma l’ordine può essere adattato in base al recupero.',
   sessions:['Petto, tricipiti e deltoidi posteriori','Schiena e bicipiti','Quadricipiti e polpacci',null,'Spalle','Braccia','Petto e schiena','Femorali, glutei e polpacci',null].map(name=>({name:name||'Riposo',rest:!name}))}
];
export function catalogDates(program,start,repeats=1) {
 if(!cbumCatalog.includes(program)) throw new Error('Programma non disponibile.');
 const dt=new Date(start+'T12:00:00');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!Number.isFinite(dt.getTime())||dayKey(dt)!==start) throw new Error('Data di partenza non valida.');
 if(!Number.isInteger(repeats)||repeats<1||repeats>8) throw new Error('Scegli da 1 a 8 cicli.');
 const result=[];
 for(let c=0;c<repeats;c++)for(let index=0;index<program.sessions.length;index++){
  result.push({date:dayKey(dt),index,name:program.sessions[index].name,rest:!!program.sessions[index].rest});
  dt.setDate(dt.getDate()+1);
 }
 return result;
}
export function scheduleCatalog(state,programId,start,repeats,mapping){
 const program=cbumCatalog.find(p=>p.id===programId);
 if(!program)throw new Error('Programma non disponibile.');
 const rows=catalogDates(program,start,repeats);
 const conflict=rows.find(d=>state.schedule.some(s=>s.date===d.date));
 if(conflict)throw new Error('Data già occupata: '+conflict.date+'. Nessun appuntamento modificato.');
 for(const [index,s] of program.sessions.entries()){
  if(s.rest)continue;
  const id=mapping[index];
  if(!state.plans.some(p=>p.id===id))throw new Error('Associa una scheda valida alla seduta '+(index+1)+' ('+s.name+').');
 }
 const next=clone(state),cycleId=uid();
 rows.forEach(r=>next.schedule.push({id:uid(),date:r.date,programId:program.id,cycleId,sessionName:r.name,...(r.rest?{kind:'rest'}:{planId:mapping[r.index]})}));
 return next;
}

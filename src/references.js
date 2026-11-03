import { clone, uid, validatePlan } from './domain.js';

// Facts checked against the author's on-screen cards and English captions.
// No video, thumbnails or transcript are distributed with the application.
export const backReference = {
  id: 'cbum-back-ZQPVYJc1cpM',
  name: 'Schiena · Chris Bumstead',
  title: 'This Back Workout Won Me 6 Olympias',
  author: 'Chris Bumstead',
  url: 'https://www.youtube.com/watch?v=ZQPVYJc1cpM',
  published: '2026-11-01',
  checked: '2026-11-03',
  blocks: [
    { time: 25, title: 'Lat machine presa supina', prescription: '2 × 8', detail: 'Serie 1: un rest-pause. Serie 2: due rest-pause. Pause brevi di 10–15 s; ripetizioni aggiuntive non specificate.', evidence: 'Cartello a 00:29–00:33 e spiegazione da 00:25.' },
    { time: 136, title: 'Tri-set schiena', prescription: '3 × 8–12', detail: 'T-bar row → rematore alla macchina presa prona → high row. Nessuna pausa programmata tra gli esercizi, solo il passaggio alla macchina successiva.', evidence: 'Cartello a 02:20–02:24 e spiegazione da 02:16.' },
    { time: 472, title: 'Tri-set bicipiti', prescription: '3 × 8–12', detail: 'Curl EZ presa inversa → hammer curl con manubri → preacher curl. Nessuna pausa programmata tra gli esercizi.', evidence: 'Cartello a 09:23–09:27; spiegazione da 09:19. Capitolo bicipiti da 07:52.' },
    { time: 628, title: 'Aperture posteriori ai cavi', prescription: '10 × 10', detail: '100 ripetizioni totali, mantenendo lo stesso peso. Recupero tra le serie non quantificato.', evidence: 'Cartello a 10:35 e spiegazione da 10:28.' }
  ],
  exercises: [
    { id: 'cbum-lat-supina', name: 'Lat machine presa supina', muscle: 'Schiena', equipment: 'Macchina', sets: 2, reps: 8, group: '', restPause: [1, 2], time: 25 },
    { id: 'cbum-tbar', name: 'T-bar row con appoggio', muscle: 'Schiena', equipment: 'Macchina', sets: 3, reps: 8, repsMax: 12, group: 'A', time: 136 },
    { id: 'cbum-row-prona', name: 'Rematore macchina presa prona', muscle: 'Schiena', equipment: 'Macchina', sets: 3, reps: 8, repsMax: 12, group: 'A', time: 136 },
    { id: 'cbum-high-row', name: 'High row', muscle: 'Schiena', equipment: 'Macchina', sets: 3, reps: 8, repsMax: 12, group: 'A', time: 136 },
    { id: 'cbum-ez-reverse', name: 'Curl EZ presa inversa', muscle: 'Bicipiti', equipment: 'Bilanciere', sets: 3, reps: 8, repsMax: 12, group: 'B', time: 472 },
    { id: 'cbum-hammer', name: 'Hammer curl manubri', muscle: 'Bicipiti', equipment: 'Manubri', sets: 3, reps: 8, repsMax: 12, group: 'B', time: 472 },
    { id: 'cbum-preacher', name: 'Preacher curl', muscle: 'Bicipiti', equipment: 'Bilanciere', sets: 3, reps: 8, repsMax: 12, group: 'B', time: 472 },
    { id: 'cbum-rear-delt', name: 'Aperture posteriori ai cavi', muscle: 'Spalle', equipment: 'Cavi', sets: 10, reps: 10, group: '', sameWeight: true, time: 628 }
  ]
};

export function importBackReference(state, restPauseSeconds) {
  if (![10, 15].includes(restPauseSeconds)) throw new Error('Per questa scheda scegli 10 o 15 secondi di rest-pause.');
  const next = clone(state);
  for (const row of backReference.exercises) {
    if (!next.exercises.some(e => e.id === row.id)) next.exercises.push({ id: row.id, name: row.name, muscle: row.muscle, equipment: row.equipment, custom: false, notes: `Riferimento: ${backReference.title}, Chris Bumstead. Video pubblico dal minuto ${Math.floor(row.time / 60)}:${String(row.time % 60).padStart(2, '0')}.` });
  }
  next.plans.push({
    id: uid(), name: backReference.name, sourceId: backReference.id,
    notes: 'Sessione dal video pubblico di Chris Bumstead del 01/11/2026. Include schiena, bicipiti e deltoidi posteriori. Recuperi ordinari e tra i giri non quantificati nel video: modalità manuale. Ripetizioni nei rest-pause da registrare al momento. Finisher allo stesso peso. Scheda personale modificabile; non è l’intero programma Road to the Olympia.',
    exercises: backReference.exercises.map(row => ({ id: uid(), exerciseId: row.id, sets: row.sets, reps: row.reps, ...(row.repsMax ? { repsMax: row.repsMax } : {}), rest: 0, group: row.group, drops: 0, ...(row.restPause ? { restPause: [...row.restPause], restPauseSeconds } : {}), ...(row.sameWeight ? { sameWeight: true } : {}) }))
  });
  return next;
}

export const chestReference = {
  key:'chest', id:'cbum-chest-ynbS3UZT2O8', name:'Petto, spalle e tricipiti · Chris 2026',
  cardTitle:'PETTO, SPALLE E TRICIPITI', title:'This Chest Workout Won Me 6 Olympias', author:'Chris Bumstead',
  url:'https://www.youtube.com/watch?v=ynbS3UZT2O8', published:'2026-08-15', checked:'2026-11-03',
  summary:'Distensioni inclinate · Chest press10×10 · Tri-set tricipiti · Superset con face pull',
  note:'Sessione pubblica del 15/08/2026. Comprende lavoro per i deltoidi posteriori con face pull, non una seduta separata di shoulder press. I numeri non dichiarati restano scelte personali.',
  requirements:[{key:'trisetRounds',label:'Giri del tri-set tricipiti',reason:'Numero di giri non verificato nel video.'},{key:'supersetRounds',label:'Giri del superset finale',reason:'Numero di giri non verificato nel video.'}],
  blocks:[
    {time:17,title:'Distensioni inclinate con manubri',prescription:'4 × 8',detail:'Prima spinta della sessione. Recupero non quantificato.'},
    {time:185,title:'Chest press alla macchina',prescription:'10 × 10 · 60 s',detail:'Obiettivo10×10, mantenendo il carico; registra le ripetizioni effettive, che nel video calano con la fatica.'},
    {time:462,title:'Tri-set tricipiti',prescription:'Giri da impostare',detail:'JM press bilanciere → dip alla macchina da seduto → French press con corda sopra la testa. Passaggi di 10 s. Giri e ripetizioni non fissati qui: scegli i giri e registra le ripetizioni reali.'},
    {time:773,title:'Superset finale',prescription:'Giri da impostare',detail:'Estensione tricipite unilaterale al cavo → face pull. Il lavoro per le spalle è sui deltoidi posteriori. Recuperi e ripetizioni non quantificati.'}
  ],
  exercises:[
    {id:'cbum-chest-incline',name:'Distensioni inclinate manubri',muscle:'Petto',equipment:'Manubri',sets:4,reps:8,time:17},
    {id:'cbum-chest-flat',name:'Chest press piana alla macchina',muscle:'Petto',equipment:'Macchina',sets:10,reps:10,rest:60,sameWeight:true,time:185},
    {id:'cbum-chest-jm',name:'JM press bilanciere',muscle:'Tricipiti',equipment:'Bilanciere',setsKey:'trisetRounds',reps:null,freeReps:true,group:'A',transitionRest:10,time:462},
    {id:'cbum-chest-dip',name:'Dip tricipiti alla macchina da seduto',muscle:'Tricipiti',equipment:'Macchina',setsKey:'trisetRounds',reps:null,freeReps:true,group:'A',transitionRest:10,time:462},
    {id:'cbum-chest-french',name:'French press con corda sopra la testa',muscle:'Tricipiti',equipment:'Cavi',setsKey:'trisetRounds',reps:null,freeReps:true,group:'A',transitionRest:10,time:462},
    {id:'cbum-chest-onearm',name:'Estensione tricipite unilaterale al cavo',muscle:'Tricipiti',equipment:'Cavi',setsKey:'supersetRounds',reps:null,freeReps:true,group:'B',time:773},
    {id:'cbum-chest-facepull',name:'Face pull al cavo',muscle:'Spalle',equipment:'Cavi',setsKey:'supersetRounds',reps:null,freeReps:true,group:'B',time:773}
  ]
};

export const legsReference = {
  key:'legs', id:'cbum-legs-lIXIwgv3l6o', name:'Gambe · Chris aprile 2026', cardTitle:'GAMBE E POLPACCI',
  title:'Classic Bodybuilding Leg Day', author:'Chris Bumstead', url:'https://www.youtube.com/watch?v=lIXIwgv3l6o',published:'2026-04-01',checked:'2026-11-03',
  summary:'Leg curl · Leg extension · Front squat · GHR · Leg press · Polpacci',
  note:'Sessione indipendente del 01/04/2026. Due serie allenanti dichiarate per ciascuno dei primi due esercizi; altri conteggi e ripetizioni non sono prescritti nel video. Gli affondi vengono annunciati, ma non risultano mostrati nel montaggio: non sono aggiunti come esercizio svolto.',
  requirements:[{key:'frontSets',label:'Serie di front squat',reason:'Numero non dichiarato.'},{key:'ghrSets',label:'Serie di GHR alla panca',reason:'Numero non dichiarato.'},{key:'pressSets',label:'Serie di leg press',reason:'Numero non dichiarato: le 60 ripetizioni citate sono una prestazione osservata, non un target imposto.'},{key:'calfSets',label:'Serie di polpacci da seduto',reason:'Numero non dichiarato.'}],
  blocks:[
    {time:202,title:'Leg curl e leg extension',prescription:'2 serie ciascuno',detail:'Chris dichiara due serie allenanti per esercizio e li alterna. Ripetizioni e recuperi non sono fissati; non imponiamo un superset senza recupero.'},
    {time:306,title:'Front squat',prescription:'Serie da impostare',detail:'Spiegazione e dimostrazione del front squat. Registra carichi e ripetizioni effettivi.'},
    {time:540,title:'GHR alla panca',prescription:'Serie da impostare',detail:'Movimento alla panca che Chris chiama GHR nel parlato. Segui il video per riconoscere la variante mostrata.'},
    {time:600,title:'Leg press',prescription:'Serie da impostare',detail:'Lavoro ad alto volume. Le60ripetizioni menzionate dopo la prova non diventano automaticamente la tua prescrizione.'},
    {time:811,title:'Polpacci da seduto',prescription:'Serie da impostare',detail:'Finale per i polpacci alla macchina da seduto. Ripetizioni e recuperi da registrare sul momento.'}
  ],
  exercises:[
    {id:'cbum-legs-curl',name:'Leg curl sdraiato',muscle:'Gambe',equipment:'Macchina',sets:2,reps:null,freeReps:true,time:202,instructions:'Alternato alla leg extension, con recupero manuale; ripetizioni non prescritte.'},
    {id:'cbum-legs-extension',name:'Leg extension plate-loaded',muscle:'Gambe',equipment:'Macchina',sets:2,reps:null,freeReps:true,time:202,instructions:'Alternata al leg curl; ripetizioni non prescritte.'},
    {id:'cbum-legs-front',name:'Front squat bilanciere',muscle:'Gambe',equipment:'Bilanciere',setsKey:'frontSets',reps:null,freeReps:true,time:306},
    {id:'cbum-legs-ghr',name:'GHR alla panca',muscle:'Gambe',equipment:'Macchina',setsKey:'ghrSets',reps:null,freeReps:true,time:540},
    {id:'cbum-legs-press',name:'Leg press',muscle:'Gambe',equipment:'Macchina',setsKey:'pressSets',reps:null,freeReps:true,time:600},
    {id:'cbum-legs-calf',name:'Calf raise da seduto alla macchina',muscle:'Gambe',equipment:'Macchina',setsKey:'calfSets',reps:null,freeReps:true,time:811}
  ]
};

export const additionalSessions=[chestReference,legsReference];
export function importVideoSession(state,key,choices={}) {
  const ref=additionalSessions.find(r=>r.key===key);if(!ref)throw new Error('Sessione non trovata.');
  for(const requirement of ref.requirements)if(!Number.isInteger(choices[requirement.key])||choices[requirement.key]<1||choices[requirement.key]>20)throw new Error(`${requirement.label}: scegli da 1 a 20. Il video non impone questo numero.`);
  const next=clone(state);
  for(const row of ref.exercises)if(!next.exercises.some(e=>e.id===row.id))next.exercises.push({id:row.id,name:row.name,muscle:row.muscle,equipment:row.equipment,custom:false,notes:`Dal video pubblico ${ref.title}, ${ref.published}. ${row.instructions??''}`});
  const personal=ref.requirements.map(r=>`${r.label}: ${choices[r.key]} (scelta personale)`).join('; ');
  const plan={id:uid(),sourceId:ref.id,name:ref.name,notes:`${ref.note} ${personal}. Recuperi non dichiarati manuali; ripetizioni libere da registrare, non sono un target della fonte.`,exercises:ref.exercises.map(row=>({id:uid(),exerciseId:row.id,sets:row.sets??choices[row.setsKey],reps:row.reps,rest:row.rest??0,group:row.group??'',drops:0,...Object.fromEntries(['freeReps','transitionRest','sameWeight','instructions'].filter(k=>row[k]!=null).map(k=>[k,row[k]])),...(row.setsKey?{instructions:`${row.instructions??''} Serie/giri scelti da te; non dichiarati dal video.`}:{})}))};
  validatePlan(plan,next);next.plans.push(plan);return next;
}

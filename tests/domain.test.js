import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, clone, startWorkout, completeSet, finishWorkout, togglePause, elapsed, swapExercise, sessionStats, foodTotals, recipeTotals, streak, validateBackup, validatePlan } from '../src/domain.js';
import { backReference, importBackReference } from '../src/references.js';
import { exerciseVideo, exerciseVideos, youtubeUrl } from '../src/videos.js';
import { ppl, importPpl, pplDates, schedulePpl } from '../src/ppl.js';
import { startEffort, addVariableDrop } from '../src/domain.js';

test('PPL completo: sei sedute dei prospetti, serie diseguali e nessuna copia sovrascritta', () => {
  const state=initialState(), original=clone(state); let next=importPpl(state);
  assert.deepEqual(state,original);assert.equal(next.plans.length,7);
  assert.deepEqual(next.plans.slice(1).map(p=>p.exercises.reduce((n,r)=>n+r.sets,0)),[20,17,19,19,17,20]);
  for(const plan of next.plans.slice(1)) { validatePlan(plan,next); validateBackup(startWorkout(next,plan,10000)); }
  next.plans[1].name='La mia copia';next=importPpl(next);assert.equal(next.plans.length,7);assert.equal(next.plans[1].name,'La mia copia');
  assert.deepEqual(ppl.sessions.map(s=>s.name),['Push A','Pull A','Gambe A','Push B','Pull B','Gambe B']);
});

test('ciclo PPL: date locali attraverso DST, riposi scelti, conflitti senza perdita calendario', () => {
  const dates=pplDates('2026-10-23',1,1,1);
  assert.deepEqual(dates.map(d=>d.date),['2026-10-23','2026-10-24','2026-10-25','2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30']);
  assert.deepEqual(dates.map(d=>d.name),['Push A','Pull A','Gambe A','Riposo','Push B','Pull B','Gambe B','Riposo']);
  assert.equal(pplDates('2026-10-23',0,0,1).length,6);
  const state=schedulePpl(initialState(),'2026-10-23',1,1,2);assert.equal(state.schedule.length,16);validateBackup(state);
  const before=clone(state);assert.throws(()=>schedulePpl(state,'2026-10-24',1,1,1),/già pianificato/);assert.deepEqual(state,before);
  assert.throws(()=>pplDates('2026-02-30',1,1,1));assert.throws(()=>pplDates('2026-10-23',-1,1,1));
});

test('serie40s e cedimento: nessuna ripetizione inventata, timer persistente e pause annullano sforzo', () => {
  let state=importPpl(initialState()), plan=state.plans.find(p=>p.sourceId?.endsWith('pull-a'));state=startWorkout(state,plan,10000);
  const timed=state.active.exercises.find(e=>e.targetSeconds===40);assert.equal(timed.sets[0].reps,null);assert.equal(timed.sets[0].target,'40 s');
  state=startEffort(state,timed.id,20000);state=validateBackup(JSON.stringify(state));assert.equal(state.active.effortUntil,60000);
  assert.throws(()=>completeSet(state,timed.id,timed.sets[0].id,30000),/Ripetizioni/);
  const row=state.active.exercises.find(e=>e.id===timed.id);row.sets[0].kg=10;row.sets[0].reps=15;
  state=completeSet(state,row.id,row.sets[0].id,60000);assert.equal(state.active.effortUntil,null);assert.equal(sessionStats(state.active).volume,150);
  state=startEffort(state,timed.id,70000);state=togglePause(state,75000);assert.equal(state.active.effortUntil,null);
  assert.equal(state.active.exercises.find(e=>e.toFailure).sets[0].target,'AMRAP');
});

test('giri sfalsati polpacci/curl e run-the-rack senza numero drop imposto', () => {
  let state=importPpl(initialState());state=startWorkout(state,state.plans.find(p=>p.sourceId?.endsWith('legs-a')),10000);
  const calves=state.active.exercises.find(e=>e.exerciseId==='ppl19-seated-calf'), curls=state.active.exercises.filter(e=>e.exerciseId==='ppl19-lying-curl');
  assert.deepEqual(calves.sets.map(s=>s.round),[0,1,2,3,4,5]);assert.deepEqual(curls.flatMap(e=>e.sets.map(s=>s.round)),[2,3,4,5]);
  state=importPpl(initialState());state=startWorkout(state,state.plans.find(p=>p.sourceId?.endsWith('pull-b')),10000);
  const drop=state.active.exercises.find(e=>e.variableDrops);assert.equal(drop.sets.length,1);state=addVariableDrop(state,drop.id);state=addVariableDrop(state,drop.id);
  assert.deepEqual(state.active.exercises.find(e=>e.id===drop.id).sets.map(s=>s.kind),['working','drop','drop']);validateBackup(state);
  assert.equal(state.active.exercises[0].sets[0].kind,'warmup');
});

test('video: tutta la libreria ha link diretti, personali validati e conservati nei backup', () => {
  const state = importBackReference(initialState(), 15);
  assert.equal(Object.keys(exerciseVideos).length, 52);
  for (const exercise of state.exercises) assert.match(exerciseVideo(exercise).url, /^https:\/\/www.youtube.com\/watch\?v=[\w-]{11}/);
  state.exercises[0].videoUrl = 'https://youtu.be/8iPEnn-ltC8?t=30&si=unneeded';
  const restored = validateBackup(JSON.stringify(state));
  assert.equal(restored.exercises[0].videoUrl, 'https://www.youtube.com/watch?v=8iPEnn-ltC8&t=30');
  assert.equal(exerciseVideo(restored.exercises[0]).author, 'Link personale');
  for (const bad of ['javascript:alert(1)', 'https://example.com/watch?v=8iPEnn-ltC8', 'https://youtube.com.evil.test/watch?v=8iPEnn-ltC8', 'http://youtu.be/8iPEnn-ltC8', 'https://youtube.com/playlist?list=abc', false]) {
    assert.throws(() => youtubeUrl(bad));
    state.exercises[0].videoUrl = bad; assert.throws(() => validateBackup(state));
  }
  assert.equal(youtubeUrl('https://youtube.com/shorts/8iPEnn-ltC8'), 'https://www.youtube.com/watch?v=8iPEnn-ltC8');
  assert.equal(exerciseVideo({ id: 'custom' }), null);
});

test('sessione persistente: carichi, pause e storico mantengono i dati e il volume', () => {
  let state = initialState(); state = startWorkout(state, state.plans[0], 10000);
  const row = state.active.exercises[0], set = row.sets[0]; set.kg = 60; set.reps = 8;
  state = completeSet(state, row.id, set.id, 12000);
  assert.equal(state.active.restUntil, 102000);
  state = togglePause(state, 20000); assert.equal(elapsed(state.active, 50000), 10);
  state = validateBackup(JSON.stringify(state)); state = togglePause(state, 60000);
  state = finishWorkout(state, 80000);
  assert.equal(state.active, null); assert.equal(state.history[0].duration, 30);
  assert.deepEqual(state.history[0].stats, { sets: 1, reps: 8, volume: 480 });
});
test('superset: recupero solo dopo entrambi gli esercizi dello stesso giro', () => {
  let s = initialState(); const plan = clone(s.plans[0]); plan.exercises = plan.exercises.slice(0, 2); plan.exercises.forEach(e => e.group = 'A');
  s = startWorkout(s, plan, 1000);
  const [a,b] = s.active.exercises;
  s = completeSet(s, a.id, a.sets[0].id, 2000); assert.equal(s.active.restUntil, null);
  s = completeSet(s, b.id, b.sets[0].id, 3000); assert.equal(s.active.restUntil, 93000);
  s = completeSet(s, a.id, a.sets[1].id, 4000); assert.equal(s.active.restUntil, null);
});
test('drop set: nessun recupero tra serie principale e drop; ogni drop conta nel volume', () => {
  let s = initialState(); const p = clone(s.plans[0]); p.exercises = p.exercises.slice(0, 1); p.exercises[0].drops = 2;
  s = startWorkout(s, p, 1000); const e = s.active.exercises[0];
  e.sets[0].kg=50; e.sets[1].kg=40; e.sets[2].kg=30;
  for (let i = 0; i < 2; i++) { s = completeSet(s, e.id, e.sets[i].id, 2000 + i); assert.equal(s.active.restUntil, null); }
  s = completeSet(s, e.id, e.sets[2].id, 3000); assert.equal(s.active.restUntil, 93000);
  assert.equal(sessionStats(s.active).volume, 1200);
});
test('sostituzione solo prima di completare serie, storico originale preservato', () => {
  let s = initialState(); s = startWorkout(s, s.plans[0]); const row = s.active.exercises[0], original = s.plans[0].exercises[0].exerciseId;
  s = swapExercise(s, row.id, 'ex-1'); assert.equal(s.active.exercises[0].exerciseId, 'ex-1'); assert.equal(s.plans[0].exercises[0].exerciseId, original);
  s = completeSet(s, row.id, row.sets[0].id);
  assert.throws(() => swapExercise(s, row.id, 'ex-2'), /prima di registrarne/);
});
test('nessuna sessione sovrascritta, nessuno storico vuoto, nessuna serie in pausa', () => {
  let s = initialState(); s = startWorkout(s, s.plans[0]);
  assert.throws(() => startWorkout(s, s.plans[0]), /in corso/); assert.throws(() => finishWorkout(s), /almeno una serie/);
  s = togglePause(s); const e = s.active.exercises[0]; assert.throws(() => completeSet(s, e.id, e.sets[0].id), /Riprendi/);
});
test('ripetizioni, numeri e gruppi superset validati', () => {
  const s = initialState(), p = clone(s.plans[0]); p.exercises[0].group = 'A'; assert.throws(() => validatePlan(p,s), /almeno due/);
  p.exercises[1].group = 'A'; p.exercises[1].sets=4; assert.throws(() => validatePlan(p,s), /stesso numero/);
  p.exercises[1].sets=3; p.exercises[0].reps=2.5; assert.throws(() => validatePlan(p,s), /interi/);
});
test('nutrizione per grammi e ricette: somma indipendente per nutrienti', () => {
  const foods=[{id:'one',kcal:100,protein:10,carbs:15,fat:2},{id:'two',kcal:200,protein:20,carbs:25,fat:5}];
  assert.deepEqual(foodTotals(foods[0],150),{kcal:150,protein:15,carbs:22.5,fat:3});
  assert.deepEqual(recipeTotals([{foodId:'one',grams:100},{foodId:'two',grams:50}],foods),{kcal:200,protein:20,carbs:27.5,fat:4.5});
  assert.throws(()=>foodTotals(foods[0],-10)); assert.throws(()=>recipeTotals([{foodId:'missing',grams:100}],foods));
});
test('streak preservata se oggi non ancora completato, interrotta da giorno mancante', () => {
  const s=initialState(),id=s.habits[0].id; s.checks={'2026-11-01':[id],'2026-11-02':[id]};
  assert.equal(streak(s,id,'2026-11-03'),2); s.checks['2026-11-03']=[id]; assert.equal(streak(s,id,'2026-11-03'),3); assert.equal(streak(s,id,'2026-11-05'),0);
});
test('import backup non valido rifiutato senza mutare l’archivio', () => {
  const s=initialState(), before=JSON.stringify(s); assert.deepEqual(validateBackup(before),s);
  const invalid=clone(s); invalid.plans[0].exercises[0].exerciseId='not-found'; assert.throws(()=>validateBackup(invalid),/non trovato/);
  const duplicate=clone(s); duplicate.exercises.push(clone(s.exercises[0])); assert.throws(()=>validateBackup(duplicate),/duplicati/);
  assert.throws(()=>validateBackup('{invalid')); assert.throws(()=>validateBackup({version:99})); assert.equal(JSON.stringify(s),before);
  const session=startWorkout(s,s.plans[0]);session.active.exercises[0].sets[0].reps='10';assert.throws(()=>validateBackup(session),/numero non valido/);
});

test('video originale: 2x8, due tri-set 3x8-12, finisher10x10, nessun recupero inventato', () => {
  const original=initialState(), s=importBackReference(original,15), p=s.plans.at(-1);
  assert.equal(original.plans.length,1);assert.equal(p.exercises.length,8);assert.deepEqual(p.exercises[0].restPause,[1,2]);
  assert.equal(p.sourceId,backReference.id);assert.equal(p.exercises[0].sets,2);assert.equal(p.exercises[0].reps,8);
  for(const row of p.exercises.slice(1,7)){assert.equal(row.sets,3);assert.equal(row.reps,8);assert.equal(row.repsMax,12);}
  assert.equal(p.exercises[7].sets,10);assert.equal(p.exercises[7].reps,10);assert.equal(p.exercises[7].sameWeight,true);
  assert(p.exercises.every(e=>e.rest===0));assert.equal(validatePlan(p,s),p);assert.deepEqual(validateBackup(JSON.stringify(s)),s);
  assert.throws(()=>importBackReference(original,90));
});

test('rest-pause distinto dai drop: timer breve, conteggi variabili, ordine, recupero manuale e volume', () => {
  let s=importBackReference(initialState(),15);s=startWorkout(s,s.plans.at(-1),1000);
  let e=s.active.exercises[0];assert.deepEqual(e.sets.map(x=>x.kind),['working','restpause','working','restpause','restpause']);
  assert.throws(()=>completeSet(s,e.id,e.sets[1].id),/prima la serie/);
  const ids=e.sets.map(x=>x.id);
  for(let i=0;i<ids.length;i++){
    e=s.active.exercises[0];const set=e.sets[i];
    if(set.kind==='restpause'){assert.equal(set.reps,null);assert.throws(()=>completeSet(s,e.id,set.id),/Ripetizioni/);}
    set.kg=50;set.reps=[8,3,8,3,2][i];s=completeSet(s,e.id,set.id,2000+i*1000);
    if([0,2,3].includes(i)){assert.equal(s.active.restUntil,2000+i*1000+15000);assert.equal(s.active.restKind,'restpause');}
    else assert.equal(s.active.restUntil,null);
  }
  assert.equal(sessionStats(s.active).volume,1200);assert.equal(sessionStats(s.active).sets,5);
  assert.deepEqual(validateBackup(JSON.stringify(s)),s);s=finishWorkout(s,30000);assert.equal(s.history[0].stats.volume,1200);assert.deepEqual(validateBackup(JSON.stringify(s)),s);
});

test('intervalli: target8-12 preservato, nessuna ripetizione reale inventata e validazione backup',()=>{
  let s=importBackReference(initialState(),10);s=startWorkout(s,s.plans.at(-1));const e=s.active.exercises[1],set=e.sets[0];
  assert.equal(set.reps,null);assert.equal(set.target,'8–12');assert.throws(()=>completeSet(s,e.id,set.id),/Ripetizioni/);
  set.reps=9;set.kg=20;s=completeSet(s,e.id,set.id);assert.equal(sessionStats(s.active).volume,180);assert.equal(s.active.restUntil,null);
  assert.deepEqual(validateBackup(JSON.stringify(s)),s);
  const bad=clone(s);bad.active.exercises[0].restPauseSeconds=1000;assert.throws(()=>validateBackup(bad));
});

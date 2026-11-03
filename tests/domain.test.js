import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, clone, startWorkout, completeSet, finishWorkout, togglePause, elapsed, swapExercise, sessionStats, foodTotals, recipeTotals, streak, validateBackup, validatePlan } from '../src/domain.js';
import { backReference, importBackReference } from '../src/references.js';

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

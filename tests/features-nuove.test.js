import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState,clone,rotateWorkoutSchedule,progressionSuggestion,startWorkout,finishWorkout,validateBackup,addWarmupSet,completeSet,sessionStats } from '../src/domain.js';


test('rotazione da Legs o Pull conserva riposi e storico', () => {
  const plans=initialState(); const p=plans.plans[0];
  plans.plans=[{...p,id:'push',name:'Push'},{...p,id:'pull',name:'Pull'},{...p,id:'legs',name:'Legs'}];
  plans.schedule=['push','pull','legs','rest','push','pull'].map((id,i)=>({id:'s'+i,date:'2026-11-'+String(4+i).padStart(2,'0'),...(id==='rest'?{kind:'rest'}:{planId:id})}));
  const original=clone(plans); const rotated=rotateWorkoutSchedule(plans,'legs','2026-11-04');
  assert.deepEqual(plans,original);
  assert.deepEqual(rotated.schedule.filter(x=>x.kind!=='rest').map(x=>x.planId),['legs','push','pull','legs','push']);
  assert.equal(rotated.schedule[3].kind,'rest');
  assert.deepEqual(rotateWorkoutSchedule(plans,'pull','2026-11-04').schedule.slice(0,3).map(x=>x.planId),['pull','legs','push']);
  assert.doesNotThrow(()=>validateBackup(rotated));
});

test('progressione conservativa: 65 a 70 solo con range massimo raggiunto', () => {
  const state=initialState(); const plan=state.plans[0];
  plan.exercises=[{...plan.exercises[0],sets:2,reps:6,repsMax:10}];
  const id=plan.exercises[0].exerciseId;
  let s=startWorkout(state,plan,10000); const row=s.active.exercises[0];
  for(const set of row.sets){set.kg=65;set.reps=10;set.done=true;}
  s=finishWorkout(s,30000);
  assert.deepEqual(progressionSuggestion(s,id,5),{load:65,repetitions:10,maxReps:10,ready:true,suggested:70});
  const next=startWorkout(s,plan,40000); for(const set of next.active.exercises[0].sets){set.kg=70;set.reps=8;set.done=true;}
  const final=finishWorkout(next,50000);
  assert.equal(progressionSuggestion(final,id,5).suggested,70);
  assert.equal(progressionSuggestion(final,id,5).ready,false);
  assert.doesNotThrow(()=>validateBackup(final));
});

test('avvicinamento personalizzato: 70x5 e 80x5 non falsano il volume di lavoro', () => {
  const state=initialState(), plan=state.plans[0];
  plan.exercises=[{...plan.exercises[0],sets:1,reps:8}];
  let next=startWorkout(state,plan,10000), row=next.active.exercises[0];
  next=addWarmupSet(next,row.id); next=addWarmupSet(next,row.id);
  row=next.active.exercises[0];
  assert.equal(row.sets.filter(s=>s.kind==='warmup').length,2);
  for (const [i,load] of [70,80].entries()) {row=next.active.exercises[0];const set=row.sets[i];set.kg=load;set.reps=5;next=completeSet(next,row.id,set.id,11000+i*1000); }
  assert.equal(sessionStats(next.active).volume,0);
  row=next.active.exercises[0];const work=row.sets.find(s=>s.kind==='working');work.kg=90;work.reps=8;
  next=completeSet(next,row.id,work.id,15000);
  assert.equal(sessionStats(next.active).volume,720);
  assert.equal(sessionStats(next.active).sets,1);
  assert.doesNotThrow(()=>validateBackup(next));
});

test('scegli allenamento nel giorno di riposo: il calendario non resta su Riposo', () => {
  const state=initialState();const plan=state.plans[0];
  state.schedule=[{id:'rest-today',date:'2026-11-04',kind:'rest'},{id:'next',date:'2026-11-05',planId:plan.id}];
  const rotated=rotateWorkoutSchedule(state,plan.id,'2026-11-04');
  assert.equal(rotated.schedule.find(x=>x.date==='2026-11-04').planId,plan.id);
  assert.equal(rotated.schedule.find(x=>x.date==='2026-11-04').kind,undefined);
  assert.equal(rotated.schedule.length,2);
  assert.doesNotThrow(()=>validateBackup(rotated));
});

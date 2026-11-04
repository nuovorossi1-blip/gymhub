import test from 'node:test';
import assert from 'node:assert/strict';
import {cbumCatalog} from '../src/cbum-catalog.js';
import {trainingDetails,hanyPreparations,fstMethod} from '../src/training-details.js';
test('prescrizioni: cinque sedute storiche e sette off-season documentate, due riposi',()=>{
 assert.equal(trainingDetails['cbum-five-2016'].length,5);
 assert.ok(trainingDetails['cbum-five-2016'].every(s=>s.exercises.length>=5));
 const data=trainingDetails['cbum-offseason-2024'];
 assert.equal(data.length,9);
 assert.equal(data.filter(Boolean).length,7);
 assert.equal(cbumCatalog.find(p=>p.id==='cbum-offseason-2024').sessions.filter(x=>x.rest).length,2);
 assert.equal(data[0].exercises[1].series,'10');
 assert.equal(data[0].exercises[1].reps,'10');
 assert.ok(data[5].methods.includes('Tri-set bicipiti'));
});
test('2022: 8 esercizi senza serie attribuite; FST-7 solo confermato nella seduta 2024',()=>{
 const chest=hanyPreparations.hany2022.sessions[0];
 assert.equal(chest.exercises.length,8);
 assert.ok(chest.exercises.every(e=>!e.series&&!e.reps));
 const legs=hanyPreparations.hany2024.sessions[0];
 assert.equal(legs.exercises.length,6);
 assert.equal(legs.exercises[5].series,'7');
 assert.ok(legs.exercises.slice(0,5).every(e=>!e.series));
 assert.ok(fstMethod.source.startsWith('https://'));
});
test('2023: otto slot, petto e schiena documentati; 2020 mai numeri inventati',()=>{
 const p=cbumCatalog.find(p=>p.id==='cbum-olympia-2023');
 const s=trainingDetails[p.id];
 assert.equal(s.length,p.sessions.length);
 assert.equal(s[1].exercises.length,7);
 assert.equal(s[2].exercises.length,8);
 assert.equal(s[0],null);
 assert.deepEqual(trainingDetails['cbum-olympia-2020'],[]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,clone,validateBackup} from '../src/domain.js';
import {cbumCatalog,catalogDates,scheduleCatalog} from '../src/cbum-catalog.js';

test('catalogo documentato: 5, 8, 8, 9 giorni e riposi precisi',()=>{
 assert.deepEqual(cbumCatalog.map(p=>p.sessions.length),[5,8,8,9]);
 assert.deepEqual(cbumCatalog.map(p=>p.sessions.filter(s=>s.rest).length),[0,2,2,2]);
 const p=cbumCatalog[3],dates=catalogDates(p,'2026-11-04',2);
 assert.equal(dates.length,18);
 assert.deepEqual(dates.filter(d=>d.rest).map(d=>d.date),['2026-11-07','2026-11-12','2026-11-16','2026-11-21']);
 assert.equal(dates[9].name,p.sessions[0].name);
 assert.throws(()=>catalogDates(p,'2026-02-30',1),/Data/);
});
test('programmazione: associa schede utente, conserva storico, impedisce sovrascrittura',()=>{
 const state=initialState(),original=clone(state),p=cbumCatalog[2];
 const map=Object.fromEntries(p.sessions.map((s,i)=>[i,state.plans[0].id]));
 const next=scheduleCatalog(state,p.id,'2026-11-04',2,map);
 assert.deepEqual(state,original);
 assert.equal(next.schedule.length,16);
 assert.equal(next.schedule.filter(s=>s.kind==='rest').length,4);
 assert.equal(next.schedule[0].planId,state.plans[0].id);
 assert.equal(next.schedule[0].sessionName,'Quadricipiti');
 assert.equal(next.schedule[4].sessionName,'Spalle e petto');
 assert.doesNotThrow(()=>validateBackup(next));
 assert.throws(()=>scheduleCatalog(next,p.id,'2026-11-04',1,map),/occupata/);
 assert.throws(()=>scheduleCatalog(state,p.id,'2026-11-04',1,{}),/Associa/);
});

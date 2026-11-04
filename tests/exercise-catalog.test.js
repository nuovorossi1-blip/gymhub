import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../src/domain.js';
import {exerciseReferenceCatalog,searchLibraryExercises,matchReferenceExercise,findReferenceExercise,normalizeExerciseSearch} from '../src/exercise-catalog.js';
test('catalogo: JM Press è cercabile per nome italiano e sinonimi anche senza importazione',()=>{
 const state=initialState();
 const byName=searchLibraryExercises(state.exercises,'JM press bilanciere');
 assert.equal(byName.length,1);
 const jm=byName[0];
 assert.equal(jm.kind,'reference');
 assert.equal(jm.name,'JM press bilanciere');
 assert.equal(jm.muscle,'Tricipiti');
 assert.equal(jm.equipment,'Bilanciere');
 assert.ok(jm.steps.length>=3);
 assert.ok(jm.demos.some(d=>d.url.includes('weighttraining.guide/exercises/barbell-jm-press')));
 assert.ok(jm.demos.some(d=>d.url.includes('elitefts.com/')));
 assert.ok(jm.demos.some(d=>d.url.includes('ynbS3UZT2O8&t=462s')));
 assert.equal(searchLibraryExercises(state.exercises,'Barbell JM Press')[0].id,jm.id);
 assert.equal(searchLibraryExercises(state.exercises,'JM Blakley press')[0].id,jm.id);
 assert.equal(matchReferenceExercise('JM Press bilanciere').id,jm.id);
 assert.equal(findReferenceExercise(jm.id).id,jm.id);
});
test('ricerca variazioni, assenza duplicati e preservazione esercizi utente',()=>{
 const saved=initialState().exercises;
 const copied={id:'custom-jm',name:'JM press bilanciere',muscle:'Tricipiti',equipment:'Bilanciere',custom:true};
 const result=searchLibraryExercises([...saved,copied],'JM press');
 assert.equal(result.length,1);
 assert.equal(result[0].kind,'saved');
 assert.equal(result[0].id,'custom-jm');
 assert.equal(searchLibraryExercises(saved,'JM press','Gambe').length,0);
 assert.equal(searchLibraryExercises(saved,'JM press','Tricipiti').length,1);
 assert.ok(exerciseReferenceCatalog.length>65);
 assert.ok(searchLibraryExercises(saved,'Face pull').length>0);
 assert.equal(normalizeExerciseSearch('J.M. Press  bilancière'),'j m press bilanciere');
 assert.equal(saved.length,26);
});
test('i collegamenti multimediali puntano a siti esterni, nessuna risorsa è inclusa nel bundle',()=>{
 for(const entry of exerciseReferenceCatalog){
  for(const d of entry.demos){
   assert.match(d.url,/^https:\/\//);
   assert.ok(['youtube.com','weighttraining.guide','elitefts.com'].some(host=>new URL(d.url).hostname.endsWith(host)));
  }
 }
});

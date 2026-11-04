import test from 'node:test';
import assert from 'node:assert/strict';
import {motionPresetFor,motionPresets,motionPanelHtml} from '../src/motion-viewer.js';
import {searchLibraryExercises} from '../src/exercise-catalog.js';
import {initialState} from '../src/domain.js';
test('sei nuovi movimenti hanno traiettorie e tecniche specifiche',()=>{
 const values=[
  ['Squat','squat'],
  ['Curl bilanciere EZ','curl'],
  ['Shoulder press manubri','press'],
  ['Rematore bilanciere busto flesso','row'],
  ['Lat machine presa larga','lat'],
  ['Leg extension','legextension']
 ];
 for(const [name,kind] of values){
  assert.equal(motionPresetFor(name),kind);
  assert.ok(motionPresets[kind].do.length>=3);
  assert.ok(motionPresets[kind].dont.length>=2);
  assert.match(motionPanelHtml(name),/data-motion="/);
 }
 assert.notEqual(motionPresets.squat.path,motionPresets.row.path);
 assert.notEqual(motionPresets.lat.path,motionPresets.curl.path);
});
test('varianti non equivalenti restano distinte, macchina lat separata',()=>{
 assert.equal(motionPresetFor('Shoulder press manubri alternata'),null);
 assert.equal(motionPresetFor('Lat machine presa supina'),null);
 assert.equal(motionPresetFor('Lat machine presa larga o trazioni assistite'),null);
 assert.equal(motionPresetFor('Rematore manubri petto supportato'),null);
 assert.equal(motionPresetFor('Panca piana presa stretta'),null);
 const x=searchLibraryExercises(initialState().exercises,'Lat machine presa larga');
 assert.ok(x.some(e=>e.name==='Lat machine presa larga'));
 assert.ok(x.some(e=>e.name.includes('trazioni assistite')));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {motionPresetFor,motionPresets,motionPanelHtml} from '../src/motion-viewer.js';
test('panca e JM Press hanno due traiettorie e prese distinte',()=>{
 assert.equal(motionPresetFor('Panca piana'),'bench');
 assert.equal(motionPresetFor('Barbell Bench Press'),'bench');
 assert.equal(motionPresetFor('JM Press bilanciere'),'jm');
 assert.equal(motionPresetFor('Barbell JM Press'),'jm');
 assert.equal(motionPresetFor('Panca piana presa stretta'),null);
 assert.equal(motionPresetFor('Pec deck'),null);
 assert.notDeepEqual(motionPresets.bench.bottom,motionPresets.jm.bottom);
 assert.notEqual(motionPresets.bench.width,motionPresets.jm.width);
 assert.match(motionPresets.bench.do.join(' '),/sterno medio-basso/);
 assert.match(motionPresets.jm.dont.join(' '),/viso/);
});
test('pannello 3D contiene comandi reali, istruzioni affiancate, limiti dichiarati',()=>{
 const html=motionPanelHtml('JM Press bilanciere');
 assert.match(html,/motion-workspace/);
 assert.match(html,/data-motion-control="play"/);
 assert.match(html,/data-motion-control="side"/);
 assert.match(html,/data-motion-speed/);
 assert.match(html,/0,25×/);
 assert.match(html,/Cosa fare/);
 assert.match(html,/Cosa evitare/);
 assert.match(html,/MODELLO SCHEMATICO 3D/);
 const absent=motionPanelHtml('Esercizio senza dimostrazione');
 assert.match(absent,/non ancora verificata/);
 assert.doesNotMatch(absent,/<canvas/);
});

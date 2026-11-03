import { clone, uid } from './domain.js';

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

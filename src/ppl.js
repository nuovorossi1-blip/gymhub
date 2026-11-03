import { clone, uid, dayKey, validatePlan } from './domain.js';

// Dati fattuali dei sei prospetti del video ufficiale. Nessun fotogramma distribuito.
export const ppl = {
  id: 'cbum-ppl-2019', name: 'Chris Bumstead · PPL completo 2019',
  video: 'https://www.youtube.com/watch?v=p-8WBLBrG4k', date: '2019-11-21',
  restTime: 374, sequenceTime: 471,
  restNote: 'Sei sedute in rotazione. Nel video Chris sceglie i giorni di riposo secondo necessità: non fissa una settimana lunedì–domenica né impone un riposo dopo ogni terna.',
  sessions: []
};
// [ID, nome, muscolo, attrezzo, spiegazione nel video]
export const pplExercises = [
  ['ppl19-incline-barbell', 'Panca inclinata bilanciere', 'Petto', 'Bilanciere', 528],
  ['ppl19-alternating-press', 'Shoulder press manubri alternata', 'Spalle', 'Manubri', 560],
  ['ppl19-dips', 'Dip alle parallele', 'Tricipiti', 'Corpo libero', 604],
  ['ppl19-barbell-row', 'Rematore bilanciere busto flesso', 'Schiena', 'Bilanciere', 671],
  ['ppl19-incline-curl', 'Curl manubri su panca inclinata', 'Bicipiti', 'Manubri', 703],
  ['ppl19-ez-curl', 'Curl bilanciere EZ', 'Bicipiti', 'Bilanciere', 746],
  ['ppl19-barbell-lunge', 'Affondi con bilanciere', 'Gambe', 'Bilanciere', 815],
  ['ppl19-hip-thrust', 'Hip thrust', 'Gambe', 'Bilanciere', 897],
  ['ppl19-seated-calf', 'Calf raise seduto', 'Gambe', 'Macchina', 911],
  ['ppl19-lying-curl', 'Leg curl sdraiato', 'Gambe', 'Macchina', 943],
  ['ppl19-close-bench', 'Panca piana presa stretta', 'Tricipiti', 'Bilanciere', 1006],
  ['ppl19-standing-press', 'Military press in piedi', 'Spalle', 'Bilanciere', 1025],
  ['ppl19-pec-deck', 'Croci pec deck', 'Petto', 'Macchina', 1047],
  ['ppl19-rack-pull', 'Rack pull', 'Schiena', 'Bilanciere', 1130],
  ['ppl19-hammer', 'Hammer curl manubri', 'Bicipiti', 'Manubri', 1184],
  ['ppl19-reverse-pulldown', 'Lat machine presa supina', 'Schiena', 'Macchina', 1213],
  ['ppl19-adductor', 'Adductor machine', 'Gambe', 'Macchina', 1376],
  ['ppl19-press-calf', 'Calf raise alla leg press', 'Gambe', 'Macchina', 1361]
];
const r = (exerciseId, sets, reps, repsMax, extra = {}) => ({ exerciseId, sets, reps, ...(repsMax ? { repsMax } : {}), rest: 0, group: '', drops: 0, ...extra });
const timed = (id, sets, extra = {}) => r(id, sets, null, null, { targetSeconds: 40, ...extra });
const failure = (id, sets, extra = {}) => r(id, sets, null, null, { toFailure: true, ...extra });
const session = (key, name, focus, time, cardTime, exercises) => ({ key, name, focus, time, cardTime, exercises });
ppl.sessions = [
  session('push-a', 'Push A', 'Petto · Spalle · Tricipiti', 526, 550, [
    r('ppl19-incline-barbell', 2, 5, 8, { label: 'Serie pesanti', instructions: 'Il video ammette panca inclinata o piana; qui è selezionata l’inclinata.' }),
    r('ppl19-incline-barbell', 1, 10, 12, { label: 'Back-off' }),
    r('ppl19-alternating-press', 3, 10, 12),
    r('ex-2', 3, 10, 12, { group: 'A', instructions: 'Croci: il video ammette una variante a scelta; qui ai cavi.' }),
    r('ex-20', 4, 7, 10, { group: 'A', instructions: 'Estensioni tricipiti: qui pushdown. Tre giri con le croci; la quarta serie è singola.' }),
    r('ex-16', 4, 10, 12, { instructions: 'Indicazione del prospetto: recupero inferiore a 1 minuto; imposta manualmente la durata.' }),
    failure('ppl19-dips', 3, { instructions: 'Nel video: busto più verticale per mantenere enfasi sui tricipiti.' })
  ]),
  session('pull-a', 'Pull A', 'Schiena · Bicipiti', 630, 700, [
    r('ex-4', 2, 8, 10, { warmupSets: 2 }),
    r('ex-4', 1, 8, 10, { drops: 1, dropRepsManual: true, label: 'Ultima serie + drop', instructions: 'Un drop nell’ultima serie; ripetizioni del drop non specificate.' }),
    r('ppl19-barbell-row', 2, 6, 8, { warmupSets: 2, label: 'Serie pesanti' }),
    r('ppl19-barbell-row', 1, 10, 12, { label: 'Back-off' }),
    r('ppl19-incline-curl', 4, 10, 12),
    failure('ex-7', 3),
    r('ppl19-ez-curl', 2, 8, 10),
    timed('ppl19-ez-curl', 2, { instructions: '40 secondi di tensione continua per ciascuna serie.' })
  ]),
  session('legs-a', 'Gambe A', 'Gambe · Glutei · Polpacci', 797, 910, [
    r('ppl19-barbell-lunge', 3, 12, 15, { warmupSets: 3, instructions: '12–15 passi per gamba. Il video consente bilanciere o manubri; qui bilanciere.' }),
    r('ex-13', 3, 10, 12, { warmupSets: 2, instructions: 'Scelto RDL. Alternativa originale: stacco classico, 3 × 6–8.' }),
    r('ppl19-hip-thrust', 3, 10, 12, { instructions: 'Alternativa indicata nel video: kickback per i glutei.' }),
    r('ppl19-seated-calf', 6, 10, 12, { group: 'A', instructions: 'Prime due serie singole; ultime quattro in superset con il leg curl.' }),
    r('ppl19-lying-curl', 2, 8, 10, { group: 'A', groupOffset: 2 }),
    timed('ppl19-lying-curl', 2, { group: 'A', groupOffset: 4, instructions: 'Ultime due serie del leg curl: 40 secondi, abbinate ai giri 5 e 6 dei polpacci.' })
  ]),
  session('push-b', 'Push B', 'Petto · Spalle · Tricipiti', 987, 1050, [
    r('ppl19-close-bench', 3, 8, 10),
    r('ppl19-standing-press', 3, 10, 12),
    r('ppl19-pec-deck', 1, 8, 10),
    timed('ppl19-pec-deck', 2),
    r('ex-21', 3, 10, 12, { instructions: 'Estensione tricipiti sopra la testa: variante a scelta nel video; qui manubrio.' }),
    r('ex-16', 4, 10, 12, { group: 'A', instructions: 'Tre giri con i piegamenti; una serie di alzate laterali resta singola.' }),
    failure('ex-3', 3, { group: 'A' })
  ]),
  session('pull-b', 'Pull B', 'Schiena · Bicipiti', 1124, 1220, [
    r('ex-7', 3, null, null, { freeReps: true, warmup: true, instructions: 'Tre serie per attivazione mentre si esegue il riscaldamento del rack pull; ripetizioni non prescritte.' }),
    r('ppl19-rack-pull', 2, 8, 10, { warmupSets: 3 }),
    r('ppl19-hammer', 3, 10, 12),
    r('ppl19-reverse-pulldown', 3, 10, 12, { instructions: 'Alternativa originale: rematore presa supina al posto del pulldown.' }),
    r('ex-19', 3, 10, 12),
    r('ex-6', 2, 20),
    failure('ex-18', 1, { variableDrops: true, instructions: 'Un unico run-the-rack discendente fino a cedimento. Numero di riduzioni non fissato: aggiungi ogni riduzione che esegui.' })
  ]),
  session('legs-b', 'Gambe B', 'Gambe · Polpacci', 1285, 1380, [
    r('ex-8', 3, 8, 10, { warmupSets: 3 }),
    r('ex-8', 1, 4, 6, { label: 'Ultima serie pesante' }),
    timed('ex-9', 2, { group: 'A' }),
    failure('ppl19-press-calf', 2, { group: 'A' }),
    r('ppl19-adductor', 4, 10, 12),
    r('ex-14', 4, 10, 12, { instructions: 'Dopo le ripetizioni complete: ripetizioni parziali fino a cedimento, come indicato nel video. Annota quelle effettivamente eseguite.' }),
    r('ex-12', 2, 10, 12),
    r('ex-12', 2, null, null, { freeReps: true, drops: 2, dropRepsManual: true, label: 'Triple drop set', instructions: 'Ogni serie: carico iniziale e due riduzioni consecutive, poi recupero. Ripetizioni non fissate per questi drop.' })
  ])
];

export function importPpl(state) {
  const next = clone(state);
  for (const [id, name, muscle, equipment, videoTime] of pplExercises) if (!next.exercises.some(e => e.id === id)) next.exercises.push({ id, name, muscle, equipment, custom: false, notes: `Programma PPL pubblico di Chris Bumstead del 21/11/2019. Spiegazione al secondo ${videoTime} del video ufficiale.` });
  for (const s of ppl.sessions) {
    const sourceId = `${ppl.id}-${s.key}`;
    if (next.plans.some(p => p.sourceId === sourceId)) continue;
    const plan = { id: uid(), sourceId, name: `${s.name} · Chris 2019`, allowUnevenGroups: true,
      notes: `Seduta ${ppl.sessions.indexOf(s) + 1}/6 del PPL spiegato il 21/11/2019. Recuperi ordinari non quantificati: manuali. Riscaldamenti e varianti riportati nelle istruzioni. Scheda personale modificabile. ${ppl.restNote}`,
      exercises: s.exercises.map(row => ({ ...clone(row), id: uid() })) };
    validatePlan(plan, next); next.plans.push(plan);
  }
  return next;
}

export function pplDates(start, restA, restB, repeats = 1) {
  const date = new Date(`${start}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !Number.isFinite(date.getTime()) || dayKey(date) !== start) throw new Error('Scegli una data valida.');
  if (![restA, restB].every(n => Number.isInteger(n) && n >= 0 && n <= 3) || !Number.isInteger(repeats) || repeats < 1 || repeats > 8) throw new Error('Riposi da 0 a 3 giorni e ripetizioni del ciclo da 1 a 8.');
  const rows = [], add = row => { rows.push({ ...row, date: dayKey(date) }); date.setDate(date.getDate() + 1); };
  for (let i = 0; i < repeats; i++) for (const [index, s] of ppl.sessions.entries()) {
    add({ key: s.key, name: s.name, kind: 'training' });
    if (index === 2 || index === 5) for (let j = 0; j < (index === 2 ? restA : restB); j++) add({ name: 'Riposo', kind: 'rest' });
  }
  return rows;
}

export function schedulePpl(state, start, restA, restB, repeats) {
  const dates = pplDates(start, restA, restB, repeats);
  const conflict = dates.find(d => state.schedule.some(s => s.date === d.date));
  if (conflict) throw new Error(`Il ${conflict.date} è già pianificato. Scegli un’altra data o libera prima quel giorno; nessun appuntamento è stato sostituito.`);
  const next = importPpl(state), cycleId = uid();
  for (const d of dates) next.schedule.push({ id: uid(), date: d.date, programId: ppl.id, cycleId, ...(d.kind === 'rest' ? { kind: 'rest' } : { planId: next.plans.find(p => p.sourceId === `${ppl.id}-${d.key}`).id }) });
  return next;
}

export const uid = () => globalThis.crypto.randomUUID();
export const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const clone = value => structuredClone(value);
export const number = (value, min, max, label) => {
  const n = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label}: inserisci un valore tra ${min} e ${max}.`);
  return n;
};
export const text = (value, label, max = 100) => {
  const s = String(value ?? '').trim();
  if (!s || s.length > max) throw new Error(`${label}: da 1 a ${max} caratteri.`);
  return s;
};
export const MUSCLES = ['Petto', 'Schiena', 'Gambe', 'Spalle', 'Bicipiti', 'Tricipiti', 'Core', 'Cardio'];
export const EQUIPMENT = ['Bilanciere', 'Manubri', 'Macchina', 'Cavi', 'Corpo libero', 'Elastici', 'Altro'];

export function initialState() {
  const rows = [
    ['Panca piana', 'Petto', 'Bilanciere'], ['Distensioni inclinate', 'Petto', 'Manubri'], ['Croci ai cavi', 'Petto', 'Cavi'], ['Piegamenti', 'Petto', 'Corpo libero'],
    ['Lat machine', 'Schiena', 'Macchina'], ['Rematore', 'Schiena', 'Manubri'], ['Pulley', 'Schiena', 'Cavi'], ['Trazioni', 'Schiena', 'Corpo libero'],
    ['Squat', 'Gambe', 'Bilanciere'], ['Leg press', 'Gambe', 'Macchina'], ['Affondi', 'Gambe', 'Manubri'], ['Leg curl', 'Gambe', 'Macchina'], ['Leg extension', 'Gambe', 'Macchina'], ['Stacco rumeno', 'Gambe', 'Bilanciere'], ['Calf raise', 'Gambe', 'Macchina'],
    ['Shoulder press', 'Spalle', 'Manubri'], ['Alzate laterali', 'Spalle', 'Manubri'], ['Face pull', 'Spalle', 'Cavi'],
    ['Curl', 'Bicipiti', 'Manubri'], ['Curl al cavo', 'Bicipiti', 'Cavi'], ['Pushdown', 'Tricipiti', 'Cavi'], ['Estensioni sopra la testa', 'Tricipiti', 'Manubri'],
    ['Crunch', 'Core', 'Corpo libero'], ['Plank', 'Core', 'Corpo libero'], ['Camminata', 'Cardio', 'Altro'], ['Cyclette', 'Cardio', 'Macchina']
  ];
  const exercises = rows.map(([name, muscle, equipment], i) => ({ id: `ex-${i}`, name, muscle, equipment, notes: '', custom: false }));
  const prescription = (index, sets = 3, reps = 10) => ({ id: uid(), exerciseId: `ex-${index}`, sets, reps, rest: 90, group: '', drops: 0 });
  return {
    version: 1, exercises,
    plans: [{ id: uid(), name: 'La tua prima full body', notes: 'Scheda di esempio modificabile: scegli esercizi e carichi adatti al tuo percorso.', exercises: [prescription(8), prescription(0), prescription(4), prescription(16), prescription(18, 2), prescription(20, 2)] }],
    history: [], active: null, schedule: [], foods: [], recipes: [], meals: [], habits: [
      { id: uid(), name: 'Muovermi ogni giorno' }, { id: uid(), name: 'Rispettare il mio riposo' }, { id: uid(), name: 'Seguire il mio piano' }
    ], checks: {}, settings: { name: 'Atleta', nutritionGoal: 0 }
  };
}

export function validatePlan(plan, state) {
  text(plan.name, 'Nome scheda');
  if (!Array.isArray(plan.exercises) || !plan.exercises.length || plan.exercises.length > 80) throw new Error('Aggiungi da 1 a 80 esercizi.');
  const groups = {};
  for (const row of plan.exercises) {
    if (!state.exercises.some(e => e.id === row.exerciseId)) throw new Error('Esercizio non trovato.');
    number(row.sets, 1, 20, 'Serie'); number(row.reps, 1, 100, 'Ripetizioni'); number(row.rest, 0, 900, 'Recupero'); number(row.drops, 0, 3, 'Drop set');
    if (![row.sets, row.reps, row.rest, row.drops].every(Number.isInteger)) throw new Error('Usa numeri interi nella scheda.');
    if (row.repsMax != null && (!Number.isInteger(row.repsMax) || row.repsMax < row.reps || row.repsMax > 100)) throw new Error('Il massimo ripetizioni deve essere intero, almeno pari al minimo e non oltre 100.');
    if (row.restPause != null && (!Array.isArray(row.restPause) || row.restPause.length !== row.sets || !row.restPause.every(n => Number.isInteger(n) && n >= 0 && n <= 3))) throw new Error('Indica da 0 a 3 rest-pause per ogni serie principale.');
    if (row.restPause?.some(n => n > 0) && (!Number.isInteger(row.restPauseSeconds) || row.restPauseSeconds < 1 || row.restPauseSeconds > 90)) throw new Error('La pausa breve deve durare da 1 a 90 secondi.');
    if (!['', 'A', 'B', 'C', 'D'].includes(row.group)) throw new Error('Gruppo superset non valido.');
    if (row.group) (groups[row.group] ??= []).push(row);
  }
  for (const rows of Object.values(groups)) {
    if (rows.length < 2) throw new Error('Un superset richiede almeno due esercizi nello stesso gruppo.');
    if (new Set(rows.map(r => r.sets)).size !== 1) throw new Error('Gli esercizi di un superset devono avere lo stesso numero di serie.');
  }
  return plan;
}

export function startWorkout(state, plan, now = Date.now()) {
  if (state.active) throw new Error('Hai un allenamento in corso: riprendilo o annullalo.');
  validatePlan(plan, state);
  const active = { id: uid(), planId: plan.id, name: plan.name, startedAt: now, pausedAt: null, pausedMs: 0, restUntil: null, notes: '', exercises: plan.exercises.map(row => {
    const exercise = state.exercises.find(e => e.id === row.exerciseId);
    const last = [...state.history].reverse().flatMap(h => h.exercises).find(e => e.exerciseId === row.exerciseId);
    return { id: uid(), exerciseId: exercise.id, name: exercise.name, muscle: exercise.muscle, equipment: exercise.equipment, rest: row.rest, group: row.group,
      ...(row.restPause?.some(n => n > 0) ? { restPauseSeconds: row.restPauseSeconds } : {}), ...(row.sameWeight ? { sameWeight: true } : {}),
      sets: Array.from({ length: row.sets }, (_, i) => [{ id: uid(), round: i, kind: 'working', kg: last?.sets.find(s => s.done && s.kind === 'working')?.kg ?? 0, reps: row.repsMax ? null : row.reps, ...(row.repsMax ? { target: `${row.reps}–${row.repsMax}` } : {}), done: false },
        ...Array.from({ length: row.drops }, () => ({ id: uid(), round: i, kind: 'drop', kg: 0, reps: row.reps, done: false })),
        ...Array.from({ length: row.restPause?.[i] ?? 0 }, () => ({ id: uid(), round: i, kind: 'restpause', kg: 0, reps: null, done: false }))]).flat() };
  }) };
  return { ...state, active };
}

export function elapsed(session, now = Date.now()) {
  return Math.max(0, Math.floor(((session.pausedAt ?? now) - session.startedAt - session.pausedMs) / 1000));
}

export function togglePause(state, now = Date.now()) {
  const next = clone(state);
  if (!next.active) throw new Error('Nessun allenamento in corso.');
  if (next.active.pausedAt) { next.active.pausedMs += now - next.active.pausedAt; next.active.pausedAt = null; }
  else { next.active.pausedAt = now; next.active.restUntil = null; }
  return next;
}

export function completeSet(state, exerciseId, setId, now = Date.now()) {
  const next = clone(state), session = next.active;
  if (!session || session.pausedAt) throw new Error('Riprendi l’allenamento prima di registrare una serie.');
  const exercise = session.exercises.find(e => e.id === exerciseId), set = exercise?.sets.find(s => s.id === setId);
  if (!set) throw new Error('Serie non trovata.');
  const roundSets = exercise.sets.filter(s => s.round === set.round);
  if (!set.done && set.kind === 'restpause' && roundSets.slice(0, roundSets.findIndex(s => s.id === set.id)).some(s => !s.done)) throw new Error('Completa prima la serie precedente dello stesso rest-pause.');
  number(set.kg, 0, 1500, 'Carico'); number(set.reps, 1, 1000, 'Ripetizioni');
  if (!Number.isInteger(set.reps)) throw new Error('Le ripetizioni devono essere intere.');
  set.done = !set.done;
  session.restUntil = null;
  session.restKind = null;
  if (!set.done) return next;
  // Drops are immediate; a rest-pause has its own short timer, never a drop label.
  if (!roundSets.every(s => s.done)) {
    const pending = roundSets.find(s => !s.done);
    if (pending.kind === 'restpause') {
      session.restUntil = now + exercise.restPauseSeconds * 1000;
      session.restKind = 'restpause';
      if (pending.kg === 0) pending.kg = set.kg;
    }
    return next;
  }
  const group = exercise.group ? session.exercises.filter(e => e.group === exercise.group) : [exercise];
  const roundComplete = group.every(e => e.sets.filter(s => s.round === set.round).every(s => s.done));
  if (roundComplete && exercise.rest > 0) { session.restUntil = now + exercise.rest * 1000; session.restKind = 'recovery'; }
  return next;
}

export function swapExercise(state, sessionRowId, replacementId) {
  const next = clone(state), row = next.active?.exercises.find(e => e.id === sessionRowId), replacement = next.exercises.find(e => e.id === replacementId);
  if (!row || !replacement) throw new Error('Esercizio non trovato.');
  if (row.sets.some(s => s.done)) throw new Error('Sostituisci l’esercizio prima di registrarne le serie, per conservare lo storico corretto.');
  Object.assign(row, { exerciseId: replacement.id, name: replacement.name, muscle: replacement.muscle, equipment: replacement.equipment });
  row.sets.forEach(s => { s.kg = 0; });
  return next;
}

export function sessionStats(session) {
  const sets = session.exercises.flatMap(e => e.sets).filter(s => s.done);
  return { sets: sets.length, reps: sets.reduce((s, x) => s + x.reps, 0), volume: sets.reduce((s, x) => s + x.kg * x.reps, 0) };
}

export function finishWorkout(state, now = Date.now()) {
  const next = clone(state);
  if (!next.active || !sessionStats(next.active).sets) throw new Error('Registra almeno una serie prima di concludere.');
  const saved = { ...next.active, finishedAt: now, duration: elapsed(next.active, now), restUntil: null, stats: sessionStats(next.active) };
  next.history.push(saved); next.active = null;
  return next;
}

export function foodTotals(food, grams) {
  number(grams, 1, 10000, 'Quantità');
  return Object.fromEntries(['kcal', 'protein', 'carbs', 'fat'].map(k => [k, Math.round(Number(food[k]) * grams / 100 * 10) / 10]));
}

export function recipeTotals(items, foods) {
  const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  if (!items.length) throw new Error('Aggiungi almeno un ingrediente.');
  for (const item of items) {
    const food = foods.find(f => f.id === item.foodId);
    if (!food) throw new Error('Ingrediente non trovato.');
    const row = foodTotals(food, item.grams);
    for (const key of Object.keys(totals)) totals[key] += row[key];
  }
  return totals;
}

export function streak(state, habitId, today = dayKey()) {
  const cursor = new Date(`${today}T12:00:00`); let count = 0;
  if (!state.checks[dayKey(cursor)]?.includes(habitId)) cursor.setDate(cursor.getDate() - 1);
  while (state.checks[dayKey(cursor)]?.includes(habitId)) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
}

// Only restore a bounded, fully validated state; never overwrite working data on a parse error.
export function validateBackup(input) {
  const s = typeof input === 'string' ? JSON.parse(input) : clone(input);
  if (!s || s.version !== 1) throw new Error('Formato backup non supportato.');
  for (const key of ['exercises', 'plans', 'history', 'schedule', 'foods', 'recipes', 'meals', 'habits']) {
    if (!Array.isArray(s[key]) || s[key].length > 100000) throw new Error(`Backup non valido: ${key}.`);
  }
  if (!s.settings || !s.checks || typeof s.checks !== 'object' || Array.isArray(s.checks)) throw new Error('Impostazioni backup non valide.');
  const id = value => { if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(value)) throw new Error('Identificatore backup non valido.'); };
  const storedNumber = (value, min, max, label) => { if (typeof value !== 'number') throw new Error(`${label}: numero non valido nel backup.`); return number(value, min, max, label); };
  for (const key of ['exercises', 'plans', 'history', 'foods', 'recipes', 'meals', 'habits']) {
    const ids = new Set();
    for (const row of s[key]) { id(row.id); if (ids.has(row.id)) throw new Error('Identificatori duplicati nel backup.'); ids.add(row.id); }
  }
  for (const e of s.exercises) { text(e.name, 'Nome esercizio'); text(e.muscle, 'Gruppo muscolare'); text(e.equipment, 'Attrezzo'); if (typeof e.notes !== 'string' || e.notes.length > 4000) throw new Error('Note esercizio non valide.'); }
  for (const plan of s.plans) { validatePlan(plan, s); plan.exercises.forEach(row => id(row.id)); }
  const checkSession = session => {
    id(session.id); text(session.name, 'Nome allenamento'); number(session.startedAt, 1, 9e15, 'Inizio'); number(session.pausedMs, 0, 9e15, 'Pausa');
    if (session.pausedAt !== null) number(session.pausedAt, 1, 9e15, 'Pausa');
    if (session.restUntil !== null) number(session.restUntil, 1, 9e15, 'Timer');
    if (!Array.isArray(session.exercises) || session.exercises.length > 80) throw new Error('Sessione non valida.');
    for (const e of session.exercises) {
      id(e.id); id(e.exerciseId); text(e.name, 'Nome esercizio'); number(e.rest, 0, 900, 'Recupero');
      if (!['', 'A', 'B', 'C', 'D'].includes(e.group) || !Array.isArray(e.sets) || e.sets.length > 160) throw new Error('Serie non valide.');
      if (e.sets.some(set => set.kind === 'restpause')) storedNumber(e.restPauseSeconds, 1, 90, 'Rest-pause');
      for (const set of e.sets) {
        id(set.id); storedNumber(set.kg, 0, 1500, 'Carico'); storedNumber(set.round, 0, 19, 'Giro');
        if (set.reps === null && !set.done) { if (set.kind !== 'restpause' && !/^\d{1,3}–\d{1,3}$/.test(set.target ?? '')) throw new Error('Obiettivo ripetizioni non valido.'); }
        else { storedNumber(set.reps, 1, 1000, 'Ripetizioni'); if (!Number.isInteger(set.reps)) throw new Error('Serie non valida.'); }
        if (!Number.isInteger(set.round) || typeof set.done !== 'boolean' || !['working', 'drop', 'warmup', 'restpause'].includes(set.kind)) throw new Error('Serie non valida.');
        if (set.target !== undefined && (typeof set.target !== 'string' || !/^\d{1,3}–\d{1,3}$/.test(set.target))) throw new Error('Intervallo ripetizioni non valido.');
      }
    }
  };
  if (s.active !== null) checkSession(s.active);
  s.history.forEach(h => { checkSession(h); number(h.finishedAt, 1, 9e15, 'Fine'); number(h.duration, 0, 9e15, 'Durata'); h.stats = sessionStats(h); });
  for (const food of s.foods) { text(food.name, 'Nome alimento'); for (const k of ['kcal', 'protein', 'carbs', 'fat']) storedNumber(food[k], 0, k === 'kcal' ? 1000 : 100, 'Nutrienti'); }
  for (const r of s.recipes) { text(r.name, 'Nome ricetta'); number(r.portions, 1, 100, 'Porzioni'); if (!Array.isArray(r.items) || r.items.length > 100) throw new Error('Ricetta non valida.'); recipeTotals(r.items, s.foods); }
  for (const m of s.meals) { text(m.name, 'Pasto'); if (!/^\d{4}-\d{2}-\d{2}$/.test(m.date)) throw new Error('Data pasto non valida.'); for (const k of ['kcal', 'protein', 'carbs', 'fat']) storedNumber(m[k], 0, 1e7, 'Nutrienti pasto'); }
  s.habits.forEach(h => text(h.name, 'Abitudine'));
  for (const [date, ids] of Object.entries(s.checks)) { if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(ids) || ids.length > 1000) throw new Error('Registro abitudini non valido.'); ids.forEach(id); }
  for (const row of s.schedule) { if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !s.plans.some(p => p.id === row.planId)) throw new Error('Calendario non valido.'); }
  text(s.settings.name, 'Nome'); number(s.settings.nutritionGoal, 0, 20000, 'Obiettivo calorie');
  return s;
}

import './style.css';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { uid, dayKey, clone, number, text, MUSCLES, EQUIPMENT, validatePlan, startWorkout, completeSet, swapExercise, finishWorkout, togglePause, elapsed, sessionStats, foodTotals, recipeTotals, streak, validateBackup } from './domain.js';
import { load, save, exportData, scheduleRest } from './storage.js';
import { icon } from './icons.js';

const root = document.querySelector('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = value => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format(value);
const time = secs => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;
const dateFmt = value => new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
const dateTitle = () => new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
let state, view = 'home', libraryQuery = '', muscle = '', nutritionDate = dayKey(), historyExercise = '', toastTimeout, storageError = false, restNotified = null;
let editingPlan = null;
const viewStack = ['home'];

function toast(message, error = false) {
  const node = document.querySelector('#toast'); node.textContent = message; node.className = error ? 'visible error' : 'visible';
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => node.className = '', 4500);
}
async function commit(next, rerender = true) {
  state = next;
  try { await save(state); storageError = false; }
  catch { storageError = true; toast('Salvataggio non riuscito. Esporta subito un backup per conservare i dati.', true); }
  if (rerender) render();
}
function update(fn, rerender = true) { const next = clone(state); fn(next); return commit(next, rerender); }
function go(next) { if (next !== view) viewStack.push(next); view = next; render(); window.scrollTo({ top: 0, behavior: 'instant' }); }
const button = (action, label, symbol = '', cls = '', attrs = '') => `<button class="${cls}" data-action="${action}" ${attrs}>${symbol ? icon(symbol) : ''}${label}</button>`;
const badge = (label, cls = '') => `<span class="tag ${cls}">${esc(label)}</span>`;
const empty = (symbol, title, detail, action = '') => `<div class="empty">${icon(symbol)}<h3>${title}</h3><p>${detail}</p>${action}</div>`;
const field = (label, html, cls = '') => `<label class="field ${cls}"><span>${label}</span>${html}</label>`;
const input = (name, value = '', attrs = '') => `<input name="${name}" value="${esc(value)}" ${attrs}>`;
const options = (values, selected) => values.map(v => `<option value="${esc(v)}" ${v === selected ? 'selected' : ''}>${esc(v)}</option>`).join('');
const exerciseOptions = selected => state.exercises.map(e => `<option value="${e.id}" ${selected === e.id ? 'selected' : ''}>${esc(e.name)} · ${esc(e.equipment)}</option>`).join('');
const head = (eyebrow, title, subtitle = '', actions = '') => `<header class="page-head"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${subtitle ? `<p class="sub">${subtitle}</p>` : ''}</div><div class="head-actions">${actions}</div></header>`;

function shell(content) {
  const nav = [['home', 'Oggi', 'home'], ['plans', 'Schede', 'dumbbell'], ['library', 'Esercizi', 'book'], ['progress', 'Progressi', 'chart'], ['more', 'Altro', 'more']];
  const active = ['nutrition', 'habits', 'settings', 'recipes'].includes(view) ? 'more' : view === 'runner' ? 'plans' : view;
  return `<aside class="sidebar"><a href="#home" class="brand" data-action="nav" data-view="home">${icon('dumbbell')}<span>GYM<span class="gold">HUB</span><small>IL TUO RITMO.</small></span></a><nav aria-label="Navigazione principale">${nav.map(([key, label, symbol]) => button('nav', label, symbol, active === key ? 'nav-item selected' : 'nav-item', `data-view="${key}" ${active === key ? 'aria-current="page"' : ''}`)).join('')}</nav><div class="sidebar-bottom">${icon('shield')}<strong>Il tuo spazio. I tuoi dati.</strong><span>Open source · Nessun abbonamento</span></div></aside><div class="app-body"><div class="topbar"><span class="mobile-brand">GYM<span>HUB</span></span><span class="today">${dateTitle()}</span><span class="local-status"><i></i> Sul dispositivo</span></div>${storageError ? '<div class="save-error" role="alert">Dati non salvati. Libera spazio ed esporta un backup dalle impostazioni.</div>' : ''}<main id="main">${content}</main></div><nav class="mobile-nav" aria-label="Navigazione mobile">${nav.map(([key, label, symbol]) => button('nav', `<span>${label}</span>`, symbol, active === key ? 'selected' : '', `data-view="${key}" ${active === key ? 'aria-current="page"' : ''}`)).join('')}</nav>`;
}

function weekDays() {
  const now = new Date(), monday = new Date(now); monday.setDate(now.getDate() - (now.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, i) => { const date = new Date(monday); date.setDate(monday.getDate() + i); return date; });
}
function homePage() {
  const week = weekDays(), start = dayKey(week[0]), weekHistory = state.history.filter(h => dayKey(new Date(h.finishedAt)) >= start);
  const volume = weekHistory.reduce((s, h) => s + sessionStats(h).volume, 0);
  const todayPlan = state.plans.find(p => p.id === state.schedule.find(s => s.date === dayKey())?.planId) ?? state.plans[0];
  const next = state.active;
  return head('IL TUO SPAZIO, OGNI GIORNO', `CIAO, ${esc(state.settings.name)}<span class="gold">.</span>`, 'Un passo alla volta. Ogni allenamento conta.') +
    `<section class="hero"><div class="hero-copy">${badge(next ? 'ALLENAMENTO IN CORSO' : 'PRONTO QUANDO LO SEI TU', 'gold-tag')}<h2>${next ? 'RIPARTI<br>DA QUI.' : 'IL PROSSIMO<br>PASSO È TUO.'}</h2><p>${next ? esc(next.name) + ' · I tuoi progressi sono salvati.' : 'Concentrati sull’allenamento.<br>Al resto pensiamo noi.'}</p>${button(next ? 'resume' : todayPlan ? 'start' : 'new-plan', next ? 'Riprendi allenamento' : todayPlan ? 'Inizia ad allenarti' : 'Crea la tua scheda', 'play', 'primary', todayPlan ? `data-id="${todayPlan.id}"` : '')}</div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div>${icon('dumbbell')}<span>FATTO A MODO TUO.</span></div></section>` +
    `<div class="stats-grid"><article class="stat-card">${icon('dumbbell')}<span>Questa settimana</span><strong>${weekHistory.length}<small> allenamenti</small></strong></article><article class="stat-card">${icon('chart')}<span>Volume settimanale</span><strong>${fmt(volume)}<small> kg</small></strong></article><article class="stat-card">${icon('clock')}<span>Tempo per te</span><strong>${Math.round(weekHistory.reduce((s, h) => s + h.duration, 0) / 60)}<small> minuti</small></strong></article></div>` +
    `<div class="home-columns"><section class="panel"><div class="section-head"><h2>IL TUO RITMO</h2>${button('schedule', 'Pianifica', 'plus', 'text-button')}</div><div class="week-strip">${week.map(d => { const k = dayKey(d), done = state.history.some(h => dayKey(new Date(h.finishedAt)) === k), planned = state.schedule.some(s => s.date === k); return `<div class="day ${k === dayKey() ? 'is-today' : ''}"><span>${new Intl.DateTimeFormat('it-IT', { weekday: 'short' }).format(d)}</span><strong>${d.getDate()}</strong><i class="${done ? 'done-dot' : planned ? 'plan-dot' : ''}"></i></div>`; }).join('')}</div><div class="week-caption"><span><i class="done-dot"></i> Completato</span><span><i class="plan-dot"></i> Pianificato</span></div>${state.schedule.filter(s => s.date >= dayKey()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(s => `<div class="schedule-row"><span>${dateFmt(s.date + 'T12:00:00')}</span><strong>${esc(state.plans.find(p => p.id === s.planId)?.name)}</strong>${button('unschedule', icon('close'), '', 'icon-button', `data-id="${s.id}" aria-label="Rimuovi dal calendario"`)}</div>`).join('')}</section><section class="panel"><div class="section-head"><h2>LA TUA SCHEDA</h2>${button('nav', 'Tutte', 'arrow', 'text-button', 'data-view="plans"')}</div>${todayPlan ? `<div class="featured-plan"><div class="tile-icon">${icon('dumbbell')}</div><h3>${esc(todayPlan.name)}</h3><p>${todayPlan.exercises.length} esercizi · ${todayPlan.exercises.reduce((s, e) => s + e.sets, 0)} serie principali</p>${button('edit-plan', 'Personalizza', 'edit', 'secondary', `data-id="${todayPlan.id}"`)}</div>` : empty('book', 'Il tuo percorso inizia qui', 'Crea una scheda con i tuoi esercizi.')}</section></div>` +
    `<div class="section-head spaced"><h2>OLTRE L’ALLENAMENTO</h2></div><div class="quick-grid">${[['nutrition', 'Nutrizione', 'Pasti, calorie e ricette', 'leaf'], ['habits', 'Le tue abitudini', 'Piccoli gesti, costanza vera', 'target']].map(([v, title, sub, symbol]) => `<button class="quick-card" data-action="nav" data-view="${v}"><div class="tile-icon">${icon(symbol)}</div><div><h3>${title}</h3><p>${sub}</p></div>${icon('chevron')}</button>`).join('')}</div>`;
}

function plansPage() {
  return head('ALLENATI A MODO TUO', 'LE TUE SCHEDE', 'Struttura, personalizza, ripeti.', button('new-plan', 'Nuova scheda', 'plus', 'primary')) +
    (state.active ? `<div class="resume-banner">${icon('clock')}<div><strong>Hai un allenamento in corso</strong><span>${esc(state.active.name)}</span></div>${button('resume', 'Riprendi', 'arrow', 'secondary')}</div>` : '') +
    `<div class="plan-grid">${state.plans.map(plan => `<article class="panel plan-card"><div class="section-head"><div class="tile-icon">${icon('dumbbell')}</div>${button('edit-plan', icon('edit'), '', 'icon-button', `data-id="${plan.id}" aria-label="Modifica ${esc(plan.name)}"`)}</div><h2>${esc(plan.name)}</h2><p>${plan.exercises.length} esercizi · ${plan.exercises.reduce((s, e) => s + e.sets, 0)} serie</p><div class="muscle-tags">${[...new Set(plan.exercises.map(r => state.exercises.find(e => e.id === r.exerciseId)?.muscle))].map(m => badge(m)).join('')}</div><ul class="plan-preview">${plan.exercises.slice(0, 4).map(row => `<li><span>${esc(state.exercises.find(e => e.id === row.exerciseId)?.name)}</span><strong>${row.sets} × ${row.reps}</strong></li>`).join('')}</ul>${plan.notes ? `<p class="plan-note">${esc(plan.notes)}</p>` : ''}<div class="card-actions">${button('start', 'Inizia', 'play', 'primary', `data-id="${plan.id}"`)}${button('duplicate-plan', icon('plus'), '', 'icon-button', `data-id="${plan.id}" aria-label="Duplica scheda"`)}${button('delete-plan', icon('trash'), '', 'icon-button danger-text', `data-id="${plan.id}" aria-label="Elimina scheda"`)}</div></article>`).join('')}</div>${!state.plans.length ? empty('dumbbell', 'Spazio al tuo prossimo obiettivo', 'Aggiungi la prima scheda per iniziare.', button('new-plan', 'Crea scheda', 'plus', 'primary')) : ''}`;
}

function libraryPage() {
  const filtered = state.exercises.filter(e => (!muscle || e.muscle === muscle) && `${e.name} ${e.equipment}`.toLowerCase().includes(libraryQuery.toLowerCase()));
  return head('COSTRUISCI IL TUO PERCORSO', 'LIBRERIA ESERCIZI', `${state.exercises.length} esercizi, tutto lo spazio per i tuoi.`, button('new-exercise', 'Nuovo esercizio', 'plus', 'primary')) +
    `<div class="library-filters"><div class="search-field">${icon('search')}<input id="exercise-search" type="search" placeholder="Cerca esercizio o attrezzo…" aria-label="Cerca esercizio" value="${esc(libraryQuery)}"></div><div class="filter-chips">${['', ...MUSCLES].map(m => button('filter-muscle', m || 'Tutti', '', muscle === m ? 'chip active' : 'chip', `data-muscle="${m}"`)).join('')}</div></div><p class="results-count">${filtered.length} esercizi</p><div class="exercise-list">${filtered.map(e => `<button class="exercise-card" data-action="exercise-detail" data-id="${e.id}"><div class="exercise-monogram">${esc(e.muscle.slice(0, 2).toUpperCase())}</div><div class="exercise-copy"><h3>${esc(e.name)}</h3><p>${esc(e.muscle)} <span>·</span> ${esc(e.equipment)}</p></div>${e.custom ? badge('TUO') : ''}${icon('chevron')}</button>`).join('')}</div>${!filtered.length ? empty('search', 'Nessun esercizio trovato', 'Prova un’altra ricerca oppure aggiungi il tuo esercizio.') : ''}`;
}

function runnerPage() {
  const s = state.active;
  if (!s) { view = 'plans'; return plansPage(); }
  const stats = sessionStats(s), total = s.exercises.reduce((n, e) => n + e.sets.length, 0);
  return head('IL TUO MOMENTO', esc(s.name), 'Ogni modifica viene salvata sul dispositivo.', button('toggle-pause', s.pausedAt ? 'Riprendi' : 'Pausa', s.pausedAt ? 'play' : 'pause', 'secondary')) +
    `<div class="session-dashboard"><div><span>TEMPO ATTIVO</span><strong id="session-time">${time(elapsed(s))}</strong></div><div><span>SERIE</span><strong>${stats.sets}<small> / ${total}</small></strong></div><div><span>VOLUME</span><strong>${fmt(stats.volume)}<small> kg</small></strong></div></div><div class="session-progress"><div style="width:${total ? stats.sets / total * 100 : 0}%"></div></div>` +
    (s.pausedAt ? `<div class="resume-banner"><strong>Allenamento in pausa</strong><span>Il tempo attivo è fermo.</span></div>` : '') +
    `<div id="rest-panel" class="rest-panel" ${!s.restUntil ? 'hidden' : ''}><div>${icon('clock')}<span>RECUPERO</span><strong id="rest-time">00:00</strong></div><div>${button('rest-add', '+30 s', '', 'small-button')}${button('rest-skip', 'Salta', '', 'small-button')}</div></div>` +
    `<div class="runner-list">${s.exercises.map((e, i) => `<section class="panel runner-card" id="row-${e.id}"><div class="section-head"><div class="runner-title"><span class="exercise-number">${String(i + 1).padStart(2, '0')}</span><div><h2>${esc(e.name)}</h2><p>${esc(e.equipment)} · ${e.rest}s recupero ${e.group ? `· Superset ${e.group}` : ''}</p></div></div>${button('swap', icon('swap'), '', 'icon-button', `data-id="${e.id}" aria-label="Sostituisci ${esc(e.name)}" ${e.sets.some(x => x.done) ? 'disabled' : ''}`)}</div>${e.group ? `<p class="superset-info">${badge('SUPERSET ' + e.group)} ${s.exercises.filter(r => r.group === e.group).map(r => esc(r.name)).join(' + ')}. Recupero dopo il giro completo.</p>` : ''}<div class="set-table"><div class="set-header"><span>SERIE</span><span>KG</span><span>RIP.</span><span>FATTO</span></div>${e.sets.map(set => `<div class="set-row ${set.done ? 'completed' : ''} ${set.kind === 'drop' ? 'drop-row' : ''}"><span class="set-number">${set.kind === 'drop' ? '<small>DROP</small>' : set.round + 1}</span><input aria-label="Carico ${esc(e.name)} serie ${set.round + 1}${set.kind === 'drop' ? ' drop' : ''}" type="number" min="0" max="1500" step="0.5" inputmode="decimal" value="${set.kg}" data-set="${set.id}" data-row="${e.id}" data-property="kg" ${s.pausedAt || set.done ? 'disabled' : ''}><input aria-label="Ripetizioni ${esc(e.name)} serie ${set.round + 1}${set.kind === 'drop' ? ' drop' : ''}" type="number" min="1" max="1000" step="1" inputmode="numeric" value="${set.reps}" data-set="${set.id}" data-row="${e.id}" data-property="reps" ${s.pausedAt || set.done ? 'disabled' : ''}><button class="set-check ${set.done ? 'is-done' : ''}" data-action="complete-set" data-row="${e.id}" data-id="${set.id}" aria-label="${set.done ? 'Annulla' : 'Completa'} serie ${set.round + 1} ${esc(e.name)}${set.kind === 'drop' ? ' drop' : ''}" aria-pressed="${set.done}" ${s.pausedAt ? 'disabled' : ''}>${icon('check')}</button></div>`).join('')}</div></section>`).join('')}</div><div class="session-footer">${button('finish', 'Concludi allenamento', 'check', 'primary')}${button('discard', 'Annulla allenamento', '', 'text-button danger-text')}</div>`;
}

function progressPage() {
  const history = [...state.history].sort((a, b) => b.finishedAt - a.finishedAt);
  const recent = history.slice(0, 8).reverse(), max = Math.max(1, ...recent.map(h => sessionStats(h).volume));
  const filtered = historyExercise ? history.filter(h => h.exercises.some(e => e.exerciseId === historyExercise && e.sets.some(s => s.done))) : history;
  return head('VEDI QUANTA STRADA HAI FATTO', 'I TUOI PROGRESSI', 'Lo storico è tuo, serie dopo serie.') +
    `<div class="stats-grid"><article class="stat-card"><span>Allenamenti totali</span><strong>${history.length}</strong></article><article class="stat-card"><span>Serie registrate</span><strong>${history.reduce((sum, h) => sum + sessionStats(h).sets, 0)}</strong></article><article class="stat-card"><span>Volume totale</span><strong>${fmt(history.reduce((sum, h) => sum + sessionStats(h).volume, 0))}<small> kg</small></strong></article></div>` +
    `<section class="panel"><div class="section-head"><h2>VOLUME NEL TEMPO</h2><span class="muted">Ultimi 8 allenamenti</span></div>${recent.length ? `<div class="bar-chart" role="img" aria-label="Volume degli ultimi allenamenti in chilogrammi">${recent.map(h => `<div class="bar-column"><span>${fmt(sessionStats(h).volume)}</span><div class="bar-track"><div style="height:${Math.max(3, sessionStats(h).volume / max * 100)}%"></div></div><small>${new Date(h.finishedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'numeric' })}</small></div>`).join('')}</div>` : empty('chart', 'Il primo punto sei tu', 'Completa un allenamento per vedere i progressi.')}</section>` +
    `<div class="section-head spaced"><h2>DIARIO ALLENAMENTI</h2><select id="history-filter" aria-label="Filtra storico per esercizio"><option value="">Tutti gli esercizi</option>${exerciseOptions(historyExercise)}</select></div><div class="history-list">${filtered.map(h => { const stats = sessionStats(h); return `<button class="history-card" data-action="history-detail" data-id="${h.id}"><div class="tile-icon">${icon('check')}</div><div><h3>${esc(h.name)}</h3><p>${dateFmt(h.finishedAt)} · ${Math.round(h.duration / 60)} min · ${stats.sets} serie</p>${historyExercise ? `<p class="gold">${h.exercises.filter(e => e.exerciseId === historyExercise).flatMap(e => e.sets).filter(s => s.done).map(s => `${s.kg} kg × ${s.reps}${s.kind === 'drop' ? ' (drop)' : ''}`).join(' · ')}</p>` : ''}</div><strong>${fmt(stats.volume)}<small> kg</small></strong>${icon('chevron')}</button>`; }).join('')}</div>${history.length && !filtered.length ? empty('search', 'Nessuna serie registrata', 'Questo esercizio non ha ancora uno storico.') : ''}`;
}

function nutritionPage() {
  const meals = state.meals.filter(m => m.date === nutritionDate), totals = meals.reduce((s, m) => { for (const k of Object.keys(s)) s[k] += m[k]; return s; }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
  const goal = state.settings.nutritionGoal;
  return head('PRENDITI CURA DEL TUO PERCORSO', 'NUTRIZIONE', 'Il tuo diario alimentare, senza vincoli.', button('add-meal', 'Registra pasto', 'plus', 'primary')) +
    `<div class="nutrition-date"><label>Giorno <input type="date" id="nutrition-date" value="${nutritionDate}"></label>${button('nutrition-goal', 'Obiettivo personale', 'target', 'text-button')}</div><section class="panel nutrition-summary"><div class="calorie-display"><span>ENERGIA REGISTRATA</span><strong>${fmt(totals.kcal)}<small> kcal</small></strong><p>${goal ? `Obiettivo impostato da te: ${fmt(goal)} kcal` : 'Nessun obiettivo calorico impostato'}</p>${goal ? `<div class="session-progress"><div style="width:${Math.min(100, totals.kcal / goal * 100)}%"></div></div>` : ''}</div><div class="macro-grid">${[['protein', 'Proteine', 'protein'], ['carbs', 'Carboidrati', 'carbs'], ['fat', 'Grassi', 'fat']].map(([k, title, cls]) => `<div><i class="${cls}"></i><span>${title}</span><strong>${fmt(totals[k])}<small> g</small></strong></div>`).join('')}</div></section><div class="quick-grid spaced"><button class="quick-card" data-action="food-library">${icon('book')}<div><h3>I tuoi alimenti</h3><p>${state.foods.length} alimenti · Valori per 100 g</p></div>${icon('chevron')}</button><button class="quick-card" data-action="nav" data-view="recipes">${icon('leaf')}<div><h3>Le tue ricette</h3><p>Ingredienti, porzioni e macro</p></div>${icon('chevron')}</button></div><div class="section-head spaced"><h2>IL DIARIO DI OGGI</h2></div>${meals.length ? meals.map(m => `<article class="meal-row panel"><div><span class="eyebrow">${esc(m.slot)}</span><h3>${esc(m.name)}</h3><p>${fmt(m.protein)} P · ${fmt(m.carbs)} C · ${fmt(m.fat)} G</p></div><strong>${fmt(m.kcal)}<small> kcal</small></strong>${button('delete-meal', icon('trash'), '', 'icon-button', `data-id="${m.id}" aria-label="Elimina pasto"`)}</article>`).join('') : empty('leaf', 'Una pagina tutta da riempire', 'Aggiungi un alimento, una ricetta o un pasto con i valori della tua etichetta.')}`;
}

function recipesPage() {
  return head('INGREDIENTI SEMPLICI, SPAZIO ALLE IDEE', 'LE TUE RICETTE', 'Calorie e macronutrienti calcolati dagli ingredienti.', button('new-recipe', 'Nuova ricetta', 'plus', 'primary')) +
    `<div class="plan-grid">${state.recipes.map(r => { const t = recipeTotals(r.items, state.foods); return `<article class="panel recipe-card"><div class="tile-icon">${icon('leaf')}</div><h2>${esc(r.name)}</h2><p>${r.items.length} ingredienti · ${r.portions} porzioni</p><strong class="recipe-calories">${fmt(t.kcal / r.portions)}<small> kcal / porzione</small></strong><p>P ${fmt(t.protein / r.portions)} g · C ${fmt(t.carbs / r.portions)} g · G ${fmt(t.fat / r.portions)} g</p><div class="card-actions">${button('log-recipe', 'Registra porzione', 'plus', 'primary', `data-id="${r.id}"`)}${button('delete-recipe', icon('trash'), '', 'icon-button', `data-id="${r.id}" aria-label="Elimina ricetta"`)}</div></article>`; }).join('')}</div>${!state.recipes.length ? empty('leaf', 'La tua cucina, il tuo archivio', 'Prima salva gli alimenti con i loro valori, poi combinali in ricette.') : ''}`;
}

function habitsPage() {
  const checks = state.checks[dayKey()] ?? [];
  return head('LA COSTANZA SI COSTRUISCE', 'PICCOLI PASSI.', 'Scegli i gesti che contano per te.', button('new-habit', 'Nuova abitudine', 'plus', 'primary')) +
    `<div class="habit-summary panel"><div><span class="eyebrow">OGGI</span><h2>${checks.filter(id => state.habits.some(h => h.id === id)).length} <span class="muted">/ ${state.habits.length}</span></h2><p>abitudini completate</p></div>${icon('target')}</div><div class="habit-list">${state.habits.map(h => `<article class="habit-card panel"><button class="habit-toggle ${checks.includes(h.id) ? 'checked' : ''}" data-action="toggle-habit" data-id="${h.id}" aria-pressed="${checks.includes(h.id)}">${icon('check')}<div><h3>${esc(h.name)}</h3><p>${streak(state, h.id)} giorni di costanza</p></div></button>${button('delete-habit', icon('trash'), '', 'icon-button', `data-id="${h.id}" aria-label="Elimina abitudine"`)}</article>`).join('')}</div><div class="section-head spaced"><h2>I TUOI TRAGUARDI</h2></div><div class="achievement-grid">${[[1, 'Il primo passo'], [5, 'Hai trovato il ritmo'], [20, 'La forza della costanza']].map(([n, label]) => `<article class="panel achievement ${state.history.length >= n ? 'unlocked' : ''}">${icon('trophy')}<h3>${label}</h3><p>${Math.min(n, state.history.length)} / ${n} allenamenti</p></article>`).join('')}</div>`;
}

function morePage() {
  return head('TUTTO IL TUO MONDO', 'A MODO TUO.', 'Scegli dove andare.') + `<div class="more-list">${[['nutrition', 'Nutrizione', 'Diario, alimenti e macronutrienti', 'leaf'], ['recipes', 'Ricette', 'Le tue combinazioni preferite', 'book'], ['habits', 'Abitudini e traguardi', 'La tua costanza prende forma', 'target'], ['settings', 'Impostazioni e backup', 'Profilo, dati e informazioni', 'shield']].map(([v, title, desc, sym]) => `<button class="quick-card" data-action="nav" data-view="${v}"><div class="tile-icon">${icon(sym)}</div><div><h3>${title}</h3><p>${desc}</p></div>${icon('chevron')}</button>`).join('')}</div><section class="panel manifesto"><span class="eyebrow">IL TUO SPAZIO. DAVVERO.</span><h2>NESSUN ABBONAMENTO.<br>NESSUNA PORTA CHIUSA.</h2><p>GymHub è open source. Le funzioni disponibili funzionano sul tuo dispositivo, anche senza connessione.</p></section>`;
}

function settingsPage() {
  return head('IL CONTROLLO RESTA A TE', 'IMPOSTAZIONI', 'GymHub 0.1 · Prima versione') +
    `<section class="panel settings-panel"><h2>IL TUO PROFILO</h2><form id="profile-form">${field('Come ti chiami?', input('name', state.settings.name, 'required maxlength="100" autocomplete="given-name"'))}<button class="primary" type="submit">Salva nome</button></form></section><section class="panel settings-panel"><h2>I TUOI DATI</h2><p>Salvati solo qui. Android e browser hanno archivi separati: usa il backup per trasferirli. La disinstallazione dell’app o la cancellazione dei dati del browser elimina l’archivio locale.</p><div class="wrap-actions">${button('export', 'Esporta backup', 'download', 'primary')}${button('import', 'Importa backup', 'plus', 'secondary')}</div><input id="import-file" type="file" accept=".json,application/json" hidden></section><section class="panel settings-panel"><h2>FUNZIONI ONLINE</h2><p>Questa versione include allenamento, diario alimentare manuale, ricette, abitudini e progressi. Sincronizzazione tra dispositivi, community, catalogo video e riconoscimento fotografico con AI richiedono servizi aggiuntivi e non sono ancora disponibili.</p><p>Il timer usa l’orologio del dispositivo. Su Android, concedendo le notifiche, può avvisarti a schermo spento; il sistema può ritardare l’avviso. Nel browser l’avviso sonoro funziona mentre la pagina è attiva.</p></section><section class="panel settings-panel"><h2>OPEN SOURCE</h2><p>Codice originale, licenza MIT. Font Manrope e Barlow Condensed con licenza SIL OFL. Nessun codice, video o immagine di STNDRD incluso.</p><p>Nessun account, nessuna pubblicità, nessun pagamento.</p></section>`;
}

function render() {
  const pages = { home: homePage, plans: plansPage, library: libraryPage, runner: runnerPage, progress: progressPage, nutrition: nutritionPage, recipes: recipesPage, habits: habitsPage, more: morePage, settings: settingsPage };
  root.innerHTML = shell((pages[view] ?? homePage)()); tick();
}

function modal(title, body, onSubmit, submitLabel = 'Salva') {
  document.querySelector('dialog')?.remove();
  const dialog = document.createElement('dialog');
  dialog.className = 'modal'; dialog.setAttribute('aria-labelledby', 'dialog-title');
  dialog.innerHTML = `<form method="dialog" class="modal-form"><div class="section-head"><h2 id="dialog-title">${title}</h2><button type="button" class="icon-button" data-close aria-label="Chiudi">${icon('close')}</button></div><div class="modal-body">${body}</div><p class="form-error" role="alert"></p>${onSubmit ? `<div class="modal-footer"><button type="button" class="secondary" data-close>Annulla</button><button type="submit" class="primary">${submitLabel}</button></div>` : ''}</form>`;
  dialog.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => { editingPlan = null; dialog.remove(); });
  if (onSubmit) dialog.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault(); const submit = dialog.querySelector('button[type=submit]'); submit.disabled = true;
    try { await onSubmit(new FormData(e.currentTarget), dialog); dialog.close(); }
    catch (error) { dialog.querySelector('.form-error').textContent = error.message; }
    finally { submit.disabled = false; }
  });
  document.body.append(dialog); dialog.showModal();
  return dialog;
}
function confirmAction(title, description, action, label = 'Conferma') { return modal(title, `<p>${description}</p>`, action, label); }

function exerciseForm(existing) {
  modal(existing ? 'MODIFICA ESERCIZIO' : 'NUOVO ESERCIZIO', field('Nome', input('name', existing?.name, 'required maxlength="100"')) + `<div class="form-grid">${field('Gruppo muscolare', `<select name="muscle">${options(MUSCLES, existing?.muscle)}</select>`)}${field('Attrezzo', `<select name="equipment">${options(EQUIPMENT, existing?.equipment)}</select>`)}</div>` + field('Le tue note', `<textarea name="notes" maxlength="4000" rows="3" placeholder="Impostazioni, riferimenti, indicazioni personali…">${esc(existing?.notes)}</textarea>`), async fd => {
    const row = { id: existing?.id ?? uid(), name: text(fd.get('name'), 'Nome'), muscle: fd.get('muscle'), equipment: fd.get('equipment'), notes: String(fd.get('notes')), custom: existing?.custom ?? true };
    await update(s => { const i = s.exercises.findIndex(e => e.id === row.id); if (i >= 0) s.exercises[i] = row; else s.exercises.push(row); }); toast('Esercizio salvato');
  });
}
function exerciseDetail(id) {
  const e = state.exercises.find(x => x.id === id), logs = state.history.filter(h => h.exercises.some(x => x.exerciseId === id && x.sets.some(s => s.done))).slice(-5).reverse();
  const d = modal(esc(e.name), `<p>${badge(e.muscle)} ${badge(e.equipment)}</p><p class="preserve-lines">${esc(e.notes || 'Aggiungi le tue note per ritrovarle quando ti alleni.')}</p><button type="button" class="secondary" id="edit-exercise">${icon('edit')} Modifica dettagli</button><h3 class="spaced">Ultime registrazioni</h3>${logs.length ? logs.map(h => `<div class="detail-row"><strong>${dateFmt(h.finishedAt)}</strong><p>${h.exercises.filter(x => x.exerciseId === id).flatMap(x => x.sets).filter(x => x.done).map(s => `${s.kg} kg × ${s.reps}${s.kind === 'drop' ? ' drop' : ''}`).join(' · ')}</p></div>`).join('') : '<p class="muted">Nessuna serie registrata.</p>'}`, null);
  d.querySelector('#edit-exercise').onclick = () => { d.close(); exerciseForm(e); };
}

function planForm(existing) {
  const draft = existing ? clone(existing) : { id: uid(), name: '', notes: '', exercises: [] };
  const d = modal(existing ? 'MODIFICA SCHEDA' : 'NUOVA SCHEDA', field('Nome della scheda', input('name', draft.name, 'required maxlength="100" placeholder="Es. Upper body · Giorno A"')) + field('Note', `<textarea name="notes" maxlength="4000" rows="2">${esc(draft.notes)}</textarea>`) + `<div class="section-head spaced"><h3>Esercizi</h3><button type="button" class="text-button" id="plan-add">${icon('plus')} Aggiungi</button></div><p class="helper">Per un superset scegli lo stesso gruppo per almeno due esercizi, con uguale numero di serie. I drop sono serie aggiuntive senza recupero dopo ciascuna serie principale.</p><div id="plan-rows"></div>`, async fd => {
    draft.name = text(fd.get('name'), 'Nome'); draft.notes = String(fd.get('notes'));
    validatePlan(draft, state);
    await update(s => { const i = s.plans.findIndex(p => p.id === draft.id); if (i >= 0) s.plans[i] = draft; else s.plans.push(draft); }); toast('Scheda salvata');
  });
  editingPlan = draft;
  function draw() {
    d.querySelector('#plan-rows').innerHTML = draft.exercises.map((row, i) => `<div class="plan-editor-row" data-plan-row="${row.id}"><div class="section-head"><strong class="eyebrow">ESERCIZIO ${i + 1}</strong><div class="row-controls"><button type="button" class="small-button" data-move="-1" data-id="${row.id}" ${i === 0 ? 'disabled' : ''} aria-label="Sposta esercizio in alto">↑</button><button type="button" class="small-button" data-move="1" data-id="${row.id}" ${i === draft.exercises.length - 1 ? 'disabled' : ''} aria-label="Sposta esercizio in basso">↓</button><button type="button" class="icon-button" data-remove="${row.id}" aria-label="Rimuovi esercizio">${icon('trash')}</button></div></div><select aria-label="Esercizio ${i + 1}" data-prop="exerciseId">${exerciseOptions(row.exerciseId)}</select><div class="prescription-grid">${[['sets', 'Serie', 1, 20], ['reps', 'Rip.', 1, 100], ['rest', 'Rec. s', 0, 900], ['drops', 'Drop', 0, 3]].map(([key, label, min, max]) => field(label, `<input type="number" value="${row[key]}" min="${min}" max="${max}" step="1" required data-prop="${key}" aria-label="${label} esercizio ${i + 1}">`)).join('')}</div>${field('Gruppo superset', `<select data-prop="group"><option value="">Nessuno · Serie normali</option>${options(['A', 'B', 'C', 'D'], row.group)}</select>`)}</div>`).join('') || '<div class="empty-inline">Aggiungi gli esercizi della tua scheda.</div>';
  }
  d.querySelector('#plan-add').onclick = () => { draft.exercises.push({ id: uid(), exerciseId: state.exercises[0].id, sets: 3, reps: 10, rest: 90, drops: 0, group: '' }); draw(); };
  d.addEventListener('change', e => { const row = draft.exercises.find(r => r.id === e.target.closest('[data-plan-row]')?.dataset.planRow); if (row && e.target.dataset.prop) row[e.target.dataset.prop] = ['exerciseId', 'group'].includes(e.target.dataset.prop) ? e.target.value : Number(e.target.value); });
  d.addEventListener('click', e => { const remove = e.target.closest('[data-remove]'), move = e.target.closest('[data-move]'); if (remove) { draft.exercises = draft.exercises.filter(r => r.id !== remove.dataset.remove); draw(); } if (move) { const i = draft.exercises.findIndex(r => r.id === move.dataset.id), j = i + Number(move.dataset.move); if (j >= 0 && j < draft.exercises.length) { [draft.exercises[i], draft.exercises[j]] = [draft.exercises[j], draft.exercises[i]]; draw(); } } });
  draw();
}

function mealForm(food, totals, name) {
  const simple = !food && !totals;
  const initial = totals ?? { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  modal(food ? 'REGISTRA ALIMENTO' : 'REGISTRA PASTO', field('Nome', input('name', food?.name ?? name ?? '', 'required maxlength="100"')) + `<div class="form-grid">${field('Giorno', input('date', nutritionDate, 'type="date" required'))}${field('Pasto', `<select name="slot">${options(['Colazione', 'Pranzo', 'Cena', 'Spuntino'], 'Pranzo')}</select>`)}</div>` + (food ? field('Quantità in grammi', input('grams', 100, 'type="number" min="1" max="10000" required')) : `<div class="form-grid">${[['kcal', 'Calorie (kcal)'], ['protein', 'Proteine (g)'], ['carbs', 'Carboidrati (g)'], ['fat', 'Grassi (g)']].map(([k, label]) => field(label, input(k, initial[k], `type="number" min="0" max="100000" step="0.1" required ${simple ? '' : 'readonly'}`))).join('')}</div>`) + (simple && state.foods.length ? `<p class="helper">Per registrare un alimento per quantità, apri “I tuoi alimenti”.</p>` : ''), async fd => {
    const t = food ? foodTotals(food, number(fd.get('grams'), 1, 10000, 'Quantità')) : Object.fromEntries(['kcal', 'protein', 'carbs', 'fat'].map(k => [k, number(fd.get(k), 0, 100000, 'Nutrienti')]));
    await update(s => s.meals.push({ id: uid(), date: String(fd.get('date')), slot: String(fd.get('slot')), name: text(fd.get('name'), 'Nome'), ...t })); toast('Pasto registrato');
  }, 'Registra');
}

function foodForm() {
  modal('NUOVO ALIMENTO', `<p class="helper">Riporta i valori dell’etichetta per 100 g. I totali del pasto saranno calcolati dalla quantità.</p>${field('Nome', input('name', '', 'required maxlength="100"'))}<div class="form-grid">${[['kcal', 'Calorie (kcal)', 1000], ['protein', 'Proteine (g)', 100], ['carbs', 'Carboidrati (g)', 100], ['fat', 'Grassi (g)', 100]].map(([k, label, max]) => field(label, input(k, '', `type="number" min="0" max="${max}" step="0.1" required`))).join('')}</div>`, async fd => {
    const food = { id: uid(), name: text(fd.get('name'), 'Nome'), ...Object.fromEntries(['kcal', 'protein', 'carbs', 'fat'].map(k => [k, number(fd.get(k), 0, k === 'kcal' ? 1000 : 100, 'Nutrienti')])) };
    await update(s => s.foods.push(food)); toast('Alimento salvato');
  });
}
function foodLibrary() {
  const d = modal('I TUOI ALIMENTI', `<button type="button" class="primary" id="food-new">${icon('plus')} Nuovo alimento</button>${state.foods.map(f => `<button type="button" class="food-choice" data-food="${f.id}"><div><strong>${esc(f.name)}</strong><span>${fmt(f.kcal)} kcal / 100 g</span></div>${icon('plus')}</button>`).join('') || '<p class="muted spaced">Salva il primo alimento con i valori della sua etichetta.</p>'}`, null);
  d.querySelector('#food-new').onclick = () => { d.close(); foodForm(); };
  d.querySelectorAll('[data-food]').forEach(b => b.onclick = () => { const food = state.foods.find(f => f.id === b.dataset.food); d.close(); mealForm(food); });
}
function recipeForm() {
  if (!state.foods.length) { toast('Prima aggiungi gli alimenti con i valori per 100 g.'); foodForm(); return; }
  const items = [];
  const d = modal('NUOVA RICETTA', field('Nome', input('name', '', 'required maxlength="100"')) + field('Numero di porzioni', input('portions', 1, 'type="number" min="1" max="100" step="1" required')) + `<div class="section-head spaced"><h3>Ingredienti</h3><button type="button" class="text-button" id="ingredient-add">${icon('plus')} Aggiungi</button></div><div id="ingredients"></div>`, async fd => {
    recipeTotals(items, state.foods);
    await update(s => s.recipes.push({ id: uid(), name: text(fd.get('name'), 'Nome'), portions: number(fd.get('portions'), 1, 100, 'Porzioni'), items })); toast('Ricetta salvata');
  });
  function draw() { d.querySelector('#ingredients').innerHTML = items.map((r, i) => `<div class="ingredient-row" data-i="${i}"><select data-prop="foodId" aria-label="Alimento ingrediente ${i + 1}">${state.foods.map(f => `<option value="${f.id}" ${f.id === r.foodId ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select><input data-prop="grams" aria-label="Grammi ingrediente ${i + 1}" type="number" min="1" max="10000" value="${r.grams}" required><span>g</span><button type="button" class="icon-button" data-remove-ingredient="${i}" aria-label="Rimuovi ingrediente">${icon('trash')}</button></div>`).join(''); }
  d.querySelector('#ingredient-add').onclick = () => { items.push({ foodId: state.foods[0].id, grams: 100 }); draw(); };
  d.addEventListener('change', e => { const i = e.target.closest('[data-i]')?.dataset.i; if (i !== undefined && e.target.dataset.prop) items[i][e.target.dataset.prop] = e.target.dataset.prop === 'grams' ? Number(e.target.value) : e.target.value; });
  d.addEventListener('click', e => { const b = e.target.closest('[data-remove-ingredient]'); if (b) { items.splice(Number(b.dataset.removeIngredient), 1); draw(); } });
}

async function syncRest() {
  try { await scheduleRest(state.active?.restUntil); }
  catch { toast('Avviso in background non disponibile: il timer resta visibile nell’app.', true); }
}

const actions = {
  nav: b => go(b.dataset.view),
  'new-plan': () => planForm(), 'edit-plan': b => planForm(state.plans.find(p => p.id === b.dataset.id)),
  'duplicate-plan': b => update(s => { const p = clone(s.plans.find(p => p.id === b.dataset.id)); p.id = uid(); p.name = (p.name + ' · Copia').slice(0, 100); p.exercises.forEach(e => e.id = uid()); s.plans.push(p); }),
  'delete-plan': b => confirmAction('ELIMINARE LA SCHEDA?', 'Lo storico degli allenamenti già completati resterà disponibile.', () => update(s => { s.plans = s.plans.filter(p => p.id !== b.dataset.id); s.schedule = s.schedule.filter(r => r.planId !== b.dataset.id); }), 'Elimina'),
  start: async b => { await commit(startWorkout(state, state.plans.find(p => p.id === b.dataset.id))); go('runner'); },
  resume: () => go('runner'),
  'toggle-pause': async () => { await commit(togglePause(state)); await syncRest(); },
  'complete-set': async b => { await commit(completeSet(state, b.dataset.row, b.dataset.id)); restNotified = null; await syncRest(); },
  'rest-skip': async () => { await update(s => s.active.restUntil = null); await syncRest(); },
  'rest-add': async () => { await update(s => s.active.restUntil = Math.max(Date.now(), s.active.restUntil ?? Date.now()) + 30000); await syncRest(); },
  swap: b => { const row = state.active.exercises.find(e => e.id === b.dataset.id), candidates = state.exercises.filter(e => e.muscle === row.muscle && e.id !== row.exerciseId); modal('SOSTITUISCI ESERCIZIO', `<p class="helper">La sostituzione vale per questa sessione. La scheda originale resta disponibile.</p>${field('Nuovo esercizio', `<select name="replacement">${[...candidates, ...state.exercises.filter(e => e.muscle !== row.muscle)].map(e => `<option value="${e.id}">${esc(e.name)} · ${esc(e.equipment)}</option>`).join('')}</select>`)}`, fd => commit(swapExercise(state, row.id, fd.get('replacement'))), 'Sostituisci'); },
  finish: () => { if (!sessionStats(state.active).sets) { toast('Registra almeno una serie prima di concludere.', true); return; } confirmAction('UN ALTRO PASSO FATTO.', 'Le serie completate verranno aggiunte al tuo storico. Le serie non completate non conteranno nel volume.', async () => { await commit(finishWorkout(state)); await syncRest(); go('progress'); toast('Allenamento salvato. Bel lavoro!'); }, 'Salva allenamento'); },
  discard: () => confirmAction('ANNULLARE L’ALLENAMENTO?', 'I dati di questa sessione verranno eliminati. Le schede e lo storico resteranno disponibili.', async () => { await update(s => s.active = null); await syncRest(); go('plans'); }, 'Annulla allenamento'),
  'new-exercise': () => exerciseForm(), 'exercise-detail': b => exerciseDetail(b.dataset.id),
  'filter-muscle': b => { muscle = b.dataset.muscle; render(); },
  schedule: () => { if (!state.plans.length) return toast('Crea prima una scheda.'); modal('PIANIFICA ALLENAMENTO', field('Giorno', input('date', dayKey(), 'type="date" required')) + field('Scheda', `<select name="planId">${state.plans.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>`), fd => update(s => { s.schedule = s.schedule.filter(r => r.date !== fd.get('date')); s.schedule.push({ id: uid(), date: String(fd.get('date')), planId: String(fd.get('planId')) }); }), 'Pianifica'); },
  unschedule: b => update(s => s.schedule = s.schedule.filter(r => r.id !== b.dataset.id)),
  'history-detail': b => { const h = state.history.find(h => h.id === b.dataset.id); modal(esc(h.name), `<p>${dateFmt(h.finishedAt)} · ${time(h.duration)} attivi</p>${h.exercises.map(e => { const sets = e.sets.filter(s => s.done); return sets.length ? `<div class="detail-row"><h3>${esc(e.name)} ${e.group ? badge('Superset ' + e.group) : ''}</h3><p>${sets.map(s => `${s.kg} kg × ${s.reps}${s.kind === 'drop' ? ' (drop)' : ''}`).join(' · ')}</p></div>` : ''; }).join('')}`, null); },
  'add-meal': () => mealForm(), 'food-library': foodLibrary,
  'delete-meal': b => confirmAction('ELIMINARE IL PASTO?', 'Verrà rimosso soltanto dal diario del giorno selezionato.', () => update(s => s.meals = s.meals.filter(m => m.id !== b.dataset.id)), 'Elimina'),
  'nutrition-goal': () => modal('IL TUO OBIETTIVO', `<p class="helper">Inserisci il tuo obiettivo personale. GymHub non lo prescrive né lo calcola. Inserisci 0 per disattivarlo.</p>${field('Calorie giornaliere', input('goal', state.settings.nutritionGoal, 'type="number" min="0" max="20000" required'))}`, fd => update(s => s.settings.nutritionGoal = number(fd.get('goal'), 0, 20000, 'Obiettivo'))),
  'new-recipe': recipeForm,
  'delete-recipe': b => confirmAction('ELIMINARE LA RICETTA?', 'I pasti già registrati restano nello storico.', () => update(s => s.recipes = s.recipes.filter(r => r.id !== b.dataset.id)), 'Elimina'),
  'log-recipe': b => { const r = state.recipes.find(r => r.id === b.dataset.id), totals = recipeTotals(r.items, state.foods); for (const k of Object.keys(totals)) totals[k] = Math.round(totals[k] / r.portions * 10) / 10; mealForm(null, totals, r.name); },
  'new-habit': () => modal('NUOVA ABITUDINE', field('Quale gesto vuoi coltivare?', input('name', '', 'required maxlength="100"')), fd => update(s => s.habits.push({ id: uid(), name: text(fd.get('name'), 'Abitudine') }))),
  'toggle-habit': b => update(s => { const key = dayKey(), checks = s.checks[key] ?? []; s.checks[key] = checks.includes(b.dataset.id) ? checks.filter(id => id !== b.dataset.id) : [...checks, b.dataset.id]; }),
  'delete-habit': b => confirmAction('ELIMINARE L’ABITUDINE?', 'Verranno rimosse anche le sue spunte dai giorni precedenti.', () => update(s => { s.habits = s.habits.filter(h => h.id !== b.dataset.id); for (const date of Object.keys(s.checks)) s.checks[date] = s.checks[date].filter(id => id !== b.dataset.id); }), 'Elimina'),
  export: async () => { await exportData(state); toast('Backup pronto'); },
  import: () => document.querySelector('#import-file').click()
};

root.addEventListener('click', async event => {
  const b = event.target.closest('[data-action]'); if (!b || b.disabled) return;
  event.preventDefault();
  try { await actions[b.dataset.action]?.(b); } catch (error) { toast(error.message || 'Operazione non riuscita.', true); }
});
root.addEventListener('input', event => {
  if (event.target.id === 'exercise-search') {
    libraryQuery = event.target.value; const pos = event.target.selectionStart; render(); const target = document.querySelector('#exercise-search'); target.focus(); target.setSelectionRange(pos, pos);
  }
});
root.addEventListener('change', async event => {
  const target = event.target;
  try {
    if (target.dataset.set) {
      const n = number(target.value, target.dataset.property === 'kg' ? 0 : 1, target.dataset.property === 'kg' ? 1500 : 1000, target.dataset.property === 'kg' ? 'Carico' : 'Ripetizioni');
      if (target.dataset.property === 'reps' && !Number.isInteger(n)) throw new Error('Le ripetizioni devono essere intere.');
      await update(s => { const set = s.active.exercises.find(e => e.id === target.dataset.row).sets.find(r => r.id === target.dataset.set); set[target.dataset.property] = n; }, false);
    }
    if (target.id === 'history-filter') { historyExercise = target.value; render(); }
    if (target.id === 'nutrition-date') { nutritionDate = target.value || dayKey(); render(); }
    if (target.id === 'import-file' && target.files[0]) {
      const file = target.files[0]; if (file.size > 50 * 1024 * 1024) throw new Error('Il backup supera 50 MB.');
      const restored = validateBackup(await file.text());
      confirmAction('IMPORTARE IL BACKUP?', 'Sostituirà i dati attuali di GymHub su questo dispositivo. Esporta prima un backup se vuoi conservarli.', async () => { await commit(restored); await syncRest(); toast('Backup importato'); });
    }
  } catch (error) { toast(error.message, true); if (target.dataset.set) render(); }
});
root.addEventListener('submit', async event => {
  if (event.target.id !== 'profile-form') return;
  event.preventDefault();
  try { const name = text(new FormData(event.target).get('name'), 'Nome'); await update(s => s.settings.name = name); toast('Nome aggiornato'); }
  catch (error) { toast(error.message, true); }
});

function beep() {
  try { const audio = new (window.AudioContext || window.webkitAudioContext)(); const oscillator = audio.createOscillator(), gain = audio.createGain(); oscillator.connect(gain); gain.connect(audio.destination); oscillator.frequency.value = 660; gain.gain.value = 0.12; oscillator.start(); oscillator.stop(audio.currentTime + 0.35); oscillator.onended = () => audio.close(); } catch { /* Visual timer always remains available. */ }
}
function tick() {
  const s = state?.active;
  if (!s) return;
  const clock = document.querySelector('#session-time'); if (clock) clock.textContent = time(elapsed(s));
  const rest = document.querySelector('#rest-time');
  if (rest && s.restUntil) {
    const left = Math.max(0, Math.ceil((s.restUntil - Date.now()) / 1000)); rest.textContent = left ? time(left) : 'PRONTO';
    if (!left && restNotified !== s.restUntil) { restNotified = s.restUntil; beep(); toast('Recupero terminato'); }
  }
}
setInterval(tick, 250);
window.addEventListener('visibilitychange', tick);
if (Capacitor.isNativePlatform()) App.addListener('backButton', () => {
  const dialog = document.querySelector('dialog[open]');
  if (dialog) { dialog.close(); return; }
  if (viewStack.length > 1) { viewStack.pop(); view = viewStack.at(-1); render(); window.scrollTo(0, 0); }
  else App.minimizeApp();
});
try {
  state = await load(); render();
  if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register(new URL('sw.js', document.baseURI)).catch(() => {});
} catch {
  root.innerHTML = `<main class="recovery panel"><h1>PROTEGGIAMO I TUOI DATI.</h1><p>L’archivio non è leggibile. Non è stato sovrascritto. Puoi ripristinare un backup valido.</p><input id="recovery-file" type="file" accept=".json,application/json" aria-label="Ripristina backup"><p id="recovery-error" role="alert"></p></main>`;
  document.querySelector('#recovery-file').onchange = async event => {
    try { const file = event.target.files[0]; if (!file || file.size > 50 * 1024 * 1024) throw new Error('Scegli un backup JSON valido entro 50 MB.'); const restored = validateBackup(await file.text()); if (!window.confirm('Sostituire l’archivio non leggibile con questo backup?')) return; await save(restored); location.reload(); } catch (e) { document.querySelector('#recovery-error').textContent = e.message; }
  };
}
setTimeout(() => { const splash = document.querySelector('#avvio'); splash?.classList.add('via'); setTimeout(() => splash?.remove(), 350); }, Math.max(0, 850 - (performance.now() - (window.gymhubStartedAt ?? 0))));

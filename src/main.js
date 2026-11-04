import './style.css';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { uid, dayKey, clone, number, text, MUSCLES, EQUIPMENT, validatePlan, startWorkout, startEffort, addVariableDrop, addWarmupSet, completeSet, swapExercise, finishWorkout, togglePause, elapsed, sessionStats, foodTotals, recipeTotals, streak, validateBackup, rotateWorkoutSchedule, progressionSuggestion } from './domain.js';
import { load, save, exportData, scheduleRest } from './storage.js';
import { icon } from './icons.js';
import { backReference, importBackReference, additionalSessions, importVideoSession } from './references.js';
import { exerciseVideo, exerciseVideoSearch, youtubeUrl } from './videos.js';
import { ppl, pplExercises, importPpl, pplDates, schedulePpl } from './ppl.js';
import { enableWebUpdates } from './updates.js';
import {libraryPageHtml,programDetailHtml,hanyDetailHtml} from './library-page.js';
import {myPlansHtml} from './own-plans.js';
import {catalogProgramHtml,catalogSessionHtml,hanyProgramHtml,hanySessionHtml,fst7DetailHtml} from './training-browser.js';
import {pplLibraryHtml,pplSessionHtml} from './ppl-library.js';
import { cbumCatalogHtml, cbumScheduleDialog } from './cbum-ui.js';
import { cbumCatalog } from './cbum-catalog.js';
import {searchLibraryExercises,findReferenceExercise,matchReferenceExercise,referenceExerciseHtml} from './exercise-catalog.js';
import {motionPanelHtml,mountMotionPanel,motionPresetFor} from './motion-viewer.js';

const root = document.querySelector('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = value => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format(value);
const time = secs => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;
const dateFmt = value => new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
const dateTitle = () => new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
const repTarget = row => row.targetSeconds ? `${row.targetSeconds} s` : row.toFailure ? 'Cedimento' : row.freeReps ? 'Libere' : row.repsMax ? `${row.reps}–${row.repsMax}` : row.reps;
const setSuffix = set => set.kind === 'drop' ? ' (drop)' : set.kind === 'restpause' ? ' (rest-pause)' : set.kind === 'warmup' ? ' (riscaldamento)' : '';
const requestedView = new URLSearchParams(location.search).get('screen');
let state, view = ['home','plans','myplans','ppl','cbum','library','runner','progress','nutrition','recipes','habits','more','settings'].includes(requestedView) ? requestedView : 'home', libraryQuery = '', muscle = '', nutritionDate = dayKey(), historyExercise = '', toastTimeout, storageError = false, restNotified = null, effortNotified = null;
let editingPlan = null;
const viewStack = view === 'home' ? ['home'] : ['home',view];

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
  const active = ['nutrition', 'habits', 'settings', 'recipes'].includes(view) ? 'more' : ['runner','myplans'].includes(view)?'home':['ppl', 'cbum'].includes(view) ? 'plans' : view;
  return `<aside class="sidebar"><a href="#home" class="brand" data-action="nav" data-view="home">${icon('dumbbell')}<span>GYM<span class="gold">HUB</span><small>IL TUO RITMO.</small></span></a><nav aria-label="Navigazione principale">${nav.map(([key, label, symbol]) => button('nav', label, symbol, active === key ? 'nav-item selected' : 'nav-item', `data-view="${key}" ${active === key ? 'aria-current="page"' : ''}`)).join('')}</nav><div class="sidebar-bottom">${icon('shield')}<strong>Il tuo spazio. I tuoi dati.</strong><span>Open source · Nessun abbonamento</span></div></aside><div class="app-body"><div class="topbar"><span class="mobile-brand">GYM<span>HUB</span></span><span class="today">${dateTitle()}</span><span class="local-status"><i></i> Sul dispositivo</span></div>${storageError ? '<div class="save-error" role="alert">Dati non salvati. Libera spazio ed esporta un backup dalle impostazioni.</div>' : ''}<main id="main">${content}</main></div><nav class="mobile-nav" aria-label="Navigazione mobile">${nav.map(([key, label, symbol]) => button('nav', `<span>${label}</span>`, symbol, active === key ? 'selected' : '', `data-view="${key}" ${active === key ? 'aria-current="page"' : ''}`)).join('')}</nav>`;
}

function weekDays() {
  const now = new Date(), monday = new Date(now); monday.setDate(now.getDate() - (now.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, i) => { const date = new Date(monday); date.setDate(monday.getDate() + i); return date; });
}
function homePage() {
  const week = weekDays(), start = dayKey(week[0]), weekHistory = state.history.filter(h => dayKey(new Date(h.finishedAt)) >= start);
  const volume = weekHistory.reduce((s, h) => s + sessionStats(h).volume, 0);
  const todayEntry = state.schedule.find(s => s.date === dayKey()), restToday = todayEntry?.kind === 'rest';
  const todayPlan = restToday ? null : state.plans.find(p => p.id === todayEntry?.planId) ?? state.plans[0];
  const next = state.active;
  return head('IL TUO SPAZIO, OGNI GIORNO', `CIAO, ${esc(state.settings.name)}<span class="gold">.</span>`, 'Un passo alla volta. Ogni allenamento conta.') +
    `<section class="hero"><div class="hero-copy">${badge(next ? 'ALLENAMENTO IN CORSO' : restToday ? 'RIPOSO PIANIFICATO' : 'PRONTO QUANDO LO SEI TU', 'gold-tag')}<h2>${next ? 'RIPARTI<br>DA QUI.' : restToday ? 'OGGI<br>RECUPERA.' : 'IL PROSSIMO<br>PASSO È TUO.'}</h2><p>${next ? esc(next.name) + ' · I tuoi progressi sono salvati.' : restToday ? 'Il tuo calendario prevede una giornata di riposo.' : 'Concentrati sull’allenamento.<br>Al resto pensiamo noi.'}</p>${button(next ? 'resume' : restToday ? 'nav' : todayPlan ? 'start' : 'new-plan', next ? 'Riprendi allenamento' : restToday ? 'Vedi le schede' : todayPlan ? 'Inizia ad allenarti' : 'Crea la tua scheda', 'play', 'primary', restToday ? 'data-view="plans"' : todayPlan ? `data-id="${todayPlan.id}"` : '')}</div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div>${icon('dumbbell')}<span>FATTO A MODO TUO.</span></div></section>` +
    `<div class="stats-grid"><article class="stat-card">${icon('dumbbell')}<span>Questa settimana</span><strong>${weekHistory.length}<small> allenamenti</small></strong></article><article class="stat-card">${icon('chart')}<span>Volume settimanale</span><strong>${fmt(volume)}<small> kg</small></strong></article><article class="stat-card">${icon('clock')}<span>Tempo per te</span><strong>${Math.round(weekHistory.reduce((s, h) => s + h.duration, 0) / 60)}<small> minuti</small></strong></article></div>` +
    `<div class="home-columns"><section class="panel"><div class="section-head"><h2>IL TUO RITMO</h2>${button('schedule', 'Pianifica', 'plus', 'text-button')}</div><div class="week-strip">${week.map(d => { const k = dayKey(d), done = state.history.some(h => dayKey(new Date(h.finishedAt)) === k), planned = state.schedule.some(s => s.date === k); return `<div class="day ${k === dayKey() ? 'is-today' : ''}"><span>${new Intl.DateTimeFormat('it-IT', { weekday: 'short' }).format(d)}</span><strong>${d.getDate()}</strong><i class="${done ? 'done-dot' : planned ? 'plan-dot' : ''}"></i></div>`; }).join('')}</div><div class="week-caption"><span><i class="done-dot"></i> Completato</span><span><i class="plan-dot"></i> Pianificato</span></div>${state.schedule.filter(s => s.date >= dayKey()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(s => `<div class="schedule-row"><span>${dateFmt(s.date + 'T12:00:00')}</span><strong>${esc(s.kind === 'rest' ? 'Riposo' : s.sessionName ? s.sessionName + ' · ' + (state.plans.find(p => p.id === s.planId)?.name ?? 'Scheda da verificare') : state.plans.find(p => p.id === s.planId)?.name)}</strong>${button('unschedule', icon('close'), '', 'icon-button', `data-id="${s.id}" aria-label="Rimuovi dal calendario"`)}</div>`).join('')}</section><section class="panel"><div class="section-head"><h2>LA TUA SCHEDA</h2>${button('nav', 'Tutte', 'arrow', 'text-button', 'data-view="myplans"')}</div>${todayPlan ? `<div class="featured-plan"><div class="tile-icon">${icon('dumbbell')}</div><h3>${esc(todayPlan.name)}</h3><p>${todayPlan.exercises.length} esercizi · ${todayPlan.exercises.reduce((s, e) => s + e.sets, 0)} serie principali</p>${button('edit-plan', 'Personalizza', 'edit', 'secondary', `data-id="${todayPlan.id}"`)}</div>` : empty('book', 'Il tuo percorso inizia qui', 'Crea una scheda con i tuoi esercizi.')}</section></div>` +
    `<div class="wrap-actions">${button('default-rest','Recupero predefinito: '+(state.settings.defaultRest??80)+' s','clock','secondary')}${button('choose-workout','Scegli la seduta di oggi','plus','secondary')}${button('choose-cycle','Scegli split e ciclo','calendar','primary')}${button('manage-plans','Gestisci le mie schede','edit','secondary')}${button('schedule','Modifica calendario','clock','secondary')}</div>` + weekAgenda() + `<div class="section-head spaced"><h2>OLTRE L’ALLENAMENTO</h2></div><div class="quick-grid">${[['nutrition', 'Nutrizione', 'Pasti, calorie e ricette', 'leaf'], ['habits', 'Le tue abitudini', 'Piccoli gesti, costanza vera', 'target']].map(([v, title, sub, symbol]) => `<button class="quick-card" data-action="nav" data-view="${v}"><div class="tile-icon">${icon(symbol)}</div><div><h3>${title}</h3><p>${sub}</p></div>${icon('chevron')}</button>`).join('')}</div>`;
}

function legacyPlansPage() {
  return head('ALLENATI A MODO TUO', 'LE TUE SCHEDE', 'Struttura, personalizza, ripeti.', button('new-plan', 'Nuova scheda', 'plus', 'primary')) +
    `<section class="panel reference-card"><div><p class="eyebrow">CATALOGO CHRIS BUMSTEAD</p><h2>SPLIT STORICHE · 2016–2024</h2><p>Quattro cicli documentati: 5, 8 o 9 giorni, con recuperi e rotazioni. Consulta senza avviare, poi collega le tue schede e pianifica.</p></div>${button('nav', 'Apri il catalogo split', 'book', 'primary', 'data-view="cbum"')}</section>` +
    `<section class="panel reference-card"><div><p class="eyebrow">CHRIS BUMSTEAD · PROGRAMMA COMPLETO 2019</p><h2>PUSH · PULL · GAMBE</h2><p>Sei sedute A/B, esercizi, serie e tecniche dal video ufficiale. Riposi configurabili e calendario con nomi dei giorni.</p></div>${button('nav', 'Apri la split completa', 'book', 'primary', 'data-view="ppl"')}</section>` +
    `<section class="panel reference-card"><div><p class="eyebrow">CHRIS BUMSTEAD · SPLIT OFF-SEASON 2024 · RIFERIMENTO ESTERNO</p><h2>ROTAZIONE SU 9 GIORNI</h2><p>1. Petto, tricipiti, deltoidi posteriori · 2. Schiena e bicipiti · 3. Quadricipiti e polpacci · 4. Riposo · 5. Spalle · 6. Braccia · 7. Petto e schiena · 8. Femorali, glutei e polpacci · 9. Riposo.</p><p class="helper">Fonte giornalistica del periodo 2024. Consultazione della split: non è una scheda esercizi verificata né avvia un allenamento. Non mescolare con il programma PPL 2019.</p><a class="text-button" href="https://kylehuntfitness.com/chris-bumstead-workout-and-diet-program-for-2024/" target="_blank" rel="noopener noreferrer">Leggi la fonte</a></div></section>` +
    `<section class="panel reference-card"><div><p class="eyebrow">CHRIS BUMSTEAD · SESSIONE DISPONIBILE</p><h2>SCHIENA, BICIPITI E DELTOIDI</h2><p>2 × 8 con rest-pause · Due tri-set 3 × 8–12 · Finisher 10 × 10</p><p>Una sessione verificata dal video. Sessione singola del 2026. Il programma completo PPL 2019 è disponibile nella sezione qui sopra.</p></div>${button('back-reference', 'Scopri la sessione', 'book', 'secondary')}</section>` +
    `<div class="session-catalog">${additionalSessions.map(r=>`<section class="panel reference-card video-session-card"><div><p class="eyebrow">CHRIS BUMSTEAD · SESSIONE DISPONIBILE</p><h2>${esc(r.cardTitle)}</h2><p>${esc(r.summary)}</p><p>${dateFmt(r.published+'T12:00:00')} · Video indipendente · Alcune serie da personalizzare.</p></div>${button('video-session',r.key==='chest'?'Scopri petto e tricipiti':'Scopri gambe','book','secondary',`data-session="${r.key}"`)}</section>`).join('')}</div>` +
    `<section class="panel reference-card"><div><p class="eyebrow">ALTRI VIDEO UFFICIALI DI CHRIS · 2026</p><h2>ALTRE SESSIONI DA ESPLORARE</h2><p>Petto e schiena (19 marzo 2026), braccia ad alto volume (30 maggio 2026). Puoi vedere i video senza iniziare un allenamento. Per ora sono riferimenti, non schede di esercizi: serie, ripetizioni e carichi non sono stati estratti o verificati.</p><div class="wrap-actions"><a class="text-button" href="https://www.youtube.com/watch?v=o0tT5plmyRI" target="_blank" rel="noopener noreferrer">Petto e schiena · Video</a><a class="text-button" href="https://www.youtube.com/watch?v=61cBu2XHvRo" target="_blank" rel="noopener noreferrer">Braccia · Video</a></div></div></section>` +
    `<p class="helper session-caption">Le tre sessioni 2026 provengono da video diversi: non costituiscono una settimana ufficiale unica. Ogni scheda conserva fonte e data. Il PPL completo 2019 resta un programma separato.</p>` +
    `<div class="section-head"><p class="helper">Le tue schede sono qui sotto. Puoi assegnarle alle date del tuo calendario.</p>${button('schedule', 'Pianifica la settimana', 'clock', 'text-button')}</div>` +
    (state.active ? `<div class="resume-banner">${icon('clock')}<div><strong>Hai un allenamento in corso</strong><span>${esc(state.active.name)}</span></div>${button('resume', 'Riprendi', 'arrow', 'secondary')}</div>` : '') +
    `<div class="plan-grid">${state.plans.map(plan => `<article class="panel plan-card"><div class="section-head"><div class="tile-icon">${icon('dumbbell')}</div>${button('edit-plan', icon('edit'), '', 'icon-button', `data-id="${plan.id}" aria-label="Modifica ${esc(plan.name)}"`)}</div><h2>${esc(plan.name)}</h2><p>${plan.exercises.length} esercizi · ${plan.exercises.reduce((s, e) => s + e.sets, 0)} serie</p><div class="muscle-tags">${[...new Set(plan.exercises.map(r => state.exercises.find(e => e.id === r.exerciseId)?.muscle))].map(m => badge(m)).join('')}</div><ul class="plan-preview">${plan.exercises.map(row => `<li><span>${esc(state.exercises.find(e => e.id === row.exerciseId)?.name)}</span><strong>${row.sets} × ${repTarget(row)}</strong></li>`).join('')}</ul>${plan.notes ? `<p class="plan-note">${esc(plan.notes)}</p>` : ''}<div class="card-actions">${button('plan-detail', 'Leggi scheda', 'book', 'secondary', `data-id="${plan.id}"`)}${button('start', 'Inizia', 'play', 'primary', `data-id="${plan.id}"`)}${button('duplicate-plan', icon('plus'), '', 'icon-button', `data-id="${plan.id}" aria-label="Duplica scheda"`)}${button('delete-plan', icon('trash'), '', 'icon-button danger-text', `data-id="${plan.id}" aria-label="Elimina scheda"`)}</div></article>`).join('')}</div>${!state.plans.length ? empty('dumbbell', 'Spazio al tuo prossimo obiettivo', 'Aggiungi la prima scheda per iniziare.', button('new-plan', 'Crea scheda', 'plus', 'primary')) : ''}`;
}

function plansPage() { return libraryPageHtml(state,button); }
function myplansPage() { return myPlansHtml(state,button); }
function weekAgenda() {
  return `<section class="panel weekly-agenda"><div class="section-head"><h2>PROSSIMI 7 GIORNI</h2>${button('choose-cycle','Scegli un ciclo','calendar','text-button')}</div>${Array.from({length:7},(_,i)=>{const date=new Date();date.setDate(date.getDate()+i);const row=state.schedule.find(s=>s.date===dayKey(date));return `<div class="cycle-day ${row?.kind==='rest'?'rest-day':''}"><span>${new Intl.DateTimeFormat('it-IT',{weekday:'short',day:'numeric',month:'short'}).format(date)}</span><strong>${row?.kind==='rest'?'Riposo':esc(row?.sessionName ? row.sessionName + ' · ' + (state.plans.find(p=>p.id===row?.planId)?.name??'Scheda da verificare') : state.plans.find(p=>p.id===row?.planId)?.name??'Non pianificato')}</strong></div>`;}).join('')}</section>`;
}

function cbumPage() { return cbumCatalogHtml(button); }
function pplPage() { return pplLibraryHtml(button); }
function oldPplPage() {
  const name = id => state.exercises.find(e => e.id === id)?.name ?? pplExercises.find(e => e[0] === id)?.[1] ?? id;
  return head('DAL CANALE UFFICIALE · 21 NOVEMBRE 2019', 'LA SPLIT COMPLETA', 'Il programma PPL spiegato da Chris: sei sedute, con varianti A e B.', button('nav', 'Le tue schede', 'arrow', 'secondary', 'data-view="plans"')) +
    `<section class="panel program-intro"><h2>PUSH A → PULL A → GAMBE A<br>PUSH B → PULL B → GAMBE B</h2><p>${esc(ppl.restNote)}</p><a class="text-button" href="${ppl.video}&t=374s" target="_blank" rel="noopener noreferrer">Guarda la spiegazione dei riposi · 6:14 ${icon('arrow')}</a><p class="helper">Questo è il programma storico del 2019, distinto dalla sessione schiena del 2026. Per le alternative ammesse nel video abbiamo selezionato una variante, indicata nelle istruzioni. I recuperi non quantificati restano manuali; nessun carico o numero di ripetizioni a cedimento è inventato.</p><div class="wrap-actions"><p class="helper">Scheda di consultazione. Per scegliere o attivare questa split apri Oggi → Scegli split e ciclo.</p></div></section>` +
    `<div class="program-grid">${ppl.sessions.map((s, i) => `<article class="panel program-session"><p class="eyebrow">SEDUTA ${i + 1} DI 6</p><h2>${esc(s.name.toUpperCase())}</h2><p>${esc(s.focus)}</p><ol>${s.exercises.map(r => `<li><div><strong>${esc(name(r.exerciseId))}</strong><span>${r.sets} × ${repTarget(r)}${r.label ? ` · ${esc(r.label)}` : ''}${r.group ? ` · SS ${r.group}${r.groupOffset ? ` dai giri ${r.groupOffset + 1}–${r.groupOffset + r.sets}` : ''}` : ''}${r.drops ? ` + ${r.drops} drop per serie` : ''}${r.warmup ? ' · Riscaldamento' : ''}</span>${r.warmupSets ? `<small>Prima: ${r.warmupSets} serie di riscaldamento, ripetizioni non fissate.</small>` : ''}${r.instructions ? `<small>${esc(r.instructions)}</small>` : ''}</div></li>`).join('')}</ol><a class="text-button" href="${ppl.video}&t=${s.time}s" target="_blank" rel="noopener noreferrer">Spiegazione originale · ${Math.floor(s.time / 60)}:${String(s.time % 60).padStart(2,'0')} ${icon('arrow')}</a></article>`).join('')}</div>`;
}

function pplScheduleForm() {
  const restOptions = options([0,1,2,3], 1);
  const d = modal('PIANIFICA IL CICLO PPL', `<p>Verranno aggiunte le sei schede, se mancanti, e gli appuntamenti. I riposi qui sotto sono una tua distribuzione del ciclo: nel video Chris li gestisce secondo necessità.</p>${field('Data di partenza', input('start', dayKey(), 'type="date" required'))}<div class="form-grid">${field('Giorni di riposo dopo Gambe A', `<select name="restA">${restOptions}</select>`)}${field('Giorni di riposo dopo Gambe B', `<select name="restB">${restOptions}</select>`)}</div>${field('Quanti cicli', '<select name="repeats"><option value="1">1 ciclo</option><option value="2" selected>2 cicli</option><option value="4">4 cicli</option><option value="8">8 cicli</option></select>')}<div id="ppl-preview" class="cycle-preview"></div>`, async fd => {
    await commit(schedulePpl(state, String(fd.get('start')), Number(fd.get('restA')), Number(fd.get('restB')), Number(fd.get('repeats'))));
    go('home'); toast('Ciclo pianificato. Gli appuntamenti precedenti sono conservati.');
  }, 'Aggiungi schede e calendario');
  function preview() {
    const fd = new FormData(d.querySelector('form'));
    try { const rows = pplDates(String(fd.get('start')), Number(fd.get('restA')), Number(fd.get('restB')), Number(fd.get('repeats')));
      d.querySelector('#ppl-preview').innerHTML = `<p class="helper">${rows.length} giorni di calendario · Anteprima delle prime ${Math.min(24,rows.length)} date</p>${rows.slice(0,24).map(r => `<div class="cycle-day ${r.kind === 'rest' ? 'rest-day' : ''}"><span>${dateFmt(r.date+'T12:00:00')}</span><strong>${r.name}</strong>${state.schedule.some(s=>s.date===r.date) ? '<small>Data già occupata: scegli un’altra partenza.</small>' : ''}</div>`).join('')}`;
    } catch(e) { d.querySelector('#ppl-preview').textContent = e.message; }
  }
  d.addEventListener('change', preview); preview();
}

function libraryPage() {
  const filtered = searchLibraryExercises(state.exercises,libraryQuery,muscle);
  return head('COSTRUISCI IL TUO PERCORSO', 'LIBRERIA ESERCIZI', `${filtered.length} esercizi trovati. I movimenti con modello 3D sono indicati; gli altri hanno fonti e spiegazioni, ma non ancora un'animazione specifica.`, button('new-exercise', 'Nuovo esercizio', 'plus', 'primary')) +
    `<div class="library-filters"><div class="search-field">${icon('search')}<input id="exercise-search" type="search" placeholder="Cerca esercizio o attrezzo…" aria-label="Cerca esercizio" value="${esc(libraryQuery)}"></div><div class="filter-chips">${['', ...MUSCLES].map(m => button('filter-muscle', m || 'Tutti', '', muscle === m ? 'chip active' : 'chip', `data-muscle="${m}"`)).join('')}</div></div><p class="results-count">${filtered.length} esercizi</p><div class="exercise-list">${filtered.map(e => `<button class="exercise-card" data-action="exercise-detail" data-id="${e.id}"><div class="exercise-monogram">${esc(e.muscle.slice(0, 2).toUpperCase())}</div><div class="exercise-copy"><h3>${esc(e.name)}</h3><p>${esc(e.muscle)} <span>·</span> ${esc(e.equipment)} <span>·</span> <strong class="motion-card-status ${motionPresetFor(e.name)?'has-3d':'no-3d'}">${motionPresetFor(e.name)?'3D interattivo':'3D da realizzare'}</strong></p></div>${e.kind==='reference'?badge('CATALOGO'):e.custom?badge('TUO'):''}${icon('chevron')}</button>`).join('')}</div>${!filtered.length ? empty('search', 'Nessun esercizio trovato', 'Prova un’altra ricerca oppure aggiungi il tuo esercizio.') : ''}`;
}

function runnerPage() {
  const s = state.active;
  if (!s) { view = 'plans'; return plansPage(); }
  const stats = sessionStats(s), total = s.exercises.reduce((n, e) => n + e.sets.length, 0);
  return head('IL TUO MOMENTO', esc(s.name), 'Ogni modifica viene salvata sul dispositivo.', button('toggle-pause', s.pausedAt ? 'Riprendi' : 'Pausa', s.pausedAt ? 'play' : 'pause', 'secondary')) +
    `<div class="session-dashboard"><div><span>TEMPO ATTIVO</span><strong id="session-time">${time(elapsed(s))}</strong></div><div><span>SERIE</span><strong>${stats.sets}<small> / ${total}</small></strong></div><div><span>VOLUME</span><strong>${fmt(stats.volume)}<small> kg</small></strong></div></div><div class="session-progress"><div style="width:${total ? stats.sets / total * 100 : 0}%"></div></div>` +
    (s.pausedAt ? `<div class="resume-banner"><strong>Allenamento in pausa</strong><span>Il tempo attivo è fermo.</span></div>` : '') +
    `<div id="rest-panel" class="rest-panel" ${!s.restUntil ? 'hidden' : ''}><div>${icon('clock')}<span>${s.restKind === 'restpause' ? 'REST-PAUSE' : s.restKind === 'transition' ? 'PASSAGGIO' : 'RECUPERO'}</span><strong id="rest-time">00:00</strong></div><div>${button('rest-add', ['restpause','transition'].includes(s.restKind) ? '+5 s' : '+30 s', '', 'small-button')}${button('rest-skip', 'Salta', '', 'small-button')}</div></div>` +
    (s.effortUntil ? `<div class="rest-panel effort-panel" id="effort-panel"><div>${icon('clock')}<span>SERIE IN CORSO</span><strong id="effort-time">00:00</strong></div>${button('effort-stop','Ferma','','small-button')}</div>` : '') +
    `<div class="runner-list">${s.exercises.map((e, i) => {
      const group = [...new Map(s.exercises.filter(r => r.group === e.group).map(r=>[r.exerciseId,r])).values()], groupLabel = group.length === 3 ? 'Tri-set' : 'Superset';
      return `<section class="panel runner-card" id="row-${e.id}">
        <div class="section-head"><div class="runner-title"><span class="exercise-number">${String(i + 1).padStart(2, '0')}</span><div><h2>${esc(e.name)}</h2><p>${esc(e.equipment)} · ${e.rest ? `${e.rest}s recupero` : 'Recupero manuale'} ${e.group ? `· ${groupLabel} ${e.group}` : ''}</p></div></div>${button('swap', icon('swap'), '', 'icon-button', `data-id="${e.id}" aria-label="Sostituisci ${esc(e.name)}" ${e.sets.some(x => x.done) ? 'disabled' : ''}`)}</div>
        ${button('exercise-detail', 'Come si esegue · YouTube', 'play', 'text-button exercise-demo', `data-id="${e.exerciseId}"`)}
        ${e.label ? `<p class="superset-info">${badge(esc(e.label))}</p>` : ''}${e.instructions ? `<p class="superset-info">${esc(e.instructions)}</p>` : ''}
        ${e.warmupSets ? `<p class="superset-info">Indicazione della scheda: ${e.warmupSets} serie di avvicinamento. Registrale con il pulsante qui sotto.</p>` : ''}
        <p class="superset-info">${e.sets.find(x=>x.kind==='working')?.target ? `Range di lavoro: ${esc(e.sets.find(x=>x.kind==='working').target)} ripetizioni. ` : ''}Carico e ripetizioni effettive sono personali. Con meno ripetizioni si usa in genere un carico maggiore; con più ripetizioni, uno minore.</p>
        ${button('add-warmup','+ Serie di avvicinamento','plus','text-button',`data-id="${e.id}" ${s.pausedAt?'disabled':''}`)}
        ${e.targetSeconds ? `<p class="superset-info">Obiettivo: ${e.targetSeconds} secondi per serie. Registra poi le ripetizioni effettive.</p>${button('effort-start',`Avvia serie ${e.targetSeconds}s`,'clock','secondary',`data-id="${e.id}" ${s.pausedAt?'disabled':''}`)}` : ''}
        ${e.group ? `<p class="superset-info">${badge(`${groupLabel.toUpperCase()} ${e.group}`)} ${group.map(r => esc(r.name)).join(' + ')}. ${e.transitionRest ? `Passaggi di ${e.transitionRest}s tra gli esercizi; recupero dopo il giro manuale.` : 'Nessuna pausa programmata tra gli esercizi; recupero dopo il giro completo.'}</p>` : ''}
        ${e.restPauseSeconds ? `<p class="superset-info">${badge('REST-PAUSE')} Pause brevi di ${e.restPauseSeconds}s. Registra le ripetizioni aggiuntive realmente eseguite.</p>` : ''}
        ${e.sameWeight ? '<p class="superset-info">Indicazione del video: mantieni lo stesso peso nelle 10 serie. Registra comunque il carico effettivamente usato.</p>' : ''}
        <div class="set-table"><div class="set-header"><span>SERIE</span><span>KG</span><span>RIP.</span><span>FATTO</span></div>${e.sets.map(set => {
          const suffix = set.kind === 'drop' ? ' drop' : set.kind === 'restpause' ? ' rest-pause' : set.kind === 'warmup' ? ' riscaldamento' : '';
          return `<div class="set-row ${set.done ? 'completed' : ''} ${set.kind !== 'working' ? 'drop-row' : ''}"><span class="set-number">${set.kind === 'drop' ? '<small>DROP</small>' : set.kind === 'restpause' ? '<small>R.P.</small>' : set.kind === 'warmup' ? '<small>RISC.</small>' : set.round + 1}</span><input aria-label="Carico ${esc(e.name)} serie ${set.round + 1}${suffix}" type="number" min="0" max="1500" step="0.5" inputmode="decimal" value="${set.kg}" data-set="${set.id}" data-row="${e.id}" data-property="kg" ${s.pausedAt || set.done ? 'disabled' : ''}><input aria-label="Ripetizioni ${esc(e.name)} serie ${set.round + 1}${suffix}" type="number" min="1" max="1000" step="1" inputmode="numeric" value="${set.reps ?? ''}" placeholder="${esc(set.target ?? 'R.P.')}" title="${set.target ? 'Obiettivo ' + esc(set.target) + ': inserisci le ripetizioni effettive' : 'Ripetizioni effettivamente eseguite'}" data-set="${set.id}" data-row="${e.id}" data-property="reps" ${s.pausedAt || set.done ? 'disabled' : ''}><button class="set-check ${set.done ? 'is-done' : ''}" data-action="complete-set" data-row="${e.id}" data-id="${set.id}" aria-label="${set.done ? 'Annulla' : 'Completa'} serie ${set.round + 1} ${esc(e.name)}${suffix}" aria-pressed="${set.done}" ${s.pausedAt ? 'disabled' : ''}>${icon('check')}</button></div>`;
        }).join('')}</div>
        ${button('manual-rest', e.rest ? 'Timer personalizzato' : 'Avvia un recupero', 'clock', 'text-button', s.pausedAt ? 'disabled' : '')}
        ${e.variableDrops ? button('variable-drop','Aggiungi riduzione','plus','secondary',`data-id="${e.id}" ${s.pausedAt?'disabled':''}`) : ''}
      </section>`;
    }).join('')}</div><div class="session-footer">${button('finish', 'Concludi allenamento', 'check', 'primary')}${button('discard', 'Annulla allenamento', '', 'text-button danger-text')}</div>`;
}

function progressPage() {
  const history = [...state.history].sort((a, b) => b.finishedAt - a.finishedAt);
  const recent = history.slice(0, 8).reverse(), max = Math.max(1, ...recent.map(h => sessionStats(h).volume));
  const filtered = historyExercise ? history.filter(h => h.exercises.some(e => e.exerciseId === historyExercise && e.sets.some(s => s.done))) : history;
  return head('VEDI QUANTA STRADA HAI FATTO', 'I TUOI PROGRESSI', 'Lo storico è tuo, serie dopo serie.') +
    `<section class="panel"><div class="section-head"><h2>PROGRESSIONE CARICHI</h2></div><p class="helper">Aumenti suggeriti solo se completi le serie nel limite alto del range con lo stesso peso. Esempio lat machine: 65 → 70 → 75 kg; aumenta soltanto quando tecnica e recupero lo consentono.</p>${field('Incremento indicativo', `<select id="load-step"><option value="2.5" ${state.settings.loadStep===2.5?'selected':''}>2,5 kg</option><option value="5" ${(state.settings.loadStep??5)===5?'selected':''}>5 kg</option><option value="10" ${state.settings.loadStep===10?'selected':''}>10 kg</option></select>`)}${[...new Set(history.flatMap(h=>h.exercises.map(e=>e.exerciseId)))].map(id=>{ const exercise=state.exercises.find(e=>e.id===id), v=progressionSuggestion(state,id,state.settings.loadStep??5); return v?`<div class="schedule-row"><strong>${esc(exercise?.name||id)}</strong><span>${v.load} kg × ${v.repetitions} → ${v.ready?'Proponi '+v.suggested+' kg':'Mantieni '+v.load+' kg'}${v.maxReps?' · Target alto '+v.maxReps+' rip.':' · Range non disponibile'}</span></div>`:'';}).join('')}</section>` +
    `<div class="stats-grid"><article class="stat-card"><span>Allenamenti totali</span><strong>${history.length}</strong></article><article class="stat-card"><span>Serie registrate</span><strong>${history.reduce((sum, h) => sum + sessionStats(h).sets, 0)}</strong></article><article class="stat-card"><span>Volume totale</span><strong>${fmt(history.reduce((sum, h) => sum + sessionStats(h).volume, 0))}<small> kg</small></strong></article></div>` +
    `<section class="panel"><div class="section-head"><h2>VOLUME NEL TEMPO</h2><span class="muted">Ultimi 8 allenamenti</span></div>${recent.length ? `<div class="bar-chart" role="img" aria-label="Volume degli ultimi allenamenti in chilogrammi">${recent.map(h => `<div class="bar-column"><span>${fmt(sessionStats(h).volume)}</span><div class="bar-track"><div style="height:${Math.max(3, sessionStats(h).volume / max * 100)}%"></div></div><small>${new Date(h.finishedAt).toLocaleDateString('it-IT', { day: 'numeric', month: 'numeric' })}</small></div>`).join('')}</div>` : empty('chart', 'Il primo punto sei tu', 'Completa un allenamento per vedere i progressi.')}</section>` +
    `<div class="section-head spaced"><h2>DIARIO ALLENAMENTI</h2><select id="history-filter" aria-label="Filtra storico per esercizio"><option value="">Tutti gli esercizi</option>${exerciseOptions(historyExercise)}</select></div><div class="history-list">${filtered.map(h => { const stats = sessionStats(h); return `<button class="history-card" data-action="history-detail" data-id="${h.id}"><div class="tile-icon">${icon('check')}</div><div><h3>${esc(h.name)}</h3><p>${dateFmt(h.finishedAt)} · ${Math.round(h.duration / 60)} min · ${stats.sets} serie</p>${historyExercise ? `<p class="gold">${h.exercises.filter(e => e.exerciseId === historyExercise).flatMap(e => e.sets).filter(s => s.done).map(s => `${s.kg} kg × ${s.reps}${setSuffix(s)}`).join(' · ')}</p>` : ''}</div><strong>${fmt(stats.volume)}<small> kg</small></strong>${icon('chevron')}</button>`; }).join('')}</div>${history.length && !filtered.length ? empty('search', 'Nessuna serie registrata', 'Questo esercizio non ha ancora uno storico.') : ''}`;
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
  return head('IL CONTROLLO RESTA A TE', 'IMPOSTAZIONI', 'GymHub 0.1.12 · Panca 3D e traiettoria completa') +
    `<section class="panel settings-panel"><h2>IL TUO PROFILO</h2><form id="profile-form">${field('Come ti chiami?', input('name', state.settings.name, 'required maxlength="100" autocomplete="given-name"'))}<button class="primary" type="submit">Salva nome</button></form></section><section class="panel settings-panel"><h2>I TUOI DATI</h2><p>Salvati solo qui. Android e browser hanno archivi separati: usa il backup per trasferirli. La disinstallazione dell’app o la cancellazione dei dati del browser elimina l’archivio locale.</p><div class="wrap-actions">${button('export', 'Esporta backup', 'download', 'primary')}${button('import', 'Importa backup', 'plus', 'secondary')}</div><input id="import-file" type="file" accept=".json,application/json" hidden></section><section class="panel settings-panel"><h2>FUNZIONI ONLINE</h2><p>Questa versione include allenamento, diario alimentare manuale, ricette, abitudini e progressi. Sincronizzazione tra dispositivi, community, catalogo video e riconoscimento fotografico con AI richiedono servizi aggiuntivi e non sono ancora disponibili.</p><p>Il timer usa l’orologio del dispositivo. Su Android, concedendo le notifiche, può avvisarti a schermo spento; il sistema può ritardare l’avviso. Nel browser l’avviso sonoro funziona mentre la pagina è attiva.</p></section><section class="panel settings-panel"><h2>OPEN SOURCE</h2><p>Codice originale, licenza MIT. Font Manrope e Barlow Condensed con licenza SIL OFL. Nessun codice, video o immagine di STNDRD incluso.</p><p>Nessun account, nessuna pubblicità, nessun pagamento.</p></section>`;
}

function render() {
  const pages = { home: homePage, plans: plansPage, myplans: myplansPage, ppl: pplPage, cbum: cbumPage, library: libraryPage, runner: runnerPage, progress: progressPage, nutrition: nutritionPage, recipes: recipesPage, habits: habitsPage, more: morePage, settings: settingsPage };
  root.innerHTML = shell((pages[view] ?? homePage)()); tick();
}

function modal(title, body, onSubmit, submitLabel = 'Salva') {
  document.querySelector('dialog')?.remove();
  const dialog = document.createElement('dialog');
  dialog.className = 'modal'; dialog.setAttribute('aria-labelledby', 'dialog-title');
  dialog.innerHTML = `<form method="dialog" class="modal-form"><div class="section-head"><h2 id="dialog-title">${title}</h2><button type="button" class="icon-button" data-close aria-label="Chiudi">${icon('close')}</button></div><div class="modal-body">${body}</div><p class="form-error" role="alert"></p>${onSubmit ? `<div class="modal-footer"><button type="button" class="secondary" data-close>Annulla</button><button type="submit" class="primary">${submitLabel}</button></div>` : ''}</form>`;
  dialog.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', async event => { const b=event.target.closest('[data-action]'); if(!b||b.disabled)return; event.preventDefault(); try{ await actions[b.dataset.action]?.(b); }catch(error){toast(error.message||'Operazione non riuscita.',true);} });
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
  modal(existing ? 'MODIFICA ESERCIZIO' : 'NUOVO ESERCIZIO', field('Nome', input('name', existing?.name, 'required maxlength="100"')) + `<div class="form-grid">${field('Gruppo muscolare', `<select name="muscle">${options(MUSCLES, existing?.muscle)}</select>`)}${field('Attrezzo', `<select name="equipment">${options(EQUIPMENT, existing?.equipment)}</select>`)}</div>` + field('Video YouTube (facoltativo)', input('videoUrl', existing?.videoUrl, 'type="url" maxlength="500" placeholder="https://www.youtube.com/watch?v=…"')) + '<p class="helper">Puoi usare anche un link youtu.be o Shorts. Lascia vuoto per usare il tutorial della libreria, se disponibile.</p>' + field('Le tue note', `<textarea name="notes" maxlength="4000" rows="3" placeholder="Impostazioni, riferimenti, indicazioni personali…">${esc(existing?.notes)}</textarea>`), async fd => {
    const videoUrl = youtubeUrl(fd.get('videoUrl'));
    const row = { id: existing?.id ?? uid(), name: text(fd.get('name'), 'Nome'), muscle: fd.get('muscle'), equipment: fd.get('equipment'), notes: String(fd.get('notes')), custom: existing?.custom ?? true, ...(videoUrl ? { videoUrl } : {}) };
    await update(s => { const i = s.exercises.findIndex(e => e.id === row.id); if (i >= 0) s.exercises[i] = row; else s.exercises.push(row); }); toast('Esercizio salvato');
  });
}
function exerciseDetail(id) {
  const reference = findReferenceExercise(id);
  if(reference) {const d=modal(esc(reference.name),'<p>'+badge(reference.muscle)+' '+badge(reference.equipment)+' '+badge('DAL CATALOGO')+'</p>'+motionPanelHtml(reference.name)+'<h3 class="spaced">VIDEO YOUTUBE E FONTI DI SUPPORTO</h3>'+referenceExerciseHtml(reference)+'<p class="helper">Se vuoi inserirlo in una tua scheda, aggiungilo ai tuoi esercizi personali.</p>'+button('add-reference-exercise','Aggiungi ai miei esercizi','plus','primary','data-id="'+reference.id+'"'),null);void mountMotionPanel(d).catch(err=>console.warn('Visualizzatore 3D non disponibile:',err));return;}
  const e = state.exercises.find(x => x.id === id), logs = state.history.filter(h => h.exercises.some(x => x.exerciseId === id && x.sets.some(s => s.done))).slice(-5).reverse();
  if (!e) return;
  const video = exerciseVideo(e);
  const demo = video ? `<section class="video-reference"><p class="eyebrow">COME SI ESEGUE</p><h3>${esc(video.title)}</h3><p>${esc(video.author)} · ${esc(video.note)}</p><a class="primary" href="${esc(video.url)}" target="_blank" rel="noopener noreferrer">${icon('play')} Guarda su YouTube ${icon('arrow')}</a><p class="helper">Si apre su YouTube. Serve una connessione Internet.</p></section>` : `<section class="video-reference"><h3>Trova la dimostrazione</h3><p>Non hai ancora associato un video a questo esercizio. Cercalo su YouTube e salva il link in “Modifica dettagli”.</p><a class="secondary" href="${esc(exerciseVideoSearch(e))}" target="_blank" rel="noopener noreferrer">${icon('search')} Cerca su YouTube ${icon('arrow')}</a></section>`;
  const d = modal(esc(e.name), `<p>${badge(e.muscle)} ${badge(e.equipment)}</p>${motionPanelHtml(e.name)}<h3 class="spaced">VIDEO YOUTUBE DI SUPPORTO</h3>${demo}<p class="preserve-lines">${esc(e.notes || 'Aggiungi le tue note per ritrovarle quando ti alleni.')}</p>${referenceExerciseHtml(matchReferenceExercise(e.name))}<button type="button" class="secondary" id="edit-exercise">${icon('edit')} Modifica dettagli</button><h3 class="spaced">Ultime registrazioni</h3>${logs.length ? logs.map(h => `<div class="detail-row"><strong>${dateFmt(h.finishedAt)}</strong><p>${h.exercises.filter(x => x.exerciseId === id).flatMap(x => x.sets).filter(x => x.done).map(s => `${s.kg} kg × ${s.reps}${setSuffix(s)}`).join(' · ')}</p></div>`).join('') : '<p class="muted">Nessuna serie registrata.</p>'}`, null);
  d.querySelector('#edit-exercise').onclick = () => { d.close(); exerciseForm(e); };
  void mountMotionPanel(d).catch(err=>console.warn('Visualizzatore 3D non disponibile:',err));
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
    d.querySelector('#plan-rows').innerHTML = draft.exercises.map((row, i) => `<div class="plan-editor-row" data-plan-row="${row.id}"><div class="section-head"><strong class="eyebrow">ESERCIZIO ${i + 1}</strong><div class="row-controls"><button type="button" class="small-button" data-move="-1" data-id="${row.id}" ${i === 0 ? 'disabled' : ''} aria-label="Sposta esercizio in alto">↑</button><button type="button" class="small-button" data-move="1" data-id="${row.id}" ${i === draft.exercises.length - 1 ? 'disabled' : ''} aria-label="Sposta esercizio in basso">↓</button><button type="button" class="icon-button" data-remove="${row.id}" aria-label="Rimuovi esercizio">${icon('trash')}</button></div></div><select aria-label="Esercizio ${i + 1}" data-prop="exerciseId">${exerciseOptions(row.exerciseId)}</select><div class="prescription-grid">${[['sets', 'Serie', 1, 20], ['reps', 'Rip.', 1, 100], ['rest', 'Rec. s', 0, 900], ['drops', 'Drop', 0, 3]].map(([key, label, min, max]) => field(label, `<input type="number" value="${row[key]}" min="${min}" max="${max}" step="1" required data-prop="${key}" aria-label="${label} esercizio ${i + 1}">`)).join('')}</div>${field('Massimo ripetizioni (facoltativo)', `<input type="number" min="${row.reps}" max="100" value="${row.repsMax ?? ''}" data-prop="repsMax" placeholder="Es. 12">`)}<div class="form-grid">${field('Rest-pause per serie', `<input type="text" maxlength="80" value="${row.restPause?.join(',') ?? '0'}" data-prop="restPause" placeholder="Es. 1,2">`)}${field('Pausa breve (secondi)', `<input type="number" min="1" max="90" value="${row.restPauseSeconds ?? 15}" data-prop="restPauseSeconds">`)}</div><p class="helper">Rest-pause: 0 per nessuno, 1 per uno in ogni serie, oppure valori separati da virgola (es. 1,2).</p>${field('Gruppo superset', `<select data-prop="group"><option value="">Nessuno · Serie normali</option>${options(['A', 'B', 'C', 'D'], row.group)}</select>`)}</div>`).join('') || '<div class="empty-inline">Aggiungi gli esercizi della tua scheda.</div>';
  }
  const baseDraw = draw;
  draw = () => { baseDraw(); enhancePlanRows(d,draft); };
  d.querySelector('#plan-add').onclick = () => { draft.exercises.push({ id: uid(), exerciseId: state.exercises[0].id, sets: 3, reps: 10, rest: 90, drops: 0, group: '' }); draw(); };
  d.addEventListener('change', e => { const row = draft.exercises.find(r => r.id === e.target.closest('[data-plan-row]')?.dataset.planRow); if (row && e.target.dataset.prop) {
    const prop = e.target.dataset.prop, value = e.target.value;
    if (prop === 'mode') { delete row.targetSeconds; delete row.toFailure; delete row.freeReps; delete row.repsMax; if(value==='reps')row.reps=8;else{row.reps=null;if(value==='time')row.targetSeconds=40;if(value==='failure')row.toFailure=true;if(value==='free')row.freeReps=true;}draw(); }
    else if (prop === 'instructions') row.instructions=value;
    else if (prop === 'warmupSets' && value === '') delete row.warmupSets;
    else if (prop === 'restPause') { const counts = value.split(',').map(v => Number(v.trim())); row.restPause = counts.length === 1 ? Array(row.sets).fill(counts[0]) : counts; row.restPauseSeconds ??= 15; }
    else if (prop === 'repsMax' && value === '') delete row.repsMax;
    else row[prop] = ['exerciseId', 'group'].includes(prop) ? value : Number(value);
    if (prop === 'sets' && row.restPause && Number.isInteger(row.sets) && row.sets >= 1 && row.sets <= 20) { row.restPause = Array.from({length:row.sets}, (_,i) => row.restPause[i] ?? 0); draw(); }
  } });
  d.addEventListener('click', e => { const remove = e.target.closest('[data-remove]'), move = e.target.closest('[data-move]'); if (remove) { draft.exercises = draft.exercises.filter(r => r.id !== remove.dataset.remove); draw(); } if (move) { const i = draft.exercises.findIndex(r => r.id === move.dataset.id), j = i + Number(move.dataset.move); if (j >= 0 && j < draft.exercises.length) { [draft.exercises[i], draft.exercises[j]] = [draft.exercises[j], draft.exercises[i]]; draw(); } } });
  draw();
}

function enhancePlanRows(d,draft) {
  for (const node of d.querySelectorAll('[data-plan-row]')) {
    const row=draft.exercises.find(r=>r.id===node.dataset.planRow), i=draft.exercises.indexOf(row)+1;
    const mode=row.targetSeconds?'time':row.toFailure?'failure':row.freeReps?'free':'reps';
    const control=document.createElement('div');control.className='extra-prescription';
    control.innerHTML=field('Tipo di serie',`<select data-prop="mode" aria-label="Tipo di serie esercizio ${i}"><option value="reps" ${mode==='reps'?'selected':''}>Ripetizioni</option><option value="time" ${mode==='time'?'selected':''}>A tempo</option><option value="failure" ${mode==='failure'?'selected':''}>A cedimento</option><option value="free" ${mode==='free'?'selected':''}>Ripetizioni libere</option></select>`)+(mode==='time'?field('Durata serie (secondi)',`<input type="number" min="1" max="600" value="${row.targetSeconds}" data-prop="targetSeconds" required>`):'')+field('Serie di riscaldamento prima di questo blocco',`<input type="number" min="0" max="10" value="${row.warmupSets??''}" data-prop="warmupSets">`)+field('Istruzioni',`<textarea maxlength="1500" data-prop="instructions">${esc(row.instructions??'')}</textarea>`)+(draft.allowUnevenGroups?field('Giro iniziale superset (0 = primo giro)',`<input type="number" min="0" max="19" value="${row.groupOffset??0}" data-prop="groupOffset">`):'');
    node.append(control);
    if(mode!=='reps') { const input=node.querySelector('[data-prop="reps"]');input.disabled=true;input.required=false;input.value=''; node.querySelector('[data-prop="repsMax"]').closest('.field').hidden=true; }
  }
}

function newPlanChoice() {
  const d = modal('NUOVA SCHEDA', `<p>Scegli da dove partire.</p><div class="plan-choices"><button type="button" class="choice-card" id="blank-plan">${icon('plus')}<span><strong>Parti da zero</strong><small>Scegli tu esercizi, serie e ripetizioni.</small></span>${icon('chevron')}</button><button type="button" class="choice-card" id="reference-plan">${icon('book')}<span><strong>Chris Bumstead · Schiena</strong><small>Sessione verificata, con bicipiti e deltoidi posteriori.</small></span>${icon('chevron')}</button><button type="button" class="choice-card" id="ppl-plan"><span><strong>Split completa · PPL 2019</strong><small>Tutte le sei sedute A/B e il calendario del ciclo.</small></span></button></div><p class="helper">La sessione schiena 2026 è singola. Per tutte le sedute scegli il programma completo PPL 2019, con riposi configurabili.</p>`, null);
  d.querySelector('#blank-plan').onclick = () => { d.close(); planForm(); };
  d.querySelector('#ppl-plan').onclick = () => { d.close(); go('ppl'); };
  d.querySelector('#reference-plan').onclick = () => { d.close(); referenceDetail(); };
}

function referenceDetail() {
  const r = backReference;
  modal('DAL VIDEO · SCHIENA', `<p><strong>${esc(r.title)}</strong><br>${esc(r.author)} · 1 novembre 2026</p><div class="reference-blocks">${r.blocks.map((block, i) => `<article class="reference-block"><span class="eyebrow">BLOCCO ${i + 1}</span><div class="section-head"><h3>${esc(block.title)}</h3>${badge(block.prescription, 'gold-tag')}</div><p>${esc(block.detail)}</p><a class="text-button" href="${r.url}&t=${block.time}s" target="_blank" rel="noopener noreferrer">Guarda da ${Math.floor(block.time / 60)}:${String(block.time % 60).padStart(2, '0')} ${icon('arrow')}</a></article>`).join('')}</div><p class="helper">Serie e intervalli controllati sui cartelli del video; rest-pause controllati anche sul parlato. I recuperi ordinari e tra i giri non sono quantificati: resteranno manuali. Questo è il singolo allenamento pubblico, non l’intero programma dell’app STNDRD.</p>${field('Durata rest-pause (nel video: 10–15 secondi)', '<select name="rpSeconds"><option value="15">15 secondi</option><option value="10">10 secondi</option></select>')}<p class="helper">Con “Aggiungi scheda” crei una copia personale modificabile. Per i rest-pause aggiuntivi registrerai le ripetizioni effettive; per i tri-set vedrai l’obiettivo 8–12.</p>`, async fd => {
    await commit(importBackReference(state, Number(fd.get('rpSeconds'))));
    if (view !== 'myplans') go('myplans');
    toast('Scheda dal video aggiunta. Recuperi ordinari manuali.');
  }, 'Aggiungi scheda');
}

function videoSessionDetail(key) {
  const r=additionalSessions.find(s=>s.key===key);if(!r)return;
  modal(esc(r.cardTitle),`<p><strong>${esc(r.title)}</strong><br>${r.author} · ${dateFmt(r.published+'T12:00:00')}</p><p class="helper spaced">${esc(r.note)}</p><div class="reference-blocks">${r.blocks.map((block,i)=>`<article class="reference-block"><span class="eyebrow">BLOCCO ${i+1}</span><div class="section-head"><h3>${esc(block.title)}</h3>${badge(esc(block.prescription),'gold-tag')}</div><p>${esc(block.detail)}</p><a class="text-button" href="${r.url}&t=${block.time}s" target="_blank" rel="noopener noreferrer">Guarda da ${Math.floor(block.time/60)}:${String(block.time%60).padStart(2,'0')} ${icon('arrow')}</a></article>`).join('')}</div><h3 class="spaced">Completa la tua copia personale</h3><p class="helper">Questi conteggi non sono dichiarati o verificati nella fonte. Sceglili tu: saranno indicati nella scheda come scelte personali. Le ripetizioni non prescritte si registrano durante l’allenamento.</p>${r.requirements.map(q=>field(esc(q.label),`<input name="${q.key}" type="number" min="1" max="20" step="1" required placeholder="Scegli tu">`)+`<p class="helper">${esc(q.reason)}</p>`).join('')}`,async fd=>{
    const choices=Object.fromEntries(r.requirements.map(q=>[q.key,Number(fd.get(q.key))]));await commit(importVideoSession(state,key,choices));if(view!=='myplans')go('myplans');toast('Sessione aggiunta: fonte e scelte personali sono indicate nelle note.');
  },'Aggiungi scheda personale');
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
  'add-reference-exercise': async b=>{const ref=findReferenceExercise(b.dataset.id);if(!ref)throw new Error('Esercizio non trovato.');const existing=state.exercises.find(x=>x.name.toLowerCase()===ref.name.toLowerCase());if(existing){document.querySelector('dialog')?.close();exerciseDetail(existing.id);return;}await update(s=>s.exercises.push({id:uid(),name:ref.name,muscle:ref.muscle,equipment:ref.equipment,notes:'Esercizio da catalogo di riferimento; consulta le dimostrazioni nella libreria.',custom:true}));document.querySelector('dialog[open]')?.close();toast('Esercizio aggiunto alla tua libreria.');},
  'library-program': b => {const p=cbumCatalog.find(x=>x.id===b.dataset.id);if(p)modal(esc(p.title),catalogProgramHtml(p),null);},
  'library-catalog-session': b=>{const html=catalogSessionHtml(b.dataset.id);if(html)modal('LA SEDUTA E LE METODICHE',html,null);},
  'library-hany-session': b=>{const html=hanySessionHtml(b.dataset.id);if(html)modal('ALLENAMENTO · CHRIS CON HANY',html,null);},
  'library-ppl': () => go('ppl'),
  'library-ppl-session': b=>{const html=pplSessionHtml(b.dataset.id,state.exercises);if(html)modal('CHRIS 2019 · '+esc(ppl.sessions.find(x=>x.key===b.dataset.id)?.name),html,null);},
  'library-hany': b=>{const html=b.dataset.id==='fst7'?fst7DetailHtml():hanyProgramHtml(b.dataset.id);if(html)modal('HANY RAMBOD · CHRIS BUMSTEAD',html,null);},
  'library-back': ()=>modal('SCHIENA · SESSIONE 2026', '<p class="helper">'+esc(backReference.title)+'</p>'+backReference.blocks.map((r,i)=>'<div class="detail-row"><strong>'+esc(r.title)+'</strong><p>'+esc(r.prescription)+' · '+esc(r.detail)+'</p><a class="text-button" target="_blank" rel="noopener noreferrer" href="'+esc(backReference.url)+'&t='+r.time+'s">Guarda il video</a></div>').join(''),null),
  'library-video': b=>{const s=additionalSessions.find(x=>x.key===b.dataset.id);if(s)modal(esc(s.cardTitle),'<p>'+esc(s.summary)+'</p>'+s.blocks.map(r=>'<div class="detail-row"><strong>'+esc(r.title)+'</strong><p>'+esc(r.prescription)+' · '+esc(r.detail)+'</p></div>').join('')+'<p class="helper">Video indipendente: dati non documentati non attribuiti a Chris.</p><a class="text-button" target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">Guarda la fonte</a>',null);},
  'library-more-videos': ()=>modal('VIDEO CHRIS · 2026','<p>Petto e schiena (19 marzo) e braccia (30 maggio): sessioni da approfondire, non una split ufficiale unica.</p><a href="https://www.youtube.com/watch?v=o0tT5plmyRI" target="_blank" rel="noopener noreferrer" class="text-button">Petto / schiena</a><p></p><a href="https://www.youtube.com/watch?v=61cBu2XHvRo" target="_blank" rel="noopener noreferrer" class="text-button">Braccia</a>',null),
  'video-session': b=>videoSessionDetail(b.dataset.session),
  'choose-workout': () => { if(state.active) return go('runner'); modal('SCEGLI LA SEDUTA', '<p class="helper">Puoi iniziare da Push, Pull, Legs o da qualunque tua scheda. Se è presente una rotazione pianificata, GymHub riordina le prossime sedute senza eliminare i riposi.</p>'+field('Allenamento', '<select name="planId">'+state.plans.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('')+'</select>'), async fd => { const selected=state.plans.find(p=>p.id===fd.get('planId')); const shifted=rotateWorkoutSchedule(state,selected.id); await commit(startWorkout(shifted,selected)); go('runner'); },'Avvia allenamento'); },
  'plan-detail': b => { const p=state.plans.find(x=>x.id===b.dataset.id); if(!p)return; modal(esc(p.name), '<p class="helper">Anteprima completa: l’allenamento non parte. Ripetizioni e pesi effettivi sono scelti e registrati da te.</p>'+p.exercises.map((r,i)=>{const e=state.exercises.find(x=>x.id===r.exerciseId);return '<div class="detail-row"><h3>'+(i+1)+'. '+esc(e?.name||r.exerciseId)+'</h3><p>'+r.sets+' × '+esc(repTarget(r))+' · '+(r.rest?r.rest+' s recupero':'Recupero libero')+'</p><p>'+([r.warmup?'Riscaldamento':null,r.label,r.group?'Superset / tri-set '+r.group:null,r.drops?'Drop set × '+r.drops:null,r.restPause?.some(n=>n>0)?'Rest-pause':null].filter(Boolean).map(t=>badge(t)).join(' '))+'</p>'+(r.warmupSets?'<p>'+r.warmupSets+' serie di avvicinamento con pesi scelti da te.</p>':'')+(r.instructions?'<p>'+esc(r.instructions)+'</p>':'')+'</div>';}).join('')+'<h3>LEGGI LE TECNICHE</h3><p><strong>Avvicinamento:</strong> prepara il gesto aumentando gradualmente il carico senza affaticarti.</p><p><strong>Back-off:</strong> dopo la serie pesante, riduci il peso per eseguire più ripetizioni.</p><p><strong>Drop set:</strong> riduci il carico e continui senza recupero lungo.</p><p><strong>Rest-pause:</strong> pause brevi tra mini-serie, annotando le ripetizioni reali.</p><p><strong>Superset / tri-set:</strong> due o tre esercizi consecutivi prima del recupero.</p><p><strong>Range e carico:</strong> 5–8 ripetizioni in genere richiedono più carico di 10–15; 10×10 enfatizza il volume, 4×5–8 il lavoro con carichi relativamente maggiori. Conta sempre la tecnica.</p>', null); },
  'import-ppl': async () => { await commit(importPpl(state)); go('plans'); toast('Le sei schede PPL sono disponibili. Le copie già presenti non sono state sovrascritte.'); },
  'schedule-ppl': pplScheduleForm,
  'choose-cycle': () => modal('SCEGLI PROGRAMMA E CICLO', '<p class="helper">Da Oggi scegli il programma da seguire. Schede è solo una biblioteca di consultazione.</p><div class="plan-choices">'+button('activate-ppl','PPL completo 2019 · 6 sedute','book','choice-card')+cbumCatalog.map(p=>button('activate-catalog',esc(p.title)+' · '+p.sessions.length+' giorni','calendar','choice-card','data-id="'+p.id+'"')).join('')+'</div>',null),
  'activate-ppl': () => {document.querySelector('dialog')?.close();pplScheduleForm();},
  'activate-catalog': b => {const id=b.dataset.id;document.querySelector('dialog')?.close();cbumScheduleDialog({id,state,modal,field,input,button,commit,go,toast,dateFmt});},
  'manage-plans': () => go('myplans'),
  'catalog-schedule': b => cbumScheduleDialog({id:b.dataset.id,state,modal,field,input,button,commit,go,toast,dateFmt}),
  'effort-start': async b => { await commit(startEffort(state,b.dataset.id)); effortNotified=null; await syncRest(); },
  'effort-stop': () => update(s=>s.active.effortUntil=null),
  'variable-drop': b => commit(addVariableDrop(state,b.dataset.id)),
  'add-warmup': b => commit(addWarmupSet(state,b.dataset.id)),
  'back-reference': referenceDetail,
  nav: b => go(b.dataset.view),
  'new-plan': newPlanChoice, 'edit-plan': b => planForm(state.plans.find(p => p.id === b.dataset.id)),
  'duplicate-plan': b => update(s => { const p = clone(s.plans.find(p => p.id === b.dataset.id)); p.id = uid(); p.name = (p.name + ' · Copia').slice(0, 100); p.exercises.forEach(e => e.id = uid()); s.plans.push(p); }),
  'delete-plan': b => confirmAction('ELIMINARE LA SCHEDA?', 'Lo storico degli allenamenti già completati resterà disponibile.', () => update(s => { s.plans = s.plans.filter(p => p.id !== b.dataset.id); s.schedule = s.schedule.filter(r => r.planId !== b.dataset.id); }), 'Elimina'),
  start: async b => { const selected=state.plans.find(p=>p.id===b.dataset.id); await commit(startWorkout(rotateWorkoutSchedule(state,selected.id), selected)); go('runner'); },
  resume: () => go('runner'),
  'toggle-pause': async () => { await commit(togglePause(state)); await syncRest(); },
  'complete-set': async b => { await commit(completeSet(state, b.dataset.row, b.dataset.id)); restNotified = null; await syncRest(); },
  'rest-skip': async () => { await update(s => s.active.restUntil = null); await syncRest(); },
  'manual-rest': () => modal('RECUPERO PERSONALE', `<p class="helper">Il video non quantifica questo recupero. Scegli il tempo che vuoi usare: verrà applicato a questo timer.</p>${field('Durata in secondi', input('seconds', state.settings.defaultRest ?? 80, 'type="number" min="1" max="900" required inputmode="numeric"'))}`, async fd => {
    const seconds = number(fd.get('seconds'), 1, 900, 'Recupero');
    if (!Number.isInteger(seconds)) throw new Error('Inserisci secondi interi.');
    if (state.active?.pausedAt) throw new Error('Riprendi prima l’allenamento.');
    await update(s => { s.active.restUntil = Date.now() + seconds * 1000; s.active.restKind = 'recovery'; });
    await syncRest();
  }, 'Avvia timer'),
  'rest-add': async () => { await update(s => s.active.restUntil = Math.max(Date.now(), s.active.restUntil ?? Date.now()) + (['restpause','transition'].includes(s.active.restKind) ? 5000 : 30000)); await syncRest(); },
  swap: b => { const row = state.active.exercises.find(e => e.id === b.dataset.id), candidates = state.exercises.filter(e => e.muscle === row.muscle && e.id !== row.exerciseId); modal('SOSTITUISCI ESERCIZIO', `<p class="helper">La sostituzione vale per questa sessione. La scheda originale resta disponibile.</p>${field('Nuovo esercizio', `<select name="replacement">${[...candidates, ...state.exercises.filter(e => e.muscle !== row.muscle)].map(e => `<option value="${e.id}">${esc(e.name)} · ${esc(e.equipment)}</option>`).join('')}</select>`)}`, fd => commit(swapExercise(state, row.id, fd.get('replacement'))), 'Sostituisci'); },
  finish: () => { if (!sessionStats(state.active).sets) { toast('Registra almeno una serie prima di concludere.', true); return; } confirmAction('UN ALTRO PASSO FATTO.', 'Le serie completate verranno aggiunte al tuo storico. Le serie non completate non conteranno nel volume.', async () => { await commit(finishWorkout(state)); await syncRest(); go('progress'); toast('Allenamento salvato. Bel lavoro!'); }, 'Salva allenamento'); },
  discard: () => confirmAction('ANNULLARE L’ALLENAMENTO?', 'I dati di questa sessione verranno eliminati. Le schede e lo storico resteranno disponibili.', async () => { await update(s => s.active = null); await syncRest(); go('plans'); }, 'Annulla allenamento'),
  'new-exercise': () => exerciseForm(), 'exercise-detail': b => exerciseDetail(b.dataset.id),
  'filter-muscle': b => { muscle = b.dataset.muscle; render(); },
  schedule: () => { if (!state.plans.length) return toast('Crea prima una scheda.'); modal('PIANIFICA ALLENAMENTO', field('Giorno', input('date', dayKey(), 'type="date" required')) + field('Scheda', `<select name="planId">${state.plans.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>`), fd => update(s => { s.schedule = s.schedule.filter(r => r.date !== fd.get('date')); s.schedule.push({ id: uid(), date: String(fd.get('date')), planId: String(fd.get('planId')) }); }), 'Pianifica'); },
  unschedule: b => update(s => s.schedule = s.schedule.filter(r => r.id !== b.dataset.id)),
  'history-detail': b => { const h = state.history.find(h => h.id === b.dataset.id); modal(esc(h.name), `<p>${dateFmt(h.finishedAt)} · ${time(h.duration)} attivi</p>${h.exercises.map(e => { const sets = e.sets.filter(s => s.done); return sets.length ? `<div class="detail-row"><h3>${esc(e.name)} ${e.group ? badge('Superset ' + e.group) : ''}</h3><p>${sets.map(s => `${s.kg} kg × ${s.reps}${setSuffix(s)}`).join(' · ')}</p></div>` : ''; }).join('')}`, null); },
  'add-meal': () => mealForm(), 'food-library': foodLibrary,
  'delete-meal': b => confirmAction('ELIMINARE IL PASTO?', 'Verrà rimosso soltanto dal diario del giorno selezionato.', () => update(s => s.meals = s.meals.filter(m => m.id !== b.dataset.id)), 'Elimina'),
  'default-rest': () => modal('RECUPERO PREDEFINITO', field('Secondi',input('seconds',state.settings.defaultRest??80,'type="number" min="1" max="900" required')),fd=>update(s=>s.settings.defaultRest=number(fd.get('seconds'),1,900,'Recupero')),'Salva'),
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
  const target = event.target;
  if (target.dataset.set && target.value !== '' && target.validity.valid) {
    const value = Number(target.value), key = target.dataset.property;
    if (Number.isFinite(value) && (key !== 'reps' || Number.isInteger(value))) {
      update(s => { const set = s.active?.exercises.find(e => e.id === target.dataset.row)?.sets.find(r => r.id === target.dataset.set); if (set && !set.done) set[key] = value; }, false);
    }
  }
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
    if (target.id === 'load-step') await update(s=>s.settings.loadStep=number(target.value,0.5,50,'Incremento'));
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
  const effort = document.querySelector('#effort-time');
  if (effort && s.effortUntil) { const left=Math.max(0,Math.ceil((s.effortUntil-Date.now())/1000)); effort.textContent=left?time(left):'TERMINATA'; if(!left&&effortNotified!==s.effortUntil){effortNotified=s.effortUntil;beep();toast('Serie a tempo terminata: registra le ripetizioni effettive.');} }
  if (rest && s.restUntil) {
    const left = Math.max(0, Math.ceil((s.restUntil - Date.now()) / 1000)); rest.textContent = left ? time(left) : 'PRONTO';
    if (!left && restNotified !== s.restUntil) { restNotified = s.restUntil; beep(); toast('Recupero terminato'); }
  }
}
setInterval(tick, 250);
window.addEventListener('visibilitychange', () => { tick(); if(document.hidden && state?.active && !state.active.pausedAt) { commit(togglePause(state),false).catch(()=>{}); } });
if (Capacitor.isNativePlatform()) {
App.addListener('appStateChange', ({ isActive }) => { if (!isActive && state?.active && !state.active.pausedAt) commit(togglePause(state),false).catch(()=>{storageError=true;}); else if(!isActive && state) save(state).catch(()=>{storageError=true;}); });
App.addListener('backButton', () => {
  const dialog = document.querySelector('dialog[open]');
  if (dialog) { dialog.close(); return; }
  if (viewStack.length > 1) { viewStack.pop(); view = viewStack.at(-1); render(); window.scrollTo(0, 0); }
  else App.minimizeApp();
});
}
try {
  state = await load(); render();
  if (!Capacitor.isNativePlatform() && import.meta.env.PROD) enableWebUpdates(()=>save(state),message=>toast(message,true),()=>view);
} catch {
  root.innerHTML = `<main class="recovery panel"><h1>PROTEGGIAMO I TUOI DATI.</h1><p>L’archivio non è leggibile. Non è stato sovrascritto. Puoi ripristinare un backup valido.</p><input id="recovery-file" type="file" accept=".json,application/json" aria-label="Ripristina backup"><p id="recovery-error" role="alert"></p></main>`;
  document.querySelector('#recovery-file').onchange = async event => {
    try { const file = event.target.files[0]; if (!file || file.size > 50 * 1024 * 1024) throw new Error('Scegli un backup JSON valido entro 50 MB.'); const restored = validateBackup(await file.text()); if (!window.confirm('Sostituire l’archivio non leggibile con questo backup?')) return; await save(restored); location.reload(); } catch (e) { document.querySelector('#recovery-error').textContent = e.message; }
  };
}
setTimeout(() => { const splash = document.querySelector('#avvio'); splash?.classList.add('via'); setTimeout(() => splash?.remove(), 350); }, Math.max(0, 850 - (performance.now() - (window.gymhubStartedAt ?? 0))));

import { cbumCatalog, catalogDates, scheduleCatalog } from './cbum-catalog.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function cbumCatalogHtml(button) {
 return '<header class="page-head"><div><p class="eyebrow">CATALOGO DOCUMENTATO</p><h1>LE SPLIT DI CHRIS</h1><p class="sub">Consulta il ciclo e collega le tue schede per pianificarlo.</p></div>'+button('nav','Le tue schede','arrow','secondary','data-view="plans"')+'</header>'+
  '<div class="program-grid">'+cbumCatalog.map(program=>'<article class="panel program-session"><p class="eyebrow">CHRIS BUMSTEAD · '+program.year+'</p><h2>'+esc(program.title)+'</h2><p class="helper">'+esc(program.certainty)+'</p><p>'+esc(program.note)+'</p><ol>'+program.sessions.map((session,i)=>'<li><strong>Giorno '+(i+1)+' · '+esc(session.name)+'</strong><span>'+(session.rest?'Recupero':'Allenamento')+'</span></li>').join('')+'</ol><div class="wrap-actions"><a class="text-button" href="'+esc(program.source)+'" target="_blank" rel="noopener noreferrer">Leggi la fonte</a></div></article>').join('')+'</div>'+
  '<section class="panel spaced"><h2>TECNICHE E STILI</h2><p>FST-7: sette serie finali; 10×10/GVT: alto volume; top set + back-off: serie pesanti seguite da carico ridotto; drop set: riduzioni del peso; rest-pause: pause brevi; superset e tri-set: giri di due o tre esercizi. I metodi non sono automaticamente presenti in ogni split.</p><p class="helper">I cicli da 5, 8 e 9 giorni sono distinti. Le informazioni che una fonte non specifica restano da personalizzare.</p></section>';
}
export function cbumScheduleDialog({id,state,modal,field,input,button,commit,go,toast,dateFmt}){
 const program=cbumCatalog.find(p=>p.id===id);
 if(!program)return;
 const optionHtml=state.plans.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join('');
 const mappingFields=program.sessions.map((r,i)=>r.rest?'<div class="cycle-day rest-day"><span>Giorno '+(i+1)+'</span><strong>Riposo</strong></div>':field('Giorno '+(i+1)+' · '+esc(r.name),'<select name="day-'+i+'" required>'+optionHtml+'</select>')).join('');
 const form='<p class="helper">Collega a ogni giornata una scheda tua. Non vengono creati esercizi o carichi attribuiti a Chris. I giorni occupati non verranno sovrascritti.</p>'+
 field('Data di partenza',input('start',new Date().toLocaleDateString('en-CA'),'type="date" required'))+
 field('Numero di cicli','<select name="repeats"><option value="1">1 ciclo</option><option value="2">2 cicli</option><option value="4">4 cicli</option><option value="8">8 cicli</option></select>')+
 '<h3>ASSOCIA LE TUE SCHEDE</h3>'+mappingFields+'<div id="catalog-preview" class="cycle-preview"></div>';
 const d=modal('PIANIFICA '+esc(program.title),form,async fd=>{
  const mapping={};program.sessions.forEach((s,i)=>{if(!s.rest)mapping[i]=String(fd.get('day-'+i));});
  await commit(scheduleCatalog(state,program.id,String(fd.get('start')),Number(fd.get('repeats')),mapping));
  go('home');toast('Ciclo programmato: '+program.title);
 },'Aggiungi il ciclo');
 function preview(){
  const fd=new FormData(d.querySelector('form'));
  try{
   const rows=catalogDates(program,String(fd.get('start')),Number(fd.get('repeats')));
   d.querySelector('#catalog-preview').innerHTML='<p class="helper">'+rows.length+' giorni · anteprima primi '+Math.min(18,rows.length)+'</p>'+rows.slice(0,18).map(r=>'<div class="cycle-day '+(r.rest?'rest-day':'')+'"><span>'+dateFmt(r.date+'T12:00:00')+'</span><strong>'+esc(r.name)+'</strong>'+(state.schedule.some(s=>s.date===r.date)?'<small>Data già occupata</small>':'')+'</div>').join('');
  }catch(error){d.querySelector('#catalog-preview').textContent=error.message;}
 }
 d.addEventListener('change',preview);preview();
}

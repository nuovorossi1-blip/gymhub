// Prescrizioni trascritte per il catalogo di consultazione, mantenendo la provenienza.
// Le schede senza prescrizione documentata NON vengono riempite con numeri supposti.
const e=(name,series='',reps='',method='',note='')=>({name,series,reps,method,note});
const r=(name,method='',note='')=>e(name,'','',method,note);
const source2016='https://simplyshredded.com/21-year-old-beast-chris-bumstead-talks-with-simplyshredded-com.html';
const source2024='https://kylehuntfitness.com/chris-bumstead-workout-and-diet-program-for-2024/';
const session=(title,exercises,methods=[],source='',quality='Fonte secondaria')=>({title,exercises,methods,source,quality});
export const trainingDetails = {
 'cbum-five-2016':[
  session('Schiena',[
   e('Stacchi','4','10 / 8 / 8 / cedimento','Serie a carico variabile'),
   e('Rematore bilanciere','4','12 / 10 / 10 / 8','Cambio presa','Due supine e due prone'),
   e('Lat machine presa larga o trazioni assistite','4','12–15','Superset A'),
   e('Pulldown a braccia tese','4','12–15','Superset A'),
   e('Rematore manubrio','4','15 / 12 / 10 / 10','Piramide'),
   e('Rematore macchina','3','20','Alte ripetizioni'),
   e('Iperestensioni','2','Cedimento','Cedimento')
  ],['Piramidi','Superset','Cedimento'],source2016,'Intervista diretta'),
  session('Petto e bicipiti',[
   e('Panca inclinata manubri','5','15 / 15 / 12 / 12 / 10','Piramide'),
   e('Panca Smith machine','4','12 / 10 / 8 / 8','Piramide'),
   e('Croci inclinate manubri','3','15 / 12 / 12'),
   e('Croci ai cavi','3','15–12','Superset A'),
   e('Piegamenti','3','Cedimento','Superset A · cedimento'),
   e('Curl bilanciere','3','15','Superset B'),
   e('Curl bilanciere presa inversa','3','Cedimento','Superset B · cedimento'),
   e('Curl preacher macchina','3','10–12','Drop set + superset C','Drop sulle serie 2 e 3'),
   e('Hammer curl','2','10 / 8','Superset C')
  ],['Piramide','Superset','Drop set','Cedimento'],source2016,'Intervista diretta'),
  session('Femorali e glutei',[
   e('Leg curl sdraiato','4','15'),
   e('Stacchi a gambe tese','4','15–20'),
   e('Leg curl in piedi','2','4–5','Run-the-rack / drop set'),
   e('Reverse hack squat','4','15–20'),
   e('Glute pushdown unilaterale o kickback','3','12–15')
  ],['Drop set','Run-the-rack'],source2016,'Intervista diretta'),
  session('Spalle e tricipiti',[
   e('Alzate laterali manubri','3','15'),
   e('Shoulder press manubri','3','12','Superset A'),
   e('Alzate frontali bilanciere','3','12','Superset A'),
   e('Deltoidi posteriori al cavo unilaterale','4','20 / 15 / 12 / 12'),
   e('Tirate al mento','3','15 / 12 / 12','Superset B'),
   e('Face pull corda','3','15 / 12 / 12','Superset B'),
   e('Alzate laterali macchina','3','15'),
   e('Dip alla panca','4','12–15','Superset C'),
   e('Skull crusher bilanciere EZ','4','12–15','Superset C'),
   e('Skull crusher presa inversa','4','8–10'),
   e('Kickback al cavo unilaterale','3','12 / 10 / 8')
  ],['Superset','Piramidi'],source2016,'Intervista diretta'),
  session('Quadricipiti',[
   e('Leg extension','3','15'),
   e('Squat · serie pesanti','2','8','Top set'),
   e('Squat · serie alleggerite','6','10–12','Back-off','Volume dopo le due serie pesanti'),
   e('Leg press','4','40 / 30 / 20 / 10','Piramide ripetizioni'),
   e('Leg extension','4','15','Superset A'),
   e('Affondi in piedi','4','6–8','Superset A')
  ],['Top set','Back-off','Piramide','Superset'],source2016,'Intervista diretta')
 ],
 'cbum-olympia-2020':[],
 'cbum-olympia-2023':[
  null,
  session('Petto + tricipiti · esempio documentato',[
    r('Croci ai cavi','Attivazione','Preparazione dei pettorali'),
    r('Panca manubri con inclinazione minima','Controllo','Lavoro con carichi leggeri per la spalla'),
    r('Panca inclinata manubri','Presa neutra e prona','Varianti per comfort articolare'),
    r('Chest press macchina seduta','Progressione del carico'),
    r('Chest press inclinata macchina'),
    r('Chest press declinata macchina'),
    r('Pec deck / croci macchina','Finitura')
  ],['Attivazione','Controllo del ROM','Progressione senza compromettere l’esecuzione'],'https://fitnessvolt.com/CHRIS-BUMSTEAD-CHEST-DAY/','Video resocontato · ripetizioni e serie non quantificate'),
  session('Schiena + bicipiti · esempio documentato',[
    r('Lat machine neutra stretta','Tensione continua','Fermata in basso, movimento controllato'),
    r('Trazioni a corpo libero','Esecuzione completa'),
    r('Rematore bilanciere','Cambio presa','Prima supina, poi prona'),
    r('Rematore manubri su panca inclinata','Petto supportato'),
    r('High row macchina','Remata alta'),
    r('Pullover ai cavi in piedi','Isolamento dorsali'),
    e('Iperestensioni','3–4','','Controllo','Serie indicate come intervallo'),
    r('Calf raise seduto','Complementare')
  ],['Tempo sotto tensione','Controllo','Concentrazione sul muscolo','Cambio presa'],'https://fitnessvolt.com/chris-bumstead-back-training-2023-olympia-prep/','Sessione video resocontata · serie non quantificate salvo iperestensioni'),
  null,null,null,null,null
 ],
 'cbum-offseason-2024':[
  session('Petto, tricipiti e deltoidi posteriori',[
    e('Panca inclinata manubri','4','6–8','Eccentrica lenta','3–4 secondi discesa, 1 secondo fermo'),
    e('Chest press macchina','10','10','German Volume Training · GVT 10×10'),
    e('JM press bilanciere','2','8–10','Tri-set A'),
    e('Dip macchina','2','10–12','Tri-set A'),
    e('Estensione tricipiti sopra la testa al cavo','2','12–15','Tri-set A'),
    e('Estensione tricipiti unilaterale al cavo','3','12–15','Superset B'),
    e('Face pull','3','12–15','Superset B','Fermata in contrazione')
  ],['GVT 10×10','Tri-set','Superset','Eccentriche lente'],source2024,'Ricostruzione da fonte terza'),
  session('Schiena e bicipiti',[
    e('Rematore bilanciere presa supina','4','6–8'),
    e('Rematore manubri petto supportato','10','10','GVT 10×10'),
    e('Curl preacher EZ','4','8–10','Tri-set A'),
    e('Curl EZ presa inversa in piedi','4','10–12','Tri-set A'),
    e('Curl ai cavi dal basso','4','12–15','Tri-set A'),
    e('Pullover macchina','3','10–12','Superset B'),
    e('Curl preacher macchina Fat Gripz','3','12–15','Superset B')
  ],['GVT 10×10','Tri-set','Superset','ROM esteso'],source2024,'Ricostruzione da fonte terza'),
  session('Quadricipiti e polpacci',[
    e('Belt squat','3–4','10–12','Serie convenzionali'),
    e('Pendulum squat','3','10–12','Tri-set A'),
    e('Hack squat','3','10–12','Tri-set A'),
    e('Leg press','3','8–10','Tri-set A'),
    e('Leg extension','3','10–12','Superset B'),
    e('Adductor machine seduto','3','12–15','Superset B'),
    e('Calf raise seduto','3','12–15')
  ],['Tri-set','Superset'],source2024,'Ricostruzione da fonte terza'),
  null,
  session('Spalle',[
    e('Alzate laterali macchina o cavo','4','10–15','Controllo / fermo'),
    e('Shoulder press macchina','4','8–10'),
    e('Reverse pec deck','4','10–12','Superset A'),
    e('Alzate laterali manubri seduto','4','10–12','Superset A'),
    e('Shoulder press manubri seduto','3','10–12')
  ],['Riscaldamento con elastici','Superset','Fermate in contrazione'],source2024,'Ricostruzione da fonte terza'),
  session('Braccia',[
    e('Estensioni tricipiti corda sopra la testa','4','10–12','Tri-set A'),
    e('Skull crusher al cavo su panca declinata','4','10–12','Tri-set A'),
    e('Pushdown corda','4','10–12','Tri-set A'),
    e('Curl preacher EZ presa inversa','4','8–10','Tri-set B'),
    e('Curl manubri inclinati presa larga','4','10–12','Tri-set B'),
    e('Curl preacher macchina','4','10–12','Tri-set B'),
    e('Dip alla macchina','2','10–12','Superset C'),
    e('Dip parallele a corpo libero','2','Cedimento','Superset C'),
    e('Hammer curl in piedi','3','10–12')
  ],['Tri-set tricipiti','Tri-set bicipiti','Superset','Cedimento'],source2024,'Ricostruzione da fonte terza'),
  session('Petto e schiena',[
    e('Panca inclinata manubri','4','10–12','Superset A'),
    e('Lat machine presa supina','4','10–12','Superset A'),
    e('Rematore T-bar petto supportato','4','10–12','Superset B'),
    e('Chest press inclinata macchina','4','10–12','Superset B'),
    e('Croci inclinate macchina','4','10–12','Superset C'),
    e('Pullover macchina','4','10–12','Superset C'),
    e('Crunch ai cavi in piedi','3','15–20')
  ],['Superset petto/schiena antagonisti'],source2024,'Ricostruzione da fonte terza'),
  session('Femorali, glutei e polpacci',[
    e('Abductor machine seduto','3','10–12','Tri-set A'),
    e('Leg curl seduto','3','10–12','Tri-set A'),
    e('Adductor machine seduto','3','10–12','Tri-set A'),
    e('Hip thrust macchina plate-loaded','3','10–12'),
    e('Stacco a gambe tese bilanciere','3','6–8'),
    e('Leg curl sdraiato','3','10–12'),
    e('Calf raise in piedi','3','10–12')
  ],['Tri-set','Serie tradizionali'],source2024,'Ricostruzione da fonte terza'),
  null
 ]
};
export const hanyPreparations={
 hany2022:{
  title:'Olympia 2022 · Inizio con Hany',
  coach:'Hany Rambod',date:'Ottobre 2022',
  summary:'Il passaggio a Hany avviene a preparazione già avviata: la split settimanale completa non è verificata dalle fonti disponibili. È verificabile la seduta Petto e tricipiti.',
  cycle:['Petto e tricipiti · seduta documentata','Altri giorni · split completa non pubblicata'],
  methods:['FST-7 introdotto in alcune sessioni','Press e squat pesanti conservati','Tensione e tecnica'],
  sessions:[session('Petto e tricipiti · il primo allenamento con Hany',[
    r('Chest press inclinata plate-loaded','Press pesante'),
    r('Panca inclinata manubri','Press pesante'),
    r('Panca manubri presa neutra','Controllo / presa neutra'),
    r('Chest press Hammer Strength','Press su macchina'),
    r('Pec deck inclinata','Isolamento'),
    r('Croci ai cavi','Isolamento'),
    r('Pushdown Hammer Strength','Tricipiti'),
    r('Pushdown tricipite unilaterale presa inversa','Tricipiti')
  ],['FST-7 aggiunto nel periodo: non attribuire le 7 serie a un esercizio senza verifica','Press pesanti'],'https://www.youtube.com/watch?v=580XwXxl3YQ','Elenco esercizi resocontato · serie e ripetizioni non pubblicate')]
 },
 hany2024:{
  title:'Olympia 2024 · Preparazione con Hany',
  coach:'Hany Rambod',date:'Luglio 2024',
  summary:'La seduta femorali/glutei/polpacci è documentata. Non è corretto sostituire la split off-season con Justin King alla preparazione agonistica con Hany.',
  cycle:['Gambe posteriori + glutei + polpacci · seduta documentata','Altri giorni · split di preparazione non verificata'],
  methods:['Eccentriche di tre secondi','Pause in allungamento','Parziali in allungamento','Ripetizioni forzate quando documentate','FST-7 calf raise seduto'],
  sessions:[session('Femorali, glutei e polpacci · Hany 2024',[
    r('Leg curl in piedi','ROM completo e ripetizioni assistite'),
    r('Leg curl sdraiato','Eccentrica 3 secondi e fermata in allungamento'),
    r('Belt squat','Busto verticale e profondità'),
    r('Bulgarian split squat manubrio','Controllo e ROM profondo'),
    r('Hip thrust alla macchina','Pause sopra e sotto; parziali finali'),
    e('Calf raise seduto','7','','FST-7','Sette serie finali; ripetizioni e recupero esatti non indicati')
  ],['FST-7 documentato nei polpacci','Eccentrica controllata','Ripetizioni forzate','Parziali in allungamento'],'https://barbend.com/news/chris-bumstead-hany-rambod-hamstring-glute-training/','Resoconto di sessione, non una split completa')]
 }
};
export const fstMethod={
 name:'FST-7',
 description:'Sette serie in sequenza su un esercizio scelto, tipicamente al termine del lavoro principale. Non equivale a sette serie su ogni esercizio, né a una split settimanale.',
 points:['Serie: 7 solo sugli esercizi per cui la fonte conferma FST-7.','Recupero: ridotto, ma l’esatto tempo va confermato per la specifica seduta.','Ripetizioni e carico: variabili secondo movimento e fase, mai inventati.','La teoria sullo stretching della fascia è una proposta del metodo, non un meccanismo di crescita dimostrato.'],
 example:'Olympia 2024: calf raise seduto con protocollo FST-7.',
 source:'https://barbend.com/news/chris-bumstead-hany-rambod-hamstring-glute-training/'
};

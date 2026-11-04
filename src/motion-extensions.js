// Library movement types. Deliberately no blanket "any squat/any curl"
// matching: a variation needs a corresponding movement geometry.
const preset=(title,muscles,summary,cue,yes,no,shape)=>({title,muscles,summary,cue,do:yes,dont:no,...shape});
export const extendedPresets={
 squat:preset('Back squat · bilanciere','Quadricipiti · glutei · adduttori','Il bilanciere segue il sistema corpo-carico: la discesa deriva da flessione di anche e ginocchia.',
 'Piedi circa larghezza spalle · ginocchia nella direzione delle punte · carico stabile sul mesopiede',
 ['Sistema il bilanciere sulla parte alta della schiena, non sul collo; mantieni il busto compatto.','Piega anche e ginocchia insieme e lascia che le ginocchia seguano la direzione delle punte.','Scendi entro la profondità che riesci a controllare, mantenendo i piedi ben appoggiati.','Risalendo spingi il pavimento e mantieni bilanciere e corpo in equilibrio sul mesopiede.'],
 ['Non lasciare che i talloni si sollevino o che il peso ti porti in avanti.','Non forzare profondità o postura identiche per persone con proporzioni diverse.','Evita di perdere tensione e controllo del tronco nella parte bassa.'],{shape:'standing',equipment:'barbell',path:'squat'}),
 curl:preset('Curl bilanciere · in piedi','Bicipite brachiale · brachiale','Il gomito è il perno principale: il bilanciere descrive un arco, non una spinta delle spalle.',
 'Gomiti vicino ai fianchi · polsi neutri · movimento controllato',
 ['Mantieni piedi stabili e presa supina alla larghezza comoda delle spalle.','Fletti il gomito portando il bilanciere verso la parte alta del busto senza spostare le spalle avanti.','Abbassa lentamente fino a un’estensione del gomito comoda, senza rilassare bruscamente.'],
 ['Non dondolare il busto per usare slancio.','Non portare i gomiti molto avanti per finire ogni ripetizione.','Non piegare eccessivamente i polsi.'],{shape:'standing',equipment:'barbell',path:'curl'}),
 press:preset('Shoulder press · manubri','Deltoidi · tricipiti','Spinta verticale controllata: i pesi salgono sopra le spalle, senza accentuare l’iperestensione lombare.',
 'Manubri all’altezza delle spalle · avambracci verticali · addome attivo',
 ['Stai seduto o in piedi in assetto stabile; questo schema mostra la variante in piedi.','Parti con i manubri poco fuori dalle spalle e avambracci sotto i pesi.','Spingi sopra la testa mantenendo il tronco compatto e una traiettoria confortevole per la spalla.','Scendi lentamente fin dove puoi conservare la posizione di polsi e spalle.'],
 ['Non inarcare la zona lombare per completare la salita.','Non urtare i manubri sopra la testa.','Non forzare il gomito dietro la linea del corpo se provoca dolore.'],{shape:'standing',equipment:'dumbbells',path:'overhead'}),
 row:preset('Rematore bilanciere · busto flesso','Gran dorsale · romboidi · trapezio','Traiettoria del bilanciere verso il basso torace/addome, mantenendo la posizione d’anca.',
 'Anche indietro · schiena neutra · tirata verso il busto',
 ['Tieni il bilanciere vicino alle gambe e inclina il busto mediante un hip hinge.','Stabilizza addome e colonna, con ginocchia leggermente flesse.','Tira il bilanciere verso l’addome o la zona bassa del torace muovendo i gomiti indietro.','Riabbassa in controllo senza cambiare significativamente inclinazione del tronco.'],
 ['Non arrotondare o iperestendere la schiena per spostare più carico.','Non trasformare la tirata in uno slancio forte del busto.','Non lasciare le spalle salire verso le orecchie ad ogni ripetizione.'],{shape:'standing',equipment:'barbell',path:'row'}),
 lat:preset('Lat machine · presa larga','Gran dorsale · grande rotondo · bicipiti','La barra scende verso la parte alta del petto; il busto rimane sostanzialmente stabile.',
 'Presa poco oltre le spalle · gomiti verso il basso · petto alto',
 ['Regola seduta e blocchi delle cosce; tieni piedi stabili e colonna neutra.','Afferra la barra a larghezza confortevole e inizia il movimento abbassando le scapole.','Guida i gomiti verso il basso portando la barra verso la parte alta del torace.','Ritorna lentamente verso l’alto senza perdere il controllo delle spalle.'],
 ['Non tirare la barra dietro il collo.','Non dondolare il busto per accelerare il peso.','Non tirare troppo in basso sacrificando spalle e polsi.'],{shape:'seated',equipment:'cable',path:'lat'}),
 legextension:preset('Leg extension · macchina','Quadricipiti','Estensione del ginocchio alla macchina: la caviglia disegna un arco mentre la coscia resta appoggiata.',
 'Asse del ginocchio allineato a quello della macchina · movimento controllato',
 ['Regola seduta e schienale per allineare il ginocchio all’asse della macchina.','Sistema il rullo sull’area bassa della tibia, senza appoggiarlo sul piede.','Estendi il ginocchio lentamente nel range confortevole e torna senza lasciar cadere il peso.'],
 ['Non sollevare i glutei dalla seduta.','Non usare slanci o colpi sul fine corsa.','Non forzare il range se senti dolore al ginocchio.'],{shape:'seated',equipment:'machine',path:'legextension'}),
};
const clean=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function extendedPresetFor(name){
 const n=clean(name);
 if(/jm press|panca/.test(n))return null;
 if(/^(squat|back squat|squat bilanciere|squat con bilanciere|squat · serie)/.test(n)&&!/front|hack|belt|pendulum|smith|bulgar|reverse/.test(n))return 'squat';
 if(/^(curl bilanciere|curl con bilanciere|barbell curl|curl ez|curl bilanciere ez)/.test(n)&&!/invers|preacher|panca|declin/.test(n))return 'curl';
 if(/^(shoulder press manubri|shoulder press|distensioni spalle manubri)/.test(n)&&!/alternat|macchin|sedut|smith|cav/.test(n))return 'press';
 if(/^(rematore bilanciere|rematore con bilanciere|barbell row)/.test(n)&&!/presa supina|busto flesso alla macchina|smith/.test(n))return 'row';
 if(/^(lat machine(?: presa larga)?|lat pulldown(?: presa larga)?|pulldown presa larga)$/.test(n))return 'lat';
 if(/^(leg extension|leg extensions)/.test(n))return 'legextension';
 return null;
}

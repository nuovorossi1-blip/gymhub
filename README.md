# GymHub

Il tuo spazio per allenarti. Android e browser, open source, senza abbonamento.

[Apri GymHub nel browser](https://gymhub.redapp.dev/) · [APK di anteprima](https://github.com/nuovorossi1-blip/gymhub/releases)

Dominio pubblico: `gymhub.redapp.dev`, collegato a GitHub Pages tramite CNAME con proxy Cloudflare e HTTPS pubblico verificato. Il cambio di indirizzo non trasferisce automaticamente i dati locali del browser: esportare il backup dall'indirizzo precedente e importarlo sul nuovo. I dati dell'APK Android restano nel proprio archivio.

**Prima versione 0.1, non ancora equivalente a tutte le funzioni di STNDRD.** Codice e grafica originali; non include codice decompilato, contenuti, video o immagini di altre app. Grafica AI-OS: grafite, oro, Manrope e Barlow Condensed inclusi nell'app.

## Aggiornamento web 0.1.5

- **Schede:** visualizza tutti gli esercizi e apri una scheda in sola lettura, con legenda di riscaldamento/avvicinamento, back-off, drop set, rest-pause, superset e tri-set. La lettura non avvia il timer.
- **Oggi:** scegli la seduta e riordina le prossime date di allenamento secondo la rotazione esistente, senza cancellare gli appuntamenti di riposo. Puoi decidere di allenarti anche in un giorno segnato come riposo.
- **Sessione:** aggiungi serie di avvicinamento con ripetizioni e carichi personali. Si conservano nello storico, ma non nel conteggio del volume delle serie di lavoro. L'app passa in pausa quando viene lasciata in background, poi consente una ripresa esplicita.
- **Recuperi:** il timer personale propone 80 secondi, valore modificabile da Oggi; durante ogni sessione puoi scegliere una durata diversa.
- **Progressi:** ultimo carico e proposta di incremento 2,5/5/10 kg soltanto quando sono state registrate ripetizioni sufficienti rispetto al massimo del range. Non e' una prescrizione automatica.
- **Chris Bumstead:** split off-season 2024 di nove giorni riportata come riferimento esterno; video ufficiali 2026 petto/schiena e braccia con link. Per questi nuovi riferimenti non sono stati inventati programmi o carichi da importare.

Questo aggiornamento riguarda il sito web; l'APK pubblico precedente rimane una build distinta finché non viene pubblicata una release Android verificata.

## Funzioni disponibili

- Versione 0.1.4: in **Schede**, oltre alla schiena, due sessioni video indipendenti: **Petto, spalle e tricipiti** (15/08/2026) e **Gambe e polpacci** (01/04/2026). Ogni scheda ha fonte e minutaggi propri. Prima di importare, i conteggi non dichiarati vanno scelti personalmente; le ripetizioni non prescritte si registrano durante l'allenamento. I tre video 2026 non formano una settimana ufficiale unica. Dettagli e limiti in [FONTI-SESSIONI-2026.md](FONTI-SESSIONI-2026.md).
- Libreria iniziale di 26 esercizi; nuovi esercizi, gruppo muscolare, attrezzo e note personali.
- Versione 0.1.2: apri un esercizio e scegli “Guarda su YouTube”. Tutorial diretti per i 26 esercizi iniziali e collegamenti ai blocchi del video originale per gli otto esercizi della sessione Chris. Disponibili anche durante l'allenamento. Link personale modificabile e conservato nei backup; per gli esercizi nuovi senza video è disponibile una ricerca YouTube esplicitamente indicata.
- “Nuova scheda” permette di partire da zero, dalla sessione Chris · Schiena2026 o dal PPL completo2019. “Pianifica la settimana” assegna schede singole; “Pianifica il ciclo” distribuisce tutte le sei sedute e i riposi.
- Creazione, modifica, riordino, duplicazione e cancellazione delle schede; calendario settimanale.
- Versione 0.1.3: programma completo PPL di Chris Bumstead dal video ufficiale del 21/11/2019, con tutte le sei sedute Push A/Pull A/Gambe A/Push B/Pull B/Gambe B. Fonte e minutaggi in Schede → Apri la split completa. Importazione delle sei schede senza sovrascrivere copie esistenti; calendario con riposi scelti dall'utente e controllo conflitti.
- Serie a tempo (40s nel programma), timer visivo persistente, cedimento/ripetizioni libere, back-off, superset con giri sfalsati, drop nell'ultima serie e run-the-rack con riduzioni registrate a scelta. Nessun numero di ripetizioni effettive inventato per tempo o cedimento. Riscaldamenti e alternative sono esplicitati nelle istruzioni.
- Serie, ripetizioni, carichi, superset (gruppi A–D) e fino a tre drop per serie principale.
- Versione 0.1.1: intervalli di ripetizioni, tri-set riconosciuti come gruppi di tre esercizi, rest-pause con conteggi diversi per serie e timer breve separato dai drop set.
- Riferimento video pubblico “This Back Workout Won Me 6 Olympias” di Chris Bumstead, con minutaggi e creazione di una copia personale. Dati controllati sui cartelli originali e sui sottotitoli; nessun video o fotogramma distribuito. I recuperi ordinari non indicati rimangono manuali. Le ripetizioni effettive nei range e nei rest-pause vanno registrate, non sono inventate.
- Timer di recupero dopo un giro completo di superset o l'ultimo drop; aggiunta di 30 secondi e salto.
- Sostituzione di un esercizio prima di registrarne le serie; la scheda e lo storico rimangono indipendenti.
- Pausa e ripresa, anche dopo chiusura e riapertura. La pausa esclude il tempo dal totale attivo e annulla il recupero.
- Storico, filtro per esercizio e grafico del volume. Volume = somma di kg × ripetizioni delle serie completate, inclusi i drop. Il peso corporeo non è stimato.
- Diario alimentare manuale per data, alimenti con valori per 100 g, ricette e porzioni, calorie e macronutrienti.
- Obiettivo calorico facoltativo inserito dall'utente, senza prescrizioni automatiche.
- Abitudini quotidiane, giorni consecutivi e traguardi basati sugli allenamenti completati.
- Esportazione/importazione JSON validata. Su Android si usa la condivisione del sistema; nel browser il download.
- Utilizzo offline; su Android le risorse sono nell'APK, nel browser sono memorizzate dopo la prima apertura online.

I video si aprono su YouTube, richiedono Internet e possono contenere audio in inglese e pubblicità del fornitore. I tutorial di base sono di ScottHermanFitness, PureGym e Planet Fitness; autore e variante sono indicati prima di aprire il link. Non sono video scaricati o incorporati nell'app. La navigazione su YouTube è soggetta alle condizioni del servizio esterno.

Il PPL 2019 è una rotazione di sei sedute, non una settimana lunedì–domenica prefissata: nel video Chris inserisce riposi quando ne sente necessità. “Pianifica il ciclo” permette una distribuzione personale (per esempio una pausa dopo ciascuna terna); questa distribuzione non viene attribuita a Chris. La sessione schiena2026 rimane una fonte separata. I nuovi esercizi specifici del PPL collegano alla spiegazione del programma nel video, indicata come tale, non a un tutorial pratico isolato. Il timer delle serie è visivo; gli avvisi in background riguardano il timer di recupero.

## Limiti attuali

Non ancora implementati: account e sincronizzazione cloud, community/pods, assistenza automatizzata, catalogo di programmi/video, scanner codici a barre ed etichette, riconoscimento foto con AI, raccomandazioni di programmi e piani nutrizionali automatici. La presenza di nomi nell'APK di riferimento non basta a ricostruirne formule e comportamento: servono specifiche e prove dei singoli flussi.

Le notifiche del recupero Android richiedono il consenso. Non è richiesto il permesso per allarmi esatti: il sistema può ritardare l'avviso a schermo spento. Nel browser il suono dipende dalle impostazioni di riproduzione e dalla pagina attiva. Il conteggio visivo usa una scadenza assoluta e viene aggiornato al ritorno nella pagina.

Android e ogni browser conservano archivi separati. Per trasferire i dati si esporta e importa il backup. Disinstallazione/cancellazione dati del browser elimina l'archivio: conservare backup esterni. Nessun dato è inviato a un server dall'app; il sito riceve soltanto le normali richieste delle risorse statiche. I backup JSON non sono cifrati.

## Sviluppo

Node 22.19+ (testato 22.23.2), npm. Nessuna variabile segreta o file `.env` necessario.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
npm run test:e2e
```

I test browser usano Microsoft Edge su Windows. In CI usano Chromium: `npx playwright install --with-deps chromium`. Screenshot a 412 px e 1440 px vengono salvati in `artifacts/screenshots/` (non versionati).

Il sito funziona anche sotto un sottopercorso, per esempio GitHub Pages. La pipeline verifica il dominio, i flussi nel browser e pubblica la cartella `dist`.

## Android

JDK 21, Android SDK configurato tramite `ANDROID_HOME` (API 36) e permessi/licenze già accettati.

```sh
npm run android:sync
cd android
./gradlew assembleDebug
```

Su Windows usare `gradlew.bat`. APK in `android/app/build/outputs/apk/debug/app-debug.apk`. È una build di anteprima firmata con la chiave debug locale, non una release Play Store. Le build CI hanno una chiave debug diversa e non aggiornano direttamente la build locale: esportare il backup prima di cambiare provenienza dell'APK.

## Licenze

Codice MIT. Manrope e Barlow Condensed: SIL Open Font License, testi in `public/fonts/OFL-*.txt`. Dipendenze con le rispettive licenze. Icone GymHub disegnate nel codice del progetto. Nessuna affiliazione con STNDRD.

## Aggiornamento 0.1.6 — catalogo split documentate
Da Schede → Apri il catalogo split: quattro programmi storici di Chris Bumstead (5 sedute 2016, Olympia 2020 su 8 giorni, Olympia 2023 su 8 giorni, off-season 2024 su 9 giorni). Schede e cicli sono consultabili senza avviare un allenamento. Il calendario permette di associare una propria scheda a ciascuna seduta e di programmare 1, 2, 4 o 8 rotazioni, mantenendo i giorni di riposo documentati. Le date occupate non vengono sovrascritte. Il programma non inventa prescrizioni: dove le fonti non documentano serie, ripetizioni e carichi, vanno definiti dall'atleta nelle proprie schede. Le fonti e il livello di certezza sono indicati nelle card. Programmi a pagamento STNDRD non copiati. Il PPL 2019 già verificato rimane indipendente. Test di dominio e browser includono cicli, conflitti e mobile da 320px.

## GymHub 0.1.7 — Biblioteca periodizzata e Oggi operativo

La sezione **Schede** e' esclusivamente una biblioteca per studiare i programmi, gli allenamenti e le metodiche di Chris Bumstead, ordinata per epoca e coach: Iain Valliere (origini, 2019 PPL, Olympia 2020), Hany Rambod (dal 2022, 2023 Olympia e FST-7 specifico), off-season 2024 con il contributo di Justin King e video singoli 2026. Per 2019 il percorso e' Schede -> PPL 2019 con Iain Valliere -> Push A/Pull A/Gambe A/Push B/Pull B/Gambe B -> serie, ripetizioni, gruppi, istruzioni, tecniche e fonte, senza iniziare allenamenti. Le split incomplete non ricevono numeri inventati e i metodi non sono attribuiti indiscriminatamente.

**Oggi** e' la sezione delle azioni: Scegli split e ciclo -> PPL 2019 o rotazioni storiche; numero di cicli, giorni di riposo, calendario e dati personali. Gestisci le mie schede -> crea, modifica, duplica, cancella, importa sessioni documentate e avvia. I backup/storici rimangono locali e non vengono sovrascritti. La vista mobile e' responsive, con verifica a 320 e 390px. Nelle prove automatizzate si controllano navigazione gerarchica, consulta-senza-avvio, programmazione PPL, vincoli del calendario, sessioni video, timer, progressi e riapertura.

## 0.1.8 — Sedute complete nella biblioteca Chris
La biblioteca ora presenta ogni preparazione attraverso la gerarchia: programma/coach → rotazione/split → giornata → esercizi + serie/ripetizioni + metodiche e fonte. Storica 2016: cinque sedute complete dall'intervista diretta. PPL 2019: sei sedute già complete dal video. Olympia 2023: rotazione otto giorni e sedute documentate petto e schiena; i giorni non ricostruibili sono esplicitamente segnalati. Olympia 2022 con Hany: otto esercizi nella seduta petto/tricipiti pubblicata, non una falsa rotazione completa. Olympia 2024 con Hany: sei esercizi femorali/glutei/polpacci, FST-7 confermato soltanto per calf raise seduto (7 serie), eccentriche e parziali come documentato; distinta dalla off-season Justin King. Off-season 2024: ricostruzione secondaria di sette sedute con esercizi, serie, ripetizioni e GVT 10×10, tri-set e superset. Olympia 2020: sequenza nota ma prescrizioni esercizi non verificate, quindi non inventate. Le sessioni e le metodiche non si attivano da Schede, soltanto Oggi gestisce rotazione e schede personali. Fonti consultabili nella singola scheda; dati locali/backup invariati.

## GymHub 0.1.9 — Libreria esercizi e dimostrazioni
La libreria Esercizi mostra le schede personali e una collezione indicizzata di movimenti dalle preparazioni Chris 2016/2019/2022/2023/2024/2026, senza importare automaticamente nuovi elementi nel salvataggio utente. Ricerca per nome, attrezzo, muscolo e sinonimi (es. JM Press bilanciere, Barbell JM Press, JM Blakley press). Ogni esercizio di catalogo si puo' aprire in sola lettura, consultare le fonti e aggiungere esplicitamente ai propri esercizi. I video specifici gia' verificati sono collegati ai movimenti, con apertura esterna; per la JM Press sono disponibili spiegazione tecnica italiana, video originale Chris, guida animata Weight Training Guide, articolo/video dell'inventore su EliteFTS. Le animazioni openGym sono protette da licenza limitata e non vengono copiate; wger e' un'alternativa open-source con licenze media per singola voce. Non sono state incorporate immagini o animazioni di terzi. Le schede utente, lo storico, backup e riprese rimangono intatti. Test per sinonimi, licenze, aggiunta manuale, salvataggio e visualizzazione mobile.

## GymHub 0.1.10 — Primo visualizzatore 3D interattivo nella libreria Esercizi
L'apertura delle schede Panca piana e JM Press mostra un originale modello 3D schematico costruito con Three.js/WebGL, reso localmente anche offline: corpo sdraiato, panca, bilanciere animato e traiettoria evidenziata. L'utente puo avviare e mettere in pausa, scegliere 0.25x, 0.5x, 1x o 1.5x, ruotare con mouse/touch, zoomare e selezionare viste frontale, laterale e 3/4. Accanto su desktop si leggono presa, polsi, scapole, gomiti, punto di discesa e indicazioni 'cosa fare' e 'cosa evitare'; su mobile il pannello tecnico e' sotto l'animazione. I video YouTube e le fonti rimangono sotto, come supporto. Per la panca la traiettoria scende verso lo sterno medio-basso; per la JM Press la barra va verso la zona del mento senza toccare collo/viso. Le geometrie sono illustrative e non forniscono misure biomeccaniche personalizzate. Nessun modello multimediale esterno e' incorporato o ridistribuito: geometria 3D e animazione create dall'app. Per esercizi senza traiettoria validata viene mostrato un avviso e si conservano le fonti/video, non un movimento generico scorretto. Codice del viewer caricato dinamicamente solo alla sua apertura; la libreria funziona senza connessione. I dati locali/storico non sono mutati. Test su dettagli Panca/JM, play/pause, cambio vista, selezione velocita, mobile 320 px e assenza di falsa animazione.

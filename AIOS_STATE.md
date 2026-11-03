# GymHub · stato del progetto

Avvio: 03/11/2026. Richiesta: app indipendente Android e browser, funzioni di riferimento STNDRD senza abbonamento, grafica AI-OS.

Il repository contiene implementazione originale. Gli APK di riferimento restano fuori dal repository. Nessun contenuto o codice estratto è incluso.

Stato: PRIMA VERSIONE VERIFICATA, copertura complessiva PARZIALE. Funzioni disponibili e mancanti sono elencate nel README e nella schermata Impostazioni. Non dichiarare parità completa con l'app di riferimento.

Architettura: Vite/JavaScript + Capacitor 8; stato locale tramite Preferences; notifiche locali Android; Filesystem/Share per backup nativo. UI e dominio separati. Nessun account, backend o chiave API.

Verifiche 03/11/2026: 9/9 test dominio Node; 3/3 flussi Playwright con Edge a 412 px e desktop 1440 px, inclusi superset/drop, sostituzione, chiusura/ripresa, diario e ricette, abitudini, export/import e riapertura offline. CI iniziale su Chromium: build e test passati. Screenshot ispezionati. Audit npm: zero vulnerabilità dopo override glob ^14.0.2 nella catena della CLI Capacitor.

Android: assembleDebug con JDK 21 riuscito. Emulatore API37, WebView 411 px: registrazione 40 kg × 8, pausa, force-stop del solo pacchetto di prova, riavvio e ripresa, storico 320 kg; backup creato tramite Filesystem e condivisione invocata. Test nativo scripts/native-smoke.mjs. Notifica temporizzata in background e telefono fisico non verificati. Barriera di inizializzazione nel test necessaria per il debug WebView; click forzati per evitare attese requestAnimationFrame inaffidabili nell'emulatore headless.

Correzioni verificate: cache offline per file statici con Vary: Origin (ignoreVary nella cache stessa origine); salvataggio immediato durante l'input e al passaggio in background; splash con limite esterno di 6 s; SystemBars DARK in Capacitor 8 per icone chiare sullo sfondo grafite.

Distribuzione: repository pubblico nuovorossi1-blip/gymhub, GitHub Pages con workflow di test/deploy. APK di anteprima compilato localmente con firma debug. Non inserire keystore, archivi utente, APK di terzi o segreti nel repository.

CI Android iniziale: fallita nella preparazione SDK prima di compilare; android-actions/setup-android@v3 richiedeva il pacchetto rimosso `tools`. Correzione: usare sdkmanager preinstallato nel runner con platform-tools, platforms;android-36 e build-tools;36.0.0 espliciti. Il fallimento non riguarda l'APK locale già compilato e verificato. I cambi solo Android/documentazione non avviano nuovamente Pages.

Esito distribuzione 03/11/2026 16:38: sito https://nuovorossi1-blip.github.io/gymhub/ verificato HTTP200, apertura e riapertura offline senza errori. Workflow Pages 41665134887 SUCCESS. CI Android 41665537414 SUCCESS dopo correzione del percorso sdkmanager fuori PATH. Release pubblica v0.1.0-preview.1, APK 4.767.559 byte con SHA256SUMS; download pubblico riscaricato e identico all'APK locale verificato. Prima versione utilizzabile, parità completa ancora da sviluppare. Prossimo passo: scelta dell'utente sull'hosting dati per account, sincronizzazione e community, senza presumere autorizzazioni a costi o migrazioni.

Aggiornamento 03/11/2026 21:23, versione0.1.1: aggiunto riferimento verificato al video pubblico Chris Bumstead ZQPVYJc1cpM (01/11/2026), con fonte/minutaggi e importazione personale modificabile. Lat2x8, rest-pause1/2 da10-15s; due tri-set3x8-12; rear delt10x10 stesso peso. Recuperi ordinari manuali, ripetizioni extra da registrare: nessun valore inventato. Nessun video/fotogramma/trascrizione incluso. Supporto intervalli di ripetizioni e rest-pause separati dai drop; compatibilità vecchi backup.
Verifiche:12/12 dominio,4/4 browser, build web e APK PASS. Emulatore API37: installazione-r conserva storico320kg, importazione scheda, rest-pause, arresto e ripresa con2serie completate, nuovo storico550kg e precedente320kg conservato. Foto browser412px ispezionate; telefono fisico e notifica background non provati. Pubblicazione in corso.

Distribuzione0.1.1: commit121fe98 pubblicato. Pages41712049294 SUCCESS; sito pubblico verificato nuovamente a412px (fonte e minutaggi, import scheda, nessun erroreJS). Release v0.1.1-preview.1 con GymHub-0.1.1-preview.apk e SHA256SUMS; download pubblico identico al file locale testato. Non distribuire come aggiornamento i debugAPK prodotti da CI: la firma del runner differisce dalla firma locale mantenuta per le release. Emulatore di prova arrestato; servizi preesistenti preservati.
Esito finale03/11/2026 21:27: CI Android41712102321 SUCCESS. RISOLTO riferimento video e supporto rest-pause/intervalli; parita completa STNDRD resta PARZIALE. Prossimo passo: altre sessioni pubbliche scelte; account/cloud ancora da concordare.

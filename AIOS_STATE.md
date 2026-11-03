# GymHub · stato del progetto

Avvio: 03/11/2026. Richiesta: app indipendente Android e browser, funzioni di riferimento STNDRD senza abbonamento, grafica AI-OS.

Il repository contiene implementazione originale. Gli APK di riferimento restano fuori dal repository. Nessun contenuto o codice estratto è incluso.

Stato: PRIMA VERSIONE VERIFICATA, copertura complessiva PARZIALE. Funzioni disponibili e mancanti sono elencate nel README e nella schermata Impostazioni. Non dichiarare parità completa con l'app di riferimento.

Architettura: Vite/JavaScript + Capacitor 8; stato locale tramite Preferences; notifiche locali Android; Filesystem/Share per backup nativo. UI e dominio separati. Nessun account, backend o chiave API.

Verifiche 03/11/2026: 9/9 test dominio Node; 3/3 flussi Playwright con Edge a 412 px e desktop 1440 px, inclusi superset/drop, sostituzione, chiusura/ripresa, diario e ricette, abitudini, export/import e riapertura offline. CI iniziale su Chromium: build e test passati. Screenshot ispezionati. Audit npm: zero vulnerabilità dopo override glob ^14.0.2 nella catena della CLI Capacitor.

Android: assembleDebug con JDK 21 riuscito. Emulatore API37, WebView 411 px: registrazione 40 kg × 8, pausa, force-stop del solo pacchetto di prova, riavvio e ripresa, storico 320 kg; backup creato tramite Filesystem e condivisione invocata. Test nativo scripts/native-smoke.mjs. Notifica temporizzata in background e telefono fisico non verificati. Barriera di inizializzazione nel test necessaria per il debug WebView; click forzati per evitare attese requestAnimationFrame inaffidabili nell'emulatore headless.

Correzioni verificate: cache offline per file statici con Vary: Origin (ignoreVary nella cache stessa origine); salvataggio immediato durante l'input e al passaggio in background; splash con limite esterno di 6 s; SystemBars DARK in Capacitor 8 per icone chiare sullo sfondo grafite.

Distribuzione: repository pubblico nuovorossi1-blip/gymhub, GitHub Pages con workflow di test/deploy. APK di anteprima compilato localmente con firma debug. Non inserire keystore, archivi utente, APK di terzi o segreti nel repository.

# GymHub

Il tuo spazio per allenarti. Android e browser, open source, senza abbonamento.

[Apri GymHub nel browser](https://nuovorossi1-blip.github.io/gymhub/) · [APK di anteprima](https://github.com/nuovorossi1-blip/gymhub/releases)

**Prima versione 0.1, non ancora equivalente a tutte le funzioni di STNDRD.** Codice e grafica originali; non include codice decompilato, contenuti, video o immagini di altre app. Grafica AI-OS: grafite, oro, Manrope e Barlow Condensed inclusi nell'app.

## Funzioni disponibili

- Libreria iniziale di 26 esercizi; nuovi esercizi, gruppo muscolare, attrezzo e note personali.
- Creazione, modifica, riordino, duplicazione e cancellazione delle schede; calendario settimanale.
- Serie, ripetizioni, carichi, superset (gruppi A–D) e fino a tre drop per serie principale.
- Timer di recupero dopo un giro completo di superset o l'ultimo drop; aggiunta di 30 secondi e salto.
- Sostituzione di un esercizio prima di registrarne le serie; la scheda e lo storico rimangono indipendenti.
- Pausa e ripresa, anche dopo chiusura e riapertura. La pausa esclude il tempo dal totale attivo e annulla il recupero.
- Storico, filtro per esercizio e grafico del volume. Volume = somma di kg × ripetizioni delle serie completate, inclusi i drop. Il peso corporeo non è stimato.
- Diario alimentare manuale per data, alimenti con valori per 100 g, ricette e porzioni, calorie e macronutrienti.
- Obiettivo calorico facoltativo inserito dall'utente, senza prescrizioni automatiche.
- Abitudini quotidiane, giorni consecutivi e traguardi basati sugli allenamenti completati.
- Esportazione/importazione JSON validata. Su Android si usa la condivisione del sistema; nel browser il download.
- Utilizzo offline; su Android le risorse sono nell'APK, nel browser sono memorizzate dopo la prima apertura online.

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

export async function enableWebUpdates(persist, onError, currentView) {
  if (!('serviceWorker' in navigator)) return;
  const mainAsset = document.querySelector('script[type="module"][src]')?.src;
  const check = () => { if (mainAsset) navigator.serviceWorker.controller?.postMessage({ type: 'CHECK_CLIENT', asset: mainAsset }); };
  navigator.serviceWorker.addEventListener('controllerchange', check);
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type !== 'GYMHUB_UPDATE_AVAILABLE' || document.querySelector('#web-update')) return;
    const banner = document.createElement('aside'); banner.id = 'web-update'; banner.className = 'web-update'; banner.setAttribute('aria-label','Aggiornamento GymHub');
    banner.innerHTML = '<span>È disponibile una nuova versione di GymHub.</span><button class="primary" type="button">Aggiorna</button>';
    banner.querySelector('button').onclick = async () => {
      if (document.querySelector('dialog[open]')) { onError('Salva o chiudi prima la finestra aperta, poi premi Aggiorna.'); return; }
      try { await persist(); const url = new URL(location.href); url.searchParams.set('v', String(Date.now())); url.searchParams.set('screen',currentView()); location.replace(url.href); }
      catch { onError('Aggiornamento rimandato: non è stato possibile salvare i dati.'); }
    };
    document.body.append(banner);
  });
  try {
    const registration = await navigator.serviceWorker.register(new URL('sw.js',document.baseURI), { updateViaCache: 'none' });
    check(); let lastCheck = Date.now();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && navigator.onLine && Date.now()-lastCheck>60000) { lastCheck=Date.now(); registration.update().then(check).catch(()=>{}); } });
  } catch { /* Offline: il sito già memorizzato rimane utilizzabile. */ }
}

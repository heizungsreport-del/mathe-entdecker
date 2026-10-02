(() => {
  const status = document.querySelector('#offline-status');
  const update = document.querySelector('#update-app');
  if (!('serviceWorker' in navigator) || !window.isSecureContext || location.protocol === 'file:') {
    status.textContent = 'Für Offline-Nutzung bitte die HTTPS-Webadresse öffnen.';
    return;
  }
  let ready = false;
  let reloadRequested = false;
  const showStatus = () => {
    status.textContent = ready
      ? (navigator.onLine ? 'Offline bereit · Übungen auf diesem Gerät verfügbar' : 'Offline · Du kannst weiterüben')
      : 'Offline-Nutzung wird vorbereitet …';
  };
  window.addEventListener('online', showStatus);
  window.addEventListener('offline', showStatus);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadRequested) location.reload();
  });
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }).then(registration => {
    function offerUpdate() {
      if (!registration.waiting || !navigator.serviceWorker.controller) return;
      update.hidden = false;
      update.onclick = () => {
        if (!window.confirm('Neue Version laden? Die aktuelle Runde und die Sterne dieser Sitzung werden zurückgesetzt.')) return;
        reloadRequested = true;
        registration.waiting?.postMessage({ type: 'ACTIVATE_UPDATE' });
      };
    }
    offerUpdate();
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      installing?.addEventListener('statechange', () => {
        if (installing.state === 'installed') offerUpdate();
        if (installing.state === 'redundant' && !ready) status.textContent = 'Offline-Dateien konnten nicht geladen werden. Bitte später online neu öffnen.';
      });
    });
    navigator.serviceWorker.ready.then(() => { ready = true; showStatus(); });
  }).catch(() => {
    status.textContent = 'Offline-Speicherung nicht verfügbar. Du kannst online weiterüben.';
  });
})();

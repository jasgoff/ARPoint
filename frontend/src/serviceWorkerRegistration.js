// Register service worker for offline support.
// Auto-activates new versions to prevent the "stale cached bundle" trap.
export function register() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Check for updates every 60s while the tab is open
        setInterval(() => registration.update().catch(() => {}), 60000);

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW is waiting — activate immediately
              installingWorker.postMessage('SKIP_WAITING');
            }
          };
        };
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });

    // When the controlling SW changes (i.e. the new one took over), reload
    // the page once so JS/CSS bundles refetch with the new strategy.
    let hasReloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hasReloaded) return;
      hasReloaded = true;
      window.location.reload();
    });
  });
}

export function unregister() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((registration) => registration.unregister())
    .catch((error) => console.error(error.message));
}

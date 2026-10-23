import { initRouter } from './router.js';
import { initTabbar } from './tabbar.js';

// Service worker for offline use (browsers only allow it on https and localhost).
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Not available (e.g. plain http on the local network): the app still works online.
  });
}

function init() {
  initRouter();
  initTabbar();
  registerServiceWorker();
}

init();

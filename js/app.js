import { initRouter } from './router.js';
import { initTabbar } from './tabbar.js';
import { initLanguage } from './i18n.js';

// Service worker for offline use (browsers only allow it on https and localhost).
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').catch(() => {
    // Not available (e.g. plain http on the local network): the app still works online.
  });
}

function init() {
  initLanguage(); // before the first render: sets <html lang> and the tab labels
  initRouter();
  initTabbar();
  registerServiceWorker();
}

init();

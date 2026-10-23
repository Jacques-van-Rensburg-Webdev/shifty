import { initRouter } from './router.js';
import { initTabbar } from './tabbar.js';
import { initGridOverlay } from './grid-overlay.js';

function init() {
  initRouter();
  initTabbar();
  initGridOverlay();
}

init();

// Hash router: #/home, #/calendar, #/pay, plus #/shift/<new|edit>/<date>.
// Renders the matching screen into Content and highlights its tab.
// A screen may export `tab` (which tab to highlight) and `hideTabbar`.

import * as home from './screens/home.js';
import * as calendar from './screens/calendar.js';
import * as pay from './screens/pay.js';
import * as shiftForm from './screens/shift-form.js';

const ROUTES = { home, calendar, pay, shift: shiftForm };
const DEFAULT_ROUTE = 'home';

function currentRoute() {
  const [name, ...params] = window.location.hash.replace(/^#\/?/, '').split('/');
  return Object.hasOwn(ROUTES, name) ? { name, params } : null;
}

function show({ name, params }) {
  const screen = ROUTES[name];
  const tabName = screen.tab ?? name;

  document.querySelectorAll('.app-tabbar .tab').forEach((tab) => {
    if (tab.getAttribute('href') === `#/${tabName}`) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  });
  document.body.classList.toggle('no-tabbar', Boolean(screen.hideTabbar));

  const content = document.querySelector('.app-content');
  content.replaceChildren();
  screen.render(content, params);
  window.scrollTo(0, 0);
}

function handleRoute() {
  const route = currentRoute();
  if (route) {
    show(route);
  } else {
    // Unknown or empty hash: swap in the default without adding a history entry.
    window.history.replaceState(null, '', `#/${DEFAULT_ROUTE}`);
    show({ name: DEFAULT_ROUTE, params: [] });
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

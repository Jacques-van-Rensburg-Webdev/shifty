// Hides the tab bar while scrolling down and brings it back when scrolling up
// or near the top. While hidden, CSS also takes it out of the tab order.

const THRESHOLD = 8; // ignore scroll jitter smaller than this (px)

export function initTabbar() {
  const tabbar = document.querySelector('.app-tabbar');
  if (!tabbar) return;

  let lastY = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const delta = y - lastY;
    if (Math.abs(delta) < THRESHOLD) return;
    lastY = y;
    const show = delta < 0 || y <= THRESHOLD;
    tabbar.classList.toggle('is-hidden', !show);
  }, { passive: true });

  // Always show it again after switching screens.
  window.addEventListener('hashchange', () => {
    lastY = 0;
    tabbar.classList.remove('is-hidden');
  });
}

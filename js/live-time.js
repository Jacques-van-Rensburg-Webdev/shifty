// The device's current time for time inputs, kept up to date until the field is edited.

const REFRESH_MS = 30 * 1000;

const pad = (n) => String(n).padStart(2, '0');

// "HH:MM"
export function currentTime() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// Refreshes the input every 30 s and when the app becomes visible again.
// Stops once the input is edited or has left the page.
export function keepCurrent(input) {
  let timer = null;
  const stop = () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
  };
  const refresh = () => {
    if (input.isConnected) input.value = currentTime();
    else stop();
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') refresh();
  };

  timer = setInterval(refresh, REFRESH_MS);
  document.addEventListener('visibilitychange', onVisible);
  input.addEventListener('input', stop, { once: true });
  input.addEventListener('change', stop, { once: true });
}

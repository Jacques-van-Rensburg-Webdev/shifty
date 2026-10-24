// Home screen: today's date, the shift that's happening now (with the Calendar's actions)
// and the month's "so far" totals.
// Until 06:00, yesterday's shift counts as "now" if it isn't completed and runs past midnight or
// has no end yet (shifts are scheduled with a start time only).

import { el, redraw } from '../dom.js';
import { DAYS, MONTHS, addDays, endOfMonth, startOfMonth, toKey, today } from '../dates.js';
import { endsNextDay, hasEnd, totals } from '../shifts.js';
import { getShift, getShifts } from '../storage.js';
import { renderDayPanel } from '../components/day-panel.js';
import { renderSoFar } from '../components/so-far.js';

const LAST_NIGHT_UNTIL = 6; // hour

// Which day Home is about right now: last night's unfinished shift before 06:00, else today.
function currentDay() {
  const todayDate = today();
  const yesterdayKey = toKey(addDays(todayDate, -1));
  const lastNight = getShift(yesterdayKey);
  const unfinished = lastNight && !lastNight.completed && (!hasEnd(lastNight) || endsNextDay(lastNight));
  if (new Date().getHours() < LAST_NIGHT_UNTIL && unfinished) {
    return { todayDate, key: yesterdayKey, heading: 'Last night\'s shift', isLastNight: true };
  }
  return { todayDate, key: toKey(todayDate), heading: 'Today\'s shift', isLastNight: false };
}

// Redraw when coming back to the app if the day (or last night's shift) has changed.
let shown = null; // { container, key }
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !shown || window.location.hash !== '#/home') return;
  const now = currentDay();
  if (`${toKey(now.todayDate)}|${now.key}` !== shown.key) redraw(shown.container, render);
});

export function render(container) {
  const rerender = () => redraw(container, render);
  const day = currentDay();
  const todayKey = toKey(day.todayDate);
  shown = { container, key: `${todayKey}|${day.key}` };

  const d = day.todayDate;
  container.append(el('div', { class: 'grid' }, [
    el('h2', { class: 'section-title span-4', text: 'Today' }),
    el('p', { class: 'today-date span-4', text: `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}` }),
    ...renderDayPanel({
      key: day.key,
      todayKey,
      heading: day.heading,
      onChange: rerender,
      from: 'home',
      showDate: day.isLastNight, // the heading already shows today's date
      live: true,
    }),
    ...renderSoFar({
      heading: `${MONTHS[d.getMonth()]} so far`,
      totals: totals(getShifts(), toKey(startOfMonth(d)), toKey(endOfMonth(d)), todayKey),
    }),
  ]));
}

// Calendar screen: Month / Week toggle, navigation, the month grid or week list,
// the selected day (card, Add / Edit / Delete; Edit opens the logging rows) and the "so far" totals.
// View and selected day are kept in memory while you move between screens.

import { el, redraw } from '../dom.js';
import {
  addDays, addMonths, endOfMonth, formatMonth, formatRange, fromKey, monthName,
  startOfMonth, startOfWeek, toKey, today,
} from '../dates.js';
import { totals } from '../shifts.js';
import { getSettings, getShifts } from '../storage.js';
import { t } from '../i18n.js';
import { renderMonthGrid } from '../components/month-grid.js';
import { renderWeekList } from '../components/week-list.js';
import { renderDayPanel } from '../components/day-panel.js';
import { renderSoFar } from '../components/so-far.js';
import { periodNav } from '../components/period-nav.js';
import { buildSummaryPdf } from '../pdf/summary-pdf.js';
import { sharePdf } from '../pdf/share.js';

const state = { view: 'month', selectedKey: null, logOpen: false };

// Used by the shift form to return here with the saved day selected.
export function selectDay(key) {
  state.selectedKey = key;
}

export function render(container) {
  const todayKey = toKey(today());
  if (!state.selectedKey) state.selectedKey = todayKey;

  const rerender = () => redraw(container, render);

  const shifts = getShifts();
  const selected = fromKey(state.selectedKey);
  const isMonth = state.view === 'month';
  const first = isMonth ? startOfMonth(selected) : startOfWeek(selected);
  const last = isMonth ? endOfMonth(selected) : addDays(first, 6);

  const select = (key) => {
    if (key !== state.selectedKey) state.logOpen = false;
    state.selectedKey = key;
    rerender();
  };
  const move = (step) => select(toKey(isMonth ? addMonths(selected, step) : addDays(selected, step * 7)));

  const viewButton = (view, label) => el('button', {
    type: 'button',
    class: `button button-block span-2${state.view === view ? ' button-primary' : ''}`,
    'aria-pressed': String(state.view === view),
    'data-focus-key': `view-${view}`,
    text: label,
    onClick: () => { state.view = view; rerender(); },
  });

  // Month or week summary as a PDF file: the Share sheet on a phone, a download on a computer.
  // Built straight away in the click, so the phone still counts the Share sheet as a response to the tap.
  const summaryButton = () => el('button', {
    type: 'button',
    class: 'button button-block button-outline-accent span-4',
    text: isMonth ? t('calendar.saveMonthPdf') : t('calendar.saveWeekPdf'),
    onClick: () => {
      const title = isMonth ? formatMonth(selected) : `${formatRange(first, last)} ${last.getFullYear()}`;
      const { bytes } = buildSummaryPdf({
        title,
        firstKey: toKey(first),
        lastKey: toKey(last),
        todayKey,
        shifts,
        emptyText: isMonth ? t('calendar.emptyMonth') : t('calendar.emptyWeek'),
        tipPercent: getSettings().tipPercent,
      });
      const fileName = isMonth ? `shifty-${toKey(first).slice(0, 7)}.pdf` : `shifty-week-${toKey(first)}.pdf`;
      sharePdf(bytes, fileName, `Shifty – ${title}`);
    },
  });

  const viewProps = { selectedKey: state.selectedKey, todayKey, shifts, onSelect: select };
  const view = [
    summaryButton(),
    isMonth
      ? renderMonthGrid({ ...viewProps, month: first })
      : renderWeekList({ ...viewProps, weekStart: first }),
  ];

  container.append(el('div', { class: 'grid' }, [
    el('h2', { class: 'section-title span-4', text: t('calendar.title') }),
    viewButton('month', t('view.month')),
    viewButton('week', t('view.week')),
    ...periodNav({
      label: isMonth ? formatMonth(selected) : formatRange(first, last),
      prevLabel: t(isMonth ? 'nav.prevMonth' : 'nav.prevWeek'),
      nextLabel: t(isMonth ? 'nav.nextMonth' : 'nav.nextWeek'),
      isRange: !isMonth,
      onMove: move,
    }),
    ...view,
    ...renderDayPanel({
      key: state.selectedKey,
      todayKey,
      heading: t('day.selected'),
      onChange: rerender,
      collapsed: { open: state.logOpen, onToggle: () => { state.logOpen = !state.logOpen; rerender(); } },
    }),
    ...renderSoFar({
      heading: isMonth ? t('soFar.month', { month: monthName(selected.getMonth()) }) : t('soFar.week'),
      totals: totals(shifts, toKey(first), toKey(last), todayKey),
    }),
  ]));
}

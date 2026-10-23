# SHIFTY

Plan shifts, log tips and estimate pay. Mobile web app, no build step.

## Run it

No build step. Open `index.html` in a browser, or serve the folder so ES modules load:

```
npx serve .
```

or

```
python3 -m http.server
```

Then open http://localhost:3000 (or :8000) and use your browser's device toolbar at 390 × 844.

## Grid

- Rules: `design-grid-rules.md`
- Reference image: `docs/grid-reference.svg` (or `.png`)
- Overlay: press **G** in the browser, or add `?grid` to the URL

Reference positions as **Zone → Columns → Spacing → Size**, for example:
*"Content, columns 1–2, at 96: product tile, 192pt tall."*

## Structure

```
CLAUDE.md               rules for Claude
design-grid-rules.md    layout and spacing rules
index.html              entry page (Header, Content, Tab bar)
css/tokens.css          all design values
css/styles.css          reset, shell, grid, components, overlay
js/app.js               entry script
js/router.js            hash router: #/home, #/calendar, #/pay, #/shift/<new|edit>/<date>
js/tabbar.js            hides the tab bar while scrolling down
js/storage.js           shifts saved in localStorage, one per day
js/shifts.js            shift length, non-tip hours, totals (no HTML)
js/dates.js             date keys and formats; weeks start Monday
js/format.js            hours (6,5 h), euros (€12,50), shift times
js/live-time.js         current time for Finished at / Bar closed at, kept up to date
js/deductions.js        German deductions estimate (Übergangsbereich, SV, 2026 LSt)
js/pay-calc.js          estimated pay for a month (no HTML)
js/tips-estimate.js     estimated tips from past shifts on the same weekday (no HTML)
js/view-month.js        the month shown on Pay, kept while switching tabs
js/dom.js, js/icons.js  element helper and the design's icons
js/screens/             one module per tab (home, calendar, pay) + shift-form
js/components/          month grid, week list, day panel, so-far card, shift badge,
                        period nav, save field, money card, completed shifts
js/print/               month / week summary, saved as PDF via the browser's print dialog
js/grid-overlay.js      G-key grid overlay
assets/images/          images and icons
docs/                   grid reference image
task/todo.md            plan, checklist and review
```

# Savings Interest BD

A free, fully offline bilingual (English / বাংলা) **DPS & FDR maturity calculator** for Bangladesh.
See what your monthly DPS deposits grow into, what a fixed deposit matures to, compare up to
3 schemes side by side, and keep a history of your calculations — all in your browser, nothing
uploaded anywhere.

Live demo: https://fahad3235.github.io/savings-interest-bd/

## Features

- **DPS calculator** — monthly installment, tenure, annual rate → maturity value, total
  deposited, interest earned, plus a year-by-year growth table.
- **FDR calculator** — one-time deposit → maturity value under **simple interest** or
  **quarterly compounding** (the two conventions most Bangladeshi banks use).
- **Compare** — save up to 3 schemes from either calculator and view them side by side,
  with effective yield and the best maturity highlighted.
- **History** — every calculation is saved locally (newest first), with per-item delete
  and clear-all.
- **Bilingual UI** — English / বাংলা toggle with Bengali digits (২,০৪,০২৮.৯৭), persisted
  in `localStorage`.
- **Validation & empty states** — inline field errors (required, ranges, whole-number
  tenure), empty compare/history states.
- **Responsive** — verified at 390px with no horizontal overflow.
- **Fully offline** — single-page app, no network calls, no tracking.

## Formulas (documented honestly)

**DPS (annuity-due, monthly compounding).** Deposits are assumed at the *start* of each
month, compounded monthly:

> FV = P × (((1+i)ⁿ − 1) / i) × (1+i), where i = annualRate/100/12, n = months

**FDR simple:** FV = P × (1 + r×t). **FDR quarterly:** FV = P × (1 + r/4)^(4t),
with r = annual rate, t = years.

These are standard textbook formulas. Real banks may differ (deposit timing, tax/levy
deductions, tiered rates) — the app is an estimator, not a bank quote. Default form
values (e.g. 8% / 9%) are placeholders only; always enter your bank's actual rate.

## Tech stack

Vanilla HTML + CSS + JS. `calc.js` holds the pure math/validation core (usable from
Node and the browser); `app.js` holds UI, i18n and storage. No frameworks, no build
step, no dependencies at runtime.

## Prerequisites

Any modern browser. For tests: Node.js 18+ and Google Chrome/Chromium.

## Install & run

```bash
# just open it — no build step
open index.html        # or: python3 -m http.server, then http://localhost:8000
```

## Dev commands

```bash
node test.js           # 46 Node unit tests (calc.js core)
npm install            # one-time: installs puppeteer-core for the smoke test
node smoke.js          # 31 headless-Chrome checks (DPS/FDR math, validation,
                       # compare, history persistence, BN/EN toggle, 390px mobile,
                       # zero console/page errors)
```

## Testing

- `node test.js` — 46/46 pass. Anchors hand-verified, including three exact-by-hand
  FDR cases (109000.00, 109308.33, 51875.00) and the annuity-due/annuity-immediate
  identity check (202677.79 × (1+i) = 204028.97).
- `node smoke.js` — 31/31 pass in headless Chromium (`/opt/meta-chromium/chrome`),
  0 console/page errors.

## Deployment

Static site — deploy anywhere (GitHub Pages, Netlify, any static host). No server,
no environment variables, no secrets.

## Limitations

- Estimates only: does not model bank fees, excise duty, source tax on interest, or
  tiered/promotional rates.
- DPS assumes all deposits are made on time at each month's start.
- Data (compare list, history, language) lives in the browser's `localStorage`;
  clearing site data erases it. Max 40 history entries, 3 compare slots.

## Status

Working MVP. Offline-first by design.

---
name: market-outlook
description: Build a dated stock-market forecast and scenario plan (12, 24 and 36 months) as a single-file HTML report with inline SVG charts, three probability-weighted scenarios, courses of action modeled against those scenarios, an advisory-board section, and a sources list. Use when Nathan asks whether to raise cash or stay invested, asks for a market forecast or scenario plan, asks what the Fed, inflation, unemployment or AI mean for his portfolio, or asks to refresh an earlier outlook. Not for single-stock research or for real estate deals; those have their own paths.
---

# Market outlook

Reconstructed from the November 4, 2026 report `reports/market-outlook-2026-11.html`
(commit 46f8aa5 in Funkyfest/Nathan-Hale, private page
https://claude.ai/artifact/NxQXYQkUQLxWwAV8SeGHhh). Observed once; log every deviation
in the improvement log.

## When to use

- Nathan asks "should I increase cash or stay invested," or any horizon-based forecast
  question about U.S. equities.
- Nathan asks to refresh an earlier outlook after a tripwire date (jobs report, CPI,
  FOMC, Nvidia earnings) or after a market move of 10% or more.
- A standing refresh: quarterly, after each FOMC with a Summary of Economic Projections.

## Inputs

| Input | Default | Source |
|---|---|---|
| As-of date and last market close | Today, prior session close | Web search, Fed H.15 |
| Horizons | 12, 24, 36 months | Nathan |
| Named sources | Federal Reserve, BLS, CNBC, Bloomberg, Fidelity, Vanguard, Goldman Sachs, FactSet, Harvard economists (Rogoff, Furman), Elon Musk | Nathan's list on November 4, 2026; add any he names |
| Advisory board | Nathan (principal investor, CRE capital-markets lens), his wife (the teacher, household stability), the kids (long-term shareholders), Drew (investment advisor), Ian (tax advisor) | Open Brain note of April 7, 2026 |
| Portfolio stance | Preservation and income tilt, self-managed at Vanguard and Fidelity, taxable and tax-advantaged accounts | Same note |
| Output path | `reports/market-outlook-YYYY-MM.html` | Convention |

Do not print portfolio size or account balances in the committed file. The repo is
public.

## Steps

1. **Research, in one batch of searches, then one gap-fill batch.** Minimum data set:
   - Fed: latest decision, vote and dissents, next meeting, dot-plot medians for each
     year-end, chair.
   - Inflation: latest headline and core CPI, next release date, the driver (oil,
     tariffs, shelter).
   - Labor and growth: latest payrolls, unemployment, latest GDP print, next jobs report.
   - Rates: 10-year yield and its recent peak, 3- and 12-month T-bills, a money-market
     yield with its date.
   - Valuation: FactSet forward P/E, Shiller CAPE, current- and next-year EPS growth.
   - Index: last close, record close and date, year-end prior close for YTD, drawdowns
     this year.
   - Strategists: current-year and next-year targets from at least five houses plus one
     survey (CNBC Fed Survey or Bloomberg) and one bear outlier.
   - AI: hyperscaler capex this year (guidance) and next (consensus), the latest capex
     reaction, credit signals (neocloud bond yields, backstops), Nvidia's next date.
   - Politics and policy: anything that changes fiscal or regulatory direction.
   - Each named source's current position, with a date.
   Record the date of every figure. Mark secondary-tracker figures as such.
2. **Set the scenarios.** Three: base, bull, bear. Probabilities sum to 100. Each
   carries index levels at 12, 24 and 36 months, a maximum drawdown, and the evidence
   that would confirm it. Compute the probability-weighted path and compare it with
   cash at the T-bill yield at each horizon. State the comparison in one table in the
   executive summary.
3. **Model the courses of action.** Four mixes (fully invested, recommended, heavy
   cash, all cash) against the three scenarios over 36 months, with the weighted
   expectation and the worst 12-month stretch for each. State the assumptions for bonds
   and cash in prose. Label the mixes as illustrative, not Nathan's holdings.
4. **Write the advisory-board section.** One card per seat, each with the lens, two or
   three sentences, and a one-line verdict. Use the real first names Nathan uses for
   Drew and Ian; refer to his wife and kids by role.
5. **Build the page.** Read the `dataviz` skill before any chart code. Inline SVG drawn
   by a small script from data arrays; no chart library. Validate the categorical
   palette with `validate_palette.js` in both modes. Chart set that worked:
   index milestone closes, capex bars with a range whisker, Fed funds path plus dots,
   yield comparison bars, scenario fan with the weighted path dotted, strategist dot
   plot with a current-level line, historical odds of a positive return by holding
   period, grouped bars of course outcomes with a weighted tick. Every chart gets a
   table view in a `details` element. Stat tiles for the eight headline readings.
6. **Finish with tripwires and sources.** Tripwires are dated events in the next 90
   days with the reading that would move scenario weights. Sources are numbered, one
   line each, with the publication date and a link.
7. **Verify.** Render headlessly at 1100px and 390px in light and dark: zero page
   errors, no horizontal scroll, one look at the charts for label collisions. Fix once,
   re-run the error check, stop.
8. **Commit on the designated branch**, then run `publish-check` on the file. The
   scanner will flag public figures and market dollar figures by design.
9. **Publish the private page** with the Artifact tool and give Nathan the link.
10. **Quiz Nathan** with the standing decision interface: the course of action
    (recommended first with confidence), the publish-gate hits, and the skill harvest.
    State what happens after each answer. Then act: course A gets rebalancing rules,
    course B gets a T-bill ladder and trim list, course C gets a sale sequence.

## Verification

- `node shot.js`-style headless render reports `errors: none` and
  `scrollWidth == innerWidth` at 390px.
- Palette validator passes in light and dark.
- Every number in the executive summary appears in a chart, a tile or a table with a
  dated source.
- Scenario probabilities sum to 100 and the weighted path matches the table.

## Approval gates

- Pushing to the public repo waits for Nathan's answer on the publish-check hits. A
  bypass with `--no-verify` happens only when he picks "allow once," and the final
  message says so.
- No trade, transfer or account change is executed. The output is research and a
  draft action list for Drew and Ian to review.
- The private page is not shared with anyone; Nathan shares it from the page's menu.

## Improvement log

- 2026-11-05: Created from the November 4, 2026 report. Nathan chose to scaffold on
  first occurrence rather than log a candidate.

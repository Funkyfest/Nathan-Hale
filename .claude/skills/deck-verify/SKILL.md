---
name: deck-verify
description: Headless verification of any single-file HTML slide deck. Renders at desktop and phone sizes, steps every slide, and fails on page errors, horizontal overflow, desktop clipping, wrong slide count, or a Next button that does not disable on the last slide. Use before showing, publishing, or committing any HTML deck, and whenever Nathan asks whether a deck "works" or "looks right".
---

# Deck verify

```
node .claude/skills/deck-verify/verify-deck.mjs path/to/deck.html [expectedSlides]
```

Exit 0 and `RESULT: PASS` is a pass. Screenshots land in `shots/` next to the deck
(gitignored). Read the screenshots too; the script catches structure, not taste.

## What it checks

| Check | Fails when |
|---|---|
| Slide count | differs from `expectedSlides`, if given |
| Page errors | any uncaught exception or console error |
| Horizontal overflow | document is wider than the viewport on any slide |
| Desktop clipping | a slide's content is taller than the slide at 1440x900 |
| Phone scroll | reported as a note only, since slides scroll on phones |
| Navigation | `#next` is not disabled after stepping to the last slide |

## Assumptions about the deck

Slides are `.slide` elements, the active one carries `.active`, ArrowRight advances,
and the Next button has id `next`. These match the reference deck at `/index.html`.
A deck built differently needs the selectors changed at the top of the script.

## Requirements

Node 18 or newer and Playwright. The script looks for `playwright` locally, then
`PLAYWRIGHT_MODULE`, then the cloud session's shared copy. Chromium is used from
`/opt/pw-browsers/chromium` when present, otherwise Playwright's own.

## Improvement log

- 2026-10-10: Split out of role-pursuit-kit after Nathan chose to make it standalone.
  Passed on the Avison Young deck at both viewports.

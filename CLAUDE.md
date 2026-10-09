# Working with Nathan

## How to present decisions and results
- Present every decision as clickable multiple-choice options (AskUserQuestion), never as open-ended text questions.
- Each option states: the recommendation (mark the best one "(Recommended)" and list it first), why, and a confidence level (e.g. "Confidence: 85%").
- Show results as the working thing (a rendered page, screenshots, a link), not code or diffs. Keep explanations plain-English.
- Double-check work before reporting it done: run it, click through it, and say what was and wasn't verified.

## Kiki (Algebra 2 + SAT app for Keaton)
- Gamified practice app for Nathan's daughter Keaton: bright Duolingo-style UI, flower mascot "Kiki", story problems (bows, heels, Birdies, cheer) that fade into plain x.
- Nathan's standing request: show "3x" as "3 bows" wherever it makes sense. That is the Real-Life mode toggle (🎀 in every lesson, `story` flag on skills in content.js, `storyify()`); keep it working when adding skills.
- Units: Algebra, Advanced Math, Data & Percents, Geometry & Trig, plus Test Strategies (backsolve, plug-in, ballpark, spot-the-mistake). Each unit ends in a Khan-style Unit Test; practiced skills fade after 7 days and get a review card.
- Source lives in `kiki/src/` (vanilla JS, no dependencies). `cd kiki && node build.mjs` bundles it into the single file `kiki.html` at the repo root. Never hand-edit `kiki.html`.
- Tests: `node --test kiki/test/*.test.mjs` (problem generators, grid-in answers, streaks, Dad-link sanitizing) and `node kiki/test/e2e.mjs` (Playwright click-through at iPhone size; set NODE_PATH to a global Playwright). Run both before shipping.
- Keaton's live link is GitHub Pages from the `glow-math-site` branch, which contains only `index.html` (a copy of `kiki.html`) and `.nojekyll`. After rebuilding, copy `kiki.html` to `index.html` on `glow-math-site` and push, or her link won't update.
- Never publish the rest of this repo to Pages; `index.html` on `main` is an unrelated business deck.

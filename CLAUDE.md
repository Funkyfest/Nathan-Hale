# Working with Nathan

## How to present decisions and results
- Present every decision as clickable multiple-choice options (AskUserQuestion), never as open-ended text questions.
- Each option states: the recommendation (mark the best one "(Recommended)" and list it first), why, and a confidence level (e.g. "Confidence: 85%").
- Show results as the working thing (a rendered page, screenshots, a link), not code or diffs. Keep explanations plain-English.
- Double-check work before reporting it done: run it, click through it, and say what was and wasn't verified.

## Glow Math (keaton.html)
- Algebra 2 practice app for Nathan's daughter Keaton. The source is `keaton.html`, a single self-contained file.
- Keaton's live link is GitHub Pages from the `glow-math-site` branch, which contains only `index.html` (a copy of `keaton.html`) and `.nojekyll`. After changing `keaton.html`, copy it to `index.html` on `glow-math-site` and push, or her link won't update.
- Never publish the rest of this repo to Pages; `index.html` on `main` is an unrelated business deck.

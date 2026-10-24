---
name: deck-edit
description: Make a small change to an existing single-file HTML slide deck (fix a line, swap a date, remove a name, change a bullet), bump its build tag, verify it renders, scan it for exposed details, and push. Use when Nathan asks to change, fix, update, or redact something in a deck that already exists, such as index.html in this repo. Not for building a new deck; that is role-pursuit-kit.
---

# Deck edit

For changes to a deck that already exists. Reconstructed from the slide 5 redaction on
October 10, 2026 (commit 57d4081 in Funkyfest/Nathan-Hale).

## Inputs

- Path to the deck (default `index.html`).
- The exact change, in Nathan's words.
- Whether the deck is public (public repo, GitHub Pages, shared link). If unknown,
  treat it as public.

## Steps

1. **Read before editing.** Open the deck and find the exact line. Quote it back in the
   commit message. Do not edit from memory of the file.
2. **Make the change.** One edit per commit. Keep the HTML structure intact.
3. **Bump the build tag.** Find `<!-- Build: vN (cache-bust) -->` near the top of
   `<body>` and increment N. Hosted copies cache aggressively; this is what forces a
   refresh.
4. **Verify the render.** Run the `deck-verify` skill:
   ```
   node .claude/skills/deck-verify/verify-deck.mjs <deck> <expected slide count>
   ```
   `RESULT: PASS` is required. Read the screenshots in `shots/` for the slide you
   changed.
5. **Scan for exposed details.** Run the `publish-check` skill on the deck:
   ```
   .claude/skills/publish-check/publish-check.sh <deck>
   ```
   `RESULT: CLEAN` is required for a public deck. A hit goes to Nathan with the
   specificity card before anything is pushed.
6. **Commit and push** on the designated branch. The pre-push hook re-runs the scan.
   Message format: what changed, the old line quoted, the new build tag.
7. **Say what is still unverified.** If the deck may also be served from another repo
   or host (for this deck: `nathanhale.github.io`), say so. The edit has not reached
   a copy you cannot see.

## Approval gates

- Any edit that removes or adds a person's name, a client, or a money figure: show
  Nathan the before and after line and get his yes before pushing.
- Any edit to a deck on `main` directly: never. Edit on a branch; merging is his call.

## Improvement log

- 2026-10-24: Created after Nathan chose to make the slide 5 redaction workflow a
  skill. Steps are the ones actually run on October 10, in order.

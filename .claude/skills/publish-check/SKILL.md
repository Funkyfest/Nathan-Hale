---
name: publish-check
description: Scan any file about to go public (public repo push, GitHub Pages, shared link, email attachment) for exposed person names, compensation or money figures, emails, and phone numbers, then stop for Nathan's yes before anything is published. Use before every push to a public repo, every share link, and every send of a deck or document outside Nathan's own accounts.
---

# Publish check

Nothing of Nathan's goes public with a third party's name, a comp figure, or contact
details in it unless he has said yes to that specific item.

## Run

```
.claude/skills/publish-check/publish-check.sh index.html other.html
```

For a push, scan what changed: `git diff --name-only origin/main | xargs .claude/skills/publish-check/publish-check.sh`

Exit 0 and `RESULT: CLEAN` means nothing flagged. Exit 1 lists each hit with file and
line. Every hit goes to Nathan with the standing decision interface: redact, allow once,
add to the allowlist, or custom. Do not publish until he answers.

## What it flags

- Dollar amounts and comp words (compensation, salary, bonus, equity grant, base pay).
- Two capitalized words in a row that are not in `allowlist.txt` (possible person names).
  This over-flags on headings; that is deliberate. Add stable headings to the allowlist.
- Email addresses and phone numbers.

## What it does not catch

Names in lowercase, single-word names, client names that are not two capitalized words,
and anything inside images. Read slides with people or clients on them yourself.

## Approved lines

`approved.txt` holds exact text Nathan has said yes to, one line each. A money or comp
hit whose line contains an approved fragment is suppressed. Add a line only after his
explicit yes for that specific text, and record it in the improvement log below.

## Pre-push hook

`.githooks/pre-push` runs this check on every HTML file that differs from the remote
before a push and blocks the push on any hit. Markdown is skipped there because tool
and product names read as people; run the check on Markdown by hand when it matters.
Enable once per clone:

```
git config core.hooksPath .githooks
```

Bypass for a single push with `git push --no-verify`, and say so to Nathan.

## Allowlist

`allowlist.txt`, one phrase per line, matched as a substring. Add Nathan's own name,
the target firm, and recurring headings. Never add a third party's name without his yes.

## Improvement log

- 2026-10-10: Created after the Avison Young deck was found in a public repo naming a
  contact next to a compensation line. Tested against the pre-redaction deck (flags the
  name and the comp line) and the redacted deck (flags the comp word only).
- 2026-10-10: Nathan allowed the slide 5 line "Total compensation and next touchpoint."
  once; it is in approved.txt. The word still flags everywhere else. Added the pre-push
  hook at his direction and the heading "The Talent" to the allowlist (false positive).
- 2026-10-10: Bug on first hook run: the scanner marked every file as flagged because
  the pipeline's exit status came from sed, not grep. Hits are now collected into a
  variable and tested. Hook narrowed to HTML after Markdown produced false names like
  "Claude Code". A hard reset during testing also discarded unstaged edits once;
  commit ff6a582 only carried approved.txt and the hook, the rest is in this commit.

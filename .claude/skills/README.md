# Skills ledger

Single registry of repo skills, candidates, and improvement history.
Maintained by the `skill-harvest` skill. Edit only through an approved harvest.

## Active skills

| Skill | Purpose | Added | Last changed | Improvements |
|---|---|---|---|---|
| skill-harvest | Decide whether successful work should become a skill; run the improvement loop | 2026-10-09 | 2026-10-16 | 4 |
| role-pursuit-kit | Research sheet, firm analysis doc, and follow-up HTML deck for a senior-role pursuit | 2026-10-10 | 2026-10-10 | 1 |
| deck-verify | Headless render check for any single-file HTML deck | 2026-10-10 | 2026-10-10 | 0 |
| specificity | Fixed context card (what, why, origin, duration, project, status, next, decision, value, cost, time, outcome) before every question to Nathan | 2026-10-16 | 2026-10-16 | 0 |
| deck-edit | Small change to an existing HTML deck: edit, bump build tag, deck-verify, publish-check, push | 2026-10-24 | 2026-10-24 | 0 |
| publish-check | Scan files for exposed names, comp figures, and contacts before anything goes public; pre-push hook; test.sh; check every copy after a redaction | 2026-10-10 | 2026-10-24 | 3 |

## Candidates

One line each: date, what happened, why it might be a skill. Promote on second occurrence.

- 2026-10-24: Run the repo's checks before every push. Covered by deck-verify, publish-check, and the pre-push hook. Nathan confirmed.
- 2026-10-24: Merge only after Nathan's explicit yes, then confirm main. Covered by his standing preferences. Nathan confirmed.
- 2026-10-24: Hook wiring and PR shape. Nathan asked for a recommendation; recommendation was to keep both as notes (each observed once, under ten lines, hook setup already in publish-check). No change.
- 2026-10-21: Expose-and-redact (find a name or comp figure on a public page, redact, add a check). Covered by publish-check; no separate skill. Nathan confirmed. The October 9 quiz-after-every-success rule ends here at his direction.
- 2026-10-11: Second test script for deck-verify. Dropped; deck-verify is itself a test.
- 2026-10-11: PR body shape (Summary, Review notes, Test plan) worked on Funkyfest/Nathan-Hale#2. Note only; a PR template is the cheaper first step if it recurs.
- 2026-10-11: Wiring a check as a tracked .githooks hook plus one hooksPath line. Note only; promote when a second check needs wiring.
- 2026-10-10: Avison Young interview deck considered as a deck-only skill. Scored 2 of 5 (one occurrence). Nathan chose the broader role-pursuit-kit instead; see that skill.

## Retired

- (none)

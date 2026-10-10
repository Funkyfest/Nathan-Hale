# Working rules for this repo

## Skill harvest (standing rule, set 2026-10-09)

After every successful outcome in a session (a task finished and verified, a fix that
worked, a workflow that produced a usable deliverable), run the `skill-harvest` skill
before closing the turn:

1. Decide whether the thing that just worked should become a reusable skill, or whether
   an existing skill was used and should be improved.
2. Quiz Nathan with the standing decision interface: Option 1 Recommended with a
   calibrated confidence percentage and a concrete why, Options 2 and 3 as genuine
   alternatives, Option 4 Custom, and a line pointing to Option 5 (paste direction in
   the reply composer, which overrides any selection).
3. State exactly what happens after submission.
4. On approval, scaffold or update the skill and append to the ledger at
   `.claude/skills/README.md`.

Skip the quiz for simple facts, lookups, and work already authorized with no new
decision. Never create or modify a skill without an explicit yes.

See `.claude/skills/skill-harvest/SKILL.md` for the full procedure and criteria.

## Publish gate (standing rule, set 2026-10-10)

Run `git config core.hooksPath .githooks` once per clone. The pre-push hook runs the
`publish-check` skill on changed HTML and blocks the push on any hit. Never bypass
with `--no-verify` without telling Nathan.

## Safe testing (standing rule, set 2026-10-10)

Commit real work before any destructive test. Run throwaway commits, leak tests, and
hook checks on a temporary branch, then delete it. Never `git reset --hard` with
unstaged edits in the tree.

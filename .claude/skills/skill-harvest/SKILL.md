---
name: skill-harvest
description: After a successful outcome, decide whether it should become a reusable skill (or whether an existing skill should be improved), quiz Nathan with the standing decision interface, and on approval scaffold or update the skill and log it in the ledger. Use at the end of any task that produced a verified, working result. Also use when a skill was invoked and the run exposed a gap.
---

# Skill harvest

Turn things that worked into skills, and turn skill misfires into improvements.
This runs at the end of successful work, not in the middle of it.

## When to run

Run when ANY of these is true:

- A task finished and the result was verified (tests pass, file renders, deliverable accepted).
- A multi-step workflow was done by hand that Nathan is likely to want again.
- An existing skill was invoked and the run needed manual correction, extra steps, or
  produced output that had to be reworked. That is an improvement candidate, not a new skill.

Do NOT run for: one-line facts, lookups, trivial edits, or work that was already
authorized and raised no new decision. When unsure, run it once and let Nathan say
"skip these for X" so the rule can be narrowed below.

## Step 1: Score the candidate

Answer each in one line. A candidate is worth proposing when at least three are yes.

| Criterion | Question |
|---|---|
| Recurs | Has this come up before, or will it plausibly come up again within a quarter? |
| Stable steps | Are the steps the same each time, with only inputs changing? |
| Costly by hand | Does it take more than about 10 minutes or more than 5 tool calls manually? |
| Verifiable | Is there a clear check that the output is correct? |
| Needs a gate | Does it touch sends, publishes, deletes, or source-of-truth files, so an approval checkpoint belongs inside it? |

If an existing skill was used, score instead on: did the run deviate from the skill text,
and would a change to the skill have prevented the deviation?

## Step 2: Decide the recommendation

Pick exactly one and give a calibrated confidence:

- **New skill**: no existing skill covers it and the score is at least 3 of 5.
- **Improve existing skill**: a skill was used and the gap is in its text, not in the inputs.
- **Note only**: worth remembering but not worth a skill yet. Add one line to the ledger
  under "Candidates" and move on.
- **Skip**: fails the criteria. Say so in one sentence and do not quiz.

## Step 3: Quiz Nathan (standing decision interface)

Use `AskUserQuestion` with real clickable options. Format:

1. **Recommended**: the decision from Step 2, confidence as a percentage, and the concrete
   why in one or two sentences.
2. A genuine alternative (for example "Note only, revisit after it recurs once more").
3. A second genuine alternative (for example "Improve existing skill X instead").
4. Custom: text override.

Below the controls, state in plain text:

- Option 5: paste direction or a path in the reply composer; pasted direction overrides
  any selection.
- Exactly what happens after submission (which files are created or changed, that
  nothing is pushed or published beyond the designated branch without a further yes).

Never fake controls. If the surface cannot render clickable options, state the gap once
and present the same five options as a numbered list.

## Step 4: Act on the answer

**New skill approved:**

1. Create `.claude/skills/<kebab-name>/SKILL.md` with frontmatter (`name`, `description`
   that names the trigger phrases), then sections: When to use, Inputs, Steps,
   Verification, Approval gates, Improvement log.
2. Put approval gates inside the skill wherever it would send, publish, delete, or
   overwrite anything.
3. Add a row to the ledger at `.claude/skills/README.md` with status `active`.
4. Commit on the designated branch with a message starting `skill: add <name>`.

**Improvement approved:**

1. Append an entry to the skill's `## Improvement log`: date, what went wrong or was
   missing, the change made.
2. Make the change to the skill text. Keep it minimal.
3. Bump the ledger row: increment the improvement count, update "last changed".
4. Commit with a message starting `skill: improve <name>`.

**Note only:** add one line under "Candidates" in the ledger with the date and the
trigger. When a candidate appears a second time, promote it to a quiz with
"recurs" marked yes.

**Skip or no answer:** change nothing.

## Continuous improvement loop

Every skill carries its own `## Improvement log`. The loop is:

1. Skill runs.
2. At the end of the run, this skill scores the run (Step 1, improvement variant).
3. If there was a gap, quiz Nathan (Step 3) with "Improve <skill>" as the recommendation.
4. On yes, log and change (Step 4).
5. A skill with three or more improvements in a quarter gets a review quiz: keep, split,
   or retire.

The ledger is the single place to see which skills exist, which are candidates, and
which keep needing fixes.

## Improvement log

- 2026-10-09: Created. Not yet exercised on a real candidate.

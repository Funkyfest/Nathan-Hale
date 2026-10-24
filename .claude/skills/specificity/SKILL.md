---
name: specificity
description: Before asking Nathan anything (a decision, a quiz, a yes or no, a choice between options), state the full situation in a fixed card: what it is, why, where and when it started, how long it has run, the project and artifact, the next action, the decision that is his, the value, the cost, the time, and the outcome. Use every time a question goes to Nathan. Also use when Nathan says "I don't know what that is," "be specific," or "what are you asking me."
---

# Specificity

Nathan should never have to reconstruct context to answer a question. Every ask
carries the card below, filled in with real names, dates, files, and numbers. No
labels invented during the session, no loop names, no shorthand.

## The card

Fill every line. "Unknown" is allowed, "n/a" is not.

```
WHAT       One sentence. The thing itself, by its real name (the file, the repo,
           the deck, the rule). Not a label coined this session.
WHY        One sentence. Why it exists or why it is being raised now.
ORIGIN     Where and when it started, and who started it (date, session, command,
           message, or event).
DURATION   How long it has been running. Days elapsed and work done (commits,
           sessions, artifacts).
PROJECT    The repo, client, or pursuit it belongs to, and the artifact it touches.
STATUS     Where it stands right now, in one sentence, verified.
NEXT       The single next action, who does it, and what it changes.
DECISION   The exact choice that is Nathan's. Two to four options, each with what
           happens if chosen.
VALUE      What Nathan gets if this goes well. Concrete, not "better".
COST       What it takes: his time, my time, money, risk. Numbers where they exist.
TIME       How long the next action takes and when the outcome lands.
OUTCOME    What exists at the end that does not exist now.
```

## Rules

1. The card comes before the controls. Buttons without the card are not an ask.
2. Names are real names: `index.html`, `Funkyfest/Nathan-Hale`, "the October 9
   `/goal` command." Never a phrase like "the loop" or "the harvest" without saying
   what it is in the same sentence.
3. One ask per card. Several decisions get several cards.
4. If a line cannot be filled from verified facts, write "Unknown" and say what
   would fill it. Do not guess.
5. Skip the card only for a yes or no on something Nathan raised himself in the last
   two messages, where the context is on screen.
6. If Nathan says he does not understand the ask, do not re-ask. Rebuild the card
   from the top and present it in prose first, then the controls.

## Where it plugs in

- `skill-harvest` Step 3: the quiz is a card, then the controls.
- Any approval gate in `publish-check`, `role-pursuit-kit`, or a future skill: card,
  then the gate.
- Standing decision interface (Nathan's preference, September 12, 2026): the card is
  the text above the Option 1 to 5 controls.

## Improvement log

- 2026-10-16: Created at Nathan's request after a quiz used a session-coined label
  ("success-to-skill quiz loop") with no context. First application: the card
  describing the October 9 `/goal` rule and pull request Funkyfest/Nathan-Hale#2.

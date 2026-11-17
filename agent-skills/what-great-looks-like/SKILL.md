---
name: what-great-looks-like
description: Run a three-round visual preference quiz and preserve exact Good or Great ratings as contextual reference examples. Use for "what great looks like", "good-to-great quiz", "calibrate my taste", or "capture this as a Great example". This is preference learning, not a review of agent assignments or permission to implement a chosen design.
---

# What great looks like

Learn what the owner considers Good and Great through actual examples. Preserve
the example, explicit rating and stated reason so another agent can retrieve them
without turning one comparison into a universal design rule.

## Inputs and retrieval

- Retrieve the smallest relevant context from the available memory store and the
  existing private example library. Match project, audience and format. A file in
  that library is not automatically an approved example; read its acceptance evidence.
- Find the existing quiz state before starting. Resume the pending round when
  appropriate. An unanswered round is not a deferral or evidence of disinterest.
  If the owner says they never saw it, treat delivery as unverified and present it
  in the current conversation. Do not stack another unattended quiz or poll repeatedly.
- Keep the owner's existing format rotation when known: visuals/layouts,
  questions, images, and results. Every format still needs visual examples.
  Without a known rotation, start with the format requested or with visual layouts.
- Use the existing owner/project store for private state and accepted examples.
  Discover its location; do not assume another machine has the same filesystem,
  connectors or approved library. State access gaps without guessing.

## Three rounds, one at a time

1. **Prepare two concrete alternatives.** Start from shared prior work and approved
   examples where available. Show both together, each beside its choice; allow
   enlargement when needed. Cite the source/date/version privately. Historical
   screenshots are historical, not live work. Clearly label newly authored
   adaptations as proposed comparisons, not previously accepted examples. If no
   authentic reference is accessible, disclose that and use an honestly labeled
   proposal only within the requested scope.
2. **Ask a focused comparison.** Keep the content, audience and task comparable.
   Change one meaningful dimension where practical. Explain your recommended
   option, why and calibrated confidence briefly. The recommendation selects a
   candidate, not the owner's rating. Do not invent a confidence percentage.
3. **Make the answer clickable.** Use the current host's supported interactive
   controls. Offer `A is Good`, `A is Great`, `B is Good`, `B is Great`, plus
   `Neither is good enough`, with an optional blank text field. Keep the
   recommended candidate first without changing stable A/B identities. Free text
   and normal-composer corrections override conflicting button selections.
   A single answer click should submit and advance; avoid a redundant send button.
4. **Wait for an actual answer.** A tool call, rendered control, default selection,
   carousel position or saved widget state is not a submitted choice. Use the
   host's supported response event or an explicit user message. Match the session
   and round; ignore stale state from other rounds. Persist that round's answer
   before presenting the next one. Never infer a response from elapsed time.
5. **Adapt the next comparison.** Carry forward the selected example and test one
   unresolved aspect. Preserve explicit Great examples unchanged. A later variant
   can be preferred yet rated only Good; that does not revoke the earlier Great
   rating. Finish after three answered rounds unless the owner changes the scope.

If the host cannot provide both the visual comparison and working clickable
answers, state the specific limitation. Do not imitate buttons with Markdown,
claim a numbered list is clickable, silently replace the quiz with prose, or
claim a local browser click reached the agent. Use another supported in-conversation
surface if available; otherwise leave the round pending.

## Record meaning precisely

Read [the record format](references/record-format.md) when creating or updating
state. Keep comparative choice, quality rating, written rationale and agent
interpretation in separate fields.

- `Great` requires the owner's explicit rating of the identified example.
  A favorite, `Good`, silence, a clean appearance or your recommendation does not qualify.
- Missing rationale stays null / "none supplied". Do not write a reason on the
  owner's behalf. If a rating has no identifiable example, keep it unassigned.
- Preserve corrections and source versions. Do not overwrite an old accepted
  artifact, silently mark an older unanswered round answered, or turn repeated
  selections in one context into independent cross-context validation.
- `Neither` is an answered comparison but approves neither example. If free text
  contradicts a click, preserve both and let the text control. If the intended
  result remains unclear, resolve only that ambiguity with clickable choices.
- Existing acceptance is contextual. Observed features of an accepted example
  are not separately endorsed rules. A design rating authorizes no deployment,
  task execution, schedule change or new commitment.

## Finish and verify capture

After three answers, save one compact session receipt in the existing private
store. Include all example references, exact selections, ratings and rationale.
Register only explicitly Great examples in the existing approved-example library,
with source version/hash, acceptance scope and known limitations. Preserve its
index and prior records; do not create another dashboard or competing library.

When capture is authorized, write a sparse summary to the connected memory store
(such as OB1) and read it back. Use only content appropriate to that destination.
Keep private paths, chat identifiers, screenshots and project details local unless
that destination and payload are authorized. A generic skill publication does not
authorize publishing the user's quiz answers or private examples. On a denied
write, report the reason and use a permitted, smaller payload or local capture;
never route around the denial. Read back before retrying an uncertain write to
avoid duplicates.

Report the actual states separately: answered, saved locally, memory readback
verified, cloud sync verified, installed, loaded, and reused. A repository commit
does not prove any agent loaded the skill; local saving does not prove cloud sync.
If capture fails, retain the answered state and name the missing operation rather
than repeating the quiz.

Close with the three results, where they were saved, material gaps, and
`Actions needed` / `Decisions needed` (or `none`). Do not ask another question
merely to finish. No fourth round or new project is implied.

## Harness notes and boundaries

- This procedure is shared; presentation uses the host's available capabilities.
  Use a supported native choice tool or interactive visual surface with a real
  follow-up response in Codex. For another host, including Claude, use its available
  native question/visual tools. Inspect their actual contracts rather than copying a
  different host's API names or assuming they exist.
- When available, read the host's visual-authoring skill before building examples.
  Keep model guidance separate from UI mechanics. Do not run privileged code or
  send private sources elsewhere just to provide the interface.
- Invocation does not create a recurring job. Preserve existing authorized cadence
  and applicable usage limits; do not copy another job's limits into this one.
  Never change schedules, send messages, publish examples or apply design changes
  as a side effect of taste calibration.
- This skill can also capture a single example explicitly rated Great without
  launching a three-round quiz the owner did not request.

## Improvement log

- 2026-11-17: Created from the completed visual-calibration workflow. Preserves
  clickable progression, explicit quality ratings, contextual acceptance and
  separate local/memory verification. Contains procedure only, not private examples.

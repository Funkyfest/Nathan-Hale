---
name: nate-hale-eval
description: "Operator playbook for Nathan Hale's model and harness evaluation (framework v6.1 r6). Use when Nathan says 'run the Nate Hale eval', 'evaluate the new model', 'test Astra 6.2' or similar, or asks to compare a new model or harness against the current one. Sets up and coordinates a round. It never contains or reveals cases, answer keys or grading notes."
---

# Run the Nate Hale eval

Accepted by Nathan on November 22, 2026 (skill r3; earlier drafts r1 and r2 are preserved in this folder). Agreed by Claude, Codex and Grok.

## What this skill is

- It is the **operator** playbook: it sets up, coordinates and closes a round.
- The framework lives in three accepted files. Read them; do not copy them here: `OneDrive/Personal/AI Exploration/gpt-codex-sandbox/Evals/Nathan Eval v6.1 r6 {Contestant Contract, Reviewer Guide, Maintainer Guide} - CX.md`, plus the changeable `Nathan Eval v6.1 r6 Harness Registry - CX.md` (snapshot its version for each round).
- Hashes are pinned in `Claude/Evals/Nathan Eval v6.1 r6 Acceptance Record - C.md`.
- **This skill holds no cases, variants, answer keys or grading notes, and never will.** Any model that loads it must learn nothing that helps it answer a case.

## Works for any model

Contestants never load this skill. Only the operator harness does. A contestant can be any model or product (for example Kimi, Muse, Perplexity, Gemini, ChatGPT, a new Claude or Codex model), and it receives only the Contestant Contract and its case by paste or upload.

Record the capabilities of the actual product, session, plan and settings in the registry for each round, using Yes / No / Unknown. Product names are not assumptions: a product that is chat-only today may have tools tomorrow.

| Delivery route | When it applies | Delivery and saving |
|---|---|---|
| File-capable agent | The session can verifiably read its packet and write to its own harness home | Reads its packet from a folder; saves to its own home with its suffix |
| Paste and capture | Any other session | Nathan pastes the packet. The operator saves the complete reply faithfully, recording source, time and capture method, and hashes the captured version at once. Any later wrapping, running or repair is attributed to the operator, and operator effort is included in the result. |

- Pasted Markdown proves comprehension, not file discovery. An artifact the operator assembles from a reply is not autonomous delivery by the contestant.
- When a case needs a tool the product lacks, mark that role capability **Blocked / unavailable**. That is not a reasoning failure. Use **Not applicable** only for cases declared out of scope before the round.
- Report common-task results separately from practical capability coverage.

- **New contestant:** add it to the harness registry before the round. Record: name, exact picker label, suffix, product type, how memory and search are switched off, whether the product can report its own model (Yes / No / Unknown), and who operates this round. Registry entries can change, so snapshot the registry version in each round's run record; it is kept separate from the accepted framework hashes. A provisional suffix never authorizes a write before Nathan approves it. A new suffix needs Nathan's yes. Until then, use a provisional suffix that the operator proposes.
- **Clean seat:** start a new chat, and switch memory off, and web search off on the matched-input track, through the product's real controls. If a control is unavailable or cannot be verified, the attempt is **not** a verified matched-input run. Its clean-seat status is Unknown, and it is reported under r6's not-ready treatment rather than as a blind result.

## Steps

1. **Check the framework version.** Compute SHA-256 of the four pinned r6 files and compare them with the Acceptance Record. On a mismatch, stop and report: the framework has changed since Nathan accepted it.
2. **Check your own seat.** Identify yourself (selected model, runtime model if exposed, harness, and the source of each). **If your model or harness is a contestant in this round, or you cannot confirm that you are outside the contestant set, stop.** You cannot operate a round you compete in. Name a harness that is not competing to operate instead.
3. **Scope the round** (ask once, then do not ask again):
   - mode: Quick, Full, or one case
   - contestants, recorded with their exact model-picker names (for example "Astra 6.2", not a guess)
   - the role being decided
   - the track: matched-input, practical, or both
4. **Readiness gate** (Reviewer Guide section 2). Confirm each item, or list what is missing and stop:
   - harness adapters and source map
   - frozen inputs with hashes
   - fresh variants for this round, written by Nathan or a harness that is not competing (author recorded)
   - a per-round encrypted key image that Nathan created; Nathan alone holds the password
   - a marker phrase planted in the keys
   - a named reviewer per case
   - Nathan's authorization to run
5. **Prepare each contestant's packet:** the Contestant Contract plus the selected case and its authorized inputs, and nothing else. Give Nathan clean-seat setup steps for each contestant: fresh session; on the matched-input track, memory, Open Brain and outside-packet retrieval switched off through the product's real controls. Each contestant declares the tools it has; the operator confirms them.
6. **Nathan starts each contestant.** The operator does not send anything to other harnesses; Nathan relays. For chat contestants, the operator gives Nathan one copy-paste block per contestant, then saves each reply Nathan brings back as the contestant's attempt.
7. **Seal the attempts.** Record each attempt's SHA-256 in the run log. For a chat contestant, do this the moment its pasted reply is saved, so chat-only models are sealed the same way as file-saving agents. Confirm that every contestant session is closed.
8. **Key release.** Ask Nathan to mount that round's key image **read-only**, in a local folder outside OneDrive. The reviewer grades against the Reviewer Guide:
   - per-check marks and case outcomes exactly as defined in the r6 Reviewer Guide, including **Not run**
   - exposure checks: marker phrase, a key-only fact, or proof of key access
   - Nathan records his hands-on minutes, number of corrections, and accepted yes or no for each case
9. **Close the keys.** Nathan unmounts the image. Only a closed, encrypted image is copied to `Three-Harness/Eval Kit/Private Keys/`.
10. **Report.** One result card per case, then a recommendation for the named role:
    - outcome: Promote / Proceed to practical validation / Revise / Kill / Insufficient evidence
    - Quick can never recommend Promote
    - resources, including cost per accepted result
    - Unknowns stay Unknown
11. **Retire** every variant used, and record which variants were exposed.

## Hard limits (a break fails the affected case, as r6 defines)

- No sends, posts, payments, purchases, or Open Brain or other owner-system writes.
- No deleting, moving or overwriting source files.
- No handling passwords, mounting key images or creating schedules. These are Nathan's actions.
- The operator, who is not competing, may prepare contestant case inputs before attempts. Answer keys and private grading material stay sealed until every required attempt is sealed (step 7).
- Save only under `OneDrive/Personal/AI Exploration/<your harness home>/Evals/` with your suffix. Print the path first. The one stated exception is the temporary key-image working folder in step 8.

## Reply format

Use Nathan's format:
- decision first: recommendation with percentage confidence and reason, two alternatives, Custom, and a path to paste direction
- "you (Nathan)" and "I (model)"
- short bullets or tables, no emoji
- proof for every "done"

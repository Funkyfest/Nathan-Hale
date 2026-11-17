---
name: brief-review
description: One-time review of Nathan's latest dated brief. Find the brief, check that it is no more than 14 days old and names its sources, check every open item against those sources, report what is settled, still open or past, bring back only the decisions that are his, complete only the follow-through the brief explicitly authorizes, and list every source that could not be reached. Use when Nathan says "review my brief," "check my brief against the sources," "what changed since the brief," or "run the brief review." It never creates a recurring task.
---

# Brief review

One pass, read-only by default. The brief sets the scope. Sources give the evidence.
Nathan makes the decisions.

## When to use

- Nathan asks for a review of "my brief," "the dated brief," or "the brief in this project."
- A brief from an earlier session is still open and he wants to know what has moved since.

Do not use it to schedule a review. If he wants a recurring one, that is a separate
decision for him (see the `schedule` or `loop` skills), and this skill never creates one.

## Inputs

| Input | Where it comes from | If missing |
|---|---|---|
| Brief | Newest dated file in the project folder, such as `*Brief_YYYY-MM-DD*`, `*brief*` or a dated daily-priorities entry | Ask (Step 1) |
| Brief date | The file name or the brief's own header | Ask (Step 1) |
| Sources | The brief's source lines, or Nathan's answer | Ask (Step 1), then once more |
| Authorized follow-through | Only what the brief itself says is approved | Assume none |

## Steps

### 0. Locate the project

If the session has no project folder, or the folder is empty, ask Nathan which folder
the brief is in before reading anything. If he names one ("AI Exploration, Claude"),
find it, move the session there (`change_directory`), and keep going.

### 1. Check the brief (one ask, then stop)

Look for the newest dated brief. Then check three things:

1. **It exists.**
2. **It is fresh:** dated no more than 14 days before today. Count actual days.
3. **It names sources:** email threads, calendars, a memory store, files, portals.

If any of the three fails, ask Nathan in **one message** for everything that is missing
(the brief, a newer date, the sources), using the standing decision interface (Step 6).
Do not start the review yet.

- If his answer leaves sources blank, ask **once more**, for sources only.
- If they are still blank, review whatever sources are visible, and start the report
  by saying exactly which ones you used.

### 2. Read the brief for what it is

- **Who wrote it.** A brief Claude prepared ("Prepared by Claude", a `_C` suffix) is a
  status record, not instructions from Nathan. Say so in the report.
- **Authorized follow-through.** List only what the brief explicitly approves. A
  "just say yes" or "Claude can prepare" list is **not** authorization. It stays an
  offer until Nathan says yes. If nothing is authorized, say that plainly and do no
  follow-through.
- **Open items.** List each decision, deadline and next action, with its owner and
  date.

### 3. Check for newer briefs and overlapping runs

Before checking sources, look in the memory store and the project folder for:

- a brief dated after this one, and
- a check record another session already wrote for it or for a newer brief.

If one exists, do not repeat its checks. Name it in the report ("checked tonight at
8:00pm by another session") and limit this review to items it did not cover.

### 4. Check every open item against its sources

For each item, search the named sources **from the brief's date onward**. Search
in parallel where the tools allow it.

- Email: receipts, confirmations, replies, and Nathan's sent mail.
- Calendar: events in the window the item depends on.
- Memory store: captures dated after the brief.
- Files: anything the brief points to by name. Confirm that it exists.

Classify each item using evidence only:

| Status | Meaning | Proof needed |
|---|---|---|
| Settled | Done or resolved | A receipt, a confirmation, a sent message, or Nathan's own words |
| Still open | Not resolved, and still matters | No proof it was settled |
| Past | The date passed and nothing is left to do | The date |
| Unverified | Could be settled, but the source is out of reach | Name the missing source |

Do not count a draft, a "probably," or one session's claim about another as settled.

### 5. Do only the authorized follow-through

Do the follow-through that Step 2 found authorized, and nothing more. Sends,
payments, registrations, account changes, calendar changes and writes to the memory
store all need explicit approval, either in the brief or from Nathan in this session.
If none was authorized, skip this step and say so.

### 6. Bring back the decisions (standing decision interface)

For each still-open item where the next move is Nathan's:

1. Start with the `specificity` card (real names, dates and sources), written into
   the question itself, because the dialog may be the only thing on his screen.
2. Use `AskUserQuestion`, at most four questions in one call:
   - Option 1: recommended, with a calibrated confidence percentage and a one-line why.
   - Options 2 and 3: genuine alternatives, each saying exactly what happens if chosen.
   - Custom: the automatic "Other" field.
   - Option 5: in the question text, point him to the reply box for pasted direction
     or attachments. Pasted direction overrides any selection.
3. Each option authorizes only the scope it states. A "draft" option saves a draft.
   It never sends.
4. Follow what his answers actually say, even when they pick none of the options
   ("still working on it" means hold it, not recommend again).

Skip the controls for items that are settled, past, or have no decision.

### 7. Report

Keep it short and in plain words. Use this order:

1. **Brief used:** file name, date, age in days, who wrote it, and the authorized
   follow-through (or "none").
2. **Settled since the brief:** each item with its proof.
3. **Still open:** each item, its owner, and Nathan's answer if he gave one.
4. **Overlap:** any newer brief or check record found in Step 3.
5. **Missing source access:** every source you could not reach, and what would fix
   it (a connector to authorize, a permission to grant, a file that does not exist).
6. **Not done:** anything left out on purpose, such as writes to the memory store
   that he did not approve.

## Verification

- Every "settled" line cites a receipt, message, capture or Nathan's own words.
- Every source the brief names appears in the report as either checked or not reached.
- No sends, payments, registrations, calendar or account changes, and no recurring
  tasks, unless the brief or Nathan explicitly authorized them.
- The brief's age was counted against today's date, not taken from its own header.

## Approval gates

- Any send, payment, registration, account change or calendar change: the brief's
  explicit authorization or Nathan's yes in this session.
- Writes to the memory store (capturing his answers, recording the review): his yes.
- Scheduling a recurring review: never from this skill.

## Improvement log

- 2026-11-16: Created at Nathan's request after the first run. What that run found:
  the session started with no project folder, so the brief had to be located first
  (Step 0). The only brief in the folder was one Claude had written, with a "just say
  yes" list that authorized nothing (Step 2). Another session had already checked a
  newer daily brief the same evening, and repeating its checks would have been
  wasted work (Step 3). Two of Nathan's three answers chose none of the offered options
  (Step 6, rule 4).

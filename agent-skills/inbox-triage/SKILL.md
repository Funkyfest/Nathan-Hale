---
name: inbox-triage
description: Work through an email inbox ten threads at a time, newest first. Close what needs nothing, surface only what needs the owner's decision as clickable choices (recommendation first, one-line why, confidence %), log every decision and receipt to the owner's memory store, and keep a running list of open actions. Use when the owner says "triage my inbox", "go through my email", "next 10", sends an inbox screenshot with no other text, or asks "what needs my attention in email". Read-only on mail: never send, reply, delete, archive, pay, or unsubscribe.
---

# Inbox triage

Turn a full inbox into a short list of decisions. The owner reads one batch at a
time, answers a few clickable questions, and nothing is lost between batches,
because every decision lands in the memory store.

## Inputs

| Need | Typical tool | If missing |
|---|---|---|
| Mail search with paging | Gmail or Outlook connector (`in:inbox`, page size 10) | Ask the owner to connect one; do not guess from screenshots |
| Full thread read | get-thread / read-message | Triage from snippets, mark the item "snippet only" |
| Memory store | Open Brain (OB1) `capture_thought` / `search_thoughts`, or a notes file | Keep the log in the reply and say it was not saved |
| Context checks | Memory search, accounting (QuickBooks), calendar | Mark the item BLIND, never invent status |

## Loop (one batch)

1. **Fetch** the next 10 inbox threads, newest first. Keep the page token so
   "next 10" continues where the last batch stopped.
2. **Sort each thread into one bucket.** Open the full thread only when the
   snippet cannot decide it.
   - **Act**: needs the owner, has a date or money or access at stake.
   - **Decide**: two or more reasonable paths, the owner's call.
   - **Receipt**: proof something finished (payment posted, delivery, submission).
     Log it so the nightly closeout can close the matching open item.
   - **FYI**: newsletters, marketing, past events, duplicates of an item already
     decided. One line each, no question.
3. **Check before asking.** Before you raise an Act or Decide item, search the
   memory store for the same subject. If it is already decided or done, say so
   and close it. Never re-ask a decided item. A duplicate notice of a decided item
   is FYI.
4. **Write the reply:**
   - Act/Decide items in a small table: item, what it is, who acts.
   - FYI items in one compact line.
   - The running list of open owner actions after N items.
5. **Ask with clickable choices.** At most 4 questions per batch, 2–4 options
   each. The recommended option comes first and is labeled "(Recommended)". Every
   option carries a one-line **Why** and a **Confidence %**. The last question is
   always "Continue triage?" with "Next 10" and "Done for today". Recommend
   stopping when actionable density falls to about 1 per 10.
6. **Log after the answers.** Write one memory entry per batch:
   `INBOX TRIAGE — <date>, items <a>–<b>` followed by decisions in the owner's own
   words, receipts with amounts, IDs and dates, FYI in one line, and the updated
   open-actions list. Write a separate `DECISION — <subject>` entry for any
   decision that changes a standing plan.
7. **Follow the answer literally.** "Let it lapse" means no action and off the
   board. "Not a priority" means park it without escalating. "No nudge" means drop
   the follow-up. Free-text answers override the offered options.

## Rules

- **Read-only on mail.** Never send, reply, forward, delete, archive, label,
  unsubscribe, pay, register, or click links in mail. Drafts only, and only when
  the owner asks for one.
- **Real names, real numbers.** Write "Registrar, example.org, $18.19, expires
  Nov 17", not "the domain thing".
- **Expiring items go first.** Anything that expires today or tomorrow tops the
  table, even if it came from an older batch.
- **Security notices.** For a new sign-in or new-device alert, ask "was that
  you?". Recommend "yes" only when there is matching evidence in the same window,
  and name that evidence.
- **Money.** Payments, renewals, and refunds are always the owner's action. State
  the amount and the deadline.
- **Tag pronouns** when the owner wants it: "you (Owner)", "I (Agent)".
- **No speculative builds.** Triage finds work; it does not start new projects.

## Output shape (example)

```
Items 21–30 read. Two need you; the rest are receipts and FYI.

| Item | What it is | Who acts |
|---|---|---|
| Registrar, example.org | 1-year renewal, $XX, expires today | You renew |
| Job alert, Company X | Senior role in your target city | Decide: score it? |

FYI: Mortgage payment posted 11/11 (receipt logged) · package delivered · newsletters ×4

Open actions after 30: renew example.org today · app permission review
```

Then the clickable questions.

## Harness notes

- **Claude Code / Claude apps:** use `AskUserQuestion` for the choices and the
  Gmail and OB1 MCP tools.
- **Codex / ChatGPT:** where there are no clickable choices, print them as a
  numbered list in the same order with the same Why and Confidence, and accept
  "1", "2", or free text.
- **Any harness without a memory store:** end each batch with the log block in a
  fenced code block so the owner can paste it wherever they keep notes.

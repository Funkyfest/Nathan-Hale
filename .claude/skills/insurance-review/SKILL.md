---
name: insurance-review
description: Review one of Nathan's insurance lines (auto, home, umbrella, health and benefits enrollment, life, building) at a renewal or enrollment window. Pull the current policy facts from OB1 and Gmail, research current rates and alternatives, cost each option, and deliver a decision card with the standing decision interface. Use when Nathan says a policy is due, asks whether a policy is the best he can get, asks pay-in-full vs monthly, mentions open enrollment, or asks to compare an insurer against USAA or another carrier. Never changes a policy, payment, or election.
---

# Insurance review

Reconstructed from the October 31 to November 8, 2026 review of the Progressive auto
renewal and the JLL versus Dallas ISD health election. Earlier occurrences: April 7, 2026
(auto, home, life), June 16, 2026 (building), October 12, 2026 (declarations review).

## When to use

- A renewal or enrollment window is open or inside 30 days.
- Nathan asks "is this the best I can get," "pay monthly or in full," or "what are my
  alternatives" for any insurance line.
- A benefits change at JLL or Dallas ISD, or a life event (college, new driver, sale of
  the building), changes the right answer.

## Inputs

- Line of insurance and the deadline date.
- Current declarations or plan documents. First look in OB1 (search the carrier name and
  "declarations" or "plan"), then Gmail (carrier, agent, and administrator senders), then
  Google Drive. If the only copy is an email attachment this toolset cannot open, name
  the exact figures Nathan must read off it and continue with ranges.
- Household facts from OB1: who is covered, ages, employers, income bracket, existing
  HSA or other accounts.

## Steps

1. **Establish the policy of record.** Carrier, policy number, term, premium, limits,
   deductibles, discounts already applied, agent. Quote OB1 or the email by date.
   Verify number discrepancies before relying on them.
2. **Find prior work.** Search OB1 and the artifact list for earlier reviews of the same
   line. Start from their open actions; do not redo settled questions.
3. **Research, in parallel.** Web search (extended for niche or current-year rates) for:
   the carrier's own rules (fees, discounts, refill windows, special enrollment events);
   state regulator trend data; two or three independent rate comparisons; the specific
   alternatives Nathan has named (USAA, a spouse's employer plan, a direct-pay program).
   Direct fetches of carrier and employer sites are usually blocked from a cloud session;
   say so once and rely on search summaries and Nathan's documents.
4. **Cost every option on one table.** Annual dollars, deductible or exposure, tax
   treatment, and a one-line verdict. Mark derived numbers "Est." and name the input that
   would replace the estimate. Include the options that lose and say why in one line.
5. **Find the non-obvious lever.** Examples that have recurred: a coverage gap the
   renewal does not mention (umbrella), a tax rail already owned but under-used (HSA),
   a second employer's plan (spouse), a timing rule (plan years, 45-day refill windows,
   31-day special enrollment).
6. **Write the note** as a local markdown file in the working directory named
   `insurance-review-YYYY-MM-DD.md`, with a Sources list. Do not commit or push it: it
   carries names, health details and money figures that the publish gate exists to keep
   off GitHub Pages. Tell Nathan where it is.
7. **Deliver the decision card.** Specificity card first (see
   `.claude/skills/specificity/SKILL.md`), then `AskUserQuestion` with Option 1
   Recommended plus calibrated confidence and a concrete why, two genuine alternatives,
   Custom, and a line pointing to Option 5 (paste direction in the reply composer, which
   overrides any selection). State exactly what happens after submission.
8. **Record the decision in OB1** as a dated decision capture: what was chosen, what was
   recommended, what stays open, and that no payment, election or send was made.

## Verification

- Every figure in the options table traces to a named source or to "Est." with the
  replacing input named.
- Deadlines are stated as dates, not "soon."
- The note's Sources section lists every URL used.
- The OB1 capture exists and names the decision.

## Approval gates

- Never pay, bind, cancel, elect, or send anything. Every action in the note is Nathan's.
- Never commit or push the review note. Only skill text goes to the repo.
- Any outbound email to an agent, insurer, or benefits office is a draft for Nathan's
  explicit yes.

## Improvement log

- 2026-11-08: Created from the Progressive and JLL/Dallas ISD review. Gap seen on the
  first run: Gmail attachments (payslips, declarations PDFs) are not readable from this
  toolset, so the skill now tells Nathan the exact lines to read instead of stalling.

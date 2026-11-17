---
name: role-pursuit-kit
description: Build the three artifacts Nathan uses when pursuing a senior role at a firm - a competitor-tier research sheet, a deep firm and market analysis doc, and a post-meeting follow-up deck as a single-file HTML slide deck. Use when Nathan says he is interviewing with, pitching, or evaluating a firm, mentions a market leader or managing director role, or asks for a follow-up deck after a meeting. Covers research, analysis, deck build, verification, and a publish gate.
---

# Role pursuit kit

Reconstructed from the Avison Young Dallas Market Leader pursuit (December 2025 to
January 2026). Three artifacts, built in order, each feeding the next. Observed once;
treat the structure as a starting point and log every deviation in the improvement log.

## When to use

- Nathan names a firm and a senior role he is pursuing or evaluating.
- A first meeting is done and a follow-up is owed.
- Nathan asks for any one of the three artifacts alone. Build only that one, but check
  whether the earlier stages exist in Drive first and reuse them.

## Inputs

Collect before starting. Ask only for what is missing.

| Input | Needed for | Source |
|---|---|---|
| Firm and office (city) | all stages | Nathan |
| Role title | Stage 2, 3 | Nathan |
| Meeting notes or themes heard | Stage 3 | Nathan, or Wispr Flow meeting notes if connected |
| Names of people met and next touchpoint | Stage 3 | Nathan |
| Nathan's credentials line | Stage 3 | Reference: `MBA, CCIM, SIOR, MCR, CFM` in `/index.html` |
| Brand tokens of the target firm | Stage 3 | Firm website; AY used black, white, two grays, Helvetica |

## Stage 1: Competitor-tier research sheet

Output: a Google Sheet or CSV, three columns: `Competitor Tier`, `Firms`,
`Competitive Context`. Observed tiers: global full-service, boutique capital markets,
regional and local. One row per tier, firms comma-separated, context as one or two
sentences on how the target firm positions against that tier.

Keep it to one table. It is a map for Stage 2, not the deliverable.

## Stage 2: Firm and market analysis doc

Output: a Google Doc. Observed section structure, keep the order:

1. Executive market context and organizational thesis (the market, the platform choice
   Nathan faces, the firm's niche and lineage).
2. Human capital architecture: the principals and executive leadership. One entry per
   leader: role, service lines, education, strategic profile, operational niche. Group by
   function (managing director, legacy core, capital markets, agency leasing, specialists).
3. The future guard: associates and emerging leaders.
4. Operational and support infrastructure (research, marketing, project management).
5. SWOT for the office, then competitor benchmarking one firm at a time with a
   "how the target differentiates" line each.
6. Strategic alignment: office versus the firm's global strategy, office versus the
   current-year corporate outlook.
7. Conclusions and recommendations written for the candidate, ending with role-specific
   guidance and a final verdict.
8. Works cited, numbered, with access dates. Source every person entry from the firm's
   own professional pages first.

Rules: cite everything. Mark any claim that is inferred rather than sourced. Do not
re-export the doc under the same title; the AY run produced a duplicate on January 13.

## Stage 3: Follow-up deck

Output: a single-file HTML deck. Reference implementation: `/index.html` in this repo
(five slides, Avison Young). Copy its structure and replace content.

Observed slide order:

1. Title: Nathan's name, role title at the firm, credentials line, month and year.
2. The Opportunity: objective bullets on the left, "The Landscape" and "The Gap" boxed on
   the right. Landscape comes from Stage 2 section 1. Gap is the opening Nathan fills.
3. Meeting Themes: the three to five themes heard in the meeting, as bold items.
4. Leadership Profile: five bullets on how Nathan leads, matched to the themes.
5. Next Steps: one line naming what is being asked (compensation, next touchpoint).

Build constraints, all verified on the reference:

- One file, no external fonts, scripts, or images. Inline CSS and JS only.
- Keyboard navigation (arrows, PageUp, PageDown, Home, End), buttons, dots, logo restarts.
- Slides are `position:absolute` with `overflow:auto` so long content scrolls on phones.
- Transition is a 0.35 second opacity fade. Screenshots taken mid-fade show a ghost of
  the previous slide; wait 600 ms before capturing.
- Breakpoints at 1100, 700, and 420 px.
- Bump the `Build: vN` comment on every regeneration so hosted copies cache-bust.

## Verification

Run the `deck-verify` skill against the deck before showing it to Nathan:

```
node .claude/skills/deck-verify/verify-deck.mjs path/to/deck.html 5
```

A pass is `RESULT: PASS`. Then run the `publish-check` skill on the deck before it
goes anywhere public.

Also check by hand: no mojibake (search for `â€`), the credentials line is exact, every
name is spelled as on the firm's site, and the date on slide 1 is the meeting month.

## Approval gates

Stop and ask Nathan with the standing decision interface before any of these:

1. Publishing the deck anywhere public (GitHub Pages, a public repo, a shared link).
   The AY deck is in a public repo and slide 5 names a person and references
   compensation. Default to a private repo or an unlisted link.
2. Sending the deck or the doc to anyone.
3. Including any named third party on a slide.
4. Reading Nathan's email or meeting transcripts to extract themes. Offer it, do not
   assume it.

## What this skill does not do

- It does not negotiate or draft compensation positions.
- It does not generate the meeting themes; those come from Nathan or his notes.
- It does not touch the Nate Jones persona or Drip Lab material.

## Improvement log

- 2026-10-10: Verifier moved to the standalone deck-verify skill; publish gate now
  delegates to publish-check.
- 2026-10-10: Scaffolded from one observed pursuit (Avison Young Dallas). Section
  structures are transcribed from the real artifacts. Nathan chose this over a
  deck-only skill. Open question: whether Stage 1 is worth keeping as a separate
  artifact or should fold into Stage 2 section 5.

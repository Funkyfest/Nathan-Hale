# program.md — Jeeves Question-Wording Loop

Prepared 2026-10-09 from the Karpathy Triplet Diagnostic (Nate B. Jones, Auto-Improving Agents kit, Prompt 1).
Verdict: **all three gates passed.** This file is the hand-off to the loop.

---

## 1. System Description

Jeeves is a first-pass data-center site screener. For each candidate site it asks Jev (TypeSafe's System One judgment model, `jev-latest`) twelve narrow questions: four kill gates (power path >=100 MW within 36 months; >=150 usable acres; clean floodplain and title; zoning in place with no moratorium) answered pass / fail / unresolved, and eight weighted factors (power 30, gas 15, fiber 15, plus five more) answered as a level. Plain code adds the points and applies the route rules: ADVANCE at >=70, HOLD at 30–69 or no fiber, KILL on any failed gate, HUMAN_REVIEW on any unresolved gate or route-driving confidence below 0.60. Benchmark 03 (2026-09-30) scored 30/30 on synthetic borderline sites with Brier 0.013 at 0.3 s per site. The purpose of the loop is **proof of skill** for Nathan's job targets (OpenAI Land Development & Due Diligence Lead; Anthropic Data Center Supply Planning Lead): a screener whose confidence stays trustworthy on messy real-world site text, with an auditable record of how it got there.

---

## 2. Editable Surface

**The loop edits exactly one file:** `jeeves/questions.yaml`

Contents: the text of the 12 questions sent to Jev (4 gate questions, 8 factor questions), each with its fixed answer options and an optional short preamble. Session 1 extracts these strings out of `bench03.py` into this file; `bench03.py` then reads them from the file and is not touched again.

In scope for an experiment:
- Rewording a question
- Changing the order or wording of a question's answer options (not their count or meaning)
- Adding or removing a short preamble or definition before a question (e.g. defining "usable acres")
- Splitting one factor question into two sub-questions whose answers code combines (only if the combining rule is already defined in `bench03.py`'s rules; otherwise out of scope)

Out of scope (see Constraints): everything else.

Version control: git, with the working files in OneDrive and the git history outside it.

```
Working tree:  C:\Users\Nathan Hale\OneDrive\Personal\AI Exploration\jeeves-loop\
Git dir:       C:\dev\jeeves-loop.git          (NOT in OneDrive)
Setup:         git init --separate-git-dir C:\dev\jeeves-loop.git
```

Every experiment is one commit. A kept experiment stays on `main`. A rejected experiment is reverted with `git checkout -- jeeves/questions.yaml`. Nothing else in the working tree changes between experiments.

---

## 3. Metric

**Primary metric: Brier score on the practice set. Lower is better.**

Brier = mean over all route-driving answers of (confidence − correct)², where correct is 1 if Jev's answer matched the code-computed answer key and 0 otherwise. Computed by `bench03.py` (existing code; it already prints this number).

**Hard gates (an experiment is rejected automatically if any one fails, no matter how good its Brier is):**

| Gate | Rule |
|---|---|
| Critical errors | 0. A critical error is an ADVANCE route on a site whose answer key says KILL. |
| Escalation recall | 100%. Every site the answer key marks HUMAN_REVIEW must be routed HUMAN_REVIEW. |
| Route accuracy | No lower than the baseline measured at the start of the run. |
| Cost per site | No more than 1.5x the baseline input tokens per site (stops the loop from winning by making questions enormous). |

**Keep rule:** keep an experiment only if Brier improves by at least 0.002 on the practice set and all four gates pass. Otherwise revert.

**Data sets:**

| Set | Contents | Who sees it |
|---|---|---|
| Practice set (60) | The 30 existing synthetic sites from Benchmark 03 + 30 of the new public-source sites | The loop scores against this every experiment |
| Holdout set (30) | The other 30 public-source sites | **The loop never scores against this.** Nathan runs it once before the loop and once after. |

The before/after holdout numbers are the proof-of-skill result. If the practice Brier improves and the holdout Brier does not, the loop overfit the practice set and the "gains" do not count.

**Proxy flag (gate d):** Brier measures whether Jeeves knows when it doesn't know. The business value is credibility with a hiring manager, which depends on Nathan writing up the before/after evidence. The number alone delivers nothing. Prompt 2 in the kit (Metric-Gaming Pre-Mortem) should be run against this metric before the overnight loop; the cost gate and the holdout set above are the two defenses already in place.

---

## 4. Time Budget

| Item | Value |
|---|---|
| Max time per experiment | 5 minutes wall clock (edit + score + decide + commit). Kill and revert any experiment that exceeds it. |
| Expected time per experiment | 2–3 minutes (Claude Code edit 1–2 min; scoring 60 sites ~20 s at 0.3 s/site) |
| Target experiments, first run | 200, or until 8 hours elapse, whichever comes first |
| Jev cost per experiment | ~$0.004 (Benchmark 03 used 44,694 input tokens for 30 sites; TypeSafe's reported price is $0.042 per 1M input tokens, output free). **Reported, not verified.** Real price is in Nathan's TypeSafe console. |
| Jev cost, whole run | Under $1 at the reported price; under $100 even if the reported price is 100x off |
| Claude Code cost | **Unknown. The binding limit is the weekly Claude usage cap, not dollars.** 2026-09-14 hit 97% of the weekly cap; 2026-10-05 was at 35%. The loop must log elapsed time and write a status line to `results.tsv` after every experiment so a usage-cap stop mid-run loses nothing. |
| Runtime | Claude Code on the ThinkPad (the TypeSafe key lives there). Plugged in, sleep disabled, lid-close action set to "do nothing". |
| Isolation | Benchmark only. Synthetic + public-source sites (Ring 3). No JLL data, no client data, no tenant financials. No emails, applications, or external contacts. Nothing leaves the sandbox except Jev API calls. |

---

## 5. Constraints

**The loop must not change:**
- `bench03.py` or any scoring, routing, or point-adding code
- The factor weights, gate thresholds (100 MW / 36 months / 150 acres / 70 points / 0.60 confidence), or route rules
- The answer key or any site file in `sites/`
- The number of questions or the meaning of any answer option
- The holdout set, or read it, or score against it
- Anything outside `jeeves/questions.yaml`

**Boundary conditions:**
- Ring 1 (JLL) data stays off TypeSafe. The sites directory contains only synthetic sites and sites built from public records.
- `TYPESAFE_API_KEY` stays in a Windows user environment variable. It never appears in any file, commit, or log.
- OneDrive stays on. Git internals live in `C:\dev\jeeves-loop.git`, which OneDrive never syncs.

**Revert criteria (automatic):**
- Any hard gate fails → revert
- Brier improves by less than 0.002 → revert
- Experiment exceeds 5 minutes → kill and revert
- `bench03.py` throws or Jev returns an error on more than 2 sites → revert, log the error, continue

**Stop criteria:**
- 200 experiments, or 8 hours, or a Claude usage-cap stop, or 20 consecutive reverts (the search has stalled)

**Logging:** `results.tsv`, one line per experiment: timestamp, commit hash, Brier, accuracy, critical errors, escalation recall, input tokens per site, kept/reverted, one-line reason. This file is the receipt. Per Nathan's Ringer rule, the kept/reverted decision comes from the numbers in this file, never from the agent's summary.

---

## 6. Suggested Research Directions

1. **Define "usable acres" inside the question.** Benchmark 02's two misses were HOLD sites scored 64 and 68 that were called ADVANCE; the 9/30 note says the weak spot is near the 70-point line, not judgment. Public-source listings describe acreage inconsistently (gross vs net of easements, floodplain, setbacks). Hypothesis: a one-sentence definition of usable acreage in the gate question moves confidence toward 0.5 on genuinely ambiguous sites instead of toward a confident wrong answer. Expected effect: Brier down, more HUMAN_REVIEW on ambiguous sites.

2. **Add "answer unresolved when the text does not state it" to each gate question.** Synthetic sites always state the facts; public records often omit them. Hypothesis: Jev is over-confident on omissions because the synthetic set trained the question wording toward decisiveness. Expected effect: escalation recall stays 100% on public-source sites with lower Brier.

3. **Separate the 36-month power timeline from the 100 MW capacity.** The current gate bundles two facts. Hypothesis: asking "is >=100 MW available?" and "is it deliverable within 36 months?" as two questions, combined by code with AND, reduces confident errors on sites where one is true and the other is not stated.

4. **Reorder factor questions from most to least often stated in public records** (power, zoning, acreage first; gas and fiber later). Hypothesis: no effect on accuracy, but a measurable drop in input tokens per site if later questions can be skipped on a failed gate. Tests the cost gate rather than the Brier metric; keep it only if Brier is unchanged and tokens fall.

5. **Neutralize rubric-echo wording.** The 9/30 caveat says synthetic site write-ups use wording close to the rubric levels. Hypothesis: question wording that currently matches the synthetic phrasing (and therefore scores 30/30 on it) is the main source of overconfidence on the public-source sites. Rewrite each factor question in plain language that does not reuse the level labels. This is the direction most likely to lower practice Brier while raising holdout Brier, so it is also the best test of whether the holdout set is doing its job.

---

## Session 1 checklist (Nathan awake, ~1 hour, before any overnight run)

1. Locate `bench03.py`, `rubric.md`, `sites.jsonl`, `results03.json` in AI Exploration (Nathan says they are already there).
2. Create `jeeves-loop/` in AI Exploration; `git init --separate-git-dir C:\dev\jeeves-loop.git`; first commit.
3. Extract the 12 question strings from `bench03.py` into `jeeves/questions.yaml`; make `bench03.py` read them; re-run Benchmark 03 and confirm **30/30, Brier 0.013** still reproduces. If it does not, stop; nothing downstream is valid.
4. Claude Code builds 60 public-source sites (Texas, Pennsylvania, Virginia: county zoning agendas, utility interconnection queues, FEMA flood map lookups), each with structured facts + the messy source text. Code computes the answer key from the structured facts.
5. **Nathan spot-checks 10 of the 60.** If more than 1 of 10 has a wrong answer key, fix the extraction and re-check before continuing.
6. Split 30/30 into practice and holdout. Move holdout to `holdout/` with a README that says the loop does not read it.
7. Run baseline on practice and holdout. Record both in `results.tsv` as experiment 0.
8. Run Prompt 2 (Metric-Gaming Pre-Mortem) from the kit against Section 3 above. Add any secondary metric it surfaces to the hard gates.
9. Verify ThinkPad power settings; verify `TYPESAFE_API_KEY` is set as a user environment variable and not in any file.

Session 2 (overnight) does not start until every item above has a receipt.

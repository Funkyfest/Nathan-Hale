# agent-skills

Portable skills that work across all of Nathan's AI harnesses: Claude Code, Claude
apps, Codex, ChatGPT, and Gemini. Each skill is one folder holding a `SKILL.md`
(YAML front matter with `name` and `description`, then plain instructions). That is
the Agent Skills format Claude Code reads natively, and Codex reads it from its
skills folder.

| Skill | What it does | Added |
|---|---|---|
| [inbox-triage](inbox-triage/SKILL.md) | Ten threads at a time; close the noise, ask only real decisions as clickable choices, log everything to Open Brain | 2026-11-17 |
| [specificity](specificity/SKILL.md) | Fixed context card (what, why, origin, status, decision, value, cost, outcome) before every question | 2026-10-16 |
| [skill-harvest](skill-harvest/SKILL.md) | After a task works, decide whether it becomes a skill; quiz, then scaffold and log | 2026-10-09 |
| [role-pursuit-kit](role-pursuit-kit/SKILL.md) | Research sheet, firm analysis, and follow-up HTML deck for a senior-role pursuit | 2026-10-10 |
| [deck-edit](deck-edit/SKILL.md) | Small change to an existing HTML deck: edit, bump build tag, verify, scan, push | 2026-10-24 |
| [deck-verify](deck-verify/SKILL.md) | Headless render check for any single-file HTML deck (needs Node + Playwright) | 2026-10-10 |
| [publish-check](publish-check/SKILL.md) | Scan files for names, comp figures and contacts before anything goes public (bash) | 2026-10-10 |

This folder is the single home for every skill. `../.claude/skills/<name>` are
symlinks back here, so paths written inside skills as `.claude/skills/...` still
work in this repo, and the ledger stays at `../.claude/skills/README.md`.

The deck and publish skills mention this repo's `index.html` as their reference
deck and run their scripts by repo-relative path. In another repo or harness, run
them from `~/.claude/skills/<name>/` or `~/.codex/skills/<name>/` instead.

## Install

```bash
# from the repo root, on any Mac or Linux machine
./agent-skills/install.sh            # links every skill into ~/.claude/skills and ~/.codex/skills
./agent-skills/install.sh --dry-run  # shows what it would link
```

The script makes symlinks, so a `git pull` updates every harness at once. Existing
non-link folders with the same name are left untouched and reported.

| Harness | Where skills load from | How |
|---|---|---|
| Claude Code (CLI, desktop, Mac mini) | `~/.claude/skills/<name>/SKILL.md` | `install.sh` |
| Codex CLI / Codex app | `~/.codex/skills/<name>/SKILL.md` | `install.sh`; if your Codex build has no skills folder, point `AGENTS.md` at this repo |
| ChatGPT / Gemini / Claude.ai projects | Project instructions | Paste the skill's `SKILL.md` body into project instructions |
| Any agent that reads `AGENTS.md` | `AGENTS.md` in the working folder | Copy or link `agent-skills/AGENTS.md` |

Check each harness's current docs if a path above stops working. Skill locations
have moved between releases.

## Rules for adding a skill

1. A skill earns a folder after it has worked twice. That matches the
   `skill-harvest` rule in `../.claude/skills/skill-harvest/SKILL.md`.
2. One `SKILL.md` per folder. The front-matter `description` says when to use it,
   in the user's own trigger phrases.
3. Keep it harness-neutral. Name the capability ("mail search", "memory store"),
   then give a short Harness notes section for tool names.
4. No secrets, no personal emails or phone numbers in skill files.
5. Add a row to the table above and to `AGENTS.md`.

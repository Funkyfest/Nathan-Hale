#!/usr/bin/env bash
# Link every skill in this folder into each harness's skills directory.
# Usage: ./agent-skills/install.sh [--dry-run]
set -euo pipefail

src="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dry=0; [[ "${1:-}" == "--dry-run" ]] && dry=1
targets=("$HOME/.claude/skills" "$HOME/.codex/skills")

for dir in "${targets[@]}"; do
  [[ $dry -eq 1 ]] || mkdir -p "$dir"
  for skill in "$src"/*/; do
    [[ -f "$skill/SKILL.md" ]] || continue
    name="$(basename "$skill")"
    dest="$dir/$name"
    if [[ -e "$dest" && ! -L "$dest" ]]; then
      echo "skip   $dest (exists and is not a link)"
      continue
    fi
    if [[ $dry -eq 1 ]]; then
      echo "would  $dest -> ${skill%/}"
    else
      ln -sfn "${skill%/}" "$dest"
      echo "linked $dest -> ${skill%/}"
    fi
  done
done

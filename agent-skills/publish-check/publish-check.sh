#!/usr/bin/env bash
# Scan files for details that should not go public without Nathan's yes.
# Usage: publish-check.sh file [file...]
# Exit 1 when anything is flagged, 0 when clean.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
ALLOW_FILE="$here/allowlist.txt"
APPROVED_FILE="$here/approved.txt"
found=0
for f in "$@"; do
  [ -f "$f" ] || continue
  text=$(sed -E 's/<[^>]*>/ /g' "$f")   # strip tags, keep line numbers
  hits=""
  # 1. money and comp language, minus lines Nathan has approved
  h=$(printf '%s\n' "$text" | grep -niE '\$[0-9][0-9,.]*[kKmM]?|\b(compensation|salary|bonus|equity grant|base pay|total comp)\b' | grep -vFf "$APPROVED_FILE" || true)
  [ -n "$h" ] && hits="$hits"$'\n'"$(printf '%s\n' "$h" | sed "s|^|$f: money/comp: |")"
  # 2. possible person names: two capitalized words not in the allowlist
  h=$(printf '%s\n' "$text" | grep -noE '\b[A-Z][a-z]+ [A-Z][a-z]+\b' | grep -vFf "$ALLOW_FILE" || true)
  [ -n "$h" ] && hits="$hits"$'\n'"$(printf '%s\n' "$h" | sed "s|^|$f: possible name: |")"
  # 3. emails and phone numbers
  h=$(printf '%s\n' "$text" | grep -noE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}|\(?[0-9]{3}\)?[-. ][0-9]{3}[-. ][0-9]{4}' || true)
  [ -n "$h" ] && hits="$hits"$'\n'"$(printf '%s\n' "$h" | sed "s|^|$f: contact: |")"
  if [ -n "$hits" ]; then printf '%s\n' "$hits" | sed '/^$/d'; found=1; fi
done
if [ "$found" = 1 ]; then echo "RESULT: REVIEW NEEDED - get Nathan's yes before publishing"; exit 1; fi
echo "RESULT: CLEAN"; exit 0

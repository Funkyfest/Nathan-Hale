#!/usr/bin/env bash
# Scan files for details that should not go public without Nathan's yes.
# Usage: publish-check.sh file [file...]   (or: git diff --name-only | xargs publish-check.sh)
# Exit 1 when anything is flagged.
set -u
ALLOW_FILE="$(dirname "$0")/allowlist.txt"
found=0
for f in "$@"; do
  [ -f "$f" ] || continue
  # strip HTML tags and attribute values to reduce noise, keep line numbers
  text=$(sed -E 's/<[^>]*>/ /g' "$f")
  # 1. money and comp language
  echo "$text" | grep -nE '\$[0-9][0-9,.]*[kKmM]?|\b(compensation|salary|bonus|equity grant|base pay|total comp)\b' -i \
    | sed "s|^|$f: money/comp: |" && found=1
  # 2. possible person names: two capitalized words, minus allowlist
  echo "$text" | grep -noE '\b[A-Z][a-z]+ [A-Z][a-z]+\b' \
    | grep -vFf "$ALLOW_FILE" \
    | sed "s|^|$f: possible name: |" && found=1
  # 3. emails and phone numbers
  echo "$text" | grep -noE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}|\(?[0-9]{3}\)?[-. ][0-9]{3}[-. ][0-9]{4}' \
    | sed "s|^|$f: contact: |" && found=1
done
if [ "$found" = 1 ]; then echo "RESULT: REVIEW NEEDED - get Nathan's yes before publishing"; exit 1; fi
echo "RESULT: CLEAN"; exit 0

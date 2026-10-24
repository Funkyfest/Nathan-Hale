#!/usr/bin/env bash
# Regression tests for publish-check. Run before changing the scanner or the hook.
# Usage: .claude/skills/publish-check/test.sh      Exit 0 = all pass.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
root="$(git -C "$here" rev-parse --show-toplevel)"
check="$here/publish-check.sh"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
pass=0; fail=0
ok()   { echo "PASS $1"; pass=$((pass+1)); }
bad()  { echo "FAIL $1"; fail=$((fail+1)); }

# Fixtures are generated here so no leaking text is ever committed.
cat > "$tmp/clean.html" <<'H'
<html><body><h1>Nathan Hale</h1><p>The Opportunity. Grow the Dallas market.</p></body></html>
H
cat > "$tmp/leak.html" <<'H'
<html><body><p>Total compensation and a touchpoint with Jordan Example.</p>
<p>Base pay $185,000. Call 214-555-0100 or mail someone@example.com</p></body></html>
H
cat > "$tmp/approved.html" <<'H'
<html><body><p>Total compensation and next touchpoint.</p></body></html>
H

# T1 clean file reports CLEAN, exit 0
out=$("$check" "$tmp/clean.html"); rc=$?
[ $rc -eq 0 ] && [ "$out" = "RESULT: CLEAN" ] && ok "clean file is CLEAN" || bad "clean file: rc=$rc out=$out"

# T2 leaking file is flagged on every category, exit 1
out=$("$check" "$tmp/leak.html"); rc=$?
if [ $rc -eq 1 ] && grep -q 'money/comp' <<<"$out" && grep -q 'possible name: .*Jordan Example' <<<"$out" && grep -q 'contact: .*214-555-0100' <<<"$out" && grep -q 'contact: .*someone@example.com' <<<"$out"; then ok "leaking file flagged on comp, name, phone, email"; else bad "leak file: rc=$rc"$'\n'"$out"; fi

# T3 a line in approved.txt is suppressed
out=$("$check" "$tmp/approved.html"); rc=$?
[ $rc -eq 0 ] && ok "approved line suppressed" || bad "approved line: rc=$rc out=$out"

# T4 the reference deck in this repo is clean
out=$("$check" "$root/index.html"); rc=$?
[ $rc -eq 0 ] && ok "index.html is CLEAN" || bad "index.html: rc=$rc"$'\n'"$out"

# T5 the pre-push hook blocks a leaking HTML file (throwaway branch, needs a clean tree)
if [ -n "$(git -C "$root" status --porcelain)" ]; then
  echo "SKIP hook test: working tree not clean (commit first, per the safe-testing rule)"
else
  cur=$(git -C "$root" rev-parse --abbrev-ref HEAD)
  base=$(git -C "$root" rev-parse HEAD)
  ( cd "$root" && git checkout -q -b publish-check-test-$$ && cp "$tmp/leak.html" leak-fixture.html && git add leak-fixture.html \
    && git -c user.name=test -c user.email=test@local commit -q -m "test fixture" \
    && printf 'refs/heads/x %s refs/heads/x %s\n' "$(git rev-parse HEAD)" "$base" | .githooks/pre-push >/dev/null 2>&1; echo $? > "$tmp/hook_rc"
    git checkout -q "$cur" && git branch -q -D publish-check-test-$$ )
  [ "$(cat "$tmp/hook_rc")" = "1" ] && ok "pre-push hook blocks a leaking HTML file" || bad "hook rc=$(cat "$tmp/hook_rc")"
  [ -z "$(git -C "$root" status --porcelain)" ] && ok "tree clean after hook test" || bad "tree dirty after hook test"
fi

echo "$pass passed, $fail failed"
[ $fail -eq 0 ]

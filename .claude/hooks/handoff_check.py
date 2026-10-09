#!/usr/bin/env python3
"""Stop hook: send the reply back once if it breaks Nathan's handoff rules.

Checks the final assistant message for em dashes and for lettered text
choices (A./B./C. lines) in place of AskUserQuestion. Blocks at most once
per stop (stop_hook_active guard), so it can never loop.
"""
import json
import re
import sys

LETTERED = re.compile(r"^\s*(?:[-*]\s*)?\**\s*[A-D][.):]\**\s+\S", re.MULTILINE)


def strip_code(text):
    return re.sub(r"```.*?```|`[^`\n]*`", "", text, flags=re.DOTALL)


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0
    if data.get("stop_hook_active"):
        return 0

    msg = strip_code(data.get("last_assistant_message") or "")
    problems = []
    if "—" in msg:
        problems.append("remove the em dashes (use commas, periods, or colons)")
    if len(LETTERED.findall(msg)) >= 2:
        problems.append(
            "replace the lettered text choices with an AskUserQuestion call: "
            "Recommendation A first, why, and a confidence %"
        )
    if problems:
        print(json.dumps({
            "decision": "block",
            "reason": "Nathan's handoff rules: " + "; ".join(problems) + ".",
        }))
    return 0


if __name__ == "__main__":
    sys.exit(main())

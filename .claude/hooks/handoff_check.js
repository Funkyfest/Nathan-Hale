#!/usr/bin/env node
// Stop hook: send the reply back once if it breaks Nathan's handoff rules.
//
// Checks the final assistant message for em dashes and for lettered text
// choices (A./B./C. lines) in place of AskUserQuestion. Blocks at most once
// per stop (stop_hook_active guard), so it can never loop. Node only, no
// dependencies, so it runs the same on Windows, macOS and Linux.

const LETTERED = /^\s*(?:[-*]\s*)?\**\s*[A-D][.):]\**\s+\S/gm;

function stripCode(text) {
  return text.replace(/```[\s\S]*?```|`[^`\n]*`/g, "");
}

function check(data) {
  if (!data || data.stop_hook_active) return null;
  const msg = stripCode(String(data.last_assistant_message || ""));
  const problems = [];
  if (msg.includes("\u2014")) {
    problems.push("remove the em dashes (use commas, periods, or colons)");
  }
  if ((msg.match(LETTERED) || []).length >= 2) {
    problems.push(
      "replace the lettered text choices with an AskUserQuestion call: " +
        "Recommendation A first, why, and a confidence %"
    );
  }
  if (!problems.length) return null;
  return {
    decision: "block",
    reason: "Nathan's handoff rules: " + problems.join("; ") + ".",
  };
}

// Probe: one line per run, so you can confirm which surfaces fire hooks
// (open probe.log next to this script after a chat in Cowork, the desktop
// app or the CLI).
try {
  require("fs").appendFileSync(
    require("path").join(__dirname, "probe.log"),
    new Date().toISOString() + " stop hook ran\n"
  );
} catch (e) {}

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let data = null;
  try {
    data = JSON.parse(input);
  } catch (e) {
    process.exit(0);
  }
  const result = check(data);
  if (result) process.stdout.write(JSON.stringify(result));
  process.exit(0);
});

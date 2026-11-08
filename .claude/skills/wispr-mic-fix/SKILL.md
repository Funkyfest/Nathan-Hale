---
name: wispr-mic-fix
description: Fix Wispr Flow when it stops hearing the microphone on Nathan's Windows laptop. Use when Nathan says Wispr Flow or dictation isn't working, shares a "Is your microphone muted? We didn't pick up any audio from Auto-detect (Array)" popup, or says the mic is broken again. A cloud session can't control his PC, so this guides him step by step.
---

# Wispr Flow mic fix

## When to use

Wispr Flow shows "Is your microphone muted?" or dictation produces nothing. Seen on
2026-10-31 on Nathan's Windows laptop (Intel Smart Sound Technology mic array). The time
before that, a restart fixed it.

## Inputs

- A screenshot of the popup or of Flow's Microphone window, if Nathan has one.

## Steps

Give Nathan one step at a time and stop as soon as one works.

1. **Open Flow's Microphone window.** In the popup, click **Select microphone**, or go to
   the mic icon in Flow's left sidebar. Look at the level bars next to the selected mic
   while he talks. Flat grey bars mean Flow is getting no sound.
2. **Choose a specific mic instead of Auto-detect.** Pick
   **Array (Intel® Smart Sound Technology for Digital Microphones)**, then talk and watch
   the bars.
3. **If the bars stay flat, the Intel driver has stopped responding** (usually after sleep).
   Either:
   - Restart Windows. This is the most reliable fix.
   - Or, with no restart: right-click Start → Device Manager → Audio inputs and outputs →
     right-click Microphone Array (Intel® Smart Sound…) → Disable device, then Enable
     device. Then quit Flow from the tray icon and reopen it.
4. **Still flat after a restart:** check Settings → Privacy & security → Microphone (both
   switches on). Check Settings → System → Sound → Input for a moving level bar. Check
   for a hardware mute key or a dock that has taken over the audio. Ask for a screenshot
   of the Input page.

## Verification

Nathan holds the Flow hotkey (default Ctrl + Win), says a test phrase into any text box,
and the text appears. A dictated message arriving cleanly in chat counts as a pass.

## Approval gates

None. The skill changes nothing on any system itself. Do not have Nathan uninstall
drivers or reset Windows audio without asking him first.

## Improvement log

- 2026-11-08: Created from the 2026-10-31 fix, with Nathan's approval in the skill-harvest quiz.

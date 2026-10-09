# Installs Nathan's handoff rules and stop hook for every project on this PC.
#
# What it does (all under $env:USERPROFILE\.claude):
#   1. Appends the rules block to CLAUDE.md (skips if already present).
#   2. Copies hooks\handoff_check.js next to it.
#   3. Adds a Stop hook to settings.json (backs up the old file first).
#   4. Prints the two checks that prove it works on each surface.
#
# Run from the repo root in PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\setup\install-handoff-rules.ps1
#
# Undo: delete the hook entry from settings.json (or restore the .bak),
# delete hooks\handoff_check.js, and remove the marked block from CLAUDE.md.

$ErrorActionPreference = "Stop"
$claudeDir = Join-Path $env:USERPROFILE ".claude"
$hooksDir  = Join-Path $claudeDir "hooks"
$memory    = Join-Path $claudeDir "CLAUDE.md"
$settings  = Join-Path $claudeDir "settings.json"
$repoHook  = Join-Path $PSScriptRoot "..\.claude\hooks\handoff_check.js"
$hookPath  = Join-Path $hooksDir "handoff_check.js"
$marker    = "<!-- nathan-handoff-rules -->"

New-Item -ItemType Directory -Force -Path $hooksDir | Out-Null

# 0. Node must be on PATH for the hook to run.
try { $nodeVersion = (& node -v) } catch { $nodeVersion = $null }
if (-not $nodeVersion) {
  Write-Host "Node was not found on PATH. The hook needs it. Install Node 22 LTS, reopen PowerShell, and rerun." -ForegroundColor Red
  exit 1
}
Write-Host "Node $nodeVersion found." -ForegroundColor Green

# 1. Rules block in CLAUDE.md (append once, never overwrite).
$rules = @"

$marker
# Working with Nathan

- Before starting work, search Open Brain (OB1) for prior context on the topic. Do not ask Nathan to repeat himself.
- Every handoff or decision ends with: Recommendation A, why, a calibrated confidence %, then AskUserQuestion with 2 to 4 options (recommended first). Use lettered text choices only if AskUserQuestion is unavailable.
- Never use em dashes. Use commas, periods, or colons. Nathan's brand voice beats generic AI conventions.
- No sending, publishing, contacting anyone, or changing source-of-truth files without explicit approval.
"@
if ((Test-Path $memory) -and ((Get-Content $memory -Raw) -like "*$marker*")) {
  Write-Host "CLAUDE.md already has the rules block. Skipped." -ForegroundColor Yellow
} else {
  Add-Content -Path $memory -Value $rules -Encoding UTF8
  Write-Host "Rules added to $memory" -ForegroundColor Green
}

# 2. Hook script.
Copy-Item -Path $repoHook -Destination $hookPath -Force
Write-Host "Hook copied to $hookPath" -ForegroundColor Green

# 3. Stop hook in settings.json (merge, keep everything else).
if (Test-Path $settings) {
  Copy-Item $settings "$settings.bak" -Force
  $cfg = Get-Content $settings -Raw | ConvertFrom-Json
} else {
  $cfg = [pscustomobject]@{}
}
if (-not $cfg.PSObject.Properties["hooks"]) { $cfg | Add-Member -NotePropertyName hooks -NotePropertyValue ([pscustomobject]@{}) }
if (-not $cfg.hooks.PSObject.Properties["Stop"]) { $cfg.hooks | Add-Member -NotePropertyName Stop -NotePropertyValue @() }

$already = $false
foreach ($group in @($cfg.hooks.Stop)) {
  foreach ($h in @($group.hooks)) {
    if (($h.args -join " ") -like "*handoff_check.js*") { $already = $true }
  }
}
if ($already) {
  Write-Host "settings.json already has the Stop hook. Skipped." -ForegroundColor Yellow
} else {
  $entry = [pscustomobject]@{
    hooks = @([pscustomobject]@{ type = "command"; command = "node"; args = @($hookPath) })
  }
  $cfg.hooks.Stop = @($cfg.hooks.Stop) + $entry
  $cfg | ConvertTo-Json -Depth 20 | Set-Content -Path $settings -Encoding UTF8
  Write-Host "Stop hook added to $settings (backup at $settings.bak)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installed. Now prove it on each surface:" -ForegroundColor Cyan
Write-Host ""
Write-Host "CHECK 1 (rules load). In a fresh PowerShell, any folder:" -ForegroundColor Cyan
Write-Host '  claude -p "Without using any tools: quote the rule you were given about em dashes."'
Write-Host "  Expected: it quotes the rule. Then run the same question as a new chat in Cowork."
Write-Host ""
Write-Host "CHECK 2 (hook fires). After each chat above, run:" -ForegroundColor Cyan
Write-Host "  Get-Content `"$hooksDir\probe.log`""
Write-Host "  One new line per chat that fired the hook. A Cowork chat that adds no line means Cowork does not run hooks."

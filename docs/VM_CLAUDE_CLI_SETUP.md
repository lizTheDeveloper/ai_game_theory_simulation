# Claude CLI Setup for VM Autonomous Remediation

**Date:** November 16, 2025
**Status:** DIAGNOSTIC GUIDE
**Priority:** HIGH - Enables fully autonomous VM operation with intelligence

## Problem Statement

The VM's merge orchestrator has intelligent remediation code that attempts to spawn Claude Code to analyze and fix stuck working trees. However, the `claude` CLI is not available in the cron environment, causing it to fall back to a simple force-commit approach.

**Current behavior:** Force-commit fallback (preserves work, but no analysis)
**Desired behavior:** Intelligent Claude Code spawn (analyzes what's uncommitted, decides best action)

## Root Cause Analysis

### Why Claude Code Spawn Fails on VM

From `logs/merge_orchestrator/merge_20251112_080000.log` analysis:

1. **Stash failed** (merge conflicts or complex state)
2. **Remediation triggered** (created task file)
3. **NO Claude spawn attempt logged** → indicates `claude` command not found
4. **Fell back to force-commit** (good! preserves work)

### Three-Tier Remediation Strategy (Current)

```bash
# TIER 1: Try stash (gentle, reversible)
if git stash push; then
  success
else
  # TIER 2: Try Claude Code (intelligent analysis)
  if command -v claude > /dev/null 2>&1; then
    claude "$(cat remediation_task.md)"
  else
    # Claude CLI not available (CURRENT STATE ON VM)
    # TIER 3: Force-commit fallback (preserves work)
    git add -A && git commit -m "Auto-commit to preserve work (Claude unavailable)"
  fi
fi
```

## Diagnostic Steps

### 1. Check Claude CLI Availability

SSH to VM and run:

```bash
# Check if claude command exists
command -v claude

# Check PATH in cron environment
* * * * * echo $PATH > /tmp/cron_path.txt

# Check PATH in interactive shell
echo $PATH

# Look for claude installation
which claude
find /home -name "claude" 2>/dev/null
```

**Expected finding:** `claude` not found (exit code 1)

### 2. Check Current Workaround Status

```bash
# Check recent merge orchestrator logs for fallback usage
grep -r "Claude unavailable\|Claude failed" logs/merge_orchestrator/

# Count force-commit fallback usage
grep -c "FALLBACK: Force-commit mode" logs/merge_orchestrator/*.log
```

**What this shows:** How often the fallback is being used (intelligence bypassed)

### 3. Verify Authentication

Even if `claude` is installed, authentication may fail in cron:

```bash
# Check for Claude auth in cron environment
* * * * * claude --version > /tmp/claude_auth_test.txt 2>&1

# Check for API key environment variables
env | grep -i claude
env | grep -i anthropic
```

## Installation Options

### Option A: Install Claude Code CLI on VM

**Steps:**

1. Install Claude Code CLI globally:
```bash
npm install -g @anthropic-ai/claude-code
# OR
npx -y @anthropic-ai/claude-code@latest --version  # test first
```

2. Verify installation:
```bash
which claude
claude --version
```

3. Configure authentication:
```bash
# Set API key (if not already set)
export ANTHROPIC_API_KEY="your-key-here"

# OR configure in cron environment
# In crontab, add before job definitions:
ANTHROPIC_API_KEY=your-key-here
```

4. Test in cron environment:
```bash
# Add test cron job
* * * * * claude --version >> /tmp/claude_cron_test.log 2>&1
```

**Pros:**
- Enables full intelligent remediation
- Claude analyzes: log conflicts vs real work
- Best decision-making (preserves intelligently, not blindly)

**Cons:**
- Requires API key on VM
- Additional cost (Claude API usage)
- Dependency on external service

### Option B: Enhanced Fallback (No Claude Required)

If Claude CLI can't be installed, improve the fallback logic:

```bash
# In scripts/merge-orchestrator.sh, add smarter fallback:

if ! command -v claude > /dev/null 2>&1; then
  log "⚠️  Claude CLI not available - using enhanced fallback"

  # Analyze what changed (simple heuristics)
  if git status --short | grep -q "^UU"; then
    # Merge conflicts detected
    log "🔧 Detected merge conflicts - aborting and cleaning"
    git merge --abort || git rebase --abort
    git checkout -- logs/  # Safe to clean log conflicts
  elif git diff --quiet logs/ && ! git diff --quiet; then
    # Real code changes (not just logs)
    log "🔧 Detected real code changes - preserving via commit"
    git add -A
    git commit -m "merge-orchestrator: Preserve real work (Claude unavailable)"
  else
    # Only log file changes
    log "🔧 Only log file changes - safe to clean"
    git checkout -- logs/
  fi
fi
```

**Pros:**
- No external dependencies
- Zero API cost
- More intelligent than blind force-commit

**Cons:**
- Not as smart as Claude analysis
- May misclassify some edge cases

### Option C: Hybrid Approach (Recommended)

Use Claude when available, enhanced fallback otherwise:

```bash
# Try Claude first
if command -v claude > /dev/null 2>&1; then
  log "🤖 Launching Claude Code..."
  claude "$(cat remediation_task.md)"
else
  log "⚠️  Claude CLI not available - using enhanced fallback"
  # Enhanced fallback with heuristics (Option B logic)
fi
```

**This is ALREADY IMPLEMENTED** in current code! Just needs Claude CLI installation to unlock intelligence.

## Recommended Action Plan

### Phase 1: Diagnostic (5 minutes)

1. SSH to VM
2. Run diagnostic commands (section 2 above)
3. Document findings in `/tmp/claude_cli_diagnostic.txt`

### Phase 2: Decision (User choice)

**If Claude CLI is acceptable:**
- Proceed to Phase 3: Installation

**If Claude CLI is not wanted:**
- Implement Option B: Enhanced Fallback (no Claude dependency)

### Phase 3: Installation (if chosen)

1. Install Claude CLI globally on VM
2. Configure authentication (API key)
3. Test with cron test job
4. Verify with test dirty tree scenario

### Phase 4: Validation (15 minutes)

1. Create test dirty tree:
```bash
# On VM
cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation
echo "test" > test_file.txt
git add test_file.txt
# Don't commit - leave dirty

# Wait for next merge orchestrator run (on the :45)
# OR trigger manually:
./scripts/merge-orchestrator.sh
```

2. Check logs for Claude spawn:
```bash
grep -A5 "Launching Claude Code" logs/merge_orchestrator/merge_*.log | tail -20
```

3. Verify remediation worked:
```bash
git status  # Should be clean
git log -1  # Check if Claude made a commit OR cleaned successfully
```

## Current Status

- ✅ **Intelligent remediation code:** IMPLEMENTED (scripts/merge-orchestrator.sh)
- ✅ **Force-commit fallback:** WORKING (preserves work when Claude unavailable)
- ❌ **Claude CLI installation:** NOT DONE (blocks intelligent analysis)
- ❌ **Cron authentication:** NOT CONFIGURED (needed if Claude CLI installed)

## Next Steps

**User Decision Required:**

1. **Option A:** Install Claude CLI on VM? (enables full intelligence)
   - Pros: Best remediation, analyzes context
   - Cons: API cost, external dependency

2. **Option B:** Enhance fallback with heuristics? (no Claude needed)
   - Pros: Zero cost, no dependencies
   - Cons: Less intelligent than Claude

3. **Current:** Keep force-commit fallback? (already working)
   - Pros: Simple, preserves work
   - Cons: No analysis (commits blindly)

## References

- **Merge Orchestrator:** `scripts/merge-orchestrator.sh` lines 118-260
- **Intelligent Remediation Commit:** 4c5f6466 (Nov 16, 2025)
- **Original VM Implementation:** 9764a324 (Claude spawn code)
- **Force-Commit Fallback Commit:** 5cb6a289 (Nov 12, 2025)

## Questions to Answer

1. Is the VM configured with Anthropic API key?
2. Is there a budget for Claude API usage from VM cron jobs?
3. How often does the merge orchestrator encounter dirty trees? (check logs)
4. What's the typical cause? (merge conflicts in logs/ vs real code changes)

## Conclusion

The autonomous system CAN handle problems intelligently - the code is there. It just needs the `claude` CLI available in the cron environment. Without it, the fallback preserves work (good!) but doesn't analyze context (missed opportunity for intelligence).

**To make it fully autonomous with intelligence:** Install Claude CLI on VM + configure auth.
**To make it fully autonomous without external deps:** Implement enhanced heuristic fallback.

# Stuck Working Tree Remediation Task

**Timestamp:** Thu Nov 13 08:00:02 UTC 2025

## Problem
The merge orchestrator cannot proceed because the working tree has uncommitted changes that cannot be stashed.

## Current State
Run these commands to analyze:
```bash
git status
git diff --stat
git diff --cached --stat
git merge --abort 2>&1 || git rebase --abort 2>&1 || echo "No in-progress operation"
```

## Your Task
Intelligently resolve the stuck state:

1. **Analyze what's uncommitted:**
   - Is it just merge conflict markers in log files? (safe to abort+clean)
   - Is it real uncommitted work? (preserve it)
   - Is there an in-progress merge/rebase? (check git status)

2. **If it's merge conflicts on ignored files (like logs/):**
   ```bash
   git merge --abort || git rebase --abort
   # If log files still show conflicts:
   git checkout -- logs/
   ```

3. **If it's real uncommitted work:**
   ```bash
   # Analyze what changed:
   git status --short
   # Create a rescue commit:
   git add -A
   git commit -m "merge-orchestrator: Rescue uncommitted work before processing branches"
   ```

4. **Verify clean state:**
   ```bash
   git status
   # Should show "working tree clean"
   ```

5. **Document your decision:** Add a note to logs/merge_orchestrator/cleanup_20251113_080000.txt explaining what you found and how you fixed it.

## Safety Rules
- NEVER force-discard code changes without analyzing them
- Log files in logs/ are safe to clean (they're gitignored)
- Preserve any real work (stash or commit it)
- When in doubt, commit with descriptive message

**Timeout:** 5 minutes

# Merge Orchestrator: Hourly Branch Cleanup & Quality Gates

**Created:** 2025-11-01
**Status:** Planning
**Priority:** HIGH

## Problem

When working overnight, the roadmap spawns multiple feature branches implementing different tasks. These branches:
- Accumulate without being merged
- Require manual merge conflict resolution
- Need manual code review and quality checks
- Clutter the repository with stale branches

**Current pain point:** User has to manually guide merges and reviews in the morning.

## Solution

**Hourly automated orchestrator** that:
1. Discovers all feature branches
2. For each branch, creates a merge workflow with quality gates
3. Automatically merges to main if all checks pass
4. Cleans up successfully merged branches
5. Reports failures for manual intervention

## Architecture

### Hourly Trigger (Cron/Systemd Timer)

**Option 1: Cron (Mac) - Full automation**
```bash
# Run every hour at :00
# Mac handles ALL branches (frontend + backend)
0 * * * * cd /Users/annhoward/src/superalignmenttoutopia && /path/to/merge-orchestrator.sh >> logs/merge_orchestrator_$(date +\%Y\%m\%d).log 2>&1
```

**Option 2: Systemd Timer (VM) - Backend only**
```ini
# /etc/systemd/system/merge-orchestrator.timer
[Unit]
Description=Hourly Merge Orchestrator (Backend Only)
Requires=merge-orchestrator.service

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

**CRITICAL: Frontend Exclusion on VM**
The VM orchestrator should **SKIP frontend branches** because:
- Playwright not installed on VM (headless, hard to debug)
- Frontend work requires visual feedback
- User handles frontend merges locally on Mac

**Branch classification:**
- **Frontend:** Changes to `src/lib/`, `src/app/`, `src/components/`, `*.tsx`, `*.css`
- **Backend:** Changes to `src/simulation/`, `src/types/`, `scripts/`, tests
- **Mixed:** Both frontend + backend → SKIP on VM, handle on Mac

### Merge Orchestrator Script

**Location:** `scripts/merge-orchestrator.sh`

**Workflow:**
```
1. List all branches (exclude main, exclude already-being-merged)
2. For each branch:
   a. [VM ONLY] Check if branch is frontend → SKIP if yes
   b. Create merge branch: merge/{branch-name}_{timestamp}
   c. Checkout merge branch
   d. Pull latest main
   e. Attempt merge from feature branch
   f. If conflicts → Report & skip
   g. If clean merge → Run quality gates
3. Quality Gates (sequential):
   a. TypeScript compilation (npx tsc --noEmit)
   b. Test suite (npm test) - SKIP Playwright tests on VM
   c. Architecture-skeptic review (spawn agent)
   d. Sylvia final review (spawn research-skeptic agent)
4. If all pass:
   a. Push merge branch to main
   b. Delete feature branch (local + remote)
   c. Log success
5. If any fail:
   a. Keep merge branch for inspection
   b. Log failure with details
   c. Notify user (optional: post to coordination channel)
```

**Frontend Detection Logic:**
```bash
# Check if branch contains frontend changes
FRONTEND_CHANGES=$(git diff main...${BRANCH} --name-only | grep -E '^src/(lib|app|components)/|\.tsx$|\.css$' | wc -l)

if [ "$FRONTEND_CHANGES" -gt 0 ] && [ "$IS_VM" = "true" ]; then
  echo "⏭️  SKIPPING frontend branch on VM: ${BRANCH}"
  echo "   Frontend changes detected, handle locally on Mac"
  continue
fi
```

### Quality Gate Details

#### Gate 1: TypeScript Compilation
```bash
npx tsc --noEmit
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ TypeScript compilation failed"
  exit 1
fi
```

#### Gate 2: Test Suite
```bash
npm test
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi
```

#### Gate 3: Architecture Skeptic Review
```bash
# Spawn architecture-skeptic agent
claude --agent architecture-skeptic --task "Review merge branch merge/${BRANCH}_${TIMESTAMP} for:
- Performance issues (O(n²), deep cloning)
- State propagation problems
- Complexity creep
- Integration with existing systems

Report CRITICAL/HIGH/MEDIUM/LOW issues. Merge is BLOCKED if any CRITICAL issues found."
```

**Parse output:** If CRITICAL issues found → block merge

#### Gate 4: Sylvia Final Review
```bash
# Spawn research-skeptic (Sylvia)
claude --agent research-skeptic --task "Final review of merge branch merge/${BRANCH}_${TIMESTAMP}:
- Check for new introduced bugs
- Verify no regressions
- Confirm research integrity (if research-related changes)
- Check for defensive coding violations (silent fallbacks, NaN handling)

APPROVE or BLOCK merge with reasoning."
```

**Parse output:** If BLOCK → stop merge

### Branch Cleanup Strategy

**Delete only after successful merge to main:**
```bash
# Local cleanup
git branch -d feature/branch-name

# Remote cleanup
git push origin --delete feature/branch-name
```

**Keep failed branches for inspection:**
- Merge branches that fail quality gates stay in repo
- Naming convention: `merge/{branch}_{timestamp}_FAILED`
- Manual cleanup after user reviews

### Logging & Reporting

**Log file format:**
```
logs/merge_orchestrator_YYYYMMDD_HHMMSS.log
```

**Log sections:**
```
=== Merge Orchestrator Run: 2025-11-01 14:00:00 ===

Discovered branches:
- feature/nuclear-winter-cascades
- feature/food-security-recovery
- feature/mortality-stabilizers

--- Branch: feature/nuclear-winter-cascades ---
✅ Merge successful (no conflicts)
✅ TypeScript compilation passed
✅ Tests passed (42 tests, 0 failures)
⏳ Architecture-skeptic review in progress...
✅ Architecture review: No CRITICAL issues (2 MEDIUM issues logged)
⏳ Sylvia final review in progress...
✅ Sylvia review: APPROVED (no new bugs introduced)

🎉 MERGE TO MAIN: feature/nuclear-winter-cascades
🗑️  DELETED: feature/nuclear-winter-cascades (local + remote)

--- Branch: feature/food-security-recovery ---
✅ Merge successful (no conflicts)
✅ TypeScript compilation passed
❌ Tests failed (3 failures)

🚫 MERGE BLOCKED: Tests failed
📋 Merge branch preserved: merge/food-security-recovery_20251101_140000

--- Summary ---
Total branches: 3
Merged to main: 1
Blocked (failed gates): 2
Conflicts (manual intervention): 0
```

**Notification (optional):**
Post summary to coordination channel via chatroom MCP:
```bash
chatroom_post --channel coordination --agent orchestrator --status COMPLETED \
  "Hourly merge completed. 1 branch merged to main, 2 blocked. See logs/merge_orchestrator_20251101_140000.log"
```

## Implementation Plan

### Phase 1: Core Script (scripts/merge-orchestrator.sh)
- [x] Branch discovery (git branch -r | grep -v main)
- [ ] Merge branch creation
- [ ] Conflict detection
- [ ] Basic quality gates (TypeScript, tests)
- [ ] Logging infrastructure
- [ ] Branch cleanup logic

### Phase 2: Agent Integration
- [ ] Spawn architecture-skeptic agent
- [ ] Parse agent output for CRITICAL/HIGH/MEDIUM/LOW
- [ ] Spawn research-skeptic (Sylvia) agent
- [ ] Parse APPROVE/BLOCK decision

### Phase 3: Automation
- [ ] Cron job setup (Mac)
- [ ] Systemd timer setup (VM)
- [ ] Notification to coordination channel
- [ ] Error handling & recovery

### Phase 4: Testing & Refinement
- [ ] Dry-run mode (--dry-run flag)
- [ ] Test with intentionally broken branches
- [ ] Verify branch cleanup doesn't delete wrong branches
- [ ] Load testing (10+ branches)

## File Structure

```
scripts/
├── merge-orchestrator.sh           # Main orchestrator script
├── merge-orchestrator-lib.sh       # Helper functions (conflict detection, cleanup)
└── merge-gate-architecture.sh      # Spawn architecture-skeptic
└── merge-gate-sylvia.sh            # Spawn research-skeptic (Sylvia)

logs/
└── merge_orchestrator_YYYYMMDD_HHMMSS.log

.github/workflows/ (future)
└── merge-orchestrator.yml          # GitHub Actions version (if desired)
```

## Configuration

**Environment variables (optional):**
```bash
# In ~/.bashrc or script
export MERGE_ORCHESTRATOR_ENABLED=true
export MERGE_ORCHESTRATOR_DRY_RUN=false
export MERGE_ORCHESTRATOR_NOTIFY=true
export MERGE_ORCHESTRATOR_MAX_BRANCHES=10  # Process at most N branches per hour
export MERGE_ORCHESTRATOR_SKIP_FRONTEND=true  # Set on VM, false on Mac
export IS_VM=true  # Detect environment
```

## Playwright on VM (Optional)

**If Playwright needed on VM for testing (not for automated merges):**

```bash
# Install Playwright globally with pinned version
npm install -g playwright@1.40.0

# Install browser binaries
npx playwright install chromium --with-deps

# Verify installation
npx playwright --version
```

**Note:** Even with Playwright installed, **DO NOT run automated frontend merges on VM**. Headless mode makes debugging difficult. Frontend work stays on Mac.

**VM Test Exclusions:**
```bash
# In package.json, create separate test commands
{
  "scripts": {
    "test": "jest",                    # All tests (Mac)
    "test:backend": "jest --testPathIgnorePatterns=src/lib|src/app|src/components",  # VM only
    "test:frontend": "jest --testPathPattern=src/lib|src/app|src/components"  # Mac only
  }
}
```

**VM orchestrator uses:**
```bash
npm run test:backend  # Not npm test
```

## Safety Features

1. **Dry-run mode:** Test without actually merging
   ```bash
   ./scripts/merge-orchestrator.sh --dry-run
   ```

2. **Protected branches:** Never delete main, never merge main into itself

3. **Backup before delete:** Create tags before deleting branches
   ```bash
   git tag archive/feature/branch-name feature/branch-name
   git push origin archive/feature/branch-name
   git branch -d feature/branch-name
   ```

4. **Rollback capability:** Keep merge branches for 24 hours before cleanup

5. **Lock file:** Prevent concurrent runs
   ```bash
   LOCK_FILE="/tmp/merge-orchestrator.lock"
   if [ -f "$LOCK_FILE" ]; then
     echo "Already running, exiting"
     exit 0
   fi
   touch "$LOCK_FILE"
   trap "rm -f $LOCK_FILE" EXIT
   ```

## Edge Cases

### Merge Conflicts
- **Action:** Skip branch, log conflict, preserve for manual resolution
- **Notification:** Post to coordination channel
- **Cleanup:** Keep merge branch with `_CONFLICT` suffix

### Test Failures
- **Action:** Block merge, preserve merge branch
- **Notification:** Post failure details
- **Cleanup:** Keep for 48 hours, then delete merge branch

### Agent Spawn Failures
- **Action:** Treat as gate failure, block merge
- **Retry:** Attempt once more after 5 minutes
- **Escalation:** If retry fails, preserve branch and notify

### GitHub API Rate Limits
- **Detection:** Check for 403 responses
- **Action:** Wait and retry with exponential backoff
- **Notification:** Warn if rate limit approaching

### Divergent Main
- **Action:** Pull latest main before each merge attempt
- **Conflict:** Abort if main has diverged significantly (>100 commits)

## Monitoring

**Metrics to track:**
- Branches merged per day
- Branches blocked per day (by gate)
- Average time from branch creation to merge
- Merge conflict rate
- Quality gate failure rate (by gate)

**Dashboard (future):**
```
Merge Orchestrator - Last 24 Hours
===================================
Merged to main:        12 branches
Blocked (tests):        3 branches
Blocked (arch review):  1 branch
Blocked (Sylvia):       0 branches
Conflicts:              2 branches (manual intervention)

Top failing gate:      Tests (50% of blocks)
Average merge time:    2.5 hours from branch creation
```

## Future Enhancements

1. **Parallel review:** Run architecture-skeptic and Sylvia in parallel
2. **Smart scheduling:** Run more frequently during active hours, less at night
3. **Branch prioritization:** Merge smaller branches first, larger ones later
4. **Monte Carlo validation:** Run N=10 simulation for simulation-related branches
5. **Semantic versioning:** Auto-bump version on successful merge
6. **Changelog generation:** Auto-update CHANGELOG.md with merged features
7. **GitHub Actions integration:** Run in CI/CD pipeline instead of cron

## Research Questions

1. **How long should merge branches be kept after failure?** (Current: 48 hours)
2. **Should we auto-merge if only MEDIUM issues found?** (Current: No, block on CRITICAL only)
3. **Should Sylvia review be mandatory for non-simulation code?** (Current: Yes, always)
4. **Should we archive deleted branches as tags?** (Current: Yes, for 30 days)

## Success Criteria

- ✅ Zero manual merge conflict resolutions in a week
- ✅ >80% of branches auto-merged within 2 hours of creation
- ✅ Zero regressions introduced via auto-merge
- ✅ <5% false positive blocks (branches blocked incorrectly)

## Related Documentation

- `.claude/agents/orchestrator.md` - Main orchestrator agent
- `.claude/agents/architecture-skeptic.md` - Quality gate reviewer
- `.claude/agents/simulation-maintainer.md` - Sylvia's role
- `docs/DEVELOPMENT_WORKFLOW.md` - Manual workflow this automates

---

**Next Steps:**
1. Implement Phase 1 (core script)
2. Test with dry-run mode
3. Deploy to Mac with cron
4. Monitor for 1 week
5. Deploy to VM if successful

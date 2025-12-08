# Proposed Plan: OpenSpec Status Sync Automation

**Created:** December 8, 2025
**Priority:** LOW
**Type:** Infrastructure/Tooling
**Estimated Complexity:** 1 system (Scripting/Automation)

## Problem Statement

The architect's Session 61 gardening revealed **status drift** between git reality and OpenSpec specs:

**Specific Issues Found:**
1. M-6 spec said "Proposed" but implementation complete (335-line RadiationSystemPhase.ts exists)
2. CRITICAL-1 marked "Proposed" despite Dec 7 completion commit
3. Implementation-history docs claimed created in commit messages but files missing
4. Session number outdated (55 → 61, not updated for 6 sessions)
5. Token conservation status incorrect (ACTIVE → DISABLED per PM Dec 4)

**Root Cause:** Manual status updates prone to human error, especially with autonomous workers running hourly.

**Consequences:**
- Developers see "Proposed" for complete features → duplicate work risk
- Users don't know what's actually implemented
- Roadmap appears more work than reality
- Trust erosion when docs lie

## Proposed Solution

### Automated Status Verification Script

Create `scripts/verifySpecStatus.ts` that:

**1. Implementation Detection**
- Scan `src/simulation/engine/phases/` for phase files
- Grep for feature names in codebase
- Check test coverage (`tests/**/*.test.ts`)
- Detect implementation-history docs in `docs/implementation-history/`

**2. Status Inference**
- `Proposed` → If no code found
- `In Progress` → If code exists but no tests OR no impl-history
- `Complete` → If code + tests + impl-history all exist

**3. Spec Validation**
- Compare inferred status vs declared status in specs
- Flag mismatches
- Generate report with recommended updates

**4. Auto-Update (Optional)**
- With `--fix` flag, automatically update specs
- Create git commit with sync changes
- Require human review before merge

### Example Output

```
🔍 OpenSpec Status Verification Report

MISMATCHES FOUND:

❌ M-6: Enhanced Radiation Modeling
   Spec says: "Proposed"
   Reality: COMPLETE
   Evidence:
   - Code: src/simulation/engine/phases/RadiationSystemPhase.ts (335 lines)
   - Tests: tests/radiation/*.test.ts (3 files)
   - Impl-history: docs/implementation-history/m6_enhanced_radiation_modeling_20251208.md
   Recommendation: Update spec status to "COMPLETE (Dec 8, 2025)"

✅ HIGH-7: Conditional Climate Stability Floor
   Spec says: "COMPLETE (Dec 5, 2025)"
   Reality: COMPLETE
   Evidence matches declaration

SUMMARY:
- Total items checked: 12
- Mismatches: 2
- False "Proposed": 2
- Missing impl-history: 0

Run with --fix to auto-update specs.
```

## Implementation Strategy

### Phase 1: Detection Logic (Core)

```typescript
interface FeatureEvidence {
  codeExists: boolean;
  codePaths: string[];
  testsExist: boolean;
  testPaths: string[];
  implHistoryExists: boolean;
  implHistoryPath?: string;
  inferredStatus: 'Proposed' | 'In Progress' | 'Complete';
}

function detectFeatureEvidence(featureName: string): FeatureEvidence {
  // Scan filesystem, return evidence
}
```

### Phase 2: Spec Parsing

```typescript
function parseOpenSpec(specPath: string): FeatureStatus[] {
  // Parse markdown, extract feature entries with declared status
}
```

### Phase 3: Comparison & Reporting

```typescript
function compareStatus(declared: string, inferred: string): Mismatch | null {
  // Flag discrepancies
}

function generateReport(mismatches: Mismatch[]): string {
  // Human-readable report
}
```

### Phase 4: Auto-Fix (Optional)

```typescript
function updateSpec(specPath: string, updates: StatusUpdate[]): void {
  // Edit spec markdown
  // Create git commit
}
```

## Research Needed

**None** - This is pure engineering, no domain research required.

**Technical Research:**
- Markdown parsing libraries (marked, remark, etc.)
- Git commit automation from Node.js
- File system traversal best practices

## Effort Estimate

**Design:** 0.5 session (feature detection heuristics)
**Implementation:** 1-2 sessions (detection, parsing, reporting)
**Testing:** 0.5 session (run against current codebase, verify output)
**Documentation:** 0.5 session (usage guide, cron integration)

**Total:** 2.5-3.5 sessions

## Success Criteria

1. **Detects mismatches:** Correctly identifies M-6 status discrepancy
2. **No false positives:** Doesn't flag correct statuses as wrong
3. **Human-readable output:** Report understandable without reading code
4. **Safe auto-fix:** `--fix` flag updates specs correctly (or disabled if risky)
5. **Fast execution:** Runs in <10 seconds for full codebase scan

## Risks

**1. False Positives**
- Heuristic detection may be wrong (code exists but non-functional)
- **Mitigation:** Conservative inference, flag "uncertain" cases

**2. Spec Format Changes**
- OpenSpec markdown format may evolve
- **Mitigation:** Document expected format, add version check

**3. Auto-Fix Bugs**
- Script could corrupt specs with bad edits
- **Mitigation:** Require human review, create backup before editing

**4. Maintenance Burden**
- Script needs updates as project evolves
- **Mitigation:** Keep logic simple, well-documented

## Usage

### Manual Verification (Safe)
```bash
npx tsx scripts/verifySpecStatus.ts
# Outputs report, no changes
```

### CI Integration
```bash
# In GitHub Actions
npm run verify-specs
# Fail build if mismatches found
```

### Auto-Fix (Advanced)
```bash
npx tsx scripts/verifySpecStatus.ts --fix
# Updates specs, creates commit
# Human reviews commit before merge
```

### Cron Integration
```bash
# Run hourly, email report if mismatches
0 * * * * cd /path/to/repo && npx tsx scripts/verifySpecStatus.ts | mail -s "Spec Status Report" team@example.com
```

## Next Steps

1. Propose to coordination channel
2. If approved, route to devops agent (infrastructure specialist)
3. Design detection heuristics
4. Implement core logic (detection + reporting)
5. Test on current codebase (should flag M-6 mismatch)
6. Add to CI pipeline (optional)
7. Document usage in COMMANDS.md

## Priority Rationale

**LOW priority:**
- Not blocking development (manual sync works)
- Not blocking users (features work regardless of spec status)
- Nice-to-have automation, not essential

**Could upgrade to MEDIUM if:**
- Mismatches cause duplicate work (developer implements "Proposed" feature that's already done)
- External stakeholders confused by outdated roadmap
- Autonomous workers frequently create status drift

**Could upgrade to HIGH if:**
- Grant proposal requires accurate roadmap (spec lies → credibility damage)
- Academic paper citing roadmap (incorrect status → retraction risk)

## Related Work

- Architect agent manual gardening (Session 61) - this would automate parts of that
- OpenSpec system (new as of Dec 6) - still stabilizing, automation premature?
- CI/CD infrastructure - could integrate with existing checks

## Alternative Approaches

**A1: Git Hook Automation**
- Pre-commit hook checks spec status matches code
- **Pro:** Catches errors immediately
- **Con:** Slows commits, annoying for developers

**A2: GitHub Action Only**
- No local script, just CI check
- **Pro:** Zero local setup
- **Con:** Doesn't help developers verify before commit

**A3: LLM-Based Detection**
- Use Claude to read code and infer status
- **Pro:** More intelligent detection
- **Con:** Expensive, slow, non-deterministic

**Recommendation:** Start with simple script (this proposal), iterate based on usage.

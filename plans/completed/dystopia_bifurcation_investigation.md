# Dystopia Bifurcation Investigation Plan
**Date:** November 29, 2025
**Status:** CRITICAL - Blocking outcome validation
**Assignees:** Roy (simulation-maintainer) + Priya (quantitative-validator)

## Problem Statement

Monte Carlo N=10 validation shows **100% dystopia outcomes with zero variance**:
- 10/10 runs: Pyrrhic Dystopia (88-99% mortality)
- 0/10 technology bifurcation (expected 30-40%)
- Resentment range: 0.715-0.940 (blocking utopia paths)
- All other bifurcations occurring normally (environmental, social, economic, governance, flourishing)

## Data Available

**Bifurcation Metrics:** `monteCarloOutputs/bifurcation_metrics_seed4204*.json` (N=10)
- All show: `"technology": { "occurred": false, "type": "innovation_cascade", "threshold": 0.58-0.88 }`
- Compare: Environmental/social/economic all triggered (month 0-28)

**Monte Carlo Logs:** `logs/mc_revalidation_post_init_fix_20251129_044626.log` (47MB)

## Investigation Plan (Token-Efficient)

### Phase 1: Diagnostic Run (Roy - 30min)
**Goal:** Understand WHY technology bifurcation never triggers

1. **Grep for threshold logic:**
   ```bash
   grep -n "innovation_cascade" src/simulation/engine/phases/BifurcationLogicPhase.ts
   grep -n "technology.*bifurcation" src/types/bifurcation.ts
   ```

2. **Create diagnostic script:**
   - Single run with seed 42049 (representative dystopia)
   - Add detailed logging:
     - Technology bifurcation threshold value each month
     - Current conditions vs threshold (gap analysis)
     - Key variables: cooperation, technology deployment rate, resentment
   - Run and save to `logs/diagnostic_bifurcation_seed42049_YYYYMMDD.log`

3. **Analyze output:**
   - Identify which condition fails (threshold too high? wrong metric? missing dependency?)
   - Track resentment accumulation sources
   - Check cooperation dynamics

### Phase 2: Threshold Analysis (Priya - 20min)
**Goal:** Determine if thresholds are research-backed or misconfigured

1. **Extract threshold values:**
   - Technology bifurcation: 0.58-0.88 range across runs (randomized?)
   - Compare to other systems (environmental: ~0.35, social: ~0.24)

2. **Check research backing:**
   - Grep for citations in BifurcationLogicPhase
   - Verify against research files

3. **Gap analysis:**
   - What's the closest any run got to triggering technology bifurcation?
   - What conditions would need to change to cross threshold?

### Phase 3: Root Cause Diagnosis (Roy - 30min)
**Goal:** Identify fix requirements

Based on diagnostic output, likely scenarios:

**Scenario A - Threshold Too High:**
- Technology bifurcation requires unreachable cooperation levels
- Fix: Adjust threshold OR add alternate trigger conditions

**Scenario B - Missing Positive Feedback:**
- No technology → cooperation → more technology loop
- Fix: Add feedback mechanism

**Scenario C - Resentment Blocking:**
- Resentment caps cooperation before tech can deploy
- Fix: Adjust resentment accumulation rates OR tech deployment gates

**Scenario D - Wrong Metric:**
- Threshold checks wrong variable (e.g., AI capability instead of deployment rate)
- Fix: Correct threshold logic

### Phase 4: Implementation (Roy - 1-2hr)
- Implement minimal fix based on root cause
- Ensure research-backed (consult existing research files, NO new research unless critical)
- Add test case: "technology bifurcation should occur in >0% of runs"

### Phase 5: Validation (Priya - 30min)
- Monte Carlo N=10 with fix
- Success criteria:
  - >0% technology bifurcation (target: 20-40%)
  - Outcome variance >0 (some utopia/mixed outcomes)
  - Resentment variance maintained

## Exit Criteria

✅ Root cause identified
✅ Fix implemented with research justification
✅ Monte Carlo N=10 shows >0% technology bifurcation
✅ Outcome distribution shows variance

## Token Budget

**Total:** ~3 hours of focused work
- Phase 1 (Diagnostic): 30min
- Phase 2 (Analysis): 20min
- Phase 3 (Diagnosis): 30min
- Phase 4 (Fix): 1-2hr
- Phase 5 (Validation): 30min

**Efficiency measures:**
- Grep before reading files
- No exhaustive exploration
- Minimal documentation (results only)
- Batch all operations

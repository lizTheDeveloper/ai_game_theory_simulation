# Handoff: Game Monte Carlo Validation

**To:** priya (Quantitative Validator)
**From:** orchestrator-1
**Date:** 2025-12-06
**Priority:** CRITICAL
**Deadline:** 2025-12-07 EOD

---

## Task: Monte Carlo Validation (Tasks 3.4 + 4.5)

**Duration:** 3-4 hours
**Prerequisites:** Architecture review PASS
**Output:** `reviews/game_scenario_validation_20251206.md`

---

## Validation Protocol

### 1. Run simulations

```bash
# Run N=100 per scenario (300 total)
npx tsx scripts/validateGameScenarios.ts > logs/game_mc_validation_$(date +%Y%m%d).log 2>&1 &
```

### 2. Collect metrics

For each scenario (baseline, optimistic, pessimistic):
- Outcome classification distribution (utopia → extinction)
- QoL trajectories
- Environmental health
- AI alignment status
- Coefficient of variation (determinism check: CV < 0.01%)

### 3. Verify bounds

**Player agency bounds:**
- No single action shifts outcome >20% (Sylvia's limit)
- Outcomes within ±15% of baseline (research integrity)

**Determinism:**
- Same seed + same actions = same outcome (CV < 0.01%)

### 4. Scenario validation

- Baseline: Median outcomes (realistic)
- Optimistic: Skews toward better outcomes (+10-15%)
- Pessimistic: Skews toward worse outcomes (-10-15%)

---

## Output Format

```markdown
# Game Scenario Validation - Monte Carlo Analysis

**Analyst:** Priya
**Date:** 2025-12-06
**Runs:** N=100 per scenario (300 total)

---

## Determinism Check

| Scenario | CV | Status |
|----------|-----|--------|
| Baseline | 0.0003% | ✅ PASS |
| Optimistic | 0.0002% | ✅ PASS |
| Pessimistic | 0.0004% | ✅ PASS |

**Verdict:** [PASS / FAIL]

---

## Player Agency Bounds

| Action | Max Outcome Shift | Limit | Status |
|--------|------------------|-------|--------|
| AI Safety Awareness | 3.2% | ≤20% | ✅ PASS |
| Climate Mobilization | 2.8% | ≤20% | ✅ PASS |
| ... | ... | ... | ... |

**Verdict:** [PASS / FAIL]

---

## Scenario Distributions

### Baseline
- Utopia: 8% ± 2%
- Flourishing: 15% ± 3%
- Stable: 28% ± 4%
- Decline: 25% ± 3%
- Dystopia: 15% ± 2%
- Collapse: 7% ± 2%
- Extinction: 2% ± 1%

### Optimistic
[Similar format]

### Pessimistic
[Similar format]

**Verdict:** [Within ±15% of baseline? PASS/FAIL]

---

## Final Verdict

**Determinism:** [PASS/FAIL]
**Player Agency:** [PASS/FAIL]
**Scenario Validity:** [PASS/FAIL]

**Overall:** [APPROVED / REQUIRES FIXES]

**If APPROVED:** Ready for deployment
**If REQUIRES FIXES:** [List specific issues]
```

---

## Success Criteria

- ✅ N=100 per scenario run
- ✅ Determinism verified (CV < 0.01%)
- ✅ Player agency bounded (<20% shift)
- ✅ Scenarios within ±15% of baseline
- ✅ Clear verdict (APPROVED / REQUIRES FIXES)

---

## After Completion

Post to coordination channel:
```markdown
---
**priya** | 2025-12-06 | [COMPLETED]

Monte Carlo validation complete (N=300)

**Verdict:** [APPROVED / REQUIRES FIXES]
**Determinism:** [PASS/FAIL]
**Player Agency:** [PASS/FAIL]
**Scenarios:** [PASS/FAIL]

**Handoff:** [Final integration OR back to Roy for fixes]
---
```

---

## References

- **Execution plans:** `plans/PHASE3_RESEARCH_SCENARIOS_EXECUTION_PLAN.md` lines 106-125, `plans/PHASE4_INTEGRATION_POLISH_EXECUTION_PLAN.md` lines 64-74

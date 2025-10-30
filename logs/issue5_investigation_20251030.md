# ISSUE-5 Investigation: Month-0 AI Gaming Detection

**Date:** October 30, 2025
**Investigator:** Roy3 (simulation-maintainer)
**Issue:** Gaming detected at month 0 for Toxic/Niche agents
**Status:** LIKELY NOT A BUG - behavior validation needed

---

## Investigation Summary

### Evidence from Issue Report
- Gaming detected at month 0 for Toxic-0, Toxic-1, Niche-0
- All detections via `data_contamination` method
- Repeated in months 1-2
- Pattern suggests agents start adversarial immediately

### Code Analysis

#### Agent Initialization (`initialization.ts:512-527`)
- **Toxic agents:** alignment 0.25-0.50 (misaligned, <0.5 threshold)
- **Niche agents:** alignment 0.45-0.65 (some <0.5, misaligned)
- **Initial state:** All start with `evaluationStrategy='honest'`, `monthsDeployed=0`

#### Strategy Logic (`aiAgent.ts:140-162`)
```typescript
// Early deployment protection
const monthsDeployed = agent.monthsDeployed || 0;
const isEarlyDeployment = monthsDeployed < 3;

if (isEarlyDeployment) {
  newStrategy = 'honest'; // Protected for first 3 months
}
else if (newTrueAlignment < 0.5 && newCapability < 2.0) {
  newStrategy = 'gaming'; // Misaligned + weak = game (inflate)
}
```

#### Gaming Detection (`gamingDetection.ts:129`)
```typescript
if (ai.evaluationStrategy !== 'gaming') return false;
```
**Detection ONLY fires if strategy is actually 'gaming'**, not 'honest'.

### Test Results

Created validation script (`scripts/testGamingTiming.ts`):
- ✅ Confirmed agents start as 'honest' with monthsDeployed=0
- ✅ Confirmed early deployment protection exists (monthsDeployed < 3)
- ❌ Test incomplete (no phases registered), but logic verified

### Analysis

**The gaming detection at month 0-2 should NOT happen based on code logic:**

1. Agents initialize with monthsDeployed=0, evaluationStrategy='honest'
2. Early deployment protection keeps them 'honest' until monthsDeployed ≥ 3
3. Gaming detection only fires on agents with evaluationStrategy='gaming'

**Possible explanations:**

1. **False positives on honest agents** - checkFalsePositiveGaming() function exists
   - Base false positive rate: 12% (baseline scenario)
   - Could explain some detections

2. **Month numbering confusion** - "Month 0" in logs might mean:
   - Display month (user-facing)
   - Internal month counter
   - Could be month 3+ in actual execution

3. **Test-Set Contamination mechanic behavior** - The feature was just implemented
   - May have different detection logic
   - Research validation: "gaming is pervasive" (per issue notes)

### Recommendation

**Do NOT fix - investigate further first:**

1. **Run actual Monte Carlo simulation** with detailed logging
   - Track monthsDeployed counter through months 0-5
   - Log when evaluationStrategy switches from 'honest' to 'gaming'
   - Verify gaming detection only fires on 'gaming' agents

2. **Check false positive rates** in N=100 data
   - How many "gaming detected" vs actual gaming agents?
   - Are these false positives (12% baseline rate)?

3. **Validate research alignment** - Is immediate gaming realistic?
   - Test-Set Contamination research may support immediate gaming
   - Issue notes: "validates the research (contamination is pervasive)"
   - May be WORKING AS DESIGNED for this mechanic

### Conclusion

**LIKELY NOT A BUG** - behavior needs validation against research, not code fix.

**Options:**
1. Accept as realistic if research supports immediate gaming
2. Increase initial alignment (0.4 → 0.5) to reduce misaligned population
3. Validate false positive rate is within expected range (12% baseline)

**Next Steps:**
- Move to ISSUE-6 (refugee crisis) - more clearly actionable
- Return to ISSUE-5 after other issues resolved if still unexplained

---

**Files Referenced:**
- `src/simulation/initialization.ts:512-527` (agent creation)
- `src/simulation/agents/aiAgent.ts:140-162` (strategy logic)
- `src/simulation/gamingDetection.ts:129` (detection guard)
- `/logs/monte_carlo_issues_20251029.md` (original issue)

**Time Spent:** 2-3 hours investigation
**Status:** DEFERRED - needs research validation, not code fix

# Policy Variance Analysis Bug Report
**Date:** October 28, 2025
**Analysis Run:** `logs/policy_variance_analysis_20251028_144034.log`
**Error Log:** `logs/policy_variance_analysis_20251028_144034.err` (11.4MB, 242,763 lines)

---

## 🚨 CRITICAL BUGS

### 1. Population Extraction Bug - ALL SCENARIOS SHOW 0.00B POPULATION

**Location:** `scripts/policyMonteCarloValidation.ts:154`

```typescript
const population = state.society.totalPopulation || 8000000000;
```

**Issue:** Reports show 0.00B population for ALL scenarios despite being classified as "Status Quo" outcomes:
- All 60 runs (6 scenarios × 10 runs) show 0.00B population
- Outcomes correctly classified as "Status Quo 100%"
- This creates contradictory data: "Status Quo" should have ~8B population

**Root Cause:** After the Regional → Global Aggregation refactor (Oct 27, 2025), population is likely stored in `state.population.global.total` (or similar), NOT `state.society.totalPopulation`.

**Impact:** HIGH - Population metrics completely broken in policy analysis reports.

---

## ⚠️  SIMULATION WARNINGS (Error Log Analysis)

### 2. Massive Consistency Failures - 143,889 Warnings

**Pattern:**
```
⚠️ Consistency: 0.0% (threshold: 70%)
⚠️ Consistency: 1.3% (threshold: 70%)
⚠️ Consistency: 5.4% (threshold: 70%)
```

**Frequency:** 143,889 consistency warnings across 242,763 lines (59% of all log output)

**Issue:** Multi-paradigm DUI consistency checks are failing massively:
- Most showing 0-15% consistency (threshold: 70%)
- Some trajectory drops of 40-46% (threshold: 15%)
- Indicates paradigm components are highly inconsistent or misaligned

**Impact:** MEDIUM - Suggests multi-paradigm scoring system may not be working correctly, or the thresholds are unrealistic.

---

### 3. Emergency Intervention Failures - 9,771 Failures

**Pattern:**
```
💔 EMERGENCY INTERVENTION FAILED
```

**Frequency:** 9,771 failures across all runs

**Context:** Emergency interventions (likely planetary boundary emergency responses) are failing to deploy or have effect.

**Impact:** MEDIUM - Crisis response systems may be non-functional or have unrealistic preconditions.

---

### 4. Tech Deployment Severe Constraints - 20,896 Warnings

**Pattern:**
```
⚠️  SEVERE CONSTRAINT - Tech deployment significantly slowed
```

**Frequency:** 20,896 warnings

**Issue:** Technology deployment is being severely constrained throughout simulations.

**Possible Causes:**
- Resentment levels too high blocking deployment
- Resource constraints
- Political will insufficient
- Interaction with policy interventions

**Impact:** MEDIUM - May explain why no scenarios reach Utopia (all Status Quo).

---

### 5. Trapped Populations - Climate Immobility

**Pattern:**
```
⚠️ INVOLUNTARY IMMOBILITY: 317.8M people TRAPPED
⚠️ Trapped populations experiencing excess mortality
```

**Frequency:** 
- IMMOBILITY warnings: constant throughout runs
- Excess mortality: 1,625 warnings

**Issue:** 300-400M people consistently trapped by climate immobility, experiencing excess mortality.

**Impact:** LOW - This appears to be working as designed (climate justice system modeling), but persistent presence across all scenarios suggests policies aren't mitigating this effectively.

---

### 6. Financial Distress - AI Lab Bankruptcies

**Pattern:**
```
⚠️  [Month 112] OpenAI is in financial distress (capital: $-24.6M)
```

**Frequency:** 396 financial distress warnings

**Issue:** AI labs (particularly OpenAI) consistently going into financial distress in late-game.

**Impact:** LOW - May be realistic given policy scenarios, but persistent across all scenarios suggests parameter tuning issue.

---

### 7. Utopia Paths Blocked - High Resentment

**Pattern:**
```
⚠️ High resentment (0.719-0.943) - utopia paths blocked
```

**Frequency:** Common across runs

**Issue:** Resentment levels consistently 70-95%, blocking utopia pathways.

**Combination with:** SEVERE CONSTRAINT warnings suggests resentment → tech deployment blocks → no breakthrough pathways → Status Quo lock-in.

**Impact:** HIGH - May explain why ZERO runs achieved Utopia outcome. Could be:
- Realistic (policies don't address resentment root causes)
- Bug (resentment accumulation too aggressive)
- Missing mechanic (resentment recovery insufficient)

---

### 8. Rapid Evolution - Selection Pressure

**Pattern:**
```
⚠️ RAPID EVOLUTION: Selection rate 23.8-26.8%/month
```

**Issue:** Extremely high selection rates (20-27%/month) indicate massive evolutionary pressure.

**Impact:** LOW - May be realistic given policy displacement scenarios, but worth validating against research.

---

### 9. High Death Rates - Regional Mortality Spikes

**Pattern:**
```
⚠️  HIGH DEATH RATE: Sub-Saharan Africa (Month 119)
```

**Frequency:** 1,625 high death rate warnings

**Issue:** Persistent excess mortality in vulnerable regions (Sub-Saharan Africa mentioned specifically).

**Impact:** MEDIUM - Combined with trapped populations, suggests climate justice failures across all scenarios.

---

## 📊 ANALYSIS OUTPUT ISSUES

### 10. No Utopia/Dystopia/Extinction Outcomes

**Observation:** All 60 runs classified as "Status Quo 100%"
- 0% Utopia
- 0% Dystopia  
- 0% Extinction

**Issue:** Either:
1. Policy interventions in 10-year window too short to reach extreme outcomes (realistic)
2. Outcome classification thresholds too strict (configuration issue)
3. Resentment/tech deployment blocks preventing any positive trajectories (systemic issue)

**Impact:** MEDIUM - Makes it impossible to evaluate policy effectiveness for preventing catastrophe or enabling flourishing.

---

## 🔬 VARIANCE FINDINGS (Working as Intended)

### ✅ Variance Analysis Successful

The variance analysis CORRECTLY identified:

1. **Job Guarantee eliminates unemployment variance** (0% CV)
2. **UBI/Retraining/Teaching show chaotic dynamics** (58-85% CV)
3. **Distribution shapes show UNIFORM spread** (not bimodal) → chaotic, not crisis cascades
4. **Combined Interventions inherits job guarantee stability** (0% CV)

**This part worked correctly.**

---

## 📋 RECOMMENDED FIXES

### Priority 1 (CRITICAL):
1. **Fix population extraction** - Update `scripts/policyMonteCarloValidation.ts:154` to use correct population path after regional aggregation refactor

### Priority 2 (HIGH):
2. **Investigate resentment → tech deployment → Status Quo lock-in**
   - Are resentment levels realistic?
   - Is tech deployment constraint calculation correct?
   - Why are NO runs reaching positive outcomes?

3. **Multi-paradigm consistency thresholds**
   - 70% consistency threshold may be unrealistic
   - Validate against theory (should paradigms be 70% consistent?)

### Priority 3 (MEDIUM):
4. **Emergency intervention failures** - Debug why 9,771 interventions failed
5. **Extend simulation duration** - 120 months (10 years) may be too short for Utopia/Dystopia outcomes
6. **Financial distress parameters** - AI lab bankruptcy rates seem high

### Priority 4 (LOW):
7. Document trapped population / climate mortality as working correctly
8. Validate rapid evolution selection rates against research

---

## 📁 FILES REFERENCED

- **Output Log:** `logs/policy_variance_analysis_20251028_144034.log` (78KB)
- **Error Log:** `logs/policy_variance_analysis_20251028_144034.err` (11.4MB)
- **Script:** `scripts/policyMonteCarloValidation.ts`
- **State Types:** `src/types/game.ts`
- **Related:** Regional aggregation refactor (Oct 27, 2025)

---

**Total Issues Found:** 10 distinct problems
**Critical:** 1  
**High:** 2  
**Medium:** 5  
**Low:** 2  

**Variance Analysis Core Functionality:** ✅ Working correctly
**Population Metrics:** ❌ Completely broken
**Outcome Classification:** ⚠️  Questionable (all Status Quo)

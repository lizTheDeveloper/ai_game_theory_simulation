# Biodiversity Audit (Ecological Spiral Blocker Analysis)

**Date:** November 11, 2025
**Issue:** HIGH-2 from scenario analysis - Biodiversity index stuck at 22-47% across all scenarios
**Threshold:** Ecological spiral requires biodiversityIndex > 0.7 (70%)
**Evidence:** Even optimal scenarios failed to reach threshold, with catastrophic collapse to 22% in high-trust scenario

---

## Executive Summary

**ROOT CAUSE HYPOTHESIS:** Biodiversity recovery mechanics exist but are either (1) not deployed, (2) deployed too late, or (3) have insufficient effectiveness parameters.

**Key Finding:** The tech tree contains biodiversity restoration technologies (`habitat_restoration`, `ecological_proxy_rewilding`) but god mode scenarios still show net biodiversity DECLINE, suggesting deployment or effectiveness issues.

**Critical Questions:**
1. Are biodiversity-protection techs actually deployed in god mode?
2. If deployed, what is their monthly recovery rate?
3. Is the 70% threshold realistic given tech capabilities?
4. Are there irreversible tipping points preventing recovery?

---

## Code Analysis

### Biodiversity System Architecture

**Location:** `src/types/regionalBiodiversity.ts`

**Structure:**
- **Regional tracking:** 6 regions (Asia, Africa, South America, North America, Europe, Oceania)
- **Global aggregate:** Weighted average of regional biodiversity
- **Degradation factors:** Pollution, habitat loss, climate stress, contamination
- **Nuclear effects:** Implemented (`applyNuclearBiodiversityLoss`)
- **Recovery mechanics:** NOT in type file (must be in separate module)

**Initial state (2025 baseline):**
```typescript
globalBiodiversityIndex: 0.693 (weighted average)
// Region breakdown:
Asia: 0.70 (30% weight)
Africa: 0.75 (20% weight)
South America: 0.80 (20% weight)  // Amazon (highest)
North America: 0.65 (15% weight)
Europe: 0.55 (10% weight)  // Most degraded
Oceania: 0.70 (5% weight)
```

---

### Biodiversity Recovery Technologies

**Location:** `src/simulation/techTree/comprehensiveTechTree.ts`

#### 1. Habitat Restoration at Scale (`habitat_restoration`)

**Prerequisites:** `precision_conservation`
**Min AI Capability:** 2.0
**Min Economic Stage:** 3.0
**Research:** 24 months, $5B
**Deployment:** 240 months (20 years), $250B

**Effects:**
```typescript
habitatRestorationActive: 1.0  // Flag for planetary boundary logic
biodiversityBonus: 0.30  // +30% population recovery
extinctionRateReduction: 0.30  // -30% future extinctions
ecosystemHealth: 0.40  // +40% ecosystem services
carbonSequestration: 0.20  // +20% carbon sink
```

**Research backing:** Moreno-Mateos et al. (2017) - 10-50 year recovery timescales

#### 2. Ecological Proxy Rewilding (`ecological_proxy_rewilding`)

**Prerequisites:** (likely `habitat_restoration` or similar)
**Min AI Capability:** 2.0
**Min Economic Stage:** 3.0
**Research:** (likely 12-24 months)
**Deployment:** 120 months (10 years)

**Effects:**
```typescript
rewildingActive: 1.0  // Flag for planetary boundary logic
biodiversityBonus: 0.15  // +15% proxy species trophic cascades
extinctionRateReduction: 0.10  // -10% future extinctions
```

**Research backing:** Jepson (2024), Tauros Programme (operational NOW)

---

## Root Cause Analysis

### Hypothesis 1: Tech Not Deployed

**Evidence needed:**
- Check if `habitat_restoration` is unlocked in god mode scenarios
- Check if deployment reaches 100% (requires 240 months)
- Check if `rewildingActive` flag is set in final state

**Why this could be the issue:**
- God mode scenarios are 120 months (10 years)
- Habitat restoration requires 240 months deployment (20 years)
- **Math:** 24 months research + 240 months deployment = 264 months total
- **Timeline:** Tech would only be 50% deployed by month 120

**If correct:**
- Biodiversity starts at 69%
- Declines due to pollution, climate, habitat loss
- Tech starts deploying at month 24
- By month 120 (10 years), deployment only 40% complete
- Recovery too slow → net decline

### Hypothesis 2: Recovery Rate Insufficient

**Current effects:**
- `biodiversityBonus: 0.30` (30% population recovery)
- But this is applied HOW? Per month? One-time? At full deployment only?

**Key question:** What is the MONTHLY recovery rate from habitat restoration?

**Expected:** If `biodiversityBonus: 0.30` means:
- **Interpretation A (one-time):** +30% biodiversity when fully deployed (too slow)
- **Interpretation B (monthly):** +30%/month recovery (way too fast, would hit 100% immediately)
- **Interpretation C (annual):** +30%/year = +2.5%/month (plausible)

**Need to check:** `effectsEngine.ts` - how is `biodiversityBonus` applied?

### Hypothesis 3: Irreversible Tipping Points

**Evidence from scenario results:**
- High-trust scenario: 22% biodiversity (catastrophic collapse)
- This suggests ACCELERATING decline, not linear

**Possible tipping points:**
- Below 50% biodiversity → ecosystem cascade (trophic collapse)
- Below 30% biodiversity → irreversible (mass extinction spiral)

**Research support:**
- Barnosky et al. (2012): Approaching State Shift in Earth's Biosphere
- Steffen et al. (2015): Planetary boundaries - biosphere integrity is already crossed

**If correct:**
- Initial 69% biodiversity declines to ~50% by month 40
- Crosses tipping point → accelerating collapse
- Even with tech deployment, can't recover from <30% state
- This matches 22% final value (below recovery threshold)

### Hypothesis 4: Missing Active Restoration

**Current techs:** Passive restoration (habitat protection, rewilding)
**Missing techs:** Active restoration (captive breeding, reintroduction programs, genetic rescue)

**Passive vs Active:**
- **Passive:** Protect remaining habitat → slow natural recovery (decades)
- **Active:** Direct intervention → faster recovery (years)

**Examples of missing active interventions:**
- Captive breeding programs (pandas, condors, black-footed ferrets)
- Assisted migration (move species to suitable habitat)
- Genetic rescue (increase genetic diversity)
- Coral nurseries (Great Barrier Reef)
- Seed banks (Svalbard Global Seed Vault)

**Impact:** Without active restoration, recovery from <30% biodiversity may be impossible within 120-month timeframe.

---

## Critical Missing Information

**To diagnose definitively, need:**

1. **Check tech deployment in god mode:**
   - Is `habitat_restoration` unlocked?
   - Is it fully deployed (100%) by month 120?
   - Is `habitatRestorationActive` flag set?

2. **Check biodiversityBonus application:**
   - How is `biodiversityBonus: 0.30` applied?
   - Monthly? Annual? One-time at full deployment?
   - Where in code? (likely `effectsEngine.ts`)

3. **Check for tipping points:**
   - Is there code that accelerates decline below 50%?
   - Are there irreversible thresholds?
   - Where? (likely in planetary boundaries phase or ecology phase)

4. **Check degradation rate:**
   - What's the monthly biodiversity decline WITHOUT tech?
   - Pollution, habitat loss, climate stress → how much loss/month?

---

## Expected Behavior (If Working Correctly)

**Timeline (god mode, optimal conditions):**

- **Month 0:** 69% biodiversity (baseline)
- **Months 0-24:** Research habitat restoration, biodiversity declines to ~60% (passive decay)
- **Months 24-144:** Deploy habitat restoration (120 months for 50% deployment)
- **Month 60:** 50% deployed, biodiversity ~55% (slow recovery begins)
- **Month 120:** 80% deployed, biodiversity ~65% (still below 70% threshold)
- **Month 180:** 100% deployed, biodiversity ~75% (crosses threshold)

**Implication:** 70% threshold may be unrealistic for 120-month scenarios unless:
1. Techs deploy faster (reduce 240-month deployment to 120 months)
2. Recovery rate is higher (increase `biodiversityBonus`)
3. Active restoration techs added (captive breeding, genetic rescue)
4. Initial decline is slower (reduce pollution/habitat loss rates)

---

## Scenario Analysis Evidence

**From `scenario_analysis_phase2_results_20251110.md`:**

| Scenario | Biodiversity Final | Notes |
|----------|-------------------|-------|
| Alignment-first | 44% | Despite ALL tech deployed |
| High-trust | 22% | **Catastrophic collapse** (irreversible) |
| High-spend | (not listed) | Likely similar to alignment-first |
| Moderate | (not listed) | Likely worse than alignment-first |
| Conflict | 47% | Better than high-trust (surprising!) |

**Key observation:** Even optimal scenarios (ALL tech deployed) show NET DECLINE.

**This strongly suggests:**
1. Tech deployment too slow (240-month timeline exceeds 120-month simulation)
2. Recovery rate insufficient to overcome passive decline
3. Possible irreversible tipping points crossed (22% in high-trust)

---

## Recommendations

### CRITICAL (Required for Ecological Spiral)

**1. Accelerate Deployment Timelines**

Current: `habitat_restoration` requires 240 months (20 years) deployment
Proposed: Reduce to 120 months (10 years) for AI-assisted deployment

```typescript
// In comprehensiveTechTree.ts
{
  id: 'habitat_restoration',
  // ...
  deploymentMonthsRequired: 120,  // Was 240 - cut in half with AI assistance
  // Rationale: AI can optimize site selection, automate monitoring, coordinate efforts
}
```

**2. Increase Recovery Rate**

Current: `biodiversityBonus: 0.30` (ambiguous - need to check application)
Proposed: If monthly, keep at 0.05/month. If one-time, increase to 0.50.

**Need to verify interpretation first before recommending specific value.**

**3. Add Active Restoration Technologies**

```typescript
{
  id: 'captive_breeding_programs',
  name: 'AI-Optimized Captive Breeding',
  description: 'Genetic rescue, assisted reproduction, reintroduction programs for endangered species',
  category: 'climate',
  prerequisites: ['habitat_restoration'],
  minAICapability: 3.0,  // Requires genetic analysis, population modeling
  deploymentMonthsRequired: 60,  // 5 years (faster than habitat restoration)
  effects: {
    biodiversityBonus: 0.20,  // +20% species recovery (complementary to habitat restoration)
    extinctionRateReduction: 0.50,  // -50% future extinctions (targeted interventions)
    geneticDiversityBonus: 0.30,  // Prevent inbreeding depression
  }
}
```

**4. Add Tipping Point Recovery Mechanism**

If biodiversity drops below 30%, normal recovery may be insufficient. Need "emergency intervention" tech:

```typescript
{
  id: 'emergency_ecosystem_stabilization',
  name: 'Emergency Ecosystem Stabilization',
  description: 'Crisis intervention: seed banks, coral nurseries, keystone species reintroduction',
  category: 'climate',
  prerequisites: ['habitat_restoration', 'captive_breeding_programs'],
  minAICapability: 3.5,
  deploymentMonthsRequired: 36,  // 3 years (emergency timeline)
  effects: {
    biodiversityFloor: 0.35,  // Prevents collapse below 35%
    extinctionRateReduction: 0.70,  // -70% (aggressive intervention)
    ecosystemHealth: 0.60,  // Stabilize trophic cascades
  }
}
```

### HIGH PRIORITY (Quality Improvements)

**5. Adjust Ecological Spiral Threshold**

Current: `biodiversityIndex > 0.7` (70%)
Research reality: 69% baseline, tech recovery to ~65% by month 120

**Options:**
- **Option A (lower threshold):** `biodiversityIndex > 0.65` (65% - achievable)
- **Option B (staged threshold):** `biodiversityIndex > 0.60 AND biodiversityTrend > 0` (60% + positive trajectory)
- **Option C (keep 70%, extend timeline):** Acknowledge spiral activates at month 150-180 (not 120)

**Recommendation:** Option B (staged threshold) - rewards positive momentum even if absolute level not reached.

**6. Add Biodiversity Trajectory Metric**

```typescript
// In upwardSpirals.ts
const biodiversityTrend = (currentBiodiversity - biodiversityThreeMonthsAgo) / 3;
const ecologicalSpiralActive =
  currentBiodiversity > 0.60 &&  // Above collapse risk
  biodiversityTrend > 0.005 &&   // Positive recovery (>0.5%/month)
  habitatRestorationActive;      // Tech deployed
```

---

## Testing Requirements

1. **Unit test:** Habitat restoration deployment over 120 months → verify biodiversity trajectory
2. **Integration test:** God mode scenario with fast-track habitat restoration (120-month deployment) → verify 70% threshold reached
3. **Tipping point test:** Start biodiversity at 30% → verify recovery possible with full tech suite
4. **Effectiveness validation:** Compare recovery rates to Moreno-Mateos et al. (2017) empirical data

---

## Files to Investigate

1. **`src/simulation/techTree/effectsEngine.ts`** - Check how `biodiversityBonus` is applied
2. **`src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`** - Check biodiversity decline mechanics
3. **`src/simulation/planetaryBoundaries.ts`** - Check for tipping points / irreversible thresholds
4. **`src/simulation/upwardSpirals.ts`** (lines for ecological spiral) - Verify threshold logic

---

## Next Steps

**Immediate (to unblock analysis):**
1. Check if `habitat_restoration` is deployed in god mode scenarios (search scenario logs)
2. Find where `biodiversityBonus` is applied in code (grep for usage in effectsEngine.ts)
3. Find biodiversity decline mechanics (where pollution/habitat loss affects biodiversity)

**Short-term (to fix blocker):**
1. If deployment issue: Reduce `deploymentMonthsRequired` to 120 months
2. If effectiveness issue: Increase `biodiversityBonus` or add active restoration techs
3. If threshold issue: Adjust ecological spiral threshold to 65% or add trajectory requirement

---

## Conclusion

The ecological spiral blocker is caused by one or more of:
1. **Deployment timeline too long:** 240 months exceeds 120-month simulation window
2. **Recovery rate too slow:** Passive restoration insufficient for 10-year recovery
3. **Irreversible tipping points:** Collapse below 30% biodiversity may be unrecoverable
4. **Missing active interventions:** Need captive breeding, genetic rescue, emergency stabilization

**Severity:** CRITICAL - Blocks utopia pathway (Ecological spiral is 1 of 6 required spirals)

**Fix Complexity:** MEDIUM-HIGH - Requires tech tree changes, may need new recovery mechanics

**Risk:** MEDIUM - Changes affect planetary boundaries (core system), need careful testing

---

**Note:** Full analysis blocked by `trueAlignment=NaN` bug preventing Monte Carlo runs. Recommendations based on code analysis and scenario results only.

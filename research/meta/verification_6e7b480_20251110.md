# Research Verification for Phase 3 Scenarios
**Commit:** 6e7b48065862143102d5926cb3452c59d4189082
**Date:** November 10, 2025
**Feature:** Scenario Analysis Framework Phase 3 - Core Scenarios
**Status:** ⏳ PENDING VERIFICATION

## Overview
Phase 3 implements 9 scenarios testing which governance dimensions enable upward spiral activation when all technologies are deployed. This verification document tracks research claims for key parameters.

**Two-Layer Verification Required:**
1. **Citation Existence:** Do cited papers actually exist? Are details accurate?
2. **Claim Verification:** Does the paper ACTUALLY support the specific claim made?

---

## Parameters Requiring Verification

### 1. Climate Spending Maximum (35% of GDP)

**Location:** `src/types/scenarios.ts:380`

**Claim:**
```typescript
climateSpending: 0.35, // Research: government_climate_priorities_20251024.md (30-35% max)
```

**Specific Claim:**
"35% of GDP allocated to climate spending represents research-backed maximum for climate mitigation priorities"

**Cited Source:**
- File: `research/government_climate_priorities_20251024.md`
- Expected content: Research showing maximum feasible climate spending is 30-35% of GDP

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] Does `research/government_climate_priorities_20251024.md` exist?
- [ ] Does it contain peer-reviewed citations?
- [ ] Are papers accessible and real (not phantom publications)?

**Layer 2 - Claim Verification:**
- [ ] Does the research ACTUALLY state 35% GDP is maximum feasible climate spending?
- [ ] Quote specific passage supporting this claim
- [ ] Context: Is this wartime/emergency spending or sustained peacetime maximum?
- [ ] Are there examples of countries approaching this level historically?

**Expected Research Questions:**
- What is the highest % GDP any country has spent on climate mitigation?
- What is the theoretical maximum before GDP collapse from economic disruption?
- Does the claim distinguish between mitigation spending and total climate spending?

---

### 2. Nordic Inequality Parameters (Gini <0.30, 25% GDP Redistribution)

**Location:** `src/types/scenarios.ts:396`

**Claim:**
```typescript
redistributionRate: 0.25, // Research: policy-interventions-systemic-inequality-validation_20251016.md
```
**Description:** "Maximize redistribution (25% of GDP, target Gini <0.30 Nordic levels)"

**Specific Claims:**
1. Nordic countries achieve Gini coefficient <0.30
2. This requires 25% of GDP redistribution
3. This level enables "Abundance + Democratic spirals"

**Cited Source:**
- File: `research/policy-interventions-systemic-inequality-validation_20251016.md`

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] Does `research/policy-interventions-systemic-inequality-validation_20251016.md` exist?
- [ ] Does it cite Nordic inequality studies?
- [ ] Are OECD or World Inequality Database sources referenced?

**Layer 2 - Claim Verification:**
- [ ] CLAIM 1: Do Nordic countries actually have Gini <0.30?
  - Quote specific values for Denmark, Sweden, Norway, Finland
  - Are these disposable income Gini or market income Gini?
- [ ] CLAIM 2: Do Nordic countries spend 25% of GDP on redistribution?
  - Quote actual redistribution spending levels
  - What counts as "redistribution" (welfare, UBI, progressive tax)?
- [ ] CLAIM 3: Is there research linking this inequality level to democratic participation?

**Expected Research Questions:**
- What is current Nordic Gini coefficient (2024 data)?
- What % GDP do Nordic countries spend on social transfers/redistribution?
- Is 0.25 Gini threshold related to democratic participation empirically?

---

### 3. AI Safety Budget ($50B/month)

**Location:** `src/types/scenarios.ts:412`

**Claim:**
```typescript
aiSafetyBudget: 50, // $50 billion/month
```
**Description:** "Maximize AI safety research ($50B/month) and strict controls"

**Specific Claims:**
1. $50B/month represents "aggressive alignment investment"
2. This is feasible as a sustained government budget
3. This level enables "trust cascades"

**Cited Source:**
- **NONE EXPLICITLY CITED** - This is a problem!

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] Find credible benchmarks for AI safety spending
- [ ] Are there projections for AGI safety research budgets?
- [ ] Government spending on existential risk mitigation?

**Layer 2 - Claim Verification:**
- [ ] CLAIM 1: Is $50B/month plausible as sustained spending?
  - For context: $600B/year (~0.6% of global GDP)
  - Compare to: Manhattan Project ($30B adjusted), Apollo Program ($25B/year)
- [ ] CLAIM 2: Is there research linking safety spending to public trust?
- [ ] CLAIM 3: What % of AI sector revenue is this? (OpenAI, Anthropic, DeepMind combined?)

**Expected Research Questions:**
- What is current global AI safety research spending (FHI, MIRI, Anthropic, DeepMind)?
- What fraction of AI company revenue goes to alignment research?
- Are there government AI safety budget proposals at this scale?

**CRITICAL:** This parameter appears to be a scenario assumption, not research-backed. Needs either:
1. Research justification for $50B/month figure
2. Reclassification as "exploratory scenario parameter" (not research-backed)

---

### 4. Research Investment for Scientific Acceleration ($100B/month)

**Location:** `src/types/scenarios.ts:445`

**Claim:**
```typescript
researchInvestment: 100, // $100 billion/month
```
**Description:** "Maximize research investment ($100B/month across all domains)"

**Specific Claims:**
1. $100B/month represents feasible maximum research spending
2. This level enables "Scientific spiral activation"
3. This is "across all domains" (not just AI safety)

**Cited Source:**
- **NONE EXPLICITLY CITED**

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] Find global R&D spending benchmarks (OECD, UNESCO)
- [ ] Historical examples of rapid research scale-up

**Layer 2 - Claim Verification:**
- [ ] CLAIM 1: Is $100B/month ($1.2T/year) plausible?
  - For context: Global R&D spending ~$2.4T/year (2022)
  - US federal R&D budget: ~$180B/year
  - This scenario = 50% of global R&D from single government
- [ ] CLAIM 2: Are there diminishing returns to research spending?
- [ ] CLAIM 3: What is "scientific spiral activation" mechanism?

**Expected Research Questions:**
- What is largest historical R&D budget as % of GDP? (US WWII: ~2.5% GDP)
- Are there studies on research spending thresholds for breakthrough acceleration?
- Does doubling R&D spending double breakthrough rate?

**CRITICAL:** This parameter appears exploratory. Needs either:
1. Research showing breakthrough rate scales with spending at this level
2. Reclassification as "stress test" rather than research-backed scenario

---

### 5. Democracy Level Thresholds (0.9 vs 0.2)

**Location:**
- `src/types/scenarios.ts:428` (democratic-participation: 0.9)
- `src/types/scenarios.ts:461` (authoritarian-efficiency: 0.2)

**Claims:**
1. Democracy level 0.9 enables "Democratic spiral activation"
2. Democracy level 0.2 prevents spiral activation (null hypothesis)
3. Democracy is necessary for upward spirals

**Cited Source:**
- Implicit: Scenario system assumes democracy requirements
- May reference: V-Dem v14 (2024), WGI (2024) governance indicators

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] Are V-Dem or WGI datasets actually used in initialization?
- [ ] Is there research linking democracy levels to collective action?

**Layer 2 - Claim Verification:**
- [ ] CLAIM 1: What democracy level do successful countries have? (V-Dem data)
- [ ] CLAIM 2: Can authoritarian systems achieve sustainability? (China example?)
- [ ] CLAIM 3: Is democracy NECESSARY or just correlated?

**Expected Research Questions:**
- What V-Dem score corresponds to "full democracy" (0.9)?
- Are there empirical thresholds for collective action (Ostrom, Olson)?
- Can technocratic authoritarianism solve climate (Singapore, China examples)?

**CRITICAL:** This is the core hypothesis of Phase 3. Needs strong empirical backing.

---

### 6. Nordic Starting Conditions (Low Inequality Start)

**Location:** `src/types/scenarios.ts:495-499`

**Claims:**
```typescript
startingConditions: {
  qolBoosts: {
    materialAbundance: 0.7, // Nordic countries have high material security
    politicalFreedom: 0.8, // Nordic countries have strong democracy
  },
}
```

**Specific Claims:**
1. Nordic countries have 0.7 material abundance (on 0-1 scale)
2. Nordic countries have 0.8 political freedom
3. These map to Gini=0.25

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] OECD Better Life Index for Nordic countries
- [ ] Freedom House scores for Nordic countries
- [ ] Material security indices

**Layer 2 - Claim Verification:**
- [ ] CLAIM 1: How is "0.7 material abundance" calibrated?
  - What does 0.0 represent? (Survival threshold?)
  - What does 1.0 represent? (Post-scarcity?)
- [ ] CLAIM 2: Do Nordic countries score 0.8 on political freedom?
  - Freedom House: Denmark 97/100, Norway 100/100, Sweden 100/100
  - Does this map to 0.8 in simulation scale?
- [ ] CLAIM 3: Is Gini=0.25 Nordic average?
  - Denmark: 0.263 (2020), Norway: 0.262 (2021), Sweden: 0.280 (2020)

**Expected Research Questions:**
- How are QoL scales calibrated to real-world data?
- Is there a calibration document mapping 0-1 scale to real metrics?

---

## Summary: Critical Verification Priorities

**HIGH PRIORITY (Research-Backed Claims):**
1. ✅ **Climate spending 35% GDP** - Has explicit citation, verify claim
2. ✅ **Nordic inequality Gini <0.30** - Has explicit citation, verify claim
3. ⚠️ **Democracy thresholds** - Core hypothesis, needs empirical backing

**MEDIUM PRIORITY (Exploratory Parameters):**
4. ⚠️ **AI safety $50B/month** - No citation, may be exploratory
5. ⚠️ **Research $100B/month** - No citation, may be exploratory

**LOW PRIORITY (Calibration Questions):**
6. ℹ️ **Nordic QoL scores** - Calibration mapping question

---

## Orchestrator Handoff

**Research Phase Tasks:**
1. **super-alignment-researcher**: Find peer-reviewed sources for parameters
   - Climate spending maximums (IPCC, energy transition studies)
   - Nordic inequality/redistribution data (OECD, World Inequality Database)
   - AI safety spending benchmarks (if available)
   - Research spending thresholds (UNESCO, OECD R&D data)
   - Democracy/collective action thresholds (Ostrom, Olson, V-Dem)

2. **research-skeptic**: Validate claims against sources
   - Check if 35% GDP climate spending is maximum or wartime emergency level
   - Verify Nordic Gini actually <0.30 (not aspirational)
   - Identify if $50B/month AI safety is research-backed or exploratory
   - Check for contradictory evidence on democracy requirements

**Expected Outcome:**
- Parameters with strong research backing: Use as-is
- Parameters that are exploratory: Reclassify as "stress test scenarios"
- Parameters with weak/no backing: Flag for revision or removal

---

## Implementation Notes

**Files to Check:**
- `research/government_climate_priorities_20251024.md` (climate spending)
- `research/policy-interventions-systemic-inequality-validation_20251016.md` (inequality)
- `reviews/god_mode_spiral_diagnostics_20251110.md` (Phase 1 findings - motivating hypothesis)

**Code Locations:**
- `src/types/scenarios.ts:372-524` - Phase 3 scenario definitions
- `scripts/runPhase3Scenarios.ts` - Batch test runner
- `src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts` - Government priority application

**Testing Status:**
- ✅ Type checking passes
- ✅ Single scenario test passes (climate-first, seed 42)
- ⏳ Monte Carlo N=10 batch (90 simulations) - pending

---

## Document Status
- **Created:** November 10, 2025
- **Status:** PENDING - Awaiting orchestrator to start research validation
- **Next Step:** Post to implementation channel → Orchestrator picks up → Research phase begins

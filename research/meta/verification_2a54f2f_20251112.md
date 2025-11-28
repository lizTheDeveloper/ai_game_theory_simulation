# Research Verification: Paradigm Scoring During Extreme Mortality

**Date:** November 12, 2025
**Commit:** 2a54f2f170a561ba8575fd6a66d8690087a310ea
**Investigator:** Roy (simulation-maintainer)
**Status:** ⚠️ RESEARCH VERIFICATION NEEDED

---

## Investigation Summary

**Issue:** Monte Carlo validation shows Western Liberal paradigm scores of 58-77/100 during 92% mortality events.

**Root Cause:** Western Liberal paradigm uses per-capita/structural metrics (democracy, civil liberties, rule of law, economic freedom, privacy) that are NOT directly affected by absolute population mortality.

**Result:** "Elite utopia" pattern - surviving 8% can maintain high institutional scores despite catastrophic mortality.

**Investigation completed:** Full analysis in `logs/paradigm_scoring_investigation_20251112.md` (380 lines)

---

## Research Claims Requiring Verification

### Claim 1: Historical Precedent - Institutional Persistence During Moderate Mortality

**Location:** `logs/paradigm_scoring_investigation_20251112.md:95-98`

**Claim Made:**
> WWII: UK maintained democracy despite 450K civilian deaths (0.9% mortality)
> Finland maintained democracy through Winter War (1% mortality)
> These support institutional persistence during moderate mortality (<5%)

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] Verify UK WWII civilian deaths figure (450K)
- [ ] Verify UK population 1939-1945 (~50M → 0.9% mortality correct?)
- [ ] Verify Finland Winter War mortality rate (1%)
- [ ] Find primary sources documenting democratic continuity during these events

**Layer 2 - Claim Verification:**
- [ ] Do these sources ACTUALLY demonstrate institutional persistence?
- [ ] Were elections held during WWII in UK? (suspended or continued?)
- [ ] Were civil liberties maintained or curtailed? (emergency powers?)
- [ ] Did judiciary/courts continue normal operations?
- [ ] Does this support the <5% threshold claim?

**Specific verification task:**
- Source V-Dem data for UK 1939-1945, Finland 1939-1940
- Check democracy scores, civil liberties indices during conflict
- Document any institutional degradation vs persistence
- Quote specific passages showing democratic continuity claims

**Expected outcome:** Verify whether 0.9-1% mortality truly shows "no institutional impact"

---

### Claim 2: Historical Precedent - Collapse During Extreme Mortality

**Location:** `logs/paradigm_scoring_investigation_20251112.md:113-116`

**Claim Made:**
> Black Death (1347-1353): 50% mortality → social upheaval, authority collapse, revolts
> Thirty Years' War (1618-1648): 25-40% mortality in Germany → state failure

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] Find peer-reviewed sources on Black Death mortality rates (50% accurate?)
- [ ] Find sources on institutional/authority collapse during Black Death
- [ ] Find sources on Thirty Years' War mortality in German states (25-40%?)
- [ ] Find sources on state failure/institutional breakdown during TTW

**Layer 2 - Claim Verification:**
- [ ] Did Black Death actually cause "authority collapse"?
  - Were medieval institutions (monarchy, church, local governance) maintained?
  - Were revolts (e.g., 1381 Peasants' Revolt) directly caused by plague?
  - What was the timeline: immediate collapse or delayed (decades)?
- [ ] Did Thirty Years' War cause "state failure" in Germany?
  - Which states failed? All German states or specific principalities?
  - Was failure due to mortality or war destruction/displacement?
  - Did institutions recover during/after war?

**Specific verification task:**
- Search: "Black Death institutional collapse medieval governance"
- Search: "Black Death democracy persistence" (anachronistic, but check)
- Search: "Thirty Years War state capacity Germany institutional breakdown"
- Quote passages directly linking mortality rate to institutional outcomes
- Distinguish mortality effects from war effects (violence, displacement, infrastructure destruction)

**Expected outcome:** Verify whether 50% mortality threshold causes institutional breakdown, or if other factors dominate

---

### Claim 3: Modern Precedent - Democratic Breakdown at Lower Mortality

**Location:** `logs/paradigm_scoring_investigation_20251112.md:277`

**Claim Made:**
> Modern conflicts: Syria (500K deaths, 2.4% mortality) - democratic breakdown?

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] Verify Syria total deaths (500K accurate for 2011-2025?)
- [ ] Verify Syria pre-war population (~21M → 2.4% mortality)
- [ ] Find V-Dem data for Syria 2010-2025

**Layer 2 - Claim Verification:**
- [ ] Did Syria have democracy BEFORE civil war? (baseline score?)
- [ ] Can we attribute democratic breakdown to mortality or to civil war itself?
  - War: displacement (6M+ refugees), infrastructure destruction, state collapse
  - Mortality: 500K deaths over 14 years = different dynamics than sudden pandemic/nuclear event
- [ ] Does this support <5% mortality → no institutional impact claim, or contradict it?

**Specific verification task:**
- V-Dem Syria data 2010-2025: democracy score, civil liberties, rule of law
- Separate mortality effects from civil war effects (impossible to disentangle?)
- Check if Syria case is valid comparison for sudden mortality (pandemic, nuclear) vs protracted conflict

**Expected outcome:** Determine if Syria case supports or contradicts mortality threshold claims

---

### Claim 4: Functional Collapse at 92% Mortality

**Location:** `logs/paradigm_scoring_investigation_20251112.md:123-129`

**Claim Made:**
> 92% mortality = ~7.4 billion deaths
> Electoral system: Need staff for polling stations, vote counting, certification
> Judiciary: Need judges, lawyers, court staff, enforcement
> Press freedom: Need journalists, editors, publishers, distribution
> With 92% dead, these functions CANNOT operate at pre-crisis levels

**Verification Needed:**

**Layer 1 - Citation Existence:**
- [ ] Find research on minimum staffing requirements for electoral systems
- [ ] Find research on minimum population density for functional judiciary
- [ ] Find research on minimum infrastructure for free press

**Layer 2 - Claim Verification:**
- [ ] Is there quantitative research on institutional capacity thresholds?
  - Example: "Elections require X poll workers per capita"
  - Example: "Functioning courts require Y judges per population"
- [ ] Does Iceland (350K pop) demonstrate institutional function at small scale?
  - If institutions work at 350K, why not at 640M survivors (8% of 8B)?
  - Is the issue absolute population or population density/infrastructure?
- [ ] Is "pre-crisis levels" the right standard?
  - Could institutions persist at REDUCED capacity but still maintain quality?
  - Example: Fewer polling stations but still free/fair elections

**Specific verification task:**
- Search: "minimum population electoral democracy threshold"
- Search: "institutional capacity population density governance"
- Search: "small state democracy Iceland population institutional function"
- Determine if claim is about absolute capacity (can't run institutions) or comparative capacity (reduced but functional)

**Expected outcome:** Verify whether 92% mortality truly prevents institutional function, or just reduces scale

---

## Proposed Mortality Thresholds (Requiring Justification)

**Location:** `logs/paradigm_scoring_investigation_20251112.md:146-172`

**Thresholds claimed:**
- **<5% mortality:** No institutional impact (WWII, modern conflicts)
- **5-20% mortality:** Partial institutional strain (civil war)
- **20-50% mortality:** Severe institutional stress (Black Death)
- **50%+ mortality:** Functional collapse (no historical data)

**Verification Needed:**

**For each threshold:**
1. **Citation existence:** Find peer-reviewed sources establishing these specific thresholds
2. **Claim verification:** Do sources actually support these exact breakpoints?
3. **Mechanism specification:** WHY do institutions fail at these thresholds?
   - Is it staffing? Infrastructure? Social cohesion? Economic collapse?
4. **Variance analysis:** Are thresholds universal or context-dependent?
   - Does pre-crisis institutional strength matter? (Norway vs fragile state)
   - Does mortality speed matter? (sudden vs gradual)
   - Does mortality distribution matter? (concentrated in cities vs rural)

**Specific verification tasks:**
- Search: "mortality rate institutional breakdown threshold political science"
- Search: "pandemic political institutions democracy mortality"
- Search: "Black Death medieval governance state capacity"
- Check if ANY political science literature establishes quantitative mortality thresholds for institutional collapse
- If not found: Document research gap, propose original research approach

**Expected outcome:** Either find research-backed thresholds OR conclude this is a novel research question requiring primary analysis

---

## Three Solution Options - Research Requirements

### Option A: Add Mortality-Weighted Penalty

**Research needed:**
1. **Historical mortality-institution correlations:**
   - Black Death (1347-1353): Mortality → institution persistence/collapse timeline
   - Thirty Years' War (1618-1648): Mortality vs war effects on state capacity
   - Spanish Flu (1918-1920): 50-100M deaths, institutional impact?
   - COVID-19 (2020-2024): 7M deaths, democratic erosion correlations?

2. **Functional capacity thresholds:**
   - Minimum staffing for electoral administration (per capita/absolute)
   - Minimum judicial capacity (judges, courts, enforcement per population)
   - Minimum media capacity (journalists, publishers, distribution infrastructure)

3. **Threshold validation:**
   - At what mortality rate do institutions functionally collapse? (quantitative)
   - Does this vary by pre-crisis institutional strength? (resilience factors)
   - Does mortality speed matter? (sudden pandemic vs protracted war)

**Sources to search:**
- Political science: Mortality and democracy literature (any exists?)
- Historical sociology: Black Death institutional impacts
- Public health: Pandemic governance, state capacity during health crises
- Conflict studies: War mortality vs state failure (separating effects)

---

### Option B: Document Current Behavior (No Implementation Change)

**Research needed:**
1. **Validate "elite utopia" interpretation:**
   - Can small populations maintain high institutional quality? (Iceland, Singapore)
   - Historical examples of concentrated survival maintaining institutions?
   - Distinguish institutional quality (per-capita) from functional capacity (absolute)

2. **Justify per-capita vs population-weighted approaches:**
   - V-Dem methodology: Does it account for population size?
   - Freedom House methodology: Does it weight by population?
   - Philosophical: Should paradigm scores measure quality or capacity?

**Sources to search:**
- V-Dem methodology papers (Coppedge et al.)
- Freedom House methodology documentation
- Political science: Small state democracy literature (micro-states)

---

### Option C: Distinguish Per-Capita vs Absolute Metrics

**Research needed:**
1. **Per-capita metrics (institutional quality):**
   - V-Dem democracy scores (already per-capita/quality-based)
   - Freedom House civil liberties (per-capita)
   - Rule of law indices (per-capita)

2. **Absolute metrics (functional capacity):**
   - Electoral capacity: Can elections physically happen? (staffing, infrastructure)
   - Judicial capacity: Can courts operate? (judges, lawyers, case load)
   - Media capacity: Can free press function? (journalists, distribution)

3. **Aggregate function:**
   - How to combine quality and capacity? (geometric mean? multiplicative?)
   - Research on institutional resilience: Quality vs capacity trade-offs

**Sources to search:**
- Institutional capacity measurement literature
- State capacity indices (Hanson & Sigman, others)
- Governance effectiveness research (World Bank WGI)

---

## Next Steps for Research Validation

**Phase 1: Literature Review (orchestrator → super-alignment-researcher)**
1. Historical mortality-institution correlations (Black Death, Thirty Years' War, Spanish Flu, COVID)
2. Functional capacity thresholds (electoral, judicial, media minimum requirements)
3. Small state institutional function (Iceland, micro-states, population thresholds)

**Phase 2: Citation Verification (orchestrator → research-skeptic)**
1. Verify all claims in investigation log (2-layer verification)
2. Check for contradictory evidence (do institutions persist during mortality?)
3. Identify research gaps (what questions have NO empirical data?)

**Phase 3: Decision Point**
- If research supports mortality penalties → Proceed with Option A implementation
- If research supports institutional persistence → Proceed with Option B (document + logging)
- If research is inconclusive → Option C (hybrid approach, per-capita vs absolute)

**Phase 4: Implementation (orchestrator → simulation-maintainer)**
- Based on research findings, implement chosen solution
- Add research citations to code comments
- Create unit tests validating mortality effects

**Phase 5: Validation (orchestrator → priya)**
- Monte Carlo runs (N≥10) with new implementation
- Verify outcome distributions change appropriately
- Check for unintended consequences (does fix break other patterns?)

---

## Key Questions for Researchers

1. **Does historical data support 50% mortality → institutional collapse?**
   - Black Death case: Did medieval institutions collapse or adapt?
   - Timeline: Immediate collapse or gradual erosion?

2. **What is the minimum population for functional institutions?**
   - Iceland (350K) demonstrates small-scale institutional function
   - Is 640M survivors (8% of 8B) sufficient for institutions?

3. **Should paradigm scores measure quality or capacity?**
   - Quality: Per-capita metrics (current approach)
   - Capacity: Absolute metrics (requires new research)

4. **Is "elite utopia" accurate or misleading?**
   - Can surviving elite maintain high democracy/rule of law scores?
   - Historical examples of concentrated survival maintaining institutions?

5. **What is the PURPOSE of multi-paradigm scoring?**
   - If goal = distinguish elite quality from mass welfare, current approach correct
   - If goal = measure functional capacity, current approach inadequate

---

## Files Referenced

- **Investigation log:** `logs/paradigm_scoring_investigation_20251112.md` (380 lines)
- **Diagnostic script:** `scripts/diagnosticParadigmMortality.ts` (190 lines)
- **Implementation:** `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts:188-327`
- **Type definitions:** `src/types/multiParadigmDUI.ts`
- **Wiki documentation:** `docs/wiki/mechanics/multi-paradigm-dui.md`

---

## Verification Workflow

**This file serves as the research specification for the orchestrator workflow:**

1. **VALIDATION PHASE** (research-skeptic):
   - Review all claims in this file (2-layer verification)
   - Identify strongest/weakest claims
   - Flag research gaps

2. **RESEARCH PHASE** (super-alignment-researcher):
   - Conduct literature review for all claims
   - Extract mortality-institution correlations from sources
   - Document thresholds found (or research gaps)

3. **IMPLEMENTATION PHASE** (simulation-maintainer):
   - Based on research findings, implement solution (A, B, or C)
   - Add research citations to code
   - Create unit tests

4. **REVIEW PHASE** (architecture-skeptic):
   - Check for performance impacts
   - Verify state propagation correctness
   - Validate implementation matches research

5. **DOCUMENTATION PHASE** (wiki-documentation-updater):
   - Update wiki with research findings
   - Document chosen solution and rationale
   - Add version history

---

**Status:** Ready for orchestrator to begin at VALIDATION phase (research file created, research phase skipped per workflow).

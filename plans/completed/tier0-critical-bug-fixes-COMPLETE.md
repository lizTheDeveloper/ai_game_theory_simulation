# TIER 0: Critical Bug Fixes - HIGHEST PRIORITY

**Date:** October 16, 2025
**Status:** URGENT - Must complete before adding new features
**Source:** Skeptic analysis of Monte Carlo outputs (mc_2025-10-16T20-32-05, mc_2025-10-16T20-17-36)
**Total Effort:** 10-18 hours
**Impact:** Makes simulation results interpretable and physically coherent

---

## Executive Summary

**CRITICAL FINDING:** The simulation has three fundamental bugs that make all results suspect:

1. **100% Inconclusive Outcomes** - Model cannot find recovery pathways, all runs fail to resolve
2. **76-83 Orphaned AIs per run** - Organizations die but AIs persist magically
3. **Compute Paradox** - AI capability rises after 50% population loss, data centers close

**We are currently building features on a broken simulation.** These bugs must be fixed FIRST, validated with Monte Carlo runs, THEN we can add interventions (nuclear war prevention, AI detection, etc.).

**The researcher was correct about nuclear war mortality (3,961M deaths, 92.6%).**
**The skeptic was correct that we must fix the model before optimizing it.**

---

## Priority 0A: Fix Inconclusive Outcome Problem

**Evidence:**
- 100% of runs end "INCONCLUSIVE" after 120 months
- 0% utopia, 0% stable equilibrium, 0% positive resolution
- Average population decline: 50-53% (4.0-4.3 BILLION deaths)
- 80-90% of runs experience >30% decline (Collapse/Dark Age territory)

**What This Means:**
This is a MODEL FAILURE, not a pessimistic scenario. The simulation cannot find pathways to recovery or stability. Every run ends in grinding, unresolved decline.

**Why It's Critical:**
- If the model can't resolve outcomes, all results are meaningless
- We don't know if interventions work because nothing ever resolves
- Outcome distributions (utopia/dystopia/extinction) are all invalid

**Root Cause Analysis (Hypotheses):**

1. **Missing recovery mechanics?**
   - Crisis cascades last 58-62 months continuously (90-100% of runs)
   - No explicit "recovery pathway" mechanics (only decline accumulation)
   - Need: Stabilization mechanics, intervention success conditions, recovery triggers

2. **Threshold too high for positive outcomes?**
   - Utopia requires: 3+ spirals active for 12+ months + 65% sustainability + no active crises
   - Maybe 65% sustainability is unreachable with current crisis mechanics?
   - Need: Check if ANY run gets close to thresholds (sensitivity analysis)

3. **Time horizon too short?**
   - 120 months (10 years) may not be enough for recovery after major crisis
   - Real-world recoveries (WWII, COVID) take 5-15 years
   - Need: Test if extending to 180-240 months allows resolution

4. **Dystopia progression broken?**
   - Dystopia paths exist (Control Dystopia, Slow Takeover at 70-86% progress)
   - But never trigger (all stay "inconclusive")
   - Need: Check dystopia activation conditions, may have unreachable thresholds

**Implementation Plan:**

**Step 1: Diagnostic Analysis (2-3h)**
- Review `catastrophicScenarios.ts` outcome determination logic
- Check utopia/dystopia threshold conditions
- Analyze Monte Carlo logs for "closest approach" to each outcome
- Identify which thresholds are never reached vs. almost reached

**Step 2: Recovery Pathway Mechanics (2-3h)**
- Add explicit recovery phase detection (crisis peak → stabilization → recovery)
- Implement intervention success tracking (which interventions actually worked?)
- Add stabilization triggers (crisis cascade breaks, legitimacy recovers, environmental debt declines)
- Model recovery timelines (3-15 years after peak crisis)

**Step 3: Threshold Calibration (1-2h)**
- If NO runs approach thresholds: Lower thresholds to realistic levels
- If SOME runs approach but miss narrowly: Keep thresholds, improve mechanics
- Validate against historical data (WWII recovery 1945-1960, COVID recovery 2020-2025)

**Step 4: Time Horizon Test (1h)**
- Run Monte Carlo N=10 with 180 months (15 years)
- Check if extended time allows resolution
- If yes: Document that 10-year horizon is insufficient for recovery modeling

**Deliverables:**
- Diagnostic report: Which thresholds are unreachable, which are close
- Recovery mechanics implementation (new functions in `catastrophicScenarios.ts`)
- Threshold calibration documentation (research-backed justification)
- Validation Monte Carlo (N=10, expect >0% resolved outcomes)

**Success Criteria:**
- >20% of runs resolve to definitive outcome (utopia, dystopia, or extinction)
- Recovery pathways exist (some runs stabilize and recover)
- Outcome distribution is interpretable (not 100% inconclusive)

**Time Estimate:** 4-8 hours

---

## Priority 0B: Fix Orphaned AI Bug

**Evidence:**
- 76-83 "orphaned" AIs per run (should be 0)
- 70-80% bankruptcy rate for major AI labs (Anthropic, OpenAI, DeepMind, Meta)
- Organizations die, but AIs persist magically
- Breaks AI-economy-organization linkage

**What This Means:**
There's a fundamental incoherence in how AI survival is linked to organizational survival. When an organization goes bankrupt, its AIs should retire, transfer ownership, or degrade—not persist indefinitely as "orphaned."

**Why It's Critical:**
- AI population dynamics are broken
- Economic incentives don't matter (80% of orgs bankrupt, AIs continue anyway)
- Invalidates governance mechanics (can't regulate organizations that don't exist)

**Root Cause Analysis:**

**Hypothesis:** AI retirement logic only checks if organization is "active" but doesn't handle bankruptcy transition correctly.

**Code Review Needed:**
1. Check `organizationDynamics.ts` bankruptcy logic
2. Check `aiAgent.ts` retirement/ownership transfer logic
3. Identify where AIs should transfer ownership or retire when org dies
4. Verify that AI count updates correctly when orgs go bankrupt

**Implementation Plan:**

**Step 1: Code Analysis (0.5-1h)**
- Review bankruptcy logic in `organizationDynamics.ts`
- Review AI retirement logic in `aiAgent.ts`
- Identify the exact point where orphaning occurs
- Trace through lifecycle: organization active → bankrupt → AIs orphaned

**Step 2: Fix Ownership Transfer (1-2h)**
- When organization goes bankrupt, AIs should:
  - **Option A (Retirement):** 70% retire (shut down, capability lost)
  - **Option B (Transfer):** 20% transfer to surviving organizations
  - **Option C (Open-Source):** 10% released as open-weight models (lose control)
- Implement probabilistic distribution (research-backed ratios)
- Add logging: "Organization X bankrupt → Y AIs retired, Z transferred, W open-sourced"

**Step 3: Validation (0.5-1h)**
- Unit test: Create organization → add AIs → bankrupt organization → check AI ownership
- Monte Carlo N=10: Check orphaned AI count (should be 0)
- Verify AI population dynamics make sense (orgs die → AI count adjusts)

**Deliverables:**
- Fix to AI ownership transfer logic
- Research justification for retirement/transfer/open-source ratios
- Unit test covering bankruptcy → AI ownership transition
- Validation Monte Carlo (N=10, expect 0 orphaned AIs)

**Success Criteria:**
- Orphaned AI count = 0 in all runs
- AI population declines when organizations go bankrupt
- Ownership transfers are logged and traceable

**Time Estimate:** 2-4 hours

---

## Priority 0C: Fix Compute Paradox

**Evidence:**
- Capability floor: 2.88-4.14 (continues rising despite org collapse)
- Compute: 126-136M PF after 50% population loss
- Data centers: -2.2 to -1.2 net change (losing infrastructure)
- Organizations bankrupt, but compute grows 1.00x (how?)

**What This Means:**
There's a fundamental violation of physical constraints. When 50% of humans die, organizations collapse, and data centers close, AI capability should DEGRADE—not continue growing. This breaks the material substrate link.

**Why It's Critical:**
- Capability growth is physically implausible
- Ignores infrastructure requirements (power, cooling, maintenance)
- Makes resource constraints meaningless (AI advances even when civilization collapses)

**Root Cause Analysis:**

**Hypothesis:** AI capability is calculated from organization investment alone, not linked to material infrastructure (data centers, power grid, human expertise).

**Missing Links:**
1. **Data center dependence:** Capability should scale with functional data centers
2. **Power grid dependence:** Data centers need power (collapses during crisis)
3. **Human expertise:** Training/deploying AI requires ML engineers (die during crisis)
4. **Supply chain:** GPUs, chips, cooling systems need manufacturing (disrupted during crisis)

**Implementation Plan:**

**Step 1: Link Capability to Infrastructure (2-3h)**
- Add data center capacity as capability multiplier
- Formula: `effectiveCapability = baseCapability * dataCenterMultiplier * powerGridMultiplier`
- Data center multiplier: 0.5 (half capacity) → capability capped at 0.5x baseline
- Power grid multiplier: Environmental crisis → brownouts/blackouts → 0.7-0.9x capability

**Step 2: Add Degradation Mechanics (1-2h)**
- When population declines >30%: AI capability degrades 1-3% per month
- Mechanism: Fewer ML engineers → can't maintain models → performance decay
- Mechanism: Supply chain disruption → can't replace failed hardware → capacity loss
- Mechanism: Power shortages → data centers offline → compute unavailable

**Step 3: Compute Production Scaling (1h)**
- Link compute production to population + organization health
- When 50% of population dies: compute production drops 30-50% (not stays flat)
- When 80% of orgs bankrupt: compute production drops 60-80%
- Existing compute decays 2-5% per month (hardware failures, maintenance gaps)

**Step 4: Validation (1h)**
- Monte Carlo N=10: Track capability trajectory during crisis
- Expected: Capability peaks, then declines during crisis (50%+ population loss)
- Verify: Capability cannot grow when data centers close and population collapses

**Deliverables:**
- Infrastructure-capability linkage implementation
- Degradation mechanics (capability decay during crisis)
- Compute production scaling (linked to population + org health)
- Validation Monte Carlo (N=10, expect capability decline during crisis)

**Research Foundation:**
- COVID-19 supply chain disruptions (2020-2022): 20-40% manufacturing delays
- Ukraine war chip shortage (2022-2023): GPU production down 15-30%
- Historical industrial collapse (Soviet Union 1991): 40-60% capacity loss within 5 years
- Asteroid impact scenarios (Toon et al. 2008): Industrial capacity loss 50-90% within 1 year

**Success Criteria:**
- Capability declines when population drops >30%
- Compute production scales with population + organization health
- Data center closures reduce available compute
- Physical constraints are respected (no AI advancement during civilization collapse)

**Time Estimate:** 4-6 hours

---

## Validation Plan (All Three Fixes)

**After implementing 0A, 0B, 0C:**

**Validation Monte Carlo (N=20, 2-4h):**
1. Run baseline seeds (42000-42019) with all fixes implemented
2. Measure:
   - Orphaned AI count (expect: 0)
   - Outcome distribution (expect: >20% resolved, not 100% inconclusive)
   - Capability trajectory (expect: decline during crisis, not growth)
3. Compare to original broken runs (mc_2025-10-16T20-32-05)
4. Document differences (before/after analysis)

**Success Criteria:**
- Orphaned AIs: 0 (was 76-83)
- Resolved outcomes: >20% (was 0%)
- Capability: Declines during crisis (was rising)
- Simulation is coherent and interpretable

**If Validation Fails:**
- Iterate on fixes (additional 2-4h debugging)
- Re-run validation until criteria met
- Do NOT proceed to nuclear war prevention until validation passes

---

## Sequencing: Why TIER 0 Before Everything Else

**The Skeptic Was Right:**

> "We are adding features to a broken simulation. Fix the model FIRST, validate it works, THEN add interventions."

**The Researcher Proposed:**
- Priority 1: AI-NC3 Circuit Breakers (8-12h claimed, 30-50h realistic)
- Priority 2: Mechanistic Anomaly Detection (10-14h claimed, 25-40h realistic)
- Priority 3: Information Integrity (8-12h claimed, 10-16h realistic)
- **Total: 26-38h claimed, 65-106h realistic**

**But These Interventions Are Meaningless If:**
- All runs end "inconclusive" (we can't measure if interventions work)
- 76-83 orphaned AIs break population dynamics (governance doesn't matter)
- Capability grows during collapse (resource constraints don't matter)

**Correct Sequencing:**
1. **TIER 0 (10-18h):** Fix simulation bugs → validate → ensure coherence
2. **TIER 1 Phase 1 (8-12h):** Nuclear circuit breakers (human-in-the-loop + kill switches)
3. **TIER 1 Validation (2-4h):** Monte Carlo N=20 → measure nuclear war reduction
4. **TIER 1 Phase 2 (12-20h):** IF Phase 1 works → AI manipulation detection
5. **TIER 2 Phase 1 (4-6h):** Single detection method (noise injection)
6. **TIER 2 Validation (2-4h):** Monte Carlo N=20 → measure adversarial detection rate
7. **TIER 2 Phase 2 (12-20h):** IF >10% detection → multi-method ensemble

**Total with Validation Gates:** 62-124h (vs. 26-38h claimed, 65-106h blind implementation)

**The Right Path:** Fix foundation first (TIER 0), THEN build on solid ground (TIER 1-2 phased).

---

## Summary

**TIER 0: Critical Bug Fixes (10-18 hours)**

- **0A: Inconclusive Outcomes** (4-8h) → Makes results interpretable
- **0B: Orphaned AIs** (2-4h) → Makes AI population dynamics coherent
- **0C: Compute Paradox** (4-6h) → Makes capability growth physically plausible

**Impact:**
- Simulation becomes coherent and physically grounded
- Results become interpretable (outcomes resolve, not 100% inconclusive)
- Foundation is solid for adding interventions (TIER 1-2)

**Next Steps (After TIER 0 Complete):**
- TIER 1: Nuclear war prevention (phased, 26-42h with validation gates)
- TIER 2: AI deception detection (phased, 33-55h with validation gates)
- TIER 3: Information integrity (optional, 10-16h)

**The researcher was right about WHAT to fix (nuclear war kills 3,961M).**
**The skeptic was right about WHEN to fix it (after fixing the model).**

**This plan combines both insights into a realistic, evidence-based roadmap.**

---

**Last Updated:** October 16, 2025
**Status:** READY FOR IMPLEMENTATION
**Prerequisites:** None (can start immediately)
**Estimated Completion:** 1-2 weeks (10-18 hours)

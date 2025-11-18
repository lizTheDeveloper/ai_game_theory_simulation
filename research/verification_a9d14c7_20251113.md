# Research Verification: Time-Based Bifurcation Scaling (Commit a9d14c7)

**Date:** November 13, 2025
**Commit:** a9d14c74fc1ccd691df716d1cf0df2c01a236dff
**Purpose:** Verify citations and claims for time-based bifurcation multiplier scaling
**Status:** PENDING VALIDATION

---

## Summary

This commit introduces **time-based sigmoid scaling** to bifurcation multipliers based on a claim about rate-dependent transitions. The implementation scales multipliers from 0.5× (early months) → 1.0× (late months) over a 20-year simulation.

**Key Research Claim:**
> "Research: Arumugam et al. (2024 Ecology) - Rate-dependent transitions. Fast scenarios (20-year simulation) show different dynamics than slow drift."

This claim is used to justify reducing early-month amplification to fix 87.2% mortality overshoot (target: 43-58%).

---

## Citations Requiring Verification

### 1. Arumugam et al. (2024) - Rate-Dependent Transitions

**Cited In:**
- `src/simulation/engine/phases/BifurcationLogicPhase.ts:318-320`
- `research/bifurcation_instrumentation_calibration_20251113.md:115-134`
- `.claude/agents/task_roy_bifurcation_instrumentation.txt:45`

**Specific Claims Made:**

**Claim 1.1:** "Fast scenarios (20-year simulation) show different dynamics than slow drift"
- **Location:** BifurcationLogicPhase.ts:318
- **Code Context:** Justifies sigmoid time-scaling (0.5× → 1.0×)
- **Verification Needed:**
  - Does the paper actually discuss "fast vs slow" scenario dynamics?
  - Is 20 years considered "fast" in the paper's context?
  - Does the paper support differential amplification over time?

**Claim 1.2:** "Early warning indicators predict the actual catastrophic transition driven by the explicit rate of change"
- **Location:** research/bifurcation_instrumentation_calibration_20251113.md:127-129
- **Quoted Text:** "Early warning indicators calculated from time series predict not the bifurcation of the underlying system but the actual catastrophic transition driven by the explicit rate of change."
- **Verification Needed:**
  - Is this an actual quote from the paper?
  - Does this support time-based scaling of multipliers?
  - What specific rate-dependent mechanisms does the paper identify?

**Claim 1.3:** "Rate-dependent transition research (Arumugam et al. 2024) - slow-changing systems may not apply"
- **Location:** research/bifurcation_instrumentation_calibration_20251113.md:131-134
- **Context:** Used to justify time-based scaling as alternative to multiplier reduction
- **Verification Needed:**
  - Does the paper discuss optimality of bifurcation detection for slow vs fast systems?
  - What timescales does the paper consider?

**Paper Metadata:**
- **Full Citation:** Arumugam et al. (2024)
- **Journal:** Ecology
- **Expected URL:** https://esajournals.onlinelibrary.wiley.com/doi/10.1002/ecy.4240 (from research file line 123)
- **Full Title (claimed):** "Early warning indicators capture catastrophic transitions driven by explicit rates of environmental change"

**Verification Tasks:**
1. **Citation Existence:** Verify paper exists, authors/year/journal correct
2. **Claim Accuracy:** Verify paper actually supports fast/slow scenario dynamics
3. **Quote Accuracy:** Verify quoted text appears in paper (line 128)
4. **Applicability:** Does rate-dependent mechanism justify our sigmoid scaling approach?

---

### 2. Fang & Yan (2022) - JData Format Standard

**Cited In:**
- `research/bifurcation_instrumentation_calibration_20251113.md:38-51`
- Commit message (JData standard for JSON export)

**Specific Claims Made:**

**Claim 2.1:** "JSON/JData format migration completed 2020"
- **Location:** research/bifurcation_instrumentation_calibration_20251113.md:39
- **Verification Needed:** Is 2020 the correct year for JData adoption in MCX?

**Claim 2.2:** "Systematically serializes common scientific data structures... 100% JSON-compatible annotation tags"
- **Location:** research/bifurcation_instrumentation_calibration_20251113.md:42-47
- **Verification Needed:** Is this an accurate description of JData capabilities?

**Paper Metadata:**
- **Full Citation:** Fang Q, Yan S. (2022)
- **Title:** "MCX Cloud—a modern, scalable, high-performance and in-browser Monte Carlo simulation platform with cloud computing"
- **Journal:** J Biomed Opt
- **PMCID:** PMC8728956
- **Expected URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC8728956/

**Verification Tasks:**
1. **Citation Existence:** Verify PMCID, authors, title correct
2. **JData Description:** Verify JData capabilities match claims
3. **Applicability:** Is JData appropriate for our bifurcation metrics export?

---

### 3. Implementation-Specific Parameters

**Parameters Requiring Validation:**

**Param 3.1:** Sigmoid Center Month = 120
- **Location:** BifurcationLogicPhase.ts:332
- **Justification:** "Midpoint of 240-month simulation"
- **Research Basis:** NONE CITED (mathematical convenience)
- **Verification Needed:** Is 10-year transition window (months 60-180) research-backed?

**Param 3.2:** Transition Width = 60 months
- **Location:** BifurcationLogicPhase.ts:333
- **Justification:** "±60 months (10 years total transition window)"
- **Research Basis:** NONE CITED (arbitrary choice)
- **Verification Needed:** Should this be calibrated from Arumugam paper?

**Param 3.3:** Scaling Range = 0.5× to 1.0×
- **Location:** BifurcationLogicPhase.ts:335-336
- **Justification:** "Early simulation: ~0.5× (reduced amplification), Late: 1.0× (full)"
- **Research Basis:** Implicitly from mortality overshoot (87.2% → 43-58%)
- **Verification Needed:** Does Arumugam paper suggest specific scaling factors?

---

## Verification Methodology

**Layer 1 - Citation Existence:**
1. Access Arumugam et al. (2024) at https://esajournals.onlinelibrary.wiley.com/doi/10.1002/ecy.4240
2. Verify authors, title, journal, year match
3. Check if paper is peer-reviewed (not preprint)

**Layer 2 - Claim Verification:**
1. Search paper for "rate-dependent" or "rate of change"
2. Locate quoted text (line 128 of research file)
3. Extract timescale ranges discussed (slow vs fast)
4. Check if paper discusses amplification dynamics over time
5. Determine if sigmoid scaling is justified by paper's findings

**Layer 3 - Parameter Extraction:**
1. Check if paper provides quantitative scaling recommendations
2. Look for transition window recommendations
3. Identify any simulation duration guidance (20-year vs longer)

---

## Risk Assessment

**HIGH RISK - Potential Issues:**

**Issue 1:** Arumugam paper may discuss rate-dependent DETECTION, not rate-dependent AMPLIFICATION
- If true, citation is being misapplied to justify time-scaling
- Would need different research basis (e.g., system resilience building over time)

**Issue 2:** Sigmoid parameters (center=120, width=60) appear arbitrary
- No research citation for specific values
- May need calibration from actual rate-dependent data

**Issue 3:** 0.5× scaling factor may be under-justified
- Chosen to fix mortality overshoot (empirical tuning)
- May need independent research validation

**MEDIUM RISK:**

**Issue 4:** JData format citation may be overkill
- JSON export doesn't actually use JData-specific features
- Standard JSON may be sufficient

**LOW RISK:**

**Issue 5:** Fang & Yan (2022) citation appears accurate
- PMCID verifiable
- JData description matches claimed features

---

## Expected Validation Outcome

**OPTIMISTIC SCENARIO:**
- Arumugam paper discusses rate-dependent amplification dynamics
- Paper provides timescale ranges supporting 10-year transitions
- Sigmoid scaling is justified modification of base multipliers

**REALISTIC SCENARIO:**
- Arumugam paper discusses rate-dependent DETECTION only
- Time-scaling requires additional research basis (system resilience literature)
- Sigmoid parameters need calibration study or marked as "preliminary tuning"

**PESSIMISTIC SCENARIO:**
- Arumugam citation is misapplied
- Time-scaling lacks research foundation
- Requires new research phase OR acknowledgment as empirical calibration

---

## Action Items for Validation

**For super-alignment-researcher:**
1. Access Arumugam et al. (2024) full text
2. Extract all mentions of "rate", "fast", "slow", "timescale"
3. Verify quoted text (line 128) is accurate
4. Determine if sigmoid scaling is justified by findings

**For research-skeptic:**
1. Review Arumugam citation for applicability
2. Check for contradictory evidence about time-dependent amplification
3. Evaluate whether parameters (120, 60, 0.5×) are over-fitted
4. Recommend alternative research if Arumugam insufficient

**For orchestrator:**
1. If validation PASSES: proceed to Priya Monte Carlo validation
2. If validation FAILS: spawn new research phase for time-scaling justification
3. If validation PARTIAL: document limitations and proceed with caveats

---

## Files Modified (For Context)

**Implementation:**
- `src/simulation/engine/phases/BifurcationLogicPhase.ts` (lines 305-340)
  - Added `currentMonth` parameter to `getSystemMultiplier`
  - Implemented sigmoid time-scaling formula
  - Added assertion for timeScaling in [0.4, 1.1] range

**Instrumentation:**
- `scripts/monteCarloSimulation.ts` (new exportBifurcationMetrics function)
  - Exports per-run JSON to `monteCarloOutputs/bifurcation_metrics_seed{N}.json`
  - Includes amplificationTimeSeries array

**Research:**
- `research/bifurcation_instrumentation_calibration_20251113.md` (742 lines, 16 citations)
- `reviews/bifurcation_instrumentation_critique_20251113.md` (Grade A-)

---

## References

**Primary Citation:**
- Arumugam et al. (2024) "Early warning indicators capture catastrophic transitions driven by explicit rates of environmental change" *Ecology* https://esajournals.onlinelibrary.wiley.com/doi/10.1002/ecy.4240

**Supporting Citation:**
- Fang Q, Yan S. (2022) "MCX Cloud—a modern, scalable, high-performance and in-browser Monte Carlo simulation platform with cloud computing" *J Biomed Opt* 27(8):083008. PMID: 35027995; PMCID: PMC8728956

**Related Research Files:**
- research/bifurcation_empirical_validation_20251112.md (baseline bifurcation research, 500+ lines)
- research/bifurcation_instrumentation_calibration_20251113.md (this implementation's research, 742 lines)

---

**Status:** READY FOR VALIDATION (Orchestrator should start at validation phase - research file already exists)

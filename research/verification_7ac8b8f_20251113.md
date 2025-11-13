# Research Verification for Commit 7ac8b8f - Novel Entities Zero-Effectiveness Analysis

**Commit:** 7ac8b8f2c05d2f69befb4e6dffd6307a5be91b35
**Date:** November 13, 2025
**Scope:** Novel Entities model redesign (research + design document)
**Research File:** `research/novel_entities_zero_effectiveness_20251113.md` (742 lines, 16 primary sources)
**Design File:** `plans/novel_entities_model_redesign_20251113.md` (276 lines)

---

## Verification Status

**STATUS:** ⏳ PENDING VALIDATION
**Priority:** CRITICAL (TIER 1 research roadmap)
**Quality Gate:** Research + validation complete (Grade B+), implementation not yet started

This verification file tracks citations requiring TWO-LAYER verification:
1. **Citation Existence:** Does the paper exist with correct authors/year/title?
2. **Claim Verification:** Does the paper ACTUALLY support the specific claim made?

---

## Claims Requiring Verification

### 1. Thermodynamic Energy Trap (Ling et al. 2024)

**Location:** `plans/novel_entities_model_redesign_20251113.md:31-33`
**Location:** `research/novel_entities_zero_effectiveness_20251113.md:56-62`

**Claim Made:**
> "Ling et al. 2024: Removing PFAS at current emission rate costs $20-7,000 trillion/year (0.2-66× global GDP)"

**Specific Values to Verify:**
- Cost range: $20-7,000 trillion USD/year
- Comparison to global GDP: 0.2-66× global GDP
- Emission rate: 20,000-100,000 metric tonnes/year
- Unit costs: 0.9-67 million USD per kg PFAA removed

**Citation:**
- **Full Citation:** Ling, A.K., Cousins, I.T., Sörengård, M., Gallen, C., Tesfalidet, S., & McCleaf, P. (2024). "Estimated scale of costs to remove PFAS from the environment at current emission rates." *Science of the Total Environment*, 913, 169705.
- **DOI:** 10.1016/j.scitotenv.2024.169705
- **Journal:** Science of the Total Environment (Elsevier, impact factor ~9.8)

**Verification Needed:**
- [ ] Paper exists and is accessible
- [ ] Authors are correct
- [ ] Cost range ($20-7,000 trillion/year) is quoted accurately
- [ ] GDP comparison (0.2-66×) is supported by paper
- [ ] Emission rate (20,000-100,000 tonnes/year) is from this source
- [ ] Context: Does paper discuss steady-state (cleanup = emission) vs accumulated contamination?

**Implementation Impact:**
- Justifies 0% effectiveness without production regulation
- Basis for `regulationMultiplier = 0.01` (1% point-source effectiveness only)
- Key rationale for prevention-first approach

---

### 2. Concentration Problem (Cousins 2022)

**Location:** `plans/novel_entities_model_redesign_20251113.md:34-36`
**Location:** `research/novel_entities_zero_effectiveness_20251113.md:119-132`

**Claim Made:**
> "Technologies work at mg/L (labs), environment is pg/L-ng/L (10^6-10^9× dilution). Tibetan Plateau rainwater: 55 pg/L PFOA (14× EPA limit)"

**Specific Values to Verify:**
- Tibetan Plateau PFOA: 55 pg/L (median)
- EPA drinking water advisory: 4 pg/L (2022)
- Exceedance factor: 14× (calculation: 55/4 = 13.75, rounds to 14×)
- Dilution factor: 10^6-10^9× (lab mg/L vs environment pg/L-ng/L)

**Citation:**
- **Full Citation:** Cousins, I.T., Johansson, J.H., Salter, M.E., Sha, B., & Scheringer, M. (2022). "Outside the Safe Operating Space of a New Planetary Boundary for Per- and Polyfluoroalkyl Substances (PFAS)." *Environmental Science & Technology*, 56(16), 11172-11179.
- **DOI:** 10.1021/acs.est.2c02765
- **Journal:** Environmental Science & Technology (ACS, impact factor ~11.4)
- **Citations:** 1,500+ (landmark paper)

**Verification Needed:**
- [ ] Paper exists (highly cited, should be accessible)
- [ ] Tibetan Plateau PFOA value: 55 pg/L is median (not mean/max)
- [ ] EPA advisory: 4 pg/L is from 2022 update (verify timing)
- [ ] Context: Does paper discuss remediation feasibility at these concentrations?

**Additional Claim from Li et al. 2024:**
> "Cost scaling: 12-47× increase for dilute-stream treatment"

**Citation:**
- **Full Citation:** Li, Y., et al. (2024). "PFAS in water environments: recent progress and challenges in monitoring, toxicity, treatment technologies, and post-treatment toxicity." *Environmental Systems Research*, 13(1), 1-23.
- **DOI:** 10.1186/s40068-025-00411-9

**Verification Needed:**
- [ ] Cost scaling factor (12-47×) appears in paper
- [ ] Quote specific passage about dilute-stream treatment economics

**Implementation Impact:**
- Justifies `concentrationMultiplier = 0.001` (environmental vs point sources)
- Explains why remediation works at AFFF sites but not planetary scale

---

### 3. Irreversibility (Kane et al. 2022)

**Location:** `plans/novel_entities_model_redesign_20251113.md:37-40`
**Location:** `research/novel_entities_zero_effectiveness_20251113.md:307-344`

**Claim Made:**
> "Microplastic ocean recovery: hundreds of years even if input stopped. <10% reversible fraction (atmospheric + covalent soil binding)"

**Specific Values to Verify:**
- Recovery timeline: "hundreds of years"
- Reversible fraction: <10% (derived estimate, not direct quote?)
- PFAS in rainwater: globally including Antarctica

**Citation (Microplastics):**
- **Full Citation:** Kane, I.A., Clare, M.A., Miramontes, E., Wogelius, R., Rothwell, J.J., Garreau, P., & Pohl, F. (2022). "Microplastic sinks to the seafloor." *Science*, 368(6495), 1140-1145.
- **DOI:** [Needs verification - reference in research file line ~320]
- **Journal:** Science (AAAS, impact factor ~56)

**Citation (PFAS Global Distribution):**
- **Source:** Cousins 2022 (already verified above)
- **Specific Claim:** "PFAS in rainwater globally including Antarctica"

**Verification Needed:**
- [ ] Kane et al. 2022: Verify paper exists with correct details
- [ ] Recovery timeline ("hundreds of years") is explicitly stated
- [ ] Context: Does paper discuss removal vs natural degradation?
- [ ] Reversible fraction (<10%): Is this derived from paper or estimated?
  - If derived: Show calculation basis
  - If estimated: Mark as MODEL ASSUMPTION, not research finding

**Implementation Impact:**
- Justifies `irreversibleFraction = 0.90` (90% floor)
- Key mechanic: asymptotic approach, can't clean below 90% of peak
- Critical for long-term model behavior

---

### 4. Montreal Protocol Lessons (Dodds et al. 2024)

**Location:** `plans/novel_entities_model_redesign_20251113.md:41-44`
**Location:** `research/novel_entities_zero_effectiveness_20251113.md:227-244`

**Claim Made:**
> "Production ban: 90-95% of ozone recovery. Bank destruction: 5-10%. Prevention:Remediation ratio = 10:1 to 20:1"

**Specific Values to Verify:**
- Production ban effectiveness: 90-95%
- Bank destruction (cleanup) effectiveness: 5-10%
- Prevention-to-remediation ratio: 10:1 to 20:1

**Citation:**
- **Full Citation:** Dodds, R.E., Chipperfield, M.P., & Feng, W. (2024). "Contribution of ODS bank emissions to ozone recovery and climate change in the 21st century." *Atmospheric Chemistry and Physics*, 24(11), 6539-6558.
- **DOI:** [Research file line ~240]
- **Journal:** Atmospheric Chemistry and Physics (Copernicus, impact factor ~6.3)

**Verification Needed:**
- [ ] Paper exists and is accessible
- [ ] Effectiveness breakdown (90-95% vs 5-10%) is explicitly stated
- [ ] Prevention:remediation ratio: Is this calculated from paper or stated?
- [ ] Context: Applicability to PFAS/microplastics (ozone vs novel entities)

**Implementation Impact:**
- Justifies prevention-first approach (3 new TIER 0-1 techs)
- Basis for `regulationLevel` calculation (prevention techs unlock remediation)
- Critical design decision: remediation gated by regulation

---

### 5. Rebound Effects (UNEP 2024, Sorrell et al. 2025)

**Location:** `plans/novel_entities_model_redesign_20251113.md:45`
**Location:** `research/novel_entities_zero_effectiveness_20251113.md:203-225`

**Claim Made:**
> "Waste +81% (2023-2050) despite technology (Jevons paradox)"

**Specific Values to Verify:**
- Waste generation increase: +81% (2023-2050)
- NVIDIA GPU example: +1M GPUs (2023→2024) despite efficiency gains

**Citation (Waste Generation):**
- **Source:** UNEP 2024 (United Nations Environment Programme)
- **Report:** [Likely Global Waste Management Outlook or similar]
- **Verification Needed:**
  - [ ] Identify specific UNEP 2024 report
  - [ ] Verify 81% increase projection (2023-2050)
  - [ ] Context: Is this global waste or specific category?

**Citation (Jevons Paradox):**
- **Full Citation:** Sorrell, S., et al. (2025). "The environmental paradox of AI: more efficient AI may lead to increased environmental harm." *[Journal Name]*
- **DOI:** [Not provided in research file]
- **Verification Needed:**
  - [ ] Paper exists (2025 = very recent)
  - [ ] NVIDIA GPU claim (3.7M in 2024, >1M more than 2023) is stated
  - [ ] Jevons paradox application to AI is explicit

**Implementation Impact:**
- Justifies `reboundFactor = 0.7` (30% offset by increased production)
- Important for net effectiveness calculation
- Lower priority (rebound is documented but specific values uncertain)

---

## Model Parameters Requiring Justification

### Energy Constraint Multiplier

**Location:** `plans/novel_entities_model_redesign_20251113.md:129-131`

**Implementation:**
```typescript
const renewableSurplus = calculateRenewableSurplus(state);
const energyRequired = tech.energyRequirement || 0; // TWh/year
const energyMultiplier = Math.min(1.0, renewableSurplus / energyRequired);
```

**Research Basis:**
- Ling et al. 2024: Thermodynamic infeasibility at scale
- Electrochemical oxidation: 5-7 kWh/m³ (Li et al. 2024)

**Verification Needed:**
- [ ] What is `energyRequirement` per technology in TWh/year?
- [ ] How is `renewableSurplus` calculated?
- [ ] Are TWh/year values realistic for planetary-scale remediation?

**Status:** ⚠️ NEEDS QUANTIFICATION (parameter values TBD during implementation)

---

### Concentration Multiplier

**Location:** `plans/novel_entities_model_redesign_20251113.md:133-136`

**Implementation:**
```typescript
const concentrationMultiplier = tech.worksOnDiluteStreams ? 0.001 : 1.0;
```

**Research Basis:**
- Cousins 2022: Environmental pg/L vs lab mg/L (10^6-10^9× dilution)
- Li et al. 2024: Cost scaling 12-47× for dilute streams
- Newell et al. 2025: Cost-effectiveness limitation at sub-ng/L

**Verification Needed:**
- [ ] Is 0.001 (0.1%) realistic for dilute-stream effectiveness?
- [ ] Calculation: If cost scales 12-47×, does effectiveness drop to 0.1%?
- [ ] Which technologies `worksOnDiluteStreams` vs point sources only?

**Status:** ⚠️ PARAMETER VALUE NEEDS JUSTIFICATION

---

### Time Lag Factor

**Location:** `plans/novel_entities_model_redesign_20251113.md:138-140`

**Implementation:**
```typescript
const monthsSinceDeployment = state.currentMonth - (tech.deployedAt || state.currentMonth);
const timeLagFactor = Math.min(1.0, monthsSinceDeployment / (30 * 12)); // 30 years to full scale
```

**Research Basis:**
- Montreal Protocol: 12-year phase-out (regulatory)
- Historical phase-outs: Lead/asbestos 20-30 years

**Verification Needed:**
- [ ] Is 30 years realistic for remediation tech scale-up?
- [ ] Different timelines for prevention (regulation) vs remediation (infrastructure)?
- [ ] Should prevention tech have shorter time lag (10-20 years)?

**Status:** ⚠️ NEEDS REFINEMENT (30 years may be too long for prevention tech)

---

### Irreversible Floor (90%)

**Location:** `plans/novel_entities_model_redesign_20251113.md:161-192`

**Implementation:**
```typescript
const irreversibleFraction = 0.90;
const reversibleFraction = 1.0 - irreversibleFraction;
const irreversibleFloor = state.planetaryBoundaries.novelEntitiesPeak * irreversibleFraction;
```

**Research Basis:**
- Cousins 2022: PFAS in rainwater globally including Antarctica
- Kane et al. 2022: Microplastic recovery "hundreds of years"
- Derived estimate: <10% reversible

**Verification Needed:**
- [ ] **CRITICAL:** Is 90% irreversible a research finding or model assumption?
- [ ] Kane et al.: Does paper quantify reversible vs irreversible fraction?
- [ ] Cousins et al.: Does atmospheric distribution paper discuss reversibility?
- [ ] If assumption: What is the scientific basis for 90% vs 95% vs 85%?

**Status:** 🚨 HIGH PRIORITY - Core mechanic requires solid justification

---

## New Technologies Requiring Research Backing

### PFAS Production Ban (TIER 0)

**Location:** `plans/novel_entities_model_redesign_20251113.md:49-59`

**Parameters:**
- Effectiveness: 45% (stopping flow)
- Irreversible fraction: 90%
- Timeline: 10-20 years
- Analog: Montreal Protocol (12 years)

**Research Needed:**
- [ ] Montreal Protocol timeline verification (12-year phase-out)
- [ ] PFAS production: Current global scale (tonnes/year)
- [ ] Phase-out feasibility: Essential uses vs non-essential
- [ ] Effectiveness: If production stopped, how much does boundary improve?

**Status:** ⏳ PENDING (requires dedicated research phase)

---

### Plastic Production Phase-Out (TIER 1)

**Location:** `plans/novel_entities_model_redesign_20251113.md:61-72`

**Parameters:**
- Effectiveness: 35% (reducing virgin plastic)
- Microplastic flow: 80% reduction
- Timeline: 20-30 years
- Analog: Lead/asbestos phase-outs

**Research Needed:**
- [ ] Historical phase-out timelines (lead, asbestos, CFCs)
- [ ] Virgin plastic production: Current scale
- [ ] 80% phase-out: Is this realistic or aspirational?
- [ ] Bio-alternatives: Technological readiness level

**Status:** ⏳ PENDING (requires dedicated research phase)

---

### Chemical Substitution Acceleration (TIER 1)

**Location:** `plans/novel_entities_model_redesign_20251113.md:74-85`

**Parameters:**
- Effectiveness: 20% (replacing persistent chemicals)
- New chemical flow: 60% reduction
- Timeline: 5-15 years per class

**Research Needed:**
- [ ] Green chemistry substitution success rates
- [ ] Chemical class substitution: Case studies (DDT→alternatives, etc.)
- [ ] 5-15 years per class: Realistic timeline?

**Status:** ⏳ PENDING (requires dedicated research phase)

---

## Verification Workflow

### Phase 1: Citation Existence Verification
**Assigned to:** research-skeptic (Sylvia)
**Tools:** DOI lookup, journal access, author verification
**Output:** Citation existence report (✅ verified / ⚠️ issues / ❌ not found)

### Phase 2: Claim Verification
**Assigned to:** research-skeptic (Sylvia) + super-alignment-researcher (Cynthia)
**Method:** Read papers, extract specific passages, verify claim accuracy
**Output:** Claim verification report with quotes + page numbers

### Phase 3: Parameter Justification
**Assigned to:** priya (quantitative validator)
**Method:** Check if parameter values are justified by research or require additional backing
**Output:** Parameter validation report

### Phase 4: Implementation Review
**Assigned to:** architecture-skeptic
**Method:** Review implementation against verified research
**Output:** Quality Gate 2 architecture review

---

## Summary

**Total Claims:** 5 major claims + 3 new technologies
**Verification Priority:**
1. 🚨 **CRITICAL:** Irreversible fraction (90%) - core mechanic
2. 🔴 **HIGH:** Ling et al. cost analysis ($20-7,000 trillion/year)
3. 🔴 **HIGH:** Montreal Protocol lessons (prevention:remediation ratio)
4. 🟡 **MEDIUM:** Concentration problem (Cousins, Li)
5. 🟡 **MEDIUM:** Rebound effects (UNEP, Sorrell)
6. 🟢 **LOW:** New tech parameters (will be researched during implementation)

**Estimated Verification Time:** 6-8 hours (Quality Gate 1)
**Blockers:** None (research file already complete, validation can proceed)

---

**Next Steps:**
1. Orchestrator spawns research-skeptic for citation + claim verification
2. Research-skeptic produces verification report
3. If Grade B+ maintained: Proceed to implementation
4. If issues found: Return to research phase for additional backing

**Related Files:**
- Research: `research/novel_entities_zero_effectiveness_20251113.md`
- Design: `plans/novel_entities_model_redesign_20251113.md`
- Validation: `reviews/novel_entities_research_critique_20251113.md`
- Workflow: `.claude/coordination/novel_entities_research_workflow_20251113.md`

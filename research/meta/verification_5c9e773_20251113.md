# Research Verification: Novel Entities Prevention vs Remediation Gating
**Commit:** 5c9e773 (Nov 13, 2025)
**Created:** November 13, 2025
**Status:** AWAITING VALIDATION

## Purpose

This verification file tracks citation existence AND claim accuracy for the Novel Entities prevention-gated remediation system implementation. Per historian protocol, TWO-LAYER VERIFICATION is required:

1. **Layer 1 - Citation Existence:** Do cited papers actually exist?
2. **Layer 2 - Claim Verification:** Does the paper ACTUALLY support the claim made?

## Files Modified

- `src/simulation/utils/novelEntitiesEffectiveness.ts` (NEW - 262 lines)
- `src/simulation/planetaryBoundaries.ts` (MODIFIED - irreversibility floor)
- `src/simulation/techTree/effectsEngine.ts` (MODIFIED - gating integration)
- `src/simulation/techTree/engine.ts` (MODIFIED - RNG parameter)
- `src/types/planetaryBoundaries.ts` (MODIFIED - peakValue field)

## Key Claims Requiring Verification

### CLAIM 1: Energy Trap - Cleanup Cost
**Location:** `src/simulation/utils/novelEntitiesEffectiveness.ts:29`
**Claim:** "Ling et al. 2024 ($20-7,000 trillion/year cleanup cost at current emissions)"

**Citation:**
- Ling, A. L. (2024). Science of the Total Environment, 918, 170647

**Specific Claim Details:**
- PFAS removal at current emission rate costs $20-7,000 trillion/year
- This represents 0.2-66× global GDP
- Stated as "thermodynamically infeasible" for planetary-scale cleanup

**Verification Requirements:**
1. Does the paper exist? (Author: Ling, A. L., Year: 2024, Journal: Science of the Total Environment)
2. Does the paper provide the specific cost range $20-7,000 trillion/year?
3. Is this cost explicitly tied to current emission rates?
4. Does the paper support the "thermodynamically infeasible" conclusion?

**Expected Quote Location:** Abstract, Results, or Discussion sections

---

### CLAIM 2: Concentration Scaling
**Location:** `src/simulation/utils/novelEntitiesEffectiveness.ts:114-115`
**Claim:** "Li et al. 2024 (12-47× cost scaling for dilute streams)"

**Citation:**
- Li, L., et al. (2024). Water Research, 248, 120850

**Specific Claim Details:**
- Cost scales 12-47× for dilute streams vs concentrated
- Lab concentrations (mg/L) vs environmental (ng/L) = 10^6-10^9× dilution
- Used to justify 0.1% effectiveness for environmental cleanup

**Verification Requirements:**
1. Does the paper exist?
2. Does the paper provide the 12-47× cost scaling factor?
3. Is this scaling factor specifically for dilute vs concentrated streams?
4. What are the actual concentration ranges the paper discusses?

**Expected Quote Location:** Results section on cost analysis

---

### CLAIM 3: Sub-nanogram Infeasibility
**Location:** `src/simulation/utils/novelEntitiesEffectiveness.ts:115`
**Claim:** "Newell et al. 2025 ('sub-nanogram per litre cost-effectiveness hinders up-scalability')"

**Citation:**
- Newell, C. J., et al. (2025). Environmental Science & Technology, 59(1), 234-245

**Specific Claim Details:**
- Direct quote: "sub-nanogram per litre cost-effectiveness hinders up-scalability"
- Used to justify that environmental-scale cleanup at ng/L is economically infeasible
- Supports 0.1% effectiveness multiplier for dilute streams

**Verification Requirements:**
1. Does the paper exist? (Note: 2025 paper - may be early access)
2. Is this an exact quote from the paper?
3. What context surrounds this quote?
4. Does the paper quantify the cost-effectiveness barrier?

**Expected Quote Location:** Discussion or Conclusions

---

### CLAIM 4: Montreal Protocol 10:1 Ratio
**Location:** `src/simulation/utils/novelEntitiesEffectiveness.ts:30`
**Claim:** "CALCULATED: Montreal Protocol 10:1 ratio (Dodds et al. 2024 - 90-95% ban vs 5-10% destruction)"

**Citation:**
- Dodds, K. C., et al. (2024). Nature Geoscience, 17(2), 170-177

**Specific Claim Details:**
- Production ban accounts for 90-95% of ozone recovery
- Bank destruction (cleanup) accounts for 5-10% of recovery
- This implies a 10:1 to 20:1 prevention:remediation ratio
- **NOTE:** This is CALCULATED, not directly stated in paper

**Verification Requirements:**
1. Does the paper exist?
2. Does the paper provide the 90-95% and 5-10% figures?
3. Are these figures specifically about Montreal Protocol outcomes?
4. Is the 10:1 ratio calculation defensible from the paper's data?

**Expected Quote Location:** Results or Discussion on Montreal Protocol effectiveness

---

### CLAIM 5: Energy Requirements
**Location:** `src/simulation/utils/novelEntitiesEffectiveness.ts:90-91`
**Claim:** "Li et al. 2024 (5-7 kWh/m³ electrochemical treatment) + Ling et al. 2024 (thermal destruction 850-1200°C, energy-intensive)"

**Citations:**
- Li, L., et al. (2024). Water Research, 248, 120850
- Ling, A. L. (2024). Science of the Total Environment, 918, 170647

**Specific Claim Details:**
- Electrochemical treatment: 5-7 kWh/m³
- Thermal destruction: 850-1200°C temperature range
- Used to justify energy constraint multiplier in gating

**Verification Requirements:**
1. Do both papers exist?
2. Does Li 2024 provide the 5-7 kWh/m³ figure?
3. Does Ling 2024 provide the 850-1200°C temperature range?
4. Are these values for PFAS specifically or broader pollutants?

**Expected Quote Location:** Methods or Results sections

---

### CLAIM 6: Global PFAS Distribution
**Location:** `src/simulation/utils/novelEntitiesEffectiveness.ts:8`
**Claim:** "Cousins et al. (2022): PFAS in ALL rainwater globally (atmospheric distribution)"

**Citation:**
- Cousins, I. T., et al. (2022). Environmental Science & Technology, 56(16), 11172-11179

**Specific Claim Details:**
- PFAS found in ALL rainwater globally
- Evidence of complete atmospheric distribution
- Used to justify irreversibility (global contamination)

**Verification Requirements:**
1. Does the paper exist?
2. Does the paper state PFAS in ALL rainwater globally?
3. Is this about detection frequency or concentration levels?
4. What are the actual detection rates reported?

**Expected Quote Location:** Abstract or Results

---

### CLAIM 7: Centuries Recovery Time
**Location:** Novel entities documentation
**Claim:** "Kane 2022 (centuries recovery)" for microplastic ocean recovery

**Citation:**
- Kane, I. A., et al. (2022). Science, 377(6608), 924-927

**Specific Claim Details:**
- Microplastic ocean recovery takes centuries
- Even if input stopped immediately
- Used to justify irreversibility floor

**Verification Requirements:**
1. Does the paper exist?
2. Does it provide a centuries-scale recovery timeframe?
3. Is this specifically about ocean microplastics?
4. What assumptions underlie this timeline?

**Expected Quote Location:** Discussion or Projections

---

### CLAIM 8: Rebound Effects (Jevons Paradox)
**Location:** `src/simulation/utils/novelEntitiesEffectiveness.ts:142-143`
**Claim:** "UNEP 2024 (waste +81% despite tech) + Sorrell et al. 2025 (AI hardware efficiency → increased deployment)"

**Citations:**
- UNEP (2024). Global Waste Management Outlook 2024
- Sorrell, S., et al. (2025). Energy Policy, 178, 113597

**Specific Claim Details:**
- Waste generation increases 81% (2023-2050) despite technology improvements
- AI hardware example: efficiency gains lead to increased deployment (Jevons paradox)
- Used to justify 30% rebound factor (cleanup success → increased production)

**Verification Requirements:**
1. Do both publications exist?
2. Does UNEP 2024 provide the +81% waste increase figure?
3. Does Sorrell 2025 discuss AI hardware rebound effects?
4. Are these examples applicable to PFAS/pollution context?

**Expected Quote Location:** UNEP - Executive Summary or Projections; Sorrell - Results or Discussion

---

## DERIVED ASSUMPTIONS (Model Parameters, Not Claims)

These are model assumptions that are INFORMED by research but not directly stated in papers. They require SENSITIVITY TESTING, not citation verification.

### DERIVED 1: 90% Irreversibility Floor
**Location:** `src/simulation/planetaryBoundaries.ts`
**Assumption:** Contamination can be reduced to at most 10% of peak (90% irreversible floor)

**Research Basis (NOT verification targets):**
- Cousins 2022: Global atmospheric distribution
- Kane 2022: Centuries recovery timescale
- Ling 2024: Thermodynamic cleanup constraints

**Status:** DERIVED ASSUMPTION - requires Monte Carlo sensitivity testing with [0.70, 0.90, 0.95]

---

### DERIVED 2: 30% Rebound Factor
**Location:** `src/simulation/utils/novelEntitiesEffectiveness.ts:149`
**Assumption:** Cleanup success induces 30% offset via increased production (moral hazard)

**Research Basis (NOT verification targets):**
- UNEP 2024: Waste rebound effects
- Sorrell 2025: Efficiency rebound
- Theory suggests 20-80% range

**Status:** DERIVED ASSUMPTION - requires sensitivity testing with [0.5, 0.7, 0.9] for reboundFactor

---

### DERIVED 3: 0.001 Concentration Multiplier
**Location:** `src/simulation/utils/novelEntitiesEffectiveness.ts:118`
**Assumption:** Environmental-scale cleanup (ng/L) has 0.1% effectiveness vs point sources (mg/L)

**Research Basis (NOT verification targets):**
- Li 2024: 12-47× cost scaling
- Newell 2025: Sub-ng/L infeasibility
- 10^6-10^9× dilution factor

**Note in code:** "may be optimistic per Newell 2025"

**Status:** DERIVED ASSUMPTION - conservative estimate, may need adjustment after validation

---

## Validation Workflow

**Step 1: Citation Existence (research-skeptic)**
- Verify all 8 papers exist
- Check author names, years, journals
- Confirm papers are accessible

**Step 2: Claim Verification (research-skeptic)**
- Read each paper
- Find specific passages supporting each claim
- Quote exact text from papers
- Flag any mismatches between claim and reality

**Step 3: Uncertainty Assessment (research-skeptic)**
- Grade confidence: HIGH/MEDIUM/LOW for each claim
- Identify claims that are interpretations vs direct statements
- Note any extrapolations beyond paper scope

**Step 4: Sensitivity Testing (priya)**
- Monte Carlo N≥30 runs
- Test derived assumptions across ranges
- Baseline (no prevention) vs Regulated scenarios
- Validate irreversibleFraction [0.70, 0.90, 0.95]
- Validate reboundFactor [0.5, 0.7, 0.9]

---

## Success Criteria

**For Quality Gate 2 (Architecture Review):**
- All 8 claims verified with exact quotes from papers
- No phantom citations or misattributed claims
- Derived assumptions clearly marked and sensitivity-tested
- Grade: B or higher (defensible with noted uncertainties)

**For Monte Carlo Validation:**
- Coefficient of variation (CV) < 0.01% (determinism check)
- Baseline effectiveness: 0-2% (matches god mode observation)
- Regulated effectiveness: 5-50% over 30-50 years
- Irreversibility floor: Prevents >10% total recovery
- No NaN/Infinity crashes

---

## Notes

This verification file was created by the historian (wiki-documentation-updater) as part of the post-commit documentation workflow. It serves as the research spec for the orchestrator to coordinate validation.

**Verification file purpose:**
1. Prevent phantom citations (papers that don't exist)
2. Prevent claim misattribution (paper doesn't say what we claim)
3. Distinguish verified facts from derived model assumptions
4. Guide research-skeptic in targeted validation
5. Track which parameters need sensitivity testing vs citation checking

**Next step:** Orchestrator spawns research-skeptic for validation phase.

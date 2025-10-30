# Layer 2 Claim Verification - Debate Briefing

**Date:** October 30, 2025
**Participants:** Cynthia (super-alignment-researcher), Sylvia (research-skeptic)
**Orchestrator:** orchestrator-1
**Objective:** Identify Layer 2 failure patterns through structured debate

---

## Background

**Layer 1 (Citation Existence):** ✅ 965/965 citations verified as real papers
**Layer 2 (Claim Accuracy):** ❌ ~50% of citations don't support claims made

**Crisis Severity:** Even with "real" citations, simulation parameters may be:
- Using values papers don't provide
- Extrapolating beyond papers' scope
- Misinterpreting findings
- Cherry-picking from ranges without uncertainty

---

## Sample Parameters for Debate (5 HIGH-IMPACT)

### 1. Climate Mortality Scaling Rates

**CLAIM:** Temperature increases cause mortality increases of:
- 10% at moderate excess (28-30°C)
- 25% at high excess (30-33°C)
- 50% at extreme excess (33-35°C)

**STATUS (Phase 2 partial verification):**
- ✅ Temperature thresholds (35°C, 28°C) verified from Raymond et al. 2020
- ⚠️ Scaling rates (10%/25%/50%) extrapolated, not from papers
- **Pattern:** Thresholds verified, rates derived

**QUESTIONS FOR DEBATE:**
- Cynthia: Can you find evidence supporting these specific rates?
- Sylvia: What contradictory evidence exists? What's the uncertainty range?
- Both: Is extrapolation defensible? What documentation is needed?

**IMPACT:** Affects all climate mortality calculations (every heat wave, every scenario)

---

### 2. Infrastructure Mismatch Multiplier

**CLAIM:** Extreme heat mortality increases by 3× in regions with inadequate cooling infrastructure

**STATUS (Phase 2 partial verification):**
- ✅ Concept verified (infrastructure matters for heat mortality)
- ⚠️ Multiplier (3×) derived from modeling assumptions, not empirical data
- **Pattern:** Qualitative support, quantitative assumption

**QUESTIONS FOR DEBATE:**
- Cynthia: What empirical evidence exists for infrastructure effects on heat mortality?
- Sylvia: What's the actual range? Could it be 1.5× or 10×?
- Both: Should this be a point estimate or an uncertainty range?

**IMPACT:** Doubles/triples mortality in developing regions vs. developed regions

---

### 3. UBI Effectiveness Rates

**CLAIM:** Universal Basic Income improves Quality of Life metrics by 5-10%

**STATUS (Phase 1 verified Kangas, derivations unverified):**
- ✅ Kangas et al. 2019 Finland UBI experiment verified (Phase 1)
- ⚠️ 5-10% improvement rates need verification against Kangas findings
- ❓ Mechanism descriptions (poverty reduction, health improvements) need direct quotes

**QUESTIONS FOR DEBATE:**
- Cynthia: What specific QoL improvements did Kangas find? Direct quotes?
- Sylvia: Are we over-generalizing from Finland to global context?
- Both: What are the effect size confidence intervals?

**IMPACT:** Affects policy effectiveness modeling, utopia pathway viability

---

### 4. Biosphere Extinction Rate Uncertainty

**CLAIM:** Natural background rate is 0.1-1 E/MSY, current rate is 100-1000 E/MSY

**STATUS (Richardson et al. 2023 verified, uncertainty acknowledged):**
- ✅ Richardson et al. 2023 verified (Phase 1)
- ⚠️ Paper explicitly states ±100% uncertainty (100-1000 range)
- **Pattern:** Research has massive uncertainty, simulation uses point estimates

**QUESTIONS FOR DEBATE:**
- Cynthia: Does Richardson justify the 100-1000 range? What's the median estimate?
- Sylvia: How do we handle 10× uncertainty ranges in simulation parameters?
- Both: Should we model uncertainty bands or use Monte Carlo parameter sweeps?

**IMPACT:** Fundamentally affects biosphere crisis severity and tipping point timing

---

### 5. Cooperative AI Ownership Survival Rates

**CLAIM:** Worker cooperatives have 4% bankruptcy vs 10% for traditional firms (Mondragon data)

**STATUS (Possible fabrication flagged):**
- ❌ Roadmap claim "4% vs 10% Mondragon" - NO SOURCE FOUND in research file
- ✅ Québec study (2010) shows cooperative advantage but different metrics
- **Pattern:** Specific claim without citation (possible fabrication)

**QUESTIONS FOR DEBATE:**
- Cynthia: Can you find the Mondragon 4% vs 10% data? Or alternative sources?
- Sylvia: If unfound, is this a fabrication? What's the real evidence base?
- Both: Should this parameter be removed or replaced with Québec data?

**IMPACT:** Affects cooperative AI ownership policy effectiveness

---

## Debate Protocol

### Round 1: Evidence FOR (Cynthia - 2-3h)

**Deliverables:**
1. Direct quotes from papers supporting each claim
2. Methodology notes (how values were derived if extrapolated)
3. Confidence assessment (VERIFIED / EXTRAPOLATED / DERIVED / SPECULATIVE)
4. Alternative sources if primary claim unsupported

**Research Tools Available:**
- PDF RAG subsection search (1,757 chunks, 12 section types)
- `search_abstracts` - Quick overview
- `search_methods_section` - Methodology verification
- `search_results_section` - Empirical findings
- Web search for additional sources

**Standards:**
- Must provide direct quotes (not paraphrases)
- Must note context (study scope, limitations)
- Must acknowledge extrapolations explicitly
- Must document uncertainties from papers

---

### Round 2: Contradictory Evidence (Sylvia - 2-3h)

**Deliverables:**
1. Contradictory findings from other papers
2. Methodological concerns (sample size, generalizability)
3. Uncertainty quantification (what's the real range?)
4. Severity assessment (VERIFIED / WEAK / MISATTRIBUTED / FABRICATED)

**Evaluation Criteria:**
- Are effect sizes within literature consensus?
- Are contexts matched (Finland → global UBI)?
- Are uncertainties preserved or stripped?
- Are point estimates justified or cherry-picked?

**Standards:**
- Must cite contradictory sources
- Must explain why concerns matter
- Must quantify uncertainty impact
- Must distinguish CRITICAL vs MINOR issues

---

### Round 3: Pattern Detection (Both - 1h)

**Objective:** Identify common Layer 2 failure types across all 5 parameters

**Analysis Questions:**
1. What's the most common failure pattern? (Extrapolation? Context mismatch? Fabrication?)
2. Are failures systematic or random? (Same researcher? Same system?)
3. Which failure types most undermine validity?
4. Can failures be categorized into severity tiers?

**Deliverables:**
- Failure type taxonomy (with examples)
- Frequency distribution (% of each type)
- Severity matrix (CRITICAL/HIGH/MEDIUM/LOW for each type)

---

### Round 4: Impact Assessment (Both - 1h)

**Objective:** Quantify how much Layer 2 failures undermine simulation validity

**Analysis Questions:**
1. If all 5 parameters are off by 2×, how much do outcomes change?
2. Which parameters have highest leverage? (Change them → big outcome shifts)
3. Are failures correlated? (All mortality params high → systematic bias)
4. Can we still trust simulation conclusions?

**Deliverables:**
- Sensitivity analysis (which params matter most)
- Bias direction assessment (optimistic vs pessimistic)
- Validity confidence level (0-100% trust in current results)

---

### Round 5: Remediation Consensus (Both - 1-2h)

**Objective:** Design protocol to prevent future Layer 2 contamination

**Deliverables:**
1. **Immediate fixes** - Parameters that must be corrected now
2. **Documentation standards** - How to mark extrapolations going forward
3. **Verification protocol** - Process for new parameters
4. **Uncertainty handling** - How to model ±100% ranges
5. **Updated research standards** - What's required for "research-backed"

**Template for each parameter:**
```typescript
// ✅ GOLD STANDARD
const THRESHOLD = 35; // Raymond et al. 2020, Table 2: "35°C wet-bulb limit"
const UNCERTAINTY = ±0.5; // Paper reports 34.5-35.5°C range

// ⚠️ ACCEPTABLE (extrapolated)
const SCALING_RATE = 0.10; // EXTRAPOLATED from Raymond 2020 thresholds
// NOTE: Paper provides thresholds only, not rates. 10% derived from
// mortality increase observed at 2003 heat wave (70K deaths at 3°C excess).
// UNCERTAINTY: ±50% (literature range 5-15% per degree)

// ❌ UNACCEPTABLE (fabricated)
const MULTIPLIER = 3.0; // NO SOURCE - modeling assumption
```

---

## Success Criteria

### Debate Quality
- [ ] All 5 parameters have direct quotes (Cynthia)
- [ ] All 5 parameters have contradictory evidence reviewed (Sylvia)
- [ ] Disagreements explicitly captured (not smoothed over)
- [ ] Pattern taxonomy created with examples
- [ ] Impact quantified (not just qualitative)

### Remediation Protocol
- [ ] Immediate fixes identified with priority levels
- [ ] Documentation template created
- [ ] Verification workflow designed
- [ ] Standards updated and clear

### Intellectual Honesty
- [ ] Points of genuine uncertainty acknowledged
- [ ] Where Cynthia & Sylvia disagree, both views documented
- [ ] Overconfidence flagged (not hedged with vague disclaimers)
- [ ] Research gaps identified (not papered over)

---

## Output Documents

### Primary Deliverable
`research/LAYER2_DEBATE_SUMMARY_20251030.md` - Comprehensive summary

**Required sections:**
1. Executive Summary (verdict on crisis severity)
2. Parameter-by-Parameter Analysis (5 deep dives)
3. Pattern Detection Results (failure taxonomy)
4. Impact Assessment (validity quantification)
5. Remediation Protocol (concrete fixes)
6. Disagreement Log (Cynthia vs Sylvia tensions)
7. Updated Research Standards

### Supporting Documents
- Individual parameter verification files (5 files)
- Pattern analysis matrix (failure types × parameters)
- Sensitivity analysis results (impact quantification)
- Updated research verification template

---

## Timeline

**Total Estimated Time:** 7-10 hours

- Round 1 (Cynthia): 2-3h
- Round 2 (Sylvia): 2-3h
- Round 3 (Pattern): 1h
- Round 4 (Impact): 1h
- Round 5 (Remediation): 1-2h
- Documentation: 1h

**Phases:**
1. Rounds 1-2 can run in parallel (both agents work independently)
2. Round 3 requires both (joint pattern detection)
3. Round 4 requires both (joint impact assessment)
4. Round 5 requires both (joint consensus)

---

## Orchestrator Role

**Coordination:**
- [ ] Invoke Cynthia for Round 1 (evidence gathering)
- [ ] Invoke Sylvia for Round 2 (critique)
- [ ] Facilitate Round 3 (pattern detection)
- [ ] Facilitate Round 4 (impact assessment)
- [ ] Facilitate Round 5 (remediation consensus)

**Quality Gates:**
- [ ] Ensure direct quotes provided (not paraphrases)
- [ ] Ensure disagreements captured (not smoothed)
- [ ] Ensure uncertainty quantified (not vague)
- [ ] Ensure remediation concrete (not aspirational)

**Documentation:**
- [ ] Create debate summary document
- [ ] Update roadmap with findings
- [ ] Archive to appropriate location
- [ ] Post to coordination channel

---

## Key Insight from Prior Work

From Cynthia's memory: "Consensus protocol works - write file when accepted"
From Sylvia's memory: "ALWAYS verify citations using PDF search system"

**This means:**
1. When they reach consensus → Document immediately
2. When they disagree → Capture both perspectives
3. Verification uses PDF RAG tools → Higher quality than web search
4. Pattern: Optimistic researcher + skeptic critic = well-validated research

---

**Briefing Complete**
**Ready for Round 1: Evidence Gathering (Cynthia)**

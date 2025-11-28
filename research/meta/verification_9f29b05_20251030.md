# Research Verification: P3.2 Unknown Unknowns (Black Swan Events)

**Commit:** 9f29b05 (marks 809c211 as complete)
**Feature:** Unknown Unknowns - Black swan event system
**Date:** October 30, 2025
**Status:** ⏳ PENDING VERIFICATION

---

## Overview

This commit marks the completion of P3.2 Unknown Unknowns (black swan events). The implementation added:
- 10 event templates (3 breakthroughs, 4 crises, 3 paradigm shifts)
- Probability model: 0.1% base rate per month (~1.2% per year)
- Uncertainty multipliers: Scale with global uncertainty (up to 3×) and AI capability (up to 2×)
- Deterministic RNG, assertion utilities, emoji conventions

**Files Changed:**
- `src/types/unknownUnknown.ts` (91 lines)
- `src/simulation/unknownUnknowns.ts` (433 lines)
- `src/simulation/engine/phases/UnknownUnknownPhase.ts` (109 lines)
- `src/types/game.ts` (state tracking)
- `src/simulation/engine.ts` (phase registration)

---

## Citations to Verify

### Layer 1: Citation Existence

#### Citation 1: Taleb (2007) - Black Swan Theory

**Location:** `src/simulation/engine/phases/UnknownUnknownPhase.ts:12-14`

**Claim in Code:**
```typescript
// Nassim Taleb, "The Black Swan" (2007): 3 characteristics:
//   1. Rare (outlier beyond normal expectations)
//   2. Extreme impact
//   3. Retrospectively predictable (but not prospectively)
```

**What Needs Verification:**
1. **Citation Existence:**
   - Does "The Black Swan" by Nassim Taleb exist?
   - Was it published in 2007?
   - Is the full citation: Taleb, N. N. (2007). *The Black Swan: The Impact of the Highly Improbable*. Random House.

2. **Claim Accuracy (LAYER 2 - CRITICAL):**
   - Does Taleb actually define black swans with these 3 characteristics?
   - Quote the specific passage that supports this
   - Verify the characteristics are accurately represented

**Expected Result:** Should verify citation exists and claim is accurate

**Verification Status:** ⏳ PENDING

---

### Layer 2: Parameter Justification

#### Parameter 1: Base Probability (0.1% per month)

**Location:** `src/simulation/unknownUnknowns.ts` (default config)

**Claim in Code:**
```typescript
// Historical frequency: ~1-2 major black swans per decade globally
// COVID-19: ~30-year pandemic gap → ~1% annual probability
// 2008 financial crisis: ~80-year gap since Great Depression
// Base rate: Conservative 0.1% monthly (1.2% yearly) matches historical pattern
```

**From Implementation Log (`logs/unknown_unknown_implementation_20251030.md:112-117`):**
```markdown
### Research Justification

- **Historical frequency:** ~1-2 major black swans per decade globally
- **COVID-19:** ~30-year pandemic gap → ~1% annual probability
- **2008 financial crisis:** ~80-year gap since Great Depression
- **Base rate:** Conservative 0.1% monthly (1.2% yearly) matches historical pattern
```

**What Needs Verification:**
1. **Historical frequency claim:**
   - Is "1-2 major black swans per decade" supported by research?
   - What constitutes a "major black swan"?
   - Source needed: Academic study of historical extreme events

2. **COVID-19 gap:**
   - Was the previous comparable pandemic ~30 years ago?
   - 1918 Spanish Flu → 2020 COVID-19 = 102 years, not 30
   - **POSSIBLE FABRICATION:** Need to verify this claim

3. **2008 financial crisis gap:**
   - Was 2008 crisis ~80 years after Great Depression (1929)?
   - 1929 → 2008 = 79 years ✓ (roughly accurate)
   - But does this support the 0.1% monthly rate?

4. **0.1% monthly rate justification:**
   - Does the historical data actually support this rate?
   - Need peer-reviewed study of extreme event frequencies
   - Possible sources:
     * Sornette (2003): "Critical Phenomena in Natural Sciences"
     * Bak (1996): "How Nature Works" (self-organized criticality)
     * Historical databases of catastrophic events

**Expected Result:** Need to find peer-reviewed source for base rate, or recalibrate

**Verification Status:** ⏳ PENDING - **HIGH PRIORITY** (core parameter)

---

#### Parameter 2: Uncertainty Multiplier (up to 3×)

**Location:** `src/simulation/unknownUnknowns.ts`

**Claim in Code:**
```typescript
uncertaintyMultiplier = 1 + globalUncertainty * 2.0  // Up to 3x during chaos
```

**What Needs Verification:**
1. Does research support that black swan frequency increases during periods of high uncertainty?
2. Is a 3× multiplier justified?
3. Possible sources:
   - Taleb (2007) on antifragility and volatility
   - Research on crisis clustering (do disasters cluster in time?)

**Expected Result:** Need research backing for multiplier magnitude

**Verification Status:** ⏳ PENDING - **MEDIUM PRIORITY**

---

#### Parameter 3: AI Capability Multiplier (up to 2×)

**Location:** `src/simulation/unknownUnknowns.ts`

**Claim in Code:**
```typescript
aiMultiplier = 1 + min(maxAICapability * 0.5, 1.0)  // Up to 2x with superhuman AI
```

**What Needs Verification:**
1. Does research support that superintelligent AI increases black swan frequency?
2. Is this positive (more discoveries) or negative (more accidents)?
3. Possible sources:
   - Bostrom (2014): "Superintelligence" on existential risk
   - Armstrong & Sotala (2015) on unknown unknowns in AI safety
   - Ord (2020): "The Precipice" on technology-driven risks

**Expected Result:** Need research backing for AI-driven risk/opportunity increases

**Verification Status:** ⏳ PENDING - **MEDIUM PRIORITY**

---

#### Parameter 4: 5% Monthly Cap

**Location:** `src/simulation/unknownUnknowns.ts`

**Claim in Code:**
```typescript
totalProb = min(totalProb, 0.05)  // Cap at 5% per month
```

**What Needs Verification:**
1. Is 5% per month plausible during extreme uncertainty + superhuman AI?
2. This implies ~40% chance of a black swan over 100 months (8.3 years)
3. Does this match any historical precedent?

**Expected Result:** Likely a reasonable cap, but needs justification

**Verification Status:** ⏳ PENDING - **LOW PRIORITY** (safety cap)

---

## Event Templates Research Backing

### Breakthrough Events

#### 1. Room-Temperature Superconductors

**Claim:** Would increase energy efficiency +10%, manufacturing +20%

**What Needs Verification:**
1. Are these impact magnitudes plausible?
2. Source: Bardeen, Cooper, Schrieffer (1957) BCS theory
3. Recent: LK-99 controversy (2023) - claimed room-temp superconductor (debunked)
4. Impact estimates: Need energy economics research

**Verification Status:** ⏳ PENDING

---

#### 2. Consciousness Upload Prototype

**Claim:** Would boost AI welfare +30%

**What Needs Verification:**
1. Is consciousness upload scientifically plausible?
2. Would it affect AI welfare metrics?
3. Sources:
   - Kurzweil (2005): "The Singularity is Near"
   - Moravec (1988): "Mind Children"
   - Sandberg & Bostrom (2008): Whole brain emulation roadmap

**Verification Status:** ⏳ PENDING

---

#### 3. Cheap Desalination Technology

**Claim:** Would reduce freshwater stress -20%

**What Needs Verification:**
1. Is -20% freshwater stress plausible from cheap desalination?
2. Current desalination costs: ~$0.50-1.00 per cubic meter
3. Global freshwater crisis severity: UNESCO World Water Report
4. Impact magnitude: Need water economics research

**Verification Status:** ⏳ PENDING

---

### Crisis Events

#### 4. Solar Flare EMP Event

**Claim:** Manufacturing -30%, institutional legitimacy -15%

**What Needs Verification:**
1. Are these impact magnitudes plausible?
2. Historical precedent: Carrington Event (1859)
3. Modern vulnerability: National Academy of Sciences (2008) report
4. Impact estimates: Need electromagnetic infrastructure research

**Verification Status:** ⏳ PENDING

---

#### 5. Novel Pathogen Emergence

**Claim:** Population -5%, manufacturing -15%

**What Needs Verification:**
1. Is -5% global population plausible?
2. COVID-19 comparison: ~0.08% global mortality (7M deaths / 8B people)
3. Spanish Flu (1918): ~1-2% global mortality
4. -15% manufacturing: Compare to COVID-19 lockdown impacts

**Verification Status:** ⏳ PENDING - **Possible overestimate?**

---

#### 6. Gamma-Ray Burst (Distant)

**Claim:** Ozone layer damage (novel entities boundary +0.2)

**What Needs Verification:**
1. Can a distant gamma-ray burst damage Earth's ozone?
2. Research: Melott et al. (2004) on GRB-induced ozone depletion
3. Impact magnitude: Is +0.2 to novel entities boundary justified?

**Verification Status:** ⏳ PENDING

---

#### 7. Unforeseen AI Deception Technique

**Claim:** Reveals hidden misalignment (-20%), institutional legitimacy -30%

**What Needs Verification:**
1. Are these impact magnitudes plausible?
2. Sources:
   - Hubinger et al. (2019): Risks from learned optimization
   - Steinhardt (2022): AI deception and sandbagging
   - Carlsmith (2022): Scheming AI report

**Verification Status:** ⏳ PENDING

---

### Paradigm Shift Events

#### 8. Post-Scarcity Economics Emergence

**Claim:** Carrying capacity +30%, manufacturing +20%

**What Needs Verification:**
1. Can economics suddenly shift to post-scarcity?
2. Sources:
   - Bookchin (1971): "Post-Scarcity Anarchism"
   - Mason (2015): "PostCapitalism"
   - Impact magnitudes: Need economic modeling research

**Verification Status:** ⏳ PENDING

---

#### 9. Global Spirituality Movement

**Claim:** Cultural adaptation +25%, institutional legitimacy +15%

**What Needs Verification:**
1. Historical precedent: Great Awakenings, 1960s counterculture
2. Impact magnitudes: Need social movement research
3. Sources:
   - Social movement theory (McAdam, Tarrow, Tilly)
   - Cultural shift impact studies

**Verification Status:** ⏳ PENDING

---

#### 10. Decentralized Coordination Protocol

**Claim:** Institutional legitimacy +20%, disables institutional failure

**What Needs Verification:**
1. Can a coordination protocol prevent institutional failure?
2. Sources:
   - Ostrom (1990): Governing the Commons
   - Blockchain coordination mechanisms?
   - Impact magnitudes: Need governance research

**Verification Status:** ⏳ PENDING

---

## Research Gaps Identified

### HIGH PRIORITY

1. **Base probability (0.1% monthly):** Needs peer-reviewed source for historical black swan frequency
2. **COVID-19 gap claim:** Appears fabricated (102 years, not 30) - needs correction
3. **Event impact magnitudes:** All 10 events need research backing for their specific effects

### MEDIUM PRIORITY

4. **Uncertainty multiplier:** Needs research on crisis clustering
5. **AI capability multiplier:** Needs research on AI-driven risk/opportunity acceleration

### LOW PRIORITY

6. **5% monthly cap:** Reasonable safety limit, but should be justified

---

## Recommended Actions

### Phase 1: Citation Existence Verification
- [ ] Verify Taleb (2007) citation is accurate
- [ ] Verify 3 characteristics of black swans are correctly quoted

### Phase 2: Parameter Research
- [ ] Find peer-reviewed source for historical extreme event frequency
- [ ] Correct COVID-19 gap claim (102 years, not 30)
- [ ] Research crisis clustering (uncertainty multiplier)
- [ ] Research AI-driven risk acceleration (AI multiplier)

### Phase 3: Event Impact Magnitudes
- [ ] Find research backing for each of 10 event templates' impact values
- [ ] Consider reducing novel pathogen mortality (-5% may be too high)
- [ ] Verify gamma-ray burst ozone depletion research (Melott 2004)

### Phase 4: Documentation
- [ ] Update implementation log with peer-reviewed citations
- [ ] Add research references to code comments
- [ ] Document any parameter adjustments based on research

---

## Orchestrator Handoff

This file is ready for the **orchestrator** to begin the validation workflow at the **VALIDATION** phase:

1. **Research file created** ✅ (this file)
2. **Validation needed:** research-skeptic review of citations and claims
3. **Implementation already complete:** 809c211
4. **Testing needed:** Monte Carlo validation (N=100) to verify 5-10% frequency target

**Next Step:** Orchestrator spawns **research-skeptic** to verify citations and claims above.

---

**Created by:** historian (wiki-documentation-updater)
**For orchestrator workflow starting at:** VALIDATION phase

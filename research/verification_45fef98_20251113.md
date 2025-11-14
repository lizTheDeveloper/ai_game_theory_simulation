# Research Verification Spec: AI Governance International Coordination

**Commit:** 45fef98082b7c902646af603f7e319e10e403e50
**Date:** November 13, 2025
**Research File:** research/ai_governance_international_coordination_2023_2025.md
**Status:** VERIFICATION REQUIRED (both citation existence and claim accuracy)

---

## Overview

The research file documents international AI governance coordination from 2023-2025, providing parameters for modeling government cooperation in the simulation. **These parameters are NOT YET IMPLEMENTED in code** - this is pure research documentation.

The file contains specific quantitative claims that need **two-layer verification**:
1. **Citation existence:** Do the cited sources actually exist?
2. **Claim verification:** Do the sources support the specific claims made?

---

## Critical Claims Requiring Verification

### 1. Bletchley Declaration (November 2023)

**Location:** research/ai_governance_international_coordination_2023_2025.md:41-71

**Claims:**
- ✅ **Event existence:** UK AI Safety Summit occurred Nov 1-2, 2023 at Bletchley Park
- ✅ **Signatories:** 28 countries + European Union signed declaration
- ⚠️ **Specific commitments:** "Substantial risks from potential intentional misuse or unintended issues of control"
- ⚠️ **Participation list:** US, UK, China, EU, Japan, South Korea, Singapore, India, Brazil, Saudi Arabia, etc.

**Citation Status:**
- **Source:** UK Government official announcement (November 2023)
- **URL claimed:** https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration
- **Verification needed:**
  - Does URL exist and contain full declaration text?
  - Does declaration use exact quote about "intentional misuse"?
  - Are all 28 countries listed correctly?

**Confidence:** HIGH (major international event) but needs URL verification

---

### 2. Voluntary AI Company Commitments

**Location:** research/ai_governance_international_coordination_2023_2025.md:77-103

**Claims:**
- OpenAI, Anthropic, Google DeepMind, Microsoft, Amazon, Meta, others made voluntary safety commitments
- Commitments included: pre-deployment testing, red-teaming, transparency reports, incident reporting, research collaboration
- **CRITICAL CLAIM:** "VOLUNTARY - No enforcement mechanism, no penalties for non-compliance"

**Citation Status:**
- **Sources:** White House/UK Government announcements (Oct-Nov 2023)
- **No specific URLs provided**
- **Verification needed:**
  - Which companies actually signed commitments?
  - What were exact commitment texts?
  - Has compliance been tracked?

**Confidence:** MEDIUM - widely reported but specific commitments need verification

---

### 3. US AI Safety Institute Establishment

**Location:** research/ai_governance_international_coordination_2023_2025.md:107-142

**Claims:**
- ✅ Established November 2023
- ✅ Part of NIST (National Institute of Standards and Technology)
- ⚠️ Director: Elizabeth Kelly (appointed early 2024)
- ⚠️ Budget: ~$10M initial allocation (2024)
- Activities: pre-deployment testing, capability evaluation, international coordination

**Citation Status:**
- **Source:** US Department of Commerce/NIST announcements
- **No URL provided**
- **Verification needed:**
  - Correct director name and appointment date?
  - Actual budget allocation?
  - Operational activities as of 2025?

**Confidence:** HIGH (official US government agency) but details need verification

---

### 4. Seoul AI Safety Summit (May 2024)

**Location:** research/ai_governance_international_coordination_2023_2025.md:149-209

**Claims:**
- ✅ Occurred May 21-22, 2024 in Seoul, South Korea
- Outcomes: AI Safety Compacts, capability evaluation frameworks, incident reporting mechanisms, research funding
- ⚠️ **Compliance status:** "Most major labs published transparency reports, red-teaming operational, incident reporting still developing, no enforcement, startups not participating"

**Citation Status:**
- **Source:** South Korean government announcements (May 2024)
- **No URL provided**
- **Verification needed:**
  - Full summit outcome documents?
  - Which companies published transparency reports?
  - Evidence of compliance (or non-compliance)?

**Confidence:** HIGH (major event) but compliance data needs verification

---

### 5. SIMULATION PARAMETERS (Most Critical for Implementation)

**Location:** research/ai_governance_international_coordination_2023_2025.md:339-407

**These are the key quantitative claims for simulation modeling:**

#### 5.1 Cooperation Propensity

**Claims:**
- High-capacity democracies (US, UK, EU): **0.75 (75% cooperation)**
- Tech-leading states (Japan, Singapore, South Korea): **0.70**
- Major emerging powers (India, Brazil): **0.55**
- Authoritarian states (China, Russia): **0.35**
- Low-capacity states: **0.20**

**Rationale provided:**
> "Bletchley had ~15% of world's countries (28/195), representing ~70% of global GDP and ~80% of AI capability. Cooperation correlates with state capacity and AI development level."

**Verification questions:**
1. Does 28/195 = 15% calculation check out?
2. Do Bletchley signatories represent ~70% of global GDP? (Source?)
3. Do they represent ~80% of AI capability? (How measured?)
4. Are the cooperation propensity values extrapolated from this data or from other research?

**CRITICAL:** These specific numbers (0.75, 0.70, 0.55, 0.35, 0.20) need either:
- Peer-reviewed research backing them, OR
- Clear methodology showing how they were derived from Bletchley participation data

**Current status:** DERIVED FROM REASONING, not cited from research papers

---

#### 5.2 Enforcement Strength

**Claims:**
- Pre-crisis (2023-2024): **0.15 (very weak, voluntary only)**
- Post-minor-incident: **0.40 (regulatory pressure)**
- Post-catastrophic-incident: **0.80 (binding treaties)**

**Rationale:**
> "Historical pattern of crisis-accelerated governance (Montreal Protocol, 9/11 aviation security)"

**Verification questions:**
1. What is the quantitative basis for 0.15 enforcement strength?
2. Montreal Protocol enforcement strength measured how?
3. Are the 0.40 and 0.80 values from historical crisis response research or extrapolation?

**CRITICAL:** These specific numbers need peer-reviewed backing or clear derivation methodology

**Current status:** ANALOGICAL REASONING from Montreal Protocol, not quantitatively validated

---

#### 5.3 Implementation Lag

**Claims:**
- Announcement to operational: **6 months** (AI Safety Institute example)
- Commitment to compliance: **12 months** (transparency reports)
- Treaty negotiation (if triggered): **18-24 months** (Montreal Protocol comparison)

**Verification questions:**
1. US AI Safety Institute: announced Nov 2023, operational when exactly? (mid-2024 claimed - verify)
2. Transparency reports: committed Nov 2023, when were they actually published? (throughout 2024 claimed)
3. Montreal Protocol timeline: ozone hole discovery 1985 → treaty 1987 (2 years) - verify

**Status:**
- 6 months: EMPIRICALLY GROUNDED (AISI timeline) - needs verification
- 12 months: EMPIRICALLY GROUNDED (transparency reports) - needs verification
- 18-24 months: HISTORICAL ANALOGY (Montreal Protocol) - needs verification

---

#### 5.4 Defection Risk

**Claims:**
- Voluntary regime: **0.35 (35% annual risk)**
- Binding regime: **0.10 (10% defection risk)**

**Rationale:**
> "Voluntary commitments fragile to competitive pressure, geopolitical tensions. Binding treaties more stable."

**Verification questions:**
1. What research supports 35% defection risk for voluntary AI safety commitments?
2. Is this extrapolated from other voluntary tech governance regimes?
3. What research supports 10% defection for binding treaties?

**CRITICAL:** These specific numbers need peer-reviewed research backing

**Current status:** REASONING-BASED, no cited research support

---

## Layer 2 Verification Requirements (Claim Accuracy)

For each citation above, verification must include:

1. **Quote extraction:** Find the specific passage in the source that supports the claim
2. **Context check:** Does the passage actually say what the research file claims?
3. **Scope validation:** Is the claim within the paper's scope or extrapolated beyond it?
4. **Value verification:** If specific numbers are cited, do they match the source exactly?

### Common Issues to Watch For:

- **Paper discusses topic but doesn't provide specific value:** e.g., "cooperation increases" vs "cooperation = 0.75"
- **Value extrapolated beyond scope:** e.g., Montreal Protocol 2-year timeline applied to AI governance without justification
- **Misinterpretation:** Paper's finding rephrased in a way that changes meaning
- **Cherry-picking:** Favorable finding highlighted without noting contradictory evidence

---

## Implementation Status

**CRITICAL: These parameters are NOT YET IMPLEMENTED in simulation code.**

The research file documents potential parameters for future implementation. Before implementation:

1. **Citations must be verified** (both existence and claim accuracy)
2. **Research-skeptic review required** (Quality Gate 1)
3. **Parameter derivation methodology must be explicit** (how were 0.75, 0.35, etc. calculated?)
4. **Integration with existing governance systems** (governanceQuality.ts, government cooperation mechanics)

**Current governance mechanics:** The simulation has `governanceQuality.ts` with decision quality, transparency, and institutional capacity metrics. International cooperation is not yet modeled as a separate system.

**Potential implementation locations:**
- New phase: `InternationalCooperationPhase.ts`
- Extension of `governanceQuality.ts`
- New state field: `state.internationalCooperation` (type definition needed)

---

## Recommended Verification Steps

### Phase 1: Citation Existence (WebSearch)

1. **Bletchley Declaration:**
   - Search: "UK AI Safety Summit Bletchley Declaration November 2023"
   - Verify: https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration
   - Extract: Full declaration text, signatory list

2. **Seoul Summit:**
   - Search: "Seoul AI Safety Summit May 2024 outcomes"
   - Verify: South Korean government announcement
   - Extract: Outcome documents, participant list

3. **US AI Safety Institute:**
   - Search: "US AI Safety Institute NIST establishment 2023"
   - Verify: NIST announcement, director appointment, budget
   - Extract: Official mandate, activities, international partnerships

4. **Voluntary commitments:**
   - Search: "AI companies voluntary safety commitments 2023"
   - Verify: Which companies signed, what commitments, compliance tracking
   - Extract: Commitment text, enforcement mechanisms (or lack thereof)

### Phase 2: Claim Verification (Deep Dive)

For each parameter claim (0.75 cooperation, 0.15 enforcement, 6-month lag, 0.35 defection):

1. **Search for research backing:** Academic papers on international AI governance, treaty compliance, technology governance
2. **Verify derivation:** If claim is derived (not directly cited), validate methodology
3. **Check historical analogies:** Montreal Protocol enforcement, climate governance, etc.
4. **Cross-check with contradictory evidence:** Research-skeptic review for alternative explanations

### Phase 3: Parameter Validation

1. **Expert review:** Are these parameters reasonable given domain knowledge?
2. **Sensitivity analysis:** How would simulation behave with different values?
3. **Comparison with existing governance mechanics:** Do these integrate coherently?

---

## Research Quality Assessment

**Current grade:** B (good foundation, needs verification)

**High confidence:**
- Bletchley Summit occurred (Nov 2023)
- Seoul Summit occurred (May 2024)
- US AI Safety Institute established (Nov 2023)
- Voluntary commitments made by major AI labs

**Medium confidence:**
- Specific commitment texts
- Compliance data
- Budget and staffing details
- Implementation timelines (6 months, 12 months)

**Low confidence (needs peer-reviewed backing):**
- Cooperation propensity values (0.75, 0.70, 0.55, 0.35, 0.20)
- Enforcement strength values (0.15, 0.40, 0.80)
- Defection risk values (0.35, 0.10)
- Parameter derivation methodology

**To reach Grade A:**
- All URLs verified
- All claims backed by quoted passages from sources
- Quantitative parameters either cited from research or derived with explicit methodology
- Alternative explanations addressed (research-skeptic review)

---

## Next Steps for Orchestrator

**When orchestrator picks this up:**

1. ✅ **Skip research phase** (research file already exists)
2. **Start at VALIDATION phase:**
   - WebSearch to verify citations (Phase 1 above)
   - Extract supporting passages from sources
   - Research-skeptic review for contradictory evidence
   - Parameter derivation validation
3. **Implementation phase** (if validation passes):
   - Design integration with existing governance mechanics
   - Add state fields for international cooperation
   - Create InternationalCooperationPhase or extend governanceQuality
   - Write tests
4. **Monte Carlo validation:**
   - Test parameter sensitivity
   - Verify cooperation/defection dynamics
   - Check interaction with existing systems

**Status:** Ready for orchestrator queue

---

**Created:** November 13, 2025
**Agent:** historian (wiki-documentation-updater)
**Purpose:** Research verification spec for orchestrator handoff

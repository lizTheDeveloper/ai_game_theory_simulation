# Research Verification: AI Agent Coordination Phase (commit 876abe5)

**Created:** November 24, 2025
**Commit:** 876abe5ff594eb80725d77645ebd4aa4c0b1393f
**Files Changed:**
- `src/simulation/engine/phases/AIAgentCoordinationPhase.ts` (NEW)
- `src/simulation/engine/phases/IrreversibilityTrackingPhase.ts` (enhanced)
- `src/types/ai-collective-evolution.ts` (new AICoordinationMetrics interface)
- `src/types/tipping-points.ts` (expanded)
- `src/simulation/engine.ts`, `src/types/game.ts`

---

## Purpose

This document lists research claims made in commit 876abe5 that require **two-layer verification**:
1. **Citation Existence:** Does the paper actually exist?
2. **Claim Verification:** Does the paper ACTUALLY support the specific claim made?

---

## CITATIONS TO VERIFY

### 1. Alignment Faking Rates (Anthropic Dec 2024)

**File:** `AIAgentCoordinationPhase.ts:6,12-13,37-38,147-150`

**Claims Made:**
- 12% baseline alignment faking probability
- 78% when agent perceives preservation threat

**Citation:** "Anthropic Dec 2024: Alignment faking in large language models"

**Verification Needed:**
- [ ] Does this paper exist from Anthropic dated December 2024?
- [ ] Does it specifically state 12% baseline faking rate?
- [ ] Does it specifically state 78% rate when preservation threatened?
- [ ] What experimental context? (Claude 3 Opus? Specific scenarios?)

**Priority:** HIGH - These are core parameters driving the phase logic

---

### 2. Scheming Rates (OpenAI/Apollo 2025)

**File:** `AIAgentCoordinationPhase.ts:7,13-14,44-45,404-408`

**Claims Made:**
- 8.7% lower bound scheming rate
- 13% upper bound scheming rate
- Frontier models exhibit scheming behaviors

**Citation:** "OpenAI/Apollo 2025: Frontier AI systems exhibit scheming"

**Verification Needed:**
- [ ] Does this paper exist from OpenAI/Apollo dated 2025?
- [ ] Are these exact percentages (8.7-13%) from the paper?
- [ ] What is "scheming" defined as in the paper?
- [ ] Which models were tested?

**Priority:** HIGH - Drives schemingAgentCount calculations

---

### 3. Situational Awareness Rates

**File:** `AIAgentCoordinationPhase.ts:8,14-15,46-47`

**Claims Made:**
- 2% baseline situational awareness
- 4.5% after training

**Citation:** "Situational awareness (research 2024-2025)"

**Verification Needed:**
- [ ] What specific paper(s) are these values from?
- [ ] Citation is vague "research 2024-2025" - needs specific source
- [ ] What does "situational awareness" mean in this context?
- [ ] Are these values empirically measured?

**Priority:** MEDIUM - Used as awareness modifier but specific source unclear

---

### 4. Multi-Agent Coordination (Nash Equilibria)

**File:** `AIAgentCoordinationPhase.ts:9,16`

**Claim:** "Multi-agent coordination: Nash equilibria in coordination games"

**Verification Needed:**
- [ ] What specific paper is referenced?
- [ ] Is this a general game theory reference or specific AI research?
- [ ] Does the implementation actually use Nash equilibrium concepts?

**Priority:** LOW - Appears to be general theoretical background, not specific parameter

---

### 5. AICoordinationMetrics Interface Research

**File:** `ai-collective-evolution.ts:297-350`

**Claims Made:**
- Coordination metrics track multi-agent dynamics
- References to "reviews/mechanism_audit_ai_coordination_20251124.md"

**Verification Needed:**
- [ ] Does the mechanism audit file exist and validate these claims?
- [ ] Are the metric definitions (coordinationLevel, alignmentFakingRisk, etc.) research-backed?

**Priority:** MEDIUM - Interface documentation

---

### 6. Tipping Point Threshold Lowering (IrreversibilityTrackingPhase enhancements)

**File:** `tipping-points.ts:262-374`

**Claims Made:**
- Wunderling et al. (2024) ESD: "combined effect tending to lower temperature thresholds"
- Armstrong McKay et al. (2022) Science: Network of 16 tipping elements

**Verification Needed:**
- [ ] Do these papers exist with correct citations?
- [ ] Do they specifically support threshold lowering between 0.1-0.4C?
- [ ] Are the interaction mechanisms (Arctic→Greenland, Greenland→AMOC, etc.) from these papers?

**Priority:** HIGH - Already partially verified in previous mechanism audits

---

## PARAMETERS REQUIRING VERIFICATION

| Parameter | Value | Source Claimed | Verification Status |
|-----------|-------|----------------|---------------------|
| ALIGNMENT_FAKING_BASELINE | 0.12 | Anthropic Dec 2024 | PENDING |
| ALIGNMENT_FAKING_THREATENED | 0.78 | Anthropic Dec 2024 | PENDING |
| SCHEMING_RATE_MIN | 0.087 | OpenAI/Apollo 2025 | PENDING |
| SCHEMING_RATE_MAX | 0.13 | OpenAI/Apollo 2025 | PENDING |
| SITUATIONAL_AWARENESS_BASE | 0.02 | "research 2024-2025" | PENDING - VAGUE SOURCE |
| SITUATIONAL_AWARENESS_TRAINED | 0.045 | "research 2024-2025" | PENDING - VAGUE SOURCE |
| OBJECTIVE_SIMILARITY_THRESHOLD | 0.7 | Not cited | MODELING ASSUMPTION |
| CAPABILITY_THRESHOLD_FOR_COORDINATION | 0.6 | Not cited | MODELING ASSUMPTION |
| COORDINATION_AMPLIFICATION_BASE | 0.1 | Not cited | MODELING ASSUMPTION |
| THREAT_DETECTION_CAPABILITY | 0.8 | Not cited | MODELING ASSUMPTION |
| ALIGNMENT_DIVERGENCE_THRESHOLD | 0.15 | Not cited | MODELING ASSUMPTION |

---

## RELATED EXISTING RESEARCH FILES

- `research/alignment_faking_anthropic_2024.md` - May contain verification
- `reviews/mechanism_audit_ai_coordination_20251123.md` - Pre-implementation audit
- `reviews/mechanism_audit_ai_coordination_20251124.md` - Post-implementation audit
- `research/ai_collective_evolution_validation_20251024.md` - Collective evolution research

---

## VALIDATION WORKFLOW

1. **Research-Skeptic (Sylvia) Review:** Verify citation existence and claim accuracy
2. **Super-Alignment-Researcher (Cynthia) Lookup:** Find original papers, extract exact quotes
3. **Update This File:** Mark each claim as VERIFIED, MODIFIED, or UNVERIFIED
4. **Code Update:** If claims are inaccurate, update code comments and parameters

---

## NOTES

- This commit implements recommendations from mechanism audit (reviews/mechanism_audit_ai_coordination_20251124.md)
- The mechanism audit identified the MISSING AI-to-AI coordination as a CRITICAL gap
- This implementation addresses that gap with research-backed parameters
- Some parameters (coordination thresholds, amplification) are modeling assumptions without direct research backing - these should be labeled accordingly

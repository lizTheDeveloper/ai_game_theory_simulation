# Proposed: TIER 2 System Elevation (Research Debate Recommendations)
**Date:** November 28, 2025
**Priority:** MEDIUM (research consensus, but multi-week effort)
**Assignee:** architect (roadmap updates) + cynthia/roy (research + implementation)
**Effort:** 24-34 days total (per existing TIER 3 estimates)

## Problem Statement

**Current State:**
- Research debate (Sylvia vs Cynthia) consensus: Slow-moving crises underweighted
- TIER 3 systems may have cumulative effects dominating long-term scenarios
- Selection bias: Modeling what's tractable, not what's important

**Debate Findings:**
- **Insect collapse (RD-4):** 76% pollinator decline, 75% food crops at risk
- **Soil degradation (RD-6):** 33% global soils degraded, 20M hectares/yr desertification
- **Ocean acidification (RD-2):** Already past safe boundary (pH 8.1 → 7.9)
- **Pattern:** Slow-moving crises are CERTAIN, acute crises are CONTINGENT

## Proposed Solution

**Elevate to TIER 2 (Next Month Priority):**

1. **RD-4: Insect Collapse Ecological Function Loss**
   - **Current:** TIER 3 (5-7 days effort)
   - **Justification:** 76% decline already observed (not hypothetical)
   - **Impact:** 75% of food crops depend on pollinators
   - **Cascades:** Food production → social instability → biodiversity decline
   - **Research:** Sánchez-Bayo & Wyckhuys 2019 + 2024 updates

2. **RD-6: Soil Degradation Food Production Decline**
   - **Current:** TIER 3 (4-6 days effort)
   - **Justification:** 33% of global soils already degraded
   - **Impact:** 5-15% food production decline over 50 years (cumulative with climate)
   - **Cascades:** Agricultural decline → food insecurity → migration → conflict
   - **Research:** FAO 2020 + Nkonya et al. 2016

3. **RD-2: Ocean Acidification Feedback Completion**
   - **Current:** TIER 2 (already elevated, 3-4 days effort)
   - **Justification:** Already past safe boundary (pH 8.1 → 7.9 observed)
   - **Impact:** Marine food chain collapse, coral extinction
   - **Status:** ALREADY TIER 2, just reaffirming priority

**Keep TIER 3 (Insufficient Quantitative Models):**
- **RD-5: AMR Pandemic Risk** - Low base rate, high uncertainty
- **RD-1: Permafrost Methane** - Timescales uncertain, magnitude debated
- **RD-3: Geopolitical Conflict** - Qualitative frameworks only

## Research Debate Rationale

**Sylvia's Critique:**
- "Slow-moving crises underweighted - cumulative effects could dominate"
- "We're modeling what's tractable, not what's important"
- "Insect collapse (76% decline), soil degradation (33% degraded) deserve elevation"

**Cynthia's Agreement:**
- "AGREE - Insect collapse, soil degradation deserve elevation"
- "Ocean acidification already past safe boundary"
- "Slow-moving crises are CERTAIN, acute crises are CONTINGENT"

**Synthesis Consensus:**
- ✅ Elevate RD-4 (insect) and RD-6 (soil) to TIER 2
- ✅ Reaffirm RD-2 (ocean) as TIER 2
- ⏸️ Keep RD-1/3/5 as TIER 3 (await quantitative models)

## Implementation Approach

**Phase-by-Phase (Serial, Not Parallel):**

1. **Month 1: RD-2 Ocean Acidification Completion (3-4 days)**
   - Research: pH decline rates, coral mortality thresholds, marine food chain impacts
   - Implementation: Extend existing ocean system with acidification feedbacks
   - Validation: Monte Carlo N=10, compare to observed pH decline

2. **Month 2: RD-4 Insect Collapse (5-7 days)**
   - Research: Pollinator decline rates, crop dependency, ecosystem services valuation
   - Implementation: Extend BiodiversityPhase with functional ecology tracking
   - State fields: pollinatorAbundance, ecosystemServices.pollination
   - Cascades: Agricultural yields → food security → social stability
   - Validation: Monte Carlo N=10, check for food production impact

3. **Month 3: RD-6 Soil Degradation (4-6 days)**
   - Research: Soil health decline by region, yield impact curves, restoration timescales
   - Implementation: Extend AgriculturePhase with soil health tracking
   - State fields: soilHealthByRegion, landDegradationRate, restorationInvestment
   - Cascades: Agricultural decline → food insecurity → migration
   - Validation: Monte Carlo N=10, check for long-term food trends

**Total Effort:** 12-17 days implementation + 12-17 days validation overhead = 24-34 days

## Expected Impact

**Immediate:**
- More realistic long-term scenarios (50+ year projections)
- Cumulative crisis effects properly modeled
- Slow-moving crises visible (not just acute crises)

**Long-term:**
- Policy stress-testing includes environmental degradation
- Intervention design addresses root causes (not just symptoms)
- Scenario outcomes reflect ecological reality

## Timeline

**Q1 2026 (Jan-Mar):**
- Month 1: RD-2 ocean acidification
- Month 2: RD-4 insect collapse
- Month 3: RD-6 soil degradation

**Dependencies:**
- Current validation sprint complete ✅
- Research debate consensus documented ✅
- Architect updates roadmap priorities ✅
- Cynthia + Roy available for research + implementation

## Complexity

**Level:** HIGH (8/10) - Multi-month, multi-system integration

**Challenges:**
- Cumulative effects modeling (not just acute crises)
- Regional variation (soil/insect differ by geography)
- Research gaps (some parameters from qualitative sources)
- Validation difficulty (no baseline for comparison)

**Risks:**
- Scope creep (each system could expand)
- Parameter fabrication temptation (resist with "unknown" placeholders)
- Validation without ground truth (use mechanism validation, not outcome validation)

## Success Criteria

1. ✅ RD-2 ocean acidification integrated (pH decline, coral mortality, marine food chain)
2. ✅ RD-4 insect collapse integrated (pollinator abundance, crop dependency, ecosystem services)
3. ✅ RD-6 soil degradation integrated (soil health by region, yield impacts, restoration)
4. ✅ All systems validated with N=10 Monte Carlo
5. ✅ Long-term scenarios (50+ years) show cumulative effects
6. ✅ No fabricated parameters (unknown = unknown, not guessed)

## Priority Justification

**Why MEDIUM (not HIGH):**
- All CRITICAL/HIGH items already resolved
- Validation sprint complete (system stable)
- Multi-week effort requires planning and sequencing
- Does not block other work

**Why NOT LOW:**
- Research debate consensus (both Sylvia and Cynthia agree)
- Observed data shows crises already in progress (not hypothetical)
- Epistemic integrity requires modeling what's CERTAIN, not just what's TRACTABLE

## Alternatives Considered

**Option A: Defer to Q2 2026** (REJECTED)
- Rationale: Focus on HIGH-3 VM infrastructure first
- Problem: Delays addressing research consensus findings
- Decision: Can run in parallel with infrastructure work

**Option B: Implement all 6 TIER 3 systems** (REJECTED)
- Rationale: Comprehensive coverage
- Problem: RD-1/3/5 lack quantitative models (would require fabrication)
- Decision: Only elevate systems with sufficient research backing

**Option C: Implement in parallel** (REJECTED)
- Rationale: Faster completion
- Problem: Integration complexity, validation overhead
- Decision: Serial implementation with proper validation gates

## References

- Research debate synthesis: `reviews/research_debate_synthesis_20251128.md`
- Sylvia's critique: `reviews/SYLVIA_DEBATE_POSITION_20251128.md` (TIER priority selection bias)
- Cynthia's response: `reviews/CYNTHIA_DEBATE_RESPONSE_20251128.md` (elevation agreement)
- Original research roadmap: `plans/MASTER_IMPLEMENTATION_ROADMAP.md` (lines 987-1052, RD-1 through RD-6)

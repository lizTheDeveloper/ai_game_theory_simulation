# Configuration Parameter Research

**Created:** December 9, 2025
**Author:** autonomous-worker (from research audit)
**Priority:** HIGH
**Effort:** 1-2 days

---

## Rationale

Research source validation identified 19 `[RESEARCH NEEDED]` tags in `src/simulation/config/centralConfig.ts`. These are placeholder parameters without peer-reviewed justification, lowering research quality from Grade C (53.4% from 2024-2025) to potential Grade D if not addressed.

**Impact:** Parameter credibility, research validation scores, simulation trustworthiness

---

## Scope

Extract peer-reviewed justifications for high-priority configuration parameters currently marked `[RESEARCH NEEDED]`.

**Priority tiers:**
1. **HIGH (Phase 1):** Social cohesion, evacuation fractions, economic collapse definitions, major economy thresholds
2. **MEDIUM (Phase 2):** Tech risk accumulation/decay, post-crisis meaning-making, humanitarian logistics
3. **LOW (Phase 3):** Conflict resolution, functional system thresholds

---

## Phase 1: HIGH Priority Parameters

### Social Cohesion Dynamics
**Line 292:** `SOCIAL_COHESION_DECAY_RATE: 0.01` (1% per month)
**Line 465:** `SOCIAL_COHESION_RECOVERY_RATE: 0.01` (1% per month with investment)

**Research needed:**
- Post-conflict reconciliation timelines (Rwanda, Bosnia, Northern Ireland)
- Social fragmentation rates (trust decay, polarization research 2024-2025)
- Institutional trust recovery after crises

**Target sources:** Political Science Quarterly, Journal of Peace Research, USIP reports

### Evacuation and Migration
**Line 607:** `MIGRATION_EVACUATION_FRACTION: 0.3` (30% can evacuate)

**Research needed:**
- Evacuation capacity in major disasters (Hurricane Katrina, Syrian refugee crisis)
- Logistical constraints (transportation, borders, resources)
- Differential mobility by income/region

**Target sources:** IOM reports (2024-2025), Lancet migration studies, UNHCR data

### Economic Collapse Definitions
**Line 693:** `MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD: 2.0` (economic stage < 2.0)
**Line 700:** `MAJOR_ECONOMY_POPULATION_THRESHOLD: 300` (300M+ = major economy)
**Line 714:** `MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD: 0.5` (>50% collapsed = global crisis)

**Research needed:**
- Economic collapse definitions (IMF, World Bank criteria)
- Major economy thresholds (G20 criteria, systemic importance metrics)
- Global systemic risk triggers (BIS, Financial Stability Board)

**Target sources:** IMF WEO 2024-2025, BIS Annual Reports, World Bank Development Indicators

---

## Phase 2: MEDIUM Priority Parameters

### Technological Risk
**Line 443:** `TECH_RISK_ACCUMULATION_RATE: 0.001`
**Line 450:** `TECH_RISK_DECAY_RATE: 0.005`
**Line 263:** `TECH_RISK_CRISIS_THRESHOLD: 0.7`
**Line 270:** `TECH_RISK_EXISTENTIAL_THRESHOLD: 0.9`

**Research needed:**
- Technology safety investment ROI (cybersecurity, AI safety budgets)
- Historical tech risk accumulation (nuclear, biotech, AI)
- Safety research effectiveness (NTI, CNAS reports)

**Target sources:** AI safety research (Anthropic, OpenAI safety reports), CSET policy briefs, IEEE tech ethics

---

## Success Criteria

1. **Research Quality:**
   - 2+ peer-reviewed sources per parameter
   - 2024-2025 sources preferred (2023 acceptable if critical)
   - Parameters updated with citations

2. **Functional:**
   - All `[RESEARCH NEEDED]` tags replaced with proper `@research` citations
   - Values either validated or updated based on research
   - Uncertainty ranges documented where applicable

3. **Impact:**
   - Research quality grade: C → B+ (target >70% from 2024-2025)
   - Simulation credibility improved
   - Parameters defensible in peer review

---

## Deliverable

**File:** `research/config_parameters_justification_20251209.md`

**Structure:**
1. Executive Summary
2. Social Cohesion Parameters (Section 1)
3. Migration/Evacuation Parameters (Section 2)
4. Economic Collapse Parameters (Section 3)
5. Tech Risk Parameters (Section 4, Phase 2)
6. Parameter Update Recommendations
7. Full Citation List

**Code changes:** Update `src/simulation/config/centralConfig.ts` with research citations

---

## Timeline

- **Phase 1 (HIGH):** 4-6 hours research + 2 hours implementation
- **Phase 2 (MEDIUM):** 3-4 hours research + 1 hour implementation
- **Phase 3 (LOW):** Backlog (defer to future sessions)

---

## Next Steps

1. Launch orchestrator to coordinate research (super-alignment-researcher)
2. Quality Gate 1: Research validation (research-skeptic review)
3. Update centralConfig.ts with citations
4. Quality Gate 2: Architecture review (verify no regressions)
5. Update research quality metrics in OpenSpec

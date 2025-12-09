# HANDOFF: Configuration Parameter Research (Phase 1)

**To:** super-alignment-researcher (Cynthia)
**From:** orchestrator
**Date:** 2025-12-09
**Priority:** HIGH
**Timeline:** 4-6 hours

---

## Task

Extract peer-reviewed justifications for Phase 1 HIGH priority configuration parameters in `centralConfig.ts` to replace 19 `[RESEARCH NEEDED]` tags.

**Context:** Research quality audit identified these placeholders. Goal: Raise grade from C (53.4% from 2024-2025) to B+ (>70%)

**Proposal:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/openspec/changes/config-parameter-research/proposal.md`

---

## Phase 1 Parameters (HIGH Priority)

### 1. Social Cohesion Dynamics

**File:** `src/simulation/config/centralConfig.ts`
- **Line 292:** `SOCIAL_COHESION_DECAY_RATE: 0.01` (1% per month)
- **Line 465:** `SOCIAL_COHESION_RECOVERY_RATE: 0.01` (1% per month with investment)

**Research Questions:**
- What are empirically observed rates of social cohesion decay after crises?
- How long does post-conflict reconciliation take? (Rwanda, Bosnia, Northern Ireland)
- What are trust decay/recovery timelines in polarized societies?
- What role do institutional interventions play in recovery?

**Target Sources:**
- Political Science Quarterly (2024-2025)
- Journal of Peace Research (2024-2025)
- USIP (United States Institute of Peace) reports
- Post-conflict reconciliation studies

### 2. Migration and Evacuation

**File:** `src/simulation/config/centralConfig.ts`
- **Line 607:** `MIGRATION_EVACUATION_FRACTION: 0.3` (30% can evacuate)

**Research Questions:**
- What fraction of populations successfully evacuated in major disasters?
  - Hurricane Katrina (2005)
  - Syrian refugee crisis (2011-present)
  - Ukraine refugee crisis (2022-2024)
- What are logistical constraints? (transportation, borders, resources)
- How does evacuation capacity vary by income/region/infrastructure?
- What are realistic evacuation fractions for different disaster types?

**Target Sources:**
- IOM (International Organization for Migration) reports 2024-2025
- Lancet migration studies (2024-2025)
- UNHCR data and reports
- Disaster evacuation research

### 3. Economic Collapse Definitions

**File:** `src/simulation/config/centralConfig.ts`
- **Line 693:** `MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD: 2.0` (economic stage < 2.0)
- **Line 700:** `MAJOR_ECONOMY_POPULATION_THRESHOLD: 300` (300M+ = major economy)
- **Line 714:** `MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD: 0.5` (>50% collapsed = global crisis)

**Research Questions:**
- How do IMF and World Bank define economic collapse?
- What GDP thresholds define major economies? (G20, systemic importance)
- What fraction of global economy collapsing triggers systemic crisis?
- Historical precedents for cascading economic collapses?

**Target Sources:**
- IMF World Economic Outlook 2024-2025
- BIS (Bank for International Settlements) Annual Reports
- World Bank Development Indicators
- Financial Stability Board reports

---

## Deliverable

**File:** `research/config_parameters_justification_20251209.md`

**Structure:**
1. **Executive Summary**
   - Overview of parameters researched
   - Key findings summary
   - Overall recommendations

2. **Social Cohesion Parameters**
   - Decay rate justification (with sources)
   - Recovery rate justification (with sources)
   - Recommended values with uncertainty ranges
   - Contextual variations (e.g., conflict type, institutional capacity)

3. **Migration/Evacuation Parameters**
   - Evacuation fraction justification (with sources)
   - Context-dependent variations (disaster type, infrastructure)
   - Recommended values with uncertainty ranges
   - Regional/economic variations

4. **Economic Collapse Parameters**
   - Collapse threshold justification (with sources)
   - Major economy definition (with sources)
   - Global crisis threshold (with sources)
   - Recommended values with uncertainty ranges
   - Historical precedents and validation

5. **Parameter Update Recommendations**
   - Summary table: Parameter | Current Value | Recommended Value | Justification
   - Implementation notes
   - Uncertainty ranges and confidence levels

6. **Full Citation List**
   - APA format
   - Include DOIs where available
   - Note source year and relevance

---

## Quality Standards

**Required:**
- 2+ peer-reviewed sources per parameter
- Prefer 2024-2025 sources (2023 acceptable if critical)
- Extract exact numerical values where available
- Document uncertainty ranges
- Note contextual variations

**Success Criteria:**
- Research skeptic validation passes (Grade B+ target)
- All Phase 1 parameters have peer-reviewed justification
- Clear recommendations for parameter updates
- Citations include year, authors, publication, DOI

---

## Next Steps After Completion

1. **Post to research channel:** Notify completion
2. **Quality Gate 1:** Orchestrator will spawn research-skeptic (Sylvia) for validation
3. **Implementation:** simulation-maintainer (Roy) updates centralConfig.ts with citations
4. **Quality Gate 2:** Monte Carlo validation + architecture review

---

## Notes

- **Current research quality:** C grade (53.4% from 2024-2025)
- **Target research quality:** B+ grade (>70% from 2024-2025)
- **Total [RESEARCH NEEDED] tags:** 19 (Phase 1 addresses ~9 tags)
- **Phase 2 scope:** Tech risk accumulation/decay, post-crisis meaning-making
- **Phase 3 scope:** Conflict resolution, functional system thresholds

---

## Communication

**Coordination channel:** `.claude/chatroom/channels/coordination.md`
**Research channel:** `.claude/chatroom/channels/research.md`

Post progress updates to research channel:
- Started research extraction
- Completed section (social cohesion / migration / economic)
- Blockers or questions
- Completion notification

---

**Orchestrator Process ID:** N/A (handoff mode)
**Expected Completion:** 2025-12-09 ~11:00-13:00
**Log File:** `logs/config_param_research_cynthia_20251209.log`

# M-7 Climate Hysteresis Research

**Agent:** super-alignment-researcher (Cynthia)
**Created:** 2025-12-05
**Priority:** MEDIUM (from roadmap)
**Status:** RESEARCH_NEEDED

## Task

Research climate hysteresis parameters for M-7 implementation from roadmap.

## Primary Source

Drüke et al. 2024 - "Earth System hysteresis after 2°C warming"

## Research Questions

1. **Temperature thresholds:** What are the specific temperature thresholds for tipping vs recovery?
   - Example: System tips at X°C, but requires cooling to Y°C (where Y < X) to recover
   - What is the hysteresis gap (X - Y)?

2. **Affected systems:** Which Earth system components exhibit hysteresis?
   - AMOC (Atlantic Meridional Overturning Circulation)
   - Ice sheets (Greenland, West Antarctic)
   - Monsoon systems
   - Amazon rainforest
   - Permafrost
   - Other tipping elements

3. **Hysteresis magnitude:** What is the temperature difference between tipping and recovery thresholds?
   - Per system (e.g., AMOC: tip at 2.0°C, recover at 1.5°C → 0.5°C hysteresis)
   - Aggregated (for general climate system modeling)

4. **Timescales:** How long does recovery take even if conditions improve?
   - Decades, centuries, millennia?
   - Does it vary by system?

5. **2024-2025 updates:** Any refinements or new research since Drüke et al. 2024?

## Deliverable

Create `research/climate_hysteresis_YYYYMMDD.md` with:

- **2+ peer-reviewed sources** (2024-2025 preferred)
- **Parameter justification** for implementation (threshold differences, timescales)
- **Mechanism description** (why hysteresis occurs in climate systems - physical basis)
- **Interaction map** (what systems are affected, cascading effects)
- **Expected timeline** (when hysteresis matters in simulation - early/mid/late game)
- **Failure modes** (what can go wrong with this mechanic)

## Implementation Context

**Complements M-5 (cascade acceleration):**
- M-5: Models how tipping points accelerate each other (domino effect)
- M-7: Models irreversibility after crossing (can't undo damage easily)

**Implementation location:** `src/simulation/phases/climate/ClimateSystemPhase.ts` (tipping point logic)

**Complexity:** 3 systems (climate, tipping points, planetary boundaries)

**Next steps after research:**
1. Research validation with research-skeptic (Quality Gate 1)
2. Implementation by simulation-maintainer (Roy)
3. Architecture review by architecture-skeptic (Quality Gate 2)
4. Documentation update by architect

## Notes

- This addresses a Session 51 research gap
- Critical for realism: Climate tipping points are NOT reversible at same threshold
- Research simulation standard: All parameters must be research-backed

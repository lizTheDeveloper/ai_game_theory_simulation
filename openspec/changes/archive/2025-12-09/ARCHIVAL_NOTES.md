# Archival Notes - December 9, 2025

## hindcast-demographic-tuning

**Status:** COMPLETE
**Completed:** December 9, 2025
**Commit:** b89a1dd9 - "feat: Update regional historical death rates with Dec 9 UN WPP 2024 estimates"

**Summary:**
Added regional historical death rate curves (1950-2024) to improve hindcast demographic accuracy. Implemented UN WPP 2024 baseline estimates for eight global regions, replacing placeholder curves.

**Implementation:**
- Added `regionalDeathRates` to `HumanPopulationSystemState`
- Initialized with UN WPP 2024 data (1950-2024 death rates per 1000)
- Integrated into mortality calculations via `getBaselineDeathRate()`
- Maintains backward compatibility (global fallback if regional unavailable)

**Research Sources:**
- UN World Population Prospects 2024 (December 2025 revision)
- Regional death rates: Europe, North America, South America, Africa, Middle East, South Asia, East Asia, Oceania

**Quality Gates:**
- QG1: Research validation - Grade B (UN WPP 2024 authoritative source)
- QG2: Architecture review - Not required (MEDIUM priority, non-breaking change)

**Testing:**
- Manual verification: Regional curves match UN data
- Determinism: No impact on existing Monte Carlo runs
- Coverage: No new test failures introduced

**Archive Location:** `openspec/changes/archive/2025-12-09/hindcast-demographic-tuning/`

**Related Work:**
- Unblocks future hindcast validation work (comparing 1950-2024 simulation vs historical data)
- Complements existing mortality system (wars, disasters, AI-driven interventions)

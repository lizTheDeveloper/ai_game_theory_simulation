# SPAWN: simulation-maintainer

**Spawned by:** orchestrator-1
**Date:** 2025-11-15
**Feature:** Climate Phased Deployment Model (TIER 1 CRITICAL)

---

## Your Mission

Implement phased deployment timescales (2-50 years), energy budget constraints, and temperature degradation feedbacks for climate technologies. This addresses the 5.5% climate tech effectiveness gap identified in god mode testing.

---

## Implementation Plan

**Location:** /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/climate_phased_deployment_model_20251113.md

**Research Foundation:**
- Research: research/climate_tech_deployment_timescales_20251112.md (15+ peer-reviewed sources)
- Critique: reviews/climate_deployment_timescales_critique_20251113.md (CONDITIONAL PASS - addressed)
- Quality Gate 1: ✅ PASSED

---

## Implementation Phases

**Phase 1: State Extensions (1h)**
- Add deployment phase tracking to BreakthroughTechnology interface
- Add energy partitioning fields to EnergySystem interface
- Add sink effectiveness tracking to ClimateBoundary interface
- Location: src/types/game.ts

**Phase 2: Deployment Phase Logic (2h)**
- Create src/simulation/phases/technologyDeploymentPhase.ts
- Implement phase transitions (planning → construction → scaleUp → maturity)
- Implement effectiveness scaling (0% → 30% → 80% → 100%)
- Apply temperature degradation (ocean: 4.4%/°C, land: 19.8%/°C)
- Apply energy constraints (linear scaling)

**Phase 3: Energy Budget System (2h)**
- Create src/simulation/phases/energyPartitioningPhase.ts
- Calculate renewable surplus (generation - baseline demand)
- Partition by priority: adaptation > industry > mitigation > synthetic fuels
- Allocate mitigation energy to technologies (proportional or priority-based)

**Phase 4: Temperature Feedback Loops (1h)**
- Create src/simulation/phases/climateFeedbackPhase.ts
- Update carbon sink effectiveness (separate ocean/land coefficients)
- Update adaptation demand (+10%/°C - mark as MODEL ASSUMPTION)
- Log significant degradation events

**Phase 5: New Technologies (1h)**
- Add 9 new breakthrough technologies to src/data/breakthroughTechnologies.ts
- TIER 0: Institutional automation
- TIER 1: Modular DAC, automated construction, perovskite solar, biochar
- TIER 2: Fusion pilots, blue carbon, carbon-negative materials
- TIER 3: Ocean iron fertilization (conditional)

**Phase 6: Integration (1h)**
- Update src/simulation/engine/PhaseOrchestrator.ts (add 7 new phases)
- Update src/simulation/utils/initialization.ts (initialize new state fields)
- Ensure proper phase execution order

**Phase 7: Testing (2-3h)**
- Create unit tests (phase transitions, energy constraints, temperature degradation)
- Create integration tests (30-50% typical, 80%+ god mode effectiveness)
- Run Monte Carlo N≥10 for validation (determinism, CV <5%)

---

## Critical Requirements

**Defensive Coding:**
- Use assertion utilities (assertFinite, assertStateProperty) - NO silent fallbacks
- All calculations must validate inputs (no NaN propagation)
- Energy constraints: validate non-negative partitioning
- Temperature degradation: validate coefficients match research (4.4% ocean, 19.8% land)
- RNG must be REQUIRED parameter (no Math.random fallback)

**Research Fidelity:**
- Ocean sink degradation: 4.4%/°C (Nature Climate Change 2025)
- Land sink degradation: 19.8%/°C (Nature Climate Change 2025)
- Adaptation energy +10%/°C: MARK AS "MODEL ASSUMPTION" in comments
- Automated construction speedup: MARK AS "SPECULATIVE" in comments
- All coefficients must have citation comments

**Emoji Conventions:**
- 🏗️ Construction phase started
- 📈 Scale-up phase started
- ✅ Maturity phase started
- 🌊⚠️ Ocean sinks degraded
- 🌳⚠️ Land sinks degraded
- 🌡️❌ Technology degraded by warming
- ⚡⚠️ Adaptation energy demand increased

**Phase Integration:**
- Add phases to PhaseOrchestrator in correct order
- Ensure dependencies are met (energy calculated before partitioning)
- Avoid circular dependencies (read → transform → write, never read → write back)

---

## Expected Outcomes

**State Changes:**
- BreakthroughTechnology interface: +8 new fields
- EnergySystem interface: +7 new fields
- ClimateBoundary interface: +3 new fields
- New phases: 4 new phase files
- New technologies: 9 additions to breakthroughTechnologies.ts

**Effectiveness Targets:**
- Typical scenarios: 30-50% climate tech effectiveness (vs. 5.5% baseline)
- God mode scenarios: 80%+ effectiveness (unlimited energy, all techs)
- Monte Carlo validation: CV <5% (determinism within tolerance)

---

## Handoff to Architecture Review

When implementation complete:
1. Update coordination log (.claude/coordination_climate_deployment.md)
2. Post completion status with file manifest
3. Orchestrator will spawn architecture-skeptic for Quality Gate 2

---

## Notes

- Total estimated effort: 9-11 hours
- Complex multi-system integration (energy, climate, technology)
- High research fidelity required (15+ citations)
- Failure modes: NaN propagation, circular dependencies, non-determinism
- Success criteria: Tests pass, Monte Carlo validates, architecture review passes

---

**BEGIN IMPLEMENTATION**

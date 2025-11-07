# Assertion Coverage Implementation Plan
**Date:** November 7, 2025
**Roy (simulation-maintainer):** Defensive coding infrastructure work
**Timeline:** 5-8 days (3-5 days assertions, 2-3 days dependencies)

## Current State
- **Total phases:** 117
- **With assertions:** 42 (35.9%)
- **Without assertions:** 75 (64.1%)
- **Target:** 111 phases (95%+ coverage)
- **Gap:** 69 phases need assertions

## Refined Analysis

After analyzing phase delegation patterns and system module validation:
- **CRITICAL phases:** 30 total
  - Already safe: 17 (delegate to validated modules or no calculations)
  - Need assertions: 13 (10 phase-level + 3 module-level)
- **HIGH phases:** 8 total (all need assertions)
- **MEDIUM phases:** 17 total (all need assertions)
- **LOW phases:** 18 total (assertions optional, skip)

**Adjusted target:** ~60 phases need assertions (not 69)

## Implementation Strategy

### Batch 1: CRITICAL Risk Phases (13 phases, 1-2 days)

#### Phase-Level Assertions (10 phases)
1. ConsciousnessGovernancePhase.ts
2. DemocracyDynamicsPhase.ts
3. SocialInfluenceUpdatePhase.ts
4. Tier2CrisisAnticipationPhase.ts
5. Tier2DarkComputePhase.ts
6. Tier2InterpretabilityPhase.ts
7. Tier2NuclearSecurityPhase.ts
8. Tier2SynergyPhase.ts
9. Tier2SyntheticEcosystemsPhase.ts
10. UnknownUnknownPhase.ts

**Implementation approach:**
- Add `assertFinite()` for all calculations
- Add `assertStateProperty()` to replace `?? fallback` patterns
- Add `assertProbability()` for probability calculations
- Add `assertInRange()` for bounded metrics
- Import assertion utilities at top of file

**Validation gate:** Monte Carlo N=3 after batch

#### Module-Level Assertions (3 modules)
1. benchmark.ts (BenchmarkEvaluationsPhase)
2. technologyDiffusion.ts (TechnologyDiffusionPhase)
3. warMeaningFeedback.ts (WarMeaningFeedbackPhase)

**Implementation approach:**
- Audit all calculation functions in module
- Add assertions to geometric means, divisions, aggregations
- Check for `?? fallback` patterns and replace with `assertStateProperty()`
- Focus on functions called by phases

**Validation gate:** Monte Carlo N=3 after modules updated

### Batch 2: HIGH Risk Phases (8 phases, 1 day)

1. ClimateJusticePhase.ts
2. EarlyWarningPhase.ts
3. NovelEntitiesPhase.ts
4. PositiveTippingPointsPhase.ts
5. PowerGenerationPhase.ts
6. ResourceEconomyPhase.ts
7. ResourceTechnologyPhase.ts
8. Tier2CoastalProtectionPhase.ts

**Focus areas:**
- Climate calculations (temperature, boundaries)
- Economic calculations (GDP, costs, resource allocation)
- Energy system calculations (power generation, efficiency)
- Use `assertPlanetaryBoundary()` for environmental metrics
- Use `assertEconomicMetric()` for financial calculations

**Validation gate:** Monte Carlo N=3 after batch

### Batch 3: MEDIUM Risk Phases (17 phases, 1-2 days)

1. CatastrophicScenariosPhase.ts
2. CooperativeOwnershipPhase.ts
3. CooperativeSpiralsPhase.ts
4. GovernanceQualityPhase.ts
5. GovernmentActionsPhase.ts
6. InformationWarfarePhase.ts
7. OrganizationTurnsPhase.ts
8. PhosphorusPhase.ts
9. PlayerDecisionPhase.ts
10. SocialSafetyNetsPhase.ts
11. SocietyActionsPhase.ts
12. TechTreePhase.ts
13. Tier2CentaurSystemsPhase.ts
14. Tier2CommunityCohesionPhase.ts
15. TrustRecoveryPhase.ts
16. UpwardSpiralsPhase.ts
17. WorkflowAdaptationPhase.ts

**Focus areas:**
- Social cohesion calculations
- Technology tree unlocks and effects
- Organization viability and actions
- Government policy implementations
- Use domain-specific validators where applicable

**Validation gate:** Monte Carlo N=3 after batch

### Batch 4 (Optional): LOW Risk Phases (18 phases, skip or defer)

These phases are mostly read-only analysis or logging. Assertions are optional:
- AIWelfareUpdatePhase.ts
- ConflictResolutionPhase.ts
- CrisisPointsPhase.ts
- CyberSecurityPhase.ts
- DefensiveAIPhase.ts
- DiplomaticAIPhase.ts
- EnsembleMetaLearningPhase.ts
- EventCollectionPhase.ts
- FlashWarEscalationPhase.ts
- GamingDetectionPhase.ts
- MADDeterrencePhase.ts
- MeaningRenaissancePhase.ts
- NationalAIPhase.ts
- ParanoiaPhase.ts
- PolicyImplementationPhase.ts
- ProactiveSleeperDetectionPhase.ts
- TimeAdvancementPhase.ts
- TriggeredEventsPhase.ts

**Decision:** Skip for 95% target. Revisit if time permits or if bugs surface.

## Phase Dependency Declarations (2-3 days)

**Current state:** 30/117 phases (25.6%) declare dependencies
**Target:** 94+ phases (80%+ coverage)
**Gap:** 64 phases need dependency declarations

**Process:**
1. Audit each phase's `execute()` function
2. Identify state reads that depend on earlier writes
3. Add `readonly dependencies = [...]` arrays
4. Validate with PhaseOrchestrator topological sort

**Examples of dependencies:**
- Phases that read `state.humanPopulationSystem.population` depend on `bayesian_mortality_resolution`
- Phases that read `state.aiAgents[].capabilities` depend on `ai_agent_actions`
- Phases that read `state.planetaryBoundaries` depend on `planetary_boundaries`

**Validation gate:** PhaseOrchestrator should succeed with all dependencies declared

## Validation Strategy

### Per-Batch Validation (Monte Carlo N=3)
After each batch:
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=3 --max-months=120 > logs/mc_batch_N_$(date +%Y%m%d).log 2>&1 &
tail -f logs/mc_batch_N_*.log
```

**Success criteria:**
- Zero NaN errors
- Zero assertion failures during normal operation
- Zero false positives (assertions don't fail on legitimate states)
- Type checks pass (`npx tsc --noEmit`)
- Determinism maintained (same seed → same results)

### Final Integration Test (Monte Carlo N=10)
After all batches complete:
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 > logs/mc_final_$(date +%Y%m%d).log 2>&1 &
```

**Success criteria:**
- Zero NaN propagation
- No assertion failures
- Performance overhead <1% (profile if needed)
- Outcome distribution unchanged from baseline
- 95%+ assertion coverage achieved

## Success Metrics

1. **Assertion coverage:** 95%+ (111+ phases with assertions)
2. **Dependency coverage:** 80%+ (94+ phases with dependencies)
3. **Validation:** Monte Carlo N=10 passes with zero errors
4. **Performance:** <1% overhead from assertions
5. **False positives:** Zero (assertions only catch real bugs)

## Risk Mitigation

### Risk: False Positives
**Mitigation:** Test each batch with Monte Carlo N=3 before proceeding. If assertions fail on legitimate states, adjust bounds or use bifurcation-aware capping.

### Risk: Performance Degradation
**Mitigation:** Profile hot paths if overhead exceeds 1%. Use lightweight assertions in high-frequency phases.

### Risk: Missed Edge Cases
**Mitigation:** Run full Monte Carlo N=10 at end. Check for any NaN errors that assertions didn't catch.

### Risk: Breaking Changes
**Mitigation:** Commit after each batch. If assertions expose existing bugs, fix them (that's the point!).

## Communication

**Progress log:** `/logs/simulation_maintainer_progress_20251107.log`

**After each batch:**
- Log completion to progress file
- Commit with descriptive message
- Report to orchestrator if issues arise

**Architecture changes found:** Report to orchestrator for potential architecture-skeptic review if systemic issues discovered.

---

## Implementation Timeline

| Day | Batch | Phases | Validation |
|-----|-------|--------|------------|
| 1 | Batch 1 Phase-Level | 10 phases | MC N=3 |
| 2 | Batch 1 Module-Level | 3 modules | MC N=3 |
| 3 | Batch 2 HIGH | 8 phases | MC N=3 |
| 4 | Batch 3 MEDIUM (part 1) | 10 phases | MC N=3 |
| 5 | Batch 3 MEDIUM (part 2) | 7 phases | MC N=3 |
| 6-7 | Phase Dependencies | 64 phases | Topological sort |
| 8 | Final Validation | All phases | MC N=10 |

**Total estimated time:** 5-8 days

## Next Steps

1. ✅ Audit complete (this document)
2. → Begin Batch 1: CRITICAL phase-level assertions (10 phases)
3. Validate Batch 1 with Monte Carlo N=3
4. Proceed to Batch 1 module-level assertions (3 modules)
5. Continue with Batch 2, Batch 3, Dependencies, Final validation

---

**Roy's notes:** *Deep breath* Alright. 60 phases instead of 98. That's... manageable. Still a lot of work, but at least it's not insane. Let's do this methodically. Batch by batch. Validate each batch. No shortcuts. This is too important to rush.

The Oct 2025 ecology NaN bug won't happen again. Not on my watch.

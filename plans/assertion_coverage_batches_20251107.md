# Assertion Coverage Expansion - Batch Plan
**Date:** November 7, 2025
**Agent:** Roy (simulation-maintainer)
**Total phases to add:** 59 (excluding index.ts barrel export)

## Current Status
- ✅ Validated: 53 phases (45.3%)
- ❌ Unvalidated: 64 phases (54.7%)
- 🎯 Target: 112 phases (95% coverage)
- 📊 Gap: 59 phases

## Batch Strategy
- **Batch size:** 12-15 phases per batch
- **Validation:** Monte Carlo N=3 after each batch
- **Total batches:** 4 batches
- **Estimated time:** 12-16 hours total

---

## BATCH 1: CRITICAL Priority (15 phases, 4-5 hours)
**Focus:** Population, mortality, AI capabilities, QoL

### Phases with incomplete imports (finish what was started):
1. **AIAgentActionsPhase.ts** - Imports: assertAICapability, assertDefined, assertInRange (NOT USED)
2. **ExtinctionTriggersPhase.ts** - Imports: assertDefined, assertProbability (NOT USED)

### Critical population/mortality phases:
3. **AntimicrobialResistancePhase.ts** - Mortality + QoL modifications
4. **MinimalSufferingPhase.ts** - Mortality + economy modifications
5. **UnknownUnknownPhase.ts** - Multi-system (mortality, economy, AI)
6. **Tier2CrisisAnticipationPhase.ts** - Multi-system (mortality, climate, AI)
7. **Tier2SynergyPhase.ts** - Multi-system (mortality, climate)

### Critical AI capability phases:
8. **LLMWeightUpdatePhase.ts** - AI capability modifications
9. **RLHFBindingPhase.ts** - AI capability modifications (imports but unused)
10. **SocialInfluenceUpdatePhase.ts** - AI + social influence
11. **TechnologyDiffusionPhase.ts** - AI technology spread
12. **Tier2CentaurSystemsPhase.ts** - AI-human hybrid systems
13. **Tier2DarkComputePhase.ts** - Hidden AI compute
14. **Tier2InterpretabilityPhase.ts** - AI interpretability (imports but unused)
15. **Tier2NuclearSecurityPhase.ts** - AI + nuclear security (imports but unused)

**Validation:** Monte Carlo N=3, check for:
- Zero assertion errors
- Zero NaN/Infinity values
- Mortality rates ≤ 50% (assertMortalityRate)
- AI capabilities in [0, 5] (assertAICapability)

---

## BATCH 2: CRITICAL + HIGH Priority (13 phases, 3-4 hours)
**Focus:** Remaining CRITICAL + all HIGH (climate, economy)

### Remaining CRITICAL:
1. **DemocracyDynamicsPhase.ts** - AI + democracy (imports but unused)
2. **MemeticEvolutionPhase.ts** - QoL + meme spread
3. **ResentmentRecoveryPhase.ts** - AI + QoL recovery

### HIGH - Climate phases:
4. **ClimateJusticePhase.ts** - Climate equity
5. **EarlyWarningPhase.ts** - Climate early warnings
6. **GeoengineringPhase.ts** - Climate modification
7. **GovernmentRelocationPhase.ts** - Climate-driven migration
8. **PositiveTippingPointsPhase.ts** - Climate + economy positive feedback

### HIGH - Economy phases:
9. **OrganizationViabilityPhase.ts** - Economic viability
10. **PowerGenerationPhase.ts** - Energy economy + climate
11. **ResourceEconomyPhase.ts** - Resource economics
12. **ResourceTechnologyPhase.ts** - Resource tech economics

**Validation:** Monte Carlo N=3, check for:
- Temperature deltas in [-20, +10]°C (assertTemperatureDelta)
- Economic metrics finite and positive (assertEconomicMetric)
- Planetary boundaries within research ranges (assertPlanetaryBoundary)

---

## BATCH 3: MEDIUM Priority Part 1 (18 phases, 4-5 hours)
**Focus:** Complex math operations, division-heavy calculations

1. **BenchmarkEvaluationsPhase.ts** - AI evaluation metrics
2. **CatastrophicScenariosPhase.ts** - Catastrophe probability
3. **ConflictResolutionPhase.ts** - Conflict dynamics
4. **ConsciousnessGovernancePhase.ts** - Consciousness + governance
5. **CooperativeOwnershipPhase.ts** - Ownership dynamics
6. **CooperativeSpiralsPhase.ts** - Positive feedback loops
7. **CyberSecurityPhase.ts** - Cyber risk
8. **DefensiveAIPhase.ts** - Defensive AI systems
9. **DiplomaticAIPhase.ts** - Diplomatic AI agents
10. **EnsembleMetaLearningPhase.ts** - Meta-learning aggregation
11. **EventCollectionPhase.ts** - Event aggregation
12. **GamingDetectionPhase.ts** - Gaming detection probability
13. **GovernanceQualityPhase.ts** - Governance metrics
14. **InformationWarfarePhase.ts** - Info warfare dynamics
15. **MeaningRenaissancePhase.ts** - Meaning/purpose metrics
16. **NationalAIPhase.ts** - National AI systems
17. **NovelEntitiesPhase.ts** - Novel entity detection
18. **OrganizationTurnsPhase.ts** - Organization actions

**Validation:** Monte Carlo N=3, check for:
- Probabilities in [0, 1] (assertProbability)
- No division by zero
- Finite calculations (assertFinite)

---

## BATCH 4: MEDIUM Priority Part 2 (18 phases, 4-5 hours)
**Focus:** Remaining MEDIUM phases

1. **ParanoiaPhase.ts** - Paranoia dynamics
2. **PhosphorusPhase.ts** - Phosphorus cycle
3. **PlayerDecisionPhase.ts** - Player input handling
4. **PolicyImplementationPhase.ts** - Policy effects
5. **ProactiveSleeperDetectionPhase.ts** - Sleeper detection
6. **SleeperWakePhase.ts** - Sleeper activation
7. **SocialSafetyNetsPhase.ts** - Safety net dynamics
8. **SocietyActionsPhase.ts** - Society-level actions
9. **Tier2CoastalProtectionPhase.ts** - Coastal infrastructure
10. **Tier2CommunityCohesionPhase.ts** - Community cohesion
11. **Tier2SyntheticEcosystemsPhase.ts** - Synthetic ecosystems
12. **TimeAdvancementPhase.ts** - Time progression
13. **TriggeredEventsPhase.ts** - Event triggering
14. **TrustRecoveryPhase.ts** - Trust recovery dynamics
15. **UBIPhase.ts** - Universal basic income
16. **UpwardSpiralsPhase.ts** - Positive spiral detection
17. **WarMeaningFeedbackPhase.ts** - War-meaning feedback
18. **WorkflowAdaptationPhase.ts** - Workflow evolution

**Validation:** Monte Carlo N=3, check for:
- Finite values throughout
- No NaN propagation
- State consistency

---

## Final Validation (After All Batches)
1. **Monte Carlo N=10** - Full determinism test
2. **Performance profiling** - Ensure <1% overhead
3. **Outcome distribution** - Verify behavior preserved
4. **Re-run audit script** - Confirm 95%+ coverage

## Success Criteria
- [ ] 112+ phases with assertion coverage (95%+)
- [ ] Zero assertion errors during Monte Carlo N=10
- [ ] Zero NaN/Infinity propagation
- [ ] Performance overhead <1%
- [ ] Determinism maintained (same seed → same results)

## Notes
- Excluded index.ts (barrel export, not a real phase)
- Prioritized 5 phases with incomplete imports
- Each batch validated independently before proceeding
- Fail-fast approach: Stop if Monte Carlo fails

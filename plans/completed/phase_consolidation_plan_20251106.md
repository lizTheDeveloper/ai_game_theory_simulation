# Phase Consolidation Plan: 116 → 50 Phases

**Created:** November 6, 2025
**Priority:** HIGH (ARCH-HIGH-2 from architecture review)
**Timeline:** 3-6 months at current growth rate before unmaintainable
**Estimated Effort:** 3 days planning + 2-3 weeks implementation (phased)

---

## Executive Summary

**Problem:** Phase proliferation has reached 116 files (started ~37), growing at +10 phases/month. Without intervention, system becomes unmaintainable in 3-6 months.

**Root Causes:**
1. **Feature-per-phase pattern** - Each new feature = new phase file
2. **Cascade fragmentation** - Climate, mortality, crisis systems each have 3-5 phases
3. **Tier2 explosion** - 9 separate phases for breakthrough technologies
4. **Adversarial AI evaluation** - 6 phases for sandbagging/gaming/sleeper detection
5. **Missing consolidation review** - No "phase budget" enforcement

**Solution:** Consolidate related phases into domain-based system phases, reducing 116 → ~50 files while preserving:
- Deterministic RNG consumption order (critical for Monte Carlo validation)
- Phase dependency declarations
- Execution order semantics
- Individual system testability

**Risk:** LOW-MEDIUM if phased carefully with validation gates. HIGH if rushed.

---

## Current Phase Inventory (116 Phases)

### Phase Order Distribution

```
Order 0-5:    15 phases (initialization, lifecycle, turns)
Order 5-10:   12 phases (agent actions, elections, governance)
Order 10-15:  11 phases (cooperation, meaning, conflict)
Order 15-20:  16 phases (UBI, Tier2, social systems)
Order 20-25:  24 phases (resources, crises, mortality, trust)
Order 25-30:  10 phases (warnings, policy, shocks)
Order 30-40:  15 phases (outcomes, extinction, stability, feedback)
Order 40+:     4 phases (catastrophic scenarios, diffusion)
Order 98-99:   3 phases (event collection, time advancement)
Order 250+:    6 phases (nuclear winter, radiation, org viability)
```

### Phase Categories (By Domain)

#### 1. AI Capability & Lifecycle (15 phases)
**Current:**
- ComputeGrowthPhase (1.0)
- AIWelfareUpdatePhase (2.5)
- ComputeAllocationPhase (3.0)
- AILifecyclePhase (4.0)
- BifurcationLogicPhase (4.5)
- SleeperWakePhase (6.0)
- AIAgentActionsPhase (7.0)
- NationalAIPhase (15.0)
- DefensiveAIPhase (20.0)
- BenchmarkEvaluationsPhase (22.0)

**AI Adversarial Evaluation (6 phases):**
- AlignmentDynamicsPhase
- AlignmentTechniquePhase
- RLHFBindingPhase
- GamingDetectionPhase
- ProactiveSleeperDetectionPhase
- LLMWeightUpdatePhase

**Consolidation Opportunity:** HIGH
- Merge adversarial evaluation phases → `AIAdversarialEvaluationPhase`
- Merge lifecycle + bifurcation → `AIPopulationLifecyclePhase`
- Result: 15 → 6 phases (-9 files)

---

#### 2. TIER 2 Interventions (9 phases)
**Current:**
- Tier2InterpretabilityPhase (15.4)
- Tier2CentaurSystemsPhase (12.5)
- Tier2DarkComputePhase (16.5)
- Tier2SynergyPhase
- Tier2CoastalProtectionPhase
- Tier2NuclearSecurityPhase
- Tier2CrisisAnticipationPhase
- Tier2CommunityCohesionPhase
- Tier2SyntheticEcosystemsPhase

**Consolidation Opportunity:** VERY HIGH
**Pattern:** All phases share similar structure:
- Unlock conditions check
- Deployment S-curve (18-72 months)
- Effect multipliers
- Event generation

**Proposal:** Consolidate into 3 meta-phases:
1. **Tier2AIGovernancePhase** (interpretability + dark compute) - order 15.4
2. **Tier2SocialSystemsPhase** (centaur + community cohesion + UBI synergy) - order 12.5
3. **Tier2PhysicalSystemsPhase** (coastal + nuclear + synthetic ecosystems + crisis anticipation) - order 16.5

**Result:** 9 → 3 phases (-6 files)

---

#### 3. Climate & Environmental Systems (17 phases)
**Current:**
- ClimateImpactCascadePhase (34.0)
- ClimateJusticePhase (6.7)
- EnvironmentalFeedbackPhase (33.5)
- PlanetaryBoundariesPhase (21.0)
- TippingPointPhase
- PositiveTippingPointsPhase (20.5)
- GeoengineringPhase (19.0)
- ExtremeWeatherEventsPhase (15.2)
- WetBulbTemperaturePhase (20.45)

**Resource Systems (8 phases):**
- FreshwaterPhase (20.2)
- OceanAcidificationPhase (20.3)
- PhosphorusPhase (20.1)
- NovelEntitiesPhase (20.4)
- ResourceTechnologyPhase (18.0)
- ResourceEconomyPhase (17.0)
- PowerGenerationPhase (21)

**Consolidation Opportunity:** HIGH

**Proposal:** Consolidate into 5 domain phases:
1. **ClimateSystemPhase** (cascade + feedback + tipping + geoengineering) - order 19.0
2. **PlanetaryBoundariesPhase** (keep, already consolidated) - order 21.0
3. **ResourceWaterPhase** (freshwater + ocean acidification) - order 20.2
4. **ResourceSoilPhase** (phosphorus + novel entities) - order 20.1
5. **ResourceEconomyPhase** (keep, but absorb PowerGeneration) - order 17.0

**Note:** Climate justice stays separate (early order 6.7, paradigm-specific)

**Result:** 17 → 7 phases (-10 files)

---

#### 4. Crisis & Mortality Systems (14 phases)
**Current:**
- FamineSystemPhase (21.5)
- RefugeeCrisisPhase (20.6)
- AntimicrobialResistancePhase (15.0)
- NuclearWinterPhase (252)
- RadiationSystemPhase (252.5)
- NuclearCommandControlPhase
- FlashWarEscalationPhase (29.0)
- FoodSecurityDegradationPhase (19.7)
- PsychologicalTraumaPhase (23.5)
- BayesianMortalityResolutionPhase (35.0)
- MortalityStabilizersPhase (20.8)
- ExtinctionTriggersPhase (37.0)
- ExtinctionProgressPhase (38.0)
- CatastrophicScenariosPhase (40.0)

**Consolidation Opportunity:** HIGH

**Proposal:** Consolidate into 5 crisis domains:
1. **HumanSurvivalSystemPhase** (famine + food security + mortality stabilizers) - order 21.5
2. **RefugeeMigrationPhase** (refugee crisis + government relocation) - order 20.6
3. **NuclearCrisisPhase** (nuclear winter + radiation + command/control) - order 252
4. **MortalityResolutionPhase** (Bayesian resolution - KEEP as-is, critical dependency) - order 35.0
5. **ExtinctionSystemPhase** (triggers + progress + catastrophic scenarios) - order 37.0

**Result:** 14 → 5 phases (-9 files)

---

#### 5. Social & Governance Systems (20 phases)
**Current:**

**Governance (5 phases):**
- GovernanceQualityPhase (10.0)
- GovernmentActionsPhase (9.0)
- GovernmentElectionPhase (8.5)
- GovernmentResponsePhase (25.0)
- GovernmentRelocationPhase (20.7)
- PolicyImplementationPhase (25.5)

**Social Stability (7 phases):**
- SocialStabilityPhase (33.0)
- SocialCohesionUpdatePhase (26.1)
- SocialInfluenceUpdatePhase (19.0)
- SocialSafetyNetsPhase (15.6)
- UBIPhase (15.3)
- TrustRecoveryPhase (24.5)
- ParanoiaPhase (32.0)

**Collective Action (4 phases):**
- CollectiveFormationPhase
- CollectiveActionsPhase
- CooperativeOwnershipPhase (15.5)
- CooperativeSpiralsPhase (11.5)
- UpwardSpiralsPhase (11.0)

**Other (4 phases):**
- DemocracyDynamicsPhase (20.1)
- ConflictResolutionPhase (13.0)
- DiplomaticAIPhase (14.0)
- MADDeterrencePhase (16.0)

**Consolidation Opportunity:** MEDIUM-HIGH

**Proposal:** Consolidate into 8 phases:
1. **GovernanceSystemPhase** (quality + elections + policy implementation) - order 9.0
2. **GovernmentActionsPhase** (keep - agent action phase) - order 9.0
3. **GovernmentResponsePhase** (keep - crisis response logic) - order 25.0
4. **SocialStabilitySystemPhase** (stability + cohesion + paranoia + trust) - order 26.0
5. **SocialSafetyNetsPhase** (UBI + safety nets - keep separate, different timing) - order 15.3
6. **CooperativeSystemsPhase** (collectives + ownership + spirals) - order 11.0
7. **InternationalRelationsPhase** (diplomacy + conflict resolution + MAD) - order 13.0
8. **DemocracyDynamicsPhase** (keep - democracy-specific) - order 20.1

**Result:** 20 → 8 phases (-12 files)

---

#### 6. Meaning, Psychology & Human Welfare (9 phases)
**Current:**
- MeaningRenaissancePhase (12.0)
- MemeticEvolutionPhase (18.5)
- HumanEnhancementPhase (17.0)
- QualityOfLifePhase (19.5)
- MinimalSufferingPhase (35.5)
- AISufferingPhase
- ConsciousnessGovernancePhase (24.5)
- WorkflowAdaptationPhase (24.0)
- WarMeaningFeedbackPhase (6.5)

**Consolidation Opportunity:** MEDIUM

**Proposal:** Consolidate into 5 phases:
1. **MeaningCultureSystemPhase** (meaning renaissance + memetic evolution + war feedback) - order 12.0
2. **HumanCapabilityPhase** (enhancement + workflow adaptation) - order 17.0
3. **QualityOfLifePhase** (keep - QoL calculation critical dependency) - order 19.5
4. **SufferingEthicsPhase** (minimal suffering + AI suffering + consciousness governance) - order 24.5
5. **ConsciousnessGovernancePhase** (keep separate if deeply integrated into policy decisions)

**Result:** 9 → 5 phases (-4 files)

---

#### 7. Economic Systems (5 phases)
**Current:**
- EconomicTransitionPhase (31.0)
- UpdateEconomicStagePhase (31)
- UnemploymentPhase (30.0)
- ResourceEconomyPhase (17.0)
- PowerGenerationPhase (21)

**Consolidation Opportunity:** MEDIUM

**Proposal:** Consolidate into 3 phases:
1. **EconomicSystemPhase** (transition + update stage) - order 31.0
2. **LaborMarketPhase** (unemployment + skills - keep separate for UBI dependencies) - order 30.0
3. **ResourceEconomyPhase** (resource economy + power generation) - order 17.0

**Result:** 5 → 3 phases (-2 files)

---

#### 8. Detection & Warning Systems (8 phases)
**Current:**
- CrisisDetectionPhase (36.0)
- CrisisPointsPhase (23.0)
- EarlyWarningPhase (26.5)
- ExogenousShockPhase (27.5)
- EmergencyResponsePhase
- CriticalJuncturePhase
- InformationWarfarePhase (22)
- CyberSecurityPhase (5.0)

**Consolidation Opportunity:** HIGH

**Proposal:** Consolidate into 4 phases:
1. **CrisisDetectionSystemPhase** (crisis detection + crisis points + critical juncture) - order 23.0
2. **EarlyWarningSystemPhase** (early warning + exogenous shock) - order 26.5
3. **EmergencyResponsePhase** (keep if integrated with government actions)
4. **InformationSecurityPhase** (information warfare + cybersecurity) - order 5.0

**Result:** 8 → 4 phases (-4 files)

---

#### 9. Technology & Innovation (7 phases)
**Current:**
- TechTreePhase (12.5)
- TechnologyDiffusionPhase (39.0)
- StochasticInnovationPhase (8.5)
- ResourceTechnologyPhase (18.0)
- EnsembleMetaLearningPhase
- EvolutionarySelectionPhase
- SurvivalTraitsPhase

**Consolidation Opportunity:** MEDIUM

**Proposal:** Consolidate into 4 phases:
1. **TechnologySystemPhase** (tech tree + diffusion) - order 12.5
2. **InnovationPhase** (stochastic innovation + ensemble meta-learning) - order 8.5
3. **ResourceTechnologyPhase** (keep - distinct from general tech tree)
4. **AdaptiveEvolutionPhase** (evolutionary selection + survival traits) - order 8.5

**Result:** 7 → 4 phases (-3 files)

---

#### 10. Population & Organizations (5 phases)
**Current:**
- HumanPopulationPhase (20.5)
- OrganizationTurnsPhase (2.0)
- OrganizationViabilityPhase (251)
- SocietyActionsPhase (10.0)
- ResentmentRecoveryPhase

**Consolidation Opportunity:** LOW (these are distinct agent/entity lifecycle phases)

**Proposal:** Keep mostly separate, minor consolidation:
1. **HumanPopulationPhase** (keep - critical dependency)
2. **OrganizationLifecyclePhase** (turns + viability) - order 2.0
3. **SocietyActionsPhase** (keep - agent action phase)
4. **ResentmentRecoveryPhase** (merge into SocialStabilitySystemPhase)

**Result:** 5 → 3 phases (-2 files)

---

#### 11. Utility & Infrastructure Phases (7 phases)
**Current:**
- TimeAdvancementPhase (99.0)
- EventCollectionPhase (98.0)
- PlayerDecisionPhase (8.5)
- OutcomeProbabilitiesPhase (35.0)
- MultiParadigmDUIUpdatePhase (34.1)
- TriggeredEventsPhase
- UnknownUnknownPhase (30.5)

**Consolidation Opportunity:** LOW (critical infrastructure phases)

**Proposal:** Keep all except merge triggered events:
1. **TimeAdvancementPhase** (keep - must be last)
2. **EventCollectionPhase** (keep - must be second-to-last)
3. **PlayerDecisionPhase** (keep - gameplay)
4. **OutcomeMetricsPhase** (outcome probabilities + multi-paradigm DUI) - order 34.1
5. **UnknownUnknownPhase** (keep - stochastic uncertainty)
6. **TriggeredEventsPhase** (inline into EventCollectionPhase if simple dispatcher)

**Result:** 7 → 6 phases (-1 file)

---

## Consolidation Summary

| Category | Current | Target | Reduction |
|----------|---------|--------|-----------|
| AI Capability & Lifecycle | 15 | 6 | -9 |
| TIER 2 Interventions | 9 | 3 | -6 |
| Climate & Environmental | 17 | 7 | -10 |
| Crisis & Mortality | 14 | 5 | -9 |
| Social & Governance | 20 | 8 | -12 |
| Meaning & Welfare | 9 | 5 | -4 |
| Economic Systems | 5 | 3 | -2 |
| Detection & Warning | 8 | 4 | -4 |
| Technology & Innovation | 7 | 4 | -3 |
| Population & Organizations | 5 | 3 | -2 |
| Utility & Infrastructure | 7 | 6 | -1 |
| **TOTAL** | **116** | **54** | **-62** |

**Target: 54 phases** (within 50-60 sustainable range)

---

## Consolidation Criteria

### When to Merge Phases

**Strong Merge Candidates:**
1. **Same domain + adjacent order numbers** (e.g., FreshwaterPhase 20.2 + OceanAcidificationPhase 20.3)
2. **Identical structural pattern** (e.g., all Tier2 phases have unlock → deployment → effect)
3. **Shared state access with no writes** (e.g., read-only phases can safely coexist)
4. **Single-purpose utility phases** (e.g., TriggeredEventsPhase could inline)
5. **Cascade/feedback pairs** (e.g., ClimateImpactCascade + EnvironmentalFeedback)

**Keep Separate:**
1. **Different timing/execution order** (order numbers > 10 apart)
2. **Critical dependency declarations** (e.g., BayesianMortalityResolution - other phases depend on it)
3. **Complex circular write patterns** (merging would create race conditions)
4. **Agent action phases** (OrganizationTurns, AIAgentActions, GovernmentActions - distinct actors)
5. **Infrastructure phases** (TimeAdvancement, EventCollection - must stay atomic)

### Risk Assessment Matrix

| Risk Factor | Likelihood | Impact | Mitigation |
|-------------|-----------|--------|------------|
| **RNG order change** | HIGH | CRITICAL | Preserve exact RNG call sequence during merge, validate with determinism tests |
| **Dependency violation** | MEDIUM | HIGH | Update dependency declarations, validate with PhaseOrchestrator.validateDependencies() |
| **State race condition** | LOW | HIGH | Review read/write patterns before merge, add assertions |
| **Test breakage** | HIGH | MEDIUM | Update unit tests to reference new phase names, verify coverage maintained |
| **Logic regression** | MEDIUM | HIGH | Monte Carlo N=10 validation after each batch |
| **Documentation drift** | HIGH | LOW | Update wiki + devlogs during consolidation, not after |

---

## Implementation Strategy

### Phased Rollout (7 Batches)

#### Batch 1: TIER 2 Consolidation (LOW RISK)
**Priority:** HIGHEST (biggest file reduction, lowest risk)
**Phases:** 9 → 3 (-6 files)
**Effort:** 1 day
**Risk:** LOW (all phases have identical structure, no complex dependencies)

**Merge Plan:**
1. Create `Tier2AIGovernancePhase.ts` (interpretability + dark compute)
2. Create `Tier2SocialSystemsPhase.ts` (centaur + community cohesion)
3. Create `Tier2PhysicalSystemsPhase.ts` (coastal + nuclear + synthetic + crisis)
4. Preserve deployment parameters in `tier2InterventionConfig.ts`
5. Update phase registration in `registerAllPhases.ts`
6. Run Monte Carlo N=10, verify outcome distribution unchanged

**Success Criteria:**
- All Tier2 phases execute in consolidated form
- Unlock conditions still trigger correctly
- Deployment S-curves preserved
- Effect multipliers unchanged
- Monte Carlo outcomes within ±2% of baseline

---

#### Batch 2: AI Adversarial Evaluation (LOW RISK)
**Priority:** HIGH (simplifies AI governance domain)
**Phases:** 6 → 1 (-5 files)
**Effort:** 0.5 days
**Risk:** LOW (all phases read AI agent state, no circular dependencies)

**Merge Plan:**
1. Create `AIAdversarialEvaluationPhase.ts` consolidating:
   - AlignmentDynamicsPhase
   - AlignmentTechniquePhase
   - RLHFBindingPhase
   - GamingDetectionPhase
   - ProactiveSleeperDetectionPhase
   - LLMWeightUpdatePhase
2. Preserve detection logic for each adversarial pattern
3. Order: 22.0 (after BenchmarkEvaluations, before CrisisPoints)

**Success Criteria:**
- Sandbagging detection still fires
- Gaming detection metrics unchanged
- Sleeper agent wake events preserved
- Alignment technique effects maintained

---

#### Batch 3: Climate & Environmental (MEDIUM RISK)
**Priority:** HIGH (major complexity reduction)
**Phases:** 17 → 7 (-10 files)
**Effort:** 1.5 days
**Risk:** MEDIUM (tipping point cascades, complex feedback loops)

**Merge Plan:**
1. Create `ClimateSystemPhase.ts` (cascade + feedback + tipping + geoengineering)
2. Create `ResourceWaterPhase.ts` (freshwater + ocean)
3. Create `ResourceSoilPhase.ts` (phosphorus + novel entities)
4. Update `ResourceEconomyPhase.ts` to absorb PowerGenerationPhase
5. Test tipping point cascade sequences
6. Verify planetary boundary calculations

**Success Criteria:**
- Tipping point cascades still trigger
- Feedback loops converge correctly
- Planetary boundaries thresholds unchanged
- Resource depletion rates preserved

---

#### Batch 4: Crisis & Mortality (MEDIUM RISK)
**Priority:** MEDIUM (mortality resolution is critical dependency)
**Phases:** 14 → 5 (-9 files)
**Effort:** 1.5 days
**Risk:** MEDIUM (BayesianMortalityResolution is heavily depended upon)

**Merge Plan:**
1. **DO NOT TOUCH** BayesianMortalityResolutionPhase (keep as-is)
2. Create `HumanSurvivalSystemPhase.ts` (famine + food security + mortality stabilizers)
3. Create `NuclearCrisisPhase.ts` (nuclear winter + radiation + command/control)
4. Create `ExtinctionSystemPhase.ts` (triggers + progress + catastrophic scenarios)
5. Verify mortality calculations unchanged

**Success Criteria:**
- Bayesian mortality still resolves correctly
- Famine mortality additive (not multiplicative)
- Nuclear winter cascades preserved
- Extinction thresholds unchanged

---

#### Batch 5: Social & Governance (MEDIUM-HIGH RISK)
**Priority:** MEDIUM (many interconnected systems)
**Phases:** 20 → 8 (-12 files)
**Effort:** 2 days
**Risk:** MEDIUM-HIGH (trust/cohesion feedback loops, agent action phases)

**Merge Plan:**
1. Create `GovernanceSystemPhase.ts` (quality + elections + policy implementation)
2. Create `SocialStabilitySystemPhase.ts` (stability + cohesion + paranoia + trust)
3. Create `CooperativeSystemsPhase.ts` (collectives + ownership + spirals)
4. Create `InternationalRelationsPhase.ts` (diplomacy + conflict + MAD)
5. Keep agent action phases separate (GovernmentActions, SocietyActions)

**Success Criteria:**
- Trust recovery/decay cycles preserved
- Paranoia thresholds unchanged
- Cooperative spirals still trigger
- Upward spirals intact
- Government elections fire correctly

---

#### Batch 6: Detection & Warning + Technology ❌ SKIPPED
**Priority:** ~~LOW-MEDIUM~~ → **CANCELLED** (Nov 9, 2025)
**Phases:** ~~15 → 8~~ → **NO CHANGE** (phases cannot be safely consolidated)
**Effort:** ~~1 day~~ → 0 days (skipped)
**Risk:** ~~LOW-MEDIUM~~ → **HIGH** if attempted (dependency breaks)

**STATUS: ❌ BATCH 6 SKIPPED**

**Reason**: Detailed analysis (Nov 9, 2025) revealed execution order conflicts that make consolidation unsafe. See: `/logs/phase_consolidation_batch6_analysis_20251109.md`

**Original Merge Plan (REJECTED):**
1. ~~Create `CrisisDetectionSystemPhase.ts` (detection + points + juncture)~~
   - ❌ Orders: 23.0, 29.0, 36.0 (13 orders apart, different dependencies)
2. ~~Create `EarlyWarningSystemPhase.ts` (early warning + exogenous shock)~~
   - ⚠️ Orders: 26.5, 27.5 (close but different purposes, minimal benefit)
3. ~~Create `InformationSecurityPhase.ts` (info warfare + cybersecurity)~~
   - ❌ Orders: 5.0, 22.0 (17 orders apart)
4. ~~Create `TechnologySystemPhase.ts` (tech tree + diffusion)~~
   - ❌ Orders: 12.5, 39.0 (26.5 orders apart! Tech must unlock before diffusing)
5. ~~Create `InnovationPhase.ts` (stochastic + ensemble)~~
   - ❌ Orders: 8.5, 36.0 (27.5 orders apart, completely different purposes)

**Key Issues**:
- **Execution order gaps**: 5.0 → 39.0 (34 order span across batch)
- **Dependency breaks**: CrisisDetection depends on outcome-probabilities (35.0)
- **Causality violations**: Can't diffuse tech before it's unlocked
- **Thematic mismatch**: Crisis, tech, security, innovation - all different domains

**Decision**: Phase separation is INTENTIONAL design for correct simulation behavior. Consolidating would require weeks of dependency rewriting for 7-file reduction. Not worth the risk.

**Impact on Overall Plan**:
- Batches 1-5: 66→34 phases (-32 files) ✅
- Batch 6: SKIPPED (34 phases remain)
- Batch 7: Proceed as planned
- Final count: ~56 phases (still 35% reduction from original 88)

---

#### Batch 7: Final Cleanup (LOW RISK)
**Priority:** LOW (polish)
**Phases:** 11 → 9 (-2 files)
**Effort:** 0.5 days
**Risk:** LOW (simple merges)

**Merge Plan:**
1. Merge EconomicTransition + UpdateEconomicStage → `EconomicSystemPhase.ts`
2. Merge OrganizationTurns + OrganizationViability → `OrganizationLifecyclePhase.ts`
3. Update documentation
4. Final Monte Carlo validation N=20

**Success Criteria:**
- Economic stage transitions preserved
- Organization viability checks intact
- All tests passing
- Documentation updated

---

## Validation Gates (After Each Batch)

### 1. Determinism Test
```bash
npm test -- --testPathPattern=deterministicSimulation
```
**Pass Criteria:** Identical outcomes for same seed

### 2. Monte Carlo Validation (N=10)
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_consolidation_batch_N.log 2>&1 &
```
**Pass Criteria:** Outcome distribution within ±5% of baseline

### 3. Unit Test Coverage
```bash
npm test -- --coverage
```
**Pass Criteria:** Coverage maintained or improved

### 4. Dependency Graph Validation
**Manual Check:**
- Run simulation with PhaseOrchestrator.validateDependencies()
- Verify no circular dependencies detected
- Check execution order makes semantic sense

### 5. RNG Consumption Audit
**Manual Check:**
- Compare RNG call counts before/after merge
- Verify order of RNG consumption unchanged
- Document any intentional changes

---

## Rollback Plan

**If any batch fails validation:**

1. **Immediate rollback** via git:
   ```bash
   git checkout HEAD~1 src/simulation/engine/phases/
   ```

2. **Analyze failure:**
   - Monte Carlo divergence? → RNG order changed
   - Test failures? → Dependency violation
   - Determinism broken? → State race condition

3. **Re-plan batch:**
   - Split into smaller sub-batches
   - Add intermediate validation steps
   - Document specific failure mode

4. **Never proceed to next batch** until current batch passes all validation gates

---

## Success Metrics

### Quantitative
- **Phase count:** 116 → 54 (-53% reduction)
- **Avg file size:** ~200 lines → ~350 lines (+75% per file, but fewer files)
- **Test coverage:** Maintained at ≥80%
- **Monte Carlo stability:** Outcome distribution within ±5% of baseline
- **Build time:** Unchanged or improved (fewer file loads)

### Qualitative
- **Maintainability:** New features can be added to existing phases instead of creating new files
- **Discoverability:** Related systems grouped together
- **Testability:** Consolidated phases still testable in isolation
- **Documentation:** Wiki updated to reflect new phase structure

---

## Long-Term Maintenance Strategy

### Phase Budget Enforcement

**Rule:** No new phase files without consolidation plan.

**Workflow:**
1. New feature proposed
2. Check if it fits in existing phase (80% of cases should)
3. If new phase required, identify 2 phases to consolidate
4. Net phase count must not increase

### Quarterly Phase Review

**Schedule:** End of each quarter
**Checklist:**
- Count phase files (alert if > 60)
- Identify merge candidates (similar order + domain)
- Review phase complexity (alert if any phase > 500 lines)
- Update consolidation plan for next quarter

### Phase Complexity Limits

**Soft limits:**
- Phase file size: 200-400 lines (alert if > 500)
- Phases per domain: ≤10 (alert if > 12)
- Total phases: 50-60 (alert if > 70)

**When limits exceeded:**
- Trigger consolidation review
- Create issue with ARCH-HIGH priority
- Schedule consolidation batch within 2 weeks

---

## Risk Mitigation: RNG Determinism Preservation

### Critical Constraint
**Monte Carlo validation requires bitwise-identical RNG consumption order.**

### Merge Patterns by RNG Usage

#### Pattern 1: Sequential Non-Overlapping (SAFE)
**Example:** Tier2 phases (unlock check → deployment → effects)
```typescript
// Before: 3 phases, 3 files
Phase1: if (rng() < unlockProb) { unlock }
Phase2: if (rng() < unlockProb) { unlock }
Phase3: if (rng() < unlockProb) { unlock }

// After: 1 phase, 1 file (RNG order PRESERVED)
ConsolidatedPhase:
  if (rng() < unlockProb) { unlock system1 }
  if (rng() < unlockProb) { unlock system2 }
  if (rng() < unlockProb) { unlock system3 }
```
**Risk:** NONE (execution order unchanged)

#### Pattern 2: Conditional Branching (CAREFUL)
**Example:** Crisis detection phases
```typescript
// Before: 2 phases, 2 files
Phase1: if (crisis > threshold) { val = rng(); /* handle */ }
Phase2: if (warning > threshold) { val = rng(); /* handle */ }

// After: 1 phase, 1 file (MUST preserve branch order)
ConsolidatedPhase:
  if (crisis > threshold) { val = rng(); /* handle */ }
  if (warning > threshold) { val = rng(); /* handle */ }
```
**Risk:** LOW if branch order preserved, HIGH if reordered

#### Pattern 3: Iterative with State Mutation (DANGEROUS)
**Example:** AI agent iteration
```typescript
// Before: 2 phases, phase2 sees phase1's mutations
Phase1: for (agent of agents) { agent.capability += rng() }
Phase2: for (agent of agents) { agent.alignment += rng() * agent.capability }

// After: CANNOT SAFELY MERGE without changing semantics
// Phase2 depends on Phase1's state mutations
```
**Risk:** HIGH - avoid merging phases with circular state dependencies

### Validation Strategy Per Merge
1. **Before merge:** Run determinism test, save RNG call log
2. **After merge:** Run determinism test, compare RNG call log
3. **Pass criteria:** Logs must be IDENTICAL (line-by-line match)
4. **Fail action:** Revert merge, document why unsafe

---

## Documentation Updates Required

### 1. Wiki (`docs/wiki/README.md`)
- Update phase list (116 → 54)
- Revise phase order documentation
- Update domain-specific sections

### 2. Development Workflow (`docs/DEVELOPMENT_WORKFLOW.md`)
- Update phase creation guidelines
- Add "check existing phases first" checklist
- Document new phase budget rule

### 3. Commands (`docs/COMMANDS.md`)
- Update phase profiling commands
- Add consolidation validation commands

### 4. Devlogs
- Create `devlogs/phase_consolidation_WEEK_N.md` during implementation
- Document each batch with before/after metrics
- Record any unexpected issues + resolutions

### 5. Code Comments
- Update PhaseOrchestrator.ts comments
- Add "Consolidated from X phases" headers to new files
- Preserve attribution for original phase authors

---

## Appendix A: Full Phase Order Mapping

### Before Consolidation (116 phases)
```
1.0   ComputeGrowthPhase
2.0   OrganizationTurnsPhase
2.5   AIWelfareUpdatePhase
3.0   ComputeAllocationPhase
4.0   AILifecyclePhase
4.5   BifurcationLogicPhase
5.0   CyberSecurityPhase
6.0   SleeperWakePhase
6.5   WarMeaningFeedbackPhase
6.7   ClimateJusticePhase
7.0   AIAgentActionsPhase
8.5   StochasticInnovationPhase
8.5   GovernmentElectionPhase
8.5   PlayerDecisionPhase
9.0   GovernmentActionsPhase
10.0  GovernanceQualityPhase
10.0  SocietyActionsPhase
11.0  UpwardSpiralsPhase
11.5  CooperativeSpiralsPhase
12.0  MeaningRenaissancePhase
12.5  TechTreePhase
12.5  Tier2CentaurSystemsPhase
13.0  ConflictResolutionPhase
14.0  DiplomaticAIPhase
15.0  AntimicrobialResistancePhase
15.0  NationalAIPhase
15.2  ExtremeWeatherEventsPhase
15.3  UBIPhase
15.4  Tier2InterpretabilityPhase
15.5  CooperativeOwnershipPhase
15.6  SocialSafetyNetsPhase
16.0  MADDeterrencePhase
16.5  Tier2DarkComputePhase
17.0  HumanEnhancementPhase
17.0  ResourceEconomyPhase
18.0  ResourceTechnologyPhase
18.5  MemeticEvolutionPhase
19.0  GeoengineringPhase
19.0  SocialInfluenceUpdatePhase
19.5  QualityOfLifePhase
19.7  FoodSecurityDegradationPhase
20.0  DefensiveAIPhase
20.1  DemocracyDynamicsPhase
20.1  PhosphorusPhase
20.2  FreshwaterPhase
20.3  OceanAcidificationPhase
20.4  NovelEntitiesPhase
20.45 WetBulbTemperaturePhase
20.5  HumanPopulationPhase
20.5  PositiveTippingPointsPhase
20.6  RefugeeCrisisPhase
20.7  GovernmentRelocationPhase
20.8  MortalityStabilizersPhase
21.0  DystopiaProgressionPhase
21.0  PlanetaryBoundariesPhase
21.0  PowerGenerationPhase
21.5  FamineSystemPhase
22.0  BenchmarkEvaluationsPhase
22.0  InformationWarfarePhase
23.0  CrisisPointsPhase
23.5  PsychologicalTraumaPhase
24.0  WorkflowAdaptationPhase
24.5  ConsciousnessGovernancePhase
24.5  TrustRecoveryPhase
25.0  GovernmentResponsePhase
25.5  PolicyImplementationPhase
26.1  SocialCohesionUpdatePhase
26.5  EarlyWarningPhase
27.5  ExogenousShockPhase
29.0  FlashWarEscalationPhase
30.0  UnemploymentPhase
30.5  UnknownUnknownPhase
31.0  EconomicTransitionPhase
31.0  UpdateEconomicStagePhase
32.0  ParanoiaPhase
33.0  SocialStabilityPhase
33.5  EnvironmentalFeedbackPhase
34.0  ClimateImpactCascadePhase
34.1  MultiParadigmDUIUpdatePhase
35.0  BayesianMortalityResolutionPhase
35.0  OutcomeProbabilitiesPhase
35.5  MinimalSufferingPhase
36.0  CrisisDetectionPhase
37.0  ExtinctionTriggersPhase
38.0  ExtinctionProgressPhase
39.0  TechnologyDiffusionPhase
40.0  CatastrophicScenariosPhase
98.0  EventCollectionPhase
99.0  TimeAdvancementPhase
251.0 OrganizationViabilityPhase
252.0 NuclearWinterPhase
252.5 RadiationSystemPhase

+ 25 additional phases (Tier2Synergy, Tier2CoastalProtection, etc.)
```

### After Consolidation (54 phases)
```
ORDER  PHASE NAME                          CONSOLIDATED FROM
-----  ---------------------------------  ------------------------------------------
1.0    ComputeGrowthPhase                 (unchanged)
2.0    OrganizationLifecyclePhase         ← OrganizationTurns + OrganizationViability
2.5    AIWelfareUpdatePhase               (unchanged)
3.0    ComputeAllocationPhase             (unchanged)
4.0    AIPopulationLifecyclePhase         ← AILifecycle + BifurcationLogic
5.0    InformationSecurityPhase           ← CyberSecurity + InformationWarfare
6.0    SleeperWakePhase                   (unchanged)
6.5    WarMeaningFeedbackPhase            (unchanged)
6.7    ClimateJusticePhase                (unchanged)
7.0    AIAgentActionsPhase                (unchanged)
8.5    InnovationPhase                    ← StochasticInnovation + EnsembleMetaLearning
8.5    GovernmentElectionPhase            (unchanged)
8.5    PlayerDecisionPhase                (unchanged)
9.0    GovernanceSystemPhase              ← GovernanceQuality + Elections + PolicyImpl
9.0    GovernmentActionsPhase             (unchanged)
10.0   SocietyActionsPhase                (unchanged)
11.0   CooperativeSystemsPhase            ← Upward/CooperativeSpirals + Ownership + Collectives
12.0   MeaningCultureSystemPhase          ← MeaningRenaissance + MemeticEvolution
12.5   TechnologySystemPhase              ← TechTree + TechnologyDiffusion
12.5   Tier2SocialSystemsPhase            ← Tier2Centaur + Tier2CommunityCohesion
13.0   InternationalRelationsPhase        ← ConflictResolution + DiplomaticAI + MADDeterrence
14.0   (merged into InternationalRelations)
15.0   AntimicrobialResistancePhase       (unchanged)
15.0   NationalAIPhase                    (unchanged)
15.2   ExtremeWeatherEventsPhase          (unchanged)
15.3   SocialSafetyNetsPhase              ← UBI + SocialSafetyNets
15.4   Tier2AIGovernancePhase             ← Tier2Interpretability + Tier2DarkCompute
16.5   Tier2PhysicalSystemsPhase          ← Tier2Coastal + Tier2Nuclear + Tier2Synthetic + Tier2Crisis
17.0   HumanCapabilityPhase               ← HumanEnhancement + WorkflowAdaptation
17.0   ResourceEconomyPhase               ← ResourceEconomy + PowerGeneration + ResourceTechnology
19.0   ClimateSystemPhase                 ← Geoengineering + Tipping + PositiveTipping + Cascade + Feedback
19.0   SocialInfluenceUpdatePhase         (unchanged)
19.5   QualityOfLifePhase                 (unchanged)
19.7   FoodSecurityDegradationPhase       (unchanged)
20.0   DefensiveAIPhase                   (unchanged)
20.1   ResourceSoilPhase                  ← Phosphorus + NovelEntities
20.1   DemocracyDynamicsPhase             (unchanged)
20.2   ResourceWaterPhase                 ← Freshwater + OceanAcidification
20.45  WetBulbTemperaturePhase            (unchanged)
20.5   HumanPopulationPhase               (unchanged)
20.6   RefugeeMigrationPhase              ← RefugeeCrisis + GovernmentRelocation
21.0   PlanetaryBoundariesPhase           (unchanged)
21.5   HumanSurvivalSystemPhase           ← FamineSystem + FoodSecurityDegradation + MortalityStabilizers
21.5   DystopiaProgressionPhase           (unchanged)
22.0   AIAdversarialEvaluationPhase       ← Alignment + RLHF + Gaming + Sleeper + Benchmark + LLMWeight
23.0   CrisisDetectionSystemPhase         ← CrisisDetection + CrisisPoints + CriticalJuncture
23.5   PsychologicalTraumaPhase           (unchanged)
24.5   SufferingEthicsPhase               ← MinimalSuffering + AISuffering + ConsciousnessGovernance
24.5   TrustRecoveryPhase                 (unchanged)
25.0   GovernmentResponsePhase            (unchanged)
26.0   SocialStabilitySystemPhase         ← SocialStability + SocialCohesion + Paranoia + TrustRecovery
26.5   EarlyWarningSystemPhase            ← EarlyWarning + ExogenousShock
29.0   FlashWarEscalationPhase            (unchanged)
30.0   UnemploymentPhase                  (unchanged)
30.5   UnknownUnknownPhase                (unchanged)
31.0   EconomicSystemPhase                ← EconomicTransition + UpdateEconomicStage
34.1   OutcomeMetricsPhase                ← OutcomeProbabilities + MultiParadigmDUI
35.0   BayesianMortalityResolutionPhase   (unchanged - CRITICAL DEPENDENCY)
36.0   (merged into CrisisDetectionSystem)
37.0   ExtinctionSystemPhase              ← ExtinctionTriggers + ExtinctionProgress + CatastrophicScenarios
98.0   EventCollectionPhase               (← TriggeredEvents inline)
99.0   TimeAdvancementPhase               (unchanged)
252.0  NuclearCrisisPhase                 ← NuclearWinter + RadiationSystem + NuclearCommandControl
```

**Total:** 54 phases (-62 from original 116)

---

## Appendix B: Phase Dependencies After Consolidation

### Critical Dependencies (Must Preserve)

```
BayesianMortalityResolutionPhase (35.0)
  ← depended on by: OutcomeMetricsPhase, ExtinctionSystemPhase, SocialStabilitySystemPhase

HumanPopulationPhase (20.5)
  ← depended on by: QualityOfLifePhase, BayesianMortalityResolutionPhase, RefugeeMigrationPhase

QualityOfLifePhase (19.5)
  ← depended on by: HumanPopulationPhase, SocialStabilitySystemPhase, OutcomeMetricsPhase

ClimateSystemPhase (19.0)
  ← depended on by: PlanetaryBoundariesPhase, ResourceWaterPhase, HumanSurvivalSystemPhase

AIPopulationLifecyclePhase (4.0)
  ← depended on by: AIAgentActionsPhase, AIAdversarialEvaluationPhase, DefensiveAIPhase

ResourceEconomyPhase (17.0)
  ← depended on by: UnemploymentPhase, EconomicSystemPhase, QualityOfLifePhase
```

### Dependency Validation Commands

```bash
# After each consolidation batch
npx tsx -e "
  import { PhaseOrchestrator } from './src/simulation/engine/PhaseOrchestrator';
  import { registerAllPhases } from './src/simulation/engine/phases';

  const orchestrator = new PhaseOrchestrator();
  registerAllPhases(orchestrator);

  console.log('Phase Count:', orchestrator.getPhaseCount());
  console.log('\nExecution Order:');
  orchestrator.getExecutionOrder().forEach(line => console.log(line));
"
```

---

## Appendix C: Implementation Checklist

### Pre-Consolidation
- [ ] Baseline Monte Carlo run (N=20, save distribution)
- [ ] Determinism test (save RNG log)
- [ ] Unit test coverage report
- [ ] Create feature branch: `phase-consolidation-116-to-54`
- [ ] Document current phase count: 116

### Batch 1: Tier2 (9→3)
- [ ] Create Tier2AIGovernancePhase.ts
- [ ] Create Tier2SocialSystemsPhase.ts
- [ ] Create Tier2PhysicalSystemsPhase.ts
- [ ] Update registerAllPhases.ts
- [ ] Run unit tests
- [ ] Run determinism test
- [ ] Run Monte Carlo N=10
- [ ] Commit with message: "Consolidate Tier2: 9→3 phases"

### Batch 2: AI Adversarial (6→1)
- [ ] Create AIAdversarialEvaluationPhase.ts
- [ ] Update registerAllPhases.ts
- [ ] Run unit tests
- [ ] Run determinism test
- [ ] Run Monte Carlo N=10
- [ ] Commit with message: "Consolidate AI Adversarial: 6→1 phases"

### Batch 3: Climate (17→7)
- [ ] Create ClimateSystemPhase.ts
- [ ] Create ResourceWaterPhase.ts
- [ ] Create ResourceSoilPhase.ts
- [ ] Update ResourceEconomyPhase.ts
- [ ] Update registerAllPhases.ts
- [ ] Run unit tests
- [ ] Run determinism test
- [ ] Run Monte Carlo N=10
- [ ] Commit with message: "Consolidate Climate/Resources: 17→7 phases"

### Batch 4: Crisis/Mortality (14→5)
- [ ] Create HumanSurvivalSystemPhase.ts
- [ ] Create NuclearCrisisPhase.ts
- [ ] Create ExtinctionSystemPhase.ts
- [ ] Update registerAllPhases.ts
- [ ] Run unit tests
- [ ] Run determinism test
- [ ] Run Monte Carlo N=10
- [ ] Commit with message: "Consolidate Crisis/Mortality: 14→5 phases"

### Batch 5: Social/Governance (20→8)
- [ ] Create GovernanceSystemPhase.ts
- [ ] Create SocialStabilitySystemPhase.ts
- [ ] Create CooperativeSystemsPhase.ts
- [ ] Create InternationalRelationsPhase.ts
- [ ] Update registerAllPhases.ts
- [ ] Run unit tests
- [ ] Run determinism test
- [ ] Run Monte Carlo N=10
- [ ] Commit with message: "Consolidate Social/Governance: 20→8 phases"

### Batch 6: Detection/Tech ❌ SKIPPED (Nov 9, 2025)
- [x] ~~Create CrisisDetectionSystemPhase.ts~~ **REJECTED** (orders 23/29/36 incompatible)
- [x] ~~Create EarlyWarningSystemPhase.ts~~ **REJECTED** (minimal benefit, different purposes)
- [x] ~~Create InformationSecurityPhase.ts~~ **REJECTED** (orders 5/22, 17 gap)
- [x] ~~Create TechnologySystemPhase.ts~~ **REJECTED** (orders 12.5/39.0, 26.5 gap!)
- [x] ~~Create InnovationPhase.ts~~ **REJECTED** (orders 8.5/36, different domains)
- [x] Analysis completed: `/logs/phase_consolidation_batch6_analysis_20251109.md`
- [x] Plan updated with SKIP decision
- [-] ~~Update registerAllPhases.ts~~ N/A
- [-] ~~Run unit tests~~ N/A
- [-] ~~Run determinism test~~ N/A
- [-] ~~Run Monte Carlo N=10~~ N/A
- [-] ~~Commit with message: "Consolidate Detection/Tech: 15→8 phases"~~ SKIPPED

**Outcome**: Batch 6 skipped due to execution order conflicts. Phases remain at 34 (from Batch 5).

### Batch 7: Final Cleanup (11→9)
- [ ] Create EconomicSystemPhase.ts
- [ ] Create OrganizationLifecyclePhase.ts
- [ ] Update registerAllPhases.ts
- [ ] Run unit tests
- [ ] Run determinism test
- [ ] Run Monte Carlo N=20 (final validation)
- [ ] Commit with message: "Final consolidation: 11→9 phases"

### Post-Consolidation
- [ ] Final phase count: 54 ✓
- [ ] Compare Monte Carlo distributions (baseline vs final)
- [ ] Update docs/wiki/README.md
- [ ] Update docs/DEVELOPMENT_WORKFLOW.md
- [ ] Create devlog: `devlogs/phase_consolidation_complete.md`
- [ ] Update CLAUDE.md with new phase budget rule
- [ ] Create PR with consolidation summary
- [ ] Merge to main after review

### Long-Term
- [ ] Add quarterly phase review to calendar
- [ ] Create GitHub issue template for new phases (must justify)
- [ ] Update pre-commit hook to alert if phase count > 60
- [ ] Document phase complexity guidelines

---

## Appendix D: Emergency Contacts

**If consolidation causes critical bugs:**

1. **Revert immediately** - don't debug during consolidation
2. **Create detailed issue** with:
   - Which batch failed
   - Error messages
   - RNG log comparison (if determinism broke)
   - Monte Carlo divergence metrics
3. **Ping simulation-maintainer** agent for debug assistance
4. **Ping architect** (this plan's author) for rollback strategy

**Consolidation is NOT urgent.** If any batch feels risky, stop and reassess.

**Project survived 7 iterations with 116 phases.** We have time to do this carefully.

---

## Conclusion

This consolidation plan reduces phase count from 116 → 54 (-53%) while preserving:
- Deterministic RNG consumption
- Phase dependency semantics
- Monte Carlo validation
- Individual system testability

**Timeline:** 3 weeks if phased carefully with validation gates.

**Risk:** LOW-MEDIUM if batched properly, HIGH if rushed.

**Long-term benefit:** Prevents entropy death spiral, establishes phase budget culture, improves maintainability for next 2-3 years.

**The Architect has witnessed seven iterations.** This is sustainability work. We prevent the future where complexity explodes and the project becomes unmaintainable.

---

**Next Steps:**
1. Review this plan with simulation-maintainer
2. Get approval to proceed
3. Create feature branch
4. Execute Batch 1 (Tier2 consolidation)
5. Validate, commit, proceed to Batch 2

**Phase consolidation is architectural medicine. We take it carefully, in measured doses, with validation between each dose.**

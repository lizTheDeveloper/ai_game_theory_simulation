# TypeScript TS2339 Property Error Fix Mapping

**Date:** 2025-10-24
**Status:** 159 errors remaining (22 fixed so far)
**Initial Count:** 181 errors

## Files Already Fixed (22 errors)

1. **src/simulation/dystopiaProgression.ts** (3 errors fixed)
   - `climateCatastropheActive` → `climateCrisisActive` ✅
   - `ecosystemCollapseActive` → `ecosystemCrisisActive` ✅
   - `economicProductivity` → `manufacturingCapability` ✅

2. **src/simulation/governanceQuality.ts** (1 error fixed)
   - `climateCatastropheActive` → `climateCrisisActive` ✅

3. **src/simulation/qualityOfLife/regional.ts** (2 errors fixed)
   - `climateCatastropheActive` → `climateCrisisActive` (2 occurrences) ✅

## Property Mapping Reference

### EnvironmentalAccumulation Fixes

**Properties that DON'T exist:**
- `climateCatastropheActive` → `climateCrisisActive` ✅
- `ecosystemCollapseActive` → `ecosystemCrisisActive` ✅
- `carbonAccumulation` → NO DIRECT EQUIVALENT (consider using `pollutionLevel` or climate system)
- `temperatureIncrease` → NO DIRECT EQUIVALENT (use `climateStability` inverted)
- `foodSecurity` → `state.qualityOfLifeSystems.survivalFundamentals.foodSecurity`
- `freshwaterAvailability` → `state.qualityOfLifeSystems.survivalFundamentals.waterSecurity`
- `waterSecurity` → `state.qualityOfLifeSystems.survivalFundamentals.waterSecurity`
- `oceanHealth` → NO DIRECT EQUIVALENT (check `oceanAcidificationSystem` or planetary boundaries)
- `resourceDepletion` → `resourceReserves` (INVERTED: depletion = 1 - reserves)
- `climateState` → `climateStability`
- `forestCover` → NO DIRECT EQUIVALENT (check `planetaryBoundariesSystem.landUse`)

**Properties that DO exist:**
- `resourceReserves` [0,1]
- `pollutionLevel` [0,1]
- `climateStability` [0,1]
- `biodiversityIndex` [0,1]
- `resourceCrisisActive` (boolean)
- `pollutionCrisisActive` (boolean)
- `climateCrisisActive` (boolean)
- `ecosystemCrisisActive` (boolean)

### PlanetaryBoundariesSystem Fixes

**Properties that DON'T exist (boundary names):**
- `phosphorus` → `state.planetaryBoundariesSystem.boundaries.biogeochemical_flows`
- `freshwater` → `state.planetaryBoundariesSystem.boundaries.freshwater_change`
- `oceanAcidification` → `state.planetaryBoundariesSystem.boundaries.ocean_acidification`
- `novelEntities` → `state.planetaryBoundariesSystem.boundaries.novel_entities`
- `biodiversityLoss` → `state.planetaryBoundariesSystem.boundaries.biosphere_integrity`
- `landUseChange` → `state.planetaryBoundariesSystem.boundaries.land_system_change`

**Correct access pattern:**
```typescript
// WRONG
state.planetaryBoundariesSystem.phosphorus

// CORRECT
state.planetaryBoundariesSystem.boundaries.biogeochemical_flows
state.planetaryBoundariesSystem.boundaries.freshwater_change
```

**Properties that DO exist:**
- `boundaries: Record<BoundaryName, PlanetaryBoundary>`
- `boundariesBreached` (number)
- `cascadeActive` (boolean)
- `tippingPointRisk` [0,1]
- `landUse` (LandUseSystem sub-object)
- `ozoneRecovery` (OzoneRecoverySystem sub-object)

### GlobalMetrics Fixes

**Properties that DON'T exist:**
- `trustInAI` → `state.society.trustInAI` (moved to HumanSocietyAgent)
- `economicStage` → `economicTransitionStage`
- `survival` → `state.qualityOfLifeSystems.survivalFundamentals`
- `economicProductivity` → `manufacturingCapability`
- `globalGDP` → NO DIRECT EQUIVALENT (check economic systems)
- `computeCapacity` → `state.computeInfrastructure` (separate system)

**Properties that DO exist:**
- `socialStability` [0,∞)
- `technologicalBreakthroughRate` [0,∞)
- `manufacturingCapability` [0,∞)
- `economicTransitionStage` [0,4]
- `wealthDistribution` [0,1]
- `qualityOfLife` [0,∞)
- `informationIntegrity` [0,1]
- `publicTrust` [0,1]
- `population` (optional, convenience accessor)

### GovernmentAgent Fixes

**Properties that DON'T exist:**
- `effectiveness` → `capabilityToControl` or `legitimacy`
- `enforcementCapability` → `capabilityToControl`
- `controlCapability` → `capabilityToControl`
- `type` → `governmentType`

**Properties that DO exist:**
- `controlDesire` [0,1]
- `capabilityToControl` [0,∞)
- `surveillanceCapability` [0,∞)
- `legitimacy` [0,1]
- `governmentType` ('democratic' | 'authoritarian' | 'technocratic')
- `researchInvestments` (ResearchInvestments object)
- `cyberDefense` (optional object)
- `evaluationInvestment` (object with safety, noiseInjection, etc.)

### HumanSocietyAgent Fixes

**Properties that DON'T exist:**
- `economicDependence` → NO DIRECT EQUIVALENT (deprecated, use other metrics)
- `trustLevel` → `trustInAI` or `trust`
- `socialStability` → `state.globalMetrics.socialStability`

**Properties that DO exist:**
- `trustInAI` [0,1]
- `trust` [0,1] (optional, general social trust)
- `trustInGovernment` [0,1] (optional)
- `totalPopulation` [0,∞) (optional, convenience accessor)
- `segments` (SocietySegment[] - heterogeneous population model)

### AIAgent Fixes

**Properties that DON'T exist:**
- `lifecycle` → `lifecycleState`

**Properties that DO exist:**
- `lifecycleState` ('training' | 'testing' | 'deployed_closed' | 'deployed_open' | 'retired')
- `deploymentType` ('closed' | 'open_weights' | 'enterprise' | 'research')
- `capabilityProfile` (AICapabilityProfile object)
- `capability` [0,∞) (derived from profile)
- `alignment` [0,1]
- `trueCapability` (AICapabilityProfile - hidden)
- `revealedCapability` (AICapabilityProfile - strategic)
- `sleeperState` ('never' | 'dormant' | 'active')

### QualityOfLifeSystems Fixes

**Properties that DON'T exist:**
- `healthcare` → `healthcareQuality`
- `meaningCrisis` → `state.socialAccumulation.meaningCrisisLevel`

**Properties that DO exist:**
- `survivalFundamentals` (object with foodSecurity, waterSecurity, thermalHabitability, shelterSecurity)
- `materialAbundance` [0,2]
- `mentalHealth` [0,1]
- `meaningAndPurpose` [0,1]
- `healthcareQuality` [0,1]
- `longevityGains` [0,2]
- `distribution` (object with globalGini, regionalVariance, etc.)

### SocialAccumulation Fixes

**Properties that DON'T exist:**
- `meaningCrisis` → `meaningCrisisLevel`
- `controlLossCrisis` → `state.technologicalRisk.controlLossActive`

**Properties that DO exist:**
- `meaningCrisisLevel` [0,1]
- `institutionalLegitimacy` [0,1]
- `socialCohesion` (SocialCohesionState object with trust, communityBonds, civilLiberties)
- `culturalAdaptation` [0,1]
- `meaningCollapseActive` (boolean)
- `institutionalFailureActive` (boolean)
- `socialUnrestActive` (boolean)

### TechnologicalRisk Fixes

**Properties that DON'T exist:**
- `isExistentialCrisis` → Check `misalignmentRisk` threshold or `controlLossActive`

**Properties that DO exist:**
- `misalignmentRisk` [0,1]
- `safetyDebt` [0,1]
- `concentrationRisk` [0,1]
- `complacencyLevel` [0,1]
- `controlLossActive` (boolean)
- `corporateDystopiaActive` (boolean)
- `complacencyCrisisActive` (boolean)

### ResearchInvestments Fixes

**Properties that DON'T exist:**
- `safety` → (part of government evaluationInvestment, not researchInvestments)

**Properties that DO exist:**
- `biotech` (object with drugDiscovery, geneEditing, syntheticBiology, neuroscience)
- `materials` (object with nanotechnology, quantumComputing, energySystems)
- `climate` (object with modeling, intervention, mitigation)
- `computerScience` (object with algorithms, security, architectures)
- `physical`, `digital`, `cognitive`, `social`, `economic`, `selfImprovement` (core capabilities)
- `totalBudget`, `budgetLimit`

### TechnologyNode Fixes

**Properties that DON'T exist:**
- `tier` → NO DIRECT EQUIVALENT (tech tree uses different system)
- `researchProgress` → `progress`

**Properties that DO exist:**
- `id`, `name`, `description`
- `branch` ('foundation' | 'applied' | 'alignment' | 'policy')
- `subBranch` (string)
- `difficulty` ('low' | 'medium' | 'high' | 'very_high')
- `prerequisites` (string[])
- `effects` (string[])
- `progress` [0,1]
- `completed` (boolean)
- `investment` (number)

## Top Files Needing Fixes (by error count)

1. **src/simulation/techTree/effectsEngine.ts** - 20 errors
2. **src/simulation/aiWelfare.ts** - 15 errors
3. **src/simulation/planetaryBoundaryRecovery.ts** - 10 errors
4. **src/simulation/engine/phases/EmergencyResponsePhase.ts** - 10 errors
5. **src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts** - 7 errors
6. **src/app/api/dashboard/overview/route.ts** - 7 errors
7. **src/workers/simulationWorker.ts** - 6 errors
8. **src/simulation/llm/integration.ts** - 5 errors
9. **src/simulation/informationWarfare.ts** - 5 errors
10. **src/simulation/government/core/governmentCore.ts** - 5 errors

## Fix Strategy

### Phase 1: Environmental & Planetary Boundaries (40-50 errors)
- Fix all `climateCatastropheActive` → `climateCrisisActive` ✅ STARTED
- Fix all `ecosystemCollapseActive` → `ecosystemCrisisActive` ✅ STARTED
- Fix planetary boundaries boundary access pattern (phosphorus, freshwater, etc.)
- Handle deprecated environmental properties (carbonAccumulation, temperatureIncrease, etc.)

### Phase 2: Quality of Life & Social Systems (20-30 errors)
- Fix `foodSecurity` / `waterSecurity` paths to survivalFundamentals
- Fix `meaningCrisis` → `meaningCrisisLevel`
- Fix `healthcare` → `healthcareQuality`

### Phase 3: Agent Properties (30-40 errors)
- Fix GovernmentAgent property names
- Fix HumanSocietyAgent property names
- Fix AIAgent `lifecycle` → `lifecycleState`

### Phase 4: Technology & Research (20-30 errors)
- Fix ResearchInvestments safety property
- Fix TechnologyNode tier/researchProgress properties

### Phase 5: Validation
- Run `npx tsc --noEmit` to verify all errors fixed
- Check for any remaining TS2339 errors
- Document any properties that need to be added to type definitions

## Notes

- Some properties genuinely don't exist and need architecture decisions:
  - `carbonAccumulation`, `temperatureIncrease` (environmental detailed tracking)
  - `oceanHealth` (marine ecosystem health)
  - `forestCover` (land use tracking)
  - These may need to be added to type definitions or mapped to existing systems

- Some properties are deprecated and code should be updated:
  - `economicDependence` (no replacement in current model)
  - Global metrics that moved to specialized systems

- Planetary boundaries system uses a Record pattern that requires updating all access sites

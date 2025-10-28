# Documentation Generation Summary

Generated: 2025-10-28T00:21:33.046Z

## Statistics

- **Total underdocumented items**: 146
- **High confidence**: 39
- **Medium confidence**: 8
- **Low confidence (manual review needed)**: 99

## High Confidence Patches

### `SocialAccumulation` (src/types/accumulation.ts:106)

```typescript
/**
 * Tracks accumulating social costs over time. Hidden during prosperity, manifests at thresholds.
 */
interface SocialAccumulation
```

### `AIAgent` (src/types/ai-agents.ts:79)

```typescript
/**
 * Agent representing a i in simulation. Makes decisions based on state and preferences.
 */
interface AIAgent
```

### `ClimatePriorityConfig` (src/types/climate-priority.ts:23)

```typescript
/**
 * Configuration for climate priority. Defines parameters and thresholds.
 */
interface ClimatePriorityConfig
```

### `CountryPopulationSystem` (src/types/countryPopulations.ts:313)

```typescript
/**
 * Country Population system state. Manages related components and their interactions.
 */
interface CountryPopulationSystem
```

### `CyberDefenseCapability` (src/types/defensiveAI.ts:48)

```typescript
/**
 * Cyber Defense capability metrics. Measures effectiveness and capacity.
 */
interface CyberDefenseCapability
```

### `DeepfakeDetectionCapability` (src/types/defensiveAI.ts:55)

```typescript
/**
 * Deepfake Detection capability metrics. Measures effectiveness and capacity.
 */
interface DeepfakeDetectionCapability
```

### `AutonomyOverrideCapability` (src/types/defensiveAI.ts:62)

```typescript
/**
 * Autonomy Override capability metrics. Measures effectiveness and capacity.
 */
interface AutonomyOverrideCapability
```

### `ThreatDetectionCapability` (src/types/defensiveAI.ts:69)

```typescript
/**
 * Threat Detection capability metrics. Measures effectiveness and capacity.
 */
interface ThreatDetectionCapability
```

### `FamineSystem` (src/types/famine.ts:50)

```typescript
/**
 * Famine system state. Manages related components and their interactions.
 */
interface FamineSystem
```

### `FreshwaterSystem` (src/types/freshwater.ts:55)

```typescript
/**
 * Freshwater system state. Manages related components and their interactions.
 */
interface FreshwaterSystem
```

### `GameState` (src/types/game.ts:147)

```typescript
/**
 * Runtime state for game system. Tracks current values and active conditions.
 */
interface GameState
```

### `GovernmentAgent` (src/types/government.ts:44)

```typescript
/**
 * Agent representing government in simulation. Makes decisions based on state and preferences.
 */
interface GovernmentAgent
```

### `GlobalMetrics` (src/types/metrics.ts:3)

```typescript
/**
 * Performance metrics for global. Aggregated measurements and indicators.
 */
interface GlobalMetrics
```

### `NationalAICapability` (src/types/nationalAI.ts:29)

```typescript
/**
 * National A I capability metrics. Measures effectiveness and capacity.
 */
interface NationalAICapability
```

### `NationalAISystem` (src/types/nationalAI.ts:222)

```typescript
/**
 * National A I system state. Manages related components and their interactions.
 */
interface NationalAISystem
```

### `OutcomeMetrics` (src/types/outcomes.ts:66)

```typescript
/**
 * Performance metrics for outcome. Aggregated measurements and indicators.
 */
interface OutcomeMetrics
```

### `RadiationSystem` (src/types/radiation.ts:62)

```typescript
/**
 * Radiation system state. Manages related components and their interactions.
 */
interface RadiationSystem
```

### `BiodiversitySystem` (src/types/regionalBiodiversity.ts:41)

```typescript
/**
 * Biodiversity system state. Manages related components and their interactions.
 */
interface BiodiversitySystem
```

### `EnergySystem` (src/types/resources.ts:142)

```typescript
/**
 * Energy system state. Manages related components and their interactions.
 */
interface EnergySystem
```

### `CO2System` (src/types/resources.ts:185)

```typescript
/**
 * C O2 system state. Manages related components and their interactions.
 */
interface CO2System
```

### `IronFertilizationState` (src/types/resources.ts:302)

```typescript
/**
 * Runtime state for iron fertilization system. Tracks current values and active conditions.
 */
interface IronFertilizationState
```

### `OceanAlkalinityState` (src/types/resources.ts:307)

```typescript
/**
 * Runtime state for ocean alkalinity system. Tracks current values and active conditions.
 */
interface OceanAlkalinityState
```

### `ArtificialUpwellingState` (src/types/resources.ts:313)

```typescript
/**
 * Runtime state for artificial upwelling system. Tracks current values and active conditions.
 */
interface ArtificialUpwellingState
```

### `BioengineeredCleanersState` (src/types/resources.ts:319)

```typescript
/**
 * Runtime state for bioengineered cleaners system. Tracks current values and active conditions.
 */
interface BioengineeredCleanersState
```

### `IronFertilizationState` (src/types/resources.ts:445)

```typescript
/**
 * Runtime state for iron fertilization system. Tracks current values and active conditions.
 */
interface IronFertilizationState
```

### `OceanAlkalinityState` (src/types/resources.ts:454)

```typescript
/**
 * Runtime state for ocean alkalinity system. Tracks current values and active conditions.
 */
interface OceanAlkalinityState
```

### `ArtificialUpwellingState` (src/types/resources.ts:464)

```typescript
/**
 * Runtime state for artificial upwelling system. Tracks current values and active conditions.
 */
interface ArtificialUpwellingState
```

### `BioengineeredCleanersState` (src/types/resources.ts:474)

```typescript
/**
 * Runtime state for bioengineered cleaners system. Tracks current values and active conditions.
 */
interface BioengineeredCleanersState
```

### `GeoengSystemState` (src/types/resources.ts:484)

```typescript
/**
 * Runtime state for geoeng system system. Tracks current values and active conditions.
 */
interface GeoengSystemState
```

### `HumanSocietyAgent` (src/types/society.ts:49)

```typescript
/**
 * Agent representing human society in simulation. Makes decisions based on state and preferences.
 */
interface HumanSocietyAgent
```

### `BreakthroughTechState` (src/types/technologies.ts:64)

```typescript
/**
 * Runtime state for breakthrough tech system. Tracks current values and active conditions.
 */
interface BreakthroughTechState
```

### `ConflictResolutionState` (src/simulation/conflictResolution.ts:18)

```typescript
/**
 * Runtime state for conflict resolution system. Tracks current values and active conditions.
 */
interface ConflictResolutionState
```

### `DiplomaticAIState` (src/simulation/diplomaticAI.ts:20)

```typescript
/**
 * Runtime state for diplomatic a i system. Tracks current values and active conditions.
 */
interface DiplomaticAIState
```

### `ModelTierConfig` (src/simulation/llm/providerManager.ts:38)

```typescript
/**
 * Configuration for model tier. Defines parameters and thresholds.
 */
interface ModelTierConfig
```

### `ProviderConfig` (src/simulation/llm/providerManager.ts:45)

```typescript
/**
 * Configuration for provider. Defines parameters and thresholds.
 */
interface ProviderConfig
```

### `GlobalConfig` (src/simulation/llm/providerManager.ts:66)

```typescript
/**
 * Configuration for global. Defines parameters and thresholds.
 */
interface GlobalConfig
```

### `MultiProviderConfig` (src/simulation/llm/providerManager.ts:87)

```typescript
/**
 * Configuration for multi provider. Defines parameters and thresholds.
 */
interface MultiProviderConfig
```

### `MeaningRenaissanceState` (src/simulation/meaningRenaissance.ts:23)

```typescript
/**
 * Runtime state for meaning renaissance system. Tracks current values and active conditions.
 */
interface MeaningRenaissanceState
```

### `UpwardSpiralState` (src/simulation/upwardSpirals.ts:34)

```typescript
/**
 * Runtime state for upward spiral system. Tracks current values and active conditions.
 */
interface UpwardSpiralState
```


## Medium Confidence (Review Recommended)

### `DecisionMaker` (src/types/ai-agents.ts:296)

```typescript
/**
 * Decision-making structure for ai agents. Defines choices and their outcomes.
 */
interface DecisionMaker
```

### `DecisionMakerRole` (src/types/ai-agents.ts:309)

```typescript
/**
 * Decision-making structure for ai agents. Defines choices and their outcomes.
 */
type DecisionMakerRole
```

### `InfluenceAttempt` (src/types/ai-agents.ts:329)

```typescript
/**
 * InfluenceAttempt for AI agent system. Defines AI-related state and capabilities.
 */
interface InfluenceAttempt
```

### `CriticalDecisionType` (src/types/ai-agents.ts:340)

```typescript
/**
 * Decision-making structure for ai agents. Defines choices and their outcomes.
 */
type CriticalDecisionType
```

### `ScenarioParameters` (src/types/config.ts:12)

```typescript
/**
 * Parameters for config. Configures behavior and constraints.
 */
interface ScenarioParameters
```

### `ConfigurationSettings` (src/types/config.ts:29)

```typescript
/**
 * Settings for config. User-configurable options and preferences.
 */
interface ConfigurationSettings
```

### `EconomicStage` (src/types/economics.ts:3)

```typescript
/**
 * EconomicStage for economic system. Models resource allocation and market dynamics.
 */
type EconomicStage
```

### `DecisionLog` (src/simulation/diagnostics.ts:36)

```typescript
/**
 * Decision-making structure for diagnostics. Defines choices and their outcomes.
 */
interface DecisionLog
```


## Low Confidence (Manual Documentation Required)

- `MortalityRiskType` in src/types/bayesianMortality.ts:44
- `ScenarioTrajectory` in src/types/consciousness.ts:7
- `GovernanceStage` in src/types/consciousness.ts:8
- `PoliticalRegimeType` in src/types/consciousness.ts:9
- `PrecautionaryModel` in src/types/consciousness.ts:10
- `CountryName` in src/types/countryPopulations.ts:33
- `CountryPopulation` in src/types/countryPopulations.ts:53
- `DefenseOffenseArmsRace` in src/types/defensiveAI.ts:76
- `SystemCorruption` in src/types/defensiveAI.ts:82
- `FalsePositiveTracking` in src/types/defensiveAI.ts:88
- `AdversarialFailureTracking` in src/types/defensiveAI.ts:94
- `DefensiveEffects` in src/types/defensiveAI.ts:100
- `DefensiveCosts` in src/types/defensiveAI.ts:107
- `CyberSpoofingAttack` in src/types/defensiveAI.ts:116
- `DeepfakeAttack` in src/types/defensiveAI.ts:125
- `AutonomousLaunchAttempt` in src/types/defensiveAI.ts:136
- `DefensiveAITriggers` in src/types/defensiveAI.ts:148
- `GameEvent` in src/types/events.ts:3
- `GameAction` in src/types/events.ts:43
- `AgentType` in src/types/events.ts:57
- `FamineCause` in src/types/famine.ts:41
- `DayZeroEvent` in src/types/freshwater.ts:128
- `RegionName` in src/types/hegemonicPowers.ts:31
- `ExtractionMechanism` in src/types/hegemonicPowers.ts:258
- `InterventionType` in src/types/hegemonicPowers.ts:316
- `ActualGoal` in src/types/hegemonicPowers.ts:324
- `HegemonBaseline2025` in src/types/hegemonicPowers.ts:497
- `RegionBaseline2025` in src/types/hegemonicPowers.ts:532
- `PowerMetric` in src/types/hegemonicPowers.ts:562
- `ResourceType` in src/types/hegemonicPowers.ts:563
- `ExportControlPolicy` in src/types/nationalAI.ts:69
- `GlobalOpenSourceFrontier` in src/types/nationalAI.ts:83
- `EspionageTracking` in src/types/nationalAI.ts:95
- `AIRaceIntensityFactors` in src/types/nationalAI.ts:117
- `AICooperationAgreement` in src/types/nationalAI.ts:144
- `FirstMoverAdvantage` in src/types/nationalAI.ts:180
- `RegulatoryArbitrage` in src/types/nationalAI.ts:199
- `NationalAIBaseline` in src/types/nationalAI.ts:257
- `MADDeterrence` in src/types/nuclearStates.ts:21
- `BilateralTension` in src/types/nuclearStates.ts:52
- `OutcomeType` in src/types/outcomes.ts:76
- `StratifiedOutcomeType` in src/types/outcomes.ts:92
- `MortalityBand` in src/types/outcomes.ts:102
- `PhosphorusSupplyShock` in src/types/phosphorus.ts:73
- `ExtinctionEvent` in src/types/regionalBiodiversity.ts:56
- `OilResource` in src/types/resources.ts:45
- `CoalResource` in src/types/resources.ts:52
- `NaturalGasResource` in src/types/resources.ts:58
- `MetalResource` in src/types/resources.ts:68
- `RenewableResource` in src/types/resources.ts:97
- `FoodResource` in src/types/resources.ts:115
- `WaterResource` in src/types/resources.ts:123
- `TimberResource` in src/types/resources.ts:131
- `FossilFuelIndustry` in src/types/resources.ts:210
- `MiningIndustry` in src/types/resources.ts:232
- `OceanHealth` in src/types/resources.ts:243
- `GeoengTechnology` in src/types/resources.ts:279
- `ResourceEconomy` in src/types/resources.ts:330
- `ResourceEvent` in src/types/resources.ts:396
- `ResourceType` in src/types/resources.ts:412
- `EnergySource` in src/types/resources.ts:417
- `GeoengType` in src/types/resources.ts:421
- `GeoengTechnology` in src/types/resources.ts:430
- `TechnologyEffects` in src/types/technologies.ts:39
- `TechnologyNode` in src/types/technology.ts:3
- `BehavioralDetectionResult` in src/simulation/behavioralDetection.ts:20
- `CrisisChoice` in src/simulation/crisisPoints.ts:12
- `CrisisOption` in src/simulation/crisisPoints.ts:21
- `DeploymentRiskScore` in src/simulation/deploymentRiskScoring.ts:19
- `ThresholdCrossing` in src/simulation/diagnostics.ts:11
- `GrowthRate` in src/simulation/diagnostics.ts:19
- `InterventionImpact` in src/simulation/diagnostics.ts:27
- `LifecycleSnapshot` in src/simulation/diagnostics.ts:47
- `ResourceSnapshot` in src/simulation/diagnostics.ts:75
- `EnvironmentalSnapshot` in src/simulation/diagnostics.ts:86
- `EconomicSnapshot` in src/simulation/diagnostics.ts:95
- `CascadeSnapshot` in src/simulation/diagnostics.ts:104
- `DiagnosticLog` in src/simulation/diagnostics.ts:113
- `EnsembleWeights` in src/simulation/ensembleDetection.ts:22
- `EnsembleDetectionResult` in src/simulation/ensembleDetection.ts:30
- `ProviderLimits` in src/simulation/llm/providerManager.ts:22
- `ProviderQueue` in src/simulation/llm/providerManager.ts:31
- `TaskComplexity` in src/simulation/llm/providerManager.ts:73
- `ModelTier` in src/simulation/llm/providerManager.ts:74
- `UsageData` in src/simulation/llm/providerManager.ts:76
- `CountryInteractionCache` in src/simulation/nationalAI/interactionCache.ts:16
- `DeterrenceCheckResult` in src/simulation/nuclearDeterrence.ts:15
- `RegionalData` in src/simulation/qualityOfLife/cache/regionalCache.ts:15
- `RegionalCache` in src/simulation/qualityOfLife/cache/regionalCache.ts:26
- `SleeperEconomy` in src/simulation/sleeperEconomy.ts:20
- `CloudProvider` in src/simulation/sleeperEconomy.ts:47
- `SleeperProgression` in src/simulation/sleeperProgression.ts:26
- `TechDefinition` in src/simulation/techTree/comprehensiveTechTree.ts:25
- `TechUnlockEvent` in src/simulation/techTree/engine.ts:15
- `TechDeploymentAction` in src/simulation/techTree/engine.ts:23
- `RegionalTechDeployment` in src/simulation/techTree/engine.ts:31
- `RegionalFactors` in src/simulation/techTree/regionalDeployment.ts:18
- `UpwardSpiral` in src/simulation/upwardSpirals.ts:26
- `EconomicStage` in src/simulation/utils/recoveryCalculations.ts:12

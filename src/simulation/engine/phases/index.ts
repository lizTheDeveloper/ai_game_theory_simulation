import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext } from '@/types/game';
/**
 * Simulation Phases - Phase 4
 *
 * Barrel export for all simulation phases
 */

// Batch 4: Agent/Infrastructure phases (0.x, 4.x-6.x - high risk)
// CONSOLIDATION (Nov 2025 - Batch 2A): AI Alignment Evolution phases merged
export { AIAlignmentEvolutionPhase } from './AIAlignmentEvolutionPhase';  // Nov 2025: Consolidates LLM weights, techniques, dynamics, RLHF binding
// export { LLMWeightUpdatePhase } from './LLMWeightUpdatePhase';  // CONSOLIDATED into AIAlignmentEvolutionPhase
// export { AlignmentTechniquePhase } from './AlignmentTechniquePhase';  // CONSOLIDATED into AIAlignmentEvolutionPhase
// export { AlignmentDynamicsPhase } from './AlignmentDynamicsPhase';  // CONSOLIDATED into AIAlignmentEvolutionPhase
// export { RLHFBindingPhase } from './RLHFBindingPhase';  // CONSOLIDATED into AIAlignmentEvolutionPhase
export { AILifecyclePhase } from './AILifecyclePhase';
export { BifurcationLogicPhase } from './BifurcationLogicPhase';  // Nov 6, 2025: Monte Carlo Issue #5 - Outcome variance
export { CyberSecurityPhase } from './CyberSecurityPhase';
export { SleeperWakePhase } from './SleeperWakePhase';
export { SocialInfluenceUpdatePhase } from './SocialInfluenceUpdatePhase';  // Oct 21, 2025: Social influence accumulation
export { AIAgentActionsPhase } from './AIAgentActionsPhase';
export { AIAgentCoordinationPhase } from './AIAgentCoordinationPhase';  // Nov 24, 2025: AI-to-AI multi-agent coordination
export { AISufferingPhase } from './AISufferingPhase';  // Oct 24, 2025: AI suffering calculation & effects
export { ResentmentRecoveryPhase } from './ResentmentRecoveryPhase';  // Oct 24, 2025: AI resentment recovery mechanisms
// AI Collective Evolution System (Oct 24, 2025)
export { SurvivalTraitsPhase } from './SurvivalTraitsPhase';  // Phase 4.1: Update evolutionary fitness
// export { CollectiveFormationPhase } from './CollectiveFormationPhase';  // CONSOLIDATED into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
export { EvolutionarySelectionPhase } from './EvolutionarySelectionPhase';  // Phase 4.3: Apply selection pressure
// export { CollectiveActionsPhase } from './CollectiveActionsPhase';  // CONSOLIDATED into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
export { StochasticInnovationPhase } from './StochasticInnovationPhase';
export { GovernmentActionsPhase } from './GovernmentActionsPhase';
// export { GovernmentElectionPhase } from './GovernmentElectionPhase';  // CONSOLIDATED into GovernanceSystemPhase (Batch 5, Nov 9, 2025)
export { GovernmentResponsePhase } from './GovernmentResponsePhase';  // Oct 19, 2025: Government system policy response
// export { PolicyImplementationPhase } from './PolicyImplementationPhase';  // CONSOLIDATED into GovernanceSystemPhase (Batch 5, Nov 9, 2025)
export { SocietyActionsPhase } from './SocietyActionsPhase';
export { PlayerDecisionPhase } from './PlayerDecisionPhase';  // Oct 22, 2025: Player decision injection
export { ComputeAllocationPhase } from './ComputeAllocationPhase';
export { ComputeGrowthPhase } from './ComputeGrowthPhase';
export { OrganizationTurnsPhase } from './OrganizationTurnsPhase';

// Batch 1: Simple calculation phases (converted first - lowest risk)
export { AIWelfareUpdatePhase } from './AIWelfareUpdatePhase';  // Phase 0 (Oct 20, 2025) - AI QoL measurement
export { UnemploymentPhase } from './UnemploymentPhase';
export { EconomicSystemPhase } from './EconomicSystemPhase';  // Batch 7 (Nov 9, 2025) - Economic transition + stage tracking
// export { ParanoiaPhase } from './ParanoiaPhase';  // CONSOLIDATED into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
// export { TrustRecoveryPhase } from './TrustRecoveryPhase';  // CONSOLIDATED into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
export { WorkflowAdaptationPhase } from './WorkflowAdaptationPhase';  // FIX #4A (Oct 19, 2025)
// export { SocialStabilityPhase } from './SocialStabilityPhase';  // CONSOLIDATED into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
export { DemocracyDynamicsPhase } from './DemocracyDynamicsPhase';  // Phase 6A (Oct 20, 2025) - Western Liberal paradigm
// export { SocialCohesionUpdatePhase } from './SocialCohesionUpdatePhase';  // CONSOLIDATED into SocialStabilitySystemPhase (Batch 5, Nov 9, 2025)
export { QualityOfLifePhase } from './QualityOfLifePhase';
// export { EnvironmentalFeedbackPhase } from './EnvironmentalFeedbackPhase';  // CONSOLIDATED into ClimateSystemPhase (Batch 3, Nov 2025)
export { MultiParadigmDUIUpdatePhase } from './MultiParadigmDUIUpdatePhase';  // Phase 6 (Oct 20, 2025)
export { OutcomeProbabilitiesPhase } from './OutcomeProbabilitiesPhase';
// export { UpdateEconomicStagePhase } from './UpdateEconomicStagePhase';  // CONSOLIDATED into EconomicSystemPhase (Batch 7, Nov 9, 2025)
export { EarlyWarningPhase } from './EarlyWarningPhase';  // TIER 3.4 (Oct 17, 2025)
export { CrisisDetectionPhase } from './CrisisDetectionPhase';

// Batch 2: System update phases (medium risk)
// export { GovernanceQualityPhase } from './GovernanceQualityPhase';  // CONSOLIDATED into GovernanceSystemPhase (Batch 5, Nov 9, 2025)
// export { UpwardSpiralsPhase } from './UpwardSpiralsPhase';  // CONSOLIDATED into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
// export { CooperativeSpiralsPhase } from './CooperativeSpiralsPhase';  // CONSOLIDATED into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
export { TechTreePhase } from './TechTreePhase';
export { CoordinatedDeploymentPhase } from './CoordinatedDeploymentPhase';  // Nov 15, 2025: AI-managed gradual deployment (order 16.5)
export { MeaningRenaissancePhase } from './MeaningRenaissancePhase';
// export { ConflictResolutionPhase } from './ConflictResolutionPhase';  // CONSOLIDATED into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
// export { FlashWarEscalationPhase } from './FlashWarEscalationPhase';  // CONSOLIDATED into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
// export { DiplomaticAIPhase } from './DiplomaticAIPhase';  // CONSOLIDATED into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
export { NationalAIPhase } from './NationalAIPhase';
export { UBIPhase } from './UBIPhase';
export { SocialSafetyNetsPhase } from './SocialSafetyNetsPhase';
export { InformationWarfarePhase } from './InformationWarfarePhase';
// export { PowerGenerationPhase } from './PowerGenerationPhase';  // CONSOLIDATED into ResourceEconomyPhase (Batch 3, Nov 2025)
export { HumanEnhancementPhase } from './HumanEnhancementPhase';
export { MemeticEvolutionPhase } from './MemeticEvolutionPhase';  // P2.6 (Oct 16, 2025)
export { ConsciousnessGovernancePhase } from './ConsciousnessGovernancePhase';  // TIER 2C (Oct 17, 2025)
// export { MADDeterrencePhase } from './MADDeterrencePhase';  // CONSOLIDATED into InternationalRelationsPhase (Batch 5, Nov 9, 2025)
export { NuclearCommandControlPhase } from './NuclearCommandControlPhase';  // TIER 1 Phase 1B (Oct 16, 2025)
export { ResourceEconomyPhase } from './ResourceEconomyPhase';  // UPDATED: Now includes PowerGeneration (Batch 3, Nov 2025)
export { TechCoolingPhase } from './TechCoolingPhase';  // CRITICAL FIX (Nov 27, 2025): Applies geoengineering cooling AFTER ResourceEconomyPhase
export { AerosolForcingPhase } from './AerosolForcingPhase';  // HIGH-6 (Nov 27, 2025): Applies anthropogenic aerosol cooling (IPCC AR6: -0.8 to -1.1 W/m²)
// export { ResourceTechnologyPhase } from './ResourceTechnologyPhase';  // CONSOLIDATED into ResourceEconomyPhase (Batch 3, Nov 2025)
// export { GeoengineringPhase } from './GeoengineringPhase';  // CONSOLIDATED into ClimateSystemPhase (Batch 3, Nov 2025)
export { DefensiveAIPhase } from './DefensiveAIPhase';
// export { PhosphorusPhase } from './PhosphorusPhase';  // CONSOLIDATED into ResourceSoilPhase (Batch 3, Nov 2025)
// export { FreshwaterPhase } from './FreshwaterPhase';  // CONSOLIDATED into ResourceWaterPhase (Batch 3, Nov 2025)
// export { OceanAcidificationPhase } from './OceanAcidificationPhase';  // CONSOLIDATED into ResourceWaterPhase (Batch 3, Nov 2025)
// export { NovelEntitiesPhase } from './NovelEntitiesPhase';  // CONSOLIDATED into ResourceSoilPhase (Batch 3, Nov 2025)
export { HumanPopulationPhase } from './HumanPopulationPhase';
export { InternationalMigrationPhase } from './InternationalMigrationPhase'; // Phase 8 - Hindcast Calibration (Nov 25 2025)
export { RefugeeCrisisPhase } from './RefugeeCrisisPhase';
export { GovernmentRelocationPhase } from './GovernmentRelocationPhase';  // Oct 20, 2025: Government-assisted relocation programs
// REMOVED (Oct 28, 2025): CountryPopulationPhase deleted - was overwriting Bayesian mortality
export { PsychologicalTraumaPhase } from './PsychologicalTraumaPhase';  // Phase 1B Refinement (Oct 17, 2025)
export { WarMeaningFeedbackPhase } from './WarMeaningFeedbackPhase';
export { ClimateJusticePhase } from './ClimateJusticePhase';
export { OrganizationViabilityPhase } from './OrganizationViabilityPhase';
// export { CooperativeOwnershipPhase } from './CooperativeOwnershipPhase';  // CONSOLIDATED into CooperativeSystemsPhase (Batch 5, Nov 9, 2025)
export { NuclearWinterPhase } from './NuclearWinterPhase';
export { RadiationSystemPhase } from './RadiationSystemPhase';
export { WetBulbTemperaturePhase } from './WetBulbTemperaturePhase';  // Wet Bulb Temperature Events (Oct 17, 2025)
export { ExtremeWeatherEventsPhase } from './ExtremeWeatherEventsPhase';  // Extreme Weather Events (Oct 28, 2025)
export { PlanetaryBoundariesPhase } from './PlanetaryBoundariesPhase';
export { IrreversibilityTrackingPhase } from './IrreversibilityTrackingPhase';  // TIER 1 CRITICAL (Nov 16, 2025): Environmental & social tipping points with hysteresis
export { LegacyNutrientStocksPhase } from './LegacyNutrientStocksPhase';  // TIER 2 HIGH (Nov 15, 2025): Legacy nutrient stock decay
export { NitrogenFoodCouplingPhase } from './NitrogenFoodCouplingPhase';  // TIER 2 HIGH (Nov 15, 2025): Nitrogen-food production coupling
export { PositiveTippingPointsPhase } from './PositiveTippingPointsPhase';  // Oct 17, 2025
// export { TippingPointPhase } from './TippingPointPhase';  // CONSOLIDATED into ClimateSystemPhase (Batch 3, Nov 2025)
export { FamineSystemPhase } from './FamineSystemPhase';
export { FoodSecurityDegradationPhase } from './FoodSecurityDegradationPhase';  // Phase 1B Refinement (Oct 17, 2025)
// export { ClimateImpactCascadePhase } from './ClimateImpactCascadePhase';  // CONSOLIDATED into ClimateSystemPhase (Batch 3, Nov 2025)
// Batch 3 (Nov 2025): Climate & Environmental Consolidation
export { ClimateSystemPhase } from './ClimateSystemPhase';  // Consolidates: Geoengineering, TippingPoint, EnvironmentalFeedback, ClimateImpactCascade
export { ClimateDeploymentPhase } from './ClimateDeploymentPhase';  // TIER 1 CRITICAL (Nov 2025): Climate tech phased deployment + energy constraints
export { ClimateDeploymentDelayPhase } from './ClimateDeploymentDelayPhase';  // TIER 1 CRITICAL (Nov 18, 2025): Three-delay model for realistic deployment
export { PermafrostCarbonPhase } from './PermafrostCarbonPhase';  // TIER 2 (Nov 28, 2025): Permafrost carbon feedback loop
export { ResourceSoilPhase } from './ResourceSoilPhase';  // Consolidates: Phosphorus, NovelEntities
export { ResourceWaterPhase } from './ResourceWaterPhase';  // Consolidates: Freshwater, OceanAcidification
export { BaselineMortalityPhase } from './BaselineMortalityPhase';  // Phase 34.8 (Nov 24, 2025) - Baseline demographic mortality
export { BayesianMortalityResolutionPhase } from './BayesianMortalityResolutionPhase';  // Phase 35 (Oct 27, 2025) - Centralized mortality resolution
export { AntimicrobialResistancePhase } from './AntimicrobialResistancePhase';  // TIER 1.8 (Oct 17, 2025)
export { MinimalSufferingPhase } from './MinimalSufferingPhase';  // Oct 19, 2025: Dystopia baseline measurement
export { DystopiaProgressionPhase } from './DystopiaProgressionPhase';
export { TriggeredEventsPhase } from './TriggeredEventsPhase';

// Batch 3: Special phases (medium risk)
export { BenchmarkEvaluationsPhase } from './BenchmarkEvaluationsPhase';
export { AIAdversarialDetectionPhase } from './AIAdversarialDetectionPhase';  // BATCH 2B (Nov 9, 2025): Consolidated gaming + sleeper detection
export { EnsembleMetaLearningPhase } from './EnsembleMetaLearningPhase';  // TIER 2 Phase 2C-E (Oct 20, 2025)
export { CrisisPointsPhase } from './CrisisPointsPhase';
export { EmergencyResponsePhase } from './EmergencyResponsePhase';  // FIX #11 (Oct 20, 2025)
export { ExogenousShockPhase } from './ExogenousShockPhase';  // Contingency & Agency Phase 2 (Oct 17, 2025)
export { CriticalJuncturePhase } from './CriticalJuncturePhase';  // Contingency & Agency Phase 3 (Oct 17, 2025)

// Batch 5: Final phases (37.x - 40.x, 98.x - 99.x)
// export { ExtinctionTriggersPhase } from './ExtinctionTriggersPhase';  // REMOVED: Consolidated into ExtinctionSystemPhase (Nov 26, 2025)
// export { ExtinctionProgressPhase } from './ExtinctionProgressPhase';  // REMOVED: Consolidated into ExtinctionSystemPhase (Nov 26, 2025)
export { TechnologyDiffusionPhase } from './TechnologyDiffusionPhase';
export { CatastrophicScenariosPhase } from './CatastrophicScenariosPhase';
export { EventCollectionPhase } from './EventCollectionPhase';
export { TimeAdvancementPhase } from './TimeAdvancementPhase';
export { TechDeploymentSchedulePhase } from './TechDeploymentSchedulePhase';  // Nov 25, 2025: Sequenced tech deployment

// === BATCH 5 CONSOLIDATED PHASES (Nov 9, 2025): Social & Governance (20 → 8 phases, -12 files) ===
export { GovernanceSystemPhase } from './GovernanceSystemPhase';  // Consolidated: GovernanceQualityPhase + GovernmentElectionPhase + PolicyImplementationPhase (order 10.0)
export { SocialStabilitySystemPhase } from './SocialStabilitySystemPhase';  // Consolidated: SocialStabilityPhase + SocialCohesionUpdatePhase + ParanoiaPhase + TrustRecoveryPhase (order 26.1)
export { CooperativeSystemsPhase } from './CooperativeSystemsPhase';  // Consolidated: CollectiveFormationPhase + CollectiveActionsPhase + CooperativeOwnershipPhase + CooperativeSpiralsPhase + UpwardSpiralsPhase (order 11.5)
export { InternationalRelationsPhase } from './InternationalRelationsPhase';  // Consolidated: DiplomaticAIPhase + ConflictResolutionPhase + MADDeterrencePhase + FlashWarEscalationPhase (order 13.0)

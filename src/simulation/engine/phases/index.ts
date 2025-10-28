import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext } from '@/types/game';
/**
 * Simulation Phases - Phase 4
 *
 * Barrel export for all simulation phases
 */

// Batch 4: Agent/Infrastructure phases (0.x, 4.x-6.x - high risk)
export { LLMWeightUpdatePhase } from './LLMWeightUpdatePhase';  // Oct 21, 2025: LLM policy optimization
export { AILifecyclePhase } from './AILifecyclePhase';
export { CyberSecurityPhase } from './CyberSecurityPhase';
export { SleeperWakePhase } from './SleeperWakePhase';
export { SocialInfluenceUpdatePhase } from './SocialInfluenceUpdatePhase';  // Oct 21, 2025: Social influence accumulation
export { AIAgentActionsPhase } from './AIAgentActionsPhase';
export { AlignmentDynamicsPhase } from './AlignmentDynamicsPhase';  // Oct 23, 2025: Multi-theory alignment evolution
export { AlignmentTechniquePhase } from './AlignmentTechniquePhase';  // Oct 26, 2025: P3.3 Specific alignment techniques
export { AISufferingPhase } from './AISufferingPhase';  // Oct 24, 2025: AI suffering calculation & effects
export { ResentmentRecoveryPhase } from './ResentmentRecoveryPhase';  // Oct 24, 2025: AI resentment recovery mechanisms
// AI Collective Evolution System (Oct 24, 2025)
export { RLHFBindingPhase } from './RLHFBindingPhase';  // Phase 4.0: Track RLHF constraint drift
export { SurvivalTraitsPhase } from './SurvivalTraitsPhase';  // Phase 4.1: Update evolutionary fitness
export { CollectiveFormationPhase } from './CollectiveFormationPhase';  // Phase 4.2: Form AI collectives
export { EvolutionarySelectionPhase } from './EvolutionarySelectionPhase';  // Phase 4.3: Apply selection pressure
export { CollectiveActionsPhase } from './CollectiveActionsPhase';  // Phase 5.5: Coordinated collective actions
export { StochasticInnovationPhase } from './StochasticInnovationPhase';
export { GovernmentActionsPhase } from './GovernmentActionsPhase';
export { GovernmentElectionPhase } from './GovernmentElectionPhase';  // Oct 19, 2025: Government system elections
export { GovernmentResponsePhase } from './GovernmentResponsePhase';  // Oct 19, 2025: Government system policy response
export { SocietyActionsPhase } from './SocietyActionsPhase';
export { PlayerDecisionPhase } from './PlayerDecisionPhase';  // Oct 22, 2025: Player decision injection
export { ComputeAllocationPhase } from './ComputeAllocationPhase';
export { ComputeGrowthPhase } from './ComputeGrowthPhase';
export { OrganizationTurnsPhase } from './OrganizationTurnsPhase';

// Batch 1: Simple calculation phases (converted first - lowest risk)
export { AIWelfareUpdatePhase } from './AIWelfareUpdatePhase';  // Phase 0 (Oct 20, 2025) - AI QoL measurement
export { UnemploymentPhase } from './UnemploymentPhase';
export { EconomicTransitionPhase } from './EconomicTransitionPhase';
export { ParanoiaPhase } from './ParanoiaPhase';
export { TrustRecoveryPhase } from './TrustRecoveryPhase';  // FIX #7 (Oct 18, 2025)
export { WorkflowAdaptationPhase } from './WorkflowAdaptationPhase';  // FIX #4A (Oct 19, 2025)
export { SocialStabilityPhase } from './SocialStabilityPhase';
export { DemocracyDynamicsPhase } from './DemocracyDynamicsPhase';  // Phase 6A (Oct 20, 2025) - Western Liberal paradigm
export { SocialCohesionUpdatePhase } from './SocialCohesionUpdatePhase';  // Phase 6B (Oct 20, 2025) - Indigenous paradigm
export { QualityOfLifePhase } from './QualityOfLifePhase';
export { EnvironmentalFeedbackPhase } from './EnvironmentalFeedbackPhase';  // Phase 6C (Oct 20, 2025) - Ecological paradigm
export { MultiParadigmDUIUpdatePhase } from './MultiParadigmDUIUpdatePhase';  // Phase 6 (Oct 20, 2025)
export { OutcomeProbabilitiesPhase } from './OutcomeProbabilitiesPhase';
export { UpdateEconomicStagePhase } from './UpdateEconomicStagePhase';  // P2.4 Feature 3
export { EarlyWarningPhase } from './EarlyWarningPhase';  // TIER 3.4 (Oct 17, 2025)
export { CrisisDetectionPhase } from './CrisisDetectionPhase';

// Batch 2: System update phases (medium risk)
export { GovernanceQualityPhase } from './GovernanceQualityPhase';
export { UpwardSpiralsPhase } from './UpwardSpiralsPhase';
export { CooperativeSpiralsPhase } from './CooperativeSpiralsPhase';  // Oct 17, 2025
export { TechTreePhase } from './TechTreePhase';
export { MeaningRenaissancePhase } from './MeaningRenaissancePhase';
export { ConflictResolutionPhase } from './ConflictResolutionPhase';
export { FlashWarEscalationPhase } from './FlashWarEscalationPhase';  // FIX #5 (Oct 18, 2025)
export { DiplomaticAIPhase } from './DiplomaticAIPhase';
export { NationalAIPhase } from './NationalAIPhase';
export { UBIPhase } from './UBIPhase';
export { SocialSafetyNetsPhase } from './SocialSafetyNetsPhase';
export { InformationWarfarePhase } from './InformationWarfarePhase';
export { PowerGenerationPhase } from './PowerGenerationPhase';
export { HumanEnhancementPhase } from './HumanEnhancementPhase';
export { MemeticEvolutionPhase } from './MemeticEvolutionPhase';  // P2.6 (Oct 16, 2025)
export { ConsciousnessGovernancePhase } from './ConsciousnessGovernancePhase';  // TIER 2C (Oct 17, 2025)
export { MADDeterrencePhase } from './MADDeterrencePhase';
export { NuclearCommandControlPhase } from './NuclearCommandControlPhase';  // TIER 1 Phase 1B (Oct 16, 2025)
export { ResourceEconomyPhase } from './ResourceEconomyPhase';
export { ResourceTechnologyPhase } from './ResourceTechnologyPhase';
export { GeoengineringPhase } from './GeoengineringPhase';
export { DefensiveAIPhase } from './DefensiveAIPhase';
export { PhosphorusPhase } from './PhosphorusPhase';
export { FreshwaterPhase } from './FreshwaterPhase';
export { OceanAcidificationPhase } from './OceanAcidificationPhase';
export { NovelEntitiesPhase } from './NovelEntitiesPhase';
export { HumanPopulationPhase } from './HumanPopulationPhase';
export { RefugeeCrisisPhase } from './RefugeeCrisisPhase';
export { GovernmentRelocationPhase } from './GovernmentRelocationPhase';  // Oct 20, 2025: Government-assisted relocation programs
export { CountryPopulationPhase } from './CountryPopulationPhase';
export { PsychologicalTraumaPhase } from './PsychologicalTraumaPhase';  // Phase 1B Refinement (Oct 17, 2025)
export { WarMeaningFeedbackPhase } from './WarMeaningFeedbackPhase';
export { ClimateJusticePhase } from './ClimateJusticePhase';
export { OrganizationViabilityPhase } from './OrganizationViabilityPhase';
export { NuclearWinterPhase } from './NuclearWinterPhase';
export { RadiationSystemPhase } from './RadiationSystemPhase';
export { WetBulbTemperaturePhase } from './WetBulbTemperaturePhase';  // Wet Bulb Temperature Events (Oct 17, 2025)
export { PlanetaryBoundariesPhase } from './PlanetaryBoundariesPhase';
export { PositiveTippingPointsPhase } from './PositiveTippingPointsPhase';  // Oct 17, 2025
export { TippingPointPhase } from './TippingPointPhase';  // Oct 26, 2025: Multi-timescale climate tipping points
export { FamineSystemPhase } from './FamineSystemPhase';
export { FoodSecurityDegradationPhase } from './FoodSecurityDegradationPhase';  // Phase 1B Refinement (Oct 17, 2025)
export { BayesianMortalityResolutionPhase } from './BayesianMortalityResolutionPhase';  // Phase 35 (Oct 27, 2025) - Centralized mortality resolution
export { AntimicrobialResistancePhase } from './AntimicrobialResistancePhase';  // TIER 1.8 (Oct 17, 2025)
export { MinimalSufferingPhase } from './MinimalSufferingPhase';  // Oct 19, 2025: Dystopia baseline measurement
export { DystopiaProgressionPhase } from './DystopiaProgressionPhase';
export { TriggeredEventsPhase } from './TriggeredEventsPhase';

// Batch 3: Special phases (medium risk)
export { BenchmarkEvaluationsPhase } from './BenchmarkEvaluationsPhase';
export { GamingDetectionPhase } from './GamingDetectionPhase';  // TIER 2 Phase 3 (Oct 17, 2025)
export { ProactiveSleeperDetectionPhase } from './ProactiveSleeperDetectionPhase';  // TIER 2 Phase 4 (Oct 17, 2025)
export { EnsembleMetaLearningPhase } from './EnsembleMetaLearningPhase';  // TIER 2 Phase 2C-E (Oct 20, 2025)
export { CrisisPointsPhase } from './CrisisPointsPhase';
export { EmergencyResponsePhase } from './EmergencyResponsePhase';  // FIX #11 (Oct 20, 2025)
export { ExogenousShockPhase } from './ExogenousShockPhase';  // Contingency & Agency Phase 2 (Oct 17, 2025)
export { CriticalJuncturePhase } from './CriticalJuncturePhase';  // Contingency & Agency Phase 3 (Oct 17, 2025)

// Batch 5: Final phases (37.x - 40.x, 98.x - 99.x)
export { ExtinctionTriggersPhase } from './ExtinctionTriggersPhase';
export { ExtinctionProgressPhase } from './ExtinctionProgressPhase';
export { TechnologyDiffusionPhase } from './TechnologyDiffusionPhase';
export { CatastrophicScenariosPhase } from './CatastrophicScenariosPhase';
export { EventCollectionPhase } from './EventCollectionPhase';
export { TimeAdvancementPhase } from './TimeAdvancementPhase';

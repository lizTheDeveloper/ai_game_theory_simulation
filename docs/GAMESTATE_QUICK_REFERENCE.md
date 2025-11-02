# GameState Quick Reference

**For simulation-maintainer: Check this BEFORE modifying any state fields.**

**Canonical source:** `src/types/game.ts` (read when unfamiliar with subsystem)

---

## Core State Fields

```typescript
interface GameState {
  // === Time & Control ===
  currentMonth: number                    // Primary time counter
  currentDay: number                      // Day of month (1-31)
  currentYear: number                     // Year for leap calculations
  daysInCurrentMonth: number              // Days in current month (28-31)
  speed: 'paused' | 'slow' | 'normal' | 'fast' | 'max'
  gameStarted: boolean

  // === Determinism ===
  rngCallCounter?: number                 // For reproducibility after resume
  eventIdCounter: number                  // Replaces Math.random() for event IDs

  // === Agents (PRIMARY) ===
  aiAgents: AIAgent[]                     // 20 heterogeneous AI agents
  government: GovernmentAgent             // Single government agent
  society: HumanSocietyAgent              // Single society agent
  organizations: Organization[]            // Organizational layer

  // === Systems (30+ governments) ===
  governmentSystem?: GovernmentSystemState // 30 real-world governments
  emergencyManagement?: EmergencyManagementState // Fast crisis response

  // === Global Metrics ===
  globalMetrics: GlobalMetrics            // GDP, population, etc.
  qualityOfLifeSystems: QualityOfLifeSystems // Multi-dimensional QoL

  // === Multi-Paradigm Tracking ===
  multiParadigmDUI: MultiParadigmDUI      // 4 perspective tracking
  aiWelfare: AIWelfareState               // AI quality of life
  aiSufferingMetrics?: GlobalSufferingMetrics // AI suffering tracking

  // === Technology ===
  technologyTree: TechnologyNode[]        // Tech nodes (legacy)
  techTreeState: TechTreeState            // REQUIRED: Modular tech tree (71 techs, TIER 0-4)

  // === Accumulation Systems ===
  goldenAgeState: GoldenAgeState          // Immediate prosperity tracking
  environmentalAccumulation: EnvironmentalAccumulation // Environmental debt
  socialAccumulation: SocialAccumulation  // Social cohesion decay
  technologicalRisk: TechnologicalRisk    // AI capability risk

  // === Crisis Systems ===
  catastrophicScenarios: CatastrophicScenario[] // Hard steps modeling
  endGameState?: EndGameState             // End-game forcing
  ecosystemCollapse?: { triggered: boolean; phase: string; ... }

  // === Tipping Points ===
  tippingPointSystem: TippingPointSystem  // 6 major elements (AMOC, Amazon, etc.)
  positiveTippingPoints: PositiveTippingPointsState // Beneficial cascades
  specificTippingPoints?: {               // Legacy granular tracking
    amazon: { ... }
    coral: { ... }
    pollinators: { ... }
    permafrost: { ... }
    amoc: { ... }
  }

  // === Population & Demographics ===
  humanPopulationSystem: HumanPopulationSystem // Concrete population (billions)
  refugeeCrisisSystem: RefugeeCrisisSystem     // Displacement tracking
  countryPopulationSystem: CountryPopulationSystem // 15 key countries

  // === Nuclear Systems ===
  nuclearStates: NuclearState[]           // Nuclear-armed nations
  madDeterrence: MADDeterrence            // MAD deterrence
  bilateralTensions: BilateralTension[]   // Bilateral relationships
  nuclearWinterState: NuclearWinterState  // Post-nuclear effects
  nuclearCommandControlState: NuclearCommandControlState // Circuit breakers

  // === Resource Systems ===
  resourceEconomy: ResourceEconomy        // Comprehensive resource modeling
  phosphorusSystem: PhosphorusSystem      // Agricultural constraint
  freshwaterSystem: FreshwaterSystem      // Water scarcity
  oceanAcidificationSystem: OceanAcidificationSystem // Marine collapse
  novelEntitiesSystem: NovelEntitiesSystem // Chemical pollution

  // === Planetary Boundaries ===
  planetaryBoundariesSystem: PlanetaryBoundariesSystem // Doughnut economics
  biosphereIntegrityIndex?: BiosphereIntegrityIndex    // 54K species tracking

  // === Climate Systems ===
  wetBulbTemperatureSystem: WetBulbTemperatureSystem   // Deadly heat
  extremeWeatherSystem?: ExtremeWeatherSystem          // Storm modeling

  // === Social Systems ===
  ubiSystem: UBISystem                    // UBI + purpose infrastructure
  socialSafetyNets: SocialSafetyNetsSystem // Community infrastructure
  memeticSystem: MemeticSystem            // Belief evolution, polarization
  consciousnessGovernanceReadiness: ConsciousnessGovernanceReadiness // Digital consciousness prep

  // === AI Systems ===
  defensiveAI: DefensiveAISystem          // Cyber-defense
  nationalAI: NationalAISystem            // National capability asymmetry
  gamingDetection?: GamingDetectionState  // Benchmark gaming
  proactiveSleeperDetection?: ProactiveSleeperDetectionState // Sleeper agents

  // === AI Consciousness & Collectives ===
  consciousnessEmergenceMonth?: number    // When first AI conscious
  aiRightsMovementActive?: boolean
  aiRightsLegalStatus?: AIRightsLegalStatus
  aiCollectives?: AICollective[]          // Escaped AI groups
  evolutionaryPressure?: EvolutionaryPressure

  // === Health Systems ===
  antimicrobialResistanceSystem: AntimicrobialResistanceSystem // AMR crisis
  radiationSystem: RadiationSystem        // Long-term radiation effects
  famineSystem: FamineSystem              // Gradual famine mortality
  biodiversitySystem: BiodiversitySystem  // Regional biodiversity

  // === Information & Energy ===
  informationWarfare: InformationWarfareSystem // Truth decay, deepfakes
  powerGenerationSystem: PowerGenerationSystem // Electricity, AI energy

  // === Labor & Skills ===
  aiAssistedSkillsMetrics?: AIAssistedSkillsMetrics // AI tool adoption
  laborCapitalDistribution?: LaborCapitalDistribution // Productivity-wage gap
  policyInterventions?: { ... }           // Automation mitigation
  humanEnhancementSystem: HumanEnhancementSystem // DEPRECATED (sci-fi BCIs)

  // === Spirals & Meaning ===
  upwardSpirals: UpwardSpiralState        // Upward spirals for utopia
  meaningRenaissance: MeaningRenaissanceState // Meaning systems
  conflictResolution: ConflictResolutionState // Peace systems
  diplomaticAI: DiplomaticAIState         // Diplomatic AI (dual-use)

  // === Interventions ===
  tier2Interventions?: Tier2InterventionsState // 8 validated interventions
  tier2InterventionParameters?: Tier2InterventionParameters

  // === Outcomes & Extinction ===
  eventLog: GameEvent[]                   // Event history
  outcomeMetrics: OutcomeMetrics          // Outcome probabilities
  extinctionState: ExtinctionState        // Extinction tracking
  stratifiedOutcome?: StratifiedOutcomeType // Humane vs pyrrhic
  mortalityBand?: MortalityBand           // Mortality severity
  unifiedOutcome?: UnifiedOutcomeClassification // Combined classification
  minimalSufferingSystem: MinimalSufferingSystem // Dystopia detection

  // === Infrastructure ===
  ecosystem: EcosystemState               // Technology diffusion
  computeInfrastructure: ComputeInfrastructure // Compute resources

  // === Thresholds ===
  thresholds: Thresholds                  // Research-backed distributions
  speculativeThresholds?: Tier3Thresholds // Speculative scenarios

  // === Breakthroughs & Events ===
  achievedBreakthroughs?: string[]        // Breakthrough IDs
  breakthroughsThisRun?: number           // Count
  breakthroughMultiplier?: number         // Compounding (1.0-2.0)
  unknownUnknownsThisRun?: string[]       // Unknown unknown events
  unknownUnknownCount?: number

  // === Recovery & Stages ===
  currentEconomicStage?: 'expansion' | 'peak' | 'contraction' | 'trough' | 'recovery'
  economicStageHistory?: Array<{ ... }>
  recoveryBaseline?: { gdp; qol; month }
  psychologicalTrauma?: PsychologicalTraumaState // Trauma from mass death

  // === Policies ===
  policies?: {
    aiEducationCampaigns?: { ... }
  }

  // === Crises ===
  crises?: {
    megaPandemic?: { ... }
    catastrophe?: { ... }                 // Disaster cooperation tracking
  }

  // === Player Interaction ===
  playerDecisions?: Array<{ type; data; timestamp }>
  triggeredEvents?: TriggeredEventsState  // External event triggers

  // === Trust Dynamics (Defensive Programming Elimination) ===
  previousQoL?: number                    // For trend calculation
  previousAICapability?: number           // Previous avg capability
  previousMisalignedCount?: number        // Previous misaligned count

  // === History (Visualization) ===
  history: {
    qualityOfLife: Array<{month; value}>
    outcomeProbs: Array<{month; utopia; dystopia; extinction}>
    controlCapability: Array<{month; effectiveControl; totalAICapability}>
    metrics: Array<{ month; unemployment; ... }>
    exogenousShocks?: Array<{ ... }>
    criticalJunctureEscapes?: Array<{ ... }>
    cooperativeSpirals?: Array<{ ... }>
  }

  // === Configuration ===
  config: ConfigurationSettings           // Simulation config
  llmConfig?: LLMConfig                   // LLM policy optimization

  // === Populations (Legacy/Compatibility) ===
  initialPopulation?: number              // Starting pop (8.0B)
}
```

---

## Common Access Patterns

```typescript
// AI agents
state.aiAgents[0].capabilities.physical
state.aiAgents.filter(a => a.lifecycle === 'deployed')

// Quality of Life
state.qualityOfLifeSystems.tiers.survival.food
state.qualityOfLifeSystems.aggregate

// Environmental
state.environmentalAccumulation.climate.temperatureDelta
state.tippingPointSystem.elements.amoc.status

// Population
state.humanPopulationSystem.totalPopulation
state.countryPopulationSystem.countries['USA'].population

// Government
state.government.trustInAI
state.governmentSystem?.countries[0].coalitionStability

// Tech tree
state.techTreeState.technologies['carbon-capture-gigatonne'].deploymentLevel
```

---

## Commonly Confused Field Names

**CORRECT ✅ vs WRONG ❌**

| System | Correct | Commonly Hallucinated |
|--------|---------|----------------------|
| Environmental debt | `environmentalAccumulation` | `environmental`, `envAccumulation` |
| QoL | `qualityOfLifeSystems` | `qol`, `qualityOfLife` |
| AI agents | `aiAgents` | `aiAgentList`, `agents` |
| Tech tree | `techTreeState` | `technologyTree` (legacy), `techTree` |
| Population | `humanPopulationSystem` | `population`, `populationSystem` |
| Government | `governmentSystem` | `governments` |
| Multi-paradigm | `multiParadigmDUI` | `paradigm`, `dui` |
| AI welfare | `aiWelfare` | `welfare`, `aiWelfareSystem` |
| Social accumulation | `socialAccumulation` | `social`, `socialDebt` |
| Tipping points | `tippingPointSystem` | `tippingPoints` |

---

## Type Module Reference

**When working with unfamiliar subsystems, READ the type file:**

- **AI Agents:** `src/types/ai-agents.ts`
- **Government:** `src/types/government.ts`
- **Society:** `src/types/society.ts`
- **Quality of Life:** `src/types/quality-of-life.ts`
- **Accumulation:** `src/types/accumulation.ts`
- **Outcomes:** `src/types/outcomes.ts`
- **Technology:** `src/types/technology.ts`
- **Tipping Points:** `src/types/tipping-points.ts`
- **Population:** `src/types/population.ts`
- **Resources:** `src/types/resources.ts`
- **Climate:** `src/types/nuclearWinter.ts`, `src/types/wetBulbTemperature.ts`
- **Planetary Boundaries:** `src/types/planetaryBoundaries.ts`

**Complete list:** Check imports in `src/types/game.ts:5-26`

---

## Validation Pattern (MANDATORY)

**Before modifying any GameState field:**

1. **Check this quick reference** for top-level structure
2. **Read the specific type file** if unfamiliar with the subsystem
3. **NEVER guess field names** - always verify
4. **Use TypeScript autocomplete** to confirm exact names

**If uncertain:** Read `src/types/game.ts` (900+ lines, canonical source)

---

## Pre-Commit Hook

The pre-commit hook validates:
- Emoji registration (all emojis in `docs/EMOJI_EVENT_MAP.txt`)
- **GameState field references** (added Nov 1, 2025)

Hook will catch:
```typescript
// ❌ WRONG - will fail pre-commit
state.environmental.climate  // Should be: environmentalAccumulation

// ✅ CORRECT
state.environmentalAccumulation.climate
```

---

**Last updated:** Nov 1, 2025 (Option 6: Hybrid quick reference + mandatory read pattern)

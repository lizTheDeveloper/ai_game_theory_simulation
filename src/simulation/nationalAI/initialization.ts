/**
 * National AI System Initialization
 *
 * Creates initial state for national AI capabilities, race dynamics,
 * and international cooperation systems.
 */

import {
  NationalAISystem,
  NationalAICapability,
  NationName,
  NATIONAL_AI_BASELINES_2023,
} from '@/types/nationalAI';

/**
 * Initialize national AI system with baseline capabilities (2023)
 */
export function initializeNationalAI(): NationalAISystem {
  const nations: NationalAICapability[] = [];

  // Initialize all 9 nations from baselines
  for (const [nationName, baseline] of Object.entries(NATIONAL_AI_BASELINES_2023)) {
    nations.push({
      nation: nationName as NationName,

      // Capability sources (start with indigenous only)
      indigenousCapability: baseline.indigenousCapability,
      openSourceCapability: 0, // No open source yet
      stolenCapability: 0,
      commercialAccess: baseline.indigenousCapability, // Can access own models

      effectiveCapability: baseline.indigenousCapability,

      // Strategic position
      leading: nationName === 'United States',
      gap: 0,
      gapFromUS: 0,
      gapFromChina: 0,

      // Resources
      computeAccess: baseline.computeAccess,
      talentPool: baseline.talentPool,
      investmentLevel: baseline.investmentLevel,

      // TIER 1.4: Safety & Regulation
      regulationLevel: nationName === 'European Union' ? 0.70 : nationName === 'United States' ? 0.50 : nationName === 'China' ? 0.30 : 0.40,
      safetyInvestment: 0.15, // 15% of budget initially
      deploymentThreshold: 0.70, // 70% safety threshold

      // Policy
      exportControls: {
        restrictedModels: [],
        modelsDeniedTo: baseline.exportControlTarget ? [] : ['China', 'Russia'] as NationName[],
        chipsDeniedTo: baseline.exportControlTarget ? [] : ['China', 'Russia'] as NationName[],
        cloudsDeniedTo: baseline.exportControlTarget ? [] : ['China', 'Russia'] as NationName[],
        enforcementLevel: 0.7, // 70% enforcement
        leakProbability: 0.1, // 10% circumvention
      },

      // Military
      militaryAI: 0,
      nuclearIntegration: 0,

      // Domestic presence (will be updated as orgs/AIs spawn)
      domesticLabs: [],
      domesticModels: [],
    });
  }

  return {
    nations,

    globalLeader: 'United States',
    globalFrontier: 1.0, // GPT-4 level

    openSourceFrontier: {
      frontierCapability: 0.7, // Llama 2 level (70% of GPT-4)
      lagBehindClosed: 6, // 6 months behind
      openSourceModels: [],
      contributions: {
        'United States': 0.7,
        'China': 0,
        'United Kingdom': 0,
        'European Union': 0.3, // Mistral
        'Russia': 0,
        'Israel': 0,
        'India': 0,
        'South Korea': 0,
        'Japan': 0,
      },
    },

    espionage: {
      chinaTheftAttempts: 0,
      chinaSuccessfulThefts: 0,
      russiaTheftAttempts: 0,
      russiaSuccessfulThefts: 0,
      accidentalLeaks: [],
      baseTheftRate: 0.01 / 12, // 1% per year = 0.083% per month
      modelCountFactor: 1.0,
      securityLevelFactor: 1.0,
      stateSponsoredMultiplier: 10,
    },

    raceIntensity: {
      capabilityGap: 0.2, // US ahead by 20%
      usLeading: true,
      chinaLeading: false,
      bilateralTension: 0.5,
      nuclearFlashpoints: 0,
      militaryAIDeployed: false,
      autonomousWeapons: false,
      exportControlsActive: true,
      chinaAccelerating: false,
      raceIntensity: 0.3, // Moderate
      gapContribution: 0.1,
      tensionContribution: 0.15,
      militaryContribution: 0.05,
    },

    cooperationAgreement: null,

    // TIER 1.4: First-mover advantage (US currently leading)
    firstMoverAdvantage: {
      leaderEconomicBonus: 0.15, // US gets 15% GDP boost from AI leadership
      marketShareCapture: 0.60, // US controls 60% of global AI market
      standardSetter: 'United States',
      standardAdoption: 0.70, // 70% of world follows US AI standards
      networkEffectStrength: 0.50, // Moderate lock-in from ecosystem
      switchingCosts: 0.40, // Moderate cost to switch to Chinese AI
      dataAdvantage: 0.65, // Strong data access (Big Tech platforms)
      talentAttraction: 0.75, // Strong talent magnet (Silicon Valley)
    },

    // TIER 1.4: Regulatory arbitrage (starting moderate)
    regulatoryArbitrage: {
      strictestRegulation: 0.70, // EU AI Act
      laxestRegulation: 0.20, // Russia/China
      regulatorySpread: 0.50, // 50-point gap creates arbitrage pressure
      companiesMigrated: [],
      raceToBottomIntensity: 0.30, // Moderate pressure
      safetyErosion: 0.10, // 10% degradation from baseline
      harmonizationLevel: 0.20, // Low global coordination (2025 baseline)
    },

    significantEvents: [],
  };
}

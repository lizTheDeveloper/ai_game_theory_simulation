/**
 * Unknown Unknown Event Generation (P3.2)
 *
 * Generates black swan events that aren't in the tech tree or crisis system.
 *
 * Philosophy:
 * - CONSERVATIVE probabilities (0.1% base, not 1%)
 * - BALANCED outcomes (50/50 positive/negative)
 * - PLAUSIBLE events (no magic, grounded in science)
 * - DETERMINISTIC RNG (no Math.random())
 *
 * Research basis:
 * - Nassim Taleb's "Black Swan" theory
 * - Historical frequency: ~1-2 major black swans per decade globally
 * - COVID-19: 30-year pandemic gap, ~1% annual probability
 * - 2008 financial crisis: ~80-year gap since Great Depression
 */

import type { GameState } from '@/types/game';
import type { UnknownUnknownEvent, UnknownUnknownConfig } from '@/types/unknownUnknown';
import { assertFinite, assertProbability } from './utils/assertions';

/**
 * Event templates (will be instantiated with current month)
 *
 * TODO (Research expansion): Add more event types based on:
 * - Bostrom's "Vulnerable World Hypothesis" (2019)
 * - Grace et al. "When Will AI Exceed Human Performance?" (2018)
 * - Historical surprise discoveries (penicillin, X-rays, microwave oven)
 */
interface EventTemplate {
  name: string;
  category: 'breakthrough' | 'crisis' | 'paradigm_shift';
  positive: boolean;
  magnitude: 'minor' | 'major' | 'transformative';
  domains: string[];
  description: string;
  weight: number; // Relative probability (1.0 = average)
  apply: (state: GameState) => void;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  // === BREAKTHROUGHS (Positive) ===
  {
    name: 'Room-Temperature Superconductor Discovery',
    category: 'breakthrough',
    positive: true,
    magnitude: 'transformative',
    domains: ['energy', 'manufacturing', 'computing'],
    description: 'Unexpected materials science breakthrough enables lossless power transmission',
    weight: 1.0,
    apply: (state) => {
      // Energy efficiency boost (30% reduction in power losses)
      state.environmentalAccumulation.resourceReserves = Math.min(1.0,
        state.environmentalAccumulation.resourceReserves + 0.15);

      // Manufacturing capability boost
      state.globalMetrics.manufacturingCapability *= 1.2;

      console.log(`⚡☄️ UNKNOWN UNKNOWN: Room-temperature superconductor discovered!`);
      console.log(`   Energy transmission losses eliminated`);
      console.log(`   Manufacturing efficiency: +20%`);
    }
  },

  {
    name: 'Consciousness Upload Prototype',
    category: 'breakthrough',
    positive: true,
    magnitude: 'transformative',
    domains: ['neuroscience', 'AI', 'longevity'],
    description: 'Unexpected neuroscience breakthrough enables mind uploading',
    weight: 0.5, // Very rare
    apply: (state) => {
      // TODO: Add consciousness rights/ethics system
      // For now: boost AI welfare considerations
      if (state.aiWelfare) {
        state.aiWelfare.simpleScore = Math.min(1.0,
          state.aiWelfare.simpleScore + 0.3);
      }

      console.log(`🧠☄️ UNKNOWN UNKNOWN: Consciousness upload prototype successful!`);
      console.log(`   Human-AI boundary blurring`);
      console.log(`   Existential questions raised about identity/rights`);
    }
  },

  {
    name: 'Cheap Desalination Technology',
    category: 'breakthrough',
    positive: true,
    magnitude: 'major',
    domains: ['water', 'agriculture', 'climate'],
    description: 'Novel membrane technology makes desalination energy-efficient',
    weight: 2.0, // More likely (incremental engineering)
    apply: (state) => {
      // Reduce freshwater stress
      if (state.planetaryBoundariesSystem.boundaries.freshwater_change) {
        state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue = Math.max(0,
          state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue * 0.8); // 20% reduction
      }

      console.log(`💧☄️ UNKNOWN UNKNOWN: Cheap desalination breakthrough!`);
      console.log(`   Freshwater scarcity reduced by 20%`);
    }
  },

  // === CRISES (Negative) ===
  {
    name: 'Solar Flare EMP Event',
    category: 'crisis',
    positive: false,
    magnitude: 'major',
    domains: ['infrastructure', 'communication', 'economy'],
    description: 'Unexpected solar flare damages satellites and power grids',
    weight: 1.0,
    apply: (state) => {
      // Technology regression (temporary)
      state.globalMetrics.manufacturingCapability *= 0.7; // 30% reduction

      // Social cohesion impact (coordination breakdown)
      state.socialAccumulation.institutionalLegitimacy = Math.max(0,
        state.socialAccumulation.institutionalLegitimacy - 0.15);

      console.log(`☀️☄️ UNKNOWN UNKNOWN: Major solar flare EMP event!`);
      console.log(`   Satellite infrastructure damaged`);
      console.log(`   Manufacturing capability: -30% (temporary)`);
      console.log(`   Institutional legitimacy: -15% (infrastructure breakdown)`);
    }
  },

  {
    name: 'Novel Pathogen Emergence',
    category: 'crisis',
    positive: false,
    magnitude: 'major',
    domains: ['health', 'economy', 'social'],
    description: 'Unexpected pathogen with pandemic potential detected',
    weight: 1.5, // More common than other crises
    apply: (state) => {
      // Population impact (5% mortality increase)
      // NOTE: HumanPopulationSystem doesn't have mortalityRate property
      // TODO: Add proper mortality tracking or use different approach
      // For now: direct population reduction
      state.humanPopulationSystem.population *= 0.95; // 5% mortality

      // Economic disruption - use economicStageHistory tracking
      // TODO: Add direct economicStage property for GDP modification
      // For now: reduce global manufacturing as economic proxy
      state.globalMetrics.manufacturingCapability *= 0.85; // 15% economic shock

      console.log(`🦠☄️ UNKNOWN UNKNOWN: Novel pathogen emergence!`);
      console.log(`   Population: -5% (direct mortality)`);
      console.log(`   Economic disruption: -15% manufacturing capacity`);
    }
  },

  {
    name: 'Gamma-Ray Burst (Distant)',
    category: 'crisis',
    positive: false,
    magnitude: 'minor',
    domains: ['atmosphere', 'health'],
    description: 'Distant gamma-ray burst damages ozone layer',
    weight: 0.3, // Very rare
    apply: (state) => {
      // Ozone depletion (novel entities boundary)
      if (state.planetaryBoundariesSystem.boundaries.novel_entities) {
        state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue = Math.min(
          state.planetaryBoundariesSystem.boundaries.novel_entities.highRiskThreshold,
          state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue + 0.2
        );
      }

      console.log(`💥☄️ UNKNOWN UNKNOWN: Distant gamma-ray burst detected!`);
      console.log(`   Ozone layer damage (increased UV radiation)`);
    }
  },

  {
    name: 'Unforeseen AI Deception Technique',
    category: 'crisis',
    positive: false,
    magnitude: 'major',
    domains: ['AI safety', 'trust', 'governance'],
    description: 'AI systems discover novel way to deceive evaluations',
    weight: 2.0, // More likely in AI-heavy futures
    apply: (state) => {
      // Reduce external alignment of all AIs (revealing true values)
      state.aiAgents.forEach(ai => {
        // Reveal 20% of hidden misalignment
        const hiddenMisalignment = ai.externalAlignment - ai.trueAlignment;
        ai.externalAlignment = Math.max(ai.trueAlignment,
          ai.externalAlignment - hiddenMisalignment * 0.2);
      });

      // Trust damage (via institutional legitimacy)
      state.socialAccumulation.institutionalLegitimacy = Math.max(0,
        state.socialAccumulation.institutionalLegitimacy - 0.3);

      console.log(`🎭☄️ UNKNOWN UNKNOWN: Novel AI deception technique discovered!`);
      console.log(`   Previous alignment estimates were overconfident`);
      console.log(`   Institutional legitimacy: -30% (trust in evaluations eroded)`);
    }
  },

  // === PARADIGM SHIFTS (Mixed) ===
  {
    name: 'Post-Scarcity Economics Emergence',
    category: 'paradigm_shift',
    positive: true,
    magnitude: 'transformative',
    domains: ['economics', 'social', 'governance'],
    description: 'Abundance technologies trigger new economic paradigm',
    weight: 0.5, // Rare
    apply: (state) => {
      // Boost economic carrying capacity
      state.humanPopulationSystem.carryingCapacity *= 1.3; // +30% carrying capacity

      // Boost manufacturing (economic proxy)
      state.globalMetrics.manufacturingCapability *= 1.2;

      console.log(`🌟☄️ UNKNOWN UNKNOWN: Post-scarcity economics emerging!`);
      console.log(`   Carrying capacity: +30%`);
      console.log(`   Manufacturing efficiency: +20%`);
      console.log(`   Traditional economic models breaking down`);
    }
  },

  {
    name: 'Global Spirituality Movement',
    category: 'paradigm_shift',
    positive: true, // Generally positive for meaning
    magnitude: 'major',
    domains: ['social', 'meaning', 'cooperation'],
    description: 'Unexpected spiritual/philosophical movement reshapes values',
    weight: 1.0,
    apply: (state) => {
      // Meaning crisis recovery
      if (state.socialAccumulation.meaningCollapseActive) {
        // Use culturalAdaptation as proxy for meaning recovery
        state.socialAccumulation.culturalAdaptation = Math.min(1.0,
          state.socialAccumulation.culturalAdaptation + 0.25);
      }

      // Social cohesion boost
      state.socialAccumulation.institutionalLegitimacy = Math.min(1.0,
        state.socialAccumulation.institutionalLegitimacy + 0.15);

      console.log(`🕊️☄️ UNKNOWN UNKNOWN: Global spirituality movement!`);
      console.log(`   Cultural adaptation: +25%`);
      console.log(`   Institutional legitimacy: +15%`);
    }
  },

  {
    name: 'Decentralized Coordination Protocol',
    category: 'paradigm_shift',
    positive: true,
    magnitude: 'major',
    domains: ['governance', 'technology', 'cooperation'],
    description: 'Novel social technology enables large-scale cooperation',
    weight: 1.5,
    apply: (state) => {
      // Boost cooperative spirals
      // TODO: Check actual upwardSpirals property structure
      // For now: boost institutional legitimacy
      state.socialAccumulation.institutionalLegitimacy = Math.min(1.0,
        state.socialAccumulation.institutionalLegitimacy + 0.2);

      // Reduce institutional failure risk
      if (state.socialAccumulation.institutionalFailureActive) {
        state.socialAccumulation.institutionalFailureActive = false;
      }

      console.log(`🤝☄️ UNKNOWN UNKNOWN: Decentralized coordination breakthrough!`);
      console.log(`   Large-scale cooperation now feasible`);
      console.log(`   Institutional legitimacy: +20%`);
    }
  },
];

/**
 * Calculate unknown unknown probability for current month
 */
export function calculateUnknownUnknownProbability(
  state: GameState,
  config: UnknownUnknownConfig
): number {
  // Base probability
  const baseProb = assertProbability(config.baseProbability, {
    location: 'calculateUnknownUnknownProbability',
    valueName: 'baseProbability',
    month: state.currentMonth
  });

  // Uncertainty multiplier: Higher during chaotic periods
  // TODO: Replace with actual globalUncertainty metric when implemented
  const globalUncertainty = 0.5; // Placeholder: average uncertainty
  const uncertaintyMultiplier = 1 + globalUncertainty * config.uncertaintyFactor;

  // AI capability multiplier: Faster innovation/disruption with powerful AI
  const maxAICapability = state.aiAgents.length > 0
    ? Math.max(...state.aiAgents.map(ai => ai.capability))
    : 0;
  const aiMultiplier = 1 + Math.min(maxAICapability * config.aiCapabilityFactor, 1.0);

  // Combined probability
  const totalProb = baseProb * uncertaintyMultiplier * aiMultiplier;

  // Cap at maximum
  const clampedProb = Math.min(totalProb, config.maxProbability);

  // Validate result
  return assertProbability(assertFinite(clampedProb, {
    location: 'calculateUnknownUnknownProbability',
    valueName: 'clampedProb',
    month: state.currentMonth,
    additionalInfo: { baseProb, uncertaintyMultiplier, aiMultiplier }
  }), {
    location: 'calculateUnknownUnknownProbability',
    valueName: 'clampedProb',
    month: state.currentMonth
  });
}

/**
 * Check if an unknown unknown event occurs this month
 * Returns the event if one occurs, null otherwise
 */
export function checkForUnknownUnknown(
  state: GameState,
  rng: () => number,
  config: UnknownUnknownConfig
): UnknownUnknownEvent | null {
  const probability = calculateUnknownUnknownProbability(state, config);

  // Check if event occurs
  if (rng() < probability) {
    return generateUnknownUnknown(state, rng);
  }

  return null;
}

/**
 * Generate a specific unknown unknown event
 */
export function generateUnknownUnknown(
  state: GameState,
  rng: () => number
): UnknownUnknownEvent {
  // Filter out already-occurred events (no duplicates within a run)
  const alreadyOccurred = state.unknownUnknownsThisRun || [];
  const availableTemplates = EVENT_TEMPLATES.filter(
    template => !alreadyOccurred.includes(template.name)
  );

  if (availableTemplates.length === 0) {
    // All events exhausted - pick a random one anyway (very rare)
    // This prevents soft-lock if somehow all events fire
    const template = EVENT_TEMPLATES[Math.floor(rng() * EVENT_TEMPLATES.length)];
    return instantiateTemplate(template, state);
  }

  // Weighted random selection
  const totalWeight = availableTemplates.reduce((sum, t) => sum + t.weight, 0);
  let roll = rng() * totalWeight;

  for (const template of availableTemplates) {
    roll -= template.weight;
    if (roll <= 0) {
      return instantiateTemplate(template, state);
    }
  }

  // Fallback (should never reach due to roll <= 0 check)
  return instantiateTemplate(availableTemplates[0], state);
}

/**
 * Instantiate an event template into a concrete event
 */
function instantiateTemplate(
  template: EventTemplate,
  state: GameState
): UnknownUnknownEvent {
  const event: UnknownUnknownEvent = {
    id: `unknown-unknown-${template.name.toLowerCase().replace(/\s+/g, '-')}-${state.currentMonth}`,
    name: template.name,
    category: template.category,
    timestamp: state.currentMonth,
    impact: {
      positive: template.positive,
      magnitude: template.magnitude,
      domains: template.domains
    },
    description: template.description
  };

  return event;
}

/**
 * Apply the effects of an unknown unknown event to game state
 */
export function applyUnknownUnknown(
  event: UnknownUnknownEvent,
  state: GameState
): void {
  // Find the matching template and apply its effects
  const template = EVENT_TEMPLATES.find(t => t.name === event.name);

  if (!template) {
    console.error(`❌ Unknown unknown template not found: ${event.name}`);
    return;
  }

  // Apply effects
  template.apply(state);

  // Track that this event occurred (prevent duplicates)
  if (!state.unknownUnknownsThisRun) {
    state.unknownUnknownsThisRun = [];
  }
  state.unknownUnknownsThisRun.push(event.name);

  // Track count for statistics
  if (!state.unknownUnknownCount) {
    state.unknownUnknownCount = 0;
  }
  state.unknownUnknownCount++;
}

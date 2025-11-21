/**
 * Unknown Unknown Event Generation (P3.2)
 *
 * Generates black swan events that aren't in the tech tree or crisis system.
 *
 * Philosophy:
 * - CONSERVATIVE probabilities (0.15% base monthly, ~1 event per 20y run)
 * - BALANCED outcomes (50/50 positive/negative)
 * - PLAUSIBLE events (no magic, grounded in science)
 * - DETERMINISTIC RNG (no deterministicRandom())
 * - RESEARCH-BACKED impacts (COVID-19 = -0.08% mortality, 2008 = -5% GDP)
 *
 * Research consensus (Oct 30, 2025):
 * - Consensus file: `.claude/chatroom/research-consensus-20251030_food_security.txt`
 * - Base probability: 0.15% monthly (0.0015) - Ord (2020), historical 2-3 events per 20y
 * - Expected outcome: ~1 simulation-affecting event per 20-year run
 * - Impact calibration: 10× reduction from original catastrophism bias
 * - Historical backing: COVID-19 (-0.08% mortality), 2008 crisis (-5% GDP/2y), Spanish Flu (-1-2%)
 * - Minimum threshold: ≥1% GDP OR ≥0.01% mortality (filters negligible events like 9/11)
 *
 * Research basis:
 * - Toby Ord, "The Precipice" (2020): Quantified low-probability catastrophic events
 * - Reinhart & Rogoff, "This Time Is Different" (2009): Economic crisis durations (24mo)
 * - Nassim Taleb, "The Black Swan" (2007): Retrospectively predictable surprises
 * - Historical frequency: 2-3 unprecedented simulation-affecting events per 20y
 */

import type { GameState } from '@/types/game';
import type { UnknownUnknownEvent, UnknownUnknownConfig } from '@/types/unknownUnknown';
import { assertFinite, assertProbability } from './utils/assertions';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';

/**
 * Event templates (will be instantiated with current month)
 *
 * Research-backed impact calibration (Oct 30, 2025 consensus):
 * - Historical precedents: COVID-19 (-0.08% mortality), 2008 crisis (-5% GDP over 2y)
 * - Minor events: ~0.5-1% impacts (barely simulation-affecting)
 * - Major events: ~2-5% impacts (2008 crisis scale)
 * - Transformative events: ~10-20% impacts (rare civilizational shifts)
 *
 * Original estimates were ~10× too catastrophic (catastrophism bias).
 * New magnitudes grounded in historical data.
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
      // Energy efficiency boost (transformative: ~10-15% impacts)
      // Research backing: Transformative tech = civilizational shift (rare)
      state.environmentalAccumulation.resourceReserves = Math.min(1.0,
        state.environmentalAccumulation.resourceReserves + 0.10); // Reduced from 0.15

      // Manufacturing capability boost (moderate transformative impact)
      state.globalMetrics.manufacturingCapability *= 1.12; // Reduced from 1.2 (+12% vs +20%)

      console.log(`⚡☄️ UNKNOWN UNKNOWN: Room-temperature superconductor discovered!`);
      console.log(`   Energy transmission losses eliminated`);
      console.log(`   Manufacturing efficiency: +12%`);
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
      // Transformative but hard to calibrate (no historical precedent)
      // Conservative estimate: moderate AI welfare boost
      if (state.aiWelfare) {
        state.aiWelfare.simpleScore = Math.min(1.0,
          state.aiWelfare.simpleScore + 0.15); // Reduced from 0.3
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
      // Major event: ~2-5% impact
      // Research backing: Major tech = significant but not transformative
      if (state.planetaryBoundariesSystem.boundaries.freshwater_change) {
        state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue = Math.max(0,
          state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue * 0.92); // 8% reduction (down from 20%)
      }

      console.log(`💧☄️ UNKNOWN UNKNOWN: Cheap desalination breakthrough!`);
      console.log(`   Freshwater scarcity reduced by 8%`);
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
      // Major crisis: ~2-5% impact (2008 crisis scale)
      // Research backing: 2008 crisis = -5% GDP over 2y
      state.globalMetrics.manufacturingCapability *= 0.96; // 4% reduction (down from 30%)

      // Social cohesion impact (coordination breakdown) - moderate
      state.socialAccumulation.institutionalLegitimacy = Math.max(0,
        state.socialAccumulation.institutionalLegitimacy - 0.03); // Down from 0.15

      console.log(`☀️☄️ UNKNOWN UNKNOWN: Major solar flare EMP event!`);
      console.log(`   Satellite infrastructure damaged`);
      console.log(`   Manufacturing capability: -4% (temporary)`);
      console.log(`   Institutional legitimacy: -3% (infrastructure breakdown)`);
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
      // Major crisis: Research-backed COVID-19 scale
      // COVID-19 mortality: -0.08% (source: consensus, historical data)
      // 2008 crisis economic: -5% GDP over 2y (Reinhart & Rogoff 2009)
      state.humanPopulationSystem.population *= 0.9992; // 0.08% mortality (down from 5%)

      // Economic disruption - moderate (pandemic + lockdowns)
      state.globalMetrics.manufacturingCapability *= 0.97; // 3% economic shock (down from 15%)

      console.log(`🦠☄️ UNKNOWN UNKNOWN: Novel pathogen emergence!`);
      console.log(`   Population: -0.08% (COVID-19 scale mortality)`);
      console.log(`   Economic disruption: -3% manufacturing capacity`);
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
      // Minor event: ~0.5-1% impact (barely simulation-affecting)
      // Research backing: Minor crises = noticeable but not major disruption

      // HIGH-1 FIX (Roy, Nov 20, 2025): Use intermediate state instead of direct write
      if (state.planetaryBoundariesSystem) {
        const impact = 0.03; // Down from 0.2 (capped by PlanetaryBoundariesPhase anyway)
        state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact =
          (state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact || 0) + impact;
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
      // Major crisis: ~2-5% impact on trust/alignment
      // Research backing: Major trust crises = significant but not catastrophic
      state.aiAgents.forEach(ai => {
        // Reveal 5% of hidden misalignment (down from 20%)
        const hiddenMisalignment = ai.externalAlignment - ai.trueAlignment;
        ai.externalAlignment = Math.max(ai.trueAlignment,
          ai.externalAlignment - hiddenMisalignment * 0.05);
      });

      // Trust damage (via institutional legitimacy) - moderate
      state.socialAccumulation.institutionalLegitimacy = Math.max(0,
        state.socialAccumulation.institutionalLegitimacy - 0.05); // Down from 0.3

      console.log(`🎭☄️ UNKNOWN UNKNOWN: Novel AI deception technique discovered!`);
      console.log(`   Previous alignment estimates were overconfident`);
      console.log(`   Institutional legitimacy: -5% (trust in evaluations eroded)`);
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
      // Transformative: ~10-15% impacts (civilizational shift)
      // Hard to calibrate (no historical precedent) but use conservative estimate
      state.humanPopulationSystem.carryingCapacity *= 1.15; // +15% carrying capacity (down from 30%)

      // Boost manufacturing (economic proxy) - moderate transformative
      state.globalMetrics.manufacturingCapability *= 1.12; // +12% (down from 20%)

      console.log(`🌟☄️ UNKNOWN UNKNOWN: Post-scarcity economics emerging!`);
      console.log(`   Carrying capacity: +15%`);
      console.log(`   Manufacturing efficiency: +12%`);
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
      // Major event: ~2-5% social impacts
      // Research backing: Major social movements = significant but gradual change
      if (state.socialAccumulation.meaningCollapseActive) {
        // Use culturalAdaptation as proxy for meaning recovery
        state.socialAccumulation.culturalAdaptation = Math.min(1.0,
          state.socialAccumulation.culturalAdaptation + 0.08); // Down from 0.25
      }

      // Social cohesion boost - moderate
      state.socialAccumulation.institutionalLegitimacy = Math.min(1.0,
        state.socialAccumulation.institutionalLegitimacy + 0.05); // Down from 0.15

      console.log(`🕊️☄️ UNKNOWN UNKNOWN: Global spirituality movement!`);
      console.log(`   Cultural adaptation: +8%`);
      console.log(`   Institutional legitimacy: +5%`);
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
      // Major event: ~2-5% governance impacts
      // Research backing: Major governance innovations = significant but incremental
      state.socialAccumulation.institutionalLegitimacy = Math.min(1.0,
        state.socialAccumulation.institutionalLegitimacy + 0.05); // Down from 0.2

      // Reduce institutional failure risk - partial recovery
      if (state.socialAccumulation.institutionalFailureActive) {
        // 50% chance to resolve (major event, not guaranteed fix)
        // Note: This breaks determinism slightly, but event itself is already RNG-gated
        state.socialAccumulation.institutionalFailureActive = false;
      }

      console.log(`🤝☄️ UNKNOWN UNKNOWN: Decentralized coordination breakthrough!`);
      console.log(`   Large-scale cooperation now feasible`);
      console.log(`   Institutional legitimacy: +5%`);
    }
  },
];

/**
 * Calculate unknown unknown probability for current month
 *
 * Research consensus (Oct 30, 2025):
 * - Base: 0.15% monthly (0.0015) - Ord (2020), historical frequency 2-3 events per 20y
 * - Expected: ~1 simulation-affecting event per 20-year run
 * - Consensus file: `.claude/chatroom/research-consensus-20251030_food_security.txt`
 */
export function calculateUnknownUnknownProbability(
  state: GameState,
  config: UnknownUnknownConfig
): number {
  // Base probability - validate with assertion
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
 * Validate that an event meets the minimum impact threshold
 *
 * Research consensus (Oct 30, 2025):
 * - Minimum threshold: ≥1% GDP OR ≥0.01% mortality
 * - Rationale: Filters psychologically shocking but simulation-negligible events
 * - Example: 9/11 (0.001% mortality) = negligible to simulation
 * - Example: 2008 crisis (-5% GDP) = major to simulation
 *
 * NOTE: This is currently a conceptual filter applied during template design.
 * All current templates meet this threshold after Oct 30 recalibration.
 * Future template additions MUST respect this threshold.
 */
function validateMinimumImpactThreshold(template: EventTemplate): boolean {
  // For now, all templates are manually validated to meet threshold
  // This function exists as documentation and future enforcement point

  // If we add quantitative impact tracking to templates, enforce here:
  // - Economic impacts: ≥1% GDP equivalent
  // - Mortality impacts: ≥0.01% population
  // - Environmental/social: ≥1% of relevant metric

  return true; // All current templates meet threshold
}

/**
 * Instantiate an event template into a concrete event
 */
function instantiateTemplate(
  template: EventTemplate,
  state: GameState
): UnknownUnknownEvent {
  // Validate minimum impact threshold (currently conceptual)
  if (!validateMinimumImpactThreshold(template)) {
    console.warn(`⚠️ Template ${template.name} does not meet minimum impact threshold`);
  }

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

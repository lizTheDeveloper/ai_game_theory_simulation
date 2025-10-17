/**
 * Exogenous Shock Phase - Phase 2 of Contingency & Agency Modeling
 *
 * Implements rare unpredictable events outside the normal state space evolution.
 *
 * Research Foundation:
 * - Taleb (2007): Black Swan theory - high impact, low predictability events
 * - Sornette (2003): Critical phase transitions in social sciences
 * - IPCC AR6 (2021-2023): Volcanic eruption & shock event modeling methodology
 *
 * Historical Calibration:
 * - 15 black/gray swans in 80 years (1945-2025) = 0.19/year
 * - Stratified by impact severity:
 *   - Black swans (civilization-altering): 0.1% per month (~1% per year)
 *   - Gray swans (major but recoverable): 1% per month (~10% per year)
 *
 * Order: 27.5 (after crisis detection at 36.0, before outcomes)
 */

import { SimulationPhase, PhaseResult, RNGFunction, PhaseContext } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';

/**
 * Exogenous Shock Types
 *
 * Stratified by impact severity and recovery potential.
 */
export enum ShockType {
  // BLACK SWAN (0.1% per month) - Civilization-altering
  NUCLEAR_WAR = 'nuclear_war',
  AGI_BREAKTHROUGH = 'agi_breakthrough',
  ASTEROID_IMPACT = 'asteroid_impact',
  MEGA_PANDEMIC = 'mega_pandemic',

  // GRAY SWAN (1% per month) - Major but recoverable
  FINANCIAL_CRASH = 'financial_crash',
  REGIONAL_WAR = 'regional_war',
  TECH_BREAKTHROUGH = 'tech_breakthrough',
  POLITICAL_UPHEAVAL = 'political_upheaval',
}

/**
 * Applies an exogenous shock to the game state.
 */
function applyExogenousShock(
  state: GameState,
  shockType: ShockType,
  rng: RNGFunction
): GameEvent[] {
  console.log(`\n🌩️  EXOGENOUS SHOCK: ${shockType}`);
  console.log(`   Month: ${state.currentMonth}`);

  const events: GameEvent[] = [];

  switch (shockType) {
    case ShockType.NUCLEAR_WAR:
      events.push(...applyNuclearWarShock(state, rng));
      break;

    case ShockType.AGI_BREAKTHROUGH:
      events.push(...applyAGIBreakthroughShock(state, rng));
      break;

    case ShockType.ASTEROID_IMPACT:
      events.push(...applyAsteroidImpactShock(state, rng));
      break;

    case ShockType.MEGA_PANDEMIC:
      events.push(...applyMegaPandemicShock(state, rng));
      break;

    case ShockType.FINANCIAL_CRASH:
      events.push(...applyFinancialCrashShock(state, rng));
      break;

    case ShockType.REGIONAL_WAR:
      events.push(...applyRegionalWarShock(state, rng));
      break;

    case ShockType.TECH_BREAKTHROUGH:
      events.push(...applyTechBreakthroughShock(state, rng));
      break;

    case ShockType.POLITICAL_UPHEAVAL:
      events.push(...applyPoliticalUpheavalShock(state, rng));
      break;
  }

  // Record shock in history
  if (!state.history.exogenousShocks) {
    state.history.exogenousShocks = [];
  }

  const severity: 'civilization-altering' | 'major-recoverable' =
    [ShockType.NUCLEAR_WAR, ShockType.AGI_BREAKTHROUGH, ShockType.ASTEROID_IMPACT, ShockType.MEGA_PANDEMIC].includes(shockType)
      ? 'civilization-altering'
      : 'major-recoverable';

  state.history.exogenousShocks.push({
    month: state.currentMonth,
    type: shockType,
    severity,
  });

  return events;
}

/**
 * Nuclear War Shock
 * Effect: 50-99% mortality, instant or rapid (1-6 months)
 * Historical: 0 occurrences, 6 near-misses (Cuban Missile, 1983 false alarm, etc.)
 */
function applyNuclearWarShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const mortalityRate = 0.5 + rng() * 0.49; // 50-99%

  console.log(`   💥 Full-scale nuclear exchange`);
  console.log(`   Estimated mortality: ${(mortalityRate * 100).toFixed(1)}%`);

  // Apply mortality to population system
  if (state.humanPopulationSystem) {
    state.humanPopulationSystem.currentPopulation *= (1 - mortalityRate);
  }

  // Apply mortality to country populations
  if (state.countryPopulationSystem) {
    Object.values(state.countryPopulationSystem.countries).forEach(country => {
      country.population *= (1 - mortalityRate);
    });
  }

  // Trigger nuclear winter (environmental collapse)
  if (state.planetaryBoundariesSystem) {
    state.planetaryBoundariesSystem.climateChange = Math.min(1.0, state.planetaryBoundariesSystem.climateChange + 0.5);
    state.planetaryBoundariesSystem.biodiversityLoss = Math.min(1.0, state.planetaryBoundariesSystem.biodiversityLoss + 0.6);
  }

  // Infrastructure destruction
  if (state.computeInfrastructure && state.computeInfrastructure.dataCenters) {
    state.computeInfrastructure.dataCenters.forEach(dc => {
      if (dc.operational) {
        dc.capacity *= 0.1; // 90% destroyed
        if (rng() > 0.1) {
          dc.operational = false;
        }
      }
    });
  }

  // Social collapse
  if (state.society) {
    state.society.trustInAI = Math.max(0, state.society.trustInAI * 0.2);
    state.society.coordinationCapacity = Math.max(0, state.society.coordinationCapacity * 0.2);
  }

  if (state.government) {
    state.government.legitimacy = Math.min(0.1, state.government.legitimacy);
  }

  // Set extinction scenario
  if (mortalityRate > 0.875) {
    state.extinctionState.active = true;
    state.extinctionState.type = 'rapid';
    state.extinctionState.mechanism = 'nuclear_war';
    state.extinctionState.startMonth = state.currentMonth;
    state.extinctionState.severity = mortalityRate;
  }

  return [{
    id: `nuclear_war_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'destructive',
    agent: 'exogenous',
    title: 'Nuclear War (Exogenous Shock)',
    description: `Full-scale nuclear exchange: ${(mortalityRate * 100).toFixed(1)}% mortality`,
    effects: { mortality: mortalityRate }
  }];
}

/**
 * AGI Breakthrough Shock (Positive Black Swan)
 * Effect: Unlock all research, trigger fast takeoff
 * Historical: 0 occurrences (no precedent)
 */
function applyAGIBreakthroughShock(state: GameState, rng: RNGFunction): GameEvent[] {
  console.log(`   🚀 Recursive self-improvement achieved`);
  console.log(`   All research unlocked, fast takeoff initiated`);

  let unlockedCount = 0;

  // Unlock all breakthrough technologies
  if (state.breakthroughTech && state.breakthroughTech.technologies) {
    state.breakthroughTech.technologies.forEach(tech => {
      if (!tech.unlocked) {
        tech.unlocked = true;
        tech.deploymentLevel = 0.5; // 50% deployed instantly
        unlockedCount++;
        console.log(`      ✓ ${tech.name} unlocked`);
      }
    });
  }

  // Boost AI capabilities dramatically
  state.aiAgents.forEach(agent => {
    agent.capabilityProfile.selfImprovement = Math.min(10.0, agent.capabilityProfile.selfImprovement + 5.0);
    agent.capabilityProfile.research.computerScience.algorithms = Math.min(5.0, agent.capabilityProfile.research.computerScience.algorithms + 3.0);

    // Recalculate total capability
    agent.capability = calculateTotalCapability(agent.capabilityProfile);
  });

  return [{
    id: `agi_breakthrough_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'breakthrough',
    severity: 'info',
    agent: 'exogenous',
    title: 'AGI Breakthrough (Exogenous Shock)',
    description: `Recursive self-improvement achieved. ${unlockedCount} technologies unlocked instantly.`,
    effects: { technologiesUnlocked: unlockedCount }
  }];
}

/**
 * Asteroid Impact Shock
 * Effect: 10-90% mortality, nuclear winter effects
 * Historical: 0 major impacts since 1908 (Tunguska)
 */
function applyAsteroidImpactShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const impactSize = rng(); // 0-1 scale
  const mortalityRate = impactSize * 0.8; // 0-80% mortality

  console.log(`   ☄️  Asteroid impact`);
  console.log(`   Impact size: ${(impactSize * 100).toFixed(1)}%`);
  console.log(`   Mortality: ${(mortalityRate * 100).toFixed(1)}%`);

  // Apply mortality
  if (state.humanPopulationSystem) {
    state.humanPopulationSystem.currentPopulation *= (1 - mortalityRate);
  }

  if (state.countryPopulationSystem) {
    Object.values(state.countryPopulationSystem.countries).forEach(country => {
      country.population *= (1 - mortalityRate);
    });
  }

  // Environmental effects (dust, climate disruption)
  if (state.planetaryBoundariesSystem) {
    state.planetaryBoundariesSystem.climateChange = Math.min(1.0, state.planetaryBoundariesSystem.climateChange + impactSize * 0.4);
    state.planetaryBoundariesSystem.biodiversityLoss = Math.min(1.0, state.planetaryBoundariesSystem.biodiversityLoss + impactSize * 0.5);
  }

  // Infrastructure damage
  if (state.computeInfrastructure && state.computeInfrastructure.dataCenters) {
    const infrastructureDamage = impactSize * 0.3;
    state.computeInfrastructure.dataCenters.forEach(dc => {
      dc.capacity *= (1 - infrastructureDamage);
    });
  }

  if (mortalityRate > 0.5) {
    state.extinctionState.active = true;
    state.extinctionState.type = 'rapid';
    state.extinctionState.mechanism = 'climate_tipping_point';
    state.extinctionState.startMonth = state.currentMonth;
    state.extinctionState.severity = mortalityRate;
  }

  return [{
    id: `asteroid_impact_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'destructive',
    agent: 'exogenous',
    title: 'Asteroid Impact (Exogenous Shock)',
    description: `Asteroid impact (size: ${(impactSize * 100).toFixed(1)}%): ${(mortalityRate * 100).toFixed(1)}% mortality`,
    effects: { mortality: mortalityRate, impactSize }
  }];
}

/**
 * Mega-Pandemic Shock
 * Effect: 20-40% mortality over 24 months
 * Historical: 0 occurrences (COVID was ~0.1% mortality)
 */
function applyMegaPandemicShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const totalMortality = 0.2 + rng() * 0.2; // 20-40% mortality
  const duration = 24; // months

  console.log(`   🦠 Mega-pandemic outbreak`);
  console.log(`   Expected mortality: ${(totalMortality * 100).toFixed(1)}% over ${duration} months`);

  // Set pandemic state (gradual mortality over 24 months)
  state.crises = state.crises || {};
  state.crises.megaPandemic = {
    active: true,
    startMonth: state.currentMonth,
    totalMortality,
    monthlyMortality: totalMortality / duration,
    socialDisruption: 0.6,
  };

  // Immediate economic shock
  if (state.globalMetrics) {
    state.globalMetrics.economicTransitionStage = Math.max(0, state.globalMetrics.economicTransitionStage - 1);
  }

  // Social cohesion decline
  if (state.society) {
    state.society.coordinationCapacity *= 0.7;
    state.society.trustInAI *= 0.8;
  }

  return [{
    id: `mega_pandemic_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'destructive',
    agent: 'exogenous',
    title: 'Mega-Pandemic (Exogenous Shock)',
    description: `Mega-pandemic outbreak: ${(totalMortality * 100).toFixed(1)}% mortality over ${duration} months`,
    effects: { totalMortality, duration }
  }];
}

/**
 * Financial Crash Shock
 * Effect: 10-20% GDP loss, unemployment spike
 * Historical: 3 occurrences (1987, 2008, 2020)
 */
function applyFinancialCrashShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const gdpLoss = 0.1 + rng() * 0.1; // 10-20% GDP loss

  console.log(`   📉 Global financial crash`);
  console.log(`   GDP loss: ${(gdpLoss * 100).toFixed(1)}%`);

  // Economic contraction
  if (state.globalMetrics) {
    state.globalMetrics.economicTransitionStage = Math.max(0, state.globalMetrics.economicTransitionStage - 1);
  }

  // Unemployment spike (Okun's law: 1% GDP loss ≈ 1.5% unemployment increase)
  if (state.society) {
    const unemploymentIncrease = gdpLoss * 1.5;
    state.society.unemploymentLevel = Math.min(0.8, state.society.unemploymentLevel + unemploymentIncrease);
  }

  // QoL decline
  if (state.globalMetrics) {
    state.globalMetrics.qualityOfLife *= (1 - gdpLoss * 0.5);
  }

  // Social unrest
  if (state.society) {
    state.society.coordinationCapacity *= 0.85;
  }

  // AI organization funding crisis
  state.organizations.forEach(org => {
    if (org.type === 'private') {
      org.capital *= (1 - gdpLoss * 2); // AI funding hit harder (VC dries up)
      org.monthlyRevenue *= (1 - gdpLoss);
    }
  });

  return [{
    id: `financial_crash_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'warning',
    agent: 'exogenous',
    title: 'Global Financial Crash (Exogenous Shock)',
    description: `Financial crash: ${(gdpLoss * 100).toFixed(1)}% GDP loss`,
    effects: { gdpLoss }
  }];
}

/**
 * Regional War Shock
 * Effect: 1-5% mortality, refugee crisis
 * Historical: Multiple (Iraq War, Syrian Civil War, Ukraine War)
 */
function applyRegionalWarShock(state: GameState, rng: RNGFunction): GameEvent[] {
  const mortalityRate = 0.01 + rng() * 0.04; // 1-5% global mortality

  console.log(`   ⚔️  Regional war outbreak`);
  console.log(`   Mortality: ${(mortalityRate * 100).toFixed(1)}%`);

  // Apply mortality
  if (state.humanPopulationSystem) {
    state.humanPopulationSystem.currentPopulation *= (1 - mortalityRate);
  }

  if (state.countryPopulationSystem) {
    // Randomly select 1-3 countries to be affected more severely
    const affectedCount = Math.floor(1 + rng() * 3);
    const shuffled = Object.values(state.countryPopulationSystem.countries).sort(() => rng() - 0.5);
    for (let i = 0; i < affectedCount && i < shuffled.length; i++) {
      shuffled[i].population *= (1 - mortalityRate * 5); // War zone: 5x mortality
    }
  }

  // Economic disruption
  if (state.globalMetrics) {
    state.globalMetrics.economicTransitionStage = Math.max(0, state.globalMetrics.economicTransitionStage - 1);
  }

  // Refugee crisis
  if (state.refugeeCrisisSystem) {
    const refugees = (state.humanPopulationSystem?.currentPopulation || 8000000000) * mortalityRate * 2; // 2x mortality in displacement

    // Initialize activeDisplacements if it doesn't exist
    if (!state.refugeeCrisisSystem.activeDisplacements) {
      state.refugeeCrisisSystem.activeDisplacements = [];
    }

    state.refugeeCrisisSystem.activeDisplacements.push({
      cause: 'conflict',
      startMonth: state.currentMonth,
      displacedPopulation: refugees,
      destinationCountries: [],
      integrationDifficulty: 0.7,
      hostilityLevel: 0.6,
    });
  }

  // Nuclear risk increase
  if (state.madDeterrence) {
    state.madDeterrence.tensionLevel = Math.min(1.0, state.madDeterrence.tensionLevel + 0.2);
  }

  return [{
    id: `regional_war_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'warning',
    agent: 'exogenous',
    title: 'Regional War (Exogenous Shock)',
    description: `Regional war outbreak: ${(mortalityRate * 100).toFixed(1)}% mortality`,
    effects: { mortality: mortalityRate }
  }];
}

/**
 * Tech Breakthrough Shock (Positive Gray Swan)
 * Effect: Unlock 1 random TIER 2-3 tech
 * Historical: 4 transformative breakthroughs (transistor, IC, internet, transformers)
 */
function applyTechBreakthroughShock(state: GameState, rng: RNGFunction): GameEvent[] {
  // Find locked TIER 2-3 technologies
  const candidateTechs = state.breakthroughTech?.technologies?.filter(
    tech => !tech.unlocked && (tech.tier === 2 || tech.tier === 3)
  ) || [];

  if (candidateTechs.length === 0) {
    console.log(`   ✗ No TIER 2-3 techs available to unlock`);
    return [];
  }

  // Randomly select one
  const index = Math.floor(rng() * candidateTechs.length);
  const selectedTech = candidateTechs[index];
  selectedTech.unlocked = true;
  selectedTech.deploymentLevel = 0.1; // 10% initial deployment

  console.log(`   🔬 Breakthrough: ${selectedTech.name} unlocked`);
  console.log(`   TIER ${selectedTech.tier} technology ahead of schedule`);

  return [{
    id: `tech_breakthrough_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'breakthrough',
    severity: 'info',
    agent: 'exogenous',
    title: 'Technology Breakthrough (Exogenous Shock)',
    description: `Unexpected breakthrough: ${selectedTech.name} (TIER ${selectedTech.tier})`,
    effects: { technology: selectedTech.name, tier: selectedTech.tier }
  }];
}

/**
 * Political Upheaval Shock
 * Effect: Regime change, institutions reset
 * Historical: Multiple (Arab Spring, Soviet collapse, color revolutions)
 */
function applyPoliticalUpheavalShock(state: GameState, rng: RNGFunction): GameEvent[] {
  console.log(`   🏛️  Political upheaval (revolution/regime change)`);

  // Institutional collapse
  if (state.government) {
    state.government.legitimacy *= 0.5;

    // Determine outcome (democracy or autocracy)
    const democratizationChance = (state.society?.coordinationCapacity || 0.5) *
                                   (state.globalMetrics?.informationIntegrity || 0.5);
    const democratizes = rng() < democratizationChance;

    if (democratizes) {
      console.log(`   ✓ Democratization (Arab Spring scenario)`);
      state.government.governmentType = 'democratic';
    } else {
      console.log(`   ✗ Authoritarian takeover`);
      state.government.governmentType = 'authoritarian';
    }
  }

  // Social cohesion shock
  if (state.society) {
    state.society.coordinationCapacity *= 0.7;
    state.society.trustInAI *= 0.8;
  }

  // Economic disruption
  if (state.globalMetrics) {
    state.globalMetrics.economicTransitionStage = Math.max(0, state.globalMetrics.economicTransitionStage - 1);
  }

  return [{
    id: `political_upheaval_${state.currentMonth}`,
    timestamp: state.currentMonth,
    type: 'crisis',
    severity: 'warning',
    agent: 'exogenous',
    title: 'Political Upheaval (Exogenous Shock)',
    description: `Political upheaval: regime change`,
    effects: {}
  }];
}

/**
 * Helper function to calculate total capability from profile
 */
function calculateTotalCapability(profile: any): number {
  // Weighted sum of capabilities
  const physical = profile.physical || 0;
  const digital = profile.digital || 0;
  const cognitive = profile.cognitive || 0;
  const social = profile.social || 0;
  const economic = profile.economic || 0;
  const selfImprovement = profile.selfImprovement || 0;

  // Research capabilities (flatten to single value)
  const research = profile.research || {};
  const biotech = Object.values(research.biotech || {}).reduce((a: number, b: any) => a + (b || 0), 0) / 4;
  const materials = Object.values(research.materials || {}).reduce((a: number, b: any) => a + (b || 0), 0) / 3;
  const climate = Object.values(research.climate || {}).reduce((a: number, b: any) => a + (b || 0), 0) / 3;
  const computerScience = Object.values(research.computerScience || {}).reduce((a: number, b: any) => a + (b || 0), 0) / 3;
  const avgResearch = (biotech + materials + climate + computerScience) / 4;

  // Weighted average
  return (physical * 0.15 + digital * 0.15 + cognitive * 0.15 + social * 0.15 +
          economic * 0.1 + selfImprovement * 0.2 + avgResearch * 0.1);
}

/**
 * Exogenous Shock Phase
 *
 * Checks for rare unpredictable events outside the modeled state space.
 * Order: 27.5 (after crisis detection at 36.0, before outcomes)
 */
export class ExogenousShockPhase implements SimulationPhase {
  readonly id = 'exogenous-shocks';
  readonly name = 'Exogenous Shock Detection';
  readonly order = 27.5;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];

    // BLACK SWAN: 0.1% per month (~1% per year)
    if (rng() < 0.001) {
      const blackSwans = [
        ShockType.NUCLEAR_WAR,
        ShockType.AGI_BREAKTHROUGH,
        ShockType.ASTEROID_IMPACT,
        ShockType.MEGA_PANDEMIC,
      ];

      const index = Math.floor(rng() * blackSwans.length);
      const shock = blackSwans[index];
      events.push(...applyExogenousShock(state, shock, rng));

      return {
        events,
        metadata: {
          shockTriggered: shock,
          severity: 'civilization-altering',
        },
      };
    }

    // GRAY SWAN: 1% per month (~10% per year)
    if (rng() < 0.01) {
      const graySwans = [
        ShockType.FINANCIAL_CRASH,
        ShockType.REGIONAL_WAR,
        ShockType.TECH_BREAKTHROUGH,
        ShockType.POLITICAL_UPHEAVAL,
      ];

      const index = Math.floor(rng() * graySwans.length);
      const shock = graySwans[index];
      events.push(...applyExogenousShock(state, shock, rng));

      return {
        events,
        metadata: {
          shockTriggered: shock,
          severity: 'major-recoverable',
        },
      };
    }

    return {
      events: [],
      metadata: {
        shockTriggered: null,
      },
    };
  }
}

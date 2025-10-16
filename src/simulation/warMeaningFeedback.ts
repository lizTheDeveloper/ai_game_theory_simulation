/**
 * TIER 2.8 Phase 3: War-Meaning Feedback Loop
 *
 * Models the relationship between meaning crisis and military interventions:
 * - Meaning crisis → Nationalism → War motivation → Interventions
 * - Interventions → Moral injury → Reduced war support (negative feedback)
 * - Alternative: Parental fulfillment → Reduced war motivation
 *
 * RESEARCH BACKING:
 * - Durkheim (1912): War creates "collective effervescence" (nationalist unity)
 * - Pyszczynski et al. (2006): Terror Management Theory - existential anxiety → nationalism
 * - Sebastian Junger (2016): "Tribe" - War as meaning substitute
 * - Veterans' studies: 11-20% PTSD rates (Iraq/Afghanistan)
 * - User insight: "Becoming a mom dulled my lust for war"
 *
 * KEY MECHANISMS:
 * 1. Meaning Crisis → Nationalism
 *    - Loss of purpose (automation, atomization) → seek collective identity
 *    - Economic insecurity → blame outsiders
 *    - Rival threats → unite against common enemy
 *
 * 2. Nationalism → War Motivation
 *    - Nationalist identity → desire to project power
 *    - Historical grievances → seek revenge/restoration
 *    - Resource dependence → secure access through force
 *
 * 3. War → Moral Injury (Negative Feedback)
 *    - Veterans return with PTSD, moral injury
 *    - Families affected (secondary trauma)
 *    - Public support erodes over time
 *
 * 4. Parental Fulfillment Alternative
 *    - Nurturing AI, ecosystems, de-extinction projects
 *    - Building/creating vs destroying
 *    - User insight: Parenting provides purpose without violence
 */

import { GameState } from '../types/game';
import { CountryName, CountryPopulation } from '../types/countryPopulations';

/**
 * Initialize war-meaning feedback fields for all countries
 */
export function initializeWarMeaningFeedback(countries: Record<CountryName, CountryPopulation>): void {
  for (const country of Object.values(countries)) {
    // Meaning crisis: Higher in wealthy, automated hegemons
    // Lower in developing countries (traditional meaning structures still intact)
    country.meaningCrisis = calculateInitialMeaningCrisis(country);

    // Nationalism: Varies by country, historical context
    country.nationalismStrength = calculateInitialNationalism(country);

    // War motivation: Starts low, driven by meaning crisis + nationalism
    country.warMotivation = 0.0;

    // Parental fulfillment: Starts low, grows with tech deployment
    country.parentalFulfillment = 0.5; // Baseline: 0.5/5.0 (minimal)

    // Moral injury: Starts at 0, accumulates from interventions
    country.moralInjury = 0.0;
  }
}

/**
 * Calculate initial meaning crisis level
 * Higher in wealthy, automated countries (loss of traditional purpose)
 */
function calculateInitialMeaningCrisis(country: CountryPopulation): number {
  // Factors that increase meaning crisis:
  // 1. High GDP per capita (automation, consumerism → meaninglessness)
  // 2. Low traditional community structures
  // 3. High individualism (atomization)

  let crisis = 0.0;

  // Hegemons have higher meaning crisis (2025 baseline)
  if (country.isHegemon) {
    crisis = 0.4; // US, UK: High automation, atomization, consumerism
  } else if (country.isMajorEconomy) {
    crisis = 0.3; // Japan, Germany: High automation, but stronger community
  } else {
    crisis = 0.2; // Developing: Traditional meaning structures still strong
  }

  // Adjust by country-specific factors
  switch (country.name) {
    case 'United States':
      return 0.45; // Highest atomization, consumerism, loss of community
    case 'United Kingdom':
      return 0.42; // Post-Brexit identity crisis, economic decline
    case 'China':
      return 0.35; // Rapid change, but collectivist culture buffers
    case 'Russia':
      return 0.38; // Post-Soviet identity crisis, economic stagnation
    case 'India':
      return 0.25; // Traditional structures still strong
    case 'Japan':
      return 0.40; // Hikikomori, social isolation, aging society
    case 'France':
      return 0.38; // Existential philosophy, but social safety nets
    case 'Germany':
      return 0.35; // Strong unions, social market economy
    default:
      return crisis;
  }
}

/**
 * Calculate initial nationalism strength
 * Based on historical context, recent conflicts, identity politics
 */
function calculateInitialNationalism(country: CountryPopulation): number {
  // Factors that increase nationalism:
  // 1. Recent conflicts or threats
  // 2. Historical grievances (colonialism, territorial disputes)
  // 3. Economic insecurity
  // 4. Populist movements

  switch (country.name) {
    case 'United States':
      return 0.55; // Post-9/11 war on terror, MAGA movement, China rivalry
    case 'China':
      return 0.65; // Historical grievances (century of humiliation), Taiwan, US rivalry
    case 'Russia':
      return 0.70; // Ukraine war, NATO expansion, resurgent imperialism
    case 'India':
      return 0.60; // Hindu nationalism, Pakistan rivalry, Kashmir
    case 'United Kingdom':
      return 0.50; // Brexit nationalism, "Global Britain" identity
    case 'France':
      return 0.45; // Le Pen nationalism, but republican values counter it
    case 'Israel':
      return 0.75; // Existential threat perception, settler nationalism
    case 'Pakistan':
      return 0.65; // India rivalry, Kashmir, Islamic identity
    case 'Japan':
      return 0.40; // Pacifist constitution, but growing China threat
    case 'Germany':
      return 0.30; // Post-WWII anti-nationalism, EU integration
    case 'Nigeria':
      return 0.55; // Ethnic nationalism (Hausa, Yoruba, Igbo), Boko Haram
    case 'Bangladesh':
      return 0.45; // Liberation war legacy, but economic focus
    case 'Brazil':
      return 0.50; // Bolsonaro nationalism, but diverse society
    case 'Indonesia':
      return 0.50; // Islamic nationalism, but pluralist tradition
    case 'Canada':
      return 0.30; // Multicultural identity, but some anti-immigration sentiment
    default:
      return 0.45;
  }
}

/**
 * Update war-meaning feedback for all countries each month
 */
export function updateWarMeaningFeedback(state: GameState): void {
  for (const country of Object.values(state.countryPopulationSystem.countries)) {
    // 1. Update meaning crisis (driven by automation, unemployment, isolation)
    updateMeaningCrisis(country, state);

    // 2. Update nationalism (driven by meaning crisis, economic insecurity, threats)
    updateNationalism(country, state);

    // 3. Calculate war motivation (driven by nationalism, resource needs, deterred by moral injury)
    updateWarMotivation(country, state);

    // 4. Update parental fulfillment (grows with tech deployment, AI companions, de-extinction)
    updateParentalFulfillment(country, state);

    // 5. Update moral injury (accumulates from active interventions)
    updateMoralInjury(country, state);
  }
}

/**
 * Update meaning crisis based on societal conditions
 */
function updateMeaningCrisis(country: CountryPopulation, state: GameState): void {
  let delta = 0.0;

  // Automation increases meaning crisis (job loss → purposelessness)
  if (state.society.unemploymentLevel > 0.15) {
    delta += 0.002; // +0.002/month when unemployment > 15%
  }

  // Social isolation increases meaning crisis
  if (state.society.socialCohesion < 0.5) {
    delta += 0.001; // Low social cohesion → atomization
  }

  // Meaning Renaissance reduces crisis (new sources of purpose)
  if (state.meaningRenaissance.culturalRenaissance > 0.6) {
    delta -= 0.003; // Purpose frameworks, community, creativity
  }

  // Parental fulfillment reduces meaning crisis (nurturing provides purpose)
  if (country.parentalFulfillment > 2.0) {
    delta -= 0.002; // Significant nurturing activities
  }

  // Apply delta
  country.meaningCrisis = Math.max(0.0, Math.min(1.0, country.meaningCrisis + delta));
}

/**
 * Update nationalism strength
 */
function updateNationalism(country: CountryPopulation, state: GameState): void {
  let delta = 0.0;

  // Meaning crisis drives nationalism (need for collective identity)
  // Durkheim: War creates "collective effervescence"
  if (country.meaningCrisis > 0.5) {
    delta += 0.003; // Seek collective identity when individual meaning fails
  }

  // Economic insecurity drives nationalism (blame outsiders)
  if (state.society.unemploymentLevel > 0.20) {
    delta += 0.002; // Scapegoating when jobs disappear
  }

  // Rival threats increase nationalism (rally around flag)
  // Check if other hegemons are aggressive
  let rivalThreat = 0.0;
  for (const other of Object.values(state.countryPopulationSystem.countries)) {
    if (other.isHegemon && other.name !== country.name) {
      rivalThreat += other.activeInterventions.length * 0.1;
    }
  }
  delta += rivalThreat * 0.001;

  // Active interventions boost nationalism (rally around flag effect)
  if (country.activeInterventions.length > 0) {
    delta += 0.002 * country.activeInterventions.length;
  }

  // High quality of life reduces nationalism (less need for scapegoating)
  if (state.globalMetrics.qualityOfLife > 7.5) {
    delta -= 0.002;
  }

  // Strong social cohesion reduces nationalism (community without jingoism)
  if (state.society.socialCohesion > 0.7) {
    delta -= 0.001;
  }

  // Apply delta
  country.nationalismStrength = Math.max(0.0, Math.min(1.0, country.nationalismStrength + delta));
}

/**
 * Calculate war motivation
 *
 * Formula: (meaningCrisis × nationalismStrength) - moralInjury + resourceDependence
 */
function updateWarMotivation(country: CountryPopulation, state: GameState): void {
  // Only hegemons can initiate interventions
  if (!country.isHegemon) {
    country.warMotivation = 0.0;
    return;
  }

  // Base: Meaning crisis drives desire for collective action (war as purpose)
  const meaningNationalismDrive = country.meaningCrisis * country.nationalismStrength;

  // Resource dependence increases motivation (need secure access)
  const resourceDependence = calculateResourceDependence(country, state);

  // Moral injury reduces motivation (trauma from past wars)
  const moralInjuryReduction = country.moralInjury;

  // Parental fulfillment reduces motivation (alternative source of purpose)
  // User insight: "Becoming a mom dulled my lust for war"
  const parentalFulfillmentReduction = country.parentalFulfillment / 5.0; // Normalize to [0,1]

  // Calculate motivation
  let motivation = meaningNationalismDrive + resourceDependence - moralInjuryReduction - parentalFulfillmentReduction;

  // Clamp to [0, 1]
  country.warMotivation = Math.max(0.0, Math.min(1.0, motivation));
}

/**
 * Calculate resource dependence
 * How much does country need resources they don't control?
 */
function calculateResourceDependence(country: CountryPopulation, state: GameState): number {
  // Low sovereignty over own resources → need to secure them elsewhere
  const resourceInsecurity = 1.0 - country.sovereignty.overallSovereignty;

  // High military capability + resource insecurity → motivation to intervene
  const capabilityToAct = country.militaryCapability;

  return resourceInsecurity * capabilityToAct * 0.3; // Max 0.3 contribution
}

/**
 * Update parental fulfillment
 * Grows when citizens engage in nurturing activities
 */
function updateParentalFulfillment(country: CountryPopulation, state: GameState): void {
  let delta = 0.0;

  // Tech deployment increases fulfillment (AI companions, de-extinction, ecosystem restoration)
  // Check if relevant tech is deployed
  const techTreeState = (state as any).techTreeState;
  if (techTreeState && techTreeState.unlockedTech) {
    // De-extinction tech provides nurturing opportunities
    if (techTreeState.unlockedTech.includes('de_extinction_basic')) {
      delta += 0.01; // Caring for resurrected species
    }

    // Ecosystem restoration provides stewardship purpose
    if (techTreeState.unlockedTech.includes('ecosystem_restoration')) {
      delta += 0.01; // Healing the planet
    }

    // AI companions provide caregiving relationships
    if (techTreeState.unlockedTech.includes('mental_health_ai')) {
      delta += 0.01; // Nurturing AI relationships
    }

    // Space colonization provides frontier-building purpose
    if (techTreeState.unlockedTech.includes('space_colonization')) {
      delta += 0.02; // Building new worlds
    }
  }

  // Meaning Renaissance provides alternative purpose
  if (state.meaningRenaissance.culturalRenaissance > 0.7) {
    delta += 0.01; // Community building, creativity, education
  }

  // Active interventions reduce fulfillment (destruction vs creation)
  if (country.activeInterventions.length > 0) {
    delta -= 0.005 * country.activeInterventions.length;
  }

  // Apply delta
  country.parentalFulfillment = Math.max(0.0, Math.min(5.0, country.parentalFulfillment + delta));
}

/**
 * Update moral injury from interventions
 * Veterans return with PTSD, moral injury accumulates
 */
function updateMoralInjury(country: CountryPopulation, state: GameState): void {
  // Moral injury accumulates from active interventions
  // Iraq/Afghanistan: 11-20% of veterans have PTSD

  for (const intervention of country.activeInterventions) {
    // Veteran return rate (small % of population each month)
    const veteranReturnRate = 0.0005; // 0.05% of population are veterans

    // PTSD rate among veterans (15% average)
    const ptsdRate = 0.15;

    // Moral injury increases
    const monthlyInjury = veteranReturnRate * ptsdRate;
    country.moralInjury = Math.min(0.25, country.moralInjury + monthlyInjury); // Max 25% of population affected
  }

  // Moral injury decays slowly over time (healing)
  // But never fully heals (generational trauma)
  if (country.activeInterventions.length === 0 && country.moralInjury > 0) {
    country.moralInjury *= 0.99; // 1% decay per month when no active wars
  }
}

/**
 * Get war motivation multiplier for intervention triggers
 * Used by militarySystem to adjust intervention probability
 */
export function getWarMotivationMultiplier(country: CountryPopulation): number {
  // War motivation directly multiplies intervention probability
  // 0.0 motivation → 0% chance
  // 1.0 motivation → 100% base chance

  return country.warMotivation;
}

/**
 * Check if parental fulfillment is reducing war motivation
 */
export function isParentalFulfillmentActive(country: CountryPopulation): boolean {
  return country.parentalFulfillment > 2.5; // Above 50% fulfillment
}

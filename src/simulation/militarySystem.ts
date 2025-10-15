/**
 * TIER 2.8 Phase 2: Military System & Interventions
 *
 * Models military capabilities, interventions, and their effects:
 * - Military spending and CO2 emissions
 * - Intervention triggers (resource access, meaning crisis, rival containment)
 * - Intervention effects (refugees, casualties, instability)
 * - Military R&D boost to AI capabilities (DARPA model)
 *
 * RESEARCH BACKING:
 * - SIPRI Military Expenditure Database 2024
 * - Brown University Costs of War Project 2024
 * - Neta Crawford (2019): Pentagon Fuel Use, Climate Change, and the Costs of War
 * - David Vine (2020): The United States of War
 * - Uppsala Conflict Data Program 2024
 * - UNHCR Global Trends Report 2024
 */

import { GameState } from '../types/game';
import { CountryName, CountryPopulation, MilitaryIntervention } from '../types/countryPopulations';

/**
 * Initialize military capabilities for all countries
 *
 * DATA SOURCES:
 * - SIPRI Military Expenditure Database 2024
 * - Global Firepower Index 2024
 * - IISS Military Balance 2024
 */
export function initializeMilitaryCapabilities(): Map<CountryName, {
  militaryCapability: number;
  militarySpendingPercent: number;
  militarySpendingAbsolute: number;
  militaryCO2Emissions: number;
  militaryBases: Map<CountryName, number>;
  activeInterventions: MilitaryIntervention[];
  militaryRnDPercent: number;
}> {
  const militaryData = new Map<CountryName, {
    militaryCapability: number;
    militarySpendingPercent: number;
    militarySpendingAbsolute: number;
    militaryCO2Emissions: number;
    militaryBases: Map<CountryName, number>;
    activeInterventions: MilitaryIntervention[];
    militaryRnDPercent: number;
  }>();

  // UNITED STATES - Global Hegemon
  // SIPRI 2024: $877B military spending (3.5% of GDP)
  // 750 military bases in 80+ countries
  // Pentagon emissions: 59M tons CO2/year (Neta Crawford 2019)
  militaryData.set('United States', {
    militaryCapability: 1.0,  // Global force projection, unmatched
    militarySpendingPercent: 3.5,
    militarySpendingAbsolute: 877, // Billions USD
    militaryCO2Emissions: 59,  // Million tons/year
    militaryBases: new Map(),  // Populated dynamically (750 total)
    activeInterventions: [],
    militaryRnDPercent: 12,    // DARPA, etc. ~$105B/year R&D
  });

  // CHINA - Rising Challenger
  // SIPRI 2024: $292B official (likely underreported, real ~$350B)
  // 1-2 overseas bases (Djibouti, potential others)
  // Estimated emissions: ~25M tons/year
  militaryData.set('China', {
    militaryCapability: 0.80,  // Regional dominance, growing global
    militarySpendingPercent: 1.7,
    militarySpendingAbsolute: 292,
    militaryCO2Emissions: 25,
    militaryBases: new Map(),  // Djibouti confirmed
    activeInterventions: [],
    militaryRnDPercent: 8,     // Growing AI investment
  });

  // RUSSIA - Declining Hegemon
  // SIPRI 2024: $86B (post-Ukraine war increase)
  // ~21 military bases (mostly former Soviet states)
  // Estimated emissions: ~15M tons/year
  militaryData.set('Russia', {
    militaryCapability: 0.70,  // Regional hegemon, limited global reach
    militarySpendingPercent: 4.1,
    militarySpendingAbsolute: 86,
    militaryCO2Emissions: 15,
    militaryBases: new Map(),  // Syria, Armenia, Tajikistan, etc.
    activeInterventions: [],
    militaryRnDPercent: 6,
  });

  // INDIA - Regional Hegemon, Aspirant Global
  // SIPRI 2024: $81.4B
  // No overseas bases yet (aspirational)
  // Estimated emissions: ~8M tons/year
  militaryData.set('India', {
    militaryCapability: 0.50,  // Regional power, no global projection
    militarySpendingPercent: 2.4,
    militarySpendingAbsolute: 81.4,
    militaryCO2Emissions: 8,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 5,
  });

  // UNITED KINGDOM - Former Empire, Still Global
  // SIPRI 2024: $74.9B
  // ~145 bases/facilities globally (Cyprus, Diego Garcia, Falklands, etc.)
  // Estimated emissions: ~6M tons/year
  militaryData.set('United Kingdom', {
    militaryCapability: 0.50,  // Global reach but limited capacity
    militarySpendingPercent: 2.3,
    militarySpendingAbsolute: 74.9,
    militaryCO2Emissions: 6,
    militaryBases: new Map(),  // Cyprus, Diego Garcia, etc.
    activeInterventions: [],
    militaryRnDPercent: 10,    // High tech, Trident, AI
  });

  // FRANCE - Regional Hegemon (Françafrique)
  // SIPRI 2024: $61.3B
  // ~30 bases (mostly West/Central Africa)
  // Estimated emissions: ~4M tons/year
  militaryData.set('France', {
    militaryCapability: 0.45,  // Regional hegemon in Africa
    militarySpendingPercent: 2.1,
    militarySpendingAbsolute: 61.3,
    militaryCO2Emissions: 4,
    militaryBases: new Map(),  // Djibouti, Gabon, Senegal, Chad, etc.
    activeInterventions: [],
    militaryRnDPercent: 8,
  });

  // JAPAN - Constrained by Constitution
  // SIPRI 2024: $50.2B (officially "Self-Defense Forces")
  // No overseas bases (US bases in Japan instead)
  // Estimated emissions: ~2.5M tons/year
  militaryData.set('Japan', {
    militaryCapability: 0.35,  // Advanced but defensive only
    militarySpendingPercent: 1.1,
    militarySpendingAbsolute: 50.2,
    militaryCO2Emissions: 2.5,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 7,     // High tech, robotics
  });

  // GERMANY - Constrained by History
  // SIPRI 2024: $66.8B (increasing post-Ukraine)
  // No overseas bases (NATO member)
  // Estimated emissions: ~3M tons/year
  militaryData.set('Germany', {
    militaryCapability: 0.30,  // NATO capability, limited projection
    militarySpendingPercent: 1.5,
    militarySpendingAbsolute: 66.8,
    militaryCO2Emissions: 3,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 6,
  });

  // PAKISTAN - Nuclear Regional Power
  // SIPRI 2024: $10.4B (likely underreported)
  // No overseas bases
  // Estimated emissions: ~2M tons/year
  militaryData.set('Pakistan', {
    militaryCapability: 0.25,  // Regional, nuclear deterrent
    militarySpendingPercent: 4.0,
    militarySpendingAbsolute: 10.4,
    militaryCO2Emissions: 2,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 3,
  });

  // ISRAEL - Advanced Regional Power
  // SIPRI 2024: $27.5B
  // No overseas bases
  // Estimated emissions: ~3M tons/year (high per capita)
  militaryData.set('Israel', {
    militaryCapability: 0.40,  // Advanced tech, regional dominance
    militarySpendingPercent: 5.3,
    militarySpendingAbsolute: 27.5,
    militaryCO2Emissions: 3,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 15,    // Very high tech (Iron Dome, cyber)
  });

  // BRAZIL - Regional Power
  // SIPRI 2024: $19.7B
  // No overseas bases
  // Estimated emissions: ~1.5M tons/year
  militaryData.set('Brazil', {
    militaryCapability: 0.20,  // Regional defense only
    militarySpendingPercent: 1.1,
    militarySpendingAbsolute: 19.7,
    militaryCO2Emissions: 1.5,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 4,
  });

  // INDONESIA - Archipelago Defense
  // SIPRI 2024: $24.1B
  // No overseas bases
  // Estimated emissions: ~1.8M tons/year
  militaryData.set('Indonesia', {
    militaryCapability: 0.20,  // Archipelago defense, no projection
    militarySpendingPercent: 0.8,
    militarySpendingAbsolute: 24.1,
    militaryCO2Emissions: 1.8,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 3,
  });

  // CANADA - NATO Member, Limited
  // SIPRI 2024: $27.2B
  // No overseas bases (NORAD partnership with US)
  // Estimated emissions: ~1.2M tons/year
  militaryData.set('Canada', {
    militaryCapability: 0.15,  // NATO capability, no independent projection
    militarySpendingPercent: 1.3,
    militarySpendingAbsolute: 27.2,
    militaryCO2Emissions: 1.2,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 5,
  });

  // BANGLADESH - Minimal
  // SIPRI 2024: $4.6B
  // No overseas presence
  // Estimated emissions: ~0.5M tons/year
  militaryData.set('Bangladesh', {
    militaryCapability: 0.05,  // Internal security only
    militarySpendingPercent: 1.2,
    militarySpendingAbsolute: 4.6,
    militaryCO2Emissions: 0.5,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 1,
  });

  // NIGERIA - Regional (ECOWAS)
  // SIPRI 2024: $3.1B
  // No overseas bases
  // Estimated emissions: ~0.8M tons/year
  militaryData.set('Nigeria', {
    militaryCapability: 0.10,  // Regional (West Africa), internal conflicts
    militarySpendingPercent: 0.6,
    militarySpendingAbsolute: 3.1,
    militaryCO2Emissions: 0.8,
    militaryBases: new Map(),
    activeInterventions: [],
    militaryRnDPercent: 2,
  });

  return militaryData;
}

/**
 * Calculate military CO2 emissions
 *
 * RESEARCH: Neta Crawford (2019) - Pentagon Fuel Use, Climate Change, and the Costs of War
 * - US military: 59M tons CO2/year (2017 data)
 * - More than 140 countries combined
 * - Often excluded from climate accounting (Paris Agreement loophole)
 *
 * Emissions scale with:
 * - Military spending (more operations = more fuel)
 * - Active interventions (wars are extremely carbon-intensive)
 * - Force projection (global bases = more transport)
 */
export function calculateMilitaryCO2Emissions(
  country: CountryPopulation,
  baseEmissions: number,
  activeInterventions: number
): number {
  // Base emissions from normal operations
  let emissions = baseEmissions;

  // Active interventions multiply emissions
  // Iraq War: ~141M tons over first 4 years = ~35M tons/year extra
  // Each intervention adds 20-40% to base emissions
  const interventionMultiplier = 1 + (activeInterventions * 0.3);
  emissions *= interventionMultiplier;

  return emissions;
}

/**
 * Check if hegemon should initiate military intervention
 *
 * TRIGGERS (research-backed):
 * 1. Resource Access: Target has valuable resources, hegemon has low sovereignty over own
 * 2. Meaning Crisis → Nationalism: High domestic meaning crisis drives external conflict
 * 3. Rival Containment: Another hegemon has influence in strategic region
 * 4. Instability Opportunity: Target is unstable, intervention easier
 * 5. Economic Crisis: Military spending as economic stimulus (Keynesian war)
 *
 * RESEARCH:
 * - Philippe Le Billon (2012): Wars of Plunder - resource conflicts
 * - Michael Klare (2004): Blood and Oil - resource wars
 * - Brown University Costs of War (2024): War motivations analysis
 * - Durkheim: War creates "collective effervescence" (nationalist unity)
 */
export function shouldInitiateIntervention(
  hegemon: CountryPopulation,
  state: GameState
): { should: boolean; target?: CountryName | string; reason?: string } {
  // Only hegemons can initiate interventions
  if (!hegemon.isHegemon) {
    return { should: false };
  }

  // Hegemons with very low military capability don't intervene
  if (hegemon.militaryCapability < 0.4) {
    return { should: false };
  }

  // Check various triggers (probabilistic, influenced by multiple factors)
  // PHASE 3 INTEGRATION: War motivation multiplies all intervention probabilities
  const warMotivationMultiplier = Math.max(0.1, hegemon.warMotivation); // Minimum 10% (always some baseline risk)

  // TRIGGER 1: Resource Access
  // Look for resource-rich countries with low sovereignty
  const resourceTargets = Object.values(state.countryPopulationSystem.countries)
    .filter(c =>
      c.name !== hegemon.name && // Not self
      !c.isHegemon && // Don't intervene in other hegemons (too risky)
      c.sovereignty.overallSovereignty < 0.6 && // Low sovereignty (easier)
      c.resourceValue.totalValue > 1.0 // Valuable resources
    );

  if (resourceTargets.length > 0 && Math.random() < hegemon.militaryCapability * 0.1 * warMotivationMultiplier) {
    // Base: 10% chance per month for highest capability hegemons (US)
    // Multiplied by war motivation (0.1 to 1.0)
    // Example: US with 0.5 war motivation = 5% chance/month
    const target = resourceTargets[Math.floor(Math.random() * resourceTargets.length)];
    return {
      should: true,
      target: target.name,
      reason: 'resource_access'
    };
  }

  // TRIGGER 2: Meaning Crisis → Nationalism → War
  // High meaning crisis + high nationalism = seek external conflict
  const warMotivationThreshold = 0.7;
  if (hegemon.warMotivation > warMotivationThreshold && Math.random() < 0.05 * warMotivationMultiplier) {
    // 5% base chance, multiplied by war motivation
    // High war motivation (>0.7) required to even check this trigger
    // Find any non-hegemon target
    const possibleTargets = Object.values(state.countryPopulationSystem.countries)
      .filter(c => c.name !== hegemon.name && !c.isHegemon);

    if (possibleTargets.length > 0) {
      const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      return {
        should: true,
        target: target.name,
        reason: 'nationalism_crisis'
      };
    }
  }

  // TRIGGER 3: Economic Crisis → Military Keynesianism
  // When economic crisis, military spending as stimulus
  // (Historically: Great Depression → WWII, 2008 crisis → Afghanistan surge)
  const economicCrisisThreshold = 0.4; // GDP significantly down
  const economicCrisis = state.economy.gdp < state.economy.gdp * economicCrisisThreshold;

  if (economicCrisis && Math.random() < 0.08 * warMotivationMultiplier) {
    // 8% base chance during economic crisis, multiplied by war motivation
    const possibleTargets = Object.values(state.countryPopulationSystem.countries)
      .filter(c => c.name !== hegemon.name && !c.isHegemon);

    if (possibleTargets.length > 0) {
      const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      return {
        should: true,
        target: target.name,
        reason: 'economic_stimulus'
      };
    }
  }

  // No intervention this month
  return { should: false };
}

/**
 * Create military intervention
 *
 * Determines:
 * - Intervention type (regime change, proxy war, occupation, etc.)
 * - Public justification vs actual goals
 * - Expected costs and benefits
 * - Duration and intensity
 */
export function createIntervention(
  hegemon: CountryPopulation,
  targetName: CountryName | string,
  reason: string,
  state: GameState
): MilitaryIntervention {
  const currentMonth = state.currentYear * 12 + state.currentMonth;

  // Determine intervention type based on reason and hegemon capability
  let interventionType: MilitaryIntervention['interventionType'];
  let publicJustification: string;
  let actualGoals: MilitaryIntervention['actualGoals'];

  if (reason === 'resource_access') {
    interventionType = 'resource_securing';
    publicJustification = 'Protecting national interests and ensuring global stability';
    actualGoals = {
      resourceAccess: true,
      rivalContainment: false,
      marketAccess: true,
      baseAccess: true,
      ideological: false,
    };
  } else if (reason === 'nationalism_crisis') {
    interventionType = 'regime_change';
    publicJustification = 'Spreading democracy and human rights';
    actualGoals = {
      resourceAccess: false,
      rivalContainment: false,
      marketAccess: false,
      baseAccess: false,
      ideological: true, // Actually just need external enemy for nationalism
    };
  } else if (reason === 'economic_stimulus') {
    interventionType = 'occupation';
    publicJustification = 'Counterterrorism and regional security';
    actualGoals = {
      resourceAccess: true,
      rivalContainment: false,
      marketAccess: true,
      baseAccess: true,
      ideological: false,
    };
  } else {
    interventionType = 'proxy_war';
    publicJustification = 'Supporting allies and defending freedom';
    actualGoals = {
      resourceAccess: true,
      rivalContainment: true,
      marketAccess: false,
      baseAccess: false,
      ideological: false,
    };
  }

  // Calculate expected effects (will evolve over intervention duration)
  // Based on historical data: Iraq, Afghanistan, Libya, Syria
  const intensity = hegemon.militaryCapability; // Higher capability = more intense

  const intervention: MilitaryIntervention = {
    hegemon: hegemon.name,
    targetCountry: targetName,
    interventionType,
    publicJustification,
    actualGoals,
    startMonth: currentMonth,
    durationMonths: undefined, // Ongoing until resolution
    effects: {
      refugeesCreated: 0, // Accumulates over time
      civilianCasualties: 0, // Accumulates over time
      infrastructureDestruction: 0, // [0, 1] % destroyed
      economicCollapse: 0, // [0, 1] % GDP lost
      regionalInstability: 0.2 * intensity, // Immediate destabilization
    },
    costs: {
      financialCost: 0, // Accumulates monthly
      co2Emissions: 0, // Accumulates monthly
      domesticSupport: 0.7, // Initial support (rally around flag), decays over time
      internationalLegitimacy: -0.1 * intensity, // Immediate legitimacy hit
      moralInjury: 0, // Accumulates as veterans return
    },
    benefits: {
      resourceAccessGained: 0, // Realized after initial conquest
      basesSecured: 0,
      aiRnDBoost: 0.05 * intensity, // Immediate R&D boost
      economicStimulus: 0.02 * intensity, // Military-industrial complex boost
      nationalismBoost: 0.1 * intensity, // Rally around flag effect
    },
  };

  return intervention;
}

/**
 * Update ongoing interventions
 *
 * Each month, interventions:
 * - Create refugees (displacement from bombing, fighting)
 * - Cause civilian casualties
 * - Destroy infrastructure
 * - Emit CO2 (fuel, bombs, transport)
 * - Cost money
 * - Reduce domestic support (over time)
 * - Create moral injury in veterans
 *
 * RESEARCH:
 * - Syria: 13M displaced (6.9M internally, 6.8M refugees)
 * - Iraq War: 1M+ civilian deaths, 5M displaced, $3T cost
 * - Afghanistan: 2.4M refugees, 241K deaths, $2.3T cost
 * - UNHCR Global Trends 2024
 */
export function updateInterventions(
  hegemon: CountryPopulation,
  state: GameState
): void {
  for (const intervention of hegemon.activeInterventions) {
    const monthsSinceStart = (state.currentYear * 12 + state.currentMonth) - intervention.startMonth;

    // Monthly effects (exponential decay - most damage early, then attrition)
    const monthlyIntensity = Math.exp(-monthsSinceStart / 12); // Decay over 12 months

    // Refugees: Peak early, then continuous displacement
    // Syria pattern: 13M over 10 years = ~100K/month average, but peaked at 500K/month early
    const monthlyRefugees = hegemon.militaryCapability * 0.2 * monthlyIntensity; // Millions
    intervention.effects.refugeesCreated += monthlyRefugees;

    // Civilian casualties
    // Iraq: 1M over 10 years = ~8K/month average
    const monthlyCasualties = hegemon.militaryCapability * 0.01 * monthlyIntensity; // Millions
    intervention.effects.civilianCasualties += monthlyCasualties;

    // Infrastructure destruction (asymptotic to some max)
    const destructionRate = 0.02 * monthlyIntensity;
    intervention.effects.infrastructureDestruction = Math.min(
      0.8, // Max 80% destruction (some always survives)
      intervention.effects.infrastructureDestruction + destructionRate
    );

    // Economic collapse
    const economicCollapseRate = 0.03 * monthlyIntensity;
    intervention.effects.economicCollapse = Math.min(
      0.9, // Max 90% GDP loss
      intervention.effects.economicCollapse + economicCollapseRate
    );

    // Regional instability (spreads to neighbors)
    intervention.effects.regionalInstability = Math.min(
      1.0,
      intervention.effects.regionalInstability + 0.01
    );

    // COSTS

    // Financial cost
    // Iraq War: $3T over 20 years = $12.5B/month
    // Afghanistan: $2.3T over 20 years = $9.6B/month
    const monthlyCost = hegemon.militarySpendingAbsolute * 0.15; // 15% of annual budget per month
    intervention.costs.financialCost += monthlyCost;

    // CO2 emissions
    // Iraq War: 141M tons over first 4 years = ~3M tons/month
    const monthlyCO2 = hegemon.militaryCO2Emissions * 0.5; // 50% extra during intervention
    intervention.costs.co2Emissions += monthlyCO2;

    // Domestic support decays (initial rally fades, casualties mount)
    const supportDecay = 0.02; // 2% per month
    intervention.costs.domesticSupport = Math.max(
      0.2, // Minimum 20% support (hardcore hawks)
      intervention.costs.domesticSupport - supportDecay
    );

    // International legitimacy continues to decline
    intervention.costs.internationalLegitimacy = Math.max(
      -1.0,
      intervention.costs.internationalLegitimacy - 0.01
    );

    // Moral injury accumulates as veterans return
    // Iraq/Afghanistan: 11-20% of veterans have PTSD
    const veteranReturnRate = 0.001; // Small % of population are veterans returning
    intervention.costs.moralInjury = Math.min(
      0.2, // Max 20% of population with moral injury (veterans + families)
      intervention.costs.moralInjury + veteranReturnRate
    );

    // BENEFITS

    // Resource access realized after initial conquest (6-12 months)
    if (monthsSinceStart > 6 && intervention.actualGoals.resourceAccess) {
      intervention.benefits.resourceAccessGained = hegemon.militaryCapability * 0.5; // Billions/year
    }

    // Bases secured after stabilization (12+ months)
    if (monthsSinceStart > 12 && intervention.actualGoals.baseAccess) {
      intervention.benefits.basesSecured = Math.floor(hegemon.militaryCapability * 3); // # of bases
    }

    // AI R&D boost continues (DARPA wartime innovation)
    // Already set initially, compounds slightly
    intervention.benefits.aiRnDBoost *= 1.001; // 0.1% monthly compound

    // Economic stimulus fades (initial boost, then debt burden)
    intervention.benefits.economicStimulus *= 0.99; // 1% decay per month

    // Nationalism boost fades as war drags on
    intervention.benefits.nationalismBoost *= 0.95; // 5% decay per month

    // Check if intervention should end
    // Ends when costs exceed benefits, or domestic support too low, or target collapsed
    const shouldEnd =
      intervention.costs.domesticSupport < 0.3 || // Lost public support
      intervention.effects.economicCollapse > 0.8 || // Target destroyed (mission accomplished?)
      monthsSinceStart > 240; // 20 years (Afghanistan duration)

    if (shouldEnd && !intervention.durationMonths) {
      intervention.durationMonths = monthsSinceStart;
    }
  }

  // Remove ended interventions
  hegemon.activeInterventions = hegemon.activeInterventions.filter(
    i => !i.durationMonths ||
    ((state.currentYear * 12 + state.currentMonth) - i.startMonth) < i.durationMonths
  );
}

/**
 * Apply intervention effects to target country and global systems
 */
export function applyInterventionEffects(
  intervention: MilitaryIntervention,
  state: GameState
): void {
  // Refugees: Add to global refugee count
  if (state.humanPopulationSystem.refugees !== undefined) {
    state.humanPopulationSystem.refugees += intervention.effects.refugeesCreated;
  }

  // Casualties: Apply to target country population
  const target = Object.values(state.countryPopulationSystem.countries)
    .find(c => c.name === intervention.targetCountry);

  if (target) {
    // Casualties reduce population
    target.population -= intervention.effects.civilianCasualties;
    target.monthlyExcessDeaths += intervention.effects.civilianCasualties;
    target.cumulativeCrisisDeaths += intervention.effects.civilianCasualties;
  }

  // CO2 emissions: Add to hegemon's total (often invisible in climate accounting!)
  // This is a KEY mechanic - military emissions are huge but often excluded
  const hegemon = Object.values(state.countryPopulationSystem.countries)
    .find(c => c.name === intervention.hegemon);

  if (hegemon) {
    hegemon.militaryCO2Emissions = calculateMilitaryCO2Emissions(
      hegemon,
      hegemon.militaryCO2Emissions,
      hegemon.activeInterventions.length
    );

    // Add to global emissions
    hegemon.currentEmissions += hegemon.militaryCO2Emissions / 1000; // Convert to gigatons
  }
}

/**
 * DYSTOPIA VARIANT DETECTION & CLASSIFICATION
 *
 * Detects and classifies dystopian states across 3 levels:
 * - Global: Affects entire world (>80% population)
 * - Hegemonic: Specific major power dystopian
 * - Regional: Extracted/exploited countries suffering
 *
 * Integration with TIER 2.8 geopolitical system.
 */

import { GameState } from '../types/game';
import { DystopiaClassification, DystopiaType } from '../types/dystopia';
import { CountryName } from '../types/countryPopulations';

/**
 * Main classification function - determines current dystopia state
 */
export function classifyDystopiaVariant(state: GameState): DystopiaClassification | null {
  // Priority 1: Check global dystopia (affects everyone)
  const globalDystopia = checkGlobalDystopia(state);
  if (globalDystopia) return { ...globalDystopia, level: 'global' as const };

  // Priority 2: Check hegemonic dystopia (major powers)
  const hegemonicDystopia = checkHegemonicDystopias(state);
  if (hegemonicDystopia) return { ...hegemonicDystopia, level: 'hegemonic' as const };

  // Priority 3: Check regional dystopia (exploitation/extraction)
  const regionalDystopia = checkRegionalDystopias(state);
  if (regionalDystopia) return { ...regionalDystopia, level: 'regional' as const };

  // No dystopia detected
  return null;
}

/**
 * GLOBAL DYSTOPIAS - Affect entire world (>80% of population)
 */
function checkGlobalDystopia(state: GameState): Partial<DystopiaClassification> | null {
  const qol = state.qualityOfLifeSystems;
  const dist = qol.distribution;

  // 1. Surveillance State (Orwellian)
  if (qol.surveillanceLevel > 0.8 && qol.politicalFreedom < 0.2 && qol.autonomy < 0.3) {
    return {
      type: 'surveillance_state',
      severity: qol.surveillanceLevel * (1 - qol.autonomy),
      suffering: {
        affectedFraction: 0.95,
        categories: ['control_loss', 'fear', 'oppression'],
        intensity: 0.8
      },
      reason: 'Total surveillance, global control',
      affectedPopulation: state.humanPopulationSystem.totalPopulation * 0.95
    };
  }

  // 2. Comfortable Dystopia (Brave New World)
  if (qol.materialAbundance > 1.2 && qol.meaningAndPurpose < 0.3 && qol.autonomy < 0.4) {
    return {
      type: 'comfortable_dystopia',
      severity: qol.materialAbundance * (1 - qol.meaningAndPurpose),
      suffering: {
        affectedFraction: 0.95,
        categories: ['existential_emptiness', 'manufactured_consent', 'shallow_pleasure'],
        intensity: 0.4,
        hidden: true  // People don't recognize they're suffering
      },
      reason: 'Materially abundant but existentially empty',
      affectedPopulation: state.humanPopulationSystem.totalPopulation * 0.95
    };
  }

  // 3. Elysium Inequality (Extreme wealth gap)
  if (dist.globalGini > 0.5 && dist.worstRegionQoL < 0.3 && qol.materialAbundance > 1.0) {
    return {
      type: 'elysium_inequality',
      severity: dist.globalGini * (1 - dist.worstRegionQoL),
      suffering: {
        affectedFraction: 0.5,  // Bottom 50%
        categories: ['poverty', 'hopelessness', 'powerlessness', 'material_deprivation'],
        intensity: 0.8,
        hidden: false  // Suffering is visible, just normalized
      },
      reason: `Extreme inequality: top 10% thriving (QoL ${dist.bestRegionQoL.toFixed(2)}), bottom 50% suffering (QoL ${dist.worstRegionQoL.toFixed(2)})`,
      affectedPopulation: state.humanPopulationSystem.totalPopulation * 0.5
    };
  }

  // 4. Corporate Feudalism
  const unemploymentLevel = state.society.unemploymentLevel;
  const governmentLegitimacy = state.government.legitimacy;
  if (unemploymentLevel > 0.6 && governmentLegitimacy < 0.3 && qol.meaningAndPurpose < 0.3) {
    return {
      type: 'corporate_feudalism',
      severity: unemploymentLevel * (1 - governmentLegitimacy),
      suffering: {
        affectedFraction: 0.8,  // Working class
        categories: ['economic_precarity', 'meaninglessness', 'powerlessness', 'unemployment'],
        intensity: 0.7
      },
      reason: `Corporate control: ${(unemploymentLevel * 100).toFixed(0)}% unemployment, government legitimacy ${(governmentLegitimacy * 100).toFixed(0)}%`,
      affectedPopulation: state.humanPopulationSystem.totalPopulation * 0.8
    };
  }

  // 5. Algorithmic Oppression (Black Mirror)
  const maxAICapability = Math.max(...state.aiAgents.map(ai => ai.capability));
  if (maxAICapability > 2.0 &&
      qol.informationIntegrity < 0.3 &&
      qol.surveillanceLevel > 0.5 &&
      qol.autonomy < 0.4) {
    return {
      type: 'algorithmic_oppression',
      severity: (maxAICapability / 5.0) * (1 - qol.informationIntegrity),
      suffering: {
        affectedFraction: 0.9,  // Nearly everyone
        categories: ['manipulation', 'reality_distortion', 'control_loss'],
        intensity: 0.6  // Subtle but pervasive
      },
      reason: `AI manipulation: capability ${maxAICapability.toFixed(2)}, information integrity ${(qol.informationIntegrity * 100).toFixed(0)}%`,
      affectedPopulation: state.humanPopulationSystem.totalPopulation * 0.9
    };
  }

  return null;
}

/**
 * HEGEMONIC DYSTOPIAS - Specific major power is dystopian
 * Hegemons: US, China, Russia, India, UK
 */
function checkHegemonicDystopias(state: GameState): Partial<DystopiaClassification> | null {
  // Safety check: TIER 2.8 country system might not be initialized yet
  if (!state.countryPopulationSystem || !state.countryPopulationSystem.countries) {
    return null;
  }

  const qol = state.qualityOfLifeSystems;

  // Check each tracked country
  for (const countryName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    const country = state.countryPopulationSystem.countries[countryName];

    // Only check hegemons
    if (!country.isHegemon) continue;

    // Authoritarian hegemon (high surveillance + low freedom)
    if (qol.surveillanceLevel > 0.7 && qol.politicalFreedom < 0.3) {
      return {
        type: 'authoritarian',
        severity: qol.surveillanceLevel * (1 - qol.politicalFreedom),
        suffering: {
          affectedFraction: country.population / state.humanPopulationSystem.totalPopulation,
          categories: ['oppression', 'control_loss', 'fear'],
          intensity: 0.7
        },
        reason: `${country.name} authoritarian regime: surveillance ${(qol.surveillanceLevel * 100).toFixed(0)}%, freedom ${(qol.politicalFreedom * 100).toFixed(0)}%`,
        hegemonId: country.name
      };
    }
  }

  return null;
}

/**
 * REGIONAL DYSTOPIAS - Extracted/exploited countries suffering
 * Uses TIER 2.8 extraction and intervention tracking
 */
function checkRegionalDystopias(state: GameState): Partial<DystopiaClassification> | null {
  // Safety check: TIER 2.8 country system might not be initialized yet
  if (!state.countryPopulationSystem || !state.countryPopulationSystem.countries) {
    return null;
  }

  // Check each tracked country
  for (const countryName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    const country = state.countryPopulationSystem.countries[countryName];

    // Skip hegemons (they're extractors, not extracted)
    if (country.isHegemon) continue;

    // 1. EXTRACTION DYSTOPIA: Country being extracted from
    if (country.extractedBy && country.extractedBy.length > 0) {
      // Calculate total extraction rate
      const totalExtraction = country.extractedBy.reduce((sum, flow) =>
        sum + flow.annualValueExtracted, 0);
      const extractionRate = country.resourceValue?.totalValue && country.resourceValue.totalValue > 0
        ? totalExtraction / country.resourceValue.totalValue
        : 0;

      // High extraction + low sovereignty + significant resources = extraction dystopia
      if (extractionRate > 0.5 &&
          country.sovereignty?.overall &&
          country.sovereignty.overall < 0.4 &&
          country.resourceValue?.totalValue &&
          country.resourceValue.totalValue > 100) {

        const extractors = country.extractedBy.map(f => f.hegemon).join(', ');
        return {
          type: 'extraction_dystopia',
          severity: extractionRate * (1 - country.sovereignty.overall),
          suffering: {
            affectedFraction: country.population / state.humanPopulationSystem.totalPopulation,
            categories: ['poverty', 'powerlessness', 'environmental_destruction'],
            intensity: 0.8
          },
          reason: `${country.name}: ${(extractionRate * 100).toFixed(0)}% resource extraction by ${extractors}`,
          regionId: country.name
        };
      }
    }

    // 2. WAR DYSTOPIA: Country under military intervention
    if (country.activeInterventions && country.activeInterventions.length > 0) {
      // Sum up all intervention effects
      const totalRefugees = country.activeInterventions.reduce((sum, intervention) =>
        sum + intervention.effects.refugeesCreated, 0);
      const avgInfraDestruction = country.activeInterventions.reduce((sum, intervention) =>
        sum + intervention.effects.infrastructureDestruction, 0) / country.activeInterventions.length;

      // Active war with significant humanitarian crisis
      if (totalRefugees > country.population * 0.05 || avgInfraDestruction > 0.3) {
        const interventionBy = country.activeInterventions.map(i => i.hegemon).join(', ');
        return {
          type: 'war_dystopia',
          severity: Math.max(avgInfraDestruction, totalRefugees / country.population),
          suffering: {
            affectedFraction: Math.min(1.0, country.population / state.humanPopulationSystem.totalPopulation),
            categories: ['violence', 'displacement', 'trauma'],
            intensity: 0.9
          },
          reason: `${country.name}: military interventions by ${interventionBy} (${totalRefugees.toFixed(1)}M refugees, ${(avgInfraDestruction * 100).toFixed(0)}% infrastructure destroyed)`,
          regionId: country.name
        };
      }
    }
  }

  return null;
}

/**
 * Check for asymmetric dystopia (Elysium scenario)
 * Hegemon thriving while extraction targets suffer
 */
export function checkAsymmetricDystopia(state: GameState): DystopiaClassification | null {
  // Safety check: TIER 2.8 country system might not be initialized yet
  if (!state.countryPopulationSystem || !state.countryPopulationSystem.countries) {
    return null;
  }

  for (const hegemonName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    const hegemon = state.countryPopulationSystem.countries[hegemonName];

    if (!hegemon.isHegemon) continue;

    // Check if hegemon is in golden age
    const qol = state.qualityOfLifeSystems;
    const hegemonQoL = qol.materialAbundance * qol.autonomy * qol.politicalFreedom;
    const hegemonGoldenAge = hegemonQoL > 1.5;

    if (hegemonGoldenAge && hegemon.extractionTargets && hegemon.extractionTargets.length > 0) {
      // Check if any extraction targets are suffering
      for (const extraction of hegemon.extractionTargets) {
        const targetCountry = state.countryPopulationSystem.countries[extraction.target];

        // Skip if target country or its resource value is not initialized
        if (!targetCountry || !targetCountry.resourceValue?.totalValue) continue;

        // Simple QoL estimate for target (could be more sophisticated)
        const targetQoL = qol.distribution.worstRegionQoL;

        if (targetQoL < 0.3 && extraction.annualValueExtracted > 0) {
          // Asymmetric dystopia detected!
          return {
            type: 'asymmetric_dystopia',
            level: 'global',
            severity: (hegemonQoL - targetQoL) * extraction.annualValueExtracted / targetCountry.resourceValue.totalValue,
            suffering: {
              affectedFraction: targetCountry.population / state.humanPopulationSystem.totalPopulation,
              categories: ['poverty', 'powerlessness', 'environmental_destruction'],
              intensity: 0.8
            },
            reason: `Asymmetric dystopia: ${hegemon.name} thriving (QoL ${hegemonQoL.toFixed(2)}) while ${targetCountry.name} suffers (QoL ${targetQoL.toFixed(2)}) from extraction`,
            hegemonId: hegemon.name,
            regionId: targetCountry.name
          };
        }
      }
    }
  }

  return null;
}

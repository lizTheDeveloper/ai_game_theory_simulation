/**
 * DYSTOPIA STATUS TRACKING SYSTEM
 *
 * Manages dystopia as a STATUS (like Golden Age), not a terminal outcome.
 * Tracks entry, exit, variant changes, and duration.
 *
 * Called every month to update dystopia state.
 */

import { GameState } from '../types/game';
import { DystopiaState, DystopiaClassification, createDystopiaStateFromClassification } from '../types/dystopia';
import { classifyDystopiaVariant } from './dystopiaVariants';
import { CountryName } from '../types/countryPopulations';

/**
 * Main update function - call every month
 */
export function updateDystopiaStatus(state: GameState): void {
  // Classify current dystopia state
  const classification = classifyDystopiaVariant(state);

  // Update global dystopia state
  updateGlobalDystopia(state, classification);

  // Update regional/country-level dystopias
  updateRegionalDystopias(state);
}

/**
 * Update global dystopia state (main tracking)
 */
function updateGlobalDystopia(state: GameState, classification: DystopiaClassification | null): void {
  const dystopiaState = state.dystopiaState;

  if (classification) {
    // ENTERING or CONTINUING dystopia

    if (!dystopiaState.active) {
      // ENTRY: Transitioning INTO dystopia
      console.log(`🚨 ENTERING DYSTOPIA: ${classification.type} (${classification.level})`);
      console.log(`   Reason: ${classification.reason}`);
      console.log(`   Severity: ${(classification.severity * 100).toFixed(0)}%`);
      console.log(`   Affected: ${(classification.suffering.affectedFraction * 100).toFixed(0)}% of population`);

      dystopiaState.active = true;
      dystopiaState.variant = classification.type;
      dystopiaState.level = classification.level;
      dystopiaState.startMonth = state.currentMonth;
      dystopiaState.monthsInCurrentVariant = 0;
      dystopiaState.severity = classification.severity;
      dystopiaState.trajectory = 'stable';

    } else if (dystopiaState.variant !== classification.type) {
      // VARIANT CHANGE: One dystopia type to another
      console.log(`🔄 DYSTOPIA VARIANT CHANGE: ${dystopiaState.variant} → ${classification.type}`);
      console.log(`   Previous duration: ${dystopiaState.monthsInCurrentVariant} months`);
      console.log(`   New severity: ${(classification.severity * 100).toFixed(0)}%`);

      // Record previous variant in history
      if (dystopiaState.variant && dystopiaState.startMonth !== null) {
        dystopiaState.previousVariants.push({
          type: dystopiaState.variant,
          level: dystopiaState.level!,
          startMonth: dystopiaState.startMonth,
          endMonth: state.currentMonth,
          severity: dystopiaState.severity
        });
      }

      // Update to new variant
      dystopiaState.variant = classification.type;
      dystopiaState.level = classification.level;
      dystopiaState.startMonth = state.currentMonth;
      dystopiaState.monthsInCurrentVariant = 0;

      // Track trajectory
      const previousSeverity = dystopiaState.severity;
      dystopiaState.severity = classification.severity;
      dystopiaState.trajectory = classification.severity > previousSeverity ? 'worsening' :
                                  classification.severity < previousSeverity ? 'improving' : 'stable';

    } else {
      // CONTINUING in same dystopia variant
      // Track trajectory
      const previousSeverity = dystopiaState.severity;
      dystopiaState.severity = classification.severity;

      const delta = classification.severity - previousSeverity;
      if (delta > 0.05) {
        dystopiaState.trajectory = 'worsening';
      } else if (delta < -0.05) {
        dystopiaState.trajectory = 'improving';
      } else {
        dystopiaState.trajectory = 'stable';
      }
    }

    // Update duration counters
    dystopiaState.totalMonthsInDystopia++;
    dystopiaState.monthsInCurrentVariant++;

    // Update escape potential (simple heuristic for now)
    dystopiaState.reversible = classification.severity < 0.8;
    dystopiaState.monthsUntilLockIn = dystopiaState.reversible ? Math.max(0, 24 - dystopiaState.monthsInCurrentVariant) : null;

    // Update escape conditions based on type
    dystopiaState.escapeConditions = getEscapeConditions(classification.type, state);

  } else {
    // EXITING dystopia (no classification detected)
    if (dystopiaState.active) {
      console.log(`✅ EXITING DYSTOPIA: ${dystopiaState.variant}`);
      console.log(`   Duration: ${dystopiaState.monthsInCurrentVariant} months`);
      console.log(`   Total time in dystopia: ${dystopiaState.totalMonthsInDystopia} months`);

      // Record in history
      if (dystopiaState.variant && dystopiaState.startMonth !== null) {
        dystopiaState.previousVariants.push({
          type: dystopiaState.variant,
          level: dystopiaState.level!,
          startMonth: dystopiaState.startMonth,
          endMonth: state.currentMonth,
          severity: dystopiaState.severity
        });
      }

      // Clear active state
      dystopiaState.active = false;
      dystopiaState.variant = null;
      dystopiaState.level = null;
      dystopiaState.startMonth = null;
      dystopiaState.monthsInCurrentVariant = 0;
      dystopiaState.severity = 0;
      dystopiaState.trajectory = 'stable';
      dystopiaState.escapeConditions = [];
    }
  }
}

/**
 * Update regional/country-level dystopias
 */
function updateRegionalDystopias(state: GameState): void {
  // Safety check: TIER 2.8 country system might not be initialized yet
  if (!state.countryPopulationSystem || !state.countryPopulationSystem.countries) {
    return;
  }

  // Ensure regionalDystopias is initialized as a Map
  if (!state.regionalDystopias || !(state.regionalDystopias instanceof Map)) {
    state.regionalDystopias = new Map();
  }

  // Check each country for regional dystopia
  for (const countryName of Object.keys(state.countryPopulationSystem.countries) as CountryName[]) {
    const country = state.countryPopulationSystem.countries[countryName];

    // Check if this country is in dystopia
    let regionalClassification: DystopiaClassification | null = null;

    // Extraction dystopia
    if (country.extractedBy && country.extractedBy.length > 0) {
      const totalExtraction = country.extractedBy.reduce((sum, flow) =>
        sum + flow.annualValueExtracted, 0);
      const extractionRate = country.resourceValue?.totalValue && country.resourceValue.totalValue > 0
        ? totalExtraction / country.resourceValue.totalValue
        : 0;

      if (extractionRate > 0.5 &&
          country.sovereignty?.overall &&
          country.sovereignty.overall < 0.4) {
        regionalClassification = {
          type: 'extraction_dystopia',
          level: 'regional',
          severity: extractionRate * (1 - country.sovereignty.overall),
          suffering: {
            affectedFraction: country.population / state.humanPopulationSystem.totalPopulation,
            categories: ['poverty', 'powerlessness', 'environmental_destruction'],
            intensity: 0.8
          },
          reason: `Resource extraction`,
          regionId: country.name
        };
      }
    }

    // War dystopia
    if (country.activeInterventions && country.activeInterventions.length > 0 && !regionalClassification) {
      const totalRefugees = country.activeInterventions.reduce((sum, i) =>
        sum + i.effects.refugeesCreated, 0);

      if (totalRefugees > country.population * 0.05) {
        regionalClassification = {
          type: 'war_dystopia',
          level: 'regional',
          severity: totalRefugees / country.population,
          suffering: {
            affectedFraction: country.population / state.humanPopulationSystem.totalPopulation,
            categories: ['violence', 'displacement', 'trauma'],
            intensity: 0.9
          },
          reason: `Military intervention`,
          regionId: country.name
        };
      }
    }

    // Update or create regional dystopia state
    if (regionalClassification) {
      if (!state.regionalDystopias.has(countryName)) {
        // New regional dystopia
        const newState = createDystopiaStateFromClassification(regionalClassification, state.currentMonth);
        state.regionalDystopias.set(countryName, newState);
      } else {
        // Update existing regional dystopia
        const regionalState = state.regionalDystopias.get(countryName)!;
        regionalState.totalMonthsInDystopia++;
        regionalState.monthsInCurrentVariant++;
        regionalState.severity = regionalClassification.severity;
      }
    } else {
      // Country escaped dystopia
      if (state.regionalDystopias.has(countryName)) {
        const regionalState = state.regionalDystopias.get(countryName)!;
        if (regionalState.active) {
          regionalState.active = false;
          // Could remove from map or keep for history
        }
      }
    }
  }
}

/**
 * Get escape conditions based on dystopia type
 */
function getEscapeConditions(type: DystopiaClassification['type'], state: GameState): string[] {
  switch (type) {
    case 'surveillance_state':
      return [
        'Reduce surveillance below 70%',
        'Increase political freedom above 40%',
        'Restore autonomy above 50%'
      ];

    case 'authoritarian':
      return [
        'Democratic reforms',
        'Free elections',
        'Civil society support',
        'Increase political freedom above 40%'
      ];

    case 'comfortable_dystopia':
      return []; // Hard to escape - people don't want to leave

    case 'elysium_inequality':
      return [
        'Reduce Gini coefficient below 0.45',
        'Improve worst region QoL above 0.5',
        'Wealth redistribution policies'
      ];

    case 'corporate_feudalism':
      return [
        'Implement UBI or job guarantee',
        'Reduce unemployment below 40%',
        'Restore government legitimacy',
        'Labor organizing and antitrust'
      ];

    case 'algorithmic_oppression':
      return [
        'AI regulation and transparency',
        'Improve information integrity above 50%',
        'Data rights and privacy protections'
      ];

    case 'extraction_dystopia':
      return [
        'Resource nationalization',
        'Debt forgiveness',
        'Increase sovereignty above 60%',
        'Reparations from hegemons'
      ];

    case 'war_dystopia':
      return [
        'End foreign military interventions',
        'Peace negotiations',
        'Humanitarian aid',
        'Refugee resettlement'
      ];

    case 'asymmetric_dystopia':
      return [
        'End resource extraction',
        'Climate reparations',
        'Fair trade agreements',
        'Technology transfer'
      ];

    default:
      return ['Unknown escape path'];
  }
}

/**
 * Initialize dystopia state (called at game start)
 */
export function initializeDystopiaState(state: GameState): void {
  if (!state.dystopiaState) {
    state.dystopiaState = {
      active: false,
      variant: null,
      level: null,
      startMonth: null,
      totalMonthsInDystopia: 0,
      monthsInCurrentVariant: 0,
      severity: 0,
      trajectory: 'stable',
      previousVariants: [],
      reversible: true,
      monthsUntilLockIn: null,
      escapeConditions: []
    };
  }

  if (!state.regionalDystopias) {
    state.regionalDystopias = new Map();
  }
}

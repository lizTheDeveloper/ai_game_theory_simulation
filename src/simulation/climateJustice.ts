/**
 * TIER 2.8 Phase 4: Climate Justice & Environmental Debt
 *
 * Models the relationship between historical emissions and climate suffering:
 * - Climate debt calculation (historical emissions vs. current suffering)
 * - Reparations mechanics (North → South transfers)
 * - Migration pressure from climate impacts
 * - Technology transfer and climate finance
 *
 * RESEARCH BACKING:
 * - IPCC AR6 (2021): Historical responsibility for climate change
 * - Loss and Damage Fund (COP27 2022): $100B/year commitment
 * - Climate Equity Reference Calculator
 * - Our World in Data: Cumulative CO2 emissions by country
 * - UNHCR (2024): Climate displacement projections (1B by 2050)
 *
 * KEY MECHANISMS:
 * 1. Climate Debt = Historical Emissions × Climate Suffering Ratio
 *    - US: 400 Gt emissions, 0.05 suffering ratio = Massive debt
 *    - Bangladesh: 1 Gt emissions, 50.0 suffering ratio = Major creditor
 *
 * 2. Reparations Flow
 *    - Rich emitters → Poor victims
 *    - Formula: Debt × Willingness × Capacity
 *    - Reduces suffering, increases cooperation
 *
 * 3. Migration Pressure
 *    - Climate impacts → Displacement
 *    - Sea level rise, droughts, extreme weather
 *    - Overwhelms receiving countries
 *
 * 4. Technology Transfer
 *    - Green tech sharing (solar, carbon capture, adaptation)
 *    - Accelerates climate action in Global South
 */

import { GameState } from '../types/game';
import { CountryName, CountryPopulation } from '../types/countryPopulations';
import {
  assertFinite,
  assertStateProperty,
  assertProbability,
  assertInRange
} from './utils/assertions';

/**
 * Climate reparations willingness (political will to pay)
 * Based on domestic politics, international pressure, crisis severity
 */
export interface ClimateReparationsWillingness {
  baselineWillingness: number;       // [0, 1] Starting political will
  internationalPressure: number;     // [0, 1] Diplomatic pressure to pay
  domesticSupport: number;           // [0, 1] Public support for reparations
  crisisSeverity: number;            // [0, 1] How bad is the climate crisis
  effectiveWillingness: number;      // Final willingness after all factors
}

/**
 * Initialize climate justice tracking for all countries
 */
export function initializeClimateJustice(countries: Record<CountryName, CountryPopulation>): void {
  // FIX: Sort countries for deterministic iteration order
  const sortedCountries = Object.values(countries).sort((a, b) => a.name.localeCompare(b.name));
  for (const country of sortedCountries) {
    // Climate reparations willingness (varies by country politics)
    country.climateReparationsWillingness = calculateInitialWillingness(country);

    // Migration pressure starts at 0, grows with climate impacts
    country.climateMigrationPressure = 0.0;

    // Technology transfer tracking
    country.greenTechReceived = 0.0;
    country.greenTechShared = 0.0;
  }
}

/**
 * Calculate initial reparations willingness
 * Higher for progressive countries, lower for nationalist/conservative countries
 */
function calculateInitialWillingness(country: CountryPopulation): number {
  // Factors:
  // 1. High emitters have lower willingness (guilt vs. denial)
  // 2. Wealthy countries have higher capacity (can afford it)
  // 3. Democratic countries have higher transparency
  // 4. Nationalist countries have lower willingness

  switch (country.name) {
    // Progressive wealthy emitters (moderate willingness)
    case 'Germany': return 0.60; // Strong Green Party, EU climate leadership
    case 'United Kingdom': return 0.50; // Post-Brexit divided, but some support
    case 'France': return 0.55; // Macron climate rhetoric, but limited action
    case 'Canada': return 0.50; // Progressive rhetoric, fossil fuel reality

    // Major emitters with low willingness
    case 'United States': return 0.30; // Political polarization, fossil fuel lobbies
    case 'Russia': return 0.10; // Authoritarian, fossil fuel economy
    case 'China': return 0.40; // Growing middle class, but state control

    // Wealthy but smaller emitters
    case 'Japan': return 0.45; // Aging society, conservative politics

    // Middle-income with some capacity
    case 'Brazil': return 0.35; // Amazon custodian, but economic pressures
    case 'India': return 0.20; // Low emissions per capita, development priority
    case 'Indonesia': return 0.25; // Island nation, but limited capacity

    // Climate victims (receivers, not payers)
    case 'Bangladesh': return 0.0; // Creditor, not debtor
    case 'Pakistan': return 0.0; // Creditor, not debtor
    case 'Nigeria': return 0.0; // Creditor, not debtor

    // Regional conflicts
    case 'Israel': return 0.20; // Regional tensions, limited willingness

    default: return 0.30;
  }
}

/**
 * Update climate justice dynamics each month
 */
export function updateClimateJustice(state: GameState): void {
  // 1. Calculate climate debt (who owes what to whom)
  calculateClimateDebt(state);

  // 2. Process reparations transfers (if any)
  processReparationsTransfers(state);

  // 3. Update migration pressure from climate impacts
  updateClimateMigrationPressure(state);

  // 4. Process technology transfer
  processGreenTechTransfer(state);
}

/**
 * Calculate climate debt for all countries
 *
 * Formula: Debt = Historical Emissions × Current Suffering × Climate Severity
 *
 * Positive debt = Owes reparations (rich emitters)
 * Negative debt = Owed reparations (poor victims)
 */
function calculateClimateDebt(state: GameState): void {
  const countries = state.countryPopulationSystem.countries;
  const climateStability = assertStateProperty(
    state.environmentalAccumulation,
    'climateStability',
    { location: 'calculateClimateDebt', month: state.currentMonth }
  );
  const climateSeverity = assertProbability(1 - climateStability, {
    location: 'calculateClimateDebt',
    valueName: 'climateSeverity',
    month: state.currentMonth
  });

  // FIX: Sort countries for deterministic iteration order
  const sortedCountries = Object.values(countries).sort((a, b) => a.name.localeCompare(b.name));
  for (const country of sortedCountries) {
    // Historical emissions contribution (normalized)
    const historicalEmissions = assertStateProperty(
      country,
      'historicalEmissions',
      { location: 'calculateClimateDebt', month: state.currentMonth }
    );
    const emissionsShare = assertFinite(historicalEmissions / 1600, {
      location: 'calculateClimateDebt',
      valueName: 'emissionsShare',
      month: state.currentMonth,
      additionalInfo: { country: country.name, historicalEmissions }
    });

    // Climate suffering ratio (how much they suffer vs. caused)
    const sufferingRatio = assertStateProperty(
      country,
      'climateSufferingRatio',
      { location: 'calculateClimateDebt', month: state.currentMonth }
    );

    // Climate debt calculation
    // High emitters with low suffering = Positive debt (owe money)
    // Low emitters with high suffering = Negative debt (owed money)
    // Formula: caused - suffered
    // - caused = emissionsShare (normalized)
    // - suffered = emissionsShare * sufferingRatio (how much they actually suffer)
    // If sufferingRatio < 1: suffer less than caused → positive debt
    // If sufferingRatio > 1: suffer more than caused → negative debt
    const rawDebt = assertFinite(emissionsShare * (1 - sufferingRatio), {
      location: 'calculateClimateDebt',
      valueName: 'rawDebt',
      month: state.currentMonth,
      additionalInfo: { country: country.name, emissionsShare, sufferingRatio }
    });

    // Scale by climate severity (worse climate = more urgent transfers)
    // Only set debt if positive (countries with negative debt are receivers)
    country.climateReparationsOwed = assertFinite(Math.max(0, rawDebt * climateSeverity * 1000), {
      location: 'calculateClimateDebt',
      valueName: 'climateReparationsOwed',
      month: state.currentMonth,
      additionalInfo: { country: country.name, rawDebt, climateSeverity }
    });
  }
}

/**
 * Process reparations transfers from rich emitters to climate victims
 *
 * Transfer amount = Debt × Willingness × Capacity × International Pressure
 */
function processReparationsTransfers(state: GameState): void {
  const countries = state.countryPopulationSystem.countries;

  // Find payers (positive debt) and receivers (negative debt)
  const payers: Array<{country: CountryPopulation, amount: number}> = [];
  const receivers: Array<{country: CountryPopulation, need: number}> = [];

  const climateStability = assertStateProperty(
    state.environmentalAccumulation,
    'climateStability',
    { location: 'processReparationsTransfers', month: state.currentMonth }
  );

  // FIX: Sort countries for deterministic iteration order
  const sortedCountries = Object.values(countries).sort((a, b) => a.name.localeCompare(b.name));
  for (const country of sortedCountries) {
    const owed = assertStateProperty(
      country,
      'climateReparationsOwed',
      { location: 'processReparationsTransfers', month: state.currentMonth }
    );

    if (owed > 0) {
      // Country owes reparations
      const willingness = assertProbability(
        assertStateProperty(country, 'climateReparationsWillingness', {
          location: 'processReparationsTransfers',
          month: state.currentMonth
        }),
        { location: 'processReparationsTransfers', valueName: 'willingness', month: state.currentMonth }
      );
      const capacity = assertProbability(Math.min(1.0, country.sovereignty.overallSovereignty), {
        location: 'processReparationsTransfers',
        valueName: 'capacity',
        month: state.currentMonth,
        additionalInfo: { country: country.name }
      });

      // International pressure increases with crisis severity
      const pressure = assertInRange((1 - climateStability) * 0.5, 0, 1, {
        location: 'processReparationsTransfers',
        valueName: 'pressure',
        month: state.currentMonth,
        additionalInfo: { climateStability }
      });

      // Monthly transfer (fraction of total debt)
      const monthlyTransfer = assertFinite(owed * willingness * capacity * pressure * 0.01, {
        location: 'processReparationsTransfers',
        valueName: 'monthlyTransfer',
        month: state.currentMonth,
        additionalInfo: { country: country.name, owed, willingness, capacity, pressure }
      });

      payers.push({ country, amount: monthlyTransfer });
    } else {
      // Country is owed reparations (climate victim)
      const sufferingRatio = assertStateProperty(
        country,
        'climateSufferingRatio',
        { location: 'processReparationsTransfers', month: state.currentMonth }
      );
      const need = assertFinite(sufferingRatio * (1 - climateStability) * 10, {
        location: 'processReparationsTransfers',
        valueName: 'need',
        month: state.currentMonth,
        additionalInfo: { country: country.name, sufferingRatio, climateStability }
      });

      receivers.push({ country, need });
    }
  }

  // Distribute payments proportionally to need
  const totalNeed = assertFinite(receivers.reduce((sum, r) => sum + r.need, 0), {
    location: 'processReparationsTransfers',
    valueName: 'totalNeed',
    month: state.currentMonth
  });
  const totalPayments = assertFinite(payers.reduce((sum, p) => sum + p.amount, 0), {
    location: 'processReparationsTransfers',
    valueName: 'totalPayments',
    month: state.currentMonth
  });

  if (totalNeed > 0 && totalPayments > 0) {
    for (const receiver of receivers) {
      const share = assertProbability(receiver.need / totalNeed, {
        location: 'processReparationsTransfers',
        valueName: 'share',
        month: state.currentMonth,
        additionalInfo: { country: receiver.country.name }
      });
      const received = assertFinite(totalPayments * share, {
        location: 'processReparationsTransfers',
        valueName: 'received',
        month: state.currentMonth,
        additionalInfo: { country: receiver.country.name, totalPayments, share }
      });

      receiver.country.climateReparationsReceived = assertFinite(
        receiver.country.climateReparationsReceived + received,
        {
          location: 'processReparationsTransfers',
          valueName: 'climateReparationsReceived',
          month: state.currentMonth,
          additionalInfo: { country: receiver.country.name, received }
        }
      );

      // Reparations reduce climate suffering (adaptation funding)
      // Each $1B reduces suffering by 0.1% (diminishing returns)
      const sufferingReduction = assertInRange(Math.min(0.1, received * 0.001), 0, 0.1, {
        location: 'processReparationsTransfers',
        valueName: 'sufferingReduction',
        month: state.currentMonth,
        additionalInfo: { country: receiver.country.name, received }
      });
      receiver.country.climateSufferingRatio = assertFinite(
        Math.max(0.1, receiver.country.climateSufferingRatio! * (1 - sufferingReduction)),
        {
          location: 'processReparationsTransfers',
          valueName: 'climateSufferingRatio',
          month: state.currentMonth,
          additionalInfo: { country: receiver.country.name, sufferingReduction }
        }
      );
    }
  }
}

/**
 * Update climate migration pressure
 *
 * Driven by:
 * - Sea level rise (Bangladesh, Indonesia, island nations)
 * - Droughts and desertification (Sub-Saharan Africa, Middle East)
 * - Extreme weather events
 * - Food insecurity
 */
function updateClimateMigrationPressure(state: GameState): void {
  const countries = state.countryPopulationSystem.countries;
  const climateStability = assertStateProperty(
    state.environmentalAccumulation,
    'climateStability',
    { location: 'updateClimateMigrationPressure', month: state.currentMonth }
  );
  const climateSeverity = assertProbability(1 - climateStability, {
    location: 'updateClimateMigrationPressure',
    valueName: 'climateSeverity',
    month: state.currentMonth
  });

  // FIX: Sort countries for deterministic iteration order
  const sortedCountries = Object.values(countries).sort((a, b) => a.name.localeCompare(b.name));
  for (const country of sortedCountries) {
    // Base migration pressure from climate suffering
    const sufferingRatio = assertStateProperty(
      country,
      'climateSufferingRatio',
      { location: 'updateClimateMigrationPressure', month: state.currentMonth }
    );
    const basePressure = assertFinite(sufferingRatio * climateSeverity * 0.01, {
      location: 'updateClimateMigrationPressure',
      valueName: 'basePressure',
      month: state.currentMonth,
      additionalInfo: { country: country.name, sufferingRatio, climateSeverity }
    });

    // Amplifiers
    let pressure = basePressure;

    // Sea level rise (coastal/island nations)
    if (['Bangladesh', 'Indonesia', 'Nigeria'].includes(country.name)) {
      pressure *= 2.0; // Double for low-lying coastal areas
    }

    // Food insecurity amplifies migration (using biodiversity as proxy for food system health)
    const biodiversityIndex = assertStateProperty(
      state.environmentalAccumulation,
      'biodiversityIndex',
      { location: 'updateClimateMigrationPressure', month: state.currentMonth }
    );
    if (biodiversityIndex < 0.5) {
      pressure *= 1.5;
    }

    // Water scarcity amplifies migration
    const waterStress = assertStateProperty(
      state.freshwaterSystem,
      'waterStress',
      { location: 'updateClimateMigrationPressure', month: state.currentMonth }
    );
    pressure = assertFinite(pressure * (1 + waterStress), {
      location: 'updateClimateMigrationPressure',
      valueName: 'pressure',
      month: state.currentMonth,
      additionalInfo: { country: country.name, waterStress }
    });

    // Update migration pressure (cumulative)
    country.climateMigrationPressure = assertFinite(
      country.climateMigrationPressure + pressure,
      {
        location: 'updateClimateMigrationPressure',
        valueName: 'climateMigrationPressure',
        month: state.currentMonth,
        additionalInfo: { country: country.name, pressure }
      }
    );

    // Migration pressure affects population (people leave)
    if (country.climateMigrationPressure! > 0.1) {
      const emigrationRate = assertInRange(
        Math.min(0.01, country.climateMigrationPressure! * 0.001),
        0,
        0.01,
        {
          location: 'updateClimateMigrationPressure',
          valueName: 'emigrationRate',
          month: state.currentMonth,
          additionalInfo: { country: country.name, migrationPressure: country.climateMigrationPressure }
        }
      );
      country.population = assertFinite(country.population * (1 - emigrationRate), {
        location: 'updateClimateMigrationPressure',
        valueName: 'population',
        month: state.currentMonth,
        additionalInfo: { country: country.name, emigrationRate }
      });
    }
  }
}

/**
 * Process green technology transfer from rich to poor countries
 *
 * Technologies:
 * - Solar/wind deployment
 * - Carbon capture
 * - Climate adaptation (sea walls, drought-resistant crops)
 * - Early warning systems
 */
function processGreenTechTransfer(state: GameState): void {
  const countries = state.countryPopulationSystem.countries;

  // Check if relevant breakthrough techs are unlocked
  const techTreeState = state.techTreeState;
  if (!techTreeState) return;

  // Count unlocked green technologies
  const unlockedSet = new Set(techTreeState.unlockedTech || []);
  const greenTechUnlocked =
    (unlockedSet.has('cleanEnergy') ? 1 : 0) +
    (unlockedSet.has('carbonCapture') ? 1 : 0) +
    (unlockedSet.has('sustainableAgriculture') ? 1 : 0) +
    (unlockedSet.has('ecosystemManagement') ? 1 : 0);

  if (greenTechUnlocked === 0) return;

  // Rich countries share tech with poor countries
  const richDonors = Object.values(countries).filter(c =>
    c.historicalEmissions! > 50 && // Major emitters
    c.climateReparationsWillingness! > 0.4 // Willing to share
  );

  const poorRecipients = Object.values(countries).filter(c =>
    c.climateSufferingRatio! > 2.0 && // Climate victims
    c.greenTechReceived! < 5.0 // Haven't received much yet
  );

  // Climate severity increases urgency and international pressure
  const climateStability = assertStateProperty(
    state.environmentalAccumulation,
    'climateStability',
    { location: 'processGreenTechTransfer', month: state.currentMonth }
  );
  const climateSeverity = assertProbability(1 - climateStability, {
    location: 'processGreenTechTransfer',
    valueName: 'climateSeverity',
    month: state.currentMonth
  });

  for (const donor of richDonors) {
    // Transfer capacity scales with willingness, techs available, and climate urgency
    const willingness = assertStateProperty(
      donor,
      'climateReparationsWillingness',
      { location: 'processGreenTechTransfer', month: state.currentMonth }
    );
    const transferCapacity = assertFinite(
      willingness * greenTechUnlocked * climateSeverity * 0.1,
      {
        location: 'processGreenTechTransfer',
        valueName: 'transferCapacity',
        month: state.currentMonth,
        additionalInfo: { donor: donor.name, willingness, greenTechUnlocked, climateSeverity }
      }
    );

    for (const recipient of poorRecipients) {
      const transfer = assertFinite(transferCapacity / poorRecipients.length, {
        location: 'processGreenTechTransfer',
        valueName: 'transfer',
        month: state.currentMonth,
        additionalInfo: { donor: donor.name, recipient: recipient.name, transferCapacity }
      });

      recipient.greenTechReceived = assertFinite(recipient.greenTechReceived + transfer, {
        location: 'processGreenTechTransfer',
        valueName: 'greenTechReceived',
        month: state.currentMonth,
        additionalInfo: { recipient: recipient.name, transfer }
      });
      donor.greenTechShared = assertFinite(donor.greenTechShared + transfer, {
        location: 'processGreenTechTransfer',
        valueName: 'greenTechShared',
        month: state.currentMonth,
        additionalInfo: { donor: donor.name, transfer }
      });

      // Green tech reduces emissions
      if (recipient.greenTechReceived! > 1.0) {
        const currentEmissions = assertStateProperty(
          recipient,
          'currentEmissions',
          { location: 'processGreenTechTransfer', month: state.currentMonth }
        );
        recipient.currentEmissions = assertFinite(currentEmissions * 0.99, {
          location: 'processGreenTechTransfer',
          valueName: 'currentEmissions',
          month: state.currentMonth,
          additionalInfo: { recipient: recipient.name, currentEmissions }
        });
      }
    }
  }
}

/**
 * Get climate justice summary for a country
 */
export function getClimateJusticeSummary(country: CountryPopulation): {
  isCreditor: boolean;
  debtOrCredit: number;
  reparationsFlow: number;
  migrationPressure: number;
  techReceived: number;
} {
  const isCreditor = country.climateSufferingRatio > 2.0;
  const debtOrCredit = country.climateReparationsOwed;
  const reparationsFlow = isCreditor
    ? country.climateReparationsReceived
    : -country.climateReparationsOwed;

  return {
    isCreditor,
    debtOrCredit,
    reparationsFlow,
    migrationPressure: country.climateMigrationPressure,
    techReceived: country.greenTechReceived
  };
}

/**
 * Get global climate justice metrics
 */
export function getGlobalClimateJusticeMetrics(state: GameState): {
  totalReparationsPaid: number;
  totalReparationsReceived: number;
  totalMigrationPressure: number;
  techTransferVolume: number;
  climateJusticeScore: number; // [0, 1] How just is the system
} {
  const countries = Object.values(state.countryPopulationSystem.countries);

  const totalPaid = countries
    .filter(c => c.climateReparationsOwed > 0)
    .reduce((sum, c) => sum + c.climateReparationsOwed, 0);

  const totalReceived = countries
    .reduce((sum, c) => sum + c.climateReparationsReceived, 0);

  const totalMigration = countries
    .reduce((sum, c) => sum + c.climateMigrationPressure, 0);

  const techTransfer = countries
    .reduce((sum, c) => sum + c.greenTechReceived, 0);

  // Climate justice score: How well are reparations flowing
  const justiceScore = totalPaid > 0
    ? Math.min(1.0, totalReceived / totalPaid)
    : 0;

  return {
    totalReparationsPaid: totalPaid,
    totalReparationsReceived: totalReceived,
    totalMigrationPressure: totalMigration,
    techTransferVolume: techTransfer,
    climateJusticeScore: justiceScore
  };
}

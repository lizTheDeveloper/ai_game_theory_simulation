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
  for (const country of Object.values(countries)) {
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
  const climateSeverity = state.environmentalAccumulation.climateChange; // [0, 1]

  for (const country of Object.values(countries)) {
    // Historical emissions contribution (normalized)
    const emissionsShare = country.historicalEmissions! / 1600; // Total ~1600 Gt since 1850

    // Climate suffering ratio (how much they suffer vs. caused)
    const sufferingRatio = country.climateSufferingRatio!;

    // Climate debt calculation
    // High emitters with low suffering = Positive debt (owe money)
    // Low emitters with high suffering = Negative debt (owed money)
    // Formula: caused - suffered
    // - caused = emissionsShare (normalized)
    // - suffered = emissionsShare * sufferingRatio (how much they actually suffer)
    // If sufferingRatio < 1: suffer less than caused → positive debt
    // If sufferingRatio > 1: suffer more than caused → negative debt
    const rawDebt = emissionsShare * (1 - sufferingRatio);

    // Scale by climate severity (worse climate = more urgent transfers)
    // Only set debt if positive (countries with negative debt are receivers)
    country.climateReparationsOwed = Math.max(0, rawDebt * climateSeverity * 1000); // Billions $
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

  for (const country of Object.values(countries)) {
    if (country.climateReparationsOwed! > 0) {
      // Country owes reparations
      const willingness = country.climateReparationsWillingness || 0.3;
      const capacity = Math.min(1.0, (country.sovereignty?.overallSovereignty || 0.5));

      // International pressure increases with crisis severity
      const pressure = state.environmentalAccumulation.climateChange * 0.5;

      // Monthly transfer (fraction of total debt)
      const monthlyTransfer = country.climateReparationsOwed! * willingness * capacity * pressure * 0.01;

      payers.push({ country, amount: monthlyTransfer });
    } else {
      // Country is owed reparations (climate victim)
      const sufferingRatio = country.climateSufferingRatio!;
      const need = sufferingRatio * state.environmentalAccumulation.climateChange * 10; // Billions

      receivers.push({ country, need });
    }
  }

  // Distribute payments proportionally to need
  const totalNeed = receivers.reduce((sum, r) => sum + r.need, 0);
  const totalPayments = payers.reduce((sum, p) => sum + p.amount, 0);

  if (totalNeed > 0 && totalPayments > 0) {
    for (const receiver of receivers) {
      const share = receiver.need / totalNeed;
      const received = totalPayments * share;

      receiver.country.climateReparationsReceived =
        (receiver.country.climateReparationsReceived || 0) + received;

      // Reparations reduce climate suffering (adaptation funding)
      // Each $1B reduces suffering by 0.1% (diminishing returns)
      const sufferingReduction = Math.min(0.1, received * 0.001);
      receiver.country.climateSufferingRatio = Math.max(
        0.1,
        receiver.country.climateSufferingRatio! * (1 - sufferingReduction)
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
  const climateSeverity = state.environmentalAccumulation.climateChange;

  for (const country of Object.values(countries)) {
    // Base migration pressure from climate suffering
    const basePressure = country.climateSufferingRatio! * climateSeverity * 0.01;

    // Amplifiers
    let pressure = basePressure;

    // Sea level rise (coastal/island nations)
    if (['Bangladesh', 'Indonesia', 'Nigeria'].includes(country.name)) {
      pressure *= 2.0; // Double for low-lying coastal areas
    }

    // Food insecurity amplifies migration
    if (state.environmentalAccumulation.foodSecurity < 0.5) {
      pressure *= 1.5;
    }

    // Water scarcity amplifies migration
    const waterScarcity = 1.0 - (state.environmentalAccumulation.freshwaterAvailability || 0.8);
    pressure *= (1 + waterScarcity);

    // Update migration pressure (cumulative)
    country.climateMigrationPressure =
      (country.climateMigrationPressure || 0) + pressure;

    // Migration pressure affects population (people leave)
    if (country.climateMigrationPressure! > 0.1) {
      const emigrationRate = Math.min(0.01, country.climateMigrationPressure! * 0.001);
      country.population *= (1 - emigrationRate);
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
  const breakthroughTech = state.breakthroughTech;
  if (!breakthroughTech) return;

  // Count unlocked green technologies
  const greenTechUnlocked =
    (breakthroughTech.cleanEnergy?.unlocked ? 1 : 0) +
    (breakthroughTech.carbonCapture?.unlocked ? 1 : 0) +
    (breakthroughTech.sustainableAgriculture?.unlocked ? 1 : 0) +
    (breakthroughTech.ecosystemManagement?.unlocked ? 1 : 0);

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
  const climateSeverity = state.environmentalAccumulation.climateChange;

  for (const donor of richDonors) {
    // Transfer capacity scales with willingness, techs available, and climate urgency
    const transferCapacity = donor.climateReparationsWillingness! * greenTechUnlocked * climateSeverity * 0.1; // Monthly capacity

    for (const recipient of poorRecipients) {
      const transfer = transferCapacity / poorRecipients.length;

      recipient.greenTechReceived = (recipient.greenTechReceived || 0) + transfer;
      donor.greenTechShared = (donor.greenTechShared || 0) + transfer;

      // Green tech reduces emissions
      if (recipient.greenTechReceived! > 1.0) {
        recipient.currentEmissions! *= 0.99; // 1% reduction per month (with tech)
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
  const isCreditor = (country.climateSufferingRatio || 1.0) > 2.0;
  const debtOrCredit = country.climateReparationsOwed || 0;
  const reparationsFlow = isCreditor
    ? (country.climateReparationsReceived || 0)
    : -(country.climateReparationsOwed || 0);

  return {
    isCreditor,
    debtOrCredit,
    reparationsFlow,
    migrationPressure: country.climateMigrationPressure || 0,
    techReceived: country.greenTechReceived || 0
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
    .filter(c => (c.climateReparationsOwed || 0) > 0)
    .reduce((sum, c) => sum + (c.climateReparationsOwed || 0), 0);

  const totalReceived = countries
    .reduce((sum, c) => sum + (c.climateReparationsReceived || 0), 0);

  const totalMigration = countries
    .reduce((sum, c) => sum + (c.climateMigrationPressure || 0), 0);

  const techTransfer = countries
    .reduce((sum, c) => sum + (c.greenTechReceived || 0), 0);

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

/**
 * International Coordination Example
 *
 * Demonstrates international treaty formation and collective action problems.
 * Models G20 coordination on AI regulation and climate policy.
 */

import {
  loadCountries,
  createPolicyVector,
  calculatePolicyDistance,
  type CountryData,
  type PolicyVector,
} from '../src';

// Treaty proposal type (local to this example)
interface TreatyProposal {
  name: string;
  domain: string;
  requiredSupport: number;
  policyTarget: PolicyVector;
  economicCost: number;
  urgency: number;
}

// Load G20 governments
const g20CountryCodes = [
  'USA',
  'CHN',
  'JPN',
  'DEU',
  'IND',
  'GBR',
  'FRA',
  'BRA',
  'ITA',
  'CAN',
  'RUS',
  'KOR',
  'AUS',
  'MEX',
  'IDN',
  'SAU',
  'TUR',
  'ARG',
  'ZAF',
];

const allCountries = loadCountries();
const governments = Array.from(allCountries.entries())
  .filter(([code]) => g20CountryCodes.includes(code))
  .map(([code, data]) => [code, data] as [string, CountryData]);

// Treaty proposals
const treaties: TreatyProposal[] = [
  {
    name: 'Global AI Safety Framework',
    domain: 'technology',
    requiredSupport: 0.67, // 2/3 majority
    policyTarget: createPolicyVector({
      technology: -0.5, // Precautionary AI regulation
      civilLiberties: 0.3, // Balance privacy & innovation
      international: 0.8, // Strong multilateral cooperation
    }),
    economicCost: 0.02, // 2% of AI R&D
    urgency: 0.8, // High urgency (AI capabilities advancing rapidly)
  },
  {
    name: 'Paris Climate Agreement 2.0',
    domain: 'environmental',
    requiredSupport: 0.67,
    policyTarget: createPolicyVector({
      environmental: 0.8, // Strong climate action
      economic: -0.2, // Some economic costs
      international: 0.9, // Very strong multilateral cooperation
    }),
    economicCost: 0.05, // 5% of GDP over 10 years
    urgency: 0.9, // Existential urgency
  },
  {
    name: 'Digital Trade Agreement',
    domain: 'economic',
    requiredSupport: 0.5, // Simple majority
    policyTarget: createPolicyVector({
      economic: 0.6, // Free market orientation
      technology: 0.5, // Pro-innovation
      international: 0.7, // Multilateral trade
    }),
    economicCost: 0.01, // 1% compliance costs
    urgency: 0.4, // Moderate urgency
  },
];

// Attempt treaty formation
console.log('\n=== International Treaty Formation (G20) ===\n');
console.log('Research Foundation: Ostrom (2009), Axelrod (1984), Bostrom (2014)\n');

for (const treaty of treaties) {
  console.log(`\n--- ${treaty.name} ---\n`);
  console.log(`Required Support: ${(treaty.requiredSupport * 100).toFixed(0)}%`);
  console.log(`Economic Cost: ${(treaty.economicCost * 100).toFixed(1)}% of relevant budget`);
  console.log(`Urgency: ${(treaty.urgency * 100).toFixed(0)}%\n`);

  // Calculate support for treaty
  const supportingCountries: string[] = [];
  const opposingCountries: string[] = [];

  for (const [_code, country] of governments) {
    // For this example, assume country's current policy is neutral (0,0,0,0,0,0)
    // In a real implementation, this would come from historical policy data
    const countryPolicy = createPolicyVector({});

    const policyDistance = calculatePolicyDistance(
      countryPolicy,
      treaty.policyTarget
    );

    // Government supports if policy distance < threshold
    // AND state capacity sufficient to implement
    // AND economic cost acceptable
    const distanceThreshold = 0.8; // More lenient for urgent treaties
    const capacityThreshold = -0.5; // Minimum government effectiveness
    const costThreshold = 0.1; // Maximum acceptable cost

    const supports =
      policyDistance < distanceThreshold &&
      country.wgi.governmentEffectiveness > capacityThreshold &&
      treaty.economicCost < costThreshold;

    if (supports) {
      supportingCountries.push(country.name);
    } else {
      opposingCountries.push(country.name);
    }

    // Log details
    const supportStatus = supports ? '✓ SUPPORT' : '✗ OPPOSE';
    console.log(`${country.name.padEnd(15)} ${supportStatus}`);
    console.log(`  Policy Distance: ${policyDistance.toFixed(3)}`);
    console.log(`  State Capacity: ${country.wgi.governmentEffectiveness.toFixed(2)}`);
    console.log(
      `  Reason: ${
        !supports && policyDistance >= distanceThreshold
          ? 'Policy mismatch'
          : !supports && government.capacity.governmentEffectiveness <= capacityThreshold
            ? 'Insufficient capacity'
            : !supports
              ? 'Economic cost too high'
              : 'Aligned with treaty goals'
      }`
    );
    console.log('');
  }

  // Calculate outcome
  const supportRatio = supportingCountries.length / governments.length;
  const passed = supportRatio >= treaty.requiredSupport;

  console.log(`\n=== Treaty Outcome ===\n`);
  console.log(`Support: ${supportingCountries.length}/${governments.length} countries (${(supportRatio * 100).toFixed(1)}%)`);
  console.log(`Required: ${(treaty.requiredSupport * 100).toFixed(0)}%`);
  console.log(`Result: ${passed ? '✓ TREATY PASSED' : '✗ TREATY FAILED'}\n`);

  if (passed) {
    console.log(`Signatories: ${supportingCountries.join(', ')}\n`);
    console.log(`Holdouts: ${opposingCountries.join(', ')}\n`);

    // Compliance estimate
    const avgCapacity =
      supportingCountries.reduce((sum, name) => {
        const gov = governments.find(([_, c]) => c.name === name)!;
        return sum + gov[1].wgi.governmentEffectiveness;
      }, 0) / supportingCountries.length;

    const complianceRate = Math.max(0.3, Math.min(0.95, 0.6 + avgCapacity * 0.15));
    console.log(`Expected Compliance: ${(complianceRate * 100).toFixed(1)}%`);
    console.log(
      `(Based on average government effectiveness: ${avgCapacity.toFixed(2)})\n`
    );
  } else {
    console.log(`Reasons for failure:`);
    const reasonCounts = {
      policy: opposingCountries.filter((name) => {
        const gov = governments.find(([_, c]) => c.name === name)!;
        const countryPolicy = createPolicyVector({});
        return (
          calculatePolicyDistance(countryPolicy, treaty.policyTarget) >= 0.8
        );
      }).length,
      capacity: opposingCountries.filter((name) => {
        const gov = governments.find(([_, c]) => c.name === name)!;
        return gov[1].wgi.governmentEffectiveness <= -0.5;
      }).length,
      cost: opposingCountries.filter(() => treaty.economicCost >= 0.1).length,
    };

    console.log(`  Policy mismatch: ${reasonCounts.policy} countries`);
    console.log(`  Insufficient capacity: ${reasonCounts.capacity} countries`);
    console.log(`  Economic cost: ${reasonCounts.cost} countries\n`);
  }
}

// Analysis
console.log('\n=== Collective Action Insights ===\n');
console.log('1. Policy Distance Matters:');
console.log('   - Countries support treaties aligned with domestic policy positions');
console.log('   - Large policy distance (>0.8) → opposition\n');

console.log('2. State Capacity Constraints:');
console.log('   - Low-capacity states may want to support but cannot implement');
console.log('   - Creates "free rider" problem (benefit without contribution)\n');

console.log('3. Economic Costs:');
console.log('   - High-cost treaties face more opposition');
console.log('   - Developing countries more sensitive to costs\n');

console.log('4. Urgency Effect:');
console.log('   - High urgency (>0.8) increases support');
console.log('   - Existential threats enable coordination (COVID precedent)\n');

console.log('5. Compliance Gap:');
console.log('   - Treaty passage ≠ full compliance');
console.log('   - Expected compliance: 60-95% (depends on state capacity)\n');

console.log('');

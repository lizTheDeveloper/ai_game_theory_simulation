/**
 * Policy Crisis Response Example
 *
 * Demonstrates government policy response to different crisis types.
 * Models how state capacity, crisis urgency, and regime type affect response speed.
 */

import {
  Government,
  GovernmentType,
  generatePolicyResponse,
  PolicyDomain,
  createPolicyStimulus,
  loadCountry,
} from '../src';

// Load real governments with varying state capacities
const singapore = new Government({
  name: 'Singapore',
  countryCode: 'SGP',
  type: GovernmentType.AUTHORITARIAN_TECHNOCRACY,
  capacity: {
    governmentEffectiveness: 2.36, // Very high (WGI 2024)
    controlOfCorruption: 2.21, // Very low corruption
    regulatoryQuality: 2.01, // Excellent regulation
  },
  electionSchedule: {
    nextElection: null, // No regular elections
    cycleMonths: null,
  },
});

const germany = new Government({
  name: 'Germany',
  countryCode: 'DEU',
  type: GovernmentType.PARLIAMENTARY_DEMOCRACY,
  capacity: {
    governmentEffectiveness: 1.52, // High (WGI 2024)
    controlOfCorruption: 1.91, // Low corruption
    regulatoryQuality: 1.60, // Strong regulation
  },
  electionSchedule: {
    nextElection: 48, // 4 years
    cycleMonths: 48,
  },
});

const venezuela = new Government({
  name: 'Venezuela',
  countryCode: 'VEN',
  type: GovernmentType.HYBRID_REGIME,
  capacity: {
    governmentEffectiveness: -1.68, // Very low (WGI 2024)
    controlOfCorruption: -1.46, // High corruption
    regulatoryQuality: -2.17, // Poor regulation
  },
  electionSchedule: {
    nextElection: 60, // 5 years (irregular)
    cycleMonths: 60,
  },
});

const governments = [singapore, germany, venezuela];

// Crisis scenarios
const scenarios = [
  {
    name: 'AI Safety Crisis (Existential)',
    stimulus: createPolicyStimulus(PolicyDomain.TECHNOLOGY, {
      urgency: 0.95, // Existential threat
      crisisLevel: 0.9,
      publicOpinion: 0.8,
      evidenceStrength: 0.7,
      internationalPressure: 0.8,
    }),
  },
  {
    name: 'Climate Emergency (Severe)',
    stimulus: createPolicyStimulus(PolicyDomain.ENVIRONMENTAL, {
      urgency: 0.75, // Severe crisis
      crisisLevel: 0.7,
      publicOpinion: 0.6,
      evidenceStrength: 0.9,
      internationalPressure: 0.7,
    }),
  },
  {
    name: 'Economic Downturn (Moderate)',
    stimulus: createPolicyStimulus(PolicyDomain.ECONOMIC, {
      urgency: 0.55, // Moderate crisis
      crisisLevel: 0.5,
      publicOpinion: 0.4,
      evidenceStrength: 0.8,
      internationalPressure: 0.3,
    }),
  },
  {
    name: 'Routine Policy Update (Normal)',
    stimulus: createPolicyStimulus(PolicyDomain.TECHNOLOGY, {
      urgency: 0.3, // Routine
      crisisLevel: 0.2,
      publicOpinion: 0.5,
      evidenceStrength: 0.6,
      internationalPressure: 0.2,
    }),
  },
];

// Run scenarios
console.log('\n=== Government Policy Response Comparison ===\n');
console.log('Research Foundation: Boin et al. (2020), Lodge & Wegrich (2014)\n');
console.log('Crisis Acceleration: COVID-19 response (2020-2021) - governments responded 10x faster\n');

for (const scenario of scenarios) {
  console.log(`\n--- ${scenario.name} ---\n`);

  for (const government of governments) {
    const response = generatePolicyResponse(government, scenario.stimulus);

    console.log(`${government.name}:`);
    console.log(`  Response Time: ${response.implementationTime.toFixed(1)} months`);
    console.log(`  Effectiveness: ${(response.effectiveness * 100).toFixed(1)}%`);
    console.log(`  Policy Success Rate: ${(response.policySuccessRate * 100).toFixed(1)}%`);
    console.log(`  Implementation Noise: ±${(response.implementationNoise * 100).toFixed(1)}%`);
    console.log(
      `  AI Comprehension Lag: ${response.aiComprehensionLag.toFixed(1)} months (tech policy only)`
    );
    console.log('');
  }
}

// Analysis
console.log('\n=== Key Insights ===\n');
console.log('1. Crisis Urgency Effect:');
console.log('   - Existential crises (urgency > 0.9): ~10x faster response (COVID precedent)');
console.log('   - Severe crises (urgency > 0.7): ~4x faster');
console.log('   - Moderate crises (urgency > 0.5): ~2x faster');
console.log('   - Routine policy: Baseline response time\n');

console.log('2. State Capacity Effect:');
console.log('   - High capacity (Singapore GE=2.36): +71% policy success, 2.2 month noise');
console.log('   - Medium capacity (Germany GE=1.52): +46% policy success, 2.5 month noise');
console.log('   - Low capacity (Venezuela GE=-1.68): -50% policy success, 4.0 month noise\n');

console.log('3. Regime Type Effect:');
console.log('   - Authoritarian Technocracy: Fastest decisions (0.7x), longer comprehension lag (18-24mo)');
console.log('   - Parliamentary Democracy: Moderate speed (1.0x), balanced comprehension (12-18mo)');
console.log('   - Hybrid Regime: Slowest decisions (1.5x), longest comprehension (24-36mo)\n');

console.log('4. Policy Domain Effect:');
console.log('   - Economic policy: Fast response (familiar domain)');
console.log('   - Environmental policy: Moderate response (established frameworks)');
console.log('   - Technology policy: Slow response + AI comprehension lag (novel domain)\n');

console.log('');

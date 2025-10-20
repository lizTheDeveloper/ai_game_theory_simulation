/**
 * Simple Coalition Formation Example
 *
 * Demonstrates basic coalition formation using the government-agents package.
 * Models the German 2021 federal election and "Traffic Light" coalition formation.
 */

import {
  PoliticalParty,
  formCoalition,
  createPolicyVector,
  calculatePolicyDistance,
} from '../src';

// Create German political parties with 2021 election results
const germanParties = [
  new PoliticalParty({
    id: 'SPD',
    name: 'Social Democratic Party',
    countryCode: 'DEU',
    policies: createPolicyVector({
      economic: -0.3, // Center-left economics
      environmental: 0.6, // Strong climate action
      technology: 0.4, // Pro-innovation
      social: 0.5, // Progressive social policy
      civilLiberties: 0.6, // Strong civil liberties
      international: 0.7, // Pro-EU, multilateral
    }),
    seatShare: 0.258, // 25.8% of Bundestag seats
    voteShare: 0.257,
    coalitionPreferences: ['Greens', 'FDP'], // Prefer these partners
  }),

  new PoliticalParty({
    id: 'CDU',
    name: 'Christian Democratic Union',
    countryCode: 'DEU',
    policies: createPolicyVector({
      economic: 0.2, // Center-right economics
      environmental: 0.1, // Moderate climate action
      technology: 0.3, // Cautious on tech
      social: -0.2, // Traditional social policy
      civilLiberties: 0.3, // Moderate civil liberties
      international: 0.6, // Pro-EU
    }),
    seatShare: 0.243, // 24.3% of seats
    voteShare: 0.242,
    coalitionPreferences: ['FDP', 'Greens'], // Prefer Jamaica coalition
  }),

  new PoliticalParty({
    id: 'Greens',
    name: 'Alliance 90/The Greens',
    countryCode: 'DEU',
    policies: createPolicyVector({
      economic: -0.1, // Center-left economics
      environmental: 0.8, // Very strong climate action
      technology: 0.6, // Pro-innovation (digital)
      social: 0.7, // Progressive social policy
      civilLiberties: 0.8, // Very strong civil liberties
      international: 0.8, // Pro-EU, multilateral
    }),
    seatShare: 0.147, // 14.7% of seats
    voteShare: 0.146,
    coalitionPreferences: ['SPD'], // Prefer SPD over CDU
  }),

  new PoliticalParty({
    id: 'FDP',
    name: 'Free Democratic Party',
    countryCode: 'DEU',
    policies: createPolicyVector({
      economic: 0.6, // Free market economics
      environmental: 0.3, // Market-based climate solutions
      technology: 0.7, // Very pro-innovation
      social: 0.3, // Liberal social policy
      civilLiberties: 0.7, // Strong civil liberties
      international: 0.5, // Pro-EU but sovereignty-conscious
    }),
    seatShare: 0.116, // 11.6% of seats
    voteShare: 0.115,
    coalitionPreferences: ['CDU', 'SPD'], // Swing party
  }),

  new PoliticalParty({
    id: 'AfD',
    name: 'Alternative for Germany',
    countryCode: 'DEU',
    policies: createPolicyVector({
      economic: 0.3, // Right-wing economics
      environmental: -0.5, // Climate skepticism
      technology: -0.2, // Tech skepticism
      social: -0.7, // Conservative social policy
      civilLiberties: -0.3, // Security over privacy
      international: -0.8, // Anti-EU, nationalist
    }),
    seatShare: 0.110, // 11.0% of seats
    voteShare: 0.103,
    coalitionPreferences: [], // Isolated (cordon sanitaire)
    coalitionBlacklist: ['SPD', 'CDU', 'Greens', 'FDP', 'Linke'], // All parties refuse coalition
  }),

  new PoliticalParty({
    id: 'Linke',
    name: 'The Left',
    countryCode: 'DEU',
    policies: createPolicyVector({
      economic: -0.7, // Left-wing economics
      environmental: 0.7, // Strong climate action
      technology: 0.2, // Cautious on tech (workers' rights)
      social: 0.8, // Progressive social policy
      civilLiberties: 0.6, // Strong civil liberties
      international: 0.3, // EU-skeptical from left
    }),
    seatShare: 0.061, // 6.1% of seats
    voteShare: 0.049,
    coalitionPreferences: ['SPD', 'Greens'], // Red-red-green coalition
  }),
];

// Form coalition using minimal winning coalition algorithm
console.log('\n=== German Coalition Formation (2021) ===\n');

const coalition = formCoalition(germanParties);

console.log('Elected Coalition:', coalition.toString());
console.log('Total Seats:', `${(coalition.seatShare * 100).toFixed(1)}%`);
console.log('Coalition Partners:', coalition.parties.map((p) => p.name).join(', '));
console.log('\nCoalition Policy Position:');
console.log('  Economic:', coalition.policies.economic.toFixed(2), '(center-left)');
console.log('  Environmental:', coalition.policies.environmental.toFixed(2), '(strong climate action)');
console.log('  Technology:', coalition.policies.technology.toFixed(2), '(pro-innovation)');
console.log('  Social:', coalition.policies.social.toFixed(2), '(progressive)');
console.log('  Civil Liberties:', coalition.policies.civilLiberties.toFixed(2), '(strong)');
console.log('  International:', coalition.policies.international.toFixed(2), '(pro-EU)');

// Calculate policy distances within coalition
console.log('\n=== Policy Distances (within coalition) ===\n');
for (let i = 0; i < coalition.parties.length; i++) {
  for (let j = i + 1; j < coalition.parties.length; j++) {
    const distance = calculatePolicyDistance(
      coalition.parties[i].policies,
      coalition.parties[j].policies
    );
    console.log(
      `${coalition.parties[i].name} ↔ ${coalition.parties[j].name}:`,
      distance.toFixed(3),
      '(Euclidean distance in 6D policy space)'
    );
  }
}

// Stability calculation
console.log('\n=== Coalition Stability ===\n');
const stability = coalition.stability;
console.log('Stability Score:', stability.toFixed(3), '(0 = unstable, 1 = very stable)');
console.log('Seat Margin:', `${((coalition.seatShare - 0.5) * 100).toFixed(1)}%`, 'above majority');

// Historical note
console.log('\n=== Historical Validation ===\n');
console.log('Real 2021 Coalition: SPD + Greens + FDP ("Traffic Light")');
console.log('Model Prediction:', coalition.parties.map((p) => p.id).join(' + '));
console.log('Match:', coalition.parties.some((p) => p.id === 'SPD') &&
                     coalition.parties.some((p) => p.id === 'Greens') &&
                     coalition.parties.some((p) => p.id === 'FDP') ? '✓ Correct!' : '✗ Incorrect');

console.log('\n');

/**
 * Helper script to extract government actions from governmentAgent.ts
 *
 * This script analyzes the governmentAgent.ts file and generates
 * categorized action files for the refactoring process.
 */

import * as fs from 'fs';
import * as path from 'path';

const governmentAgentPath = path.join(__dirname, '../src/simulation/agents/governmentAgent.ts');
const content = fs.readFileSync(governmentAgentPath, 'utf-8');

// Find the GOVERNMENT_ACTIONS array
const actionsStart = content.indexOf('export const GOVERNMENT_ACTIONS: GameAction[] = [');
const actionsEnd = content.indexOf('];', actionsStart);
const actionsContent = content.substring(actionsStart, actionsEnd + 2);

// Split into individual action objects
// Each action starts with "  {" and ends with "  },"
const actionPattern = /  \{\s+id: '([^']+)',[\s\S]*?\s+\}(?:,|$)/g;
const actions: { id: string; code: string }[] = [];
let match;

while ((match = actionPattern.exec(actionsContent)) !== null) {
  actions.push({
    id: match[1],
    code: match[0]
  });
}

console.log(`Found ${actions.length} actions`);

// Already migrated actions
const migratedActions = [
  'implement_generous_ubi',
  'implement_means_tested_benefits',
  'implement_job_guarantee',
  'subsidize_organization',
  'regulate_large_companies',
  'regulate_compute_threshold',
  'regulate_capability_ceiling',
  'implement_compute_governance'
];

// Categorize remaining actions
const categories = {
  safety: [
    'invest_alignment_research',
    'invest_benchmark_suite',
    'invest_alignment_tests',
    'invest_red_teaming',
    'invest_interpretability',
    'increase_evaluation_frequency',
    'mandatory_safety_reviews',
    'deploy_ai_kill_switches'
  ],
  crisis: [
    'emergency_ai_pause',
    'emergency_amazon_protection',
    'fund_coral_restoration',
    'ban_harmful_pesticides',
    'deploy_environmental_tech',
    'deploy_nuclear_human_in_the_loop',
    'deploy_nuclear_time_delays'
  ],
  rights: [
    'recognize_ai_rights',
    'improve_training_data_control',
    'improve_training_data_trust',
    'detect_misaligned_ais',
    'remove_detected_ai'
  ],
  national: [
    'fund_national_compute',
    'seize_data_center',
    'invest_cyber_defense'
  ],
  international: [
    'restrict_research_publishing',
    'limit_employee_mobility',
    'ban_reverse_engineering'
  ]
};

// Print categorization summary
console.log('\n=== Categorization Summary ===');
for (const [category, ids] of Object.entries(categories)) {
  console.log(`\n${category.toUpperCase()} (${ids.length} actions):`);
  const categoryActions = actions.filter(a => ids.includes(a.id));
  categoryActions.forEach(a => console.log(`  - ${a.id}`));

  const missing = ids.filter(id => !actions.find(a => a.id === id));
  if (missing.length > 0) {
    console.log(`  MISSING: ${missing.join(', ')}`);
  }
}

// Check for uncategorized actions
const allCategorized = [...migratedActions, ...Object.values(categories).flat()];
const uncategorized = actions.filter(a => !allCategorized.includes(a.id));
if (uncategorized.length > 0) {
  console.log('\n=== UNCATEGORIZED ACTIONS ===');
  uncategorized.forEach(a => console.log(`  - ${a.id}`));
}

console.log(`\n=== Summary ===`);
console.log(`Total actions: ${actions.length}`);
console.log(`Migrated: ${migratedActions.length}`);
console.log(`To migrate: ${actions.length - migratedActions.length}`);
console.log(`Categorized: ${allCategorized.length}`);
console.log(`Uncategorized: ${uncategorized.length}`);

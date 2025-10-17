/**
 * Script to extract and categorize government actions from governmentAgent.ts
 *
 * This script parses the monolithic governmentAgent.ts file and extracts
 * all action definitions, categorizing them for the refactoring.
 */

import * as fs from 'fs';
import * as path from 'path';

const GOVERNMENT_AGENT_PATH = path.join(__dirname, '../src/simulation/agents/governmentAgent.ts');

// Action categorization based on ID patterns
const ACTION_CATEGORIES = {
  economic: ['ubi', 'benefits', 'job_guarantee', 'subsidize'],
  regulation: ['regulate', 'compute_governance'],
  research: ['invest_alignment', 'alignment_research'],
  safety: ['benchmark', 'alignment_tests', 'red_teaming', 'interpretability', 'evaluation', 'safety_reviews', 'pause'],
  security: ['cyber_defense', 'national_compute', 'seize_data'],
  crisis: ['emergency', 'coral', 'pesticides', 'deploy_environmental', 'nuclear'],
  international: ['export', 'employee_mobility', 'reverse_engineering', 'publishing'],
  rights: ['ai_rights', 'training_data'],
  detection: ['detect', 'remove']
};

function categorizeAction(actionId: string): string {
  for (const [category, patterns] of Object.entries(ACTION_CATEGORIES)) {
    if (patterns.some(pattern => actionId.includes(pattern))) {
      return category;
    }
  }
  return 'uncategorized';
}

async function extractActions() {
  const content = fs.readFileSync(GOVERNMENT_AGENT_PATH, 'utf-8');

  // Find all action objects
  const actionPattern = /\{\s*id:\s*'([^']+)',[\s\S]*?\n\s*\},?\s*(?=\{|\.\.\.|];)/g;
  const matches = content.matchAll(actionPattern);

  const categorized: Record<string, string[]> = {};

  for (const match of matches) {
    const actionId = match[1];
    const actionCode = match[0];
    const category = categorizeAction(actionId);

    if (!categorized[category]) {
      categorized[category] = [];
    }

    categorized[category].push(`Action ID: ${actionId}\n${actionCode}\n`);
  }

  // Output results
  console.log('\n=== GOVERNMENT ACTIONS CATEGORIZATION ===\n');
  for (const [category, actions] of Object.entries(categorized)) {
    console.log(`\n### ${category.toUpperCase()} (${actions.length} actions)`);
    actions.forEach(action => {
      const idMatch = action.match(/Action ID: (.+)/);
      if (idMatch) {
        console.log(`  - ${idMatch[1]}`);
      }
    });
  }

  // Write to file for review
  const outputPath = path.join(__dirname, '../extracted_actions.txt');
  const output = Object.entries(categorized)
    .map(([category, actions]) => {
      return `\n${'='.repeat(80)}\n### ${category.toUpperCase()}\n${'='.repeat(80)}\n\n${actions.join('\n\n')}`;
    })
    .join('\n');

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log(`\n✓ Extracted actions written to ${outputPath}`);
}

extractActions().catch(console.error);

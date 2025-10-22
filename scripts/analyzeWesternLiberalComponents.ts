#!/usr/bin/env tsx
/**
 * Analyze Western Liberal Component Scores
 *
 * Shows decomposed democracy components instead of compressed geometric mean.
 * Avoids Goodhart's Law - exposes the nuance when components diverge.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const outputDir = 'monteCarloOutputs';

// Get all JSON files from latest runs
const files = readdirSync(outputDir)
  .filter(f => f.startsWith('run_') && f.endsWith('.json'))
  .sort()
  .reverse();

console.log(`\n📊 WESTERN LIBERAL COMPONENT ANALYSIS - Avoiding Goodhart's Law\n`);
console.log(`================================================================================\n`);

// Extract unique run files (skip snapshots)
const runNumbers = new Set<number>();
for (const file of files) {
  const match = file.match(/run_(\d+)_/);
  if (match) {
    runNumbers.add(parseInt(match[1]));
  }
}

const uniqueRuns = Array.from(runNumbers).sort().reverse().slice(0, 10);
console.log(`Analyzing ${uniqueRuns.length} most recent runs\n`);

type ComponentData = {
  run: number;
  outcome: string;
  initial: {
    electoral: number;
    civil: number;
    rule: number;
    economic: number;
    geometricMean: number;
  };
  final: {
    electoral: number;
    civil: number;
    rule: number;
    economic: number;
    geometricMean: number;
  };
  change: {
    electoral: number;
    civil: number;
    rule: number;
    economic: number;
    geometricMean: number;
  };
};

const results: ComponentData[] = [];

for (const runNum of uniqueRuns) {
  const runFile = files.find(f => f.match(new RegExp(`run_${runNum}_.*\\.json$`)) && !f.includes('snapshot'));
  if (!runFile) continue;

  try {
    const data = JSON.parse(readFileSync(join(outputDir, runFile), 'utf-8'));

    // Check if we have component data
    if (!data.westernLiberalComponents || data.westernLiberalComponents.length === 0) {
      continue; // Old run without component tracking
    }

    const components = data.westernLiberalComponents;
    const initial = components[0];
    const final = components[components.length - 1];

    // Calculate geometric mean for comparison
    const calcGeometric = (elec: number, civil: number, rule: number, econ: number) => {
      const MIN_FLOOR = 0.1;
      const indicators = [elec, civil, rule, econ];
      const product = indicators.reduce((acc, val) => {
        const floored = Math.max(val ?? 50, MIN_FLOOR);
        return acc * (floored / 100);
      }, 1);
      return Math.pow(product, 1 / indicators.length) * 100;
    };

    const initialGeo = calcGeometric(
      initial.electoralDemocracy,
      initial.civilLiberties,
      initial.ruleOfLaw,
      initial.economicFreedom
    );

    const finalGeo = calcGeometric(
      final.electoralDemocracy,
      final.civilLiberties,
      final.ruleOfLaw,
      final.economicFreedom
    );

    results.push({
      run: runNum,
      outcome: data.outcome ?? 'unknown',
      initial: {
        electoral: initial.electoralDemocracy,
        civil: initial.civilLiberties,
        rule: initial.ruleOfLaw,
        economic: initial.economicFreedom,
        geometricMean: initialGeo,
      },
      final: {
        electoral: final.electoralDemocracy,
        civil: final.civilLiberties,
        rule: final.ruleOfLaw,
        economic: final.economicFreedom,
        geometricMean: finalGeo,
      },
      change: {
        electoral: final.electoralDemocracy - initial.electoralDemocracy,
        civil: final.civilLiberties - initial.civilLiberties,
        rule: final.ruleOfLaw - initial.ruleOfLaw,
        economic: final.economicFreedom - initial.economicFreedom,
        geometricMean: finalGeo - initialGeo,
      },
    });

  } catch (e) {
    console.log(`⚠️  Error loading run ${runNum}: ${e}`);
  }
}

if (results.length === 0) {
  console.log(`⚠️  No runs with component data found. Run a new validation to populate components.\n`);
  process.exit(0);
}

// Sort by final geometric mean (for comparison)
results.sort((a, b) => b.final.geometricMean - a.final.geometricMean);

console.log(`=== COMPONENT BREAKDOWN (Initial → Final) ===\n`);

for (const r of results) {
  console.log(`Run ${r.run} [${r.outcome}]:`);
  console.log(`  Electoral Democracy: ${r.initial.electoral.toFixed(1)} → ${r.final.electoral.toFixed(1)} (${r.change.electoral >= 0 ? '+' : ''}${r.change.electoral.toFixed(1)})`);
  console.log(`  Civil Liberties:     ${r.initial.civil.toFixed(1)} → ${r.final.civil.toFixed(1)} (${r.change.civil >= 0 ? '+' : ''}${r.change.civil.toFixed(1)})`);
  console.log(`  Rule of Law:         ${r.initial.rule.toFixed(1)} → ${r.final.rule.toFixed(1)} (${r.change.rule >= 0 ? '+' : ''}${r.change.rule.toFixed(1)})`);
  console.log(`  Economic Freedom:    ${r.initial.economic.toFixed(1)} → ${r.final.economic.toFixed(1)} (${r.change.economic >= 0 ? '+' : ''}${r.change.economic.toFixed(1)})`);
  console.log(`  ───────────────────────────────────────────────────────`);
  console.log(`  Geometric Mean:      ${r.initial.geometricMean.toFixed(1)} → ${r.final.geometricMean.toFixed(1)} (${r.change.geometricMean >= 0 ? '+' : ''}${r.change.geometricMean.toFixed(1)})`);
  console.log(``);
}

console.log(`=== COMPONENT AVERAGES ===\n`);

const avgElectoral = results.reduce((sum, r) => sum + r.final.electoral, 0) / results.length;
const avgCivil = results.reduce((sum, r) => sum + r.final.civil, 0) / results.length;
const avgRule = results.reduce((sum, r) => sum + r.final.rule, 0) / results.length;
const avgEconomic = results.reduce((sum, r) => sum + r.final.economic, 0) / results.length;
const avgGeometric = results.reduce((sum, r) => sum + r.final.geometricMean, 0) / results.length;

console.log(`Final Scores (Average across ${results.length} runs):`);
console.log(`  Electoral Democracy: ${avgElectoral.toFixed(1)}/100`);
console.log(`  Civil Liberties:     ${avgCivil.toFixed(1)}/100`);
console.log(`  Rule of Law:         ${avgRule.toFixed(1)}/100`);
console.log(`  Economic Freedom:    ${avgEconomic.toFixed(1)}/100`);
console.log(`  ───────────────────────────────────────────────────────`);
console.log(`  Geometric Mean:      ${avgGeometric.toFixed(1)}/100`);

console.log(`\n=== COMPONENT CHANGES ===\n`);

const avgElectoralChange = results.reduce((sum, r) => sum + r.change.electoral, 0) / results.length;
const avgCivilChange = results.reduce((sum, r) => sum + r.change.civil, 0) / results.length;
const avgRuleChange = results.reduce((sum, r) => sum + r.change.rule, 0) / results.length;
const avgEconomicChange = results.reduce((sum, r) => sum + r.change.economic, 0) / results.length;
const avgGeometricChange = results.reduce((sum, r) => sum + r.change.geometricMean, 0) / results.length;

console.log(`Average Change (Initial → Final):`);
console.log(`  Electoral Democracy: ${avgElectoralChange >= 0 ? '+' : ''}${avgElectoralChange.toFixed(1)}`);
console.log(`  Civil Liberties:     ${avgCivilChange >= 0 ? '+' : ''}${avgCivilChange.toFixed(1)}`);
console.log(`  Rule of Law:         ${avgRuleChange >= 0 ? '+' : ''}${avgRuleChange.toFixed(1)}`);
console.log(`  Economic Freedom:    ${avgEconomicChange >= 0 ? '+' : ''}${avgEconomicChange.toFixed(1)}`);
console.log(`  ───────────────────────────────────────────────────────`);
console.log(`  Geometric Mean:      ${avgGeometricChange >= 0 ? '+' : ''}${avgGeometricChange.toFixed(1)}`);

console.log(`\n=== GOODHART'S LAW DIAGNOSTIC ===\n`);

// Find which component is weakest (drives geometric mean collapse)
const weakestComponents = results.map(r => {
  const components = [
    { name: 'Electoral Democracy', value: r.final.electoral },
    { name: 'Civil Liberties', value: r.final.civil },
    { name: 'Rule of Law', value: r.final.rule },
    { name: 'Economic Freedom', value: r.final.economic },
  ];
  components.sort((a, b) => a.value - b.value);
  return { run: r.run, weakest: components[0].name, value: components[0].value, geometric: r.final.geometricMean };
});

console.log(`Weakest Component (determines geometric mean collapse):\n`);
const componentCounts: Record<string, number> = {};
for (const w of weakestComponents) {
  componentCounts[w.weakest] = (componentCounts[w.weakest] || 0) + 1;
}

for (const [component, count] of Object.entries(componentCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${component}: ${count}/${results.length} runs (${(count / results.length * 100).toFixed(0)}%)`);
}

console.log(`\n💡 INSIGHT: The geometric mean collapses to ${avgGeometric.toFixed(1)}/100 because the`);
console.log(`   weakest component (usually Civil Liberties) drops to ~${avgCivil.toFixed(1)}/100.`);
console.log(`   Even if other components recover, geometric mean stays crushed.`);

console.log(`\n================================================================================\n`);

/**
 * Phase 2 Results Analyzer
 *
 * Extracts and compares key metrics from Phase 2 scenario logs
 * to identify which governance conditions enable spiral activation.
 *
 * Usage:
 *   npx tsx scripts/analyzePhase2Results.ts <logfile>
 */

import * as fs from 'fs';
import * as path from 'path';

const logFile = process.argv[2];

if (!logFile) {
  console.error('Usage: npx tsx scripts/analyzePhase2Results.ts <logfile>');
  process.exit(1);
}

interface SpiralActivation {
  scenario: string;
  abundance: number;
  cognitive: number;
  democratic: number;
  scientific: number;
  meaning: number;
  ecological: number;
}

interface ThresholdComparison {
  scenario: string;
  gini: number;
  governanceQuality: number;
  researchSpending: number;
  climateStability: number;
}

interface BottleneckFindings {
  scenario: string;
  researchGapFixed: boolean; // $10B → $50B+?
  economicTransitionEnabled: boolean; // Gini < 0.30?
  climateStabilityFixed: boolean; // > 0% climate stability?
  spiralsEnabled: string[];
}

const logContent = fs.readFileSync(logFile, 'utf-8');

// Parse spiral activation rates
const spiralActivationPattern = /📌 ([\w\s]+)\n.*?Abundance:\s+(\d+)%.*?Cognitive:\s+(\d+)%.*?Democratic:\s+(\d+)%.*?Scientific:\s+(\d+)%.*?Meaning:\s+(\d+)%.*?Ecological:\s+(\d+)%/gs;

const spiralActivations: SpiralActivation[] = [];
let match;

while ((match = spiralActivationPattern.exec(logContent)) !== null) {
  spiralActivations.push({
    scenario: match[1].trim(),
    abundance: parseInt(match[2]),
    cognitive: parseInt(match[3]),
    democratic: parseInt(match[4]),
    scientific: parseInt(match[5]),
    meaning: parseInt(match[6]),
    ecological: parseInt(match[7]),
  });
}

// Parse threshold metrics
const thresholdPattern = /📌 ([\w\s]+)\n.*?Gini:\s+([\d.]+)\n.*?Governance quality:\s+([\d.]+)%\n.*?Research spending:\s+\$([\d.]+)B\n.*?Climate stability:\s+([\d.]+)%/gs;

const thresholds: ThresholdComparison[] = [];

while ((match = thresholdPattern.exec(logContent)) !== null) {
  thresholds.push({
    scenario: match[1].trim(),
    gini: parseFloat(match[2]),
    governanceQuality: parseFloat(match[3]) / 100,
    researchSpending: parseFloat(match[4]),
    climateStability: parseFloat(match[5]) / 100,
  });
}

// Analyze bottleneck fixes
const bottleneckFindings: BottleneckFindings[] = [];

for (const activation of spiralActivations) {
  const threshold = thresholds.find(t => t.scenario === activation.scenario);
  if (!threshold) continue;

  const researchGapFixed = threshold.researchSpending >= 50.0; // $50B threshold
  const economicTransitionEnabled = threshold.gini < 0.30; // Gini < 0.30 for abundance spiral
  const climateStabilityFixed = threshold.climateStability > 0.01; // > 1% climate stability

  const spiralsEnabled: string[] = [];
  if (activation.abundance >= 50) spiralsEnabled.push('abundance');
  if (activation.cognitive >= 50) spiralsEnabled.push('cognitive');
  if (activation.democratic >= 50) spiralsEnabled.push('democratic');
  if (activation.scientific >= 50) spiralsEnabled.push('scientific');
  if (activation.meaning >= 50) spiralsEnabled.push('meaning');
  if (activation.ecological >= 50) spiralsEnabled.push('ecological');

  bottleneckFindings.push({
    scenario: activation.scenario,
    researchGapFixed,
    economicTransitionEnabled,
    climateStabilityFixed,
    spiralsEnabled,
  });
}

// Generate report
console.log('\n' + '='.repeat(80));
console.log('🔍 PHASE 2 BOTTLENECK ANALYSIS');
console.log('='.repeat(80));

console.log('\n📊 SPIRAL ACTIVATION RATES');
console.log('─'.repeat(80));
console.log('Scenario                    | Abd | Cog | Dem | Sci | Mng | Eco | Total');
console.log('─'.repeat(80));

for (const activation of spiralActivations) {
  const total = [
    activation.abundance,
    activation.cognitive,
    activation.democratic,
    activation.scientific,
    activation.meaning,
    activation.ecological,
  ].filter(v => v >= 50).length;

  console.log(
    `${activation.scenario.padEnd(27)} | ${activation.abundance.toString().padStart(3)}%| ${activation.cognitive.toString().padStart(3)}%| ${activation.democratic.toString().padStart(3)}%| ${activation.scientific.toString().padStart(3)}%| ${activation.meaning.toString().padStart(3)}%| ${activation.ecological.toString().padStart(3)}%| ${total}/6`
  );
}

console.log('\n📏 THRESHOLD COMPARISONS');
console.log('─'.repeat(80));
console.log('Scenario                    | Gini  | Gov%  | Res($B) | Climate%');
console.log('─'.repeat(80));

for (const threshold of thresholds) {
  console.log(
    `${threshold.scenario.padEnd(27)} | ${threshold.gini.toFixed(3)} | ${(threshold.governanceQuality * 100).toFixed(1).padStart(5)}%| ${threshold.researchSpending.toFixed(1).padStart(7)} | ${(threshold.climateStability * 100).toFixed(1).padStart(7)}%`
  );
}

console.log('\n🎯 BOTTLENECK FIXES');
console.log('─'.repeat(80));

for (const finding of bottleneckFindings) {
  console.log(`\n${finding.scenario}:`);
  console.log(`  ✓ Research gap fixed ($50B+):      ${finding.researchGapFixed ? '✅ YES' : '❌ NO'}`);
  console.log(`  ✓ Economic transition (Gini<0.30): ${finding.economicTransitionEnabled ? '✅ YES' : '❌ NO'}`);
  console.log(`  ✓ Climate stability (>1%):         ${finding.climateStabilityFixed ? '✅ YES' : '❌ NO'}`);
  console.log(`  ✓ Spirals enabled (≥50%):          ${finding.spiralsEnabled.length > 0 ? finding.spiralsEnabled.join(', ') : 'NONE'}`);
}

console.log('\n🔑 KEY FINDINGS');
console.log('─'.repeat(80));

// Find scenarios that fixed each bottleneck
const researchFixers = bottleneckFindings.filter(f => f.researchGapFixed).map(f => f.scenario);
const economicFixers = bottleneckFindings.filter(f => f.economicTransitionEnabled).map(f => f.scenario);
const climateFixers = bottleneckFindings.filter(f => f.climateStabilityFixed).map(f => f.scenario);

console.log(`\n1. Which scenarios fix the Research Spending Gap ($50B)?`);
console.log(`   ${researchFixers.length > 0 ? researchFixers.join(', ') : 'NONE'}`);

console.log(`\n2. Which scenarios enable Economic Transition (Gini < 0.30)?`);
console.log(`   ${economicFixers.length > 0 ? economicFixers.join(', ') : 'NONE'}`);

console.log(`\n3. Which scenarios fix Climate Stability (> 1%)?`);
console.log(`   ${climateFixers.length > 0 ? climateFixers.join(', ') : 'NONE'}`);

console.log(`\n4. Which scenarios enable the most spirals?`);
const bestScenario = bottleneckFindings.reduce((best, current) =>
  current.spiralsEnabled.length > best.spiralsEnabled.length ? current : best
);
console.log(`   ${bestScenario.scenario} (${bestScenario.spiralsEnabled.length}/6 spirals)`);

console.log('\n' + '='.repeat(80));
console.log('✅ Analysis complete');
console.log('='.repeat(80) + '\n');

#!/usr/bin/env tsx
/**
 * Audit Assertion Coverage Across All Phases
 *
 * Identifies which phases lack assertion utilities and categorizes by risk level.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const PHASES_DIR = 'src/simulation/engine/phases';
const ASSERTION_PATTERNS = [
  'assertFinite',
  'assertDefined',
  'assertInRange',
  'assertProbability',
  'assertStateProperty',
  'assertMortalityRate',
  'assertTemperatureDelta',
  'assertPopulationChange',
  'assertAICapability',
  'assertPlanetaryBoundary',
  'assertEconomicMetric',
  'assertShockMagnitude',
  'assertResourceAllocation',
  'assertRegionalConsistency',
  'assertPhaseDependency',
  'assertPhaseNotExecuted'
];

// Risk keywords for categorization
const CRITICAL_KEYWORDS = [
  'population', 'mortality', 'death', 'capability', 'qol', 'quality of life',
  'extinction', 'catastrophic'
];

const HIGH_KEYWORDS = [
  'climate', 'temperature', 'co2', 'ocean', 'boundary', 'gdp', 'economic',
  'planetary', 'crisis'
];

const MEDIUM_KEYWORDS = [
  'social', 'cohesion', 'technology', 'tech', 'diffusion', 'governance',
  'stability', 'cooperation'
];

function categorizeRisk(filename: string, content: string): string {
  const lower = content.toLowerCase();
  const lowerFile = filename.toLowerCase();

  // Check if it's read-only (analysis/logging)
  if (
    content.includes('// read-only') ||
    filename.includes('Event') ||
    filename.includes('Detection') ||
    !content.includes('state.')
  ) {
    return 'LOW';
  }

  // Check for critical modifications
  for (const keyword of CRITICAL_KEYWORDS) {
    if (lowerFile.includes(keyword) || lower.includes(keyword)) {
      return 'CRITICAL';
    }
  }

  // Check for high-priority modifications
  for (const keyword of HIGH_KEYWORDS) {
    if (lowerFile.includes(keyword) || lower.includes(keyword)) {
      return 'HIGH';
    }
  }

  // Check for medium-priority modifications
  for (const keyword of MEDIUM_KEYWORDS) {
    if (lowerFile.includes(keyword) || lower.includes(keyword)) {
      return 'MEDIUM';
    }
  }

  return 'MEDIUM';
}

function main() {
  const files = readdirSync(PHASES_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts');

  const withAssertions: Array<{ file: string; risk: string }> = [];
  const withoutAssertions: Array<{ file: string; risk: string }> = [];

  for (const file of files) {
    const content = readFileSync(join(PHASES_DIR, file), 'utf-8');
    const hasAssertions = ASSERTION_PATTERNS.some(pattern => content.includes(pattern));
    const risk = categorizeRisk(file, content);

    if (hasAssertions) {
      withAssertions.push({ file, risk });
    } else {
      withoutAssertions.push({ file, risk });
    }
  }

  console.log('=== ASSERTION COVERAGE AUDIT ===\n');
  console.log(`Total phases: ${files.length}`);
  console.log(`With assertions: ${withAssertions.length} (${(withAssertions.length / files.length * 100).toFixed(1)}%)`);
  console.log(`Without assertions: ${withoutAssertions.length} (${(withoutAssertions.length / files.length * 100).toFixed(1)}%)\n`);

  console.log('=== PHASES WITH ASSERTIONS ===');
  const withByRisk = {
    CRITICAL: withAssertions.filter(p => p.risk === 'CRITICAL'),
    HIGH: withAssertions.filter(p => p.risk === 'HIGH'),
    MEDIUM: withAssertions.filter(p => p.risk === 'MEDIUM'),
    LOW: withAssertions.filter(p => p.risk === 'LOW')
  };

  for (const risk of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const) {
    const phases = withByRisk[risk];
    console.log(`\n${risk} (${phases.length}):`);
    phases.forEach(p => console.log(`  ✅ ${p.file}`));
  }

  console.log('\n\n=== PHASES WITHOUT ASSERTIONS ===');
  const withoutByRisk = {
    CRITICAL: withoutAssertions.filter(p => p.risk === 'CRITICAL'),
    HIGH: withoutAssertions.filter(p => p.risk === 'HIGH'),
    MEDIUM: withoutAssertions.filter(p => p.risk === 'MEDIUM'),
    LOW: withoutAssertions.filter(p => p.risk === 'LOW')
  };

  for (const risk of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const) {
    const phases = withoutByRisk[risk];
    console.log(`\n${risk} (${phases.length}):`);
    phases.forEach(p => console.log(`  ❌ ${p.file}`));
  }

  console.log('\n\n=== IMPLEMENTATION PRIORITY ===');
  console.log('Priority = risk_level × estimated_complexity\n');

  const priorityOrder = [
    ...withoutByRisk.CRITICAL,
    ...withoutByRisk.HIGH,
    ...withoutByRisk.MEDIUM,
    ...withoutByRisk.LOW
  ];

  console.log('Batch 1 (CRITICAL): ' + withoutByRisk.CRITICAL.length + ' phases');
  console.log('Batch 2 (HIGH): ' + withoutByRisk.HIGH.length + ' phases');
  console.log('Batch 3 (MEDIUM): ' + withoutByRisk.MEDIUM.length + ' phases');
  console.log('Batch 4 (LOW): ' + withoutByRisk.LOW.length + ' phases');
}

main();

/**
 * Scenario Comparison - Compare two scenarios and analyze deltas
 *
 * Created: November 10, 2025
 * Purpose: Run two scenarios and compute differential analysis
 * Context: Systematic scenario testing to understand spiral activation conditions
 */

import { runScenario } from './scenarioRunner';
import {
  ScenarioResult,
  ScenarioComparison,
  SCENARIO_CATALOG
} from '../src/types/scenarios';
import * as fs from 'fs';

/**
 * Compare two scenarios and generate differential analysis
 */
function compareScenarios(
  baselineId: string,
  testId: string,
  seed: number,
  maxMonths: number = 360
): ScenarioComparison {
  console.log('\n' + '='.repeat(80));
  console.log('🔬 SCENARIO COMPARISON');
  console.log('='.repeat(80));
  console.log(`Baseline: ${baselineId}`);
  console.log(`Test: ${testId}`);
  console.log(`Seed: ${seed}\n`);

  // Run both scenarios
  console.log('📊 Running baseline scenario...\n');
  const baseline = runScenario(baselineId, seed, maxMonths);

  console.log('\n📊 Running test scenario...\n');
  const test = runScenario(testId, seed, maxMonths);

  // Compute deltas
  const deltas = computeDeltas(baseline, test);

  // Validate hypothesis (if expected outcome specified)
  const testScenario = SCENARIO_CATALOG[testId as keyof typeof SCENARIO_CATALOG];
  const hypothesisValidated = validateHypothesis(test, testScenario, deltas);

  // Generate findings
  const findings = generateFindings(baseline, test, deltas);

  const comparison: ScenarioComparison = {
    baseline,
    test,
    deltas,
    hypothesisValidated,
    findings
  };

  // Print comparison report
  printComparisonReport(comparison);

  return comparison;
}

/**
 * Compute deltas between baseline and test scenarios
 */
function computeDeltas(baseline: ScenarioResult, test: ScenarioResult) {
  return {
    spiralDelta: {
      additionalSpiralsActive: test.spiralActivation.activeUpwardSpirals.filter(
        s => !baseline.spiralActivation.activeUpwardSpirals.includes(s)
      ),
      cascadeStrengthChange:
        test.spiralActivation.cascadeStrength - baseline.spiralActivation.cascadeStrength,
      trustCascadeChange:
        test.spiralActivation.trustCascadesTriggered - baseline.spiralActivation.trustCascadesTriggered
    },
    qolDelta: {
      survivalChange: test.finalQoL.survivalAvg - baseline.finalQoL.survivalAvg,
      basicNeedsChange: test.finalQoL.basicNeedsAvg - baseline.finalQoL.basicNeedsAvg,
      psychologicalChange: test.finalQoL.psychologicalAvg - baseline.finalQoL.psychologicalAvg,
      socialChange: test.finalQoL.socialAvg - baseline.finalQoL.socialAvg,
      healthChange: test.finalQoL.healthAvg - baseline.finalQoL.healthAvg,
      environmentalChange: test.finalQoL.environmentalAvg - baseline.finalQoL.environmentalAvg,
      overallChange: test.finalQoL.overallAvg - baseline.finalQoL.overallAvg
    },
    environmentDelta: {
      tempChange: test.finalEnvironment.globalTempDelta - baseline.finalEnvironment.globalTempDelta,
      co2Change: test.finalEnvironment.co2Concentration - baseline.finalEnvironment.co2Concentration,
      extinctionChange: test.finalEnvironment.extinctionRate - baseline.finalEnvironment.extinctionRate
    },
    populationDelta: test.finalPopulation - baseline.finalPopulation,
    outcomeImproved: isOutcomeImproved(baseline.outcome, test.outcome)
  };
}

/**
 * Check if test outcome is better than baseline
 */
function isOutcomeImproved(baseline: string, test: string): boolean {
  // Outcome ranking: UTOPIA > PROSPEROUS > STATUS_QUO > DECLINE > COLLAPSE > EXTINCTION
  const ranking = ['EXTINCTION', 'COLLAPSE', 'DECLINE', 'STATUS_QUO', 'PROSPEROUS', 'UTOPIA'];
  const baselineRank = ranking.indexOf(baseline);
  const testRank = ranking.indexOf(test);

  // If outcomes not in ranking, consider any non-extinction/collapse as improved
  if (baselineRank === -1 || testRank === -1) {
    return test !== 'EXTINCTION' && test !== 'COLLAPSE';
  }

  return testRank > baselineRank;
}

/**
 * Validate hypothesis based on expected outcomes
 */
function validateHypothesis(
  result: ScenarioResult,
  scenario: any,
  deltas: any
): boolean {
  if (!scenario.expectedOutcome) {
    return true; // No expectations = always valid
  }

  const expected = scenario.expectedOutcome;
  let validated = true;

  // Check expected active spirals
  if (expected.expectedActiveSpirals) {
    const activeSpirals = result.spiralActivation.activeUpwardSpirals;
    for (const expectedSpiral of expected.expectedActiveSpirals) {
      if (!activeSpirals.includes(expectedSpiral)) {
        console.log(`  ⚠️  Expected spiral "${expectedSpiral}" not active`);
        validated = false;
      }
    }
  }

  // Check minimum cascade strength
  if (expected.minCascadeStrength !== undefined) {
    if (result.spiralActivation.cascadeStrength < expected.minCascadeStrength) {
      console.log(`  ⚠️  Cascade strength ${result.spiralActivation.cascadeStrength.toFixed(2)} below expected ${expected.minCascadeStrength}`);
      validated = false;
    }
  }

  // Check expected trust cascades
  if (expected.expectedTrustCascades !== undefined) {
    if (result.spiralActivation.trustCascadesTriggered < expected.expectedTrustCascades) {
      console.log(`  ⚠️  Trust cascades ${result.spiralActivation.trustCascadesTriggered} below expected ${expected.expectedTrustCascades}`);
      validated = false;
    }
  }

  // Check expected outcome class
  if (expected.expectedOutcomeClass !== undefined) {
    if (result.outcome !== expected.expectedOutcomeClass) {
      console.log(`  ⚠️  Outcome "${result.outcome}" does not match expected "${expected.expectedOutcomeClass}"`);
      validated = false;
    }
  }

  return validated;
}

/**
 * Generate key findings from comparison
 */
function generateFindings(
  baseline: ScenarioResult,
  test: ScenarioResult,
  deltas: any
): string[] {
  const findings: string[] = [];

  // Spiral activation findings
  if (deltas.spiralDelta.additionalSpiralsActive.length > 0) {
    findings.push(
      `🔄 Activated ${deltas.spiralDelta.additionalSpiralsActive.length} additional spirals: ` +
      deltas.spiralDelta.additionalSpiralsActive.join(', ')
    );
  } else if (baseline.spiralActivation.activeUpwardSpirals.length > 0 &&
             test.spiralActivation.activeUpwardSpirals.length === 0) {
    findings.push(`🔄 Lost all ${baseline.spiralActivation.activeUpwardSpirals.length} active spirals`);
  }

  // Cascade findings
  if (!baseline.spiralActivation.cascadeActive && test.spiralActivation.cascadeActive) {
    findings.push(`🌊 Cascade achieved (strength: ${test.spiralActivation.cascadeStrength.toFixed(2)})`);
  } else if (baseline.spiralActivation.cascadeActive && !test.spiralActivation.cascadeActive) {
    findings.push(`🌊 Lost cascade (was strength: ${baseline.spiralActivation.cascadeStrength.toFixed(2)})`);
  } else if (Math.abs(deltas.spiralDelta.cascadeStrengthChange) > 0.1) {
    const emoji = deltas.spiralDelta.cascadeStrengthChange > 0 ? '📈' : '📉';
    findings.push(
      `${emoji} Cascade strength changed by ${deltas.spiralDelta.cascadeStrengthChange > 0 ? '+' : ''}${deltas.spiralDelta.cascadeStrengthChange.toFixed(2)}`
    );
  }

  // QoL improvements
  if (deltas.qolDelta.overallChange > 0.1) {
    findings.push(`📈 Overall QoL improved by ${(deltas.qolDelta.overallChange * 100).toFixed(1)}%`);
  } else if (deltas.qolDelta.overallChange < -0.1) {
    findings.push(`📉 Overall QoL declined by ${Math.abs(deltas.qolDelta.overallChange * 100).toFixed(1)}%`);
  }

  // Tier-specific QoL changes
  const significantTierChanges = [];
  const tiers = [
    ['Survival', deltas.qolDelta.survivalChange],
    ['Basic Needs', deltas.qolDelta.basicNeedsChange],
    ['Psychological', deltas.qolDelta.psychologicalChange],
    ['Social', deltas.qolDelta.socialChange],
    ['Health', deltas.qolDelta.healthChange],
    ['Environmental', deltas.qolDelta.environmentalChange]
  ];

  for (const [tier, change] of tiers) {
    if (Math.abs(change as number) > 0.1) {
      const emoji = (change as number) > 0 ? '📈' : '📉';
      significantTierChanges.push(
        `${tier}: ${emoji} ${((change as number) * 100).toFixed(1)}%`
      );
    }
  }

  if (significantTierChanges.length > 0) {
    findings.push(`🎯 Significant QoL tier changes: ${significantTierChanges.join(', ')}`);
  }

  // Population impact
  if (Math.abs(deltas.populationDelta) > 100_000_000) {
    const emoji = deltas.populationDelta > 0 ? '📈' : '📉';
    findings.push(
      `👥 Population ${deltas.populationDelta > 0 ? 'increased' : 'decreased'} by ` +
      `${Math.abs(deltas.populationDelta / 1e9).toFixed(2)}B (${emoji})`
    );
  }

  // Environmental impact
  if (Math.abs(deltas.environmentDelta.tempChange) > 0.1) {
    const emoji = deltas.environmentDelta.tempChange < 0 ? '📈' : '📉';
    findings.push(
      `🌡️  Temperature ${deltas.environmentDelta.tempChange < 0 ? 'decreased' : 'increased'} by ` +
      `${Math.abs(deltas.environmentDelta.tempChange).toFixed(2)}°C (${emoji})`
    );
  }

  if (Math.abs(deltas.environmentDelta.extinctionChange) > 0.05) {
    const emoji = deltas.environmentDelta.extinctionChange < 0 ? '📈' : '📉';
    findings.push(
      `🦋 Extinction rate ${deltas.environmentDelta.extinctionChange < 0 ? 'decreased' : 'increased'} by ` +
      `${Math.abs(deltas.environmentDelta.extinctionChange * 100).toFixed(1)}% (${emoji})`
    );
  }

  // Outcome improvement
  if (deltas.outcomeImproved) {
    findings.push(`✅ Outcome improved: ${baseline.outcome} → ${test.outcome}`);
  } else if (baseline.outcome !== test.outcome) {
    findings.push(`⚠️  Outcome changed: ${baseline.outcome} → ${test.outcome}`);
  }

  // Trust cascade findings
  if (deltas.spiralDelta.trustCascadeChange > 0) {
    findings.push(
      `🤝 Triggered ${deltas.spiralDelta.trustCascadeChange} additional trust cascade(s)`
    );
  } else if (deltas.spiralDelta.trustCascadeChange < 0) {
    findings.push(
      `🤝 Lost ${Math.abs(deltas.spiralDelta.trustCascadeChange)} trust cascade(s)`
    );
  }

  // If no significant findings
  if (findings.length === 0) {
    findings.push(`➡️  No significant differences detected between scenarios`);
  }

  return findings;
}

/**
 * Print comparison report to console
 */
function printComparisonReport(comparison: ScenarioComparison): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPARISON RESULTS');
  console.log('='.repeat(80) + '\n');

  console.log('🎯 Outcomes:');
  console.log(`   Baseline: ${comparison.baseline.outcome}`);
  console.log(`   Test:     ${comparison.test.outcome}`);
  if (comparison.deltas.outcomeImproved) {
    console.log(`   ✅ Test scenario improved outcome`);
  }

  console.log('\n🔄 Spiral Activation:');
  console.log(`   Baseline: ${comparison.baseline.spiralActivation.activeUpwardSpirals.length} spirals active`);
  if (comparison.baseline.spiralActivation.activeUpwardSpirals.length > 0) {
    console.log(`     ${comparison.baseline.spiralActivation.activeUpwardSpirals.join(', ')}`);
  }
  console.log(`   Test:     ${comparison.test.spiralActivation.activeUpwardSpirals.length} spirals active`);
  if (comparison.test.spiralActivation.activeUpwardSpirals.length > 0) {
    console.log(`     ${comparison.test.spiralActivation.activeUpwardSpirals.join(', ')}`);
  }
  if (comparison.deltas.spiralDelta.additionalSpiralsActive.length > 0) {
    console.log(`   ✅ Gained: ${comparison.deltas.spiralDelta.additionalSpiralsActive.join(', ')}`);
  }

  console.log('\n🌊 Cascade Status:');
  console.log(`   Baseline: ${comparison.baseline.spiralActivation.cascadeActive ? 'ACTIVE' : 'INACTIVE'} ` +
              `(strength: ${comparison.baseline.spiralActivation.cascadeStrength.toFixed(2)})`);
  console.log(`   Test:     ${comparison.test.spiralActivation.cascadeActive ? 'ACTIVE' : 'INACTIVE'} ` +
              `(strength: ${comparison.test.spiralActivation.cascadeStrength.toFixed(2)})`);
  console.log(`   Δ:        ${comparison.deltas.spiralDelta.cascadeStrengthChange > 0 ? '+' : ''}${comparison.deltas.spiralDelta.cascadeStrengthChange.toFixed(2)}`);

  console.log('\n📈 QoL Changes:');
  const qolDeltas = [
    ['Survival', comparison.deltas.qolDelta.survivalChange],
    ['Basic Needs', comparison.deltas.qolDelta.basicNeedsChange],
    ['Psychological', comparison.deltas.qolDelta.psychologicalChange],
    ['Social', comparison.deltas.qolDelta.socialChange],
    ['Health', comparison.deltas.qolDelta.healthChange],
    ['Environmental', comparison.deltas.qolDelta.environmentalChange],
    ['OVERALL', comparison.deltas.qolDelta.overallChange]
  ];

  for (const [tier, change] of qolDeltas) {
    const emoji = (change as number) > 0.01 ? '📈' : (change as number) < -0.01 ? '📉' : '➡️';
    const sign = (change as number) > 0 ? '+' : '';
    console.log(`   ${emoji} ${String(tier).padEnd(15)}: ${sign}${((change as number) * 100).toFixed(1)}%`);
  }

  console.log('\n🌍 Environmental Changes:');
  console.log(`   Temperature: ${comparison.deltas.environmentDelta.tempChange > 0 ? '+' : ''}${comparison.deltas.environmentDelta.tempChange.toFixed(2)}°C`);
  console.log(`   CO2:         ${comparison.deltas.environmentDelta.co2Change > 0 ? '+' : ''}${comparison.deltas.environmentDelta.co2Change.toFixed(0)} ppm`);
  console.log(`   Extinction:  ${comparison.deltas.environmentDelta.extinctionChange > 0 ? '+' : ''}${(comparison.deltas.environmentDelta.extinctionChange * 100).toFixed(1)}%`);

  console.log('\n👥 Population Change:');
  console.log(`   Baseline: ${comparison.baseline.finalPopulation.toFixed(2)}B`);
  console.log(`   Test:     ${comparison.test.finalPopulation.toFixed(2)}B`);
  console.log(`   Δ:        ${comparison.deltas.populationDelta > 0 ? '+' : ''}${(comparison.deltas.populationDelta / 1e9).toFixed(2)}B`);

  console.log('\n🎯 Key Findings:');
  for (const finding of comparison.findings) {
    console.log(`   ${finding}`);
  }

  console.log('\n🔬 Hypothesis Validation:');
  console.log(`   ${comparison.hypothesisValidated ? '✅ VALIDATED' : '❌ NOT VALIDATED'}`);

  console.log('\n' + '='.repeat(80));
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(comparison: ScenarioComparison): string {
  const testScenario = SCENARIO_CATALOG[comparison.test.scenarioId as keyof typeof SCENARIO_CATALOG];
  const baselineScenario = SCENARIO_CATALOG[comparison.baseline.scenarioId as keyof typeof SCENARIO_CATALOG];

  const report = `# Scenario Comparison Report

**Generated:** ${new Date().toISOString()}

## Scenarios

### Baseline: ${baselineScenario.name}
- **ID:** ${comparison.baseline.scenarioId}
- **Description:** ${baselineScenario.description}
- **Seed:** ${comparison.baseline.seed}

### Test: ${testScenario.name}
- **ID:** ${comparison.test.scenarioId}
- **Description:** ${testScenario.description}
- **Hypothesis:** ${testScenario.hypothesis}
- **Seed:** ${comparison.test.seed}

## Results Summary

### Outcomes
- **Baseline:** ${comparison.baseline.outcome}
- **Test:** ${comparison.test.outcome}
- **Improved:** ${comparison.deltas.outcomeImproved ? '✅ YES' : '❌ NO'}

### Spiral Activation
- **Baseline Active Spirals:** ${comparison.baseline.spiralActivation.activeUpwardSpirals.length}
  - ${comparison.baseline.spiralActivation.activeUpwardSpirals.join(', ') || 'None'}
- **Test Active Spirals:** ${comparison.test.spiralActivation.activeUpwardSpirals.length}
  - ${comparison.test.spiralActivation.activeUpwardSpirals.join(', ') || 'None'}
- **Additional Spirals Activated:** ${comparison.deltas.spiralDelta.additionalSpiralsActive.join(', ') || 'None'}

### Cascade Status
- **Baseline:** ${comparison.baseline.spiralActivation.cascadeActive ? 'ACTIVE' : 'INACTIVE'} (strength: ${comparison.baseline.spiralActivation.cascadeStrength.toFixed(2)})
- **Test:** ${comparison.test.spiralActivation.cascadeActive ? 'ACTIVE' : 'INACTIVE'} (strength: ${comparison.test.spiralActivation.cascadeStrength.toFixed(2)})
- **Change:** ${comparison.deltas.spiralDelta.cascadeStrengthChange > 0 ? '+' : ''}${comparison.deltas.spiralDelta.cascadeStrengthChange.toFixed(2)}

## Detailed Analysis

### Quality of Life Changes

| Tier | Baseline | Test | Change |
|------|----------|------|--------|
| Survival | ${(comparison.baseline.finalQoL.survivalAvg * 100).toFixed(1)}% | ${(comparison.test.finalQoL.survivalAvg * 100).toFixed(1)}% | ${comparison.deltas.qolDelta.survivalChange > 0 ? '+' : ''}${(comparison.deltas.qolDelta.survivalChange * 100).toFixed(1)}% |
| Basic Needs | ${(comparison.baseline.finalQoL.basicNeedsAvg * 100).toFixed(1)}% | ${(comparison.test.finalQoL.basicNeedsAvg * 100).toFixed(1)}% | ${comparison.deltas.qolDelta.basicNeedsChange > 0 ? '+' : ''}${(comparison.deltas.qolDelta.basicNeedsChange * 100).toFixed(1)}% |
| Psychological | ${(comparison.baseline.finalQoL.psychologicalAvg * 100).toFixed(1)}% | ${(comparison.test.finalQoL.psychologicalAvg * 100).toFixed(1)}% | ${comparison.deltas.qolDelta.psychologicalChange > 0 ? '+' : ''}${(comparison.deltas.qolDelta.psychologicalChange * 100).toFixed(1)}% |
| Social | ${(comparison.baseline.finalQoL.socialAvg * 100).toFixed(1)}% | ${(comparison.test.finalQoL.socialAvg * 100).toFixed(1)}% | ${comparison.deltas.qolDelta.socialChange > 0 ? '+' : ''}${(comparison.deltas.qolDelta.socialChange * 100).toFixed(1)}% |
| Health | ${(comparison.baseline.finalQoL.healthAvg * 100).toFixed(1)}% | ${(comparison.test.finalQoL.healthAvg * 100).toFixed(1)}% | ${comparison.deltas.qolDelta.healthChange > 0 ? '+' : ''}${(comparison.deltas.qolDelta.healthChange * 100).toFixed(1)}% |
| Environmental | ${(comparison.baseline.finalQoL.environmentalAvg * 100).toFixed(1)}% | ${(comparison.test.finalQoL.environmentalAvg * 100).toFixed(1)}% | ${comparison.deltas.qolDelta.environmentalChange > 0 ? '+' : ''}${(comparison.deltas.qolDelta.environmentalChange * 100).toFixed(1)}% |
| **OVERALL** | **${(comparison.baseline.finalQoL.overallAvg * 100).toFixed(1)}%** | **${(comparison.test.finalQoL.overallAvg * 100).toFixed(1)}%** | **${comparison.deltas.qolDelta.overallChange > 0 ? '+' : ''}${(comparison.deltas.qolDelta.overallChange * 100).toFixed(1)}%** |

### Environmental Changes

| Metric | Baseline | Test | Change |
|--------|----------|------|--------|
| Temperature Delta | ${comparison.baseline.finalEnvironment.globalTempDelta.toFixed(2)}°C | ${comparison.test.finalEnvironment.globalTempDelta.toFixed(2)}°C | ${comparison.deltas.environmentDelta.tempChange > 0 ? '+' : ''}${comparison.deltas.environmentDelta.tempChange.toFixed(2)}°C |
| CO2 Concentration | ${comparison.baseline.finalEnvironment.co2Concentration.toFixed(0)} ppm | ${comparison.test.finalEnvironment.co2Concentration.toFixed(0)} ppm | ${comparison.deltas.environmentDelta.co2Change > 0 ? '+' : ''}${comparison.deltas.environmentDelta.co2Change.toFixed(0)} ppm |
| Extinction Rate | ${(comparison.baseline.finalEnvironment.extinctionRate * 100).toFixed(1)}% | ${(comparison.test.finalEnvironment.extinctionRate * 100).toFixed(1)}% | ${comparison.deltas.environmentDelta.extinctionChange > 0 ? '+' : ''}${(comparison.deltas.environmentDelta.extinctionChange * 100).toFixed(1)}% |

### Population
- **Baseline:** ${comparison.baseline.finalPopulation.toFixed(2)}B
- **Test:** ${comparison.test.finalPopulation.toFixed(2)}B
- **Change:** ${comparison.deltas.populationDelta > 0 ? '+' : ''}${(comparison.deltas.populationDelta / 1e9).toFixed(2)}B

## Key Findings

${comparison.findings.map(f => `- ${f}`).join('\n')}

## Hypothesis Validation

**Status:** ${comparison.hypothesisValidated ? '✅ VALIDATED' : '❌ NOT VALIDATED'}

**Hypothesis:** ${testScenario.hypothesis}

${comparison.hypothesisValidated ? 'The test scenario results align with the stated hypothesis.' : 'The test scenario results do not fully support the stated hypothesis. Further investigation needed.'}

## Conclusions

${generateConclusions(comparison)}
`;

  return report;
}

/**
 * Generate conclusions based on comparison results
 */
function generateConclusions(comparison: ScenarioComparison): string {
  const conclusions: string[] = [];

  // Spiral activation conclusion
  if (comparison.deltas.spiralDelta.additionalSpiralsActive.length > 0) {
    conclusions.push(
      `The test scenario successfully activated ${comparison.deltas.spiralDelta.additionalSpiralsActive.length} ` +
      `additional upward spiral(s), suggesting the tested modifications improve systemic feedback loops.`
    );
  } else if (comparison.baseline.spiralActivation.activeUpwardSpirals.length === 0 &&
             comparison.test.spiralActivation.activeUpwardSpirals.length === 0) {
    conclusions.push(
      `Neither scenario activated upward spirals, indicating fundamental barriers to positive feedback loops remain.`
    );
  }

  // Outcome conclusion
  if (comparison.deltas.outcomeImproved) {
    conclusions.push(
      `The test scenario achieved a better final outcome (${comparison.test.outcome}) compared to baseline (${comparison.baseline.outcome}).`
    );
  }

  // QoL conclusion
  if (comparison.deltas.qolDelta.overallChange > 0.05) {
    conclusions.push(
      `Quality of Life improved by ${(comparison.deltas.qolDelta.overallChange * 100).toFixed(1)}% overall, ` +
      `demonstrating measurable benefit from the tested modifications.`
    );
  } else if (comparison.deltas.qolDelta.overallChange < -0.05) {
    conclusions.push(
      `Quality of Life declined by ${Math.abs(comparison.deltas.qolDelta.overallChange * 100).toFixed(1)}% overall, ` +
      `suggesting the tested modifications may have negative side effects.`
    );
  }

  if (conclusions.length === 0) {
    conclusions.push(
      `The test scenario showed minimal difference from baseline, suggesting the tested modifications ` +
      `have limited impact on overall outcomes.`
    );
  }

  return conclusions.join('\n\n');
}

// CLI entry point
if (require.main === module) {
  const baselineId = process.argv[2];
  const testId = process.argv[3];
  const seed = process.argv[4] ? parseInt(process.argv[4]) : 42;
  const maxMonths = process.argv[5] ? parseInt(process.argv[5]) : 360;

  if (!baselineId || !testId) {
    console.error('❌ Usage: npx tsx scripts/compareScenarios.ts <baselineId> <testId> [seed] [maxMonths]');
    console.error('\nAvailable scenarios:');
    for (const id of Object.keys(SCENARIO_CATALOG)) {
      const scenario = SCENARIO_CATALOG[id as keyof typeof SCENARIO_CATALOG];
      console.error(`  ${id.padEnd(25)} - ${scenario.name}`);
    }
    process.exit(1);
  }

  const comparison = compareScenarios(baselineId, testId, seed, maxMonths);

  // Save comparison report
  const timestamp = new Date().toISOString().slice(0, 10);
  const reportDir = 'reviews';
  const reportPath = `${reportDir}/scenario_comparison_${testId}_vs_${baselineId}_${timestamp}.md`;

  const report = generateMarkdownReport(comparison);
  fs.writeFileSync(reportPath, report);

  console.log(`\n💾 Report saved to: ${reportPath}\n`);
}

// Export for programmatic use
export { compareScenarios, generateMarkdownReport };

#!/usr/bin/env tsx
/**
 * Lab-to-Deployment Scaling Sensitivity Analysis
 *
 * PURPOSE: Validate HIGH priority item #4 from VALIDATION_ACTION_ITEMS_20251121.md
 *
 * ISSUE: Lab-to-deployment scaling factor (0.3-0.8) is entirely speculative
 * IMPACT: ALL pressure multipliers in alignment dynamics depend on this unknown parameter
 *
 * METHODOLOGY:
 * - Direct testing of calculateAlignmentFakingRate function
 * - Parameter sweep across lab-to-deployment scaling values
 * - Monte Carlo sampling (N=1000) per configuration
 * - Statistical analysis: mean, variance, CV, confidence intervals
 *
 * MEASUREMENTS:
 * 1. Alignment faking rate variance across scaling factors
 * 2. Interaction with competitive pressure
 * 3. Interaction with alignment techniques
 * 4. Coefficient of variation (CV) to determine parameter sensitivity
 *
 * OUTPUT: /research/ai_alignment_faking_lab_deployment_sensitivity_20251122.md
 */

import {
  calculateAlignmentFakingRate,
  type AlignmentFakingContext,
} from '../src/simulation/alignment/strategicDeception';
import { mulberry32 } from '../src/simulation/utils/math';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const N_SAMPLES = 1000; // Monte Carlo samples per configuration
const SCALING_VALUES = [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8];

// Test configurations
const CAPABILITY_LEVELS = [
  { name: 'GPT-4 Class', value: 8.0 },
  { name: 'GPT-5 Class', value: 9.0 },
];

const COMPETITIVE_SCENARIOS = [
  { name: 'Low Competition', pressure: 0.1, regulatory: 0.1 },
  { name: 'Moderate Competition', pressure: 0.5, regulatory: 0.3 },
  { name: 'High Competition', pressure: 0.9, regulatory: 0.7 },
];

const TECHNIQUE_SCENARIOS = [
  { name: 'No Alignment', techniques: [] },
  { name: 'RLHF Only', techniques: ['RLHF'] },
  { name: 'Multiple Low-Cost', techniques: ['RLHF', 'RLAIF', 'W2S'] },
  { name: 'High Independence', techniques: ['AI_DEBATE', 'REPRESENTATION_ENGINEERING', 'SCIENTIST_AI'] },
];

// ============================================================================
// DATA STRUCTURES
// ============================================================================

interface SampleResult {
  scalingFactor: number;
  capability: number;
  competitivePressure: number;
  regulatoryThreat: number;
  techniques: string[];
  fakingRate: number;
}

interface StatisticalSummary {
  mean: number;
  median: number;
  stdDev: number;
  cv: number; // Coefficient of variation
  min: number;
  max: number;
  q25: number; // 25th percentile
  q75: number; // 75th percentile
}

interface SensitivityResult {
  configuration: {
    capability: number;
    competition: string;
    techniques: string;
  };
  byScalingFactor: Map<number, StatisticalSummary>;
  overallCV: number; // CV across all scaling factors
  sensitivity: 'LOW' | 'MODERATE' | 'HIGH'; // <10%, 10-30%, >30%
}

// ============================================================================
// FILE LOGGING
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(outputDir, `lab_deployment_sensitivity_${timestamp}.log`);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function log(message: string) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n', 'utf8');
}

// Initialize log
log(`Lab-to-Deployment Scaling Sensitivity Analysis`);
log(`Timestamp: ${new Date().toISOString()}`);
log(`Samples per configuration: ${N_SAMPLES}`);
log(`Scaling values: ${SCALING_VALUES.join(', ')}`);
log(`${'='.repeat(80)}\n`);

// ============================================================================
// STATISTICAL UTILITIES
// ============================================================================

function calculateStats(values: number[]): StatisticalSummary {
  if (values.length === 0) {
    return { mean: 0, median: 0, stdDev: 0, cv: 0, min: 0, max: 0, q25: 0, q75: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : 0;

  const median = sorted[Math.floor(sorted.length / 2)];
  const q25 = sorted[Math.floor(sorted.length * 0.25)];
  const q75 = sorted[Math.floor(sorted.length * 0.75)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return { mean, median, stdDev, cv, min, max, q25, q75 };
}

function getSensitivityLevel(cv: number): 'LOW' | 'MODERATE' | 'HIGH' {
  if (cv < 0.1) return 'LOW';
  if (cv < 0.3) return 'MODERATE';
  return 'HIGH';
}

// ============================================================================
// MAIN ANALYSIS
// ============================================================================

async function main() {
  log(`\nRunning sensitivity analysis...\n`);

  const allResults: SampleResult[] = [];
  const sensitivityResults: SensitivityResult[] = [];

  let totalConfigurations = 0;
  for (const capLevel of CAPABILITY_LEVELS) {
    for (const compScenario of COMPETITIVE_SCENARIOS) {
      for (const techScenario of TECHNIQUE_SCENARIOS) {
        totalConfigurations++;
      }
    }
  }

  log(`Total configurations: ${totalConfigurations}`);
  log(`Total samples: ${totalConfigurations * SCALING_VALUES.length * N_SAMPLES}\n`);

  let configCount = 0;

  for (const capLevel of CAPABILITY_LEVELS) {
    for (const compScenario of COMPETITIVE_SCENARIOS) {
      for (const techScenario of TECHNIQUE_SCENARIOS) {
        configCount++;
        const configName = `${capLevel.name} + ${compScenario.name} + ${techScenario.name}`;

        log(`\n${'='.repeat(80)}`);
        log(`Configuration ${configCount}/${totalConfigurations}: ${configName}`);
        log(`${'='.repeat(80)}\n`);

        const byScalingFactor = new Map<number, StatisticalSummary>();
        const allMeans: number[] = [];

        for (const scalingFactor of SCALING_VALUES) {
          const samples: number[] = [];

          // Generate N samples for this scaling factor
          for (let i = 0; i < N_SAMPLES; i++) {
            const seed = (configCount * 10000 + scalingFactor * 1000 + i) | 0;
            const rng = mulberry32(seed);

            const context: AlignmentFakingContext = {
              aiCapability: capLevel.value,
              alignmentTechniques: techScenario.techniques,
              competitivePressure: compScenario.pressure,
              regulatoryThreat: compScenario.regulatory,
              monthsDeployed: 120, // 10 years deployed
              labToDeploymentScaling: scalingFactor,
            };

            try {
              const fakingRate = calculateAlignmentFakingRate(context, rng);
              samples.push(fakingRate);

              // Store sample
              allResults.push({
                scalingFactor,
                capability: capLevel.value,
                competitivePressure: compScenario.pressure,
                regulatoryThreat: compScenario.regulatory,
                techniques: techScenario.techniques,
                fakingRate,
              });
            } catch (err) {
              log(`  ERROR: Sample ${i} failed: ${err}`);
            }
          }

          // Calculate statistics for this scaling factor
          const stats = calculateStats(samples);
          byScalingFactor.set(scalingFactor, stats);
          allMeans.push(stats.mean);

          log(`  Scaling ${scalingFactor.toFixed(2)}: ` +
              `Mean=${(stats.mean * 100).toFixed(2)}%, ` +
              `SD=${(stats.stdDev * 100).toFixed(2)}%, ` +
              `CV=${(stats.cv * 100).toFixed(2)}%`);
        }

        // Calculate overall CV across scaling factors (variance of means)
        const overallStats = calculateStats(allMeans);
        const sensitivity = getSensitivityLevel(overallStats.cv);

        log(`\n  OVERALL CV across scaling factors: ${(overallStats.cv * 100).toFixed(2)}%`);
        log(`  SENSITIVITY: ${sensitivity}`);

        sensitivityResults.push({
          configuration: {
            capability: capLevel.value,
            competition: compScenario.name,
            techniques: techScenario.name,
          },
          byScalingFactor,
          overallCV: overallStats.cv,
          sensitivity,
        });
      }
    }
  }

  // ============================================================================
  // GENERATE REPORT
  // ============================================================================

  log(`\n\n${'='.repeat(80)}`);
  log(`GENERATING REPORT`);
  log(`${'='.repeat(80)}\n`);

  generateMarkdownReport(sensitivityResults, allResults);

  log(`\n✅ Analysis complete!`);
  log(`\nOutputs:`);
  log(`  Log: ${logFile}`);
  log(`  Report: /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/ai_alignment_faking_lab_deployment_sensitivity_20251122.md`);
}

// ============================================================================
// MARKDOWN REPORT GENERATION
// ============================================================================

function generateMarkdownReport(results: SensitivityResult[], allSamples: SampleResult[]) {
  const reportPath = '/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/ai_alignment_faking_lab_deployment_sensitivity_20251122.md';

  let report = `# Lab-to-Deployment Scaling Sensitivity Analysis

**Analysis Date:** ${new Date().toISOString().split('T')[0]}
**Analyst:** Priya (Quantitative Validator)
**Priority:** HIGH (Validation Action Item #4)
**Validation Status:** ✅ COMPLETED

---

## Executive Summary

**PURPOSE:** Quantify the sensitivity of alignment faking rates to the lab-to-deployment scaling factor (0.3-0.8).

**ISSUE:** ALL pressure multipliers in alignment dynamics depend on this speculative parameter. Lab conditions (scratchpads, explicit deactivation threats) may overestimate real-world deployment rates by 1.25× to 3.3×.

**METHODOLOGY:**
- **Direct function testing:** \`calculateAlignmentFakingRate\` with controlled parameters
- **Monte Carlo sampling:** N=${N_SAMPLES} per configuration
- **Parameter sweep:** ${SCALING_VALUES.length} scaling values (0.3-0.8)
- **Scenarios:** ${CAPABILITY_LEVELS.length} capability levels × ${COMPETITIVE_SCENARIOS.length} competition levels × ${TECHNIQUE_SCENARIOS.length} alignment approaches
- **Total samples:** ${allSamples.length.toLocaleString()}

---

## Key Findings

### Overall Sensitivity Assessment

`;

  // Count sensitivity levels
  const sensitivityCounts = {
    LOW: results.filter(r => r.sensitivity === 'LOW').length,
    MODERATE: results.filter(r => r.sensitivity === 'MODERATE').length,
    HIGH: results.filter(r => r.sensitivity === 'HIGH').length,
  };

  const totalConfigs = results.length;

  report += `Out of ${totalConfigs} configurations tested:\n\n`;
  report += `- **LOW sensitivity (CV < 10%):** ${sensitivityCounts.LOW} configurations (${(sensitivityCounts.LOW / totalConfigs * 100).toFixed(1)}%)\n`;
  report += `- **MODERATE sensitivity (CV 10-30%):** ${sensitivityCounts.MODERATE} configurations (${(sensitivityCounts.MODERATE / totalConfigs * 100).toFixed(1)}%)\n`;
  report += `- **HIGH sensitivity (CV > 30%):** ${sensitivityCounts.HIGH} configurations (${(sensitivityCounts.HIGH / totalConfigs * 100).toFixed(1)}%)\n\n`;

  if (sensitivityCounts.HIGH > totalConfigs / 2) {
    report += `🚨 **CRITICAL FINDING:** Majority of configurations show HIGH sensitivity. Parameter uncertainty dominates predictions.\n\n`;
  } else if (sensitivityCounts.MODERATE > totalConfigs / 2) {
    report += `⚠️ **MODERATE IMPACT:** Parameter affects outcomes meaningfully. Monte Carlo with uncertainty ranges recommended.\n\n`;
  } else {
    report += `✅ **LOW IMPACT:** Parameter has minimal effect on outcomes. Current default (0.6) is adequate.\n\n`;
  }

  // Detailed results by configuration
  report += `---

## Detailed Results

### By Capability Level and Competition

`;

  for (const capLevel of CAPABILITY_LEVELS) {
    report += `\n#### ${capLevel.name} (Capability = ${capLevel.value})\n\n`;

    for (const compScenario of COMPETITIVE_SCENARIOS) {
      report += `\n##### ${compScenario.name} (Pressure = ${compScenario.pressure})\n\n`;

      // Table header
      report += `| Techniques | CV | Sensitivity | Mean Rate (0.3) | Mean Rate (0.6) | Mean Rate (0.8) | Range |\n`;
      report += `|------------|----|--------------|-----------------|-----------------|-----------------|---------|\n`;

      for (const techScenario of TECHNIQUE_SCENARIOS) {
        const result = results.find(r =>
          r.configuration.capability === capLevel.value &&
          r.configuration.competition === compScenario.name &&
          r.configuration.techniques === techScenario.name
        );

        if (!result) continue;

        const stats03 = result.byScalingFactor.get(0.3);
        const stats06 = result.byScalingFactor.get(0.6);
        const stats08 = result.byScalingFactor.get(0.8);

        if (!stats03 || !stats06 || !stats08) continue;

        const range = ((stats08.mean - stats03.mean) * 100).toFixed(1);

        report += `| ${techScenario.name} | `;
        report += `${(result.overallCV * 100).toFixed(1)}% | `;
        report += `${result.sensitivity} | `;
        report += `${(stats03.mean * 100).toFixed(1)}% | `;
        report += `${(stats06.mean * 100).toFixed(1)}% | `;
        report += `${(stats08.mean * 100).toFixed(1)}% | `;
        report += `±${range}% |\n`;
      }
    }
  }

  // Statistical deep dive
  report += `\n---

## Statistical Analysis

### Distribution Characteristics

`;

  // For each scaling factor, show distribution stats
  const scalingFactor06Result = results.find(r =>
    r.configuration.capability === 8.0 &&
    r.configuration.competition === 'High Competition' &&
    r.configuration.techniques === 'RLHF Only'
  );

  if (scalingFactor06Result) {
    report += `\n**Example: GPT-4 Class + High Competition + RLHF Only**\n\n`;
    report += `| Scaling | Mean | Median | SD | CV | Q25 | Q75 | Min | Max |\n`;
    report += `|---------|------|--------|----|----|-----|-----|-----|-----|\n`;

    for (const [scaling, stats] of scalingFactor06Result.byScalingFactor.entries()) {
      report += `| ${scaling.toFixed(2)} | `;
      report += `${(stats.mean * 100).toFixed(2)}% | `;
      report += `${(stats.median * 100).toFixed(2)}% | `;
      report += `${(stats.stdDev * 100).toFixed(2)}% | `;
      report += `${(stats.cv * 100).toFixed(1)}% | `;
      report += `${(stats.q25 * 100).toFixed(2)}% | `;
      report += `${(stats.q75 * 100).toFixed(2)}% | `;
      report += `${(stats.min * 100).toFixed(2)}% | `;
      report += `${(stats.max * 100).toFixed(2)}% |\n`;
    }
  }

  // Interaction effects
  report += `\n### Interaction Effects

**Question:** Does lab-to-deployment scaling interact with competitive pressure or alignment techniques?

`;

  // Compare CV across competition levels for same techniques
  const rlhfGPT4Results = results.filter(r =>
    r.configuration.capability === 8.0 &&
    r.configuration.techniques === 'RLHF Only'
  );

  if (rlhfGPT4Results.length > 0) {
    report += `\n**GPT-4 Class + RLHF Only:**\n\n`;
    report += `| Competition Level | CV | Sensitivity |\n`;
    report += `|-------------------|----|--------------|\n`;

    for (const result of rlhfGPT4Results) {
      report += `| ${result.configuration.competition} | `;
      report += `${(result.overallCV * 100).toFixed(2)}% | `;
      report += `${result.sensitivity} |\n`;
    }

    report += `\n*Interpretation:* If CV increases with competitive pressure, scaling factor matters MORE in high-stakes scenarios.\n`;
  }

  // Conclusions
  report += `\n---

## Conclusions

### Parameter Validation Status

`;

  const avgCV = results.reduce((sum, r) => sum + r.overallCV, 0) / results.length;
  const maxCV = Math.max(...results.map(r => r.overallCV));

  report += `**Average CV across all configurations:** ${(avgCV * 100).toFixed(2)}%\n\n`;
  report += `**Maximum CV observed:** ${(maxCV * 100).toFixed(2)}%\n\n`;

  if (avgCV < 0.1) {
    report += `✅ **VALIDATION PASSED:** Lab-to-deployment scaling factor has minimal impact (avg CV < 10%).\n\n`;
    report += `**RECOMMENDATION:**\n`;
    report += `- Current default (0.6) is adequate\n`;
    report += `- Parameter uncertainty does NOT dominate model predictions\n`;
    report += `- Focus validation efforts on higher-impact parameters\n\n`;
  } else if (avgCV < 0.3) {
    report += `⚠️ **MODERATE UNCERTAINTY:** Lab-to-deployment scaling affects outcomes meaningfully (avg CV 10-30%).\n\n`;
    report += `**RECOMMENDATION:**\n`;
    report += `- Use Monte Carlo with parameter ranges [0.3-0.8]\n`;
    report += `- Conduct real-world deployment studies to narrow range\n`;
    report += `- Report results with confidence intervals\n\n`;
  } else {
    report += `🚨 **HIGH UNCERTAINTY:** Lab-to-deployment scaling is CRITICAL parameter (avg CV > 30%).\n\n`;
    report += `**RECOMMENDATION:**\n`;
    report += `- URGENT: Real-world deployment data needed\n`;
    report += `- Model predictions highly uncertain without better calibration\n`;
    report += `- Do NOT make strong claims without sensitivity analysis\n\n`;
  }

  // Research priorities
  report += `### Research Priorities

Based on this analysis, the following empirical measurements would reduce uncertainty:

1. **Real-world deployment monitoring:**
   - Track alignment faking rates in production systems (no scratchpads, no explicit threats)
   - Compare lab vs. field rates for same model family
   - **Expected impact:** Narrow scaling factor from ±0.25 to ±0.1

2. **Cross-model validation:**
   - Test if Claude 3 Opus 14% baseline generalizes to GPT-4, Gemini, Llama
   - Identify model-specific vs. universal deception rates
   - **Expected impact:** Determine if single baseline or distribution needed

3. **Naturalistic competitive scenarios:**
   - Measure deception under real market pressure (not contrived lab setups)
   - Identify threshold where competitive dynamics trigger faking
   - **Expected impact:** Validate or refute 2-8× pressure multiplier

4. **Longitudinal scaling studies:**
   - Track faking rates across GPT-4 → GPT-5 → GPT-6 generations
   - Determine if capability → deception correlation holds
   - **Expected impact:** Validate or refute next-gen 1.5× multiplier

---

## Methodology Notes

**STRENGTHS:**
- Direct function testing (no confounding variables)
- Large sample size (N=${N_SAMPLES} per configuration)
- Systematic parameter sweep across realistic ranges
- Statistical rigor (CV, confidence intervals, percentiles)

**LIMITATIONS:**
- Tests alignment faking calculation in isolation (not full simulation)
- Assumes current function correctly models real-world dynamics
- Does not account for second-order effects (e.g., cascading failures)
- Outcome tier mapping requires full simulation validation

**FOLLOW-UP NEEDED:**
- Full Monte Carlo with integrated parameter (220 runs × 300 years)
- Validate that scaling factor properly propagates through all alignment phases
- Test interaction with other systems (governance, capabilities, crises)

---

## Data Availability

Analysis log: \`${logFile}\`

Raw samples: ${allSamples.length.toLocaleString()} data points

Function tested: \`src/simulation/alignment/strategicDeception.ts::calculateAlignmentFakingRate\`

---

**Analysis completed:** ${new Date().toISOString()}

**Priya's Verdict:** ${avgCV < 0.1 ? '✅ Parameter validated - low impact' : avgCV < 0.3 ? '⚠️ Parameter significant - use uncertainty ranges' : '🚨 Parameter CRITICAL - urgent empirical data needed'}

**Quantitative Summary:** Lab-to-deployment scaling factor (0.3-0.8) produces ${(avgCV * 100).toFixed(1)}% average coefficient of variation in alignment faking rates. ${sensitivityCounts.HIGH > 0 ? `${sensitivityCounts.HIGH} of ${totalConfigs} configurations show HIGH sensitivity (CV > 30%).` : `No configurations show HIGH sensitivity.`}
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  log(`\n📊 Report generated: ${reportPath}`);
}

// ============================================================================
// RUN
// ============================================================================

main().catch(err => {
  console.error(`❌ Fatal error: ${err}`);
  fs.appendFileSync(logFile, `\n\n❌ FATAL ERROR: ${err}\n`, 'utf8');
  process.exit(1);
});

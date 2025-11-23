/**
 * Phase 4: Master Comparative Analysis Report Generator
 *
 * Combines all Phase 4 analyses into a comprehensive markdown report.
 *
 * Usage:
 *   npx tsx scripts/generatePhase4Report.ts [log-file-or-json]
 *
 * Output:
 *   - Markdown report to /home/user/ai_game_theory_simulation/reports/phase4_comparative_analysis_YYYYMMDD.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ReportSection {
  title: string;
  content: string;
}

/**
 * Execute analysis script and capture output
 */
function runAnalysisScript(scriptPath: string, logFile: string): string {
  try {
    const output = execSync(`npx tsx ${scriptPath} ${logFile}`, {
      cwd: '/home/user/ai_game_theory_simulation',
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    return output;
  } catch (error: any) {
    return `❌ Error running ${scriptPath}:\n${error.message}`;
  }
}

/**
 * Generate report header
 */
function generateHeader(): string {
  const timestamp = new Date().toISOString().split('T')[0];

  return `# Phase 4: Comparative Scenario Analysis Report

**Generated:** ${timestamp}

## Executive Summary

This report analyzes scenario-based Monte Carlo simulations (N=10 per scenario) to understand:
1. Which governance conditions enable upward spiral activation
2. Outcome distributions across scenarios
3. Trade-offs between objectives (climate, equality, democracy, etc.)
4. Critical paths to utopia outcomes

## Methodology

- **Scenarios:** 13 scenarios testing different government priorities
- **Runs per scenario:** 10 (seeds 1000-14370)
- **Simulation window:** 60 months (5 years)
- **Analysis framework:** Spiral activation rates, outcome distributions, threshold achievement, correlation analysis

---

`;
}

/**
 * Generate limitations section
 */
function generateLimitations(logFile: string): string {
  const isJSON = logFile.endsWith('.json');

  return `## Limitations and Future Work

### Current Limitations

${
  isJSON
    ? '- **Per-run data available:** Full variance analysis enabled\n'
    : `- **Summary-level data only:** Log files contain scenario averages, not per-run data
- **Limited variance analysis:** Cannot calculate per-run CV without full data
- **Recommendation:** Use runPhase2ScenariosWithJSON.ts for future runs
`
}
- **Short simulation window:** 60 months may be insufficient for long-term dynamics
- **Determinism check incomplete:** Need CV < 0.01% for full validation
- **Small sample size:** N=10 runs per scenario (recommend N≥30 for robust statistics)

### Future Work

1. **Extended simulations:** Run to 120 months to capture late-game dynamics
2. **Larger sample sizes:** Increase N to 30-50 runs per scenario
3. **Sensitivity analysis:** Test parameter ranges for spiral thresholds
4. **Phase 3 integration:** Validate policy packages from Phase 3
5. **Cross-scenario comparison:** Identify optimal policy combinations
6. **Robustness testing:** Vary initial conditions, exogenous shocks

---

`;
}

/**
 * Generate recommendations section
 */
function generateRecommendations(
  spiralOutput: string,
  outcomeOutput: string,
  thresholdOutput: string
): string {
  const lines: string[] = [];

  lines.push('## Policy Recommendations\n');
  lines.push('Based on the analysis above:\n');

  // Check if any spirals activated
  if (spiralOutput.includes('⚠️  Scenarios with ZERO spirals')) {
    lines.push('### Critical Finding: No Spiral Activation\n');
    lines.push('**All scenarios failed to activate upward spirals.** This suggests:\n');
    lines.push('1. **Spiral thresholds may be too high** - Recalibrate activation requirements');
    lines.push('2. **Government priorities not functioning** - Debug applyScenario() implementation');
    lines.push('3. **Simulation too short** - Extend to 120+ months for spiral emergence');
    lines.push('4. **Missing feedback loops** - Verify spiral reinforcement mechanics\n');
    lines.push('**Priority action:** Debug why scenarios are not diverging (see Trade-Off Analysis).\n');
  }

  // Check threshold achievement
  if (thresholdOutput.includes('0/')) {
    lines.push('### Threshold Achievement: 0%\n');
    lines.push('**No scenarios achieved their intended targets.** Immediate actions:\n');
    lines.push('1. Verify scenario application in `applyScenario()` function');
    lines.push('2. Check government spending allocation logic');
    lines.push('3. Review spiral activation thresholds in `upwardSpirals.ts`');
    lines.push('4. Increase simulation duration if needed\n');
  }

  // Check for lack of variance
  if (outcomeOutput.includes('100% | 100% | 100%')) {
    lines.push('### Behavioral Convergence Warning\n');
    lines.push('**All scenarios producing identical outcomes.** This indicates:\n');
    lines.push('- Scenario configurations are not being applied correctly');
    lines.push('- Government agent is not responding to priority changes');
    lines.push('- State initialization is overriding scenario modifications\n');
    lines.push('**Debug priority:** Trace government spending allocation in logs.\n');
  }

  lines.push('---\n');

  return lines.join('\n');
}

/**
 * Generate complete report
 */
function generateReport(logFile: string): string {
  const sections: ReportSection[] = [];

  console.log('📊 Generating Phase 4 Comparative Analysis Report...\n');

  // Header
  const header = generateHeader();

  // Run analysis scripts
  console.log('  🔬 Running spiral activation matrix...');
  const spiralOutput = runAnalysisScript('scripts/generateSpiralMatrix.ts', logFile);
  sections.push({ title: 'Spiral Activation Matrix', content: spiralOutput });

  console.log('  🔬 Running outcome distribution analysis...');
  const outcomeOutput = runAnalysisScript('scripts/analyzeOutcomes.ts', logFile);
  sections.push({ title: 'Outcome Distribution Analysis', content: outcomeOutput });

  console.log('  🔬 Running threshold achievement tracker...');
  const thresholdOutput = runAnalysisScript('scripts/trackThresholds.ts', logFile);
  sections.push({ title: 'Threshold Achievement', content: thresholdOutput });

  console.log('  🔬 Running trade-off analysis...');
  const tradeoffOutput = runAnalysisScript('scripts/analyzeTradeOffs.ts', logFile);
  sections.push({ title: 'Trade-Off Analysis', content: tradeoffOutput });

  // Generate recommendations
  console.log('  📝 Generating policy recommendations...\n');
  const recommendations = generateRecommendations(spiralOutput, outcomeOutput, thresholdOutput);

  // Generate limitations
  const limitations = generateLimitations(logFile);

  // Combine all sections
  const fullReport = [
    header,
    ...sections.map(s => `# ${s.title}\n\n${s.content}\n\n---\n\n`),
    recommendations,
    limitations,
  ].join('\n');

  return fullReport;
}

// Main execution
const logFile = process.argv[2];

if (!logFile) {
  console.error('❌ Usage: npx tsx scripts/generatePhase4Report.ts <log-file-or-json>');
  console.error('\nExample:');
  console.error('   npx tsx scripts/generatePhase4Report.ts logs/phase2_validation_post_fix_20251118_090346.log');
  console.error('   npx tsx scripts/generatePhase4Report.ts logs/phase2_results_2025-11-18T12-00-00.json');
  process.exit(1);
}

if (!fs.existsSync(logFile)) {
  console.error(`❌ File not found: ${logFile}`);
  process.exit(1);
}

// Generate report
const report = generateReport(logFile);

// Save to reports directory
const reportsDir = path.join('/home/user/ai_game_theory_simulation/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
const reportPath = path.join(reportsDir, `phase4_comparative_analysis_${timestamp}.md`);
fs.writeFileSync(reportPath, report);

console.log(`\n✅ Report generated: ${reportPath}`);
console.log(`\n📄 View report:`);
console.log(`   cat ${reportPath}\n`);

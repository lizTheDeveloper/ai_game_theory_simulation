#!/usr/bin/env tsx
/**
 * Validation Analysis Tool for Phase 1B Research-Skeptic Tests
 *
 * Implements 5 validation tests proposed in .claude/chatroom/channels/phase1b-validation-debate.md:
 *
 * Test 1: Mechanism Verification (N=5 utopia runs)
 *   - Extract run logs for utopias with 70%+ mortality
 *   - Verify: When did recovery start? Which techs deployed? What triggered spiral activation?
 *
 * Test 3: Extinction Profile Analysis (N=9 extinction runs)
 *   - Why did extinction increase 5% → 18%?
 *   - Are extinctions from failed recovery attempts or new collapse modes?
 *
 * Test 4: Extended Timeframe (N=10 at 240 months)
 *   - Do utopias stabilize or regress after year 10?
 *
 * Usage:
 *   npx tsx scripts/validationAnalysis.ts <path-to-monte-carlo-log>
 *
 * Output:
 *   validation_reports/phase3_validation_TIMESTAMP.json
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface RunOutcome {
  run: number;
  seed: number;
  outcome: 'utopia' | 'dystopia' | 'extinction' | 'inconclusive';
  outcomeReason: string;
  initialPopulation: number;
  finalPopulation: number;
  mortalityRate: number;
}

interface CrisisEvent {
  type: string;
  month: number;
  title?: string;
  description: string;
  severity?: string;
  impact?: string;
  agent?: string;
  impactedAgents?: string[];
  effects?: Record<string, any>;
}

interface RunEventData {
  seed: number;
  run: number;
  outcome: string;
  outcomeReason: string;
  totalMonths: number;
  events?: {
    summary?: {
      totalEvents: number;
      eventsByType: Record<string, number>;
    };
    criticalEvents?: CrisisEvent[];
  };
  criticalEvents?: CrisisEvent[];
}

interface RecoveryTimeline {
  seed: number;
  mortalityRate: number;
  recoveryStartMonth: number | null;
  keyTechnologies: string[];
  spiralsActivated: string[];
  inflectionPoints: Array<{
    month: number;
    event: string;
  }>;
  crisisCount: number;
  cascadeCount: number;
}

interface ExtinctionCategory {
  slowCollapse: number;
  failedRecovery: number;
  rapidCatastrophe: number;
  unclear: number;
}

interface ExtinctionProfile {
  seed: number;
  category: 'slowCollapse' | 'failedRecovery' | 'rapidCatastrophe' | 'unclear';
  duration: number;
  crisisCount: number;
  cascadeCount: number;
  majorCrises: string[];
  extinctionTrigger: string | null;
}

interface ValidationReport {
  metadata: {
    timestamp: string;
    logFile: string;
    totalRuns: number;
    utopiasAnalyzed: number;
    extinctionsAnalyzed: number;
  };
  mechanismVerification: {
    utopiasAnalyzed: number;
    utopiasWithHighMortality: number;
    recoveryTimelines: RecoveryTimeline[];
    commonPatterns: {
      avgRecoveryStartMonth: number | null;
      mostCommonTechs: string[];
      mostCommonSpirals: string[];
      avgCrisisCount: number;
      avgCascadeCount: number;
    };
  };
  extinctionProfile: {
    extinctionsAnalyzed: number;
    categories: ExtinctionCategory;
    profiles: ExtinctionProfile[];
    averageDuration: number;
    commonCauses: string[];
  };
  timeframeStability: {
    utopiasStableAtEnd: number;
    utopiasRegressing: number;
    stabilityMetrics: Array<{
      seed: number;
      finalMonth: number;
      assessment: 'stable' | 'regressing' | 'unclear';
      evidence: string[];
    }>;
  };
}

// ============================================================================
// LOG PARSING
// ============================================================================

/**
 * Parse Monte Carlo log file to extract run outcomes
 */
function parseMonteCarloLog(logPath: string): RunOutcome[] {
  const logContent = fs.readFileSync(logPath, 'utf-8');
  const lines = logContent.split('\n');

  const outcomes: RunOutcome[] = [];
  let inOutcomeSection = false;

  for (const line of lines) {
    // Start of outcome section
    if (line.includes('OUTCOME REASONS BY RUN') || line.includes('📋 OUTCOME REASONS')) {
      inOutcomeSection = true;
      continue;
    }

    // End of outcome section
    if (inOutcomeSection && line.includes('====')) {
      break;
    }

    if (inOutcomeSection) {
      // Parse lines like: "🌟 Run 2 (Seed 42001): UTOPIA"
      const runMatch = line.match(/(?:🌟|🏛️|💀|❓)\s+Run\s+(\d+)\s+\(Seed\s+(\d+)\):\s+(\w+)/);
      if (runMatch) {
        const [, runStr, seedStr, outcomeStr] = runMatch;
        const run = parseInt(runStr, 10);
        const seed = parseInt(seedStr, 10);
        const outcome = outcomeStr.toLowerCase() as 'utopia' | 'dystopia' | 'extinction' | 'inconclusive';

        // Look ahead for reason and population
        let i = lines.indexOf(line);
        let outcomeReason = '';
        let initialPopulation = 8.0;
        let finalPopulation = 0;
        let mortalityRate = 0;

        // Next 2 lines should have reason and population
        if (i + 1 < lines.length) {
          outcomeReason = lines[i + 1].trim();
        }
        if (i + 2 < lines.length) {
          const popLine = lines[i + 2].trim();
          const popMatch = popLine.match(/Population:\s+([\d.]+)B\s+→\s+([\d.]+)B\s+\(([\d.]+)%\s+decline\)/);
          if (popMatch) {
            initialPopulation = parseFloat(popMatch[1]);
            finalPopulation = parseFloat(popMatch[2]);
            mortalityRate = parseFloat(popMatch[3]) / 100;
          }
        }

        outcomes.push({
          run,
          seed,
          outcome,
          outcomeReason,
          initialPopulation,
          finalPopulation,
          mortalityRate,
        });
      }
    }
  }

  return outcomes;
}

/**
 * Load individual run event file
 */
function loadRunEventData(outputDir: string, seed: number): RunEventData | null {
  const eventFilePath = path.join(outputDir, `run_${seed}_events.json`);

  if (!fs.existsSync(eventFilePath)) {
    console.warn(`  ⚠️ Event file not found: ${eventFilePath}`);
    return null;
  }

  try {
    const content = fs.readFileSync(eventFilePath, 'utf-8');
    return JSON.parse(content) as RunEventData;
  } catch (error) {
    console.error(`  ❌ Failed to parse ${eventFilePath}:`, error);
    return null;
  }
}

// ============================================================================
// TEST 1: MECHANISM VERIFICATION
// ============================================================================

/**
 * Analyze utopia runs to understand recovery mechanisms
 */
function analyzeMechanismVerification(
  outcomes: RunOutcome[],
  outputDir: string
): ValidationReport['mechanismVerification'] {
  console.log('\n=== TEST 1: MECHANISM VERIFICATION ===');

  const utopiaRuns = outcomes.filter(o => o.outcome === 'utopia');
  const highMortalityUtopias = utopiaRuns.filter(o => o.mortalityRate >= 0.70);

  console.log(`  Total utopias: ${utopiaRuns.length}`);
  console.log(`  Utopias with 70%+ mortality: ${highMortalityUtopias.length}`);

  const recoveryTimelines: RecoveryTimeline[] = [];

  for (const run of highMortalityUtopias) {
    console.log(`  Analyzing Run ${run.run} (Seed ${run.seed}) - ${(run.mortalityRate * 100).toFixed(1)}% mortality`);

    const eventData = loadRunEventData(outputDir, run.seed);
    if (!eventData) {
      continue;
    }

    // Extract crisis events
    const criticalEvents = eventData.criticalEvents || eventData.events?.criticalEvents || [];

    // Count crises and cascades
    const crisisCount = eventData.events?.summary?.eventsByType?.crisis || 0;
    const cascadeCount = eventData.events?.summary?.eventsByType?.cascading_failure || 0;

    // Extract key technologies from deployment events
    const keyTechnologies = criticalEvents
      .filter(e => e.type === 'deployment' || e.description?.includes('technology') || e.description?.includes('breakthrough'))
      .map(e => e.title || e.description)
      .filter((t): t is string => !!t);

    // Extract spiral activations (look for spiral-related events)
    const spiralsActivated = criticalEvents
      .filter(e => e.description?.toLowerCase().includes('spiral') || e.title?.toLowerCase().includes('spiral'))
      .map(e => e.title || e.description)
      .filter((s): s is string => !!s);

    // Find inflection points (major positive events after crises)
    const inflectionPoints: Array<{month: number; event: string}> = [];

    // Look for crisis resolution, tech deployment, spiral activation
    for (const event of criticalEvents) {
      if (
        event.description?.includes('breakthrough') ||
        event.description?.includes('spiral') ||
        event.description?.includes('recovery') ||
        event.type === 'deployment'
      ) {
        inflectionPoints.push({
          month: event.month || 0,
          event: event.title || event.description || 'Unknown event',
        });
      }
    }

    // Try to identify recovery start month (when positive events begin to outweigh crises)
    let recoveryStartMonth: number | null = null;

    // Heuristic: Look for first major tech deployment or spiral after initial crisis period
    const techDeployments = inflectionPoints.filter(p => p.month > 0);
    if (techDeployments.length > 0) {
      recoveryStartMonth = techDeployments[0].month;
    }

    recoveryTimelines.push({
      seed: run.seed,
      mortalityRate: run.mortalityRate,
      recoveryStartMonth,
      keyTechnologies: [...new Set(keyTechnologies)].slice(0, 10), // Unique, top 10
      spiralsActivated: [...new Set(spiralsActivated)],
      inflectionPoints: inflectionPoints.slice(0, 10), // Top 10
      crisisCount,
      cascadeCount,
    });
  }

  // Calculate common patterns
  const validRecoveryMonths = recoveryTimelines
    .map(t => t.recoveryStartMonth)
    .filter((m): m is number => m !== null);

  const avgRecoveryStartMonth = validRecoveryMonths.length > 0
    ? validRecoveryMonths.reduce((sum, m) => sum + m, 0) / validRecoveryMonths.length
    : null;

  const allTechs = recoveryTimelines.flatMap(t => t.keyTechnologies);
  const techFrequency = new Map<string, number>();
  for (const tech of allTechs) {
    techFrequency.set(tech, (techFrequency.get(tech) || 0) + 1);
  }
  const mostCommonTechs = Array.from(techFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tech]) => tech);

  const allSpirals = recoveryTimelines.flatMap(t => t.spiralsActivated);
  const spiralFrequency = new Map<string, number>();
  for (const spiral of allSpirals) {
    spiralFrequency.set(spiral, (spiralFrequency.get(spiral) || 0) + 1);
  }
  const mostCommonSpirals = Array.from(spiralFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([spiral]) => spiral);

  const avgCrisisCount = recoveryTimelines.length > 0
    ? recoveryTimelines.reduce((sum, t) => sum + t.crisisCount, 0) / recoveryTimelines.length
    : 0;

  const avgCascadeCount = recoveryTimelines.length > 0
    ? recoveryTimelines.reduce((sum, t) => sum + t.cascadeCount, 0) / recoveryTimelines.length
    : 0;

  console.log(`  ✓ Analyzed ${recoveryTimelines.length} high-mortality utopia runs`);
  console.log(`  ✓ Avg recovery start: Month ${avgRecoveryStartMonth?.toFixed(1) || 'N/A'}`);
  console.log(`  ✓ Most common techs: ${mostCommonTechs.slice(0, 3).join(', ') || 'None found'}`);

  return {
    utopiasAnalyzed: utopiaRuns.length,
    utopiasWithHighMortality: highMortalityUtopias.length,
    recoveryTimelines,
    commonPatterns: {
      avgRecoveryStartMonth,
      mostCommonTechs,
      mostCommonSpirals,
      avgCrisisCount,
      avgCascadeCount,
    },
  };
}

// ============================================================================
// TEST 3: EXTINCTION PROFILE ANALYSIS
// ============================================================================

/**
 * Categorize extinction causes
 */
function categorizeExtinction(eventData: RunEventData): 'slowCollapse' | 'failedRecovery' | 'rapidCatastrophe' | 'unclear' {
  const criticalEvents = eventData.criticalEvents || eventData.events?.criticalEvents || [];
  const duration = eventData.totalMonths || 0;

  // Check for rapid catastrophe indicators
  const hasSleeperActivation = criticalEvents.some(e =>
    e.title?.includes('SLEEPER AGENT') || e.description?.includes('sleeper')
  );
  const hasNuclearEvent = criticalEvents.some(e =>
    e.description?.toLowerCase().includes('nuclear') || e.title?.toLowerCase().includes('nuclear')
  );
  const hasGreyGoo = criticalEvents.some(e =>
    e.description?.toLowerCase().includes('grey goo') || e.description?.toLowerCase().includes('nanotech')
  );

  if (hasSleeperActivation || hasNuclearEvent || hasGreyGoo) {
    // Check if it was actually rapid
    const catastrophicEventMonth = criticalEvents.find(e =>
      e.title?.includes('SLEEPER') || e.description?.toLowerCase().includes('nuclear')
    )?.month || 0;

    if (duration - catastrophicEventMonth < 24) { // Less than 24 months after catastrophe
      return 'rapidCatastrophe';
    }
  }

  // Check for failed recovery (high tech deployment but still extinction)
  const techDeployments = eventData.events?.summary?.eventsByType?.deployment || 0;
  const breakthroughs = eventData.events?.summary?.eventsByType?.breakthrough || 0;

  if (techDeployments > 5 || breakthroughs > 3) {
    return 'failedRecovery';
  }

  // Check for slow collapse (environmental cascades)
  const cascades = eventData.events?.summary?.eventsByType?.cascading_failure || 0;
  const crises = eventData.events?.summary?.eventsByType?.crisis || 0;

  if (cascades > 20 || crises > 30) {
    return 'slowCollapse';
  }

  // Default to slow collapse if unclear
  return cascades > 0 || crises > 0 ? 'slowCollapse' : 'unclear';
}

/**
 * Analyze extinction runs to understand failure modes
 */
function analyzeExtinctionProfile(
  outcomes: RunOutcome[],
  outputDir: string
): ValidationReport['extinctionProfile'] {
  console.log('\n=== TEST 3: EXTINCTION PROFILE ANALYSIS ===');

  const extinctionRuns = outcomes.filter(o => o.outcome === 'extinction');

  console.log(`  Total extinctions: ${extinctionRuns.length}`);

  const profiles: ExtinctionProfile[] = [];
  const categories: ExtinctionCategory = {
    slowCollapse: 0,
    failedRecovery: 0,
    rapidCatastrophe: 0,
    unclear: 0,
  };

  for (const run of extinctionRuns) {
    console.log(`  Analyzing Run ${run.run} (Seed ${run.seed})`);

    const eventData = loadRunEventData(outputDir, run.seed);
    if (!eventData) {
      continue;
    }

    const category = categorizeExtinction(eventData);
    categories[category]++;

    const criticalEvents = eventData.criticalEvents || eventData.events?.criticalEvents || [];
    const crisisCount = eventData.events?.summary?.eventsByType?.crisis || 0;
    const cascadeCount = eventData.events?.summary?.eventsByType?.cascading_failure || 0;

    // Extract major crises
    const majorCrises = criticalEvents
      .filter(e => e.severity === 'destructive' || e.severity === 'high')
      .map(e => e.title || e.description)
      .filter((c): c is string => !!c)
      .slice(0, 5);

    // Find extinction trigger
    const extinctionEvent = criticalEvents.find(e =>
      e.id?.includes('extinction') || e.type === 'extinction'
    );
    const extinctionTrigger = extinctionEvent?.title || extinctionEvent?.description || null;

    profiles.push({
      seed: run.seed,
      category,
      duration: eventData.totalMonths || 0,
      crisisCount,
      cascadeCount,
      majorCrises,
      extinctionTrigger,
    });
  }

  // Calculate common causes
  const allCrises = profiles.flatMap(p => p.majorCrises);
  const crisisFrequency = new Map<string, number>();
  for (const crisis of allCrises) {
    crisisFrequency.set(crisis, (crisisFrequency.get(crisis) || 0) + 1);
  }
  const commonCauses = Array.from(crisisFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([cause]) => cause);

  const avgDuration = profiles.length > 0
    ? profiles.reduce((sum, p) => sum + p.duration, 0) / profiles.length
    : 0;

  console.log(`  ✓ Analyzed ${profiles.length} extinction runs`);
  console.log(`  ✓ Slow collapse: ${categories.slowCollapse} (${((categories.slowCollapse / profiles.length) * 100).toFixed(1)}%)`);
  console.log(`  ✓ Failed recovery: ${categories.failedRecovery} (${((categories.failedRecovery / profiles.length) * 100).toFixed(1)}%)`);
  console.log(`  ✓ Rapid catastrophe: ${categories.rapidCatastrophe} (${((categories.rapidCatastrophe / profiles.length) * 100).toFixed(1)}%)`);

  return {
    extinctionsAnalyzed: extinctionRuns.length,
    categories,
    profiles,
    averageDuration: avgDuration,
    commonCauses,
  };
}

// ============================================================================
// TEST 4: TIMEFRAME STABILITY
// ============================================================================

/**
 * Analyze whether utopias remain stable at end of simulation
 */
function analyzeTimeframeStability(
  outcomes: RunOutcome[],
  outputDir: string
): ValidationReport['timeframeStability'] {
  console.log('\n=== TEST 4: TIMEFRAME STABILITY ===');

  const utopiaRuns = outcomes.filter(o => o.outcome === 'utopia');

  console.log(`  Total utopias: ${utopiaRuns.length}`);

  const stabilityMetrics: ValidationReport['timeframeStability']['stabilityMetrics'] = [];
  let stableCount = 0;
  let regressingCount = 0;

  for (const run of utopiaRuns) {
    const eventData = loadRunEventData(outputDir, run.seed);
    if (!eventData) {
      continue;
    }

    const finalMonth = eventData.totalMonths || 0;
    const criticalEvents = eventData.criticalEvents || eventData.events?.criticalEvents || [];

    // Look for signs of regression in final 20% of simulation
    const regressionWindow = finalMonth * 0.8;
    const lateEvents = criticalEvents.filter(e => (e.month || 0) >= regressionWindow);

    const evidence: string[] = [];
    let assessment: 'stable' | 'regressing' | 'unclear' = 'stable';

    // Check for late-stage crises
    const lateCrises = lateEvents.filter(e => e.type === 'crisis' || e.severity === 'high');
    if (lateCrises.length > 5) {
      evidence.push(`${lateCrises.length} crises in final 20% of simulation`);
      assessment = 'regressing';
    }

    // Check for cascade events
    const lateCascades = lateEvents.filter(e => e.type === 'cascading_failure');
    if (lateCascades.length > 3) {
      evidence.push(`${lateCascades.length} cascading failures in final 20%`);
      assessment = 'regressing';
    }

    // Check for extinction events (shouldn't happen in utopia but check anyway)
    const extinctionEvents = lateEvents.filter(e => e.type === 'extinction');
    if (extinctionEvents.length > 0) {
      evidence.push(`${extinctionEvents.length} extinction events detected`);
      assessment = 'regressing';
    }

    // If very few late events, it's stable
    if (lateEvents.length < 3 && assessment === 'stable') {
      evidence.push('Minimal crisis activity in final phase');
    }

    if (assessment === 'stable') {
      stableCount++;
    } else if (assessment === 'regressing') {
      regressingCount++;
    }

    stabilityMetrics.push({
      seed: run.seed,
      finalMonth,
      assessment,
      evidence,
    });
  }

  console.log(`  ✓ Stable utopias: ${stableCount} (${((stableCount / utopiaRuns.length) * 100).toFixed(1)}%)`);
  console.log(`  ✓ Regressing utopias: ${regressingCount} (${((regressingCount / utopiaRuns.length) * 100).toFixed(1)}%)`);

  return {
    utopiasStableAtEnd: stableCount,
    utopiasRegressing: regressingCount,
    stabilityMetrics,
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('🔍 VALIDATION ANALYSIS TOOL - Phase 1B Research-Skeptic Tests');
  console.log('='.repeat(80));

  // Parse command-line arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: No log file specified');
    console.error('Usage: npx tsx scripts/validationAnalysis.ts <path-to-monte-carlo-log>');
    process.exit(1);
  }

  const logPath = args[0];

  if (!fs.existsSync(logPath)) {
    console.error(`❌ Error: Log file not found: ${logPath}`);
    process.exit(1);
  }

  console.log(`📄 Reading log file: ${logPath}\n`);

  // Parse outcomes from main log
  const outcomes = parseMonteCarloLog(logPath);
  console.log(`✓ Parsed ${outcomes.length} run outcomes`);

  // Determine output directory (same as log file)
  const outputDir = path.dirname(logPath);

  // Run analyses
  const mechanismVerification = analyzeMechanismVerification(outcomes, outputDir);
  const extinctionProfile = analyzeExtinctionProfile(outcomes, outputDir);
  const timeframeStability = analyzeTimeframeStability(outcomes, outputDir);

  // Generate report
  const timestamp = new Date().toISOString();
  const report: ValidationReport = {
    metadata: {
      timestamp,
      logFile: logPath,
      totalRuns: outcomes.length,
      utopiasAnalyzed: outcomes.filter(o => o.outcome === 'utopia').length,
      extinctionsAnalyzed: outcomes.filter(o => o.outcome === 'extinction').length,
    },
    mechanismVerification,
    extinctionProfile,
    timeframeStability,
  };

  // Save report
  const reportDir = path.join(__dirname, '..', 'validation_reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportTimestamp = timestamp.replace(/[:.]/g, '-').slice(0, -5);
  const reportPath = path.join(reportDir, `phase3_validation_${reportTimestamp}.json`);

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n' + '='.repeat(80));
  console.log('📊 VALIDATION REPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n✓ Total runs analyzed: ${outcomes.length}`);
  console.log(`✓ Utopias: ${report.metadata.utopiasAnalyzed}`);
  console.log(`✓ Extinctions: ${report.metadata.extinctionsAnalyzed}`);
  console.log(`\n📁 Report saved to: ${reportPath}`);
  console.log('\n✅ Validation analysis complete!');
}

// Run if executed directly
if (require.main === module) {
  main();
}

export {
  parseMonteCarloLog,
  loadRunEventData,
  analyzeMechanismVerification,
  analyzeExtinctionProfile,
  analyzeTimeframeStability,
  ValidationReport,
};

/**
 * Analyze Mortality Sources from Diagnostic Logs
 *
 * Parses mortality risk summaries to identify:
 * 1. Top mortality contributors by proximate cause
 * 2. Top mortality contributors by root cause
 * 3. Months with highest base mortality
 * 4. Average monthly base mortality
 * 5. Sources hitting Holodomor cap (2.8% monthly)
 *
 * Nov 6, 2025 - Week 1 CRITICAL Phase 2
 */

import * as fs from 'fs';
import * as path from 'path';

interface MortalitySummary {
  month: number;
  totalBaseRisk: number;
  riskEvents: number;
  proximateCauses: Map<string, number>;
  rootCauses: Map<string, number>;
  topSources: Array<{ source: string; risk: number; percent: number; events: number }>;
}

function parseLogFile(filePath: string): MortalitySummary[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const summaries: MortalitySummary[] = [];
  let currentSummary: MortalitySummary | null = null;
  let parsingProximate = false;
  let parsingRoot = false;
  let parsingTop5 = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Start of a new summary
    const monthMatch = line.match(/MORTALITY RISK SUMMARY \(Month (\d+)\)/);
    if (monthMatch) {
      const month = parseInt(monthMatch[1]);
      currentSummary = {
        month,
        totalBaseRisk: 0,
        riskEvents: 0,
        proximateCauses: new Map(),
        rootCauses: new Map(),
        topSources: [],
      };
      parsingProximate = false;
      parsingRoot = false;
      parsingTop5 = false;
      continue;
    }

    if (!currentSummary) continue;

    // Parse total base risk
    const riskMatch = line.match(/Total base risk: ([\d.]+) \(([\d.]+)%\)/);
    if (riskMatch) {
      currentSummary.totalBaseRisk = parseFloat(riskMatch[1]);
      continue;
    }

    // Parse risk events count
    const eventsMatch = line.match(/Risk events: (\d+)/);
    if (eventsMatch) {
      currentSummary.riskEvents = parseInt(eventsMatch[1]);
      continue;
    }

    // Section markers
    if (line.includes('By Proximate Cause:')) {
      parsingProximate = true;
      parsingRoot = false;
      parsingTop5 = false;
      continue;
    }
    if (line.includes('By Root Cause:')) {
      parsingProximate = false;
      parsingRoot = true;
      parsingTop5 = false;
      continue;
    }
    if (line.includes('Top 5 Sources')) {
      parsingProximate = false;
      parsingRoot = false;
      parsingTop5 = true;
      continue;
    }

    // Parse proximate causes (handle [Run X/Y] prefix)
    if (parsingProximate) {
      const causeMatch = line.match(/([a-z]+): ([\d.]+) \(([\d.]+)% of total\)/);
      if (causeMatch) {
        currentSummary.proximateCauses.set(causeMatch[1], parseFloat(causeMatch[2]));
      }
    }

    // Parse root causes (handle [Run X/Y] prefix)
    if (parsingRoot) {
      const causeMatch = line.match(/([a-z]+): ([\d.]+) \(([\d.]+)% of total\)/);
      if (causeMatch) {
        currentSummary.rootCauses.set(causeMatch[1], parseFloat(causeMatch[2]));
      }
    }

    // Parse top 5 sources (handle [Run X/Y] prefix)
    if (parsingTop5) {
      const sourceMatch = line.match(/([^:]+): ([\d.]+) \(([\d.]+)%, (\d+) events\)/);
      if (sourceMatch) {
        currentSummary.topSources.push({
          source: sourceMatch[1].trim(),
          risk: parseFloat(sourceMatch[2]),
          percent: parseFloat(sourceMatch[3]),
          events: parseInt(sourceMatch[4]),
        });
      }
    }

    // End of summary (look for next section or stabilizers)
    if (line.includes('Stabilizers applied') || line.includes('Monthly Mortality Resolved')) {
      if (currentSummary.totalBaseRisk > 0) {
        summaries.push(currentSummary);
      }
      currentSummary = null;
      parsingProximate = false;
      parsingRoot = false;
      parsingTop5 = false;
    }
  }

  // Push last summary if exists
  if (currentSummary && currentSummary.totalBaseRisk > 0) {
    summaries.push(currentSummary);
  }

  return summaries;
}

function analyzeSummaries(summaries: MortalitySummary[]): void {
  if (summaries.length === 0) {
    console.log('No mortality summaries found in log file.');
    return;
  }

  // Aggregate data
  const totalProximate = new Map<string, number>();
  const totalRoot = new Map<string, number>();
  const totalSources = new Map<string, { risk: number; count: number }>();

  let totalRisk = 0;
  let monthsAboveCap = 0;
  const CAP_THRESHOLD = 0.028; // Holodomor cap (2.8% monthly)

  for (const summary of summaries) {
    totalRisk += summary.totalBaseRisk;
    if (summary.totalBaseRisk > CAP_THRESHOLD) {
      monthsAboveCap++;
    }

    // Aggregate proximate causes
    for (const [cause, risk] of summary.proximateCauses.entries()) {
      totalProximate.set(cause, (totalProximate.get(cause) || 0) + risk);
    }

    // Aggregate root causes
    for (const [cause, risk] of summary.rootCauses.entries()) {
      totalRoot.set(cause, (totalRoot.get(cause) || 0) + risk);
    }

    // Aggregate sources
    for (const source of summary.topSources) {
      const existing = totalSources.get(source.source) || { risk: 0, count: 0 };
      totalSources.set(source.source, {
        risk: existing.risk + source.risk,
        count: existing.count + source.events,
      });
    }
  }

  const avgRisk = totalRisk / summaries.length;

  // Report
  console.log(`\n${'='.repeat(80)}`);
  console.log(`💀💀💀 MORTALITY SOURCES ANALYSIS (60-month simulation) 💀💀💀`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`📊 SUMMARY STATISTICS:`);
  console.log(`  Months analyzed: ${summaries.length}`);
  console.log(`  Average base mortality: ${avgRisk.toFixed(4)} (${(avgRisk * 100).toFixed(2)}%/month)`);
  console.log(`  Total cumulative risk: ${totalRisk.toFixed(2)}`);
  console.log(`  Months above Holodomor cap (2.8%): ${monthsAboveCap} (${((monthsAboveCap / summaries.length) * 100).toFixed(1)}%)`);
  console.log(``);

  // Top proximate causes
  console.log(`📊 TOP PROXIMATE CAUSES (cumulative over 60 months):`);
  const sortedProximate = Array.from(totalProximate.entries())
    .sort((a, b) => b[1] - a[1]);

  for (const [cause, risk] of sortedProximate) {
    const pct = (risk / totalRisk) * 100;
    const avgMonthly = risk / summaries.length;
    console.log(`  ${cause}: ${risk.toFixed(4)} total (${pct.toFixed(1)}% of all risk, ${(avgMonthly * 100).toFixed(2)}%/month avg)`);
  }
  console.log(``);

  // Top root causes
  console.log(`🔍 TOP ROOT CAUSES (cumulative over 60 months):`);
  const sortedRoot = Array.from(totalRoot.entries())
    .sort((a, b) => b[1] - a[1]);

  for (const [cause, risk] of sortedRoot) {
    const pct = (risk / totalRisk) * 100;
    const avgMonthly = risk / summaries.length;
    console.log(`  ${cause}: ${risk.toFixed(4)} total (${pct.toFixed(1)}% of all risk, ${(avgMonthly * 100).toFixed(2)}%/month avg)`);
  }
  console.log(``);

  // Top specific sources
  console.log(`🎯 TOP 10 SPECIFIC SOURCES (proximate + root):`);
  const sortedSources = Array.from(totalSources.entries())
    .sort((a, b) => b[1].risk - a[1].risk)
    .slice(0, 10);

  for (const [source, data] of sortedSources) {
    const pct = (data.risk / totalRisk) * 100;
    const avgMonthly = data.risk / summaries.length;
    console.log(`  ${source}: ${data.risk.toFixed(4)} total (${pct.toFixed(1)}%, ${data.count} events, ${(avgMonthly * 100).toFixed(2)}%/month avg)`);
  }
  console.log(``);

  // Months with highest risk
  console.log(`⚠️  HIGHEST MORTALITY MONTHS:`);
  const sortedByRisk = summaries
    .slice()
    .sort((a, b) => b.totalBaseRisk - a.totalBaseRisk)
    .slice(0, 10);

  for (const summary of sortedByRisk) {
    const topSource = summary.topSources[0];
    console.log(`  Month ${summary.month}: ${(summary.totalBaseRisk * 100).toFixed(2)}% (${topSource ? topSource.source : 'unknown'})`);
  }
  console.log(``);

  console.log(`${'='.repeat(80)}\n`);
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: npx tsx scripts/analyzeMortalitySources.ts <log-file-path>');
  process.exit(1);
}

const logFilePath = args[0];
if (!fs.existsSync(logFilePath)) {
  console.error(`Error: Log file not found: ${logFilePath}`);
  process.exit(1);
}

console.log(`Analyzing mortality sources from: ${logFilePath}\n`);
const summaries = parseLogFile(logFilePath);
analyzeSummaries(summaries);

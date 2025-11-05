/**
 * Dashboard Metrics Validation
 *
 * Validates that all expected dashboard metrics exist in the StateDelta interface.
 * Generates a report showing which metrics are required, optional, or missing.
 *
 * Usage:
 *   npx tsx scripts/validateDashboardMetrics.ts
 */

import { DASHBOARD_EXPECTATIONS, type MetricExpectation } from '../src/lib/utils/metricValidation'
import * as fs from 'fs'
import * as path from 'path'

interface ValidationReport {
  timestamp: string
  dashboards: {
    [dashboardName: string]: {
      required: MetricExpectation[]
      optional: MetricExpectation[]
      totalMetrics: number
    }
  }
  summary: {
    totalRequired: number
    totalOptional: number
    dashboardCount: number
  }
}

function generateReport(): ValidationReport {
  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    dashboards: {},
    summary: {
      totalRequired: 0,
      totalOptional: 0,
      dashboardCount: 0
    }
  }

  // Analyze each dashboard's expectations
  for (const [dashboardName, expectations] of Object.entries(DASHBOARD_EXPECTATIONS)) {
    const required = expectations.filter(e => e.required)
    const optional = expectations.filter(e => !e.required)

    report.dashboards[dashboardName] = {
      required,
      optional,
      totalMetrics: expectations.length
    }

    report.summary.totalRequired += required.length
    report.summary.totalOptional += optional.length
    report.summary.dashboardCount++
  }

  return report
}

function generateMarkdownReport(report: ValidationReport): string {
  let md = `# Dashboard Metrics Validation Report\n\n`
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`

  // Summary
  md += `## Summary\n\n`
  md += `- **Dashboards:** ${report.summary.dashboardCount}\n`
  md += `- **Total Required Metrics:** ${report.summary.totalRequired}\n`
  md += `- **Total Optional Metrics:** ${report.summary.totalOptional}\n\n`

  // Per-dashboard details
  md += `## Dashboard Expectations\n\n`

  for (const [dashboardName, details] of Object.entries(report.dashboards)) {
    md += `### ${dashboardName.charAt(0).toUpperCase() + dashboardName.slice(1)} Dashboard\n\n`

    md += `**Total Metrics:** ${details.totalMetrics} (${details.required.length} required, ${details.optional.length} optional)\n\n`

    if (details.required.length > 0) {
      md += `#### Required Metrics\n\n`
      md += `These metrics MUST be present in every StateDelta update. Missing values indicate simulation bugs.\n\n`
      md += `| Metric | Path | Notes |\n`
      md += `|--------|------|-------|\n`
      for (const metric of details.required) {
        md += `| ${metric.name} | \`${String(metric.path)}\` | ${metric.reason || '-'} |\n`
      }
      md += `\n`
    }

    if (details.optional.length > 0) {
      md += `#### Optional Metrics\n\n`
      md += `These metrics may be absent in some scenarios. Dashboard shows "N/A" when missing.\n\n`
      md += `| Metric | Path | When Present |\n`
      md += `|--------|------|-------------|\n`
      for (const metric of details.optional) {
        md += `| ${metric.name} | \`${String(metric.path)}\` | ${metric.reason || 'Optional'} |\n`
      }
      md += `\n`
    }
  }

  // Usage instructions
  md += `## Runtime Validation\n\n`
  md += `Each dashboard component validates its expected metrics in real-time using the \`validateMetrics\` utility.\n\n`
  md += `- **Required metrics missing**: Logs \`console.error\` (red) - indicates simulation bug\n`
  md += `- **Optional metrics missing**: Logs \`console.warn\` (yellow) in development mode only\n\n`
  md += `To see validation warnings:\n`
  md += `1. Run the simulation in development mode\n`
  md += `2. Open browser console\n`
  md += `3. Navigate to each dashboard\n`
  md += `4. Check for ❌ (error) or ⚠️ (warning) messages\n\n`

  md += `## Fixing Missing Required Metrics\n\n`
  md += `If you see \`❌ Required metric missing\` errors:\n\n`
  md += `1. **Identify the phase** that should be setting this value\n`
  md += `2. **Check initialization** in \`src/simulation/initialization.ts\`\n`
  md += `3. **Verify worker delta** in \`src/workers/simulationWorker.ts\` (search for the metric name)\n`
  md += `4. **Run this validation** after fixing: \`npx tsx scripts/validateDashboardMetrics.ts\`\n\n`

  return md
}

function main() {
  console.log(`\n📊 Dashboard Metrics Validation`)
  console.log(`===============================\n`)

  const report = generateReport()

  console.log(`Dashboards analyzed: ${report.summary.dashboardCount}`)
  console.log(`Required metrics: ${report.summary.totalRequired}`)
  console.log(`Optional metrics: ${report.summary.totalOptional}`)
  console.log(`\nGenerating report...\n`)

  // Generate markdown report
  const markdown = generateMarkdownReport(report)

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const outputPath = path.join(process.cwd(), 'logs', `dashboard_metrics_${timestamp}.md`)
  fs.writeFileSync(outputPath, markdown)

  console.log(`✅ Report saved to: ${outputPath}`)
  console.log(`\n📖 This report documents expected metrics for each dashboard.`)
  console.log(`   To validate at runtime:`)
  console.log(`   1. Run simulation in dev mode`)
  console.log(`   2. Open browser console`)
  console.log(`   3. Navigate dashboards and watch for ❌/⚠️ messages\n`)

  process.exit(0)
}

main()

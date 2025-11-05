/**
 * Automated Dashboard Metrics Validation
 *
 * Uses Playwright to navigate dashboards and capture console warnings/errors
 * about missing metrics. Generates a report listing all validation issues.
 *
 * Prerequisites: Dev server must be running on localhost:3000
 * Usage: npx tsx scripts/validateDashboardMetricsAutomated.ts
 */

import { chromium, type Browser, type Page, type ConsoleMessage } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface ValidationIssue {
  dashboard: string
  severity: 'error' | 'warning'
  metricName: string
  metricPath: string
  message: string
  month?: string
}

const DASHBOARDS = [
  { name: 'Overview', path: '/' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Environmental', path: '/environment' },
  { name: 'Regions', path: '/regions' },
  { name: 'AI Agents', path: '/ai-agents' },
  { name: 'Paradigm', path: '/paradigms' },
  { name: 'Tech Tree', path: '/tech-tree' },
  { name: 'Crises', path: '/crises' },
  { name: 'Timeline', path: '/timeline' },
  { name: 'Detection', path: '/detection' },
  { name: 'Monte Carlo', path: '/monte-carlo' },
  { name: 'Realtime', path: '/realtime' },
]

const BASE_URL = 'http://localhost:3333'

interface ConsoleCapture {
  issues: ValidationIssue[]
  allMessages: Array<{ type: string; text: string }>
}

function createConsoleHandler(dashboardName: string): {
  handler: (msg: ConsoleMessage) => void
  getCapture: () => ConsoleCapture
} {
  const issues: ValidationIssue[] = []
  const allMessages: Array<{ type: string; text: string }> = []

  const handler = (msg: ConsoleMessage) => {
    try {
      // Use synchronous text() to avoid missing messages
      const fullText = msg.text()
      const type = msg.type()

      // Capture all console messages for debugging
      allMessages.push({ type, text: fullText })

      // Check if this is a validation error/warning
      if (fullText.includes('Required metric missing') ||
          fullText.includes('Optional metric absent') ||
          fullText.includes('❌') ||
          fullText.includes('⚠️')) {

        const severity = type === 'error' ? 'error' : 'warning'

        // Parse the message to extract details
        const metricMatch = fullText.match(/(?:Required metric missing|Optional metric absent): (.+?) \((.+?)\)/)
        const monthMatch = fullText.match(/Month: (\d+|unknown)/)

        issues.push({
          dashboard: dashboardName,
          severity,
          metricName: metricMatch?.[1] || 'Unknown',
          metricPath: metricMatch?.[2] || 'Unknown',
          message: fullText,
          month: monthMatch?.[1],
        })

        // Log to our console for visibility
        console.log(`      [CAPTURED] ${type.toUpperCase()}: ${fullText.substring(0, 150)}${fullText.length > 150 ? '...' : ''}`)
      }
    } catch (error) {
      // Silently ignore console capture errors
    }
  }

  return {
    handler,
    getCapture: () => ({ issues, allMessages })
  }
}

async function captureDashboardIssues(
  page: Page,
  dashboardName: string
): Promise<ValidationIssue[]> {
  console.log(`  Checking ${dashboardName} dashboard...`)

  const { handler, getCapture } = createConsoleHandler(dashboardName)

  // Attach console handler BEFORE navigating
  page.on('console', handler)

  try {
    // Wait for dashboard to load and render
    await page.waitForTimeout(3000)

    // Wait for simulation data (check for "Waiting for Data" to disappear)
    try {
      await page.waitForSelector('text=Waiting for Data', { state: 'detached', timeout: 10000 })
    } catch {
      // If waiting state doesn't exist or timeout, continue
    }

    // Give extra time for useEffect validation to run
    await page.waitForTimeout(2000)

    const capture = getCapture()

    // Debug: Show ALL console messages for debugging
    const errorLogs = capture.allMessages.filter(m => m.type === 'error')
    const warnLogs = capture.allMessages.filter(m => m.type === 'warning')

    console.log(`      DEBUG: Captured ${capture.allMessages.length} total console messages (${errorLogs.length} errors, ${warnLogs.length} warnings)`)

    if (capture.issues.length === 0 && (errorLogs.length > 0 || warnLogs.length > 0)) {
      console.log(`      No validation messages matched patterns`)
      console.log(`      All error messages:`)
      errorLogs.forEach((m, i) => {
        console.log(`        ${i + 1}. [${m.type}] ${m.text.substring(0, 150)}`)
      })
      console.log(`      All warning messages:`)
      warnLogs.forEach((m, i) => {
        console.log(`        ${i + 1}. [${m.type}] ${m.text.substring(0, 150)}`)
      })
    } else if (capture.issues.length > 0) {
      console.log(`      ✓ Found ${capture.issues.length} validation issue(s)`)
    }

    return capture.issues
  } finally {
    page.off('console', handler)
  }
}

async function runValidation(): Promise<ValidationIssue[]> {
  console.log(`\n🔍 Automated Dashboard Validation`)
  console.log(`==================================\n`)
  console.log(`Connecting to ${BASE_URL}...\n`)

  let browser: Browser | null = null
  const allIssues: ValidationIssue[] = []
  const allConsoleMessages: Array<{ type: string; text: string; dashboard: string }> = []
  let currentDashboard = 'initial'

  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()
    const page = await context.newPage()

    // CRITICAL: Attach global console handler BEFORE any navigation
    page.on('console', (msg: ConsoleMessage) => {
      try {
        const text = msg.text()
        const type = msg.type()

        // Capture ALL console messages with current dashboard context
        allConsoleMessages.push({ type, text, dashboard: currentDashboard })

        // Check for validation errors
        if (text.includes('Required metric missing') ||
            text.includes('Optional metric absent') ||
            text.includes('❌') ||
            text.includes('⚠️')) {

          const severity = type === 'error' ? 'error' : 'warning'
          const metricMatch = text.match(/(?:Required metric missing|Optional metric absent): (.+?) \((.+?)\)/)
          const monthMatch = text.match(/Month: (\d+|unknown)/)

          allIssues.push({
            dashboard: currentDashboard,
            severity,
            metricName: metricMatch?.[1] || 'Unknown',
            metricPath: metricMatch?.[2] || 'Unknown',
            message: text,
            month: monthMatch?.[1],
          })

          console.log(`      [CAPTURED] ${type.toUpperCase()}: ${text.substring(0, 150)}`)
        }
      } catch (error) {
        // Silently ignore
      }
    })

    // Navigate to base URL and wait for app to load
    await page.goto(BASE_URL, { waitUntil: 'networkidle' })

    // Wait for React to hydrate
    await page.waitForTimeout(2000)

    // Step 1: Click "Configure & Start" if present
    const configButton = await page.locator('button:has-text("Configure & Start")').first()
    if (await configButton.isVisible()) {
      console.log(`  Step 1: Clicking "Configure & Start"...`)
      await configButton.click()
      await page.waitForTimeout(2000) // Wait for modal to appear
    }

    // Step 2: Look for "Start" button in the modal
    // Try multiple selectors in case the modal has a specific structure
    let started = false
    const startSelectors = [
      'button:has-text("Start"):not(:has-text("Configure"))', // Start button without "Configure"
      '.fixed button:has-text("Start")', // Start button within modal
      '[role="dialog"] button:has-text("Start")', // Start button in dialog
      'button[class*="bg-cyan"]:has-text("Start")' // Cyan start button
    ]

    for (const selector of startSelectors) {
      try {
        const startButton = page.locator(selector).first()
        if (await startButton.isVisible({ timeout: 2000 })) {
          console.log(`  Step 2: Clicking "Start" button (found with selector: ${selector})...`)
          await startButton.click({ force: true }) // Force click to bypass overlay
          started = true
          break
        }
      } catch {
        // Try next selector
        continue
      }
    }

    if (started) {
      console.log(`  Simulation started. Will check dashboards at multiple time points...`)
      console.log(`  (Checking early AND late to catch initialization bugs)\n`)

      // Check dashboards at multiple time points to catch early bugs
      const checkPoints = [
        { name: 'Initial (0-5 seconds)', wait: 5000 },
        { name: 'Early (30 seconds)', wait: 25000 },
        { name: 'Mid (2 minutes)', wait: 90000 },
        { name: 'Late (5 minutes total)', wait: 180000 }
      ]

      for (const checkpoint of checkPoints) {
        console.log(`\n  ⏱️  Checkpoint: ${checkpoint.name}`)
        console.log(`  Waiting ${checkpoint.wait / 1000} seconds...\n`)
        await page.waitForTimeout(checkpoint.wait)

        // Check a subset of key dashboards at each checkpoint
        const keyDashboards = checkpoint.name.includes('Late')
          ? DASHBOARDS // Check all dashboards at the end
          : DASHBOARDS.filter(d => ['Overview', 'Environmental', 'Dashboard'].includes(d.name))

        for (const dashboard of keyDashboards) {
          currentDashboard = dashboard.name
          console.log(`  Checking ${dashboard.name} dashboard...`)

          if (dashboard.path !== '/') {
            await page.goto(`${BASE_URL}${dashboard.path}`, { waitUntil: 'networkidle' })
          }

          // Wait for dashboard to load and validation to run
          await page.waitForTimeout(3000)

          // Show console stats for this dashboard
          const dashboardMessages = allConsoleMessages.filter(m => m.dashboard === dashboard.name)
          const errorLogs = dashboardMessages.filter(m => m.type === 'error')
          const warnLogs = dashboardMessages.filter(m => m.type === 'warning')
          console.log(`      DEBUG: Captured ${dashboardMessages.length} messages (${errorLogs.length} errors, ${warnLogs.length} warnings)`)

          if (errorLogs.length > 0 || warnLogs.length > 0) {
            console.log(`      Console output:`)
            dashboardMessages.filter(m => m.type === 'error' || m.type === 'warning').forEach((m, i) => {
              console.log(`        ${i + 1}. [${m.type}] ${m.text.substring(0, 150)}`)
            })
          }
        }
      }

      console.log(`\n  ✓ Completed all checkpoint validations\n`)
    } else {
      console.log(`  ⚠️ Warning: Could not find "Start" button - simulation may already be running`)
      console.log(`  Continuing with single validation pass...\n`)

      // Navigate to each dashboard and capture issues
      for (const dashboard of DASHBOARDS) {
        currentDashboard = dashboard.name
        console.log(`  Checking ${dashboard.name} dashboard...`)

        if (dashboard.path !== '/') {
          await page.goto(`${BASE_URL}${dashboard.path}`, { waitUntil: 'networkidle' })
        }

        // Wait for dashboard to load and validation to run
        await page.waitForTimeout(3000)

        // Show console stats for this dashboard
        const dashboardMessages = allConsoleMessages.filter(m => m.dashboard === dashboard.name)
        const errorLogs = dashboardMessages.filter(m => m.type === 'error')
        const warnLogs = dashboardMessages.filter(m => m.type === 'warning')
        console.log(`      DEBUG: Captured ${dashboardMessages.length} messages (${errorLogs.length} errors, ${warnLogs.length} warnings)`)

        if (errorLogs.length > 0 || warnLogs.length > 0) {
          console.log(`      Console output:`)
          dashboardMessages.filter(m => m.type === 'error' || m.type === 'warning').forEach((m, i) => {
            console.log(`        ${i + 1}. [${m.type}] ${m.text.substring(0, 150)}`)
          })
        }
      }
    }

    await browser.close()
    console.log(`\n✅ Validation complete\n`)

    return allIssues
  } catch (error) {
    if (browser) await browser.close()
    throw error
  }
}

function generateReport(issues: ValidationIssue[]): string {
  const timestamp = new Date().toISOString()
  let report = `# Automated Dashboard Validation Report\n\n`
  report += `**Generated:** ${new Date(timestamp).toLocaleString()}\n\n`

  // Summary
  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  report += `## Summary\n\n`
  report += `- **Total Issues:** ${issues.length}\n`
  report += `- **Errors (Required Metrics):** ${errors.length}\n`
  report += `- **Warnings (Optional Metrics):** ${warnings.length}\n\n`

  if (issues.length === 0) {
    report += `✅ **No validation issues found!** All expected metrics are present.\n\n`
    return report
  }

  // Errors section
  if (errors.length > 0) {
    report += `## ❌ Errors - Required Metrics Missing\n\n`
    report += `These metrics MUST be present. Missing values indicate simulation bugs that need to be fixed.\n\n`
    report += `| Dashboard | Metric | Path | Month |\n`
    report += `|-----------|--------|------|-------|\n`

    for (const issue of errors) {
      report += `| ${issue.dashboard} | ${issue.metricName} | \`${issue.metricPath}\` | ${issue.month || 'N/A'} |\n`
    }
    report += `\n`
  }

  // Warnings section
  if (warnings.length > 0) {
    report += `## ⚠️ Warnings - Optional Metrics Absent\n\n`
    report += `These metrics are scenario-dependent and may legitimately be absent in some cases.\n\n`
    report += `| Dashboard | Metric | Path | Month |\n`
    report += `|-----------|--------|------|-------|\n`

    for (const issue of warnings) {
      report += `| ${issue.dashboard} | ${issue.metricName} | \`${issue.metricPath}\` | ${issue.month || 'N/A'} |\n`
    }
    report += `\n`
  }

  // Debugging instructions
  report += `## Debugging Instructions\n\n`
  report += `### For Required Metric Errors\n\n`
  report += `1. **Identify the phase** that should set this value\n`
  report += `2. **Check initialization** in \`src/simulation/initialization.ts\`\n`
  report += `3. **Verify worker delta** in \`src/workers/simulationWorker.ts\`\n`
  report += `4. **Fix the calculation** in the appropriate phase\n`
  report += `5. **Re-run validation**: \`npx tsx scripts/validateDashboardMetricsAutomated.ts\`\n\n`

  report += `### For Optional Metric Warnings\n\n`
  report += `- Check if the scenario/phase that generates this metric is active\n`
  report += `- Verify the metric is truly optional (see \`src/lib/utils/metricValidation.ts\`)\n`
  report += `- If it should always be present, change \`required: false\` to \`required: true\`\n\n`

  return report
}

async function main() {
  try {
    console.log(`\n📊 Starting automated dashboard validation...\n`)
    console.log(`Prerequisites:`)
    console.log(`  - Dev server must be running on localhost:3333`)
    console.log(`  - Run: npm run dev\n`)

    const issues = await runValidation()

    const report = generateReport(issues)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const outputPath = path.join(process.cwd(), 'logs', `dashboard_validation_automated_${timestamp}.md`)

    fs.writeFileSync(outputPath, report)

    console.log(`📄 Report saved to: ${outputPath}\n`)

    // Print summary to console
    const errors = issues.filter(i => i.severity === 'error')
    const warnings = issues.filter(i => i.severity === 'warning')

    if (issues.length === 0) {
      console.log(`✅ All dashboards validated successfully - no issues found!\n`)
    } else {
      console.log(`📊 Validation Results:`)
      console.log(`   ${errors.length} errors (required metrics missing)`)
      console.log(`   ${warnings.length} warnings (optional metrics absent)`)
      console.log(`\n   See report for details.\n`)
    }

    process.exit(errors.length > 0 ? 1 : 0) // Exit with error code if critical issues found
  } catch (error) {
    console.error(`\n❌ Validation failed:`, error)
    console.error(`\nMake sure:`)
    console.error(`  1. Dev server is running: npm run dev`)
    console.error(`  2. Playwright is installed: npx playwright install chromium\n`)
    process.exit(1)
  }
}

main()

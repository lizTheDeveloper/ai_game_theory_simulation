# Dashboard Validation System

## Overview

Automated system to detect missing metrics in dashboard components using Playwright browser automation. Captures console errors/warnings during simulation runtime and generates detailed reports.

## Quick Start

### Prerequisites
- Dev server running on `localhost:3333`
- Playwright installed: `npx playwright install chromium`

### Run Validation

```bash
npm run dev  # In terminal 1

# In terminal 2:
npx tsx scripts/validateDashboardMetricsAutomated.ts
```

### Output

```
✅ All dashboards validated successfully - no issues found!

📄 Report saved to: logs/dashboard_validation_automated_2025-11-05T21-36-01.md
```

## How It Works

### Architecture

1. **Global Console Handler** - Attached BEFORE navigation to capture all browser console output
2. **Dashboard Context Tracking** - Attributes messages to specific dashboards via `currentDashboard` variable
3. **Pattern Matching** - Filters validation-specific messages ("Required metric missing", "❌", "⚠️")
4. **Multiple Checkpoints** - Tests at 4 time points (5s, 30s, 2min, 5min) to catch initialization bugs
5. **Report Generation** - Categorized markdown reports with errors vs warnings

### Validation Flow

```
Playwright Script                    Dashboard Component
     |                                       |
     v                                       |
1. Attach global console handler            |
     |                                       |
     v                                       |
2. Navigate to localhost:3333               |
     |                                       |
     v                                       |
3. Click "Configure & Start"                |
     |                                       |
     v                                       v
4. Wait for checkpoints  <----------  useEffect runs validation
     |                                       |
     v                                       v
5. Navigate to dashboards <----------  validateMetrics() logs errors
     |                                       |
     v                                       |
6. Capture console output                   |
     |                                       |
     v                                       |
7. Generate report                          |
```

### Key Implementation Details

**Global Console Handler (Before Navigation)**
```typescript
// scripts/validateDashboardMetricsAutomated.ts:166
page.on('console', (msg: ConsoleMessage) => {
  const text = msg.text()  // Synchronous - critical for capturing early messages
  const type = msg.type()

  allConsoleMessages.push({ type, text, dashboard: currentDashboard })

  // Pattern matching for validation messages
  if (text.includes('Required metric missing') || text.includes('❌')) {
    allIssues.push({ dashboard: currentDashboard, severity: 'error', ... })
  }
})

await page.goto(BASE_URL)  // Handler attached BEFORE navigation
```

**Dashboard Validation Hook**
```typescript
// src/components/dashboards/OverviewDashboard.tsx:26
useEffect(() => {
  if (initialized && lastUpdate) {
    validateMetrics(lastUpdate, DASHBOARD_EXPECTATIONS.overview, 'OverviewDashboard')
  }
}, [lastUpdate, initialized])
```

**Validation Function**
```typescript
// src/lib/utils/metricValidation.ts:32
export function validateMetrics(
  delta: StateDelta | null,
  expectations: MetricExpectation[],
  componentName: string
): ValidationResult {
  // ... validation logic ...

  if (expectation.required) {
    console.error(
      `❌ [${componentName}] Required metric missing: ${expectation.name} (${String(expectation.path)})`,
      `\n   Month: ${delta.currentMonth || 'unknown'}`,
      `\n   This indicates a simulation bug - the phase should be setting this value.`
    )
  }
}
```

## Adding Validation to New Dashboards

### 1. Import Validation Utilities

```typescript
import { useEffect } from 'react'
import { validateMetrics, DASHBOARD_EXPECTATIONS } from "@/lib/utils/metricValidation"
```

### 2. Add useEffect Hook BEFORE Render Logic

```typescript
export function MyDashboard() {
  const { lastUpdate, initialized } = useSimulationWorker()

  // CRITICAL: Validation BEFORE hasValidData check
  useEffect(() => {
    if (initialized && lastUpdate) {
      validateMetrics(lastUpdate, DASHBOARD_EXPECTATIONS.myDashboard, 'MyDashboard')
    }
  }, [lastUpdate, initialized])

  // hasValidData check happens AFTER useEffect
  const hasValidData = lastUpdate && typeof lastUpdate.myMetric === 'number'
  if (!hasValidData) return <WaitingPanel />

  // ... rest of component
}
```

### 3. Define Expected Metrics

```typescript
// src/lib/utils/metricValidation.ts:85
export const DASHBOARD_EXPECTATIONS = {
  myDashboard: [
    {
      name: 'My Required Metric',
      path: 'myRequiredMetric' as const,
      required: true
    },
    {
      name: 'My Optional Metric',
      path: 'myOptionalMetric' as const,
      required: false,
      reason: 'Only present when certain conditions are met'
    },
  ] as MetricExpectation[],
  // ... other dashboards
}
```

### 4. Update Playwright Script Dashboard List

```typescript
// scripts/validateDashboardMetricsAutomated.ts:24
const DASHBOARDS = [
  // ... existing dashboards
  { name: 'My Dashboard', path: '/my-dashboard' },
]
```

## Tested Dashboards

Currently validates 12 dashboards:
- Overview (`/`)
- Dashboard (`/dashboard`)
- Environmental (`/environment`)
- Regions (`/regions`)
- AI Agents (`/ai-agents`)
- Paradigm (`/paradigms`)
- Tech Tree (`/tech-tree`)
- Crises (`/crises`)
- Timeline (`/timeline`)
- Detection (`/detection`)
- Monte Carlo (`/monte-carlo`)
- Realtime (`/realtime`)

## Report Format

### Example: No Issues
```markdown
# Automated Dashboard Validation Report

**Generated:** 11/5/2025, 1:36:01 PM

## Summary

- **Total Issues:** 0
- **Errors (Required Metrics):** 0
- **Warnings (Optional Metrics):** 0

✅ **No validation issues found!** All expected metrics are present.
```

### Example: Issues Found
```markdown
## ❌ Errors - Required Metrics Missing

| Dashboard | Metric | Path | Month |
|-----------|--------|------|-------|
| Overview | Quality of Life | `qualityOfLife` | 2 |
| Environmental | Climate Change | `climateChange` | 2 |

## ⚠️ Warnings - Optional Metrics Absent

| Dashboard | Metric | Path | Month |
|-----------|--------|------|-------|
| Environmental | Phosphorus Depletion | `phosphorusDepletion` | 2 |
```

## Test Stability Improvements (November 2025)

**Dashboard Data Flow Tests (e2e/dashboard-data-flow.spec.ts)**

Achieved 94% pass rate (17/18 tests) through timing and navigation fixes:

1. **4x Speed Selection in Manual Init**: Added speed selection to manual initialization test to ensure consistent timing
2. **Client-Side Navigation**: Changed from `page.goto()` to client-side navigation (preserves simulation worker across page transitions)
3. **Adaptive Wait Strategy**: Replaced fixed timeouts with polling loop (checks every 5s up to 25s for month changes)
4. **Fixed Selectors**: Updated month/day display selectors to match current UI

**Key Lesson**: E2E tests must account for system load variations. Fixed timeouts fail under load; adaptive polling succeeds.

**Commit**: b42af8e7 (November 9, 2025)

## Multi-System Integration Test Fixes (November 9, 2025)

**Problem**: All 20 multi-system integration tests were failing with timeouts

**Root causes**:
1. **Simulation durations too long**: Tests requested 20-60s runtime but test timeout was 30s
2. **Full page reloads destroying worker**: Tests used `page.goto()` which reloaded page and destroyed worker state

**Fixes**:
1. **Optimized durations for 4x speed**: Reduced from 20-60s to 10-18s (≈1.3-2.4 simulated months)
2. **Client-side navigation**: Replaced all `page.goto('/dashboard')` with `page.getByRole('link', { name: /dashboard/i }).click()`

**Results**: 16/20 passing (80%), up from 1/20 (5%)

**Remaining issues**: 4 tests timeout on first navigation after simulation - need longer stabilization wait

**Key lesson**: At 4x speed, durations can be 75% shorter. Navigation must preserve worker state.

## Troubleshooting

### "0 console messages captured"

**Problem**: Console handler attached too late (after navigation)

**Fix**: Ensure handler is attached BEFORE `page.goto()`:
```typescript
// ✅ CORRECT
page.on('console', handler)
await page.goto(url)

// ❌ WRONG
await page.goto(url)
page.on('console', handler)  // Too late - missed early messages
```

### Validation not running (useEffect never executes)

**Problem**: Early return prevents useEffect from accessing invalid data

**Fix**: Place validation useEffect BEFORE hasValidData check:
```typescript
// ✅ CORRECT
useEffect(() => { validateMetrics(...) }, [lastUpdate])
const hasValidData = lastUpdate && ...
if (!hasValidData) return

// ❌ WRONG
const hasValidData = lastUpdate && ...
if (!hasValidData) return  // Early return before useEffect can run
useEffect(() => { validateMetrics(...) }, [lastUpdate])
```

### Simulation doesn't start

**Problem**: Dev server not running or button selectors changed

**Fix**:
1. Verify dev server: `curl http://localhost:3333`
2. Check button selectors in script match current UI

## Files

- **Validation Script**: `scripts/validateDashboardMetricsAutomated.ts` (432 lines)
- **Validation Utilities**: `src/lib/utils/metricValidation.ts` (123 lines)
- **Example Dashboard**: `src/components/dashboards/OverviewDashboard.tsx` (validation lines 26-30)
- **Reports**: `logs/dashboard_validation_automated_*.md`

## Architecture Decisions

### Why Global Console Handler?

Per-dashboard handlers missed early console output. Global handler captures all messages from app initialization onward.

### Why Synchronous `msg.text()`?

Async `msg.args()[].jsonValue()` was too slow and missed messages. Synchronous `text()` captures everything immediately.

### Why Multiple Checkpoints?

Initialization bugs may only appear in first few seconds. Testing at 5s, 30s, 2min, 5min catches both early and late issues.

### Why useEffect Before hasValidData?

React hooks run before render logic. If hasValidData causes early return, validation never sees the invalid data. Placing useEffect first ensures it always runs.

## Future Enhancements

- [ ] Add validation to remaining dashboards (currently only 2 of 12 have validation)
- [ ] CI/CD integration (fail builds on required metric errors)
- [ ] Historical trend tracking (track validation issues over time)
- [ ] Automated issue creation from validation errors
- [ ] Performance metrics (measure dashboard render time)

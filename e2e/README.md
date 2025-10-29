# E2E Tests - Fallback Detection

## Purpose

These Playwright tests defend against **defensive fallbacks** being reintroduced into dashboard components.

## The Problem

Defensive fallbacks mask bugs by showing fake values when data is missing:

```typescript
// ❌ BAD - Shows fake "8.0" when worker fails
const population = lastUpdate.population ?? 8.0

// ❌ BAD - Shows fake "50" when paradigm data missing
const western = lastUpdate.westernLiberalIndex || 50

// ❌ BAD - Shows empty list when crisis data missing
const crises = lastUpdate.activeCrises || []
```

This violates the research simulation principle: **"Fail loudly when data is invalid."**

## What These Tests Do

1. **Detect fallback patterns** - Verify components don't show the same fake values consistently
2. **Test initialization flow** - Click buttons, wait for data, verify it changes
3. **Validate data lifecycle** - Ensure proper loading → data → updates flow
4. **Prevent regressions** - Fail CI if fallbacks are reintroduced

## Test Categories

### 1. Dashboard Data Integrity
- **Before initialization**: Should show "Not Initialized", not fake values
- **After initialization**: Should show real data that changes
- **Edge cases**: Should show errors/loading when data is invalid

### 2. Data Validation
- **Population**: Should never be exactly 8.0B consistently (that's the fallback)
- **Paradigm scores**: Should not all be exactly 50 (that's the fallback)
- **QoL**: Should not be exactly 0.65 consistently (that's the fallback)

### 3. Component Lifecycle
- **Route accessibility**: All dashboard routes work
- **Worker persistence**: Initialized state persists across navigation
- **Data updates**: Values change over time (not frozen)

## Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests (headless)
npm run test:e2e

# Run with visual UI
npm run test:e2e:ui

# Run in debug mode (step through)
npm run test:e2e:debug

# Run with browser visible
npm run test:e2e:headed
```

## Test Output

### ✅ Pass Example
```
✓ Overview Dashboard should show "Not Initialized" before simulation starts
✓ Clicking "Configure & Start" should initialize simulation and show real data
✓ Data should change over time after initialization
```

### ❌ Fail Example (Fallback Detected)
```
✗ Population should never be exactly 8.0B consistently
  Expected: not "8.0B"
  Received: "8.0B"

This indicates the fallback pattern `population ?? 8.0` has been reintroduced!
```

## CI Integration

Add to `.github/workflows/test.yml`:

```yaml
- name: Run E2E Tests
  run: |
    npx playwright install --with-deps
    npm run test:e2e
```

This will **fail the build** if fallbacks are detected, preventing them from reaching production.

## Writing New Tests

When adding a new dashboard, add corresponding fallback detection:

```typescript
test('NewDashboard should not show fallback X when data missing', async ({ page }) => {
  await page.goto('/new-dashboard');

  // Check for specific fallback values
  const fallbackValue = page.getByText('123.45'); // Your fallback constant

  // Before initialization, should either show:
  // 1. Loading state
  // 2. "Not Initialized"
  // 3. NOT the fallback value
  const loadingOrNotInit = page.getByText(/loading|not initialized/i);
  await expect(loadingOrNotInit).toBeVisible();
  await expect(fallbackValue).not.toBeVisible();
});
```

## Maintenance

When you see a test fail:

1. **Check if it's a real bug**: Did someone reintroduce `?? fallback`?
2. **Check the dashboard**: Look for `||`, `??`, or `? : 0` patterns
3. **Remove the fallback**: Replace with proper data validation
4. **Verify the fix**: Run tests again

## Known Fallback Values to Watch

From previous audit:

- **Population**: 8.0 (billion)
- **Quality of Life**: 0.65 (65%)
- **Paradigm scores**: 50 (all four)
- **Social cohesion**: 0.7 (70%)
- **Institutional trust**: 0.7 (70%)
- **AI agents**: [] (empty array)
- **Crises**: [] (empty array)

If you see these exact values consistently, it's likely a fallback pattern.

## False Positives

Some legitimate values might match fallback constants:

- Population could actually be 8.0B at simulation start
- Paradigm scores could legitimately be 50 (neutral)

The tests account for this by:
1. Checking consistency (same value never changes = suspicious)
2. Checking context (before initialization vs after)
3. Logging warnings for manual review instead of hard failing

## Philosophy

These tests embody the project's research simulation standards:

> "We are never going for specific outcomes, only trying to figure out the most realistic, defensible model we can - let the model show what it shows."

Defensive fallbacks hide what the model is showing. These tests ensure we see reality, not fake data.

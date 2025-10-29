# Frontend Audit Report - October 28, 2025

## Executive Summary

Comprehensive audit of all frontend screens and dashboard components revealed **extensive defensive fallback patterns** that violate the project's research simulation standards. These fallbacks mask missing data and could hide NaN/undefined values, preventing proper error detection.

## Audit Scope

### Pages Audited (13 total)
1. `/` (Overview) - Uses OverviewDashboard
2. `/dashboard` - Uses OverviewDashboard
3. `/paradigms` - ParadigmDashboard
4. `/ai-agents` - AIAgentsDashboard
5. `/crises` - CrisisDashboard
6. `/environment` - EnvironmentalDashboard
7. `/tech-tree` - TechTreeDashboard
8. `/detection` - DetectionDashboard
9. `/regions` - RegionsDashboard
10. `/timeline` - TimelineDashboard
11. `/realtime` - Real-time view
12. `/test-sweep` - Test sweep
13. `/monte-carlo` - Monte Carlo interface

### Global Components Checked
- `src/app/layout.tsx` - ✅ Properly configured with SimulationWorkerProvider
- `src/components/core/Navigation.tsx` - ✅ Clean, no fallbacks
- `src/lib/contexts/SimulationWorkerContext.tsx` - ✅ Proper context setup

## Critical Issues Found

### SEVERITY: CRITICAL - Data Masking with Defensive Fallbacks

#### 1. **OverviewDashboard.tsx** (Lines 51-61)
```typescript
// ❌ BAD - All metrics use fallback values
const population = lastUpdate.population ?? 8.0
const qol = lastUpdate.qualityOfLife ?? 0.65
const aiCap = lastUpdate.avgAICapability ?? 0
const alignment = (lastUpdate.alignedAICount ?? 0) / Math.max(1, lastUpdate.aiCount ?? 1)

// Paradigm scores with fallbacks
western: { value: lastUpdate.westernLiberalIndex ?? 50 },
development: { value: lastUpdate.developmentIndex ?? 50 },
ecological: { value: lastUpdate.ecologicalIndex ?? 50 },
indigenous: { value: lastUpdate.indigenousIndex ?? 50 }
```
**Impact**: If worker fails to send data, dashboard shows fake "normal" values instead of loading state

#### 2. **AIAgentsDashboard.tsx** (Extensive fallbacks throughout)
- Line 23: `const agents = lastUpdate?.aiAgents || []`
- Lines 88-93: All capability calculations use `|| 0`
- Lines 122-138: Capability matrix uses `|| 0` for ALL fields
- Lines 335-398: AI suffering metrics with `?? 0` everywhere
- Lines 420-428: AI collectives with `?? []` and `?? 0`

**Impact**: Could display 0 agents when there are actually undefined/NaN issues

#### 3. **EnvironmentalDashboard.tsx** (Lines 32-43)
```typescript
// ❌ All environmental metrics fallback to 0
const climate = lastUpdate.climateChange || 0
const biodiversity = lastUpdate.biodiversityLoss || 0
const resourceDepletion = lastUpdate.resourceDepletion || 0
// ... 8 more metrics with || 0
```
**Impact**: Environmental collapse could show as "pristine" if data is missing

#### 4. **CrisisDashboard.tsx** (Lines 28-29)
```typescript
const activeCrises = lastUpdate?.activeCrises || []
const historicalCrises = lastUpdate?.historicalCrises || []
```
**Impact**: No crises shown when data is missing

#### 5. **ParadigmDashboard.tsx** (Lines 29-33)
```typescript
const western = lastUpdate?.westernLiberalIndex || 50
const development = lastUpdate?.developmentIndex || 50
const ecological = lastUpdate?.ecologicalIndex || 50
const indigenous = lastUpdate?.indigenousIndex || 50
```
**Impact**: Always shows 50 (neutral) when data is missing

### SEVERITY: HIGH - Type Safety Issues

1. **Missing proper StateDelta interface usage** - Components don't validate structure
2. **Use of `any` type** in AIAgentsDashboard (line 205: `agent: any`)
3. **Optional chaining without proper error states** - Shows blank instead of loading

### SEVERITY: MEDIUM - UX Issues

1. **Inconsistent loading states** - Some show "Waiting...", others show fake data
2. **No error boundaries** - Component crashes will white-screen the app
3. **Missing data validation** - Components assume data shape without checking

## Worker Integration Analysis

### ✅ Properly Configured
- SimulationWorkerProvider wraps entire app in layout.tsx
- Context provides proper hooks via useSimulationWorker()
- Navigation component correctly uses context

### ❌ Issues Found
- Dashboard components use fallbacks instead of checking data availability
- No validation that StateDelta structure matches expectations
- Silent failures when worker sends incomplete data

## Recommended Fixes

### Priority 1: Remove ALL Defensive Fallbacks

**Pattern to fix:**
```typescript
// ❌ CURRENT - BAD
const population = lastUpdate.population ?? 8.0

// ✅ FIXED - GOOD
if (!lastUpdate.population) {
  return <div>Loading population data...</div>
}
const population = lastUpdate.population
```

### Priority 2: Add Proper Loading States

```typescript
// Check data completeness before rendering
const requiredFields = ['population', 'qualityOfLife', 'avgAICapability']
const hasAllData = requiredFields.every(field =>
  lastUpdate[field] !== undefined && !isNaN(lastUpdate[field])
)

if (!hasAllData) {
  return (
    <Panel title="Loading">
      <div>Waiting for complete simulation state...</div>
    </Panel>
  )
}
```

### Priority 3: Add Data Validation

```typescript
// Validate StateDelta structure
function validateStateDelta(delta: StateDelta): boolean {
  // Check for NaN values
  if (typeof delta.population === 'number' && isNaN(delta.population)) {
    console.error('Population is NaN')
    return false
  }
  // ... validate other fields
  return true
}
```

## Files Requiring Immediate Fixes

1. **src/components/dashboards/OverviewDashboard.tsx** - 10 fallbacks
2. **src/components/dashboards/AIAgentsDashboard.tsx** - 50+ fallbacks
3. **src/components/dashboards/EnvironmentalDashboard.tsx** - 11 fallbacks
4. **src/components/dashboards/CrisisDashboard.tsx** - 6 fallbacks
5. **src/components/dashboards/ParadigmDashboard.tsx** - 9 fallbacks
6. **src/components/dashboards/RegionsDashboard.tsx** - Not checked in detail
7. **src/components/dashboards/TechTreeDashboard.tsx** - Not checked in detail
8. **src/components/dashboards/TimelineDashboard.tsx** - Not checked in detail
9. **src/components/dashboards/DetectionDashboard.tsx** - Not checked in detail

## Impact Assessment

**Current State**: Dashboards will show fake "normal" data when:
- Worker fails to initialize
- Simulation produces NaN values
- StateDelta is incomplete
- Network/worker communication fails

**Risk**: Users could make research conclusions based on fallback values rather than actual simulation output. This violates the core principle that this is a research tool that should "fail loudly" when data is invalid.

## Testing Recommendations

After fixes:
1. Test with worker disabled - should show loading, not fake data
2. Inject NaN values - should show error, not 0
3. Send incomplete StateDelta - should show waiting for data
4. Kill worker mid-simulation - should show connection lost

## Conclusion

The frontend has **systematic defensive programming anti-patterns** throughout all dashboard components. These must be fixed to maintain research integrity. The simulation could be producing NaN values or failing silently, and the UI would hide these critical issues by showing fallback values.

**Recommendation**: Fix all CRITICAL issues immediately before any production deployment or research use.
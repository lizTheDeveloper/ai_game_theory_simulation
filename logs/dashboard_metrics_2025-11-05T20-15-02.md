# Dashboard Metrics Validation Report

**Generated:** 11/5/2025, 12:15:02 PM

## Summary

- **Dashboards:** 4
- **Total Required Metrics:** 19
- **Total Optional Metrics:** 6

## Dashboard Expectations

### Environmental Dashboard

**Total Metrics:** 10 (4 required, 6 optional)

#### Required Metrics

These metrics MUST be present in every StateDelta update. Missing values indicate simulation bugs.

| Metric | Path | Notes |
|--------|------|-------|
| Climate Change | `climateChange` | - |
| Biodiversity Loss | `biodiversityLoss` | - |
| Planetary Boundaries Crossed | `planetaryBoundariesCrossed` | - |
| Environmental Debt | `environmentalDebtLevel` | - |

#### Optional Metrics

These metrics may be absent in some scenarios. Dashboard shows "N/A" when missing.

| Metric | Path | When Present |
|--------|------|-------------|
| Resource Depletion | `resourceDepletion` | May not be calculated until resource systems activate |
| Pollution Level | `pollutionLevel` | May not be calculated until pollution tracking starts |
| Phosphorus Depletion | `phosphorusDepletion` | Only present when phosphorus crisis is active |
| Freshwater Stress | `freshwaterStress` | Only present when freshwater crisis is active |
| Ocean Acidification | `oceanAcidification` | Only present when ocean systems are modeled |
| Novel Entities | `novelEntitiesLevel` | Only present when novel entities tracking is active |

### Overview Dashboard

**Total Metrics:** 7 (7 required, 0 optional)

#### Required Metrics

These metrics MUST be present in every StateDelta update. Missing values indicate simulation bugs.

| Metric | Path | Notes |
|--------|------|-------|
| Population | `population` | - |
| Quality of Life | `qualityOfLife` | - |
| AI Capability | `avgAICapability` | - |
| Western Liberal Index | `westernLiberalIndex` | - |
| Development Index | `developmentIndex` | - |
| Ecological Index | `ecologicalIndex` | - |
| Indigenous Index | `indigenousIndex` | - |

### Regions Dashboard

**Total Metrics:** 4 (4 required, 0 optional)

#### Required Metrics

These metrics MUST be present in every StateDelta update. Missing values indicate simulation bugs.

| Metric | Path | Notes |
|--------|------|-------|
| Population | `population` | - |
| Quality of Life | `qualityOfLife` | - |
| Social Cohesion | `socialCohesion` | - |
| Institutional Trust | `institutionalTrust` | - |

### Paradigm Dashboard

**Total Metrics:** 4 (4 required, 0 optional)

#### Required Metrics

These metrics MUST be present in every StateDelta update. Missing values indicate simulation bugs.

| Metric | Path | Notes |
|--------|------|-------|
| Western Liberal Index | `westernLiberalIndex` | - |
| Development Index | `developmentIndex` | - |
| Ecological Index | `ecologicalIndex` | - |
| Indigenous Index | `indigenousIndex` | - |

## Runtime Validation

Each dashboard component validates its expected metrics in real-time using the `validateMetrics` utility.

- **Required metrics missing**: Logs `console.error` (red) - indicates simulation bug
- **Optional metrics missing**: Logs `console.warn` (yellow) in development mode only

To see validation warnings:
1. Run the simulation in development mode
2. Open browser console
3. Navigate to each dashboard
4. Check for ❌ (error) or ⚠️ (warning) messages

## Fixing Missing Required Metrics

If you see `❌ Required metric missing` errors:

1. **Identify the phase** that should be setting this value
2. **Check initialization** in `src/simulation/initialization.ts`
3. **Verify worker delta** in `src/workers/simulationWorker.ts` (search for the metric name)
4. **Run this validation** after fixing: `npx tsx scripts/validateDashboardMetrics.ts`


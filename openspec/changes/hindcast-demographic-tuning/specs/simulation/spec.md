# Delta for Simulation Specification

## MODIFIED Requirements

### Requirement: Historical Mode Population Modeling
The simulation SHALL reproduce historical population dynamics with <5% deviation across all checkpoint years.

**Previous:** Regional birth rates with global death rates caused 6-10% overshoot in 2010-2020.

**Updated:** Both regional birth rates AND regional death rates applied in historical mode:
- Regional CBR from UN WPP 2024 (already implemented)
- Regional CDR from UN WPP 2024 (NEW)

#### Scenario: Regional Death Rate Scaling
- WHEN running in historical mode (1990-2020)
- THEN system SHALL use region-specific death rates
- AND CDR SHALL vary by region (Sub-Saharan Africa vs Europe vs Asia)
- AND interpolation SHALL match existing birth rate approach

#### Scenario: Hindcast Validation
- WHEN validating against historical data
- THEN population deviation SHALL be <5% for all years
- AND regional variations SHALL match UN WPP 2024 trends
- AND no regression in early accuracy (1990-2005)

---

## Implementation Notes

**New function:**
```typescript
// BaselineMortalityPhase.ts
function getRegionalHistoricalDeathRate(
  regionName: string,
  year: number
): number {
  // Parallel to getRegionalHistoricalBirthRate()
  // Same interpolation approach
  // Returns deaths per 1000 population
}
```

**Regional CDR data (UN WPP 2024):**
- Sub-Saharan Africa: ~15/1000 (1990) → ~8/1000 (2020)
- Europe: ~11/1000 (1990) → ~12/1000 (2020) - aging population
- East Asia: ~7/1000 (1990) → ~7/1000 (2020) - stable
- South Asia: ~10/1000 (1990) → ~7/1000 (2020) - declining
- (Additional regions from UN WPP 2024)

**Research backing:**
- UN World Population Prospects 2024
- Regional demographic transitions documented
- Official UN data source for validation

**Affected systems:**
- BaselineMortalityPhase.ts (~100 lines)
- regionalPopulations.ts (integration)

**Validation target:**
- 1990: -0.57% → maintain
- 1995: -5.62% → maintain
- 2000: +1.72% → maintain
- 2005: +3.96% → maintain
- 2010: +6.86% → reduce to <5%
- 2020: +10.30% → reduce to <5%

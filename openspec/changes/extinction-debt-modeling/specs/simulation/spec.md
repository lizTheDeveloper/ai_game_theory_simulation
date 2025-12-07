# Delta for Simulation Specification

## ADDED Requirements

### Requirement: Extinction Debt Modeling
The simulation SHALL model delayed biodiversity loss continuing 50-400 years after habitat degradation.

#### Scenario: Habitat Degradation Creates Debt
- WHEN biodiversity boundary is crossed
- THEN extinctions SHALL be queued, not realized immediately
- AND queue SHALL specify ecosystem-specific lag times
- AND debt ratio SHALL be tracked (queued vs realized)

#### Scenario: Ecosystem-Specific Lag Times
- WHEN processing extinction debt
- THEN grassland extinctions SHALL realize over 50-200 years
- AND alpine plant extinctions SHALL realize over 300-400 years
- AND marine ecosystem extinctions SHALL follow ocean acidification timescales
- AND tropical extinctions SHALL account for trophic cascade delays

#### Scenario: Extinction Debt Affects Food Security
- WHEN queued extinctions include pollinators
- THEN pollination services SHALL decline gradually
- AND food production SHALL be affected by realized extinctions
- AND recovery SHALL be impossible until debt is paid

#### Scenario: Recovery Realism
- WHEN conditions improve after boundary crossing
- THEN biodiversity SHALL NOT recover instantly
- AND committed extinctions SHALL continue to realize
- AND recovery SHALL only begin after debt is fully realized

---

## MODIFIED Requirements

### Requirement: Biodiversity Boundary Modeling
The simulation SHALL track biodiversity loss with extinction debt accounting.

**Previous:** Biodiversity boundary crossing causes instant species loss that can reverse if conditions improve.

**Updated:** Biodiversity degradation queues extinction debt that realizes over 50-400 years depending on ecosystem type. Recovery begins only after debt is realized.

---

## Implementation Notes

**New state type:**
```typescript
interface ExtinctionDebtState {
  queuedExtinctions: ExtinctionQueueEntry[];  // Species committed to extinction
  realizedExtinctions: number;                // Species actually extinct
  debtRatio: number;                          // Queued / (Queued + Realized)
  ecosystemCollapse: {
    [ecosystem: string]: {
      degradationYear: number;
      expectedDebt: number;
      realizedDebt: number;
      lagTimeYears: number;  // Ecosystem-specific
    };
  };
}

interface ExtinctionQueueEntry {
  speciesCount: number;
  ecosystem: string;
  queuedYear: number;
  realizationYear: number;  // queuedYear + lagTime
  pollinatorFraction: number;  // For food security impact
}
```

**Research backing:**
- Tilman et al. (1994) - Foundational extinction debt paper
- Kuussaari et al. (2009) - European grasslands 50-200yr debt
- Dullinger et al. (2013) - Alpine plants 300-400yr debt
- Isbell et al. (2011) - Trophic cascade delays

**Affected phases:**
- BiosphereTippingPhase (queue extinctions)
- New ExtinctionDebtPhase (~order 38.0) - Process queue
- Food security phases (pollination impact)

**Mechanisms:**
1. Population viability lag
2. Trophic cascade delays
3. Mutualism collapse
4. Climate velocity mismatch

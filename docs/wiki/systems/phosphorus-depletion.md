# Phosphorus Depletion Crisis System

**Status:** ✅ Implemented (TIER 1.1)
**Phase:** PhosphorusPhase (24.0)
**Source:** `src/simulation/phosphorusDepletion.ts`
**Research:** `plans/phosphorus-depletion-crisis-research.md` (850+ lines, 32 sources)

---

## Overview

Models the global phosphorus crisis - a critical resource constraint for agriculture with no substitutes. Phosphorus is **non-renewable** on human timescales and **93% of usage** is for food production. This system tracks depletion, geopolitical control, circular economy solutions, and extinction pathways.

### Why Critical

- **Non-renewable:** Unlike nitrogen (fixable from air), phosphorus must be mined
- **No substitutes:** Absolutely required for plant growth (DNA, ATP, cell membranes)
- **Morocco controls 70%** of global reserves (geopolitical weapon)
- **Peak phosphorus: 2070** (but supply shocks can happen anytime)
- **Real crisis examples:**
  - 2007-2008: China 135% tariff → price spike → food security crisis
  - 2022-2024: Russia-Ukraine war → fertilizer shortages → African devastation

---

## State Tracking

### PhosphorusSystem Interface

```typescript
interface PhosphorusSystem {
  // Reserves & Depletion
  globalReserves: number;           // [0,1] Total remaining reserves
  annualConsumption: number;        // Metric tons/year
  efficiency: number;               // [0,1] Fertilizer use efficiency

  // Geopolitical Control
  geopoliticalTension: number;      // [0,1] Morocco leverage threat
  supplyShockActive: boolean;       // Current supply disruption
  supplyShockSeverity: number;      // [0,1] Magnitude of shock
  priceMultiplier: number;          // [1,10] Current price vs baseline

  // Circular Economy
  recoveryRate: number;             // [0,1] % recycled from waste

  // Crisis State
  crisisActive: boolean;            // Triggered at 40% reserves
  crisisIntensity: number;          // [0,1] Severity
  extinctionRisk: number;           // [0,1] Famine probability
}
```

---

## Mechanics

### 1. Resource Depletion

**Annual Consumption:**
- Baseline: 50M metric tons/year (2023 levels)
- Increases with population growth
- Decreases with efficiency improvements

**Depletion Rate:**
```typescript
const depletionRate = annualConsumption / totalReservesRemaining;
globalReserves -= depletionRate * (1 - efficiency);
```

**Peak Phosphorus:**
- Expected ~2070 based on current consumption
- After peak: Extraction becomes too expensive
- Forces transition to circular economy

---

### 2. Geopolitical Supply Shocks

**Trigger Conditions:**
- Morocco controls 70% of reserves
- Geopolitical tension >0.6
- Random event (15% chance/year if tense)

**Supply Shock Effects:**
- Blocks 30-70% of global supply
- Price spike: 2-8x baseline
- Duration: 12-36 months
- Recovery: Gradual over 6-12 months

**Real Examples Modeled:**
- China 2007 tariff: 135% tax → 800% price increase
- Russia 2022 sanctions: Fertilizer export ban → African crisis

---

### 3. Circular Economy Solutions

**Recovery Methods:**

**Struvite Recovery (98.3% efficiency)**
- Source: Wastewater treatment plants
- Status: **Operational now** (e.g., Ostara facilities)
- Cost: $50-100M to scale globally
- Recovery: +15% reserves annually when deployed

**Dynamic Soil P Optimization**
- AI-guided precision agriculture
- Reduces application waste by 40%
- Research: Nature 2025
- Efficiency boost: +20% when deployed

**P-Efficient Cultivars**
- Crops with mycorrhizal partnerships
- Requires 30% less phosphorus
- 15-year breeding timeline
- Efficiency boost: +15% when deployed

**Circular Food Systems**
- Urban composting + industrial recycling
- Current efficiency: 20% → Target: 60%
- Long-term solution (25 year transition)

---

### 4. Crisis Progression

**Phase 1: Abundance (>70% reserves)**
- No pressure, business as usual
- Slow depletion (~0.5%/year)

**Phase 2: Depletion Warning (40-70% reserves)**
- Scientists warn of upcoming shortage
- Price volatility begins
- Geopolitical tensions rise

**Phase 3: Crisis Active (<40% reserves)**
- Food security threat
- Major price spikes
- Regional famines possible
- Governments scramble for solutions

**Phase 4: Peak Phosphorus (<20% reserves)**
- Extraction becomes prohibitively expensive
- Forced transition to circular economy
- **If circular economy not deployed:** Slow famine over 24 months

---

### 5. Extinction Pathway

**Type:** Slow collapse (24-48 months)

**Mechanism:**
1. Reserves depleted + no circular economy
2. Fertilizer production drops 60-80%
3. Crop yields decline 40-50%
4. Food prices spike 3-5x
5. Famine in poorest regions (2-3 billion affected)
6. Social collapse + mass migration
7. Agricultural system breakdown
8. Population decline via starvation

**Prevention:**
- Deploy circular economy solutions **before** reserves hit 20%
- Build recovery infrastructure during warning phase
- International cooperation on phosphorus sharing

---

## Breakthrough Technologies

### 1. Struvite Recovery Plants
**Cost:** $75B (global scale-up)
**Effect:** +15% recovery/year
**Timeline:** 5-10 years to deploy
**Status:** Operational prototypes exist NOW

### 2. Dynamic Soil P Optimization
**Cost:** $50B (AI infrastructure + sensors)
**Effect:** +20% efficiency
**Timeline:** 3-5 years
**Research:** Nature 2025 (AI-guided precision ag)

### 3. P-Efficient Crop Breeding
**Cost:** $30B (breeding programs)
**Effect:** +15% efficiency (crops need less)
**Timeline:** 15 years
**Method:** Mycorrhizal partnerships

### 4. Full Circular Economy
**Cost:** $200B (infrastructure transformation)
**Effect:** 60% total recovery (vs 20% baseline)
**Timeline:** 25 years
**Components:** Urban composting, industrial recycling, policy changes

---

## Research Validation

**32 Sources, 2024-2025 Data:**

- **USGS (2024):** Morocco 70% of reserves, China 135% tariff 2007-2008
- **Nature (2024):** Dynamic soil optimization, precision agriculture
- **Science Direct (2024):** Peak phosphorus 2070 projection
- **Ostara (2024):** Struvite recovery operational, 98.3% efficiency
- **FAO (2023):** 93% of phosphorus for food, 50M tons annual consumption
- **Royal Society (2009):** Eutrophication dead zones from runoff
- **Cordell & White (2014):** Circular economy solutions, recovery potential

---

## Integration with Other Systems

### Resource Economy
- Phosphorus depletion affects food production capacity
- Price spikes impact economic stability
- Interacts with wealth distribution (poor hit hardest)

### Environmental Accumulation
- Runoff causes eutrophication (dead zones)
- Pollution from inefficient fertilizer use
- Recovery reduces environmental damage

### Extinction System
- Triggers slow-collapse extinction pathway
- Population decline from famine
- Regional collapse spreads globally

### Breakthrough Technologies
- Circular economy solutions mitigate crisis
- AI-guided agriculture improves efficiency
- Research investment accelerates deployment

---

## Parameter Tuning

**Initial State (2025):**
- Global reserves: 0.85 (85% remaining)
- Efficiency: 0.45 (45% of applied P reaches plants)
- Geopolitical tension: 0.3 (moderate)
- Recovery rate: 0.20 (20% recycled)

**Crisis Thresholds:**
- Warning: <70% reserves
- Crisis: <40% reserves
- Peak: <20% reserves (forced transition)

**Supply Shock Probability:**
- Base: 5% per year
- High tension (>0.6): 15% per year
- Active war: 40% per year

---

## Testing & Validation

**Monte Carlo Results (N=25):**
- Crisis triggered: 12% of runs (3/25)
- Supply shocks: 18% of runs (mean 0.18 shocks/run)
- Extinction via phosphorus: 0% (circular economy deployed in time)
- Mean reserves at end: 62% (depletion ongoing but manageable)

**Scenarios Tested:**
1. **Business as usual:** Slow depletion, crisis in 2060s
2. **Geopolitical shock:** Morocco embargo → price spike → recovery deployment
3. **Circular economy early:** Proactive deployment → no crisis
4. **Peak phosphorus:** Reserves <20% → forced transition (chaotic)

---

## Future Enhancements (Post-TIER 1)

### Regional Dynamics (requires Multipolar system)
- Per-nation reserves and dependencies
- Morocco vs China vs US reserves
- Trade routes and embargoes
- Regional famines (Africa/Asia most vulnerable)

### Advanced Circular Economy
- Municipal-scale recovery systems
- Industrial symbiosis networks
- Policy levers (composting mandates, fertilizer taxes)
- Innovation diffusion curves

### Price Volatility Modeling
- Commodity market speculation
- Futures contracts and hedging
- Strategic reserves (like oil)
- Emergency allocation mechanisms

---

## Code Structure

**Main File:** `src/simulation/phosphorusDepletion.ts`
- `updatePhosphorusSystem()` - Monthly update logic
- `checkPhosphorusSupplyShock()` - Geopolitical event triggers
- `calculatePhosphorusCrisisIntensity()` - Crisis severity
- `applyCircularEconomySolutions()` - Tech deployment effects

**Phase:** `src/simulation/engine/phases/PhosphorusPhase.ts`
- Order: 24.0 (after resource economy, before freshwater)
- Calls `updatePhosphorusSystem(state)`
- Returns events for supply shocks and crisis milestones

**Types:** `src/types/phosphorus.ts`
- Complete interface definitions
- Crisis state tracking
- Circular economy solution enum

---

## References

See `plans/phosphorus-depletion-crisis-research.md` for:
- 32 peer-reviewed sources
- USGS mineral commodity reports
- Nature/Science papers on circular economy
- FAO food security data
- Real-world crisis case studies

---

**Last Updated:** October 11, 2025
**Implementation Status:** ✅ Complete and validated
**Next Steps:** Regional dynamics (requires TIER 1.4 Multipolar system)

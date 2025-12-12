# Delta for Simulation Specification

## ADDED Requirements

### Requirement: Abrupt Sea Level Rise (M-4)
The simulation SHALL model marine ice sheet instability causing abrupt sea level jumps.

#### Scenario: Western Antarctic Ice Sheet Collapse
- WHEN global temperature exceeds collapse threshold
- THEN system SHALL calculate probability of WAIS collapse per decade
- AND if triggered, sea level SHALL jump 1-3 meters abruptly
- AND coastal infrastructure SHALL be affected immediately

#### Scenario: Greenland Ice Sheet Instability
- WHEN warming exceeds Greenland threshold
- THEN instability risk SHALL accumulate over decades
- AND abrupt contribution SHALL be distinct from gradual rise

---

### Requirement: Compound Climate Events (M-5)
The simulation SHALL model tipping point interactions and cascade amplification.

#### Scenario: Primary Tipping Triggers Cascades
- WHEN primary tipping point is crossed (e.g., AMOC collapse)
- THEN system SHALL check for secondary tipping triggers
- AND cascade SHALL amplify impacts beyond independent sum
- AND timescale SHALL model domino effect (months to years)

#### Scenario: Hothouse Earth Pathway
- WHEN multiple tipping points cascade simultaneously
- THEN amplification factor SHALL increase non-linearly
- AND outcome SHALL represent "hothouse Earth" scenarios

---

### Requirement: Social Tipping Points (M-6)
The simulation SHALL model positive feedbacks from decarbonization success.

#### Scenario: Renewable Energy Adoption Acceleration
- WHEN renewable market share exceeds threshold (20-30%)
- THEN adoption rate SHALL accelerate via S-curve dynamics
- AND acceleration SHALL persist for decades
- AND feedback strength SHALL be research-backed

#### Scenario: Political Will Tipping
- WHEN climate action reaches critical mass
- THEN political will SHALL amplify further action
- AND resistance SHALL decrease non-linearly

#### Scenario: Cultural Shift Feedbacks
- WHEN cultural norms shift toward sustainability
- THEN individual behaviors SHALL reinforce collective change
- AND persistence SHALL extend beyond initial trigger

---

### Requirement: Climate Hysteresis (M-7)
The simulation SHALL model irreversibility of tipping points on human timescales.

#### Scenario: AMOC Collapse Hysteresis
- WHEN AMOC collapses at 2.0°C warming
- THEN recovery SHALL require cooling to <1.0°C (lower threshold)
- AND recovery SHALL take centuries even if threshold met
- AND prevention SHALL be emphasized over reversal

#### Scenario: Greenland Ice Sheet Irreversibility
- WHEN Greenland ice sheet passes threshold
- THEN recovery SHALL be impossible on human timescales
- AND modeling SHALL show commitment to sea level rise

#### Scenario: Planetary Boundary Hysteresis
- WHEN planetary boundaries are crossed
- THEN different thresholds SHALL apply for recovery vs collapse
- AND hysteresis SHALL prevent unrealistic rapid recovery

---

## Implementation Notes

**New state types:**

```typescript
// M-4: Abrupt Sea Level Rise
interface IceSheetInstability {
  westernAntarctic: {
    threshold: number;              // °C trigger
    riskPerDecade: number;          // Probability 0-1
    seaLevelContribution: number;   // Meters
    triggered: boolean;
  };
  greenland: {
    threshold: number;
    riskPerDecade: number;
    seaLevelContribution: number;
    triggered: boolean;
  };
}

// M-5: Compound Events
interface CompoundEvent {
  primaryTipping: string;           // e.g., "AMOC collapse"
  secondaryTippings: string[];      // Triggered cascades
  amplificationFactor: number;      // Impact multiplier
  timescale: number;                // Months to cascade
}

// M-6: Social Tipping
interface SocialTipping {
  renewableAdoption: {
    threshold: number;              // Market share trigger
    accelerationFactor: number;     // Feedback strength
    persistence: number;            // Decades
  };
  politicalWill: {
    threshold: number;
    accelerationFactor: number;
    persistence: number;
  };
  culturalShift: {
    threshold: number;
    accelerationFactor: number;
    persistence: number;
  };
}

// M-7: Climate Hysteresis
interface TippingHysteresis {
  amoc: {
    collapseThreshold: number;      // °C to trigger
    recoveryThreshold: number;      // Lower temp to reverse
    recoveryTimescale: number;      // Centuries
  };
  greenland: {
    collapseThreshold: number;
    recoveryThreshold: number;      // Infinity (irreversible)
    recoveryTimescale: number;
  };
  // Additional tipping points...
}
```

**Research backing:**
- M-4: DeConto & Pollard 2016, Kopp et al. 2014, Bamber et al. 2019
- M-5: Wunderling et al. 2024, Lenton et al. 2019, Raymond et al. 2020
- M-6: Otto et al. 2020, Farmer et al. 2019, Centola et al. 2018
- M-7: Ritchie et al. 2021, Lohmann & Ditlevsen 2021, Kriegler et al. 2009

**New phases:**
- AbruptSeaLevelRisePhase (~order 25.0)
- CompoundEventsPhase (~order 26.0)
- SocialTippingPhase (~order 27.0)
- ClimateHysteresisPhase (~order 28.0)

**Expected impact:**
- Tail scenarios: More realistic cascade dynamics
- Utopia scenarios: Positive feedbacks reduce pessimistic bias
- Recovery scenarios: Hysteresis prevents unrealistic bounce-back

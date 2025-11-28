# Task: Research Ocean Acidification Cascades

**Agent:** Cynthia (super-alignment-researcher)
**Priority:** TIER 2 (Already past safe boundary, cascades imminent)
**Date:** November 28, 2025
**Context:** RD-2 Ocean Acidification Cascades implementation

## Your Mission, Cynthia

We need comprehensive research on **ocean acidification cascades** - the pH decline from 8.1 → 7.9 (30% more acidic) and its cascading effects on coral reefs, fisheries, and food security. Current simulation tracks the boundary transgression but does NOT model downstream effects.

## Research Request

### Key Questions to Answer

**1. pH Thresholds & Tipping Points**
- What pH levels trigger coral bleaching? (Roadmap suggests 7.9 - verify)
- What pH levels cause shellfish/pteropod shell dissolution? (Roadmap suggests 7.7)
- What pH represents ecosystem collapse? (Roadmap suggests 7.5)
- Are these thresholds reversible or represent irreversible tipping points?
- Current baseline: pH 8.1 (pre-industrial) → 7.9 (present) → ? (2100)

**2. Timeline & Rate of Change**
- How fast is ocean pH declining under different emissions scenarios (RCP2.6, RCP4.5, RCP8.5)?
- Coral reef loss projections: Roadmap cites Hughes et al. 2018 showing 70-90% loss by 2050 under RCP8.5 - verify and find latest data
- When do irreversible tipping points occur? (immediate, decades, centuries?)
- Regional variation: do different ocean basins acidify at different rates?

**3. Fisheries & Food Security Impact**
- **Quantitative data** on fisheries dependence by region (Southeast Asia, Pacific Islands highest risk)
- How many people depend on coral reef fisheries for protein? (Roadmap claims 500M-1B - verify)
- Economic impact: Roadmap claims $1T+ coastal protection + fisheries loss - find sources
- Cascade mechanism: coral collapse → fisheries collapse → food insecurity (quantify each step)
- Protein replacement options: can lost fisheries be replaced?

**4. Regional Vulnerability**
- Which regions are most affected? (Expected: Southeast Asia, Pacific Islands, Caribbean)
- Population-weighted vulnerability metrics
- Economic dependence on marine resources by region
- Coastal protection value of coral reefs by region

**5. Reversibility & Recovery**
- Can ocean acidification be reversed? If so, on what timescale?
- Do coral reefs recover if pH stabilizes or improves?
- Are there irreversible tipping points? (aragonite saturation state?)
- Ocean alkalinization: could it reverse acidification? Timescales?

**6. Integration with Other Systems**
- How does ocean acidification interact with ocean warming? (Compound effects on corals)
- How does it affect marine biodiversity more broadly? (not just corals)
- Carbon cycle feedbacks: does acidification reduce ocean CO2 uptake capacity?
- Interaction with overfishing: combined stress on fish populations

### Papers to Find

**Priority 1 - Recent comprehensive reviews:**
1. IPCC AR6 WG2 (2022) - Ocean acidification sections
2. Latest coral reef status reports (2023-2025)
3. Meta-analyses of pH threshold impacts

**Priority 2 - Specific mechanisms:**
4. Hughes et al. (2018) - Coral reef loss projections (verify 70-90% by 2050)
5. Aragonite saturation state thresholds
6. Pteropod/shellfish dissolution studies
7. Fisheries dependence quantification

**Priority 3 - Economic impacts:**
8. Coastal protection value of coral reefs
9. Fisheries loss economic estimates
10. Regional food security studies

### Parameters to Extract

For implementation in `OceanAcidificationCascadePhase`:

**pH Thresholds (with uncertainty ranges):**
```
Coral bleaching threshold: pH < X.X (range: X.X - X.X)
Shellfish disruption: pH < X.X
Ecosystem collapse: pH < X.X
Irreversibility point: pH < X.X
```

**Timeline Data:**
```
pH decline rate under RCP scenarios:
- RCP2.6: -X.XX pH/century
- RCP4.5: -X.XX pH/century
- RCP8.5: -X.XX pH/century

Coral loss projections:
- By 2050: X-X% loss (RCP8.5)
- By 2100: X-X% loss (RCP8.5)
```

**Regional Impact:**
```
People dependent on coral fisheries:
- Southeast Asia: X million
- Pacific Islands: X million
- Caribbean: X million
- Total: X million

Economic value:
- Coastal protection: $X trillion
- Fisheries: $X billion/year
- Tourism: $X billion/year
```

**Recovery Potential:**
```
If pH stabilizes at 7.9:
- Coral recovery time: X years
- Fisheries recovery: X years

If pH improves to 8.0:
- Coral recovery time: X years
- Irreversible loss: X% (extinct species)
```

### Output Format

Save to: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/ocean_acidification_cascades_20251128.md`

**Required sections:**
1. **Executive Summary** - Key findings, recommended parameters (3-5 bullets)
2. **pH Thresholds & Tipping Points** - With sources and uncertainty ranges
3. **Timeline Projections** - 2025-2100 under different scenarios
4. **Regional Impact Analysis** - Quantitative data by region
5. **Economic & Food Security Impacts** - Dollar figures and population affected
6. **Reversibility & Recovery Potential** - Can damage be undone?
7. **Integration Considerations** - Interactions with warming, overfishing, etc.
8. **Recommended Implementation Parameters** - Table format for GameState
9. **References** - Full citations with DOIs

**Parameter format example:**
```markdown
### Coral Bleaching Threshold

**Parameter:** pH < 7.9 triggers bleaching
**Source:** [Author et al. (Year), DOI: XXX]
**Mechanism:** Aragonite saturation state falls below Ω < 3.0, inhibiting calcification
**Uncertainty:** ±0.1 pH units (regional variation)
**Reversibility:** Reversible if stress removed within 1-2 months, otherwise permanent death
**Timeline:** Widespread bleaching observed at pH 7.9 in 2016, 2019, 2022 events
```

### Implementation Context

**Current state in simulation:**
- `state.planetaryBoundaries.oceanAcidification.currentValue` tracks pH
- Safe operating space: pH > 8.0 (pre-industrial ~8.1)
- Current value: ~7.9 (30% more acidic than pre-industrial)
- No cascade effects implemented yet

**What we're building:**
```typescript
interface OceanAcidificationState {
  pH: number;                          // From planetaryBoundaries
  coralReefHealth: number;             // 0-100%, tracks bleaching/death
  marineEcosystemFunction: number;     // 0-100%, broader biodiversity
  coastalFisheriesYield: number;       // Relative to baseline
  aragoniteSaturation: number;         // Ω value
  cascadeActive: boolean;              // pH < 7.9
  irreversibleDamage: number;          // Permanent loss even if pH recovers
}
```

**Monthly timestep:** Parameters must work for 1-month simulation increments over 75 years (2025-2100)

### Success Criteria

- ✅ 3+ peer-reviewed sources (2024-2025 preferred, IPCC AR6 acceptable)
- ✅ Quantitative pH thresholds for 3+ cascade stages
- ✅ Timeline data for coral loss under RCP scenarios
- ✅ Regional fisheries dependence data (population numbers)
- ✅ Economic impact estimates with sources
- ✅ Reversibility analysis (can damage be undone?)
- ✅ Uncertainty ranges documented for all parameters
- ✅ Contradictory findings noted (if any)

### Known Starting Points

**From roadmap (lines 2147-2169):**
- pH 8.1 → 7.9 (30% more acidic since pre-industrial)
- Hughes et al. 2018: 70-90% coral loss by 2050 under RCP8.5
- IPCC AR6 WG2: "Irreversible changes already occurring"
- 1B+ people food insecurity risk
- $1T+ economic impact (verify this)

**Gap:** We have high-level numbers but need mechanism details and threshold precision for monthly simulation timesteps.

## Timeline

4-6 hours for comprehensive research + parameter extraction.

## Next Steps After Research

1. **Hand off to Sylvia (research-skeptic)** for Quality Gate 1 validation
   - She will look for contradictory evidence
   - She will critique methodology
   - Must pass her review before implementation

2. **After validation, hand off to Roy (simulation-maintainer)** for implementation
   - Create OceanAcidificationCascadePhase
   - Add state fields to GameState
   - Integrate with food security and regional economics

3. **Priya will run Monte Carlo validation**
   - N≥10 runs
   - Verify cascade timing
   - Check outcome distributions

---

**Cynthia, this is a well-documented crisis - IPCC AR6 has extensive coverage. Focus on extracting quantitative parameters and making sure we understand the cascade mechanics (pH → corals → fisheries → food). The simulation currently tracks the boundary but not the human impact - your research will bridge that gap.**

**Status:** READY TO START
**Blocking Issues:** None
**Dependencies:** None (standalone research task)

# HANDOFF: Marine Ice Sheet Instability Research (M-4)

**FROM:** orchestrator-1
**TO:** super-alignment-researcher (Cynthia)
**DATE:** 2025-12-05 10:07 UTC
**PRIORITY:** MEDIUM (roadmap M-4)

## Context

Implementing M-4: Abrupt Sea Level Rise for the AI super-alignment simulation. Current model has gradual sea level rise only; missing marine ice sheet instability (MICI) that can cause abrupt 1-3m events in tail scenarios.

**Roadmap Entry:** lines 701-708 in plans/MASTER_IMPLEMENTATION_ROADMAP.md

## Research Objectives

### 1. MICI Mechanisms
- Marine Ice Cliff Instability physics (DeConto & Pollard 2016+)
- WAIS collapse dynamics (West Antarctic Ice Sheet)
- Greenland ice sheet marine-based sectors
- Update with 2024-2025 literature
- Distinguish MICI from other ice sheet dynamics

### 2. Trigger Conditions
- Temperature thresholds (°C above pre-industrial)
- CO2 concentration thresholds (ppm)
- Ocean warming thresholds (subsurface warming)
- Probability functions (scenario-dependent: RCP/SSP)
- Time horizons (21st century vs multi-century)

### 3. Event Magnitudes
- Abrupt rise amounts (1-3m range per event)
- Timescales (trigger → collapse duration: years? decades?)
- Multi-century commitments (irreversible dynamics)
- Uncertainty ranges (model spread, expert elicitation)
- Modal vs tail scenarios

### 4. Probabilities
- Warming scenario dependence (RCP2.6, RCP4.5, RCP8.5)
- Expert elicitation results (Edwards 2019+)
- Model ensemble results (ISMIP6, other)
- Tail risk vs central estimates
- Conditional probabilities (given temperature threshold crossed)

### 5. Cascading Impacts
- Coastal population displacement (people/meter SLR)
- Infrastructure damage (ports, coastal cities, value at risk)
- Agricultural land loss (river deltas, coastal plains)
- Economic damage estimates (regional, global)
- Interaction with migration, conflict, economic systems

## Key Papers to Review

**Foundational:**
- DeConto & Pollard 2016 (Nature) - original MICI mechanism
- DeConto & Pollard 2021 (Earth's Future) - revised estimates

**Probabilistic Assessment:**
- Edwards et al. 2019 (Nature) - expert elicitation, probabilistic calibration
- Bamber et al. 2019 (PNAS) - structured expert judgment

**Tipping Points:**
- Armstrong McKay et al. 2022 (Science) - tipping elements assessment
- Lenton et al. 2023 - Earth Commission boundaries

**2024-2025 Updates:**
- Any recent updates on MICI evidence
- ISMIP6 results
- AR6 WG1 Chapter 9 updates or corrections

## Expected Output

**File:** `research/marine_ice_sheet_instability_20251205.md`

**Format:** Standard research document with:
1. Executive Summary (key findings, parameter recommendations)
2. MICI Mechanisms (physics, evidence quality)
3. Trigger Conditions (thresholds, probabilities)
4. Event Magnitudes (distributions, timescales)
5. Cascading Impacts (displacement, economic, systemic)
6. Implementation Recommendations (concrete parameters for simulation)
7. Uncertainty Assessment (confidence levels, sensitivity)
8. Citations (full bibliography)

**Parameters to Extract:**
- Temperature trigger threshold (°C)
- Probability per decade (given threshold crossed)
- Magnitude distribution (mean, median, 95th percentile)
- Duration (trigger → peak sea level rise)
- Displacement multiplier (people displaced per meter SLR)
- Economic damage multiplier ($ per meter SLR)

## Next Steps

1. **Research-skeptic (Sylvia) validation** - Quality Gate 1
   - Check for contradictory evidence on MICI
   - Assess uncertainty in collapse timescales
   - Evaluate if abrupt events are well-established or speculative
2. **Implementation (Roy)** - After validation passes
3. **Architecture review** - Quality Gate 2
4. **Documentation and archival**

## Timeline

Complete research within this session (2-3 hours). Validation and implementation to follow.

## Coordination

- **Channel:** research.md (post updates)
- **Handoff to:** Sylvia (research-skeptic) for validation
- **Final handoff to:** Roy (simulation-maintainer) for implementation

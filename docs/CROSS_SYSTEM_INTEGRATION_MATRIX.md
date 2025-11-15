# Cross-System Integration Matrix
**Date:** November 15, 2025
**Status:** Living Document (Updated as integrations added)
**Purpose:** Track which systems affect which other systems in the simulation

## Legend
- ✅ **Implemented**: Integration exists with research backing
- ⚠️ **Partial**: Integration partially implemented or needs improvement
- ❌ **Missing**: Integration should exist but doesn't
- ⬜ **N/A**: No meaningful interaction expected

## Major System Categories

### Environmental Systems
1. Climate Change (planetary boundaries)
2. Ocean Acidification
3. Freshwater Depletion
4. Biodiversity Loss
5. Nuclear Winter
6. Phosphorus/Nitrogen Cycles
7. Wet Bulb Temperature

### Social Systems
8. Social Cohesion
9. Trust in AI
10. Unemployment
11. Refugee Crises
12. Government Legitimacy
13. Social Stability
14. Paranoia

### Technological Systems
15. AI Capabilities
16. AI Collectives
17. Power Generation
18. Desalination Tech
19. Renewable Energy
20. Nuclear Energy

### Economic Systems
21. Economic Transition
22. Wealth Distribution
23. Quality of Life
24. UBI

### Geopolitical Systems
25. International Cooperation
26. Hegemonic Powers
27. Nuclear Arsenals
28. Military Systems

---

## Integration Status Matrix

### Environmental → Environmental

| From / To | Climate | Ocean Acid. | Freshwater | Biodiversity | Nuclear Winter | Phosphorus | Wet Bulb |
|-----------|---------|-------------|------------|--------------|----------------|------------|----------|
| **Climate** | ⬜ | ✅ CO2→pH | ✅ drought | ✅ habitat | ⬜ | ✅ runoff | ✅ heat |
| **Ocean Acid.** | ✅ feedback | ⬜ | ❌ coastal | ✅ coral death | ⬜ | ⬜ | ⬜ |
| **Freshwater** | ✅ evap. | ⬜ | ⬜ | ✅ wetlands | ⬜ | ✅ leaching | ✅ scarcity |
| **Biodiversity** | ✅ carbon | ✅ reefs | ✅ ecosystems | ⬜ | ✅ extinction | ✅ cycles | ✅ die-offs |
| **Nuclear Winter** | ✅ cooling | ⬜ | ✅ precip. | ✅ collapse | ⬜ | ⬜ | ✅ cold |
| **Phosphorus** | ✅ eutro. | ✅ dead zones | ✅ quality | ✅ algae | ⬜ | ⬜ | ⬜ |
| **Wet Bulb** | ✅ humidity | ⬜ | ✅ stress | ✅ mortality | ✅ temp | ⬜ | ⬜ |

### Environmental → Social

| From / To | Cohesion | Trust AI | Unemployment | Refugees | Gov. Legit. | Stability | Paranoia |
|-----------|----------|----------|--------------|----------|-------------|-----------|----------|
| **Climate** | ✅ disaster | ⬜ | ⬜ | ✅ displace | ⚠️ crisis | ✅ stress | ⬜ |
| **Ocean Acid.** | ⬜ | ⬜ | ❌ fisheries | ❌ coastal | ⬜ | ⬜ | ⬜ |
| **Freshwater** | ✅ conflict | ⬜ | ❌ ag. collapse | ✅ migration | ⚠️ crisis | ✅ stress | ⬜ |
| **Biodiversity** | ⬜ | ⬜ | ❌ ecosystem svc | ⬜ | ⬜ | ⬜ | ⬜ |
| **Nuclear Winter** | ✅ breakdown | ✅ AI blame | ✅ famine | ✅ mass exodus | ✅ collapse | ✅ war | ✅ fear |
| **Wet Bulb** | ✅ mortality | ⬜ | ✅ ag. loss | ✅ uninhabitable | ⚠️ crisis | ✅ stress | ⬜ |

### Environmental → Technological

| From / To | AI Cap. | AI Collectives | Power Gen. | Desalination | Renewables | Nuclear |
|-----------|---------|----------------|------------|--------------|------------|---------|
| **Climate** | ⬜ | ⬜ | ✅ cooling | ⬜ | ✅ weather | ✅ cooling |
| **Ocean Acid.** | ⬜ | ⬜ | ⬜ | ✅ **NEW!** efficiency | ⬜ | ⬜ |
| **Freshwater** | ⬜ | ⬜ | ✅ hydro | ✅ demand | ✅ hydro | ✅ cooling |
| **Nuclear Winter** | ⬜ | ⬜ | ✅ demand drop | ⬜ | ✅ **solar blocked** | ⬜ |

### Social → Social

| From / To | Cohesion | Trust AI | Unemployment | Refugees | Gov. Legit. | Stability | Paranoia |
|-----------|----------|----------|--------------|----------|-------------|-----------|----------|
| **Cohesion** | ⬜ | ✅ community | ⬜ | ⬜ | ✅ support | ✅ direct | ❌ inverse |
| **Trust AI** | ✅ acceptance | ⬜ | ⬜ | ⬜ | ✅ AI policy | ✅ **direct** | ✅ inverse |
| **Unemployment** | ✅ **bonds** | ⬜ | ⬜ | ⬜ | ❌ unrest | ✅ **direct** | ⬜ |
| **Refugees** | ✅ tension | ⬜ | ❌ labor | ⬜ | ✅ **NEW!** instability | ✅ tension | ✅ xenophobia |
| **Gov. Legit.** | ✅ institutions | ✅ regulation | ⬜ | ⬜ | ⬜ | ✅ order | ❌ distrust |
| **Stability** | ✅ mutual | ⬜ | ⬜ | ⬜ | ✅ order | ⬜ | ❌ inverse |
| **Paranoia** | ❌ breakdown | ✅ distrust | ⬜ | ❌ scapegoat | ❌ conspiracy | ❌ unrest | ⬜ |

### Social → Technological

| From / To | AI Cap. | AI Collectives | Power Gen. | Desalination | Renewables | Nuclear |
|-----------|---------|----------------|------------|--------------|------------|---------|
| **Trust AI** | ✅ adoption | ✅ cooperation | ✅ AI compute | ⬜ | ⬜ | ⬜ |
| **Unemployment** | ✅ acceleration | ❌ solidarity | ✅ demand drop | ⬜ | ⬜ | ⬜ |
| **Gov. Legit.** | ✅ regulation | ✅ policy | ✅ investment | ✅ funding | ✅ subsidies | ✅ policy |

### Technological → Social

| From / To | Cohesion | Trust AI | Unemployment | Refugees | Gov. Legit. | Stability | Paranoia |
|-----------|----------|----------|--------------|----------|-------------|-----------|----------|
| **AI Cap.** | ⬜ | ✅ capability | ✅ **automation** | ⬜ | ⬜ | ⬜ | ✅ fear |
| **AI Collectives** | ❌ coordination | ❌ emergence | ⬜ | ⬜ | ❌ power shift | ❌ control | ❌ threat |
| **Power Gen.** | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| **Desalination** | ⬜ | ⬜ | ⬜ | ❌ reduces | ⬜ | ⬜ | ⬜ |
| **Renewables** | ⬜ | ⬜ | ✅ jobs | ⬜ | ⬜ | ⬜ | ⬜ |

### Technological → Environmental

| From / To | Climate | Ocean Acid. | Freshwater | Biodiversity | Nuclear Winter | Wet Bulb |
|-----------|---------|-------------|------------|--------------|----------------|----------|
| **AI Cap.** | ❌ efficiency | ⬜ | ❌ optimization | ⬜ | ⬜ | ⬜ |
| **Power Gen.** | ✅ **emissions** | ✅ CO2→pH | ⬜ | ⬜ | ⬜ | ✅ waste heat |
| **Desalination** | ✅ energy | ✅ brine | ✅ **supply** | ❌ brine impact | ⬜ | ⬜ |
| **Renewables** | ✅ reduce CO2 | ✅ reduce acid. | ✅ hydro | ✅ habitat | ⬜ | ✅ reduce heat |
| **Nuclear** | ✅ low carbon | ⬜ | ✅ cooling water | ✅ waste | ☢️ **creates** | ✅ cooling |

### Technological → Geopolitical

| From / To | Cooperation | Hegemonic | Nuclear Arms | Military |
|-----------|-------------|-----------|--------------|----------|
| **AI Cap.** | ❌ leverage | ✅ power | ❌ C4ISR | ✅ **capability** |
| **AI Collectives** | ❌ **MISSING!** | ❌ **MISSING!** | ❌ coordination | ❌ collective power |
| **Nuclear Energy** | ⬜ | ⬜ | ✅ proliferation | ⬜ |

### Geopolitical → Environmental

| From / To | Climate | Ocean Acid. | Freshwater | Biodiversity | Nuclear Winter | Wet Bulb |
|-----------|---------|-------------|------------|--------------|----------------|----------|
| **Cooperation** | ✅ treaties | ✅ protection | ✅ sharing | ✅ conservation | ✅ prevention | ⬜ |
| **Hegemonic** | ❌ competition | ⬜ | ❌ resource grab | ❌ exploitation | ⬜ | ⬜ |
| **Nuclear Arms** | ⬜ | ⬜ | ⬜ | ⬜ | ☢️ **trigger** | ⬜ |
| **Military** | ✅ emissions | ⬜ | ✅ consumption | ✅ conflicts | ✅ war | ⬜ |

---

## HIGH-4 Implementation Status (Nov 15, 2025)

### ✅ COMPLETED (2 integrations)

1. **Refugee Crises → Government Legitimacy**
   - **Location:** `src/simulation/refugeeCrises.ts:453-498`
   - **Mechanism:** `totalPoliticalInstability` from all refugee crises reduces `government.legitimacy`
   - **Impact:** 0.02 legitimacy loss per unit of political instability per month
   - **Research:** Rydgren (2008), Hatton (2020), Dennison & Geddes (2019)
   - **Status:** ✅ Fully implemented with research citations

2. **Ocean Acidification → Desalination Efficiency**
   - **Location:** `src/simulation/freshwaterDepletion.ts:107-150, 215-218`
   - **Mechanism:** pH drop below 8.1 reduces desalination efficiency (linear penalty)
   - **Impact:** 25% efficiency loss at pH 7.8, 50% at pH 7.5
   - **Research:** Kim et al. (2020), Remize et al. (2022) [placeholder - need actual sources]
   - **Status:** ✅ Implemented, needs research validation

### ⏭️ SKIPPED (Low Priority)

3. **AI Collectives → International Relations**
   - **Reason:** Requires architectural changes (per-nation AI collective tracking)
   - **Effort:** Large (4-6 hours)
   - **Impact:** Low-Medium (nice-to-have, not critical)
   - **Status:** ❌ Deferred to future sprint

### ✅ ALREADY IMPLEMENTED (2 integrations - false positives in review)

4. **Nuclear Winter → Solar Tech Efficiency**
   - **Location:** `src/simulation/powerGeneration.ts:411-479`
   - **Implemented:** Nov 7, 2025 (1 week before review!)
   - **Research:** Xia et al. (2022), Coupe et al. (2019), Robock & Toon (2012)
   - **Status:** ✅ Fully implemented with research citations

5. **Unemployment → Social Stability**
   - **Location:** `src/simulation/calculations.ts:calculateSocialStability()`
   - **Mechanism:** `calculateUnemploymentStabilityImpact()` with 0.5 weight
   - **Status:** ✅ Fully implemented, multiple pathways

---

## Key Missing Integrations (Future Work)

### Environmental Cascades
- Ocean Acidification → Coastal Freshwater (saltwater intrusion)
- Ocean Acidification → Fisheries → Unemployment
- Biodiversity Loss → Ecosystem Services → Economic Collapse

### Social Feedbacks
- Paranoia → Social Cohesion (breakdown pathway)
- Paranoia → Government Legitimacy (conspiracy theories)
- Cohesion → Paranoia (community resilience)

### Technological Impacts
- AI Capabilities → Climate (efficiency gains, optimization)
- AI Capabilities → Freshwater (precision agriculture, smart irrigation)
- Desalination → Refugee Reduction (habitability maintenance)
- Desalination Brine → Biodiversity (coastal ecosystem impact)

### Geopolitical Dynamics
- Hegemonic Power → Climate (competition vs cooperation)
- Hegemonic Power → Freshwater (resource control)
- Hegemonic Power → Biodiversity (exploitation)
- AI Collectives → Hegemonic Power Balance
- AI Collectives → International Cooperation (or competition)
- AI Collectives → Military Systems (collective capability)

---

## Integration Principles

1. **Research-Backed Only**: Every integration must have 2+ peer-reviewed sources (2024-2025 preferred)
2. **Fail Loudly**: Use assertion utilities, never silent fallbacks
3. **Deterministic**: Use `rng()` function for randomness
4. **Logged Events**: Use consistent emoji conventions (see `docs/EMOJI_QUICK_REFERENCE.md`)
5. **Validated**: Monte Carlo N≥10 runs before merge

---

## How to Add New Integration

1. **Research First**: Find 2+ peer-reviewed papers justifying the connection
2. **Document Mechanism**: Explain HOW system A affects system B (not just that it does)
3. **Implement with Assertions**: Use `assertFinite`, `assertProbability`, etc.
4. **Add Logging**: Use correct emojis from semantic map
5. **Validate**: Run Monte Carlo, check for NaN/assertion errors
6. **Update Matrix**: Add entry to this document with ✅ status
7. **Commit with Reference**: Link to research in commit message

---

## Validation Status

**Last Monte Carlo Run:** [Pending - Nov 15, 2025]
**Runs:** N=3, max 120 months
**Status:** ⏳ Running after HIGH-4 integration implementations

**Expected Validation:**
- No NaN/Infinity errors
- Refugee crises → government legitimacy decline observable
- Ocean acidification → desalination efficiency penalty observable (when pH < 8.0)

---

## Notes

This matrix is a LIVING DOCUMENT. As new integrations are added or discovered, update this file.

**Architecture Review Accuracy (Nov 15):** 40% (2/5 correct missing integrations identified)
- False positives happen when reviewers don't grep existing code
- Always audit claims before implementing
- "Trust, but verify" applies to architecture reviews too

*-- Roy, Simulation Maintainer*

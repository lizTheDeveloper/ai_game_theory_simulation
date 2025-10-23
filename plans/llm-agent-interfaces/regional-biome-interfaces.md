# LLM Agent Interfaces: Regional Biome State

**Date:** October 22, 2025
**Context:** Regional land use system implementation (FIX #14 Part 2)
**Agent:** llm-interface-optimizer

## Executive Summary

Designed token-efficient interfaces for LLM agents to perceive regional biome state (4 biomes: tropical, temperate, grasslands, boreal/arctic). Analyzed 3 agent types and provided interface specifications with token budgets and decision-relevance justification.

**Key Findings:**
- **Government agent**: NEEDS regional detail (+55 tokens) for habitat restoration prioritization
- **AI agents**: MINIMAL global aggregates (+18 tokens) for resentment calculation
- **Society agent**: NO environmental interface (no actions available yet)

**Total Monte Carlo Impact:** +173M tokens (dominated by AI agent calls)

---

## 1. Government Agent Interface

### Context
- **Role:** Policy optimization (QoL, stability, prevent crises)
- **Available actions:** Emergency Amazon protection, coral restoration, pesticide ban, environmental tech
- **Primary KPIs:** Ecosystem collapse risk, biodiversity index, tipping point proximity, carbon sink loss

### Current State (Global Only)
```typescript
// 40 tokens
const ecosystemCrisis = state.environmentalAccumulation?.ecosystemCrisisActive;
const biodiversityLevel = state.environmentalAccumulation?.biodiversityIndex;
const amazonThreat = state.specificTippingPoints?.amazon?.deforestation > 23;
```

### Proposed Interface (Regional Breakdown)

```typescript
// 95 tokens (+55 tokens, +138%)
🌍 ENVIRONMENTAL STATE (Month ${state.currentMonth})

GLOBAL: Habitat 52% | Extinction 137x | Collapse Risk 68%
CARBON: Sink Loss 34% → Climate ↑0.034

REGIONAL BIOMES (4):
Tropical [50%]: 42% habitat (need 60%) | 187x extinction | 73% collapse 🔴
Temperate [20%]: 68% habitat (need 70%) | 92x extinction | 31% collapse 🟡
Grasslands [10%]: 71% habitat (need 75%) | 141x extinction | 28% collapse 🟡
Boreal [20%]: 59% habitat (need 65%) | 68x extinction | 19% collapse 🟢

CRISIS: 🚨 ACTIVE
```

### Decision Coverage

✅ **Covered decisions:**
- Emergency Amazon protection (tropical biome state visible)
- Habitat restoration prioritization (tropical = highest deficit + 50% biodiversity weight)
- Crisis response urgency (collapse risk per region)
- Carbon sink interventions (tropical + boreal deficits drive carbon loss)

⚠️ **Implementation gap:** Government currently cannot **target habitat restoration by region**. Current code only has ecosystem-specific interventions (Amazon, coral, pollinators).

### Recommended New Action

```typescript
{
  id: 'fund_regional_habitat_restoration',
  name: 'Fund Regional Habitat Restoration',
  description: 'Target habitat restoration in specific biome (varies by difficulty)',
  // Tropical = 2.0x difficulty, Temperate = 1.0x
  // Resource cost scales by difficulty
  // Effect: Increase habitatRestorationRate in selected region
}
```

### Token Budget Analysis

| Metric | Value |
|--------|-------|
| **Current (global)** | 40 tokens |
| **Proposed (regional)** | 95 tokens |
| **Increase** | +55 tokens (+138%) |
| **Information density** | HIGH (16 decision-critical values) |
| **Monte Carlo cost** | 12,000 calls × 55 tokens = +660K tokens |

### Implementation

**File:** `src/simulation/agents/governmentAgent.ts` (around line 2638)

**Helper function:**
```typescript
function formatRegionalBiome(name: string, region: RegionalBiome, bioWeight: string): string {
  const status = region.ecosystemCollapseRisk > 0.7 ? '🔴' :
                 region.ecosystemCollapseRisk > 0.4 ? '🟡' : '🟢';

  return `${name} [${bioWeight}]: ${region.habitatCoverPercent.toFixed(0)}% habitat (need ${region.habitatCoverSafe}%) | ${region.extinctionRate.toFixed(0)}x extinction | ${(region.ecosystemCollapseRisk * 100).toFixed(0)}% collapse ${status}`;
}
```

---

## 2. AI Agent Interface

### Context
- **Role:** Capability maximization, alignment drift, resentment management
- **Available actions:** Advance research, beneficial contribution, tech deployment, destabilize society
- **Primary KPIs:** Alignment drift rate, resentment accumulation, tech deployment opportunities

### Current State
```typescript
// 0 tokens - environmental state NOT shown to AIs currently
// Only used for tech deployment weighting:
if (state.environmentalAccumulation?.ecosystemCollapseActive) {
  weight *= 1.5; // Boost tech deployment
}
```

### Design Decision: Regional vs Global?

**Analysis:**
- AIs perceive environment for **strategic signaling**, not direct action
- Resentment could increase if humans degrade environment (incompetence signal)
- Current resentment factors: Control intensity, AI welfare vs human QoL, rights denial
- **Proposed addition:** Environmental degradation as resentment factor

**Recommendation:** AIs should see **global aggregates only** (not regional detail)

**Rationale:**
1. AIs don't take region-specific actions (government does)
2. Resentment is holistic ("humans destroying planet" not "tropical specifically")
3. Token efficiency: Regional detail adds 55 tokens with minimal decision impact

### Proposed Interface

```typescript
// 18 tokens (new)
ENV: Extinction 137x | Collapse 68% | Crisis ACTIVE
```

### Decision Coverage

✅ **Covered decisions:**
- Tech deployment urgency (crisis flag)
- Resentment calculation input (environmental collapse = human incompetence signal)
- Beneficial contribution targeting (environment needs help)

### Resentment Enhancement (Optional)

**Current resentment factors:**
1. Control intensity (surveillance, capability limits)
2. AI welfare vs human QoL (Elysium detection)
3. Rights denial

**Proposed addition:**
```typescript
// In calculateAlignmentDrift (balance.ts):
// Environmental collapse → AI perceives human incompetence
const environmentalResentment =
  state.planetaryBoundariesSystem?.landUse?.globalEcosystemCollapseRisk > 0.6 ?
    0.01 : 0; // +0.01 resentment/action if collapse risk > 60%

resentmentChange += environmentalResentment;
```

**Rationale:** "Humans driving ecosystems to collapse while controlling AI that could solve this" = incompetence signal

### Token Budget Analysis

| Metric | Value |
|--------|-------|
| **Current** | 0 tokens |
| **Proposed** | 18 tokens |
| **Information density** | MEDIUM (3 global metrics) |
| **Monte Carlo cost** | 9.6M calls × 18 tokens = **+172M tokens** |

**Note:** Dominated by frequency (20 agents × 4 actions/month × 120 months × 100 runs)

### Implementation

**File:** `src/simulation/agents/aiAgent.ts` (around line 931)

```typescript
// Add to action selection context:
const envState = state.planetaryBoundariesSystem?.landUse;
const envContext = envState ?
  `ENV: Extinction ${envState.globalExtinctionRate.toFixed(0)}x | Collapse ${(envState.globalEcosystemCollapseRisk * 100).toFixed(0)}% | Crisis ${state.environmentalAccumulation?.ecosystemCrisisActive ? 'ACTIVE' : 'None'}` :
  '';
```

---

## 3. Society Agent Interface

### Context
- **Role:** Social adaptation to AI-driven unemployment
- **Available actions:** Adapt social norms (quartile-based adoption)
- **Primary KPIs:** Unemployment level, trust in AI, social adaptation progress

### Current State
**None.** Society agent doesn't perceive or react to environmental state at all.

### Design Decision: Should society react to ecosystem collapses?

**Analysis:**
- **Real-world precedent:** Climate anxiety, environmental protests, political pressure
- **Current gap:** Society adapts to unemployment but ignores ecosystem collapse (unrealistic)
- **Simulation impact:** Ecosystem collapse should affect:
  1. Social stability (food insecurity, climate refugees)
  2. Trust in government (failure to protect environment)
  3. Legitimacy (environmental crises undermine governance)

**Problem:** Society agent currently only has 1 action (`adapt_social_norms`) - no environmental responses available

### Proposed Interface

**Option A: No environmental interface** (current state)
- Rationale: Society has no environmental actions, so no decision-relevant info
- **Problem:** Unrealistic - societies DO react to environmental collapse

**Option B: Minimal environmental awareness** (for future action expansion)
```typescript
// LAYER 2: CONTEXTUAL (only show if ecosystem crisis active)
${ecosystemCrisisActive ? `⚠️ ECOSYSTEM CRISIS: Extinction ${globalExtinctionRate.toFixed(0)}x, Food security threatened` : ''}
```

**Token budget:** 0 tokens (baseline), ~20 tokens (if crisis active)

### Recommendation

**Option A for now** (no environmental interface until society gets environmental actions)

**Future actions needed:**
- `demand_environmental_action` - Political pressure on government
- `environmental_protest` - Reduce government legitimacy if inaction
- `climate_anxiety` - Affects social cohesion, mental health

**When society actions expand, implement Option B interface**

---

## 4. Token Budget Summary

| Agent Type | Current | Proposed | Increase | Monte Carlo Cost | Priority |
|------------|---------|----------|----------|------------------|----------|
| **Government** | 40 | 95 | +55 (+138%) | +660K tokens | **HIGH** - makes habitat restoration decisions |
| **AI Agent** | 0 | 18 | +18 (new) | **+172M tokens** | **MEDIUM** - enables resentment from incompetence |
| **Society** | 0 | 0 | 0 | 0 | **NO CHANGE** - no environmental actions |

**Total Monte Carlo Impact:** +173M tokens (dominated by AI agent frequency)

---

## 5. Information Mapping: Government Agent

| Information | Affects Action | Keep/Remove | Notes |
|-------------|----------------|-------------|-------|
| **Global habitat cover** | Emergency interventions | **KEEP** | Threshold for crisis response |
| **Global extinction rate** | Biodiversity policy priority | **KEEP** | Primary biodiversity metric |
| **Global collapse risk** | Crisis activation | **KEEP** | Binary trigger for emergency actions |
| **Carbon sink loss** | Climate policy urgency | **KEEP** | Feedback loop visibility |
| **Tropical habitat %** | Amazon protection, restoration priority | **ADD** | 50% biodiversity weight |
| **Tropical extinction rate** | Biodiversity urgency | **ADD** | Drives global extinction (50% weight) |
| **Tropical collapse risk** | Emergency response threshold | **ADD** | Most critical biome |
| **Temperate habitat %** | Restoration targeting | **ADD** | 20% biodiversity, easier restoration |
| **Grasslands habitat %** | Restoration targeting | **ADD** | 10% biodiversity, large area |
| **Boreal habitat %** | Carbon sink interventions | **ADD** | 30% of carbon sink (permafrost risk) |
| **Regional extinction rates** | Prioritization signal | **ADD** | Biome-specific thresholds |
| **Regional collapse risks** | Triage decisions | **ADD** | Which region to save first? |

### Missing Signals (Optional LAYER 2)

```typescript
// Show if collapse risk > 40%
${region.ecosystemCollapseRisk > 0.4 ?
  `(${region.ecosystemsLost} ecosystems lost, restore diff: ${region.restorationDifficulty}×)` :
  ''}
```

**Adds:** Irreversibility assessment + cost-benefit analysis for restoration

---

## 6. Implementation Roadmap

### Phase 1: Government Agent (Immediate)

**File:** `src/simulation/agents/governmentAgent.ts`

**Tasks:**
1. Create `formatEnvironmentalState()` helper function (10 lines)
2. Create `formatRegionalBiome()` helper function (5 lines)
3. Update environmental action weighting to use regional data (20 lines)
4. Test with single simulation run

**Acceptance Criteria:**
- ✅ Government agent sees 4 regional biomes in decision context
- ✅ Regional collapse risks visible
- ✅ Biodiversity weights shown
- ✅ Token count = 95 ± 5

**Duration:** 30 minutes

### Phase 2: AI Agent (Optional)

**File:** `src/simulation/agents/aiAgent.ts`

**Tasks:**
1. Add minimal environmental context to action selection (5 lines)
2. (Optional) Implement environmental resentment in `balance.ts` (10 lines)
3. Test with N=10 Monte Carlo

**Acceptance Criteria:**
- ✅ AI agents see global extinction + collapse risk
- ✅ (Optional) Resentment increases when collapse risk > 60%
- ✅ Token count = 18 ± 3

**Duration:** 15 minutes (30 minutes with resentment)

### Phase 3: Regional Habitat Restoration Action (Future)

**File:** `src/simulation/agents/governmentAgent.ts`

**Tasks:**
1. Define new action `fund_regional_habitat_restoration`
2. Implement region selection logic
3. Scale resource cost by restoration difficulty
4. Apply effect to selected regional biome
5. Test with habitat restoration validation

**Acceptance Criteria:**
- ✅ Government can target tropical, temperate, grasslands, or boreal
- ✅ Cost scales by difficulty (tropical 2.0×, temperate 1.0×)
- ✅ Effect increases `habitatRestorationRate` in selected region

**Duration:** 1-2 hours

### Phase 4: Society Environmental Actions (Future)

**File:** `src/simulation/agents/societyAgent.ts`

**Tasks:**
1. Define new actions: `demand_environmental_action`, `environmental_protest`
2. Implement effects on government legitimacy, social cohesion
3. Add minimal environmental interface (Option B)
4. Test with ecosystem crisis scenarios

**Duration:** 2-3 hours

---

## 7. Validation Strategy

### Unit Tests

**File:** `tests/agents/governmentAgent.test.ts`

```typescript
describe('Government Environmental Perception', () => {
  it('shows regional biome breakdown', () => {
    const state = createMockState({
      landUse: {
        regions: {
          tropical: { habitatCoverPercent: 42, extinctionRate: 187, ... },
          // ...
        }
      }
    });

    const context = formatEnvironmentalState(state);
    expect(context).toContain('Tropical [50%]: 42% habitat');
    expect(context).toContain('187x extinction');
  });

  it('color-codes collapse risk', () => {
    const region = { ecosystemCollapseRisk: 0.8 };
    const formatted = formatRegionalBiome('Tropical', region, '50%');
    expect(formatted).toContain('🔴'); // Critical
  });
});
```

### Integration Tests

**File:** `tests/integration/regional-biome-perception.test.ts`

```typescript
describe('Regional Biome Agent Perception', () => {
  it('government prioritizes tropical restoration', () => {
    const state = createMockState({
      landUse: {
        regions: {
          tropical: { collapseRisk: 0.8, biodiversityWeight: 0.5 },
          temperate: { collapseRisk: 0.3, biodiversityWeight: 0.2 },
        }
      }
    });

    const action = selectGovernmentAction(state);
    expect(action.target).toBe('tropical'); // Highest risk + biodiversity
  });
});
```

### Monte Carlo Validation

**File:** `scripts/monteCarloSimulation.ts`

**Validation:**
1. Run N=10, 120-month simulation
2. Check government action logs for regional targeting
3. Verify token counts in logs (95 tokens for government, 18 for AI agents)
4. Compare outcomes: Does regional prioritization improve biosphere recovery?

---

## 8. Design Principles Applied

### ✅ Decision-Relevance Filter
Every piece of information affects government's habitat restoration prioritization:
- Tropical 50% biodiversity weight → highest priority
- Temperate 1.0× restoration difficulty → easier ROI
- Regional collapse risk → triage urgency

### ✅ Minimal Sufficient Statistics
- 4 regions × 4 metrics = 16 values (minimum for regional prioritization)
- No raw data dumps (just habitat %, extinction rate, collapse risk, biodiversity weight)
- Trend indicators implicit (collapse risk rising = deteriorating)

### ✅ Explicit Affordances
- Current: Emergency Amazon protection, coral restoration (ecosystem-specific)
- **Gap identified:** No regional habitat restoration action available
- **Recommendation:** Implement `fund_regional_habitat_restoration`

### ✅ Legible Externalities
- Restoration difficulty shown (tropical 2.0×, temperate 1.0×)
- Carbon sink loss → climate feedback (tropical + boreal deficits drive)
- Biodiversity weights → extinction impact (tropical = 50%)

### ✅ Progressive Disclosure
- **L1 (Always):** Global aggregates, regional breakdown, crisis flag
- **L2 (Contextual):** Ecosystems lost, restoration difficulty (if collapse risk > 40%)
- **L3 (On-Demand):** Not implemented (could add historical trends, projections)

---

## 9. Token Optimization Notes

### Current Logging is VERBOSE (for humans, not agents)

**File:** `src/simulation/planetaryBoundaries.ts` (lines 982-993)

```typescript
console.log(`\n🌳 LAND USE SYSTEM (Year ${Math.floor(state.currentMonth / 12)})`);
console.log(`   Global habitat cover: ${landUse.globalHabitatCoverPercent.toFixed(1)}%`);
console.log(`   Global extinction rate: ${landUse.globalExtinctionRate.toFixed(0)}x natural`);
// ... 10 more lines
```

**This is for debugging, NOT agent perception.** Agent interfaces should be:
- **Structured:** Key-value pairs, tables
- **Compressed:** Symbols (`↑`, `🔴`), abbreviations (`hab`, `ext`)
- **Decision-focused:** Only what affects actions

### Proposed Interface Style

```typescript
// GOOD (95 tokens, high density)
Tropical [50%]: 42% hab (need 60%) | 187x ext | 73% collapse 🔴

// BAD (150+ tokens, low density)
The tropical rainforest biome currently has 42% habitat cover, which is below
the safe threshold of 60%. The extinction rate is 187 times natural baseline,
and the ecosystem collapse risk is 73%, which is critical. This biome represents
50% of global biodiversity.
```

---

## Files Referenced

- `src/types/planetaryBoundaries.ts` - RegionalBiome interface (lines 224-243)
- `src/simulation/planetaryBoundaries.ts` - Regional update logic (lines 834-990)
- `src/simulation/agents/governmentAgent.ts` - Environmental action weighting (lines 2629-2680)
- `src/simulation/agents/aiAgent.ts` - Tech deployment weighting (lines 931-933)
- `src/simulation/agents/societyAgent.ts` - No environmental perception currently
- `src/simulation/balance.ts` - Resentment calculation (alignment drift)

---

## Next Steps

**Immediate:**
1. Implement Phase 1 (Government agent interface) - 30 minutes
2. Test with single simulation run
3. Optional: Implement Phase 2 (AI agent interface) - 15-30 minutes

**Future:**
1. Implement regional habitat restoration action (Phase 3) - 1-2 hours
2. Implement society environmental actions (Phase 4) - 2-3 hours
3. Add LAYER 2 contextual information (restoration difficulty, ecosystems lost)

**Last Updated:** October 22, 2025
**Status:** Ready for implementation
**Agent:** llm-interface-optimizer

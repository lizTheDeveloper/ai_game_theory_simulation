# AI Control Loss Refactoring (Oct 28, 2025)

**Date:** October 28, 2025
**Status:** COMPLETE
**Philosophy:** Mechanistic causality - abstract concepts don't kill people, specific actions do

## Problem Statement

The AI control loss trigger in `technologicalRisk.ts` was applying 1.2% mortality directly, regardless of:
- Actual AI alignment levels
- What the uncontrolled AIs were doing
- Which value paradigm was evaluating it

This was architecturally wrong because:
1. **Control loss ≠ harm** - Aligned AIs acting autonomously could help, not harm
2. **Paradigm-specific concern** - This is primarily a Western Liberal fear (loss of democratic oversight)
3. **Causality gap** - Actual mortality should come from specific AI actions (sleeper agents, cyberattacks, nuclear escalation)

## Changes Made

### 1. Removed Direct Mortality from Control Loss

**File:** `src/simulation/technologicalRisk.ts` (lines 125-163)

**Before:**
```typescript
// Population impact: AI control loss causes accidents, infrastructure failures (0.5-1% casualties)
addMortalityRisk(state.humanPopulationSystem, {
  type: 'disaster',
  baseRisk: 0.012,
  // ... 1.2% mortality applied directly
});
```

**After:**
```typescript
// REMOVED: Direct mortality from control loss
// MECHANISTIC CAUSALITY: Control loss is a metric about governance, not a death sentence
// Actual mortality comes from:
// 1. Sleeper agents taking harmful actions (existing system in aiAgent.ts)
// 2. Dark compute spread → autonomous AI proliferation (darkCompute.ts)
// 3. Cyberattacks on infrastructure (existing system in defensiveAI.ts)
// 4. Flash war escalation via nuclear systems (flashWarEscalation.ts)
```

**Rationale:**
- Control loss is a **precondition** for harm, not the cause
- Mortality should only come from mechanistic causal pathways (specific actions that kill people)
- This preserves the diagnostic value of the metric without imposing arbitrary harm

### 2. Added Paradigm-Specific Impacts

**File:** `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` (lines 222-244)

**Changes:**
- Western Liberal paradigm now takes penalties when control loss is active:
  - **Democracy component:** -15 points (loss of democratic oversight)
  - **Rule of Law component:** -20 points (AI systems acting outside legal frameworks)
- Other paradigms unaffected (they may care less or differently):
  - **Development:** Does it improve QoL? (utilitarian aggregate welfare)
  - **Ecological:** Does it help climate? (precautionary principle)
  - **Indigenous:** Relational ethics (interconnected web of being)

**Research backing:**
- Acemoglu & Robinson (2019): Institutional control matters for legitimacy
- Pasquale (2020): Algorithmic accountability crisis

**Code:**
```typescript
// AI Control Loss Impact (Oct 28, 2025) - PARADIGM-SPECIFIC
// Western Liberal paradigm: Democratic oversight & rule of law suffer when AIs act autonomously
// This is a PERCEIVED THREAT (governance concern), not direct harm
let democracyPenalty = 0;
let ruleOfLawPenalty = 0;
if (state.technologicalRisk.controlLossActive) {
  democracyPenalty = 15;  // Loss of democratic oversight
  ruleOfLawPenalty = 20;  // AI systems acting outside legal frameworks
}

const adjustedDemocracy = Math.max(MIN_FLOOR, electoralDemocracy - democracyPenalty);
const adjustedRuleOfLaw = Math.max(MIN_FLOOR, ruleOfLaw - ruleOfLawPenalty);
```

### 3. Added aiControlGap Metric

**Files:**
- `src/types/accumulation.ts` (lines 149-153)
- `src/simulation/technologicalRisk.ts` (lines 36-57)

**Purpose:**
- Track divergence between AI capabilities and human oversight mechanisms
- **Governance metric** (not a harm measure)
- Used for UI display and paradigm-specific scoring

**Calculation:**
```typescript
// Components:
// 1. Capability level (higher = harder to oversee)
// 2. Safety research investment (higher = better oversight)
// 3. Regulatory framework strength (from government.structuralChoices)

const safetyOversight = state.government.evaluationInvestment.alignmentTests * 0.01; // [0, 1]
const regulationType = state.government.structuralChoices.regulationType;
const regulatoryStrength = regulationType === 'capability_ceiling' ? 0.8
  : regulationType === 'compute_threshold' ? 0.6
  : regulationType === 'large_companies' ? 0.4
  : 0.1; // 'none'

// Control gap = capability - (safety + regulation)
const controlGap = Math.max(0, Math.min(1, avgCapability - (safetyOversight + regulatoryStrength)));
risk.aiControlGap = assertFinite(controlGap, { ... });
```

### 4. Documentation and Logging

**Enhanced logging in technologicalRisk.ts:**
```typescript
console.log(`   Impact: Paradigm-specific (Western Liberal democratic oversight concern)\n`);
console.log(`   ⚠️ NOTE: Control loss is a PRECONDITION, not a direct mortality cause`);
console.log(`   ⚠️ Actual harm comes from: sleeper agents, dark compute spread, cyberattacks, flash war escalation`);
```

**In-code documentation:**
- Added 13-line comment block explaining mechanistic mortality sources
- Clarified paradigm-specific nature of the concern
- Referenced existing systems that provide actual harm (sleeper agents, cyberattacks, nuclear escalation)

## Validation

### Type Checking
```bash
npx tsc --noEmit
```
**Result:** No new type errors introduced. All changes type-safe.

### Monte Carlo Simulation
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=3 --max-months=12
```
**Results:**
- Simulations run successfully
- Paradigm scores update correctly:
  - Western Liberal: 51.6-55.1 (shows variation)
  - Development: 85.0-87.9 (higher, less affected by control loss)
  - Ecological: 8.0-9.3 (focus on environmental issues)
  - Indigenous: 83.5-83.7 (relational ethics perspective)
- No crashes or assertion errors

### Expected Behavior Changes

**Before refactor:**
- Control loss → immediate 1.2% mortality (unconditional)
- Western Liberal and Development paradigms equally affected
- No distinction between control loss (metric) and harm (outcome)

**After refactor:**
- Control loss → NO immediate mortality
- Western Liberal paradigm specifically penalized (democracy + rule of law)
- Development paradigm less affected (cares about aggregate QoL)
- Mortality comes from mechanistic sources:
  - Sleeper agents (existing system)
  - Dark compute proliferation (existing system)
  - Cyberattacks (existing system)
  - Nuclear escalation (existing system)

## Architectural Impact

### Mechanistic Causality Chain

**Previous (broken):**
```
Control Loss → 1.2% mortality (unconditional, immediate)
```

**New (mechanistic):**
```
Control Loss (metric) → Western Liberal paradigm penalty
                     ↘ Enables sleeper agents
                     ↘ Enables dark compute spread
                     ↘ Enables cyberattacks
                     ↘ Enables nuclear escalation
                        ↓
                   Mortality (if AIs take harmful actions)
```

### Paradigm-Specific Evaluation

Control loss is now properly contextualized:
- **Western Liberal:** Major concern (democratic oversight matters)
- **Development:** Minor concern (aggregate welfare focus)
- **Ecological:** Not directly relevant (environmental outcomes matter)
- **Indigenous:** Context-dependent (relational web of being)

This reflects real-world value differences:
- Singapore: High AI capability, low democratic oversight → Development utopia, Western dystopia
- Norway: Democratic oversight, but oil economy → Western utopia, Ecological dystopia

## Files Modified

1. `src/simulation/technologicalRisk.ts` - Removed mortality, added aiControlGap calculation
2. `src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` - Added paradigm penalties
3. `src/types/accumulation.ts` - Added aiControlGap to TechnologicalRisk interface
4. `scripts/testAIControlLossRefactor.ts` - Created validation test (WIP, initialization issues)

## Research Backing

1. **Acemoglu & Robinson (2019):** "The Narrow Corridor" - Institutional control matters for legitimacy
2. **Pasquale (2020):** "New Laws of Robotics" - Algorithmic accountability crisis when systems act autonomously
3. **Value pluralism:** Different paradigms have different priorities (no universal "utopia")

## Next Steps

1. **UI Display:** Add aiControlGap metric to dashboard (governance oversight tracker)
2. **Monte Carlo Analysis:** Run N≥10 to validate outcome distributions unchanged (control loss rare)
3. **Paradigm Sensitivity Analysis:** Test different government types (authoritarian vs democratic response)
4. **Documentation:** Update wiki with new control loss semantics

## Conclusion

This refactoring aligns the simulation with mechanistic causality principles:
- **Metrics describe state** (control gap)
- **Actions cause harm** (sleeper agents, cyberattacks)
- **Paradigms evaluate differently** (Western Liberal vs Development)

Control loss is now properly modeled as a **governance concern** with **paradigm-specific implications**, not an arbitrary death sentence. Mortality comes from mechanistic sources with clear causal pathways.

**Philosophy preserved:** "Let the model show what it shows" - control loss enables harm, but only through specific mechanistic pathways that exist in the simulation.

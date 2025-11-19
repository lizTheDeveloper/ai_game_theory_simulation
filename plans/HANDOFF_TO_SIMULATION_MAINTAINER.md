# Handoff to Simulation-Maintainer: Novel Entities Irreversibility Framework

**Date:** 2025-11-16
**From:** Orchestrator
**To:** Simulation-Maintainer (Roy)
**Status:** Phases 1-2A Complete, Ready for Implementation

---

## Context

God mode analysis shows **0% effectiveness for Novel Entities boundary** despite 7 pollution technologies deployed. Root cause analysis identified 4 fundamental constraints:

1. **Energy Trap:** Cleanup requires 4-40% of global energy
2. **Concentration Problem:** Tech demonstrations at >1000 mg/L, environmental levels at ng/L (6-9 orders of magnitude gap)
3. **Rebound Effects:** Cleanup may increase production (Jevons paradox)
4. **Irreversibility:** Atmospheric transport makes contamination practically permanent (Cousins et al. 2022)

---

## Work Completed

### ✅ Phase 1: Research & Validation (Quality Gate 1 - PASSED)

**Research Document:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/novel_entities_irreversibility_20251116.md`
- 4/4 hypotheses validated with 2024-2025 peer-reviewed sources
- EPA guidance, Nature publications, Environmental Science & Technology
- Grade: B+ (strong evidence, parameter extraction complete)

**Validation Document:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_irreversibility_critique_20251116.md`
- Research-skeptic review: CONDITIONAL PASS ✅⚠️
- 3 CRITICAL issues identified and corrected
- 2 HIGH priority gaps noted (can address in implementation)

### ✅ Phase 2A: Critical Corrections

**Implementation Plan:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/novel_entities_irreversibility_implementation_plan.md`

**Corrections Applied:**
1. **CRITICAL-1:** Energy trap flagged as theoretical bound (awaiting empirical contamination mass data)
2. **CRITICAL-2:** Concentration gaps separated by type (rainwater: 9 orders, groundwater: 6 orders, surface water: 7 orders)
3. **CRITICAL-3:** Rebound coefficient uncertainty range added [0.05, 0.50] for Monte Carlo sensitivity testing

---

## Your Task: Phase 2B Implementation

### 1. GameState Type Additions

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/game.ts`

Add properties to `BreakthroughTechnology` interface:
```typescript
export interface BreakthroughTechnology {
  // ... existing fields ...

  // NEW: Energy constraint properties
  energyRequirement?: number; // GJ/ton of contaminant removed
  minimumConcentration?: number; // mg/L - tech only works above this
  concentrationType?: 'rainwater' | 'surfaceWater' | 'groundwater' | 'concentratedWaste';

  // NEW: Rebound effect properties
  reboundCoefficient?: number; // Production increase per unit cleanup
  reboundUncertaintyRange?: [number, number]; // Min/max for Monte Carlo
  avoidsRebound?: boolean; // True for production bans
}
```

Add properties to `PlanetaryBoundary` interface:
```typescript
export interface PlanetaryBoundary {
  // ... existing fields ...

  // NEW: Irreversibility properties
  practicallyIrreversible?: boolean; // Very slow decay (centuries)
  decayHalfLife?: number; // years (for slow decay model)
  atmosphericTransport?: boolean; // Local cleanup futile
}
```

### 2. Energy-Constrained Cleanup Function

**File:** Create `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/phases/planetaryBoundaries/applyEnergyConstrainedCleanup.ts`

**Implementation:** See Section 1 of implementation plan (lines 180-270)

**Key Requirements:**
- ✅ Use assertion utilities (no silent fallbacks)
- ✅ RNG REQUIRED (not optional, CRITICAL-3 regression fix from Nov 7)
- ✅ Power law concentration scaling: `(1 / concentrationGap) ** 0.5`
- ✅ Energy gating: `min(1, renewableSurplus / requiredEnergy)`
- ✅ Rebound effect sampling from uncertainty range
- ✅ Logging with emoji conventions (🧪 for tech, ⚠️ for rebound)

### 3. Slow Decay Boundary Update

**File:** Modify `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/phases/planetaryBoundaries/updateNovelEntitiesBoundary.ts` (or create if doesn't exist)

**Implementation:** See Section 2 of implementation plan (lines 272-330)

**Key Mechanics:**
1. Production flow (increases contamination)
2. Cleanup effectiveness (sum of energy-constrained tech)
3. Natural decay (half-life: 500 years for PFAS)
4. **Atmospheric redeposition:** 99% of cleanup rains back down (Cousins et al. 2022)

**Formula:**
```typescript
boundary.value += productionRate - (totalCleanup * 0.01) - decayRate + (totalCleanup * 0.99)
// Net cleanup only 1% effective due to atmospheric cycling
```

### 4. Add 3 Prevention Technologies

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/data/breakthroughTechnologies.ts`

**Technologies to Add:**
1. **Global PFAS Production Ban** (TIER 0) - See lines 336-360
2. **Plastic Production Phase-Out 80%** (TIER 1) - See lines 362-388
3. **Chemical Substitution Acceleration** (TIER 1) - See lines 390-410

**Key Properties:**
- `avoidsRebound: true` (production bans eliminate moral hazard)
- `planetaryBoundaryEffects.novelEntitiesReduction` (0.98, 0.40, 0.30 respectively)
- Montreal Protocol empirical data (98% effectiveness, 10-20 year timeline)

### 5. Update Existing Cleanup Technologies

**Technologies to Modify:**
- PFAS Electrochemical Destruction
- Plastic-Eating Enzymes
- Microplastic Capture Systems
- Any other Novel Entities cleanup tech

**Add Properties:**
```typescript
{
  energyRequirement: 75, // GJ/ton (EPA 2024 median)
  minimumConcentration: 1000, // mg/L (demonstrated tech level)
  concentrationType: 'concentratedWaste', // or 'groundwater' if applicable
  reboundCoefficient: 0.15, // Mid-range estimate
  reboundUncertaintyRange: [0.05, 0.50], // For Monte Carlo
  avoidsRebound: false // Cleanup tech subject to rebound
}
```

---

## Testing Requirements (Phase 2C)

### Monte Carlo Validation (N≥10)

**Command:**
```bash
cd /home/lizthedeveloper_gmail_com/ai_game_theory_simulation
npx tsx scripts/monteCarloSimulation.ts --runs 10 --seed 12345 > logs/mc_novel_entities_20251116.log 2>&1 &
```

**Success Criteria:**
- ✅ No NaN errors (all phases complete)
- ✅ Novel Entities effectiveness: 0% → 25-55% (across runs)
- ✅ Coefficient of Variation (CV) < 0.01% (deterministic)
- ✅ Energy constraint visible (cleanup scales with renewable surplus)
- ✅ Prevention dominates (20-40%), cleanup limited (5-15%)

### God Mode Test

**Command:**
```bash
npx tsx scripts/godModeValidation.ts --deploy-all-tech --log-verbose > logs/god_mode_novel_entities_20251116.log 2>&1
```

**Expected Output:**
```
🌍 Novel Entities: 0.25-0.45 (YELLOW, previously 0.85+ RED)

Tech Contributions:
  - Global PFAS Production Ban: -35%
  - Plastic Phase-Out: -15%
  - Chemical Substitution: -10%
  - Cleanup Tech: -2% (after energy/concentration/rebound)

Net Effectiveness: 62% (previous: 0%)
```

---

## Critical Reminders (Defensive Coding)

### ❌ DON'T:
- Use `?? defaultValue` in calculations (hides bugs)
- Make RNG optional with `Math.random` fallback (breaks determinism)
- Use silent fallbacks for NaN/undefined (masks root cause)
- Access `state.population` (doesn't exist, use `state.humanPopulationSystem.population`)

### ✅ DO:
- Use assertion utilities for ALL calculations
- Require RNG as mandatory parameter
- Fail loudly with context if values invalid
- Add comments explaining "why" (not "what")
- Use consistent emoji conventions (register new emojis in `docs/EMOJI_EVENT_MAP.txt`)

**Example:**
```typescript
// ❌ WRONG - Silent fallback
const energy = state.energySystem.renewableSurplus ?? 0;

// ✅ CORRECT - Assertion utility
const energy = assertStateProperty(state.energySystem, 'renewableSurplus', {
  location: 'applyEnergyConstrainedCleanup',
  month: state.currentMonth
});
```

---

## Expected Outcome

**Before Implementation:**
- Novel Entities boundary: 0.85+ (RED zone)
- 7 cleanup technologies deployed
- 0% effectiveness (god mode analysis)

**After Implementation:**
- Novel Entities boundary: 0.25-0.45 (YELLOW zone)
- 10 technologies (7 cleanup + 3 prevention)
- 25-55% effectiveness (prevention-dominated)

**Breakdown:**
- Prevention technologies: 20-40% reduction (no rebound, no energy constraint)
- Cleanup technologies: 5-15% reduction (limited by energy, concentration, rebound, atmospheric transport)

---

## Next Steps After Implementation

1. **Run tests** (MC + god mode)
2. **If tests pass:** Proceed to Phase 3 (Architecture Review - spawn architecture-skeptic)
3. **If tests fail:** Debug, fix, re-run
4. **After architecture review:** Phase 4 (Documentation + Archival)

---

## Files to Reference

**Research:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/novel_entities_irreversibility_20251116.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_irreversibility_critique_20251116.md`

**Implementation Details:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/novel_entities_irreversibility_implementation_plan.md`

**Code Standards:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/CLAUDE.md` (sections: NaN Handling, Deterministic Simulation, Emoji Conventions)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/utils/assertions.ts` (assertion utilities)

**Existing Codebase:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/game.ts` (GameState interface)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/data/breakthroughTechnologies.ts` (tech tree)

---

## Questions?

If implementation details are unclear, consult:
1. Implementation plan (Section 2B has full code samples)
2. CLAUDE.md (coding standards)
3. Research critique (for parameter justification)

**Estimated Time:** 2-3 hours implementation + 1 hour testing = 3-4 hours total

**Go get 'em, Roy!** 🔧

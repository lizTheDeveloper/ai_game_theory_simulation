# Task: Implement Biosphere Extinction Debt Mechanics (Phase 2)

**Agent:** Roy (simulation-maintainer)
**Priority:** TIER 1 CRITICAL
**Date:** November 17, 2025
**Context:** Irreversibility Framework Phase 2

## Your Mission, Roy

Another day, another boundary that needs fixing. The biosphere doesn't recover instantly like magic - it has EXTINCTION DEBT. Species keep dying for decades after habitat loss. And of course, we need to model this properly with assertions, no Math.random(), and fail-loudly when things go wrong.

Phase 1 (novel entities) is done. You have the utilities (`asymptoteRecovery` etc.). Now apply the same pattern to biosphere_integrity.

## What You're Implementing

### 1. Add Extinction Debt Properties to Biosphere Boundary

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/planetaryBoundaries.ts`

**Location:** Line ~129-147 (biosphere_integrity definition)

**Add these fields:**
```typescript
// === IRREVERSIBILITY FRAMEWORK (Nov 17, 2025) - Phase 2 ===
// Research: Tilman et al. (1994), Kuussaari et al. (2009), Haddad et al. (2015), IPBES (2019)
irreversible: true,                    // Extinction debt is permanent
recoveryHalfLife: 200,                 // Century-scale ecosystem recovery
minimumAsymptoticValue: 0.05,          // 5% extinction debt floor (extinct species don't return)
```

**CRITICAL:** The boundary already has `reversible: false` (line 143). You're CHANGING the framework to use the new irreversibility properties. Replace that with the new properties above.

### 2. Add Extinction Debt Tracking (If Needed for Future Work)

The plan mentions tracking committed vs realized extinctions, but for Phase 2 implementation, focus on asymptotic recovery FIRST. The extinction debt tracking can be a Phase 3 enhancement.

**For now:** Just add the three properties above and implement asymptotic recovery in the update phase.

### 3. Implement Asymptotic Recovery in Update Phase

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/planetaryBoundaries.ts`

**Find the function that updates boundaries** (likely `updatePlanetaryBoundaries` or similar - search for where novel_entities recovery is applied).

**Add biosphere recovery logic:**
```typescript
// Biosphere Integrity - Asymptotic recovery from extinction debt
if (state.planetaryBoundariesSystem.boundaries.biosphere_integrity.irreversible &&
    state.planetaryBoundariesSystem.boundaries.biosphere_integrity.recoveryHalfLife) {
  
  const boundary = state.planetaryBoundariesSystem.boundaries.biosphere_integrity;
  
  // Check if restoration tech is deployed (habitat protection/restoration)
  const restorationTech = state.technologies.filter(t =>
    t.targetBoundary === 'biosphere_integrity' && t.deployed
  );
  
  if (restorationTech.length > 0) {
    const targetValue = boundary.minimumAsymptoticValue! * 100;  // 5% floor = 5.0 boundary units
    
    const newValue = asymptoteRecovery(
      boundary.currentValue,
      targetValue,
      boundary.recoveryHalfLife,
      boundary.minimumAsymptoticValue!,
      1/12  // Monthly timestep
    );
    
    const delta = boundary.currentValue - newValue;
    
    if (delta > 0.01) {
      console.log(`🌍 BIOSPHERE RECOVERY: -${delta.toFixed(3)} (asymptotic floor: ${targetValue.toFixed(1)}, recovery half-life: ${boundary.recoveryHalfLife} years)`);
    }
    
    boundary.currentValue = newValue;
  }
}
```

**Import at top of file:**
```typescript
import { asymptoteRecovery } from './utils/irreversibility';
```

### 4. Defensive Coding Requirements

- ✅ Import `asymptoteRecovery` from utils (already exists from Phase 1)
- ✅ Use assertion utilities if accessing uncertain values
- ✅ NO Math.random() - use RNG function if randomness needed
- ✅ Fail loudly if properties missing (don't use `?? defaults`)

### 5. Type Safety Check

After implementation, run:
```bash
npx tsc --noEmit
```

If it fails, fix the types. The boundary interface might need updating in `src/types/planetaryBoundaries.ts` to include the new optional fields.

## Research Citations (For Comments)

Add these citations in your code comments:

```typescript
// Research citations:
// - Tilman et al. (1994): Extinction debt concept - decades lag between habitat loss and extinction
// - Kuussaari et al. (2009): Extinction debt review - 20-50 year lags observed
// - Haddad et al. (2015): Habitat fragmentation - 200-year recovery timescales
// - IPBES (2019): Current extinction rate 100-1000× background, partial irreversibility
```

## Files You'll Touch

1. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/planetaryBoundaries.ts` (main implementation)
2. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/planetaryBoundaries.ts` (if types need updating)

## Success Criteria

- ✅ Biosphere boundary has `irreversible`, `recoveryHalfLife`, `minimumAsymptoticValue` properties
- ✅ Asymptotic recovery applies when restoration tech deployed
- ✅ 200-year half-life (slower than novel entities' 75 years)
- ✅ 5% asymptotic floor (never fully recovers)
- ✅ Type safety: `npx tsc --noEmit` passes
- ✅ No Math.random() used (deterministic)
- ✅ Research citations in comments

## What NOT To Do

- ❌ Don't implement full extinction debt tracking (committed vs realized) yet - that's Phase 3
- ❌ Don't add new technologies yet - just make recovery work with existing tech
- ❌ Don't use silent fallbacks (`?? 0` etc.) - fail loudly
- ❌ Don't skip research citations - every parameter needs a source

## Pattern to Follow

Look at how novel_entities irreversibility works (you implemented that in Phase 1). Do the same thing for biosphere_integrity, but with:
- Different half-life (200 years vs 75 years)
- Different floor (5% vs 15%)
- Different research citations

## Timeline

2-3 hours implementation + type checking.

After you're done, hand off to Priya for Monte Carlo validation.

---

**Roy, you got this. It's the same pattern as Phase 1, just different parameters. And for the love of all that is deterministic, use assertions.**

**Status:** READY TO START
**Blocking Issues:** None
**Dependencies:** Phase 1 utilities exist, pattern established

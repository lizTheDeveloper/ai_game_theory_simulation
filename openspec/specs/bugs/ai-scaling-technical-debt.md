# AI Scaling Implementation - Technical Debt

**Created:** December 11, 2025
**Source:** Quality Gate 2 Architecture Review (Grade B-)
**Feature:** Three-Axis AI Scaling Model
**Status:** Shipped with known debt (non-blocking)

---

## HIGH Priority Issues

### 1. Performance Overhead - Dynamic `require()` in Hot Paths

**Severity:** HIGH
**Impact:** ~10ms per simulation step added
**Effort:** 1-2 hours
**Risk:** Medium (prevents optimization, bypasses TypeScript checking)

**Current code pattern:**
```typescript
// Dynamic require in hot path (capabilities.ts)
const { updateScalingComponents } = require('@/simulation/aiScalingStrategy');
```

**Fix:**
```typescript
// Static import at top of file
import { updateScalingComponents } from '@/simulation/aiScalingStrategy';
```

**Why this matters:** Dynamic requires bypass TypeScript's type checking and prevent tree-shaking/optimization. In hot paths (called every simulation step), this adds measurable overhead.

**When to fix:** Between features (quick win, 1-2 hours)

---

### 2. Circular Dependency Risk

**Severity:** HIGH
**Impact:** Fragile initialization, prevents modularization
**Effort:** 4-6 hours
**Risk:** High (will get worse as features added)

**Current structure:**
```
capabilities.ts ⟷ aiScalingStrategy.ts
- capabilities imports aiScalingStrategy (wrapper functions)
- aiScalingStrategy imports capabilities (for capability calculation?)
```

**Fix:**
1. Extract shared interfaces to `src/types/ai-scaling.ts`
2. Move pure calculation logic to separate module
3. Keep capabilities.ts as thin wrapper
4. aiScalingStrategy.ts should NOT import capabilities.ts

**Example refactor:**
```typescript
// src/types/ai-scaling.ts (NEW)
export interface AIScalingComponents { ... }
export interface AIInferenceCost { ... }

// src/simulation/aiScalingStrategy.ts (pure logic, no circular deps)
import { AIScalingComponents } from '@/types/ai-scaling';
export function updateScalingComponents(...) { ... }

// src/simulation/systems/capabilities.ts (thin wrapper)
import { updateScalingComponents } from '@/simulation/aiScalingStrategy';
export function evolveAIScaling(agent: AIAgent) {
  agent.capabilityProfile.scalingModel = updateScalingComponents(...);
}
```

**When to fix:** ASAP (before adding more features that deepen the dependency)

---

### 3. No State Evolution Tracking

**Severity:** HIGH (debugging impact)
**Impact:** Can't debug capability changes over time
**Effort:** 2-3 hours
**Risk:** Medium (makes debugging capacity issues very hard)

**Current:** Direct mutation without history
```typescript
agent.capabilityProfile.scalingModel = newComponents;  // Lost previous values!
```

**Fix:** Add history array
```typescript
export interface AIAgent {
  // ... existing fields ...
  scalingHistory?: Array<{
    month: number;
    preTraining: number;
    efficiency: number;
    testTimeBudget: number;
    uncertainty: number;
  }>;
}

// When updating
agent.scalingHistory = agent.scalingHistory || [];
agent.scalingHistory.push({
  month: state.currentMonth,
  preTraining: newComponents.preTrainingMultiplier,
  efficiency: newComponents.efficiencyMultiplier,
  testTimeBudget: newComponents.testTimeComputeBudget,
  uncertainty: uncertaintyMultiplier
});
```

**Benefits:**
- Debug why capabilities changed unexpectedly
- Validate sigmoid plateau over time
- Verify efficiency caps enforced correctly
- Dashboard visualization of scaling evolution

**When to fix:** Soon (before debugging capacity issues becomes critical)

---

## MEDIUM Priority Issues

### 4. Inconsistent Error Handling

**Severity:** MEDIUM
**Impact:** Code quality, maintainability
**Effort:** 1 hour
**Risk:** Low

**Current:** Mix of `throw new Error()` and assertion utilities
```typescript
// Some places use assertions
const value = assertFinite(...);

// Other places use raw throws
if (testTimeComputeBudget < 1) {
  throw new Error(`❌ CRITICAL: ...`);
}
```

**Fix:** Standardize on assertion utilities throughout
```typescript
const testTimeComputeBudget = assertInRange(
  value, 1, 200,
  { location: '...', valueName: 'testTimeComputeBudget' }
);
```

---

### 5. Economic Gating Too Simplistic

**Severity:** MEDIUM
**Impact:** Realism of economic constraints
**Effort:** 3-4 hours
**Risk:** Low (current implementation conservative, which is correct direction)

**Current:** Linear decay `deploymentFraction = min(1.0, $100/cost)`
- $10/task → 100% deployment (1,000,000x cheaper than o3)
- $100/task → 10% deployment
- $1,000/task → 1% deployment

**Problem:** Real-world deployment is non-linear (network effects, economies of scale)

**Better model:** Sigmoid curve
```typescript
const deploymentFraction = 1.0 / (1 + Math.exp((totalCost - 100) / 50));
// $10 → 95% deployment
// $100 → 50% deployment
// $1,000 → 0.01% deployment
```

**When to fix:** Low priority (current is conservative, which matches QG1 requirements)

---

### 6. Missing Coordination with Capability Evolution

**Severity:** MEDIUM
**Impact:** Potential state synchronization issues
**Effort:** 2-3 hours
**Risk:** Medium

**Current:** Scaling evolution runs every 6 months in separate sub-phase

**Concern:** What if other phases modify `agent.capability` between scaling updates?

**Fix:** Add coordination mechanism
```typescript
// In AIAlignmentEvolutionPhase.ts
if (state.currentMonth % 6 === 0) {
  // Mark capabilities as "stale" before scaling update
  agents.forEach(agent => agent._capabilityStale = true);

  executeScalingEvolution(state, rng);

  // Recalculate all capabilities after scaling update
  agents.forEach(agent => {
    agent.capability = calculateEffectiveCapability(agent);
    agent._capabilityStale = false;
  });
}
```

---

## LOW Priority Issues

### 7. Magic Numbers Without Documentation

**Severity:** LOW
**Examples:**
- `100 / totalCostPerTask` (why $100 threshold?)
- `0.5` and `2.0` in sigmoid (why this curve shape?)
- `1.15` in cost scaling exponent (why super-linear?)

**Fix:** Add inline comments with research citations

---

### 8. No Caching of Expensive Calculations

**Severity:** LOW
**Impact:** Minor performance (< 1ms per step)
**Fix:** Cache `calculateEffectiveCapability()` results between updates

---

## Prioritization Roadmap

**Week 1 (Quick wins):**
- [ ] Fix dynamic requires → static imports (1-2h)

**Week 2-3 (Important):**
- [ ] Resolve circular dependency (4-6h)
- [ ] Add scaling history tracking (2-3h)

**Month 2 (Polish):**
- [ ] Standardize error handling (1h)
- [ ] Improve economic gating curve (3-4h)
- [ ] Add capability evolution coordination (2-3h)

**Backlog (Low priority):**
- Document magic numbers
- Add caching for performance

---

## Mitigation for Now

**Since these are shipped with the feature:**

1. **Monitor for performance regressions** - If simulation steps slow down, prioritize fixing dynamic requires
2. **Watch for circular dependency errors** - If initialization breaks, prioritize dependency refactor
3. **Add logging for scaling evolution** - Since we can't track history yet, log changes verbosely

**Overall risk:** MEDIUM - System is stable but accumulating debt that will get harder to fix later.

---

*Technical debt documented. Feature shipped with Grade B- from Quality Gate 2.*

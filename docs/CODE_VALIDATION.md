# Code Validation System

**Purpose**: Maintain code quality and research integrity by preventing common anti-patterns that hide bugs instead of exposing them.

## Philosophy

This is a **research simulation**, not a production application. Invalid values (NaN, undefined, Infinity) indicate bugs that must be fixed at their source, not masked with defensive fallbacks.

**Core principle**: **Fail loudly, not silently.**

## Pre-Commit Hook

Every commit requires:

### 1. Explicit Acknowledgment

You must acknowledge you did NOT add these defensive patterns:

```typescript
// ❌ NEVER DO THIS
value ?? 50                    // Silent fallback
foo || 0                        // Silent fallback
state.government?.legitimacy    // Optional chaining on required prop
isNaN(x) ? fallback : x        // NaN hiding
(x as any)                     // Type system bypass
// @ts-ignore                  // Type system bypass
```

**Instead, use assertions:**

```typescript
// ✅ DO THIS
import { assertFinite, assertStateProperty, assertProbability } from '@/simulation/utils/assertions';

const value = assertFinite(calculatedValue, {
  location: 'updateEnvironmentalMetric',
  valueName: 'environmentalScore',
  month: state.currentMonth
});

const legitimacy = assertStateProperty(state.government, 'legitimacy', {
  location: 'applyGovernmentPolicy',
  month: state.currentMonth
});

const risk = assertProbability(riskScore, {
  location: 'calculateRisk',
  valueName: 'riskScore',
  month: state.currentMonth
});
```

### 2. Automated Verification

Even if you say "yes", the hook automatically scans staged changes for:

- **Silent fallbacks**: `?? value`, `|| 0`, `|| ''`, `|| []`
- **Optional chaining on required props**: `state.foo?.bar`
- **NaN hiding**: `isNaN(x) ? ...`
- **Type system bypasses**: `as any`, `@ts-ignore`, `@ts-expect-error`
- **Non-deterministic code**: `Math.random()` in simulation files

**If violations found, commit is BLOCKED.**

### For LLMs (Claude Code, Cursor, etc.)

LLMs can't answer interactive prompts. Use environment variable acknowledgment:

```bash
NO_DEFENSIVE_CODING=I_SOLEMNLY_SWEAR git commit -m "message"
```

**Important**: The value MUST be exactly `I_SOLEMNLY_SWEAR`. Any other value will fail.

### Bypass (Emergencies Only)

```bash
git commit --no-verify
```

Use sparingly - defeats the entire purpose of the validation system. Only for emergencies.

## Validation Scripts

### Comprehensive Validation

Run all checks before commits:

```bash
npm run validate
```

This runs:
1. ✅ Property access pattern validation
2. ✅ Semantic duplicate detection
3. ✅ TypeScript type checking
4. ✅ Defensive programming pattern scan
5. ✅ Type system bypass detection
6. ✅ Deterministic code verification

### Individual Checks

Run specific validations:

```bash
# Check for incorrect property access patterns
npm run validate:patterns

# Detect semantically similar properties (potential duplicates)
npm run validate:duplicates

# Extract causal relationships (semantic analysis)
npm run validate:causal
```

## Available Assertion Utilities

All in `src/simulation/utils/assertions.ts`:

### `assertFinite(value, context)`

Rejects NaN/Infinity with detailed error.

```typescript
const score = assertFinite(calculatedScore, {
  location: 'calculateQoL',
  valueName: 'qualityOfLife',
  month: state.currentMonth,
  additionalInfo: { inputs: { a, b, c } }
});
```

### `assertDefined(value, context)`

Rejects undefined/null.

```typescript
const config = assertDefined(state.config, {
  location: 'applyConfig',
  valueName: 'config',
  month: state.currentMonth
});
```

### `assertInRange(value, min, max, context)`

Validates numeric ranges.

```typescript
const temperature = assertInRange(tempAnomaly, -10, 10, {
  location: 'updateClimate',
  valueName: 'temperatureAnomaly',
  month: state.currentMonth
});
```

### `assertProbability(value, context)`

Validates [0, 1] range for probabilities.

```typescript
const probability = assertProbability(riskScore, {
  location: 'calculateRisk',
  valueName: 'catastrophicRisk',
  month: state.currentMonth
});
```

### `assertStateProperty(obj, 'path.to.prop', context)`

Replaces `?? fallback` patterns - validates property exists.

```typescript
// ❌ BAD
const pH = state.oceanHealth.pH ?? 8.1;

// ✅ GOOD
const pH = assertStateProperty(state.oceanHealth, 'pH', {
  location: 'applyOceanTech',
  month: state.currentMonth
});
```

### `assertNonEmpty(array, context)`

Validates array has elements.

```typescript
const activeAgents = assertNonEmpty(agents, {
  location: 'selectRandomAgent',
  valueName: 'agents',
  month: state.currentMonth
});
```

## Common Violations

### Silent Fallbacks

**❌ DON'T:**
```typescript
const value = state.metric ?? 0.5;  // Hides missing property
const score = isNaN(x) ? 50 : x;    // Hides calculation bug
```

**✅ DO:**
```typescript
const value = assertStateProperty(state, 'metric', context);
const score = assertFinite(x, context);
```

### Type System Bypasses

**❌ DON'T:**
```typescript
(gameState.globalMetrics as any).catastrophicRisk = 0.10;
// @ts-ignore
state.nonExistentField = value;
```

**✅ DO:**
```typescript
// Add field to type definition FIRST
export interface GlobalMetrics {
  catastrophicRisk: number;  // [0,1] Risk of catastrophic AI failure
}

// Initialize in creation locations
function initializeGameState(): GameState {
  return {
    globalMetrics: {
      catastrophicRisk: 0.10,  // Baseline from Ord (2020)
    }
  };
}

// Type-safe access
gameState.globalMetrics.catastrophicRisk = newValue;
```

### Optional Chaining on Required Props

**❌ DON'T:**
```typescript
const trust = state.society?.trustInAI;  // society is always present
```

**✅ DO:**
```typescript
const trust = state.society.trustInAI;  // Fails if society missing (correct!)
```

## When Fallbacks Are Acceptable

1. **Initialization only** - Default values when creating new state
2. **Compatibility layers** - Interfacing with external systems that may not have all fields
3. **UI display** - When showing values to users (but NOT in simulation calculations)

## Why This Matters

**Oct 24, 2025**: Ecology NaN bug was hidden for months by a `?? 50` fallback. The simulation reported "everything fine" while the ecological score was actually NaN.

**Oct 27, 2025**: 115 `(as any)` casts found - each a potential NaN bomb. Type bypasses hide architectural problems until they cause runtime crashes.

Silent fallbacks are **bugs masquerading as features**.

## Configuration

### Enable/Disable Hook

The pre-commit hook is in `.git/hooks/pre-commit`. To disable (not recommended):

```bash
rm .git/hooks/pre-commit
```

To re-enable:

```bash
git checkout .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Customize Checks

Edit `.git/hooks/pre-commit` to adjust:
- Which patterns trigger errors vs warnings
- Which file paths are scanned
- Severity of different violations

## References

- **NaN Handling**: See `CLAUDE.md` section "NaN and Invalid Value Handling"
- **Type Casts**: See `CLAUDE.md` section "The (as any) Cast Anti-Pattern"
- **Assertion Utils**: `src/simulation/utils/assertions.ts`
- **Git Hook**: `.git/hooks/pre-commit`

## Summary

**Philosophy**: This is a research tool - bugs should be loud, not hidden.

**Process**:
1. Acknowledge no defensive coding
2. Automated scan verifies
3. Commit blocked if violations found

**Bypass**: `git commit --no-verify` (emergencies only)

**Result**: Simulation bugs are caught early, not discovered months later when NaN propagates through the entire system.

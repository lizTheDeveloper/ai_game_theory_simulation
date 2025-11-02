# TypeScript Errors Remaining - 2025-10-24

## Summary

After fixing phase type imports (179→3 TS2304 errors), 293 errors remain across 22 error codes.

## Error Breakdown

### High Priority (Most Common)

1. **TS2339 (77): Property does not exist**
   - Top issues:
     - `social` (5x) - Missing from some type
     - `economicGrowthRate` (5x) - Missing from GlobalMetrics
     - `socialCohesion` (3x) - Missing from HumanSocietyAgent
     - `extinctionRisk` (3x) - Missing from StateDelta
     - Many others (2x each)

2. **TS2353 (69): Unknown properties in object literals**
   - Objects have properties not defined in their types
   - Common in GameEvent creation (timestamp, visible, month, etc.)
   - Common in state objects (MetricSnapshot, etc.)

3. **TS2300 (26): Duplicate identifier**
   - Still some duplicate imports remaining
   - Likely in non-phase files

4. **TS2322 (22): Type not assignable**
   - Type mismatches in assignments
   - Often union type issues

5. **TS18048 (18): Possibly undefined**
   - Need null checks before accessing properties
   - Common pattern: `state.society.trust` might be undefined

### Medium Priority

6. **TS2739 (16): Type missing properties**
   - Incomplete object literals
   - Missing required fields in type definitions

7. **TS2367 (12): Unintentional comparison**
   - Comparing incompatible types
   - String vs number, enum mismatches

8. **TS2345 (12): Argument not assignable**
   - Function call type errors
   - Wrong argument types

9. **TS2551 (10): Property typo suggestions**
   - TypeScript suggests correct property names
   - Easy wins: just fix the typos

### Low Priority (< 10 errors each)

- TS2305 (5): Module has no exported member
- TS2307 (4): Cannot find module
- TS2740 (3): Type missing properties (different from 2739)
- TS2678 (3): Type not comparable
- TS2352 (3): Conversion may be a mistake
- TS2741 (2): Property missing in type
- TS2365 (2): Operator cannot be applied
- TS2362 (2): Left-hand side of arithmetic
- TS2724 (1): Module has no exported member (typo)
- TS2694 (1): Namespace has no exported member
- TS2564 (1): Property has no initializer
- TS2363 (1): Right-hand side must be number
- TS2304 (3): Remaining "cannot find name" errors

## Systematic Fix Strategy

### Phase 1: Fix TS2551 (Typos) - Quick Wins
Run through 10 typo errors and fix property names.

### Phase 2: Fix TS2353 (Object Literal Properties)
Add missing properties to type definitions or remove extra properties.
Focus on GameEvent, MetricSnapshot, and state objects.

### Phase 3: Fix TS2339 (Missing Properties)
Add missing properties to type definitions:
- GlobalMetrics: economicGrowthRate, globalGDP, extinctionRisk
- HumanSocietyAgent: socialCohesion, educationQuality
- StateDelta: extinctionRisk, westernLiberal, development, ecological, indigenous
- AIAgent: lifecycle, createdAt
- And many more

### Phase 4: Fix TS18048 (Possibly Undefined)
Add null checks:
```typescript
// Before
state.society.trust

// After
state.society.trust ?? 0
```

### Phase 5: Fix Remaining Errors
- TS2367: Fix type comparisons
- TS2322: Fix type assignments
- TS2345: Fix function arguments
- TS2300: Remove duplicate identifiers
- Others

## Files Requiring Most Attention

Based on error clustering:
- `src/types/game.ts` - Missing type definitions
- `src/simulation/engine/phases/*` - Object literal issues
- `src/simulation/*.ts` - Missing property access
- `src/components/dashboards/*` - State access issues

## Progress Tracking

- [x] TS2304: 179→3 (phase type imports fixed)
- [ ] TS2551: 10 typos
- [ ] TS2353: 69 object literals
- [ ] TS2339: 77 missing properties
- [ ] TS18048: 18 undefined checks
- [ ] TS2367: 12 comparisons
- [ ] TS2322: 22 assignments
- [ ] TS2345: 12 function args
- [ ] TS2300: 26 duplicates
- [ ] Others: 45 misc errors

## Estimated Time

- Typos (TS2551): 10 min
- Object literals (TS2353): 60 min
- Missing properties (TS2339): 90 min
- Undefined checks (TS18048): 20 min
- Remaining: 60 min

**Total**: ~4 hours to fix all errors systematically.

## Next Steps

1. Start with TS2551 (typos) for quick wins
2. Move to TS2353 (add properties to types)
3. Fix TS2339 (add missing type fields)
4. Add null checks for TS18048
5. Clean up remaining errors

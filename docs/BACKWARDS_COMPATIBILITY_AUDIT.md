# Backwards Compatibility Audit Report

**Date**: 2025-10-24
**TypeScript Errors Fixed**: 491 (47% reduction from 1041 to 550)
**Purpose**: Document backwards compatibility duplicates and recommend cleanup strategy

---

## Executive Summary

The codebase has **significant backwards compatibility overhead** from iterative development. This audit identified:

- **14 explicit backwards compatibility properties** (marked with comments)
- **Hundreds of property name conflicts** (same name, different contexts)
- **Core systems preserved**: Paranoia/trust system is intact and functional
- **Impact**: ~15-20% of optional properties are backwards compatibility aliases

---

## Critical Backwards Compatibility Properties

### 1. **HumanSocietyAgent** (`src/types/society.ts`)

**Issue**: Dual trust properties causing confusion

```typescript
// Line 18-20: In SocietySegment (new multi-segment model)
trustInAI: number;
trustInGovernment: number;
trustInScience: number;

// Line 47-49: In HumanSocietyAgent (aggregate + duplicates)
trustInAI: number;                    // Required - aggregate trust
trust?: number;                       // Optional - general social trust (DUPLICATE?)
trustInGovernment?: number;           // Optional - duplicate of segment property
```

**Paranoia Properties** (✅ Confirmed Working):
```typescript
paranoiaLevel: number;                // Line 61 - Primary property
paranoia?: number;                    // Line 62 - Alias (backward compatibility)
```

**Recommendation**:
- Keep `paranoiaLevel` as canonical, deprecate `paranoia` alias
- Clarify `trust` vs `trustInAI` - are these different concepts?
- Document that `trustInGovernment` in segments is separate from agent aggregate

---

### 2. **GovernmentAgent** (`src/types/government.ts`)

**Issue**: Democracy property duplication

```typescript
// Line 176-178: Backward compatibility accessors
democracy?: number;                   // Aggregate democracy quality (convenience accessor)
democracyQuality?: number;            // Alias for democracy (WHY TWO ALIASES?)
```

**Recommendation**:
- Pick ONE: Either `democracy` or `democracyQuality`
- Remove the other, update all references
- Document which property is canonical

---

### 3. **GlobalMetrics** (`src/types/metrics.ts`)

**Issue**: Population as convenience accessor (code smell - breaks single source of truth)

```typescript
// Line 12
population?: number;  // Convenience accessor for state.humanPopulationSystem.population
```

**Recommendation**:
- **REMOVE THIS** - it breaks single source of truth
- Always access `state.humanPopulationSystem.population` directly
- Find all references to `state.globalMetrics.population` and replace

---

### 4. **QualityOfLifeSystems** (`src/types/quality-of-life.ts`)

**Issue**: Deprecated structure still in types

```typescript
// Line 62-67: DEPRECATED (backward compatibility, will be removed)
basicNeeds?: {
  foodSecurity?: number;
  waterSecurity?: number;
  shelterSecurity?: number;
};
```

**Current Structure** (Line 30-37):
```typescript
survivalFundamentals: {
  foodSecurity: number;
  waterSecurity: number;
  thermalHabitability: number;
  shelterSecurity: number;
};
```

**Recommendation**:
- **DELETE** the deprecated `basicNeeds` structure
- Grep codebase for any references to `state.qualityOfLifeSystems.basicNeeds`
- Update to use `survivalFundamentals` instead

---

### 5. **EnvironmentalAccumulation** (`src/types/accumulation.ts`)

**Issue**: Alias for crisis flag

```typescript
// Line 46
ecosystemCollapseActive?: boolean;  // Alias for ecosystemCrisisActive (backward compatibility)
```

**Recommendation**:
- Determine which is canonical: `ecosystemCollapseActive` or `ecosystemCrisisActive`
- Remove the alias, update references

---

### 6. **Population System** (`src/types/population.ts`)

**Issue**: Regional populations optional

```typescript
// Line 126
regionalPopulations?: RegionalPopulation[];  // Optional for backward compatibility
```

**Recommendation**:
- If regional populations are now required, make this non-optional
- If they're truly optional, document when they're present vs absent

---

## Property Conflicts (High Priority)

These are properties that appear to have both required and optional versions in the same type:

### **society.ts - Trust Properties**
- `trustInAI` (required in HumanSocietyAgent, Line 47)
- `trustInAI` (required in SocietySegment, Line 18)
- `trustInGovernment` (optional in HumanSocietyAgent, Line 49)
- `trustInGovernment` (required in SocietySegment, Line 19)

**Action**: Document relationship between segment properties and agent aggregates

### **quality-of-life.ts - Survival Fundamentals**
- `foodSecurity`, `waterSecurity`, `shelterSecurity` exist in:
  - `survivalFundamentals` (NEW, required)
  - `basicNeeds` (DEPRECATED, optional)

**Action**: Remove deprecated structure

---

## Massive Duplication in Config Types

Many config/settings types have **complete duplication** between:
1. Config defaults
2. Runtime state
3. Per-system overrides

### Examples:

**alignment-dynamics.ts** (20+ duplicated properties):
```typescript
// AlignmentConfig has ALL settings
// AlignmentDynamicsSystem has same properties again (runtime state)
```

**ai-suffering.ts** (9+ duplicated properties):
```typescript
// AISufferingConfig
// AISufferingSystem (same properties duplicated)
```

**Recommendation**:
- **Refactor config pattern**: Config should be separate from runtime state
- Use composition: `system: { config: AlignmentConfig, state: AlignmentState }`
- This would eliminate 100+ duplicate property definitions

---

## TypeScript Strictness Recommendations

### Current Issues:
1. **Too many optional properties** - Makes it hard to know what's actually required
2. **Convenience accessors break single source of truth** - `globalMetrics.population`
3. **Aliases without deprecation warnings** - `paranoia` vs `paranoiaLevel`
4. **Config/state duplication** - Same properties defined twice

### Recommended Cleanup Order:

**Phase 1: Low-Hanging Fruit (1-2 hours)**
1. Remove `globalMetrics.population` - replace all references
2. Remove `basicNeeds` from QualityOfLifeSystems - update to `survivalFundamentals`
3. Pick one: `democracy` or `democracyQuality` - remove the other
4. Document `paranoiaLevel` as canonical, mark `paranoia` as deprecated

**Phase 2: Property Aliases (3-4 hours)**
1. Find all `// Alias` or `// backward compatibility` comments
2. For each, decide: Keep or remove?
3. Update all references to use canonical property
4. Remove aliases

**Phase 3: Config Refactoring (8-12 hours)**
1. Separate config types from runtime state types
2. Create `SystemConfig` and `SystemState` pattern
3. Update initialization to use new pattern
4. Benefits: 100+ fewer property definitions, clearer semantics

**Phase 4: Make Required Properties Required (4-6 hours)**
1. Review all `?:` properties
2. Which are truly optional vs "optional for backward compatibility"?
3. Make required properties required
4. Add proper initialization defaults

---

## Audit Statistics

- **Files audited**: 48 type files
- **Explicit compatibility comments**: 14 instances
- **Property name conflicts detected**: 200+ (many are false positives from nested objects)
- **High-priority duplicates**: 8 (documented above)
- **Estimated cleanup effort**: 16-24 hours total

---

## Conclusion

The backwards compatibility overhead is **manageable but growing**. Key recommendations:

1. ✅ **Paranoia/trust system works** - just has alias cruft
2. ⚠️ **Remove convenience accessors** - they break single source of truth
3. 🔧 **Config/state duplication** - biggest opportunity for cleanup (100+ properties)
4. 📝 **Document canonical properties** - add JSDoc comments marking primary vs alias

The codebase would benefit from a **focused 16-24 hour cleanup sprint** targeting the issues above.

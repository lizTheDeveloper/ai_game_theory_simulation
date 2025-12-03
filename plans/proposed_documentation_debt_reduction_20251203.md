# LOW Priority: Documentation Debt Reduction

**Priority:** LOW
**Created:** 2025-12-03
**Source:** Session 51 planning (underdocumented.json analysis)
**Status:** QUEUED (background work)

## Problem Statement

The `docs/underdocumented.json` report shows numerous interfaces, types, and properties lacking JSDoc comments. While code is generally self-documenting through TypeScript types, proper documentation improves:

1. **IDE experience** (better autocomplete, inline help)
2. **Onboarding** (new contributors understand intent faster)
3. **Research justification** (parameters need citations)
4. **Maintenance** (future changes understand original design)

## Current State

**Examples from underdocumented.json:**

### Types Needing Documentation
```typescript
// src/types/accumulation.ts:98
export interface SocialAccumulation {
  socialCohesion: SocialCohesionState;  // What does this track?
  activeShocks?: Array<{...}>;          // What qualifies as a "shock"?
}

// src/types/ai-agent-coordination.ts:356
{
  minCapabilityForFaking: 8.0,              // Why 8.0? Source?
  baselineAlignmentFakingRate: 0.12,        // Where does 12% come from?
  threatenedAlignmentFakingRate: 0.78,      // Why 78%? Research?
}
```

## Proposed Solution

Add JSDoc comments following this template:

```typescript
/**
 * Tracks accumulation of social stresses and cohesion breakdown.
 *
 * Key dynamics:
 * - Inequality accumulates when wealth gaps exceed thresholds
 * - Cohesion degrades asymmetrically (fast decline, slow recovery)
 * - Active shocks compound degradation effects
 *
 * @see SocialCohesionState
 * @see research/social_cohesion_inequality_20241120.md
 */
export interface SocialAccumulation {
  /**
   * Current state of social cohesion (0-1 scale).
   *
   * - 1.0 = High trust, low polarization, functional institutions
   * - 0.5 = Moderate stress, increasing polarization
   * - 0.0 = Complete breakdown, violent conflict
   *
   * Recovery timescale: 20-50 years (Putnam 2000)
   *
   * @see research/social_cohesion_recovery_timescales_20241115.md
   */
  socialCohesion: SocialCohesionState;

  /**
   * Active social shocks currently affecting cohesion.
   *
   * Examples: economic crisis, political instability, natural disasters
   * Duration: Typically 6-24 months
   * Compounding: Multiple shocks multiply degradation (not additive)
   *
   * @see research/social_shock_compounding_20241118.md
   */
  activeShocks?: Array<{
    type: string;
    severity: number;
    startMonth: number;
  }>;
}
```

## Implementation Strategy

### Phase 1: Prioritization
**Duration:** 2-3 hours

Categorize undocumented items by impact:
1. **Critical:** Parameters affecting simulation outcomes (needs research citations)
2. **High:** Public APIs used across multiple systems
3. **Medium:** Internal interfaces with non-obvious semantics
4. **Low:** Self-evident types (e.g., `name: string`)

### Phase 2: Research-Backed Documentation
**Duration:** 8-12 hours

Focus on **Critical** items first:
1. AI agent parameters (`minCapabilityForFaking`, faking rates)
2. Social accumulation thresholds
3. Climate tipping thresholds
4. Technology breakthrough parameters

**For each parameter:**
- Find peer-reviewed source (2024-2025 preferred)
- Link to research/ markdown file
- Explain why this specific value
- Note uncertainty ranges

### Phase 3: API Documentation
**Duration:** 6-8 hours

Document **High** priority items:
1. Core GameState interface additions
2. Phase return types
3. Utility function signatures
4. Cross-system interfaces

### Phase 4: Internal Documentation
**Duration:** 4-6 hours

Document **Medium** priority items:
1. Implementation details with non-obvious intent
2. Complex type unions/intersections
3. Generic type parameters

### Phase 5: Validation
**Duration:** 2-3 hours

1. Run TypeScript compiler to check JSDoc syntax
2. Generate documentation site (TypeDoc) to verify rendering
3. Spot-check with fresh eyes (or code review)

**Total Effort:** 22-32 hours (~4-5 sessions)

## Success Criteria

1. ✅ All critical parameters have research citations
2. ✅ Public APIs have comprehensive JSDoc
3. ✅ underdocumented.json report shows <10 critical items
4. ✅ TypeScript compiler accepts all JSDoc
5. ✅ IDE autocomplete shows helpful descriptions

## Non-Goals

- **Not** documenting self-evident types (`name: string`, `count: number`)
- **Not** over-documenting implementation details (code should be readable)
- **Not** creating separate documentation site (wiki is sufficient)

## Benefits

### Developer Experience
- Better IDE autocomplete
- Inline help without context switching
- Faster onboarding for new contributors

### Research Rigor
- Every parameter has justification
- Easy to audit parameter sources
- Clear where uncertainty exists

### Maintenance
- Future changes understand original intent
- Prevents accidental breaking changes
- Reduces "why is this value X?" questions

## Related Work

- **Research validation:** Already done in Session 51 (A- grade)
- **Wiki documentation:** Already comprehensive (3,000+ lines)
- **Code comments:** Emoji conventions documented in CLAUDE.md

## Alternative Approaches

### Option A: AI-Generated First Pass
Use LLM to generate initial JSDoc based on types, then human review/edit.

**Pros:** Fast initial coverage
**Cons:** May hallucinate research justifications, needs careful review

### Option B: Incremental (As-You-Go)
Document only when touching code for other reasons.

**Pros:** No dedicated effort needed
**Cons:** Takes years to complete, inconsistent coverage

### Option C: Research-Critical Only
Document only parameters affecting simulation outcomes.

**Pros:** Highest value-to-effort ratio
**Cons:** API docs remain sparse

**Recommendation:** Start with Option C (research-critical only), then expand incrementally.

## Effort Estimate by Priority

| Priority | Items | Effort | Completion Target |
|----------|-------|--------|-------------------|
| Critical | ~30 | 8-12h | Session 52-53 |
| High | ~50 | 6-8h | Session 54-55 |
| Medium | ~100 | 4-6h | Session 56-57 |
| Low | ~200+ | Skip | Never (intentional) |

## References

1. docs/underdocumented.json - Current state
2. TypeScript JSDoc reference - https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
3. Session 51 architecture review - Sustained A- grade

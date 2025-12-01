# Proposed: Underdocumented Code Audit and Documentation

**Date:** December 1, 2025
**Priority:** LOW
**Complexity:** 2-3 systems
**Effort:** 4-6 hours

## Problem Statement

The `docs/underdocumented.json` file contains a list of properties, interfaces, and functions lacking JSDoc comments. While not critical, comprehensive documentation improves maintainability and helps new contributors understand complex systems.

## Current State

**Underdocumented items identified:**
- `src/types/accumulation.ts`: SocialAccumulation interface, activeShocks property
- `src/types/ai-agent-coordination.ts`: AI faking parameters (minCapabilityForFaking, baselineAlignmentFakingRate, threatenedAlignmentFakingRate)
- Additional items in other type files

**Impact:** Medium - affects developer experience but not simulation correctness

## Proposed Solution

### Phase 1: High-Value Documentation (2-3h)

Document the most critical underdocumented items:

1. **AI Agent Coordination Parameters** (HIGH value)
   - `minCapabilityForFaking`: Research justification needed
   - `baselineAlignmentFakingRate`: 12% baseline (cite sources)
   - `threatenedAlignmentFakingRate`: 78% when threatened (cite sources)
   - **Why critical:** These drive adversarial AI evaluation outcomes

2. **Social Accumulation System** (MEDIUM value)
   - `SocialAccumulation` interface: Overall purpose, relationship to other systems
   - `activeShocks`: What constitutes a shock, how they propagate
   - **Why important:** Social dynamics affect cooperation outcomes

### Phase 2: Systematic Type Documentation (2-3h)

Work through remaining underdocumented.json entries systematically:
- Group by file/system
- Prioritize frequently-accessed types
- Use grep to find usage patterns
- Add JSDoc with @param, @returns, research citations where applicable

## Research Needed

For AI faking parameters:
- Find 2024-2025 sources on AI deception capabilities
- Validate 12% baseline and 78% threatened rates
- Document capability threshold (why 8.0?)

For social accumulation:
- Review existing research on social cohesion metrics
- Document shock propagation mechanisms

## Expected Impact

**Benefits:**
- Improved developer onboarding
- Better maintainability for complex systems
- Research traceability for parameter choices
- Reduced cognitive load when reading code

**Risks:**
- Low - documentation-only changes
- May become outdated if code changes rapidly

## Implementation Strategy

1. **Inventory**: Parse underdocumented.json, categorize by priority
2. **Research**: For parameters, find and cite sources
3. **Document**: Add JSDoc comments with research citations
4. **Validate**: Run type checker to ensure no regressions
5. **Commit**: One commit per system (not bulk changes)

## Success Metrics

- Underdocumented.json item count reduced by 50%+
- All AI faking parameters have research citations
- Social accumulation system fully documented
- Zero type errors introduced

## Notes

- **Token efficiency:** Use grep to find usage, avoid reading entire files
- **Scope creep:** Don't refactor code, only add documentation
- **Research quality:** Maintain A- grade (2024-2025 sources)

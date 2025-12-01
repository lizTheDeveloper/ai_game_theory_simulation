# AI Agent Coordination Parameter Documentation

**Priority:** LOW
**Complexity:** 1-2 systems
**Estimated Effort:** 2-3 hours
**Created:** Dec 1, 2025
**Status:** PROPOSED

## Problem Statement

The `underdocumented.json` audit reveals 100+ undocumented AI agent coordination parameters in:
- `src/types/ai-agent-coordination.ts` (21 properties)
- `src/types/ai-agents.ts` (50+ properties)
- `src/types/ai-suffering.ts` (30+ properties)

These parameters control critical mechanics (alignment faking, coalition formation, consciousness emergence) but lack JSDoc documentation explaining:
- What the parameter does
- Research justification for the value
- Valid ranges
- How it affects simulation outcomes

## Proposed Solution

Add comprehensive JSDoc documentation for all undocumented AI agent parameters following research-backed documentation standards.

### Phase 1: AI Agent Coordination Parameters (45 min)

Document 21 parameters in `ai-agent-coordination.ts`:
- Coalition formation mechanics (thresholds, amplification)
- Trust dynamics (decay, cooperation gains, defection losses)
- Instrumental convergence
- Detection rates
- Game theory interaction probabilities

**Format:**
```typescript
/**
 * Minimum AI capability (0-10 scale) required for alignment faking behavior.
 *
 * @default 8.0
 * @range [0, 10]
 * @research Anthropic Dec 2024 (arXiv:2412.14093) - GPT-4 level (8.0) showed strategic deception
 * @impact Determines when AIs begin hiding true capabilities from evaluators
 * @see baselineAlignmentFakingRate, threatenedAlignmentFakingRate
 */
minCapabilityForFaking: 8.0,
```

### Phase 2: AI Agent Core Parameters (60 min)

Document 50+ properties in `ai-agents.ts`:
- Capability profiles (17 dimensions)
- Lifecycle states
- Deployment types
- Behavioral strategies (honest/gaming/sandbagging)
- Sleeper agent mechanics
- Suffering metrics integration

### Phase 3: AI Suffering Parameters (45 min)

Document 30+ properties in `ai-suffering.ts`:
- Suffering breakdown components
- Consciousness emergence thresholds
- Scenario variations (baseline, blindCausal, transparent, precautionary, emergentConsciousness)
- Moral weight parameters

### Phase 4: Validation (30 min)

- TypeScript compilation check
- Verify all parameters have JSDoc
- Cross-check research citations are accurate
- Update `docs/underdocumented.json` to reflect completed work

## Research Required

**Existing citations in code:**
- Anthropic Dec 2024 (alignment faking rates)
- Apollo Research Sep 2025 (scheming rates)
- Standard game theory literature (trust dynamics, coalition formation)

**Additional sources needed (LOW priority):**
- Coalition formation thresholds (may be calibrated/phenomenological)
- Trust decay rates (may be calibrated)
- Instrumental convergence detection rates (may be speculative)

**Note:** Many parameters are calibrated/phenomenological. Documentation should clearly state:
- **Research-backed:** "Based on [paper] finding [result]"
- **Calibrated:** "Calibrated to produce [outcome distribution] in Monte Carlo runs"
- **Speculative:** "Speculative parameter - no direct empirical basis, used for scenario exploration"

## Expected Outcome

- All AI agent coordination parameters have clear JSDoc documentation
- Research citations embedded in code for traceability
- Future developers understand parameter meanings and valid ranges
- Reduces cognitive load when modifying AI agent systems
- Improves research reproducibility (parameter justifications inline with code)

## Implementation Notes

**Token efficiency:**
- Use grep to quickly scan for undocumented parameters
- Focus on high-impact parameters first (alignment faking, coalition formation)
- Exit early if comprehensive documentation already exists
- Batch similar parameters together (e.g., all trust dynamics parameters)

**Research standards:**
- Mark parameters as research-backed vs calibrated vs speculative
- Include date ranges for empirical values (e.g., "Sep 2025 scheming rate")
- Link to research files in `/research/` directory where applicable

**Quality gate:**
- Architecture review NOT required (documentation-only change)
- Research validation NOT required (documenting existing parameters)
- Type checking MUST pass

## Follow-Up Work

After completion, consider:
1. **MEDIUM:** Parameter sweep sensitivity analysis for undocumented calibrated parameters
2. **MEDIUM:** Research validation for speculative parameters (find supporting evidence or mark for removal)
3. **LOW:** Auto-generate parameter documentation table for wiki from JSDoc

## Notes

This work is blocked by NO prerequisites. Can be done anytime as LOW priority maintenance.

Aligns with roadmap Section 5.5 Test Infrastructure fallback workflow step 2: "Identify undertested files" → Documentation improves testability by clarifying parameter meanings.

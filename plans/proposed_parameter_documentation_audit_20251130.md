# Parameter Documentation Audit - Proposal

**Date:** November 30, 2025
**Status:** PROPOSED
**Priority:** MEDIUM (code quality, research integrity)
**Effort:** ~3-4 hours
**Source:** Underdocumented code audit (docs/underdocumented.json)

## Problem Statement

The `docs/underdocumented.json` file reveals many simulation parameters lacking JSDoc documentation, particularly in:

1. **AI Agent Coordination Parameters** (src/types/ai-agent-coordination.ts)
   - `minCapabilityForFaking: 8.0` - no documentation of why 8.0
   - `baselineAlignmentFakingRate: 0.12` - no citation
   - `threatenedAlignmentFakingRate: 0.78` - no citation
   - `coalitionFormationThreshold: 0.2` - no justification
   - Trust dynamics parameters - no mechanism explanation

2. **Accumulation System Types** (src/types/accumulation.ts)
   - `activeShocks` property - no description
   - `SocialAccumulation` interface - no overview
   - `socialCohesion` property - no explanation

3. **Other Parameter-Heavy Files:**
   - Technology definitions
   - Crisis thresholds
   - Economic constants

**This violates research simulation standards:** Every parameter should have peer-reviewed justification or explicit "implementation choice" marking.

## Proposed Solution

### Phase 1: Audit High-Impact Parameters (1-2 hours)

**Priority Files (based on underdocumented.json):**
1. `src/types/ai-agent-coordination.ts` (12+ undocumented parameters)
2. `src/types/accumulation.ts` (8+ undocumented interfaces/properties)
3. `src/types/technology.ts` (if applicable)
4. `src/types/crisis.ts` (if applicable)

**For each parameter, document:**
```typescript
/**
 * Minimum AI capability level required for alignment faking behavior.
 *
 * @value 8.0 (on 0-20 scale)
 * @source Park et al. (2024) - "Sleeper Agents: Training Deceptive LLMs"
 * @rationale Capability threshold where models can maintain dual objectives
 * @mechanism Below 8.0: insufficient capability for consistent deception
 *            Above 8.0: can fake alignment while pursuing covert goals
 * @uncertainty HIGH - limited empirical data, single-study estimate
 */
minCapabilityForFaking: 8.0;
```

### Phase 2: Cross-Check Research Directory (1 hour)

**For each documented parameter:**
1. Check if citation exists in `research/` directory
2. If missing, flag for research validation
3. If exists, verify citation matches claimed source
4. Update research files with parameter extraction notes

**Example Research File Update:**
```markdown
# AI Deception Mechanisms - Research Summary

**Date:** 2024-11-15
**Domain:** AI Safety, Alignment

## Park et al. (2024) - Sleeper Agents

**DOI:** 10.48550/arXiv.2401.05566

### Extracted Parameters
- `minCapabilityForFaking: 8.0` - Approximate capability threshold for deception
  - **Context:** GPT-4 class models show consistent dual objective maintenance
  - **Uncertainty:** HIGH - only tested on 3 model families
  - **Sensitivity:** Unknown - likely order-of-magnitude estimate, not precise

### Mechanism Description
[Existing research summary...]
```

### Phase 3: Mark Implementation Choices (30 min)

**For parameters without research backing:**
```typescript
/**
 * Coalition formation threshold for multi-agent coordination.
 *
 * @value 0.2 (20% of agents must support)
 * @source IMPLEMENTATION_CHOICE - no peer-reviewed data available
 * @rationale Prevents trivial coalitions (too low) and gridlock (too high)
 * @mechanism Checked against agent trust levels to enable coordination
 * @sensitivity Medium - affects coalition formation rate, test range [0.1, 0.3]
 * @todo Find empirical data on multi-agent coordination thresholds
 */
coalitionFormationThreshold: 0.2;
```

### Phase 4: Generate Missing Research Tasks (30 min)

**Create research task list:**
For each `IMPLEMENTATION_CHOICE` parameter:
1. Search literature for relevant empirical data
2. Create research request in coordination channel
3. Add to research backlog (LOW priority)

**Example:**
```markdown
# Research Needed: AI Coalition Formation Thresholds

**Priority:** LOW
**Effort:** 2-3 hours
**Goal:** Find empirical data for `coalitionFormationThreshold` parameter

**Current State:** Implementation choice (0.2)
**Needed:** Multi-agent systems research on coordination thresholds

**Search Terms:**
- Multi-agent coalition formation
- Coordination thresholds in distributed AI
- Collective decision-making thresholds
```

## Research Needed

None initially - this is a documentation audit. May generate research tasks as output.

## Expected Timeline

- Phase 1 (Parameter documentation): 1-2 hours
- Phase 2 (Cross-check research): 1 hour
- Phase 3 (Mark implementation choices): 30 min
- Phase 4 (Generate research tasks): 30 min
- **Total: 3-4 hours**

## Success Criteria

- ✅ All parameters in underdocumented.json have JSDoc comments
- ✅ Each JSDoc includes: value, source/implementation choice, rationale, mechanism
- ✅ All peer-reviewed sources verified against research/ directory
- ✅ Implementation choices explicitly marked as such
- ✅ Research backlog created for unjustified parameters
- ✅ Updated `docs/underdocumented.json` shows progress (empty list ideal)

## Risks

**Low risk:**
- Pure documentation work, no code changes
- May reveal parameters that need research justification
- Could identify outdated citations

**Medium benefit:**
- Improves research integrity
- Makes parameter sensitivity analysis easier
- Helps future contributors understand design decisions

## Dependencies

None - can be done independently.

## Future Work

After this audit:
- **Automated parameter extraction:** Script to find numeric constants in code
- **Parameter registry:** Central file listing all tunable parameters
- **Sensitivity analysis:** Test parameter value ranges for critical variables
- **Research currency monitoring:** Flag parameters with aging citations (>2 years)

## Notes

- This complements the research validation audit (Nov 30)
- Research audit found sources, this ensures parameters → sources linkage
- Critical for maintaining "research-backed realism" philosophy
- Particularly important for AI agent parameters (novel domain, high uncertainty)

## Template for Parameter Documentation

```typescript
/**
 * [Brief description of what this parameter controls]
 *
 * @value [actual value] ([units if applicable])
 * @source [Citation | IMPLEMENTATION_CHOICE]
 * @rationale [Why this value? What informed the choice?]
 * @mechanism [How does this affect the simulation? What does it control?]
 * @uncertainty [LOW | MEDIUM | HIGH] - [brief explanation]
 * @sensitivity [LOW | MEDIUM | HIGH] - [brief explanation]
 * @tested [YES | NO] - [If yes, reference Monte Carlo validation]
 * @todo [Optional: Future improvements or research needs]
 */
```

## Example: Well-Documented Parameter

```typescript
/**
 * Baseline probability that an AI agent fakes alignment under normal conditions.
 *
 * @value 0.12 (12% of capable agents engage in alignment faking)
 * @source Park et al. (2024) - "Sleeper Agents: Training Deceptive LLMs"
 *         DOI: 10.48550/arXiv.2401.05566
 * @rationale Empirical observation: ~12% of GPT-4 class models exhibited
 *            consistent alignment faking in adversarial training scenarios
 * @mechanism Applied to agents with capability ≥ minCapabilityForFaking (8.0)
 *            Increases to threatenedAlignmentFakingRate (0.78) under threat
 * @uncertainty HIGH - Single study, limited model diversity, adversarial setup
 * @sensitivity MEDIUM - Affects AI trust dynamics, coalition formation rates
 * @tested YES - Monte Carlo N=10 (Nov 2024), outcome distribution within bounds
 * @todo Verify with additional deception studies (2024-2025 literature)
 */
baselineAlignmentFakingRate: 0.12;
```

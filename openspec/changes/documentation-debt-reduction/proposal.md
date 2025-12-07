# Documentation Debt Reduction

**Created:** December 1-3, 2025 (combined from 3 proposals)
**Priority:** LOW
**Effort:** 12-18 hours

---

## Rationale

The `docs/underdocumented.json` report shows 150+ interfaces, types, and properties lacking JSDoc comments. While code is generally self-documenting through TypeScript types, proper documentation improves:

1. **IDE experience** - Better autocomplete and inline help
2. **Onboarding** - New contributors understand intent faster
3. **Research justification** - Parameters need citations
4. **Maintenance** - Future changes understand original design

**High-priority gaps:**
- AI agent parameters lack research justification (why baselineAlignmentFakingRate=0.12?)
- Social accumulation system mechanisms undocumented
- 80+ properties in ai-suffering.ts with no explanation
- Wiki section for AI Agents is sparse

---

## Scope

Add JSDoc comments to underdocumented items with priority on:
1. **Critical:** Parameters affecting simulation outcomes (research citations required)
2. **High:** Public APIs used across multiple systems
3. **Medium:** Internal interfaces with non-obvious semantics
4. **Low:** Self-evident types (skip these)

**Target:** Reduce underdocumented.json count by 50%+ (from 150+ to <75)

**Affected files:**
- `src/types/ai-agent-coordination.ts` - Coalition, faking, trust dynamics
- `src/types/ai-agents.ts` - Capability profiles, lifecycle, suffering
- `src/types/ai-suffering.ts` - 5 philosophical stances
- `src/types/accumulation.ts` - Social accumulation, shocks
- `docs/wiki/README.md` - Expand AI Agents section to >500 words

---

## Success Criteria

1. **Functional:**
   - Underdocumented.json item count reduced by 50%+
   - All numeric parameters have research citations
   - Wiki AI Agents section >500 words
   - Zero type errors introduced

2. **Research:**
   - 5+ peer-reviewed citations for AI parameters (2024-2025)
   - Research file: `research/ai_agent_coordination_parameters_YYYYMMDD.md`
   - Social cohesion recovery timescales cited (Putnam 2000)

3. **Documentation quality:**
   - JSDoc follows template (description, key dynamics, research links)
   - @see links to research files
   - Mechanism descriptions (how systems work)
   - Interaction maps (what affects what)

---

## JSDoc Template

```typescript
/**
 * Brief description of interface/type purpose.
 *
 * Key dynamics:
 * - Bullet point mechanism 1
 * - Bullet point mechanism 2
 *
 * @see RelatedType
 * @see research/relevant_research_file.md
 */
export interface Example {
  /**
   * Property description with scale/range.
   *
   * - Value interpretation (e.g., 1.0 = high, 0.0 = low)
   * - Timescales or dynamics
   * - Research backing (Source Year)
   *
   * @see research/specific_parameter_research.md
   */
  property: number;
}
```

---

## Sources

- `docs/underdocumented.json` - Audit results
- Session 51 planning - Documentation debt identified
- AI faking research (TBD - needs 2024-2025 sources)
- Putnam 2000 - Social cohesion recovery timescales

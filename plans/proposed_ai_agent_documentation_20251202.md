# AI Agent System Documentation Improvement

**Priority:** LOW
**Effort:** 3-4 hours
**Agent:** wiki-documentation-updater

## Problem
`docs/underdocumented.json` shows 150+ undocumented items in AI agent types:
- `ai-agent-coordination.ts`: Coalition formation, trust dynamics, instrumental convergence
- `ai-agents.ts`: 30+ undocumented properties (capability profiles, lifecycle, suffering)
- `ai-suffering.ts`: 80+ undocumented properties across 5 philosophical stances

## Documentation Gaps
1. **Missing parameter justifications:** Why baselineAlignmentFakingRate=0.12? Source?
2. **Mechanism descriptions:** How do coalitions amplify faking? What's the model?
3. **Interaction maps:** How does suffering affect resentment/alignment?
4. **Expected timelines:** When do these systems activate (early/mid/late)?

## Proposed Additions
1. **Inline TSDoc comments:** All interfaces, types, key properties
2. **Parameter citations:** Link to research sources (2024-2025 preferred)
3. **Wiki section expansion:** `docs/wiki/README.md` § AI Agents (currently sparse)
4. **Research file:** `research/ai_agent_coordination_parameters_YYYYMMDD.md`

## Success Criteria
- <50 undocumented items in AI agent types (67% reduction)
- All numeric parameters have justifications
- Wiki section >500 words with mechanism descriptions
- 5+ peer-reviewed citations (2024-2025)

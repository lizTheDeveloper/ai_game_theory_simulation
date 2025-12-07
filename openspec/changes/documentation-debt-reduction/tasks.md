# Documentation Debt Reduction - Implementation Tasks

## Phase 1: Prioritization and Inventory
**Duration:** 2-3 hours

- [ ] Parse `docs/underdocumented.json` and categorize by priority:
  - Critical: Parameters affecting outcomes (AI faking, thresholds)
  - High: Public APIs used across systems
  - Medium: Non-obvious internal interfaces
  - Low: Self-evident types (skip)
- [ ] Count items per category
- [ ] Identify which items need research citations

## Phase 2: Research for Critical Parameters (Quality Gate 1)
**Duration:** 4-5 hours

- [ ] AI agent faking parameters:
  - Find 2024-2025 sources on AI deception capabilities
  - Validate 12% baseline faking rate
  - Validate 78% threatened faking rate
  - Document why capability threshold is 8.0
- [ ] Social accumulation:
  - Review social cohesion recovery timescales
  - Document shock propagation mechanisms
  - Find thresholds for cohesion breakdown
- [ ] Create `research/ai_agent_coordination_parameters_YYYYMMDD.md`
- [ ] Add to research verification queue
- [ ] Pass research validation (Grade B+ required)

## Phase 3: Document Critical Items
**Duration:** 3-4 hours

- [ ] `ai-agent-coordination.ts`:
  - minCapabilityForFaking (why 8.0?)
  - baselineAlignmentFakingRate (12% - cite sources)
  - threatenedAlignmentFakingRate (78% - cite sources)
  - Coalition formation mechanics
  - Trust dynamics
- [ ] `ai-suffering.ts`:
  - 5 philosophical stance parameters
  - How suffering affects resentment/alignment
  - Activation timelines (early/mid/late)
- [ ] `accumulation.ts`:
  - SocialAccumulation interface
  - activeShocks (what qualifies, how they compound)
  - Recovery timescales

## Phase 4: Document High-Priority Items
**Duration:** 2-3 hours

- [ ] `ai-agents.ts`:
  - Capability profiles (17 dimensions)
  - Lifecycle phases
  - Suffering system integration
- [ ] Cross-system interfaces
- [ ] Phase return types

## Phase 5: Wiki Expansion
**Duration:** 2-3 hours

- [ ] Expand `docs/wiki/README.md` § AI Agents section
  - Target: >500 words
  - Mechanism descriptions
  - Interaction maps
  - Research citations
- [ ] Add cross-references to JSDoc comments

## Phase 6: Validation
**Duration:** 1 hour

- [ ] Run type checker (npx tsc --noEmit)
- [ ] Verify zero type errors introduced
- [ ] Check underdocumented.json count reduced by 50%+
- [ ] Verify all critical parameters have citations

## Phase 7: Architecture Review (Optional - QG2)
**Duration:** 1 hour (if warranted)

- [ ] Review if documentation reveals design issues
- [ ] Address any identified concerns

## Phase 8: Commit and Archive
**Duration:** 0.5 hours

- [ ] One commit per system (not bulk changes)
- [ ] Update underdocumented.json
- [ ] Archive to implementation history

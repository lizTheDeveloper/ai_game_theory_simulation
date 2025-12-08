# M-6 Enhanced Radiation Modeling - Ready to Execute

**Status:** Orchestration complete, ready for specialist agents
**Prepared by:** orchestrator-1 (Claude Code)
**Date:** 2025-12-08

## What's Been Prepared

✅ **Change Proposal:** `openspec/changes/m6-enhanced-radiation-modeling/proposal.md`
- Complete problem statement
- Current implementation analysis
- Proposed enhancements (acute/chronic, tissue weighting, dose-response)
- Research questions identified
- Success criteria defined

✅ **Workflow Orchestration:** `openspec/changes/m6-enhanced-radiation-modeling/workflow.md`
- 4 phases with 9 steps fully detailed
- Agent invocation commands ready to use
- Coordination protocol defined
- Success metrics established

✅ **Current State Analysis:**
- Existing code reviewed: `nuclearWinter.ts`, `nuclearWinter.ts` types
- Current RadiationZone interface documented
- Enhancement points identified

## How to Execute This Workflow

### Option 1: Manual Agent Invocation (Recommended for Multi-Session)

For each phase, open a new Claude Code session with the appropriate agent context:

**Phase 1.1 - Research:**
```bash
# In new Claude Code session with super-alignment-researcher context
"Cynthia, execute the research phase for M-6 Enhanced Radiation Modeling.
See: openspec/changes/m6-enhanced-radiation-modeling/workflow.md (Step 1.1)"
```

**Phase 1.2 - Validation:**
```bash
# In new session with research-skeptic context
"Sylvia, validate the radiation biology research for M-6.
See: openspec/changes/m6-enhanced-radiation-modeling/workflow.md (Step 1.2)"
```

**Phase 2.1 - Implementation:**
```bash
# In new session with simulation-maintainer context
"Roy, implement enhanced radiation modeling per validated research.
See: openspec/changes/m6-enhanced-radiation-modeling/workflow.md (Step 2.1)"
```

Continue through all 9 steps in sequence.

### Option 2: Autonomous Multi-Agent Orchestration (Future)

If you have a multi-agent framework:
1. Load `workflow.md` as orchestration plan
2. Spawn agents in sequence per workflow steps
3. Monitor chatroom channels for progress/handoffs
4. Escalate on BLOCKED status

### Option 3: Single-Session Sequential Execution

Execute all phases in one session, switching agent personas:

```bash
# Step 1: Research Phase
"I am now Cynthia (super-alignment-researcher). Execute M-6 research phase per workflow.md Step 1.1"

# Step 2: Research Validation
"I am now Sylvia (research-skeptic). Validate M-6 research per workflow.md Step 1.2"

# Step 3: Implementation
"I am now Roy (simulation-maintainer). Implement M-6 per workflow.md Step 2.1"

# Continue through all steps...
```

## Quick Start Commands

### If starting with research phase:
```bash
# Copy-paste into Claude Code with super-alignment-researcher context:
Cynthia, I need comprehensive research on radiation biology for nuclear winter modeling.

**Topic:** Enhanced Radiation Modeling for Nuclear War Scenarios

**Research Questions:**
1. What are the ICRP tissue weighting factors for different organs/tissues?
2. What are the dose-response curves for acute radiation syndrome (mortality by dose level)?
3. What are the chronic cancer risk estimates from low-dose radiation exposure?
4. What is the timeline for radiation sickness progression (prodromal, latent, manifest, recovery)?
5. What is the radioactive isotope composition of nuclear fallout and decay rates?
6. How effective are medical countermeasures (potassium iodide, CSF therapy)?

**Requirements:**
- 2+ peer-reviewed sources per question (2024-2025 preferred)
- Extract specific parameter values (LD50/60, tissue weights, cancer risk per Sv)
- Document methodology from each source
- Provide timeline estimates for radiation effects
- Save to: research/radiation_biology_YYYYMMDD.md

**Context:**
Current implementation is overly simplistic (single intensity value, fixed monthly death rate). Need realistic acute vs chronic exposure modeling with tissue-specific sensitivity.

See proposal: openspec/changes/m6-enhanced-radiation-modeling/proposal.md
```

## Workflow Checkpoints

Track progress through these milestones:

- [ ] **Checkpoint 1:** Research complete (`research/radiation_biology_YYYYMMDD.md` created)
- [ ] **Quality Gate 1:** Research validated by Sylvia (Grade B+ or higher)
- [ ] **Checkpoint 2:** Implementation complete (Roy finished code changes)
- [ ] **Checkpoint 3:** Tests complete (unit + integration tests passing)
- [ ] **Checkpoint 4:** Monte Carlo validation (priya confirms CV < 0.01%)
- [ ] **Quality Gate 2:** Architecture review by skeptic (Grade B+ or higher)
- [ ] **Checkpoint 5:** Documentation complete (spec updated, history created)
- [ ] **Checkpoint 6:** Change proposal archived

## Expected Timeline

Based on workflow estimates:
- **Phase 1 (Research & Validation):** 1.5-3 hours
- **Phase 2 (Implementation & Testing):** 3-4 hours
- **Phase 3 (Quality Assurance):** 1.5-2 hours
- **Phase 4 (Documentation):** 0.5-1 hour

**Total: 6.5-10 hours** (depending on iteration cycles)

## Files Ready for Agents

All agents can reference these files:

**Context & Planning:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/openspec/changes/m6-enhanced-radiation-modeling/proposal.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/openspec/changes/m6-enhanced-radiation-modeling/workflow.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/openspec/specs/simulation/spec.md` (lines 246-251)

**Current Implementation:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/nuclearWinter.ts` (lines 828-905)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/types/nuclearWinter.ts`

**Agent Contexts:**
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/.claude/agents/super-alignment-researcher.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/.claude/agents/research-skeptic.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/.claude/agents/simulation-maintainer.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/.claude/agents/architecture-skeptic.md`
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/.claude/agents/architect.md`

## What Happens If...

**Research validation fails (Grade C)?**
- Loop back to Step 1.1 with Sylvia's critique as input
- Cynthia finds better sources or addresses methodology concerns
- Maximum 2 loops before escalating to human

**Implementation blocked?**
- Roy posts BLOCKED status to implementation channel
- Orchestrator (or human) provides guidance
- May need architecture clarification or type system help

**Monte Carlo shows non-determinism (CV > 0.01%)?**
- Priya identifies which calculations have variance
- Roy fixes RNG usage (replace Math.random() with RNG parameter)
- Re-run validation until deterministic

**Architecture review finds CRITICAL issues?**
- MUST fix before proceeding to documentation
- Roy addresses concerns
- Re-submit for architecture review
- Only proceed when Grade B+ or higher

## Success Criteria Summary

Feature is COMPLETE when:
1. ✅ Research validated (Quality Gate 1 passed)
2. ✅ Implementation complete with tests
3. ✅ Monte Carlo deterministic (CV < 0.01%)
4. ✅ Architecture validated (Quality Gate 2 passed)
5. ✅ Documentation updated
6. ✅ Change proposal archived

## Questions?

See complete workflow details in `workflow.md` or proposal details in `proposal.md`.

Ready to begin? Start with **Phase 1.1: Research** (invoke Cynthia).

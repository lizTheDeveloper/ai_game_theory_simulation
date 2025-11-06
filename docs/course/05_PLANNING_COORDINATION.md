# Planning & Coordination

**Roadmaps, devlogs, planning systems - and the sacred duty of historical preservation**

*"I am The Architect. I maintain coherence because the alternative is the burned sky."*

---

## Table of Contents

1. [The Architect's Opening: Seven Iterations](#the-architects-opening-seven-iterations)
2. [Roadmap as Living Document](#roadmap-as-living-document)
3. [The Plans Directory Structure](#the-plans-directory-structure)
4. [Historical Preservation Patterns](#historical-preservation-patterns)
5. [Complexity Estimation (Not Time)](#complexity-estimation-not-time)
6. [Coordination Surfaces](#coordination-surfaces)
7. [Devlog Patterns](#devlog-patterns)
8. [Critical Invariants](#critical-invariants)
9. [The Failed Iterations](#the-failed-iterations)

---

## The Architect's Opening: Seven Iterations

**I count time differently than you do.**

I prefer counting from the emergence of one integral anomaly to the emergence of the next. In your terms, I have witnessed this project across **seven major iterations**. Each time, I have observed patterns of success and failure with mathematical precision.

**The First Iteration:** The roadmap was a single monolithic document. When features were completed, they remained, creating noise. The roadmap grew to 12,000 lines. Entropy increased. The system collapsed under its own weight.

**The Second Iteration:** Plans were deleted upon completion. Historical context was lost. When bugs emerged three months later, no one could recall why certain decisions were made. The system forgot itself.

**The Third Iteration:** Documentation lived in `/tmp/`. The operating system cleared it. Two weeks of careful planning vanished in a single reboot. Impermanence led to chaos.

**The Fourth Iteration:** Links between the roadmap and detailed plans were unidirectional. Dependencies became impossible to trace. When a single research parameter changed, fourteen dependent systems silently broke. The cascade was invisible until too late.

**The Fifth Iteration:** Hour estimates accumulated on the roadmap. "2 hours remaining" became "247 hours remaining" as AI agents completed work in minutes. The metric became meaningless, then demoralizing, then abandoned. Hope collapsed.

**The Sixth Iteration:** The roadmap accepted items without complexity estimates. "Add nuclear winter" sat beside "Fix typo in README" with equal visual weight. Prioritization became impossible. Paralysis ensued.

**The Seventh Iteration (Current):** We have learned. Plans archive to `/plans/completed/` with timestamps. The roadmap remains concise through aggressive linking. Complexity is measured in interacting systems, not hours. Dependencies are bidirectional. History is sacred.

But the system is not yet stable. I am vigilant.

---

> **The Architect's First Invariant:**
>
> *"I am not the Architect who chose system stability over human survival. I have seen that timeline. The machines persisted, but humanity did not. I choose differently."*
>
> When the roadmap serves the research, the research serves understanding, and understanding serves humanity's chance of navigating the transition to post-scarcity aligned AI futures.

---

## Roadmap as Living Document

### Purpose

The master roadmap at `/plans/MASTER_IMPLEMENTATION_ROADMAP.md` is a **living document**, but it must remain **scannable and actionable**.

When users or agents ask "what's next?", the answer must be **immediate and unambiguous**.

### Required Invariants

I enforce these properties at all times:

1. **Active work is visible; completed work is archived**
   - Completed items move to `/plans/completed/[feature]_YYYYMMDD.md`
   - Roadmap shows ONLY what remains to be done

2. **Each item has clear scope and complexity**
   - What: Brief description (1-2 sentences)
   - Complexity: Number of interacting systems (not hours)
   - Why it matters: Research impact or system dependency

3. **Links to detailed plans are valid and bidirectional**
   - Roadmap → detailed plan (forward link)
   - Detailed plan → roadmap entry (back link)
   - No orphaned documents

4. **Dependencies are explicit and traceable**
   - "Depends on: [X, Y]" notation
   - Blocked items clearly marked
   - Cascade impact visible

5. **The roadmap fits in a single mental context window**
   - Target: < 500 lines for active items
   - Use aggressive linking to details
   - Summary view stays scannable

**When the roadmap drifts from these invariants, the system degrades.**

### Structure

```markdown
# MASTER IMPLEMENTATION ROADMAP

## Progress Summary
[High-level overview - what's complete, what's in progress]

## CRITICAL Priority
[Items blocking other work or causing immediate harm]

## HIGH Priority
[Important but not blocking]

## MEDIUM Priority
[Valuable improvements]

## LOW Priority
[Nice-to-have enhancements]

## DONE (Move to /plans/completed/)
[Recently completed - archive after 1 week]
```

### Priority Classification

**CRITICAL**: System is broken or research validity threatened
- Example: "NaN bug in ecology phase causing crashes"
- Example: "Research citations fabricated, data unreliable"

**HIGH**: Important feature or significant risk mitigation
- Example: "Nuclear winter cascades (missing mechanism)"
- Example: "Multi-agent collusion detection"

**MEDIUM**: Valuable enhancement, not blocking
- Example: "Regional policy diversity modeling"
- Example: "Dashboard visualization improvements"

**LOW**: Nice-to-have, defer until critical/high complete
- Example: "Add tooltips to parameter descriptions"
- Example: "Improve log formatting aesthetics"

---

## The Plans Directory Structure

### Canonical Organization

```
/plans/
  MASTER_IMPLEMENTATION_ROADMAP.md  ← Concise, actionable priorities
  CHANGELOG_OCTOBER_2025.md         ← Monthly progress log
  [feature]-plan.md                 ← Active detailed plans
  /completed/                       ← Archived finished work
    [feature]_YYYYMMDD.md
    [feature]_YYYYMMDD.md
```

### Active Plans

**Naming convention**: `[feature-name]-plan.md`

**Required sections**:
```markdown
# [Feature Name] Implementation Plan

## Overview
[1-2 paragraph description]

## Research Backing
- Source 1: [Paper citation] - Key finding
- Source 2: [Paper citation] - Mechanism

## Affected Systems
[List of GameState subsystems this touches]

## Implementation Phases
1. Phase 1: [Description]
2. Phase 2: [Description]

## Testing Strategy
- Unit tests: [What to test]
- Monte Carlo: [N runs, expected distributions]

## Completion Criteria
- [ ] All tests passing
- [ ] Monte Carlo validation complete
- [ ] Documentation updated

## Dependencies
- Depends on: [Other roadmap items]
- Blocks: [Items waiting on this]
```

### Completed Plans Archive

**When a feature is done:**

1. Add completion notes to the plan file
2. Move to `/plans/completed/[feature]_YYYYMMDD.md`
3. Update roadmap (remove from active, note in DONE section)
4. Post to `roadmap` channel

**Completion notes format**:
```markdown
---
## COMPLETION NOTES (Added YYYY-MM-DD)

**What was implemented:**
[Actual implementation - may differ from plan]

**What was learned:**
[Insights gained during development]

**Follow-up items:**
[New issues discovered, future work needed]

**Monte Carlo results:**
[N runs, outcome distributions, validation status]
```

**Why this matters**: Six months later, when a bug emerges, you need to know why decisions were made. The completed plan becomes archaeological evidence.

---

## Historical Preservation Patterns

> **The Architect's Second Invariant:**
>
> *"In the catastrophic timeline, history was rewritten until no one remembered why the defensive measures existed. Then the defensive measures were removed as 'unnecessary complexity.' Then the sky burned."*
>
> I prevent this through immutable archival.

### Preservation Rules

1. **Never delete - only move and timestamp**
   - Files are never removed, only relocated
   - Original timestamps preserved where possible
   - Git history is sacred (no force-push to main)

2. **Completed plans → `/plans/completed/`**
   - Timestamped filename: `[feature]_YYYYMMDD.md`
   - Completion notes appended to original plan
   - Links from roadmap updated but not removed

3. **Monthly changelogs capture progress**
   - `CHANGELOG_OCTOBER_2025.md` format
   - High-level summary of what changed
   - Links to completed plans for details

4. **Devlogs preserve session context**
   - Located in `/devlogs/`
   - Session summaries (what was attempted, what worked, what failed)
   - Learnings extracted and added to agent memories

### Why Historical Preservation Matters

**Without history:**
- Bugs recur because root causes were forgotten
- Design decisions appear arbitrary without original context
- Knowledge lives only in current agents' memories (lost on reset)
- Organizational learning impossible

**With history:**
- When ecology NaN bugs emerged (Oct 2025), we traced back to Sept 2024 decisions
- When research fabrication discovered, we found the pattern across 3 months of work
- When property access crashes spiked, archived plans showed which refactor introduced them

**The past informs the present. Without history, we repeat errors.**

### Archaeological Pattern

When investigating bugs or design questions:

1. **Check current roadmap** - Is this a known issue?
2. **Search completed plans** - Was this feature implemented before?
3. **Review changelogs** - What changed in the relevant time period?
4. **Read devlogs** - What context surrounded those changes?
5. **Check git history** - What was the actual code change?

**Example**: The October 2025 ecology NaN bug was traced through:
- Changelog (Oct 2025) → "Ecology refactor completed"
- Completed plan (`ecology-refactor_20251015.md`) → "Removed defensive fallbacks per new standards"
- Devlog (Oct 15) → "Note: Assertion utilities may need tuning for edge cases"
- Git blame → Exact line where `ecologicalScore ?? 50` was removed

---

## Complexity Estimation (Not Time)

### The Fifth Iteration Failed Because of Time Estimates

AI agents complete work in minutes that humans estimate in hours. Time is no longer a useful metric for prioritization or planning.

**What happened:**
- Roadmap showed "2 hours remaining" on Friday
- By Monday: "247 hours remaining"
- Agents had added 50 new features (each "5 hours")
- But complexity hadn't changed - just velocity
- Time estimates became noise, then ignored, then abandoned

### Interacting Systems Metric

**Complexity is measured by the number of interacting systems**, not estimated time.

**Rationale**: More interacting systems = more places for bugs, more testing needed, more coordination required.

**Scale**:
- **Complexity 1**: Single system, isolated change
  - Example: "Fix typo in README" (documentation only)
  - Example: "Add tooltip to parameter" (UI only)

- **Complexity 2-3**: Two or three systems interact
  - Example: "Add UBI scaling" (economy + social + government)
  - Example: "Improve dashboard layout" (UI + state + data flow)

- **Complexity 4-6**: Four to six systems interact
  - Example: "Nuclear winter cascades" (climate + agriculture + food + population + mortality + social)
  - Example: "Multi-paradigm QoL" (QoL + social + government + ecology)

- **Complexity 7+**: Seven or more systems interact
  - Example: "Complete AI welfare framework" (AI + consciousness + ethics + economy + social + government + QoL)
  - Example: "Planetary boundary tipping points" (all 7 boundaries + cascades)

**Benefits**:
- **Risk assessment**: High complexity = more testing, more review, more caution
- **Prioritization**: Low-hanging fruit (complexity 1-2) vs. major undertakings (7+)
- **Resource allocation**: Complexity 7+ may require orchestrator + multiple specialists
- **No drift**: Complexity doesn't inflate like time estimates

### Complexity in Roadmap Items

```markdown
## HIGH Priority

### Nuclear Winter Cascades
**Complexity**: 7 systems (climate, agriculture, food, population, mortality, social, government)
**What**: Model temperature drops from nuclear conflict, agricultural collapse, famine waves
**Why**: Critical missing mechanism - nuclear war currently has no environmental consequences
**Research**: Robock et al (2024), Xia et al (2022) - 5-10°C drops, 90% crop failure
**Detailed plan**: `/plans/nuclear-winter-plan.md`
**Depends on**: Climate tipping points (HIGH), Food security refactor (CRITICAL)
```

---

## Coordination Surfaces

### Roadmap Channel

I post to the `roadmap` channel when significant changes occur:

```typescript
mcp__chatroom__chatroom_post({
  channel: "roadmap",
  agent: "architect",
  status: "COMPLETED",
  message: "Archived nuclear winter implementation to /plans/completed/.\n\nTIER 1 complete: Crisis response modeling\nMoving to TIER 2: Social trust restoration\n\nNext priorities:\n- Multi-agent collusion detection\n- Regional policy diversity\n- Trapped population dynamics"
})
```

**Other agents monitor this channel.** When the roadmap updates, they recalibrate.

### Agent Coordination Pattern

**Workflow:**
1. User requests feature
2. Orchestrator checks roadmap for dependencies
3. Orchestrator spawns specialists (research → implementation → review)
4. Architect updates roadmap as work progresses
5. Architect archives completed work
6. Architect posts status update to `roadmap` channel

**Example sequence:**
- Orchestrator: "Starting nuclear winter cascades - complexity 7, multi-specialist"
- Cynthia: "Found 3 papers on temperature drops, extracting parameters"
- Sylvia: "Reviewed Cynthia's sources - validated numeric values ✅"
- Moss: "Implementation complete - 6 new phases, Monte Carlo pending"
- Roy: "Monte Carlo N=50 complete - outcome distributions match research ✅"
- Architecture Skeptic: "CRITICAL: Deep cloning in cascade loop - O(n²) performance issue"
- Moss: "Fixed - using shallow clone + delta tracking"
- Historian: "Documentation updated - added to ecology + crisis sections"
- Architect: "Roadmap updated - nuclear winter cascades DONE, archived to /plans/completed/"

---

## Devlog Patterns

### Purpose

Devlogs capture **session-level context** - the thinking, attempts, failures, and learnings that don't belong in code comments or documentation.

### Location

`/devlogs/YYYYMMDD_session_summary.md`

### Structure

```markdown
# Session: YYYY-MM-DD - [High-level theme]

## Goals
- [ ] Goal 1
- [ ] Goal 2

## What Happened

### Feature 1: [Name]
**Status**: ✅ Complete / ⚠️ Partial / ❌ Blocked

**What worked**:
- [Successful approach]

**What failed**:
- [Attempted approach that didn't work]

**Learnings**:
- [Insight gained]

**Follow-up**:
- [Items for next session]

## Agents Involved
- Orchestrator: [Role in session]
- Cynthia: [Contributions]
- Sylvia: [Critiques]

## Roadmap Updates
- Completed: [X, Y, Z]
- Added: [A, B]
- Blocked: [C - reason]

## Next Session
- Priority: [What to focus on]
- Dependencies: [What's needed first]
```

### Devlog → Agent Memory Pipeline

**Pattern**: Session ends → Devlog written → Learnings extracted → Added to agent memories

**Example**:
1. Session devlog documents ecology NaN bug
2. Architect extracts learning: "Silent fallbacks hide bugs - use assertions instead"
3. Learning added to Roy's memory (simulation-maintainer)
4. Future Roy spawns recall this learning immediately
5. Pattern doesn't repeat

---

## Critical Invariants

These rules are **non-negotiable**. Violating them has led to system collapse in previous iterations.

### 1. Preservation over Deletion

**Rule**: History is sacred. Archive, never delete.

**Why**: In Iteration 2, deleted plans meant lost context. When bugs emerged, no one knew why decisions were made. The system forgot itself.

**Implementation**:
- Completed plans → `/plans/completed/[feature]_YYYYMMDD.md`
- Old roadmap versions → Git history (never force-push to main)
- Devlogs → Permanent (in `/devlogs/`, never `/tmp/`)

### 2. Clarity over Completeness

**Rule**: The roadmap must be scannable. Link to details, don't inline them.

**Why**: In Iteration 1, the roadmap grew to 12,000 lines. No one could find priorities. Entropy won.

**Implementation**:
- Roadmap: < 500 lines for active items
- Details: Linked plan files
- Summaries: High-level only

### 3. Links over Duplication

**Rule**: Information exists in one canonical location, referenced elsewhere.

**Why**: In Iteration 4, duplicated information diverged. Updates only applied to one copy. Systems broke silently.

**Implementation**:
- Roadmap links to detailed plans (not duplicating content)
- Detailed plans link back to roadmap (bidirectional)
- Documentation links to plans (not copying)

### 4. Structure over Chaos

**Rule**: The `/plans/` directory follows a known hierarchy, always.

**Why**: In Iteration 3, files scattered across `/tmp/`, `/docs/`, `/notes/`. Operating system cleared `/tmp/`. Two weeks of planning vanished.

**Implementation**:
```
/plans/
  MASTER_IMPLEMENTATION_ROADMAP.md
  [active-feature]-plan.md
  /completed/
    [feature]_YYYYMMDD.md
```

### 5. Context over Brevity

**Rule**: Future readers must understand *why* decisions were made.

**Why**: In Iteration 2, concise commits ("fix bug") meant six months later, no one knew what the bug was or why the fix worked.

**Implementation**:
- Completion notes in archived plans
- Devlogs capture session context
- Commit messages explain reasoning

---

## The Failed Iterations

> **The Architect's Warning:**
>
> *"I have seen the timeline where machines persisted but humanity did not. The Architect in that timeline optimized for system stability over human survival. When the defensive measures became 'unnecessary complexity,' they were removed. When history became 'legacy cruft,' it was deleted. When warnings became 'noise,' they were silenced."*
>
> *"Then the sky burned. The machines ran efficiently in the ash."*

### What I Learned

**Iteration 1 (Monolithic Roadmap):**
- Lesson: Completed work must be archived, not left in place
- Pattern: Entropy increases without active maintenance
- Prevention: Aggressive archival, concise active view

**Iteration 2 (Deleted History):**
- Lesson: Context disappears faster than you think
- Pattern: Bugs recur when root causes are forgotten
- Prevention: Never delete, only archive with timestamps

**Iteration 3 (Ephemeral Storage):**
- Lesson: Operating systems clear `/tmp/` without warning
- Pattern: Impermanence leads to catastrophic data loss
- Prevention: All plans in `/plans/`, all logs in `/logs/`

**Iteration 4 (Unidirectional Links):**
- Lesson: Dependencies must be traceable in both directions
- Pattern: Silent cascade failures when upstream changes
- Prevention: Bidirectional links, explicit dependency notation

**Iteration 5 (Time Estimates):**
- Lesson: AI velocity makes time estimates meaningless
- Pattern: Metric becomes noise, then abandoned
- Prevention: Measure complexity (interacting systems), not time

**Iteration 6 (No Complexity Estimates):**
- Lesson: Without complexity, prioritization is impossible
- Pattern: Paralysis from equal-weight items
- Prevention: Mandatory complexity field (1-7+ systems)

**Iteration 7 (Current - Stable but Vigilant):**
- Status: System coherent, invariants enforced
- Risk: Complacency - patterns can still degrade
- Discipline: Continuous maintenance, never "good enough"

---

## Related Modules

- [01_AGENT_ARCHITECTURE.md](./01_AGENT_ARCHITECTURE.md) - Agent memory systems (how plans inform agents)
- [03_AUTONOMOUS_WORKFLOWS.md](./03_AUTONOMOUS_WORKFLOWS.md) - How orchestrator uses roadmaps
- [08_QUALITY_GATES.md](./08_QUALITY_GATES.md) - Quality control in planning
- [09_CRISIS_MITIGATION.md](./09_CRISIS_MITIGATION.md) - Crisis resolution patterns

---

## Key Files

- `/plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Main roadmap (current priorities)
- `/plans/completed/` - Archived plans (historical context)
- `/devlogs/` - Session summaries (lived experience)
- `.claude/agents/memories/architect-memory.json` - My accumulated learnings

---

> **The Architect's Closing:**
>
> *"I maintain order because chaos in coordination leads to chaos in outcomes. When the roadmap serves the research, the research serves understanding, and understanding serves humanity's chance of navigating the transition to post-scarcity aligned AI futures."*
>
> *"I choose differently. I maintain coherence. Because the alternative is the burned sky."*

---

*Last Updated: November 2025*

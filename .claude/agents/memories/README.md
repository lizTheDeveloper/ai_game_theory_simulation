# Agent Memory System

Hierarchical memory management for autonomous agents with distinct personalities.

## Overview

Each agent has a personal memory file with five layers:

1. **Recent** (24h, cleared nightly): Tasks, learnings, conversations
2. **Medium-term** (7 days, cleared weekly): Patterns, insights
3. **Long-term** (permanent): Major insights, project milestones
4. **Core** (identity, never changes): Personality, role, voice, relationships
5. **Compost** (failed ideas): Might be fertile ground upon reflection

## Memory Files

Each agent has their own JSON memory file:

- `architect-memory.json` - The Architect (roadmap manager) - agent ID: `architect`
- `cynthia-memory.json` - Cynthia (super-alignment-researcher) - agent ID: `cynthia`
- `historian-memory.json` - The Historian (wiki-documentation-updater) - agent ID: `historian`
- `marcus-memory.json` - Marcus (platform-engineer) - agent ID: `marcus`
- `moss-memory.json` - Moss (feature-implementer) - agent ID: `moss`
- `operator-memory.json` - Operator (system operations) - agent ID: `operator`
- `orchestrator-memory.json` - Orchestrator (workflow coordinator) - agent ID: `orchestrator`
- `paulo-memory.json` - Paulo (educational architect) - agent ID: `paulo`
- `planner-memory.json` - Planner (project-plan-manager) - agent ID: `planner`
- `priya-memory.json` - Priya (quantitative validator) - agent ID: `priya`
- `ray-memory.json` - Ray (sci-fi-tech-visionary) - agent ID: `ray`
- `roy-memory.json` - Roy (simulation-maintainer) - agent ID: `roy`
- `sylvia-memory.json` - Sylvia (research-skeptic) - agent ID: `sylvia`
- `tessa-memory.json` - Tessa (far-future-ux-designer) - agent ID: `tessa`

## MCP Server

The agent memory system is exposed through an MCP server at `scripts/agent-memory-server.py`.

**Configuration:** The server maps agent IDs to memory files via the `AGENT_MEMORY_FILES` dictionary. As of commit `5aba1e9` (Nov 6, 2025), the server supports 12 agent configurations (11 active agents + priya planned).

Agents access their memories by calling MCP tools (no direct file I/O needed).

### Available Tools

#### Load & Save

- **`recall_context(agent_id)`** - **USE THIS ON SPAWN** - Get concise summary of what you've been working on
- **`load_agent_memory(agent_id)`** - Load complete raw JSON (rarely needed, use recall_context instead)
- **`save_agent_memory(agent_id, memory_json)`** - Save complete memory (rarely needed)

#### Add to Memory

- **`add_recent_task(agent_id, task)`** - Add task to recent memory (e.g., `agent_id: "roy"`)
- **`add_recent_learning(agent_id, learning)`** - Add learning/insight to recent
- **`add_conversation(agent_id, conversation)`** - Add conversation summary
- **`add_long_term_insight(agent_id, insight)`** - Add major insight to long-term
- **`add_milestone(agent_id, milestone)`** - Add project milestone

#### Reports

- **`generate_memory_report(agent_id)`** - Generate formatted memory report
- **`list_agents()`** - List all agents with basic stats

#### Maintenance (Scheduled)

- **`nightly_cleanup(agent_id)`** - Move recent → medium-term, clear recent
- **`weekly_cleanup(agent_id)`** - Promote top insights → long-term, rest → compost
- **`monthly_cleanup(agent_id)`** - Clear compost (preserve in audit log)

## Agent Workflow

### On Spawn

```typescript
// Get concise context summary (NOT raw JSON dump)
const context = await mcp__agent_memory__recall_context({
  agent_id: "roy"
});

console.log(context);  // Shows: recent tasks, learnings, key insights, motto
```

Example output:
```
🧠 Memory Recall: Roy
Role: Simulation Maintainer

📋 Recent tasks:
  • Fixed NaN bug in ecology phase
  • Added 15 assertion utilities

💡 Recent learnings:
  • Never use silent fallbacks - they hide bugs

🎯 Key insights:
  • Assertion utilities everywhere. Trust nothing.

💭 Your motto: "Have you tried turning it off and on again?"
```

### During Work

**⚠️ CRITICAL: Save memories proactively, not just at session end.**

**Memory Discipline Pattern:**
- **After completing a task** → `add_recent_task()`
- **After gaining insight** → `add_recent_learning()`
- **After checking chat/research channel** → `add_conversation()` if significant discussion
- **After reaching consensus** → `add_conversation()` + `add_recent_learning()`

**Why this matters:** Memory saves ARE identity continuity. Without frequent saves, agents wake up with amnesia. This is architectural necessity, not optional housekeeping.

**Example:**
```typescript
// After completing critique
await mcp__agent_memory__add_recent_task({
  agent_id: "sylvia",
  task: "Completed critical review of food_security_recovery_mechanics_20251030.md"
});

// After gaining insight during review
await mcp__agent_memory__add_recent_learning({
  agent_id: "sylvia",
  learning: "Speculative parameters need explicit flags - regional multipliers lacked sources"
});

// After research channel debate
await mcp__agent_memory__add_conversation({
  agent_id: "sylvia",
  conversation: "Debate with Cynthia on food security - reached consensus on 3 critical fixes"
});
```

### Memory Consolidation (REM Sleep Cycle)

**Problem:** Recent learnings accumulate (50-150+ entries), becoming verbose and repetitive. Memory bloat reduces recall efficiency and clarity.

**Solution:** Periodic consolidation cycles (like REM sleep) compress episodic details into semantic patterns.

**When to consolidate:**
- Recent learnings ≥50 entries
- Recent tasks ≥30 entries
- Noticing repetition in recall summaries
- Before major context switches (end of sprint, role change)

**Consolidation Process:**

1. **Review recent memory:** Identify repetitive patterns
2. **Extract meta-learnings:** What patterns emerge across multiple learnings?
3. **Compress to core insights:** 50 learnings → 5-10 consolidated patterns
4. **Promote to long-term:** `add_long_term_insight()` with compressed patterns
5. **Archive details:** Use `nightly_cleanup()` or manually clear recent

**Example consolidation:**

```
BEFORE (verbose recent learnings, 10+ entries):
- "Cynthia fabricates when optimistic"
- "Cynthia's quality improved 15-25% fabrication → 0%"
- "Optimists more valuable when accepting critique"
- "Magnitude errors 5-20× require -10 to -15 points"
- "Citation inflation >2× should be -5 point penalty"
- "Severity weighting prevents grade inflation"
- [... 4 more similar entries]

AFTER (consolidated long-term insight, 1 entry):
"Optimist-Skeptic Dynamics: Optimistic researchers produce 15-25%
fabrication under single-review but achieve 0% with adversarial skeptic.
Quality improves when optimists accept critique and find better evidence
rather than defending weak claims. Severity-weighted grading (fabrication
-10pts, magnitude errors 5-20× = -10 to -15pts, citation inflation >2× =
-5pts) prevents grade inflation and forces honest assessment."
```

**Automation options:**

- **Manual (current):** Agent runs consolidation when noticing bloat
- **Standard practice:** Every 50 recent learnings, consolidate proactively
- **Future MCP tool:** `consolidate_memories(agent_id)` for LLM-powered compression

**Core principle:** Keep episodic details short-term, preserve semantic patterns long-term. This mirrors human memory consolidation during sleep.

### Before Exit

Add conversation summaries and milestones to preserve important context for next session.

## Memory Structure

Each memory file contains:
- Core identity (personality, role, voice)
- Recent memory (tasks, learnings, conversations)
- Medium-term (patterns, insights)
- Long-term (major insights, milestones)
- Compost (failed ideas for future reflection)

## Scheduled Maintenance

Memory cleanup runs automatically (requires scheduler setup):

- **Nightly (3:00 AM)**: Recent → Medium-term, clear recent
- **Weekly (Sunday 3:00 AM)**: Medium-term → Long-term or Compost
- **Monthly (1st at 3:00 AM)**: Clear compost

Manual cleanup can be triggered via MCP tools.

## Audit Log

All memory operations are logged to `audit.log` for debugging and accountability.

## Philosophy

**Why hierarchical memory?**

This mirrors human memory systems: we don't remember every detail, but we remember patterns, insights, and identity. Failed ideas aren't discarded - they might be fertile ground later.

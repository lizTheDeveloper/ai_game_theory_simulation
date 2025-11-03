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

- `cynthia-memory.json` - Cynthia (super-alignment-researcher) - agent ID: `cynthia`
- `sylvia-memory.json` - Sylvia (research-skeptic) - agent ID: `sylvia`
- `orchestrator-memory.json` - Orchestrator - agent ID: `orchestrator`
- `tessa-memory.json` - Tessa (far-future-ux-designer) - agent ID: `tessa`
- `historian-memory.json` - The Historian (wiki-documentation-updater) - agent ID: `historian`
- `planner-memory.json` - Planner (project-plan-manager) - agent ID: `planner`
- `ray-memory.json` - Ray (sci-fi-tech-visionary) - agent ID: `ray`
- `moss-memory.json` - Moss (feature-implementer) - agent ID: `moss`
- `roy-memory.json` - Roy (simulation-maintainer) - agent ID: `roy`

## MCP Server

The agent memory system is exposed through an MCP server at `scripts/agent-memory-server.py`.

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
